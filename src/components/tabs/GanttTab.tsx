import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getMonthList, getTotalWeeks, todayWk, visStart, checkDeps } from '../../utils/ganttUtils';

interface DragState {
  type: 'row' | 'bar';
  taskId: number;
  mode?: 'L' | 'M' | 'R'; // Left resize, Move, Right resize
  startX: number;
  originalMs: number;
  originalWs: number;
  originalMe: number;
  originalWe: number;
  fromIndex?: number;
}

export const GanttTab: React.FC = () => {
  const currentProject = useAppStore(state => state.allProjects[state.currentId]);
  const currentId = useAppStore(state => state.currentId);
  const setEditingTask = useAppStore(state => state.setEditingTask);
  const deleteTask = useAppStore(state => state.deleteTask);
  const updateTask = useAppStore(state => state.updateTask);
  const showContr = useAppStore(state => state.showContr);
  const hidePast = useAppStore(state => state.hidePast);

  const [hiddenCats, setHiddenCats] = useState<Set<number>>(new Set());
  
  const [drag, setDrag] = useState<DragState | null>(null);
  const [rowOver, setRowOver] = useState<number | null>(null);

  if (!currentProject) return null;
  const { proj, tasks, cats } = currentProject;
  
  console.log("GanttTab rendering with tasks count:", tasks.length);

  const toggleCat = (catIdx: number) => {
    setHiddenCats(prev => {
      const next = new Set(prev);
      if (next.has(catIdx)) next.delete(catIdx);
      else next.add(catIdx);
      return next;
    });
  };

  const TW = getTotalWeeks(proj);
  const ml = getMonthList(proj);
  const tw = todayWk(proj);
  const vs = visStart(proj, hidePast);
  const visMonthStart = Math.floor(vs / 4);

  const visibleTasks = tasks.filter(t => !hiddenCats.has(t.cat));


  // Drag Handlers
  useEffect(() => {
    if (!drag) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (drag.type === 'bar') {
        const dx = Math.round((e.clientX - drag.startX) / 25);
        const t = tasks.find(x => x.n === drag.taskId);
        if (!t) return;

        const oStart = drag.originalMs * 4 + drag.originalWs;
        const oEnd = drag.originalMe * 4 + drag.originalWe;
        const len = oEnd - oStart;

        if (drag.mode === 'M') {
          const ns = Math.max(0, Math.min(TW - len - 1, oStart + dx));
          updateTask(currentId, drag.taskId, {
            ms: Math.floor(ns / 4),
            ws: ns % 4,
            me: Math.floor((ns + len) / 4),
            we: (ns + len) % 4
          });
        } else if (drag.mode === 'L') {
          const ns = Math.max(0, Math.min(oEnd, oStart + dx));
          updateTask(currentId, drag.taskId, {
            ms: Math.floor(ns / 4),
            ws: ns % 4
          });
        } else if (drag.mode === 'R') {
          const ne = Math.max(oStart, Math.min(TW - 1, oEnd + dx));
          updateTask(currentId, drag.taskId, {
            me: Math.floor(ne / 4),
            we: ne % 4
          });
        }
      } else if (drag.type === 'row') {
        // Find row under mouse
        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        const tr = elements.find(el => el.tagName === 'TR' && el.id.startsWith('tr-'));
        if (tr) {
          const overId = parseInt(tr.id.replace('tr-', ''));
          if (overId !== drag.taskId) setRowOver(overId);
          else setRowOver(null);
        }
      }
    };

    const handleMouseUp = () => {
      if (drag.type === 'row' && rowOver !== null) {
          const fromIdx = tasks.findIndex(t => t.n === drag.taskId);
          const toIdx = tasks.findIndex(t => t.n === rowOver);
          if (fromIdx !== -1 && toIdx !== -1) {
            useAppStore.getState().reorderTasks(currentId, fromIdx, toIdx);
          }
      }
      setDrag(null);
      setRowOver(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [drag, rowOver, tasks, TW, currentId, updateTask, currentProject]);

  const onBarMd = (e: React.MouseEvent, t: any, mode: 'L' | 'M' | 'R') => {
    e.preventDefault();
    e.stopPropagation();
    setDrag({
      type: 'bar',
      taskId: t.n,
      mode,
      startX: e.clientX,
      originalMs: t.ms,
      originalWs: t.ws,
      originalMe: t.me,
      originalWe: t.we
    });
  };

  const onRowMd = (e: React.MouseEvent, t: any) => {
    e.preventDefault();
    setDrag({
      type: 'row',
      taskId: t.n,
      startX: e.clientX,
      originalMs: 0, originalWs: 0, originalMe: 0, originalWe: 0 // unused for row
    });
  };

  return (
    <div className="pane active" id="pane-gantt">
      <div className="legend-bar">
        {cats.map((cat, i) => (
          <label key={i} className={`leg ${hiddenCats.has(i) ? 'off' : ''}`}>
            <input 
              type="checkbox" 
              checked={!hiddenCats.has(i)}
              onChange={() => toggleCat(i)} 
              style={{ display: 'none' }}
            />
            <div className="leg-dot" style={{ background: cat.color }}></div>
            {cat.name}
          </label>
        ))}
      </div>
      

      <div className="gantt-scroll" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
        <table className="gt">
          <thead>
            <tr>
              <th className="th-h" rowSpan={2}>⠿</th>
              <th className="th-n" rowSpan={2}>#</th>
              <th className="th-nm" rowSpan={2}>Вид робіт</th>
              {showContr && <th className="th-ct" rowSpan={2}>Підрядник</th>}
              {ml.map(m => {
                if (m.i < visMonthStart) return null;
                return <th key={m.i} colSpan={4} className="th-mo">{m.name} {m.y}</th>
              })}
            </tr>
            <tr>
              {Array.from({ length: TW - vs }).map((_, idx) => {
                const i = vs + idx;
                return <th key={i} className={`th-wk ${i % 4 === 0 ? "ms" : ""}`}>w{(i % 4) + 1}</th>
              })}
            </tr>
          </thead>
          <tbody>
            {visibleTasks.map((t) => {
              const cs = t.ms * 4 + t.ws;
              const ce = t.me * 4 + t.we;
              if (ce < vs || cs >= TW) return null;
              
              const ecs = Math.max(cs, vs);
              const bW = (ce - ecs + 1) * 25 - 2;
              
              const isDraggingRow = drag?.type === 'row' && drag.taskId === t.n;
              const isOverRow = rowOver === t.n;

              return (
                <tr 
                  key={t.n} 
                  id={`tr-${t.n}`}
                  className={`${isDraggingRow ? 'row-dragging' : ''} ${isOverRow ? 'row-drag-over' : ''}`}
                >
                  <td className="td-h" onMouseDown={(e) => onRowMd(e, t)}>⠿</td>
                  <td className="nr">{t.n}</td>
                  <td className="task-name" onClick={() => setEditingTask(t.n)}>
                    <div className="tn-wrap">
                      <span className="tn-txt">{t.name}</span>
                      {checkDeps(t, tasks).length > 0 && (
                        <span className="warn-icon" title={checkDeps(t, tasks).join('\n')}>⚠️</span>
                      )}
                      <span className="tn-del" onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Видалити "${t.name}"?`)) deleteTask(currentId, t.n);
                      }}>✕</span>
                    </div>
                  </td>
                  {showContr && <td className="task-contr">{t.contr || '—'}</td>}
                  {Array.from({ length: TW - vs }).map((_, idx) => {
                    const ci = vs + idx;
                    const isToday = ci === tw;
                    const isStartCell = ci === ecs;
                    
                    return (
                      <td key={ci} className={`td-c ${ci % 4 === 0 ? 'ms' : ''} ${isToday ? 'today-col' : ''}`}>
                        {isToday && <div className="today-line"></div>}
                        {isStartCell && (
                          <div 
                            className="bar" 
                            style={{ 
                              width: `${bW}px`, 
                              background: cats[t.cat]?.color || '#888'
                            }}
                            onMouseDown={(e) => onBarMd(e, t, 'M')}
                          >
                            <div className="bh" onMouseDown={(e) => onBarMd(e, t, 'L')}>
                              <svg width="4" height="8" viewBox="0 0 4 8">
                                <line x1="1" y1="1" x2="1" y2="7" stroke="rgba(255,255,255,.6)" strokeWidth="1"/>
                                <line x1="3" y1="1" x2="3" y2="7" stroke="rgba(255,255,255,.6)" strokeWidth="1"/>
                              </svg>
                            </div>
                            <div className="bar-p" style={{ width: `${t.prog}%` }}></div>
                            <div className="bar-t">{t.prog}%</div>
                            <div className="dep-dots">
                              {t.deps?.map(dn => <span key={dn} title={`Залежить від #${dn}`}>🔗</span>)}
                            </div>
                            <div className="bh" onMouseDown={(e) => onBarMd(e, t, 'R')}>
                              <svg width="4" height="8" viewBox="0 0 4 8">
                                <line x1="1" y1="1" x2="1" y2="7" stroke="rgba(255,255,255,.6)" strokeWidth="1"/>
                                <line x1="3" y1="1" x2="3" y2="7" stroke="rgba(255,255,255,.6)" strokeWidth="1"/>
                              </svg>
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
