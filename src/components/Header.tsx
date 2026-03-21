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
    setProjectModalOpen, setCategoryModalOpen, setProjectManagerModalOpen, setEditingTask,
    showContr, setShowContr, hidePast, setHidePast
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
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <button className="btn" onClick={() => setProjectManagerModalOpen(true)}>📂 Проєкти</button>
        <button className="btn" onClick={() => setProjectModalOpen(true)}>⚙️</button>
        <button className="btn" onClick={() => setCategoryModalOpen(true)}>🎨</button>
        <div style={{ width: '1px', height: '20px', background: 'var(--bord)', margin: '0 4px' }}></div>
        <button 
          className={`btn btn-tog ${showContr ? 'on' : ''}`} 
          onClick={() => setShowContr(!showContr)}
          title="Показати/приховати підрядників"
        >
          👷
        </button>
        <button 
          className={`btn btn-tog ${hidePast ? 'on' : ''}`} 
          onClick={() => setHidePast(!hidePast)}
          title="Приховати минуле"
        >
          ◀
        </button>
        <button className="btn" onClick={() => window.print()} title="Друк проєкту">🖨️</button>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
        <button className="btn btn-acc" onClick={() => setEditingTask(-1)}>+ Робота</button>
        <button className="btn" onClick={onExportCsv}>Excel</button>
        <button className="btn" onClick={onExportJson} title="Експорт JSON">📤</button>
        <label className="btn" style={{ cursor: 'pointer' }} title="Імпорт JSON">
          📥
          <input type="file" accept=".json" onChange={onImportJson} style={{ display: 'none' }} />
        </label>
      </div>
    </header>
  );
};
