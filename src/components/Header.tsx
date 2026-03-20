import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { exportJSON, exportCSV, importJSONFile } from '../utils/exportUtils';

const MN = [
  "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
  "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
];

export const Header: React.FC = () => {
  const { 
    allProjects, currentId, currentProject, switchProject, createProject,
    setProjectModalOpen, setCategoryModalOpen, setProjectManagerModalOpen, setEditingTask 
  } = useAppStore();

  const getDateRange = () => {
    if (!currentProject) return '';
    const startM = currentProject.proj.sm;
    const startY = currentProject.proj.sy;
    const nm = currentProject.proj.nm;
    const em = (startM + nm - 1) % 12;
    const ey = startY + Math.floor((startM + nm - 1) / 12);
    return `${MN[startM].substring(0, 3)} ${startY} — ${MN[em].substring(0, 3)} ${ey} (${nm} міс.)`;
  };

  const onExportJson = () => {
    if (currentProject) exportJSON(currentProject);
  };

  const onExportCsv = () => {
    if (currentProject) exportCSV(currentProject.tasks, currentProject.cats, currentProject.proj);
  };

  const onImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const data = await importJSONFile(file);
        const id = createProject(data.proj.name);
        useAppStore.getState().setAllProjects({
          ...allProjects,
          [id]: data
        });
        switchProject(id);
        alert(`Проєкт "${data.proj.name}" успішно імпортовано`);
      } catch (err) {
        alert(err);
      }
    }
    e.target.value = '';
  };

  return (
    <header className="app-head">
      <div className="proj-block">
        <select 
          className="proj-sel" 
          value={currentId} 
          onChange={(e) => switchProject(e.target.value)}
        >
          {Object.entries(allProjects).map(([id, p]) => (
            <option key={id} value={id}>{p.proj.name}</option>
          ))}
        </select>
        <span className="proj-dates">{getDateRange()}</span>
      </div>
      <div>
        <button className="btn" onClick={() => setProjectManagerModalOpen(true)}>📂 Управління проєктами</button>
        <button className="btn" onClick={() => setProjectModalOpen(true)}>⚙️ Налаштування</button>
        <button className="btn" onClick={() => setCategoryModalOpen(true)}>🎨 Категорії</button>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
        <button className="btn btn-acc" onClick={() => setEditingTask(-1)}>+ Створити роботу</button>
        <button className="btn" onClick={onExportCsv}>Завантажити Excel</button>
        <label className="btn" style={{ cursor: 'pointer' }}>
          📥
          <input type="file" accept=".json" onChange={onImportJson} style={{ display: 'none' }} />
        </label>
        <button className="btn" onClick={onExportJson} title="Експорт JSON">📤</button>
      </div>
    </header>
  );
};
