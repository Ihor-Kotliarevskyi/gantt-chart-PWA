import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { fmtM, getTaskDuration, remWk, checkDeps } from '../../utils/ganttUtils';

type SortCol = 'n' | 'name' | 'cat' | 'contr' | 'dur' | 'budget' | 'spent' | 'rest' | 'pct' | 'rate' | 'prog';
type SortDir = 1 | -1;

export const FinanceTab: React.FC = () => {
  const currentProject = useAppStore(state => state.allProjects[state.currentId]);
  const [sort, setSort] = useState<{ col: SortCol, dir: SortDir }>({ col: 'n', dir: 1 });
  
  // Extended filters
  const [filterCat, setFilterCat] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'done' | 'active' | 'pending' | 'warn'>('all');
  const [filterContr, setFilterContr] = useState<string>('');
  const [budgetMin, setBudgetMin] = useState<number | ''>('');
  const [budgetMax, setBudgetMax] = useState<number | ''>('');
  const [onlyBudget, setOnlyBudget] = useState(false);

  const data = useMemo(() => {
    if (!currentProject) return { tasks: [], totals: { budget: 0, spent: 0, rest: 0 }, globalTotals: { budget: 0, spent: 0 }, contractors: [] };
    
    const { proj, tasks, cats } = currentProject;
    
    const contractors = [...new Set(tasks.map(t => t.contr || '').filter(Boolean))];

    let filtered = tasks.filter(t => {
      if (filterCat !== 'all' && t.cat !== filterCat) return false;
      if (filterStatus === 'done' && t.prog < 100) return false;
      if (filterStatus === 'active' && (t.prog === 0 || t.prog === 100)) return false;
      if (filterStatus === 'pending' && t.prog !== 0) return false;
      if (filterStatus === 'warn' && checkDeps(t, tasks).length === 0) return false;
      if (filterContr && t.contr !== filterContr) return false;
      if (budgetMin !== '' && (t.budget || 0) < budgetMin) return false;
      if (budgetMax !== '' && (t.budget || 0) > budgetMax) return false;
      if (onlyBudget && !(t.budget > 0)) return false;
      return true;
    });

    const mapped = filtered.map(t => {
      const budget = Number(t.budget) || 0;
      const spent = Number(t.spent) || 0;
      const rest = budget - spent;
      const rw = remWk(t, proj);
      return {
        ...t,
        dur: getTaskDuration(t),
        rest,
        pct: budget > 0 ? Math.round((spent / budget) * 100) : 0,
        rate: rw > 0 ? Math.round(rest / rw) : 0,
        catName: cats[t.cat]?.name || '?',
        catColor: cats[t.cat]?.color || '#888'
      };
    });

    mapped.sort((a, b) => {
      let av: any = (a as any)[sort.col];
      let bv: any = (b as any)[sort.col];
      
      if (typeof av === 'string') {
        return sort.dir * av.localeCompare(bv, 'uk');
      }
      return sort.dir * (Number(av) - Number(bv));
    });

    const totals = mapped.reduce((acc, t) => ({
      budget: acc.budget + (Number(t.budget) || 0),
      spent: acc.spent + (Number(t.spent) || 0),
      rest: acc.rest + (Number(t.rest) || 0)
    }), { budget: 0, spent: 0, rest: 0 });

    const globalTotals = tasks.reduce((acc, t) => ({
      budget: acc.budget + (Number(t.budget) || 0),
      spent: acc.spent + (Number(t.spent) || 0)
    }), { budget: 0, spent: 0 });

    return { tasks: mapped, totals, globalTotals, contractors };
  }, [currentProject, sort, filterCat, filterStatus, filterContr, budgetMin, budgetMax, onlyBudget]);

  if (!currentProject) return null;
  const { cats } = currentProject;

  const handleSort = (col: SortCol) => {
    setSort(prev => ({
      col,
      dir: prev.col === col ? (prev.dir * -1 as SortDir) : 1
    }));
  };

  const resetFilters = () => {
    setFilterCat('all');
    setFilterStatus('all');
    setFilterContr('');
    setBudgetMin('');
    setBudgetMax('');
    setOnlyBudget(false);
  };

  const getSortClass = (col: SortCol) => {
    if (sort.col !== col) return '';
    return sort.dir === 1 ? 'asc' : 'desc';
  };
  const { budget: gb, spent: gs } = data.globalTotals;
  const gr = gb - gs;
  const gop = gb > 0 ? Math.round((gs / gb) * 100) : 0;

  return (
    <div className="pane active" id="pane-finance">
      <div id="fin-summary">
        <div className="fc">
          <div className="lbl">Загальний бюджет</div>
          <div className="val">{fmtM(gb)}</div>
          <div className="sub">грн</div>
        </div>
        <div className="fc">
          <div className="lbl">Витрачено</div>
          <div className="val" style={{ color: gs > gb && gb > 0 ? 'var(--err)' : 'var(--ok)' }}>{fmtM(gs)}</div>
          <div className="sub">{gop}%</div>
        </div>
        <div className="fc">
          <div className="lbl">Залишок</div>
          <div className="val" style={{ color: gr < 0 ? 'var(--err)' : 'inherit' }}>{fmtM(gr)}</div>
          <div className="sub">грн</div>
        </div>
        <div className="fc">
          <div className="lbl">Робіт (всього)</div>
          <div className="val">{currentProject.tasks.length}</div>
          <div className="sub">з бюджетом: {currentProject.tasks.filter(t => (t.budget || 0) > 0).length}</div>
        </div>
      </div>

      <div className="fin-filters">
        <div className="ff-group">
          <label>Категорія</label>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value === 'all' ? 'all' : +e.target.value)}>
            <option value="all">Усі категорії</option>
            {cats.map((c, i) => <option key={i} value={i}>{c.name}</option>)}
          </select>
        </div>
        <div className="ff-group">
          <label>Статус</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}>
            <option value="all">Усі статуси</option>
            <option value="done">Завершено (100%)</option>
            <option value="active">В роботі</option>
            <option value="pending">Не розпочато</option>
            <option value="warn">З порушеннями</option>
          </select>
        </div>
        <div className="ff-group">
          <label>Підрядник</label>
          <select value={filterContr} onChange={e => setFilterContr(e.target.value)}>
            <option value="">Усі</option>
            {data.contractors.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="ff-group">
          <label>Бюджет від (грн)</label>
          <input type="number" value={budgetMin} onChange={e => setBudgetMin(e.target.value === '' ? '' : +e.target.value)} placeholder="0" />
        </div>
        <div className="ff-group">
          <label>Бюджет до (грн)</label>
          <input type="number" value={budgetMax} onChange={e => setBudgetMax(e.target.value === '' ? '' : +e.target.value)} placeholder="∞" />
        </div>
        <div className="ff-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '5px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', textTransform: 'none', letterSpacing: '0' }}>
            <input type="checkbox" checked={onlyBudget} onChange={e => setOnlyBudget(e.target.checked)} />
            Тільки з бюджетом
          </label>
          <button className="btn btn-sm" onClick={resetFilters} style={{ padding: '3px 7px' }}>Скинути</button>
        </div>
      </div>

      <div className="gantt-scroll" style={{ padding: '0 14px 14px' }}>
        <table className="gt" id="fin-tbl-inner">
          <thead>
            <tr>
              <th onClick={() => handleSort('n')} className={getSortClass('n')}>#<span className="sa"></span></th>
              <th onClick={() => handleSort('name')} className={getSortClass('name')}>Назва<span className="sa"></span></th>
              <th onClick={() => handleSort('cat')} className={getSortClass('cat')}>Кат.<span className="sa"></span></th>
              <th onClick={() => handleSort('contr')} className={getSortClass('contr')}>Підрядник<span className="sa"></span></th>
              <th onClick={() => handleSort('dur')} className={getSortClass('dur')}>Тиж.<span className="sa"></span></th>
              <th onClick={() => handleSort('budget')} className={getSortClass('budget')}>Бюджет<span className="sa"></span></th>
              <th onClick={() => handleSort('spent')} className={getSortClass('spent')}>Витрачено<span className="sa"></span></th>
              <th onClick={() => handleSort('rest')} className={getSortClass('rest')}>Залишок<span className="sa"></span></th>
              <th onClick={() => handleSort('pct')} className={getSortClass('pct')}>Освоєно<span className="sa"></span></th>
              <th onClick={() => handleSort('rate')} className={getSortClass('rate')}>грн/тиж<span className="sa"></span></th>
              <th onClick={() => handleSort('prog')} className={getSortClass('prog')}>Виконання<span className="sa"></span></th>
            </tr>
          </thead>
          <tbody>
            {data.tasks.length > 0 ? data.tasks.map(t => {
              const bc = t.pct > 100 ? 'var(--err)' : t.pct > 80 ? 'var(--warn)' : 'var(--ok)';
              const warns = checkDeps(t, currentProject.tasks);
              return (
                <tr key={t.n}>
                  <td>{t.n}</td>
                  <td>
                    {t.name}
                    {warns.length > 0 && <span title={warns.join('\n')} style={{ cursor: 'help', marginLeft: '4px' }}>⚠️</span>}
                  </td>
                  <td>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '2px', background: t.catColor, marginRight: '4px' }}></span>
                    {t.catName}
                  </td>
                  <td>{t.contr || '—'}</td>
                  <td className="nr">{t.dur}</td>
                  <td className="nr">{fmtM(t.budget)}</td>
                  <td className="nr">{fmtM(t.spent)}</td>
                  <td className="nr" style={{ color: t.rest < 0 ? 'var(--err)' : '' }}>{fmtM(t.rest)}</td>
                  <td>
                    <div className="pb"><div className="pb-f" style={{ width: `${Math.min(100, t.pct)}%`, background: bc }}></div></div>
                    <span style={{ fontSize: '10px' }}>{t.pct}%</span>
                  </td>
                  <td className="nr">{t.rate > 0 ? fmtM(t.rate) : '—'}</td>
                  <td>
                    <span className="badge" style={{ background: t.prog === 100 ? 'var(--ok)' : t.prog > 0 ? 'var(--warn)' : 'var(--txt3)' }}>
                      {t.prog}%
                    </span>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={11} style={{ textAlign: 'center', padding: '18px', color: 'var(--txt3)' }}>Немає робіт за фільтрами</td></tr>
            )}
          </tbody>
          <tfoot>
            <tr className="ttl">
              <td colSpan={5}>Разом (відфільтровано)</td>
              <td className="nr">{fmtM(data.totals.budget)}</td>
              <td className="nr">{fmtM(data.totals.spent)}</td>
              <td className="nr" style={{ color: data.totals.rest < 0 ? 'var(--err)' : '' }}>{fmtM(data.totals.rest)}</td>
              <td colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
