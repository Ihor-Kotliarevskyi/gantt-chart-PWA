import React, { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import { getChartData, getGroupColors } from "../../utils/chartUtils";
import { fmtM } from "../../utils/ganttUtils";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  type TooltipItem,
} from "chart.js";
import { Bar, Pie, Doughnut, Line } from "react-chartjs-2";
import type { CustomChart } from "../../types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

export const ChartsTab: React.FC = () => {
  const { currentProject, currentId, addCustomChart, deleteCustomChart } = useAppStore();
  
  // Form State
  const [fType, setFType] = useState<CustomChart['type']>('bar');
  const [fX, setFX] = useState('cat');
  const [fY, setFY] = useState('count');
  const [fCat, setFCat] = useState('');
  const [fStat, setFStat] = useState('');

  if (!currentProject) return null;
  const { tasks, cats, proj, customCharts = [] } = currentProject;

  const autoCharts: CustomChart[] = [
    { id: "a1", type: "pie", xKey: "cat", yKey: "count", catF: "", statF: "" },
    { id: "a2", type: "bar", xKey: "cat", yKey: "prog", catF: "", statF: "" },
    { id: "a3", type: "doughnut", xKey: "status", yKey: "count", catF: "", statF: "" },
    { id: "a4", type: "bar", xKey: "task", yKey: "dur", catF: "", statF: "" },
    { id: "a5", type: "line", xKey: "month", yKey: "count", catF: "", statF: "" },
  ];

  const onAddChart = () => {
    addCustomChart(currentId, {
      type: fType,
      xKey: fX,
      yKey: fY,
      catF: fCat,
      statF: fStat
    });
  };

  const getTitle = (c: CustomChart) => {
    const yL: Record<string, string> = { count: "Кількість", budget: "Бюджет", spent: "Витрачено", rest: "Залишок", prog: "Виконання", dur: "Тривалість" };
    const xL: Record<string, string> = { cat: "категорією", contr: "підрядником", status: "статусом", month: "місяцем", task: "роботою" };
    return `${yL[c.yKey] || ""} за ${xL[c.xKey] || ""}`;
  };

  const renderChart = (c: CustomChart, isAuto = false) => {
    const { labels, values } = getChartData(tasks, cats, proj, c.xKey, c.yKey, c.catF, c.statF, new Set());
    const colors = getGroupColors(c.xKey, labels, cats);

    const data = {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderColor: c.type === "line" ? colors[0] : undefined,
          borderWidth: c.type === "line" ? 2 : 0,
          fill: false,
          tension: 0.3,
        },
      ],
    };

    const options: any = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: c.type === 'horizontalBar' ? 'y' : 'x',
      plugins: {
        legend: {
          display: c.type === "pie" || c.type === "doughnut",
          position: "bottom" as const,
          labels: { font: { size: 10 }, boxWidth: 10 },
        },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<any>) => {
              let label = context.label || "";
              if (label) label += ": ";
              if (context.parsed && (context.parsed as any).y !== undefined)
                label += fmtM((context.parsed as any).y);
              else if (context.parsed !== undefined)
                label += fmtM(context.parsed as number);
              return label;
            },
          },
        },
      },
      ...((c.type !== "pie" && c.type !== "doughnut")
        ? {
            scales: {
              x: { ticks: { font: { size: 9 }, maxRotation: 45 } },
              y: {
                ticks: { font: { size: 9 }, callback: (v: any) => fmtM(v) },
              },
            },
          }
        : {}),
    };

    const chartType = c.type === 'horizontalBar' ? 'bar' : c.type;

    return (
      <div key={c.id} className="chart-card">
        <h4>
          <span>{getTitle(c)}</span>
          {!isAuto && (
            <div className="chart-actions">
              <button className="chart-act-btn del" onClick={() => deleteCustomChart(currentId, c.id)}>✕</button>
            </div>
          )}
        </h4>
        <div style={{ height: "200px", position: "relative" }}>
          {chartType === "bar" && <Bar data={data} options={options} />}
          {chartType === "pie" && <Pie data={data} options={options} />}
          {chartType === "doughnut" && <Doughnut data={data} options={options} />}
          {chartType === "line" && <Line data={data} options={options} />}
        </div>
      </div>
    );
  };

  return (
    <div className="pane active" id="pane-charts" style={{ padding: '14px' }}>
      <div className="chart-builder">
        <h4>Власний графік</h4>
        <div className="cb-row">
          <div className="cb-group">
            <label>Тип</label>
            <select value={fType} onChange={e => setFType(e.target.value as any)}>
              <option value="bar">Bar</option>
              <option value="horizontalBar">Bar (горизонт.)</option>
              <option value="pie">Pie</option>
              <option value="doughnut">Doughnut</option>
              <option value="line">Line</option>
            </select>
          </div>
          <div className="cb-group">
            <label>Вісь X</label>
            <select value={fX} onChange={e => setFX(e.target.value)}>
              <option value="cat">Категорія</option>
              <option value="contr">Підрядник</option>
              <option value="status">Статус</option>
              <option value="month">Місяць</option>
              <option value="task">Робота</option>
            </select>
          </div>
          <div className="cb-group">
            <label>Показник Y</label>
            <select value={fY} onChange={e => setFY(e.target.value)}>
              <option value="count">Кількість</option>
              <option value="budget">Бюджет</option>
              <option value="spent">Витрачено</option>
              <option value="rest">Залишок</option>
              <option value="prog">Виконання</option>
              <option value="dur">Тривалість</option>
            </select>
          </div>
          <div className="cb-group">
            <label>Фільтр категорій</label>
            <select value={fCat} onChange={e => setFCat(e.target.value)}>
              <option value="">Усі</option>
              {cats.map((c, i) => <option key={i} value={i}>{c.name}</option>)}
            </select>
          </div>
          <div className="cb-group">
            <label>Статус</label>
            <select value={fStat} onChange={e => setFStat(e.target.value)}>
              <option value="">Усі</option>
              <option value="done">Завершено</option>
              <option value="active">В роботі</option>
              <option value="pending">Не розпочато</option>
            </select>
          </div>
          <button className="btn btn-acc" onClick={onAddChart} style={{ alignSelf: 'flex-end' }}>
            + Побудувати
          </button>
        </div>
      </div>

      <div className="chart-grid" id="chart-grid">
        {autoCharts.map(c => renderChart(c, true))}
        {customCharts.map(c => renderChart(c, false))}
      </div>
    </div>
  );
};
