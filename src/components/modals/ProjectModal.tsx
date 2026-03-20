import React, { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import { Modal } from "../Modal";

const MN = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
];

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProjectFormState {
  name: string;
  sm: number;
  sy: number;
  nm: number;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentProject, currentId, updateProjectSettings } = useAppStore();

  const [formState, setFormState] = useState<ProjectFormState>(() =>
    currentProject
      ? {
          name: currentProject.proj.name,
          sm: currentProject.proj.sm,
          sy: currentProject.proj.sy,
          nm: currentProject.proj.nm,
        }
      : {
          name: "",
          sm: 0,
          sy: 2025,
          nm: 12,
        },
  );

  const handleSave = () => {
    updateProjectSettings(currentId, {
      name: formState.name,
      sm: formState.sm,
      sy: formState.sy,
      nm: formState.nm,
    });
    onClose();
  };

  return (
    <Modal title="Налаштування проєкту" isOpen={isOpen} onClose={onClose}>
      <div className="fg">
        <label>Назва</label>
        <input
          value={formState.name}
          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
        />
      </div>
      <div className="row3">
        <div className="fg">
          <label>Початок місяць</label>
          <select
            value={formState.sm}
            onChange={(e) =>
              setFormState({ ...formState, sm: +e.target.value })
            }
          >
            {MN.map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="fg">
          <label>Рік</label>
          <input
            type="number"
            min="2020"
            max="2035"
            value={formState.sy}
            onChange={(e) =>
              setFormState({ ...formState, sy: +e.target.value })
            }
          />
        </div>
        <div className="fg">
          <label>Тривалість (міс.)</label>
          <input
            type="number"
            min="3"
            max="36"
            value={formState.nm}
            onChange={(e) =>
              setFormState({ ...formState, nm: +e.target.value })
            }
          />
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
