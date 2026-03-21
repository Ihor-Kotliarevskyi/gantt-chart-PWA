export interface Category {
  name: string;
  color: string;
}

export interface ProjectSettings {
  name: string;
  sm: number; // start month index (0-11)
  sy: number; // start year
  nm: number; // number of months
}

export interface Task {
  n: number;
  name: string;
  cat: number;
  ms: number; // month start index (relative to project start)
  ws: number; // week start index (0-3)
  me: number; // month end
  we: number; // week end
  contr: string;
  prog: number;
  budget: number;
  spent: number;
  deps: number[]; // array of task 'n'
}

export interface CustomChart {
  id: string;
  type: 'bar' | 'pie' | 'doughnut' | 'line' | 'horizontalBar';
  xKey: string;
  yKey: string;
  catF: string;
  statF: string;
}

export interface ProjectData {
  proj: ProjectSettings;
  cats: Category[];
  tasks: Task[];
  nextN: number;
  customCharts?: CustomChart[];
}

export interface AllProjects {
  [id: string]: ProjectData;
}
