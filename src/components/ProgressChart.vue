<template>
  <div class="chart-container">
    <div class="chart-header">
      <h4>训练进度统计</h4>
      <button 
        v-if="goal.subGoals && goal.subGoals.length > 0"
        @click="showSubGoals = !showSubGoals"
        class="toggle-btn"
      >
        {{ showSubGoals ? '隐藏' : '显示' }}子目标
      </button>
    </div>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartConfiguration
} from 'chart.js'
import type { Goal } from '../types'

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps<{
  goal: Goal
}>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
const showSubGoals = ref(false)
let chartInstance: Chart | null = null

const createChart = (): void => {
  if (!chartCanvas.value) return

  // 销毁旧图表
  if (chartInstance) {
    chartInstance.destroy()
  }

  const records = props.goal.records || []
  if (records.length === 0) {
    return
  }

  // 按日期排序
  const sortedRecords = [...records].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  const dates = sortedRecords.map(r => {
    const date = new Date(r.date)
    return `${date.getMonth() + 1}/${date.getDate()}`
  })

  const datasets = []

  if (props.goal.type === 'numeric') {
    const recordType = props.goal.recordType || 'cumulative'
    const values = sortedRecords.map(r => r.value || 0)

    if (recordType === 'target') {
      // 浮动型：只显示每日值，不显示累计值
      datasets.push({
        label: '每日值',
        data: values,
        borderColor: 'rgb(102, 126, 234)',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4
      })
      
      // 目标线
      datasets.push({
        label: '目标',
        data: new Array(values.length).fill(props.goal.targetValue),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'transparent',
        fill: false,
        borderDash: [5, 5],
        pointRadius: 0
      })
    } else {
      // 累加型：显示累计值和每日值
      const cumulativeValues = []
      let sum = 0
      values.forEach(v => {
        sum += v
        cumulativeValues.push(sum)
      })

      datasets.push({
        label: '累计值',
        data: cumulativeValues,
        borderColor: 'rgb(102, 126, 234)',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4
      })

      datasets.push({
        label: '每日值',
        data: values,
        borderColor: 'rgb(118, 75, 162)',
        backgroundColor: 'rgba(118, 75, 162, 0.1)',
        fill: false,
        tension: 0.4
      })
    }

    // 如果有子目标
    if (props.goal.subGoals && props.goal.subGoals.length > 0 && showSubGoals.value) {
      const colors = [
        'rgb(239, 68, 68)',
        'rgb(34, 197, 94)',
        'rgb(251, 191, 36)',
        'rgb(59, 130, 246)',
        'rgb(168, 85, 247)'
      ]
      
      props.goal.subGoals.forEach((subGoal, index) => {
        const subGoalData = sortedRecords.map(r => {
          return r.subGoalValues && r.subGoalValues[subGoal.name] 
            ? r.subGoalValues[subGoal.name] 
            : null
        })
        
        const color = colors[index % colors.length]
        datasets.push({
          label: subGoal.name,
          data: subGoalData,
          borderColor: color,
          backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
          fill: false,
          tension: 0.4,
          borderDash: [5, 5]
        })
      })
    }
  } else {
    // 任务型：显示分数
    const scores = sortedRecords.map(r => r.score || 0)
    
    datasets.push({
      label: '分数',
      data: scores,
      borderColor: 'rgb(102, 126, 234)',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      fill: true,
      tension: 0.4
    })

    // 目标线
    datasets.push({
      label: '目标',
      data: new Array(scores.length).fill(props.goal.targetScore),
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'transparent',
      fill: false,
      borderDash: [5, 5],
      pointRadius: 0
    })

    // 如果有子目标
    if (props.goal.subGoals && props.goal.subGoals.length > 0 && showSubGoals.value) {
      const colors = [
        'rgb(239, 68, 68)',
        'rgb(34, 197, 94)',
        'rgb(251, 191, 36)',
        'rgb(59, 130, 246)',
        'rgb(168, 85, 247)'
      ]
      
      props.goal.subGoals.forEach((subGoal, index) => {
        const subGoalData = sortedRecords.map(r => {
          return r.subGoalValues && r.subGoalValues[subGoal.name] 
            ? r.subGoalValues[subGoal.name] 
            : null
        })
        
        const color = colors[index % colors.length]
        datasets.push({
          label: subGoal.name,
          data: subGoalData,
          borderColor: color,
          backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
          fill: false,
          tension: 0.4,
          borderDash: [5, 5]
        })
      })
    }
  }

  chartInstance = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels: dates,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: 'easeOutQuart' as const
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 16,
            font: {
              size: 12,
              weight: '600',
              family: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif'
            },
            color: '#64748b'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          padding: 12,
          titleFont: {
            size: 13,
            weight: '600'
          },
          bodyFont: {
            size: 12,
            weight: '500'
          },
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          cornerRadius: 12,
          displayColors: true,
          boxPadding: 6
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(226, 232, 240, 0.5)',
            lineWidth: 1
          },
          ticks: {
            font: {
              size: 11,
              weight: '500'
            },
            color: '#94a3b8',
            padding: 8
          },
          border: {
            display: false
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 11,
              weight: '500'
            },
            color: '#94a3b8',
            padding: 8
          },
          border: {
            display: false
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      elements: {
        point: {
          radius: 4,
          hoverRadius: 6,
          borderWidth: 2
        },
        line: {
          borderWidth: 2.5,
          tension: 0.4
        }
      }
    }
  })
}

watch(() => [props.goal.records, showSubGoals.value], () => {
  nextTick(() => {
    createChart()
  })
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    createChart()
  })
})
</script>

<style scoped>
.chart-container {
  margin-top: 0;
  padding: 0;
  background: transparent;
  border-radius: 0;
  border: none;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.chart-header h4 {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.01em;
}

.toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(102, 126, 234, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #667eea;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.toggle-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}

.toggle-btn:hover::before {
  left: 100%;
}

.toggle-btn:hover {
  background: rgba(102, 126, 234, 0.12);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.toggle-btn:active {
  transform: translateY(0);
}

canvas {
  max-height: 400px;
  width: 100% !important;
  height: auto !important;
}
</style>

