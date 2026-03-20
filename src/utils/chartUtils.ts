import type { Task, Category, ProjectSettings } from '../types';
import { getMonthList, getTaskDuration } from './ganttUtils';

export function getChartData(
  tasks: Task[], 
  cats: Category[], 
  proj: ProjectSettings,
  xKey: string, 
  yKey: string, 
  catF: string | number, 
  statF: string,
  hiddenCats: Set<number>
) {
  let src = tasks.filter((t) => {
    if (hiddenCats.has(t.cat)) return false;
    if (catF !== "" && t.cat !== +catF) return false;
    if (statF === "done" && t.prog < 100) return false;
    if (statF === "active" && (t.prog === 0 || t.prog === 100)) return false;
    if (statF === "pending" && t.prog !== 0) return false;
    return true;
  });

  const groups: Record<string, number> = {};
  const cnt: Record<string, number> = {};

  const getKey = (t: Task) => {
    if (xKey === "cat") return cats[t.cat]?.name || "?";
    if (xKey === "contr") return t.contr || "(без підрядника)";
    if (xKey === "status")
      return t.prog === 100 ? "Завершено" : t.prog > 0 ? "В роботі" : "Не розпочато";
    if (xKey === "task") return t.n + ". " + t.name.substring(0, 22);
    if (xKey === "month") {
      const ml = getMonthList(proj);
      return ml[t.ms] ? `${ml[t.ms].name} ${ml[t.ms].y}` : "?";
    }
    return "?";
  };

  const getVal = (t: Task) => {
    if (yKey === "count") return 1;
    if (yKey === "budget") return +t.budget || 0;
    if (yKey === "spent") return +t.spent || 0;
    if (yKey === "rest") return (+t.budget || 0) - (+t.spent || 0);
    if (yKey === "prog") return t.prog;
    if (yKey === "dur") return getTaskDuration(t);
    return 0;
  };

  src.forEach((t) => {
    const k = getKey(t);
    const v = getVal(t);
    if (k in groups) {
      groups[k] += v;
      cnt[k] = (cnt[k] || 0) + 1;
    } else {
      groups[k] = v;
      cnt[k] = 1;
    }
  });

  if (yKey === "prog") {
    Object.keys(groups).forEach((k) => {
      groups[k] = Math.round(groups[k] / (cnt[k] || 1));
    });
  }

  let labels = Object.keys(groups);
  let values = Object.values(groups);

  if (xKey === "task") {
    labels = labels.slice(0, 15);
    values = values.slice(0, 15);
  }

  return { labels, values };
}

export function getGroupColors(xKey: string, labels: string[], cats: Category[]) {
  if (xKey === "cat") {
    return labels.map((l) => {
      const c = cats.find((c2) => c2.name === l);
      return c ? c.color : "#888";
    });
  }
  if (xKey === "status") {
    return labels.map((l) =>
      l === "Завершено" ? "#16803c" : l === "В роботі" ? "#c07800" : "#a09d97"
    );
  }
  const pal = [
    "#2563eb", "#16803c", "#c07800", "#b71c1c", "#006494",
    "#8a6200", "#5a5a5a", "#7c3aed", "#0891b2", "#be185d",
  ];
  return labels.map((_, i) => pal[i % pal.length]);
}
