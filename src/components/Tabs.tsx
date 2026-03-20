import React from 'react';

interface TabsProps {
  activeTab: 'gantt' | 'finance' | 'charts';
  onTabChange: (tab: 'gantt' | 'finance' | 'charts') => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="tabs">
      <div 
        className={`tab ${activeTab === 'gantt' ? 'active' : ''}`} 
        onClick={() => onTabChange('gantt')}
      >
        Діаграма Ганта
      </div>
      <div 
        className={`tab ${activeTab === 'finance' ? 'active' : ''}`} 
        onClick={() => onTabChange('finance')}
      >
        Фінанси та звітність
      </div>
      <div 
        className={`tab ${activeTab === 'charts' ? 'active' : ''}`} 
        onClick={() => onTabChange('charts')}
      >
        Графіки
      </div>
    </div>
  );
};
