import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

export const chartTextColor = '#8C9AAE';
export const chartGridColor = 'rgba(35,44,58,0.6)';

export const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: chartTextColor, font: { family: 'Inter', size: 11 } },
    },
    tooltip: {
      backgroundColor: '#1A2230',
      borderColor: '#232C3A',
      borderWidth: 1,
      titleColor: '#E8EDF4',
      bodyColor: '#8C9AAE',
    },
  },
  scales: {
    x: {
      ticks: { color: chartTextColor, font: { family: 'Inter', size: 11 } },
      grid: { color: 'transparent' },
    },
    y: {
      ticks: { color: chartTextColor, font: { family: 'Inter', size: 11 } },
      grid: { color: chartGridColor },
    },
  },
};
