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
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
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
  margin-top: 20px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.toggle-btn {
  padding: 6px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: #f3f4f6;
  border-color: #667eea;
  color: #667eea;
}

canvas {
  max-height: 300px;
}
</style>

