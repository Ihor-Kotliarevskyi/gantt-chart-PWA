import React, { useState, useEffect } from "react";
import { useAppStore } from "../../store/useAppStore";
import { Modal } from "../Modal";
import { getMonthList, fmtM } from "../../utils/ganttUtils";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number | null; // null means new task
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskId,
}) => {
  const { currentProject, addTask, updateTask, currentId } = useAppStore();

  // Form State
  const [name, setName] = useState("");
  const [cat, setCat] = useState(0);
  const [contr, setContr] = useState("");
  const [ms, setMs] = useState(0);
  const [ws, setWs] = useState(0);
  const [me, setMe] = useState(1);
  const [we, setWe] = useState(3);
  const [prog, setProg] = useState(0);
  const [budget, setBudget] = useState(0);
  const [spent, setSpent] = useState(0);
  const [deps, setDeps] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen && currentProject) {
      if (taskId !== null) {
        const task = currentProject.tasks.find((t) => t.n === taskId);
        if (task) {
          setName(task.name);
          setCat(task.cat);
          setContr(task.contr || "");
          setMs(task.ms);
          setWs(task.ws);
          setMe(task.me);
          setWe(task.we);
          setProg(task.prog);
          setBudget(task.budget);
          setSpent(task.spent);
          setDeps(task.deps || []);
        }
      } else {
        setName("");
        setCat(0);
        setContr("");
        setMs(0);
        setWs(0);
        setMe(1);
        setWe(3);
        setProg(0);
        setBudget(0);
        setSpent(0);
        setDeps([]);
      }
    }
  }, [isOpen, taskId, currentProject]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const input = document.getElementById("f-name");
        if (input) input.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!currentProject) return null;
  const { proj, cats, tasks } = currentProject;
  const ml = getMonthList(proj);

  const handleSave = () => {
    if (!name.trim()) return alert("Введіть назву");
    if (ms * 4 + ws > me * 4 + we)
      return alert("Початок не може бути після кінця");

    const taskData = {
      name,
      cat,
      contr,
      ms,
      ws,
      me,
      we,
      prog,
      budget,
      spent,
      deps,
    };

    if (taskId !== null) {
      updateTask(currentId, taskId, taskData);
    } else {
      addTask(currentId, taskData);
    }
    onClose();
  };


  const handleDepToggle = (n: number) => {
    setDeps((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n],
    );
  };

  const rest = budget - spent;
  const restText = rest >= 0 ? `${fmtM(rest)} грн` : `Перевищення ${fmtM(-rest)} грн`;
  
  const duration = (me * 4 + we) - (ms * 4 + ws) + 1;
  const rate = duration > 0 ? Math.round(rest / duration) : 0;
  const calcText = budget > 0 
    ? `Залишок: ${fmtM(rest)} грн · Тижнів: ${duration} · Ставка: ${duration > 0 ? fmtM(rate) + " грн/тиж" : "—"}`
    : "Заповніть вартість для розрахунку";

  return (
    <Modal
      title={taskId === null ? "Нова робота" : "Редагувати роботу"}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="fg">
        <label>Назва</label>
        <input
          id="f-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Введіть назву..."
        />
      </div>
      <div className="fg">
        <label>Категорія</label>
        <div className="cat-chips">
          {cats.map((c, i) => (
            <div
              key={i}
              className={`chip ${cat === i ? "sel" : ""}`}
              style={{ background: c.color }}
              onClick={() => setCat(i)}
            >
              {c.name}
            </div>
          ))}
        </div>
      </div>
      <div className="fg">
        <label>Підрядник</label>
        <input
          value={contr}
          onChange={(e) => setContr(e.target.value)}
          placeholder="необов'язково"
        />
      </div>

      <div className="row2">
        <div className="fg">
          <label>Початок місяць</label>
          <select value={ms} onChange={(e) => setMs(+e.target.value)}>
            {ml.map((m) => (
              <option key={m.i} value={m.i}>
                {m.i + 1}. {m.name} {m.y}
              </option>
            ))}
          </select>
        </div>
        <div className="fg">
          <label>Тиждень</label>
          <select value={ws} onChange={(e) => setWs(+e.target.value)}>
            <option value="0">1</option>
            <option value="1">2</option>
            <option value="2">3</option>
            <option value="3">4</option>
          </select>
        </div>
      </div>

      <div className="row2">
        <div className="fg">
          <label>Кінець місяць</label>
          <select value={me} onChange={(e) => setMe(+e.target.value)}>
            {ml.map((m) => (
              <option key={m.i} value={m.i}>
                {m.i + 1}. {m.name} {m.y}
              </option>
            ))}
          </select>
        </div>
        <div className="fg">
          <label>Тиждень</label>
          <select value={we} onChange={(e) => setWe(+e.target.value)}>
            <option value="0">1</option>
            <option value="1">2</option>
            <option value="2">3</option>
            <option value="3">4</option>
          </select>
        </div>
      </div>

      <div className="fg">
        <label>Виконання (%)</label>
        <div
          className="prog-row"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={prog}
            onChange={(e) => setProg(+e.target.value)}
            style={{ flex: 1 }}
          />
          <span>{prog}%</span>
        </div>
      </div>

      <div className="fg">
        <label>Загальна вартість (грн)</label>
        <input
          type="number"
          min="0"
          step="1000"
          value={budget || ""}
          onChange={(e) => setBudget(+e.target.value)}
        />
      </div>
      <div className="row2">
        <div className="fg">
          <label>Витрачено (грн)</label>
          <input
            type="number"
            min="0"
            step="1000"
            value={spent || ""}
            onChange={(e) => setSpent(+e.target.value)}
          />
        </div>
        <div className="fg">
          <label>Залишок</label>
          <input
            readOnly
            value={restText}
            style={{ background: "var(--surf2)", color: "var(--txt2)" }}
          />
        </div>
      </div>

      <div className="calc-row" style={{ background: "var(--surf2)", padding: '7px 10px', fontSize: '11px', borderRadius: '5px', marginBottom: '10px' }}>
        {calcText}
      </div>

      <div className="fg">
        <label>Залежить від</label>
        <div className="dep-list">
          {tasks
            .filter((t) => t.n !== taskId)
            .map((t) => (
              <label
                key={t.n}
                className="dep-item"
                style={{ display: "flex", gap: "5px", alignItems: "center" }}
              >
                <input
                  type="checkbox"
                  checked={deps.includes(t.n)}
                  onChange={() => handleDepToggle(t.n)}
                />
                {t.n}. {t.name}
              </label>
            ))}
        </div>
      </div>

      <div className="m-btns">
        <button className="btn" onClick={onClose}>
          Скасувати
        </button>
        <button className="btn btn-acc" onClick={handleSave}>
          Зберегти
        </button>
      </div>
    </Modal>
  );
};
