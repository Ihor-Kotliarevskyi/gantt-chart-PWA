import type { Task, ProjectSettings } from '../types';

export const MN = [
  "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
  "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
];

export function getTotalWeeks(proj: ProjectSettings) {
  return proj.nm * 4;
}

export function getMonthList(proj: ProjectSettings) {
  const r = [];
  for (let i = 0; i < proj.nm; i++) {
    const m = (proj.sm + i) % 12;
    const y = proj.sy + Math.floor((proj.sm + i) / 12);
    r.push({ name: MN[m], m, y, i }); // i is the relative month index
  }
  return r;
}

export function todayWk(proj: ProjectSettings) {
  const now = new Date();
  const mDiff = (now.getFullYear() - proj.sy) * 12 + (now.getMonth() - proj.sm);
  if (mDiff < 0 || mDiff >= proj.nm) return -1;
  const wInM = Math.min(3, Math.floor((now.getDate() - 1) / 7));
  return mDiff * 4 + wInM;
}

export function visStart(proj: ProjectSettings, hidePast: boolean) {
  if (!hidePast) return 0;
  const tw = todayWk(proj);
  if (tw < 0) return 0;
  return Math.floor(tw / 4) * 4;
}

export function getTaskDuration(t: Task) {
  return t.me * 4 + t.we - t.ms * 4 - t.ws + 1;
}

export function remWk(t: Task, proj: ProjectSettings) {
  const tw = todayWk(proj);
  return Math.max(0, t.me * 4 + t.we - tw);
}

export function fmtM(v: number | null | undefined) {
  if (v === null || v === undefined || v === 0) return "—";
  return new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 0,
  }).format(v);
}

export function checkDeps(t: Task, allTasks: Task[]) {
  const w: string[] = [];
  (t.deps || []).forEach(dn => {
    const d = allTasks.find(x => x.n === dn);
    if (!d) return;
    const de = d.me * 4 + d.we;
    const ts2 = t.ms * 4 + t.ws;
    if (de > ts2) w.push(`"${d.name}" закінчується після початку (${de - ts2} тиж.)`);
    else if (d.prog < 100) w.push(`"${d.name}" не завершена (${d.prog}%)`);
  });
  return w;
}
