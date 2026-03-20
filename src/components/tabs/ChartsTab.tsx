import React from "react";
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
  ChartOptions,
  TooltipItem,
} from "chart.js";
import { Bar, Pie, Doughnut, Line } from "react-chartjs-2";

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

interface ChartConfig {
  id: string;
  type: "pie" | "bar" | "doughnut" | "line";
  x: string;
  y: string;
  title: string;
}

export const ChartsTab: React.FC = () => {
  const { currentProject } = useAppStore();

  if (!currentProject) return null;
  const { tasks, cats, proj } = currentProject;

  const autoCharts: ChartConfig[] = [
    {
      id: "a1",
      type: "pie",
      x: "cat",
      y: "count",
      title: "Кількість робіт за категорією",
    },
    {
      id: "a2",
      type: "bar",
      x: "cat",
      y: "prog",
      title: "Середнє виконання за категорією (%)",
    },
    {
      id: "a3",
      type: "doughnut",
      x: "status",
      y: "count",
      title: "Статус робіт (кількість)",
    },
    {
      id: "a4",
      type: "bar",
      x: "task",
      y: "dur",
      title: "Тривалість робіт (тиж.)",
    },
    {
      id: "a5",
      type: "line",
      x: "month",
      y: "count",
      title: "Нових робіт за місяцями",
    },
  ];

  const renderChart = (c: ChartConfig) => {
    const { labels, values } = getChartData(
      tasks,
      cats,
      proj,
      c.x,
      c.y,
      "",
      "",
      new Set(),
    );
    const colors = getGroupColors(c.x, labels, cats);

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

    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: c.type === "pie" || c.type === "doughnut",
          position: "bottom",
          labels: { font: { size: 10 }, boxWidth: 10 },
        },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<any>) => {
              let label = context.label || "";
              if (label) label += ": ";
              if (context.parsed.y !== undefined)
                label += fmtM(context.parsed.y);
              else if (context.parsed !== undefined)
                label += fmtM(context.parsed);
              return label;
            },
          },
        },
      },
      scales:
        c.type === "pie" || c.type === "doughnut"
          ? {}
          : {
              x: { ticks: { font: { size: 9 }, maxRotation: 45 } },
              y: {
                ticks: { font: { size: 9 }, callback: (v: any) => fmtM(v) },
              },
            },
    };

    return (
      <div key={c.id} className="chart-card">
        <h4>
          <span>{c.title}</span>
        </h4>
        <div style={{ height: "200px", position: "relative" }}>
          {c.type === "bar" && <Bar data={data} options={options} />}
          {c.type === "pie" && <Pie data={data} options={options} />}
          {c.type === "doughnut" && <Doughnut data={data} options={options} />}
          {c.type === "line" && <Line data={data} options={options} />}
        </div>
      </div>
    );
  };

  return (
    <div className="pane active" id="pane-charts">
      <div id="chart-grid">
        {autoCharts.map(renderChart)}
        {/* TODO: Custom charts from currentProject.customCharts */}
      </div>
    </div>
  );
};
