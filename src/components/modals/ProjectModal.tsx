import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Modal } from '../Modal';

const MN = [
  "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
  "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
];

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose }) => {
  const { currentProject, currentId, updateProjectSettings } = useAppStore();
  
  const [name, setName] = useState('');
  const [sm, setSm] = useState(0);
  const [sy, setSy] = useState(2025);
  const [nm, setNm] = useState(12);

  useEffect(() => {
    if (isOpen && currentProject) {
      setName(currentProject.proj.name);
      setSm(currentProject.proj.sm);
      setSy(currentProject.proj.sy);
      setNm(currentProject.proj.nm);
    }
  }, [isOpen, currentProject]);

  const handleSave = () => {
    updateProjectSettings(currentId, { name, sm, sy, nm });
    onClose();
  };

  return (
    <Modal title="Налаштування проєкту" isOpen={isOpen} onClose={onClose}>
      <div className="fg">
        <label>Назва</label>
        <input value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="row3">
        <div className="fg">
          <label>Початок місяць</label>
          <select value={sm} onChange={e => setSm(+e.target.value)}>
            {MN.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
        <div className="fg">
          <label>Рік</label>
          <input type="number" min="2020" max="2035" value={sy} onChange={e => setSy(+e.target.value)} />
        </div>
        <div className="fg">
          <label>Тривалість (міс.)</label>
          <input type="number" min="3" max="36" value={nm} onChange={e => setNm(+e.target.value)} />
        </div>
      </div>
      <div className="m-btns">
        <button className="btn" onClick={onClose}>Скасувати</button>
        <button className="btn btn-acc" onClick={handleSave}>Зберегти</button>
      </div>
    </Modal>
  );
};
