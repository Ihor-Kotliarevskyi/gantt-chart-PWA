import type { ProjectData, Task, ProjectSettings, Category } from '../types';
import { getTaskDuration } from './ganttUtils';

export function exportJSON(data: ProjectData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.proj.name}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCSV(tasks: Task[], cats: Category[], proj: ProjectSettings) {
  const MN = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];
  
  const rows = [
    ["#", "Назва", "Категорія", "Підрядник", "Початок (міс)", "Тиж", "Кінець (міс)", "Тиж", "Тривалість (тиж)", "Виконання (%)", "Бюджет (грн)", "Витрачено (грн)", "Залишок (грн)", "Залежності"]
  ];

  tasks.forEach(t => {
    const budget = t.budget || 0;
    const spent = t.spent || 0;
    rows.push([
      t.n.toString(),
      t.name,
      cats[t.cat]?.name || '',
      t.contr || '',
      `${MN[t.ms % 12]} ${proj.sy + Math.floor(t.ms / 12)}`,
      (t.ws + 1).toString(),
      `${MN[t.me % 12]} ${proj.sy + Math.floor(t.me / 12)}`,
      (t.we + 1).toString(),
      getTaskDuration(t).toString(),
      t.prog.toString(),
      budget.toString(),
      spent.toString(),
      (budget - spent).toString(),
      (t.deps || []).join(", ")
    ]);
  });

  const csvContent = "\uFEFF" + rows.map(e => e.map(v => `"${v.replace(/"/g, '""')}"`).join(";")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${proj.name}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importJSONFile(file: File): Promise<ProjectData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.tasks && data.proj) resolve(data);
        else reject("Невірний формат файлу");
      } catch (err) {
        reject("Помилка парсингу JSON");
      }
    };
    reader.onerror = () => reject("Помилка читання файлу");
    reader.readAsText(file);
  });
}
