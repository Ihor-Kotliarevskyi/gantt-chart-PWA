import React from 'react';
import { Modal } from '../Modal';
import { useAppStore } from '../../store/useAppStore';
import type { ProjectData } from '../../types';

export const ProjectManagerModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
  const { allProjects, currentId, switchProject, createProject, deleteProject, renameProject } = useAppStore();

  const handleCreate = () => {
    const name = prompt("Назва нового проєкту:", "Новий проєкт");
    if (name) {
      const id = createProject(name);
      switchProject(id);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (Object.keys(allProjects).length <= 1) {
      alert("Має бути хоча б один проєкт");
      return;
    }
    if (confirm(`Видалити проєкт "${name}"? Цю дію неможливо скасувати.`)) {
      deleteProject(id);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Управління проєктами">
      <div className="projmgr-list">
        {Object.entries(allProjects).map(([id, p]) => {
          const project = p as ProjectData;
          return (
            <div key={id} className={`pj-row ${id === currentId ? 'active' : ''}`} onClick={() => switchProject(id)}>
              <input 
                className="pj-name-inp" 
                value={project.proj.name} 
                onChange={(e) => renameProject(id, e.target.value)}
                onClick={(e) => e.stopPropagation()} 
              />
              <span style={{ fontSize: '10px', color: 'var(--txt3)' }}>{project.tasks?.length || 0} робіт</span>
              <span className="pj-del" onClick={(e) => { e.stopPropagation(); handleDelete(id, project.proj.name); }} title="Видалити">🗑</span>
            </div>
          );
        })}
      </div>
      <div className="modal-footer" style={{ marginTop: '20px' }}>
        <button className="btn btn-acc" onClick={handleCreate}>+ Створити проєкт</button>
        <button className="btn" onClick={onClose} style={{ marginLeft: 'auto' }}>Закрити</button>
      </div>
    </Modal>
  );
};
