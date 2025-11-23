<template>
  <div class="app">
    <Header @add-click="showAddModal = true" />
    <GoalList 
      :goals="goals"
      @add-record="handleAddRecord"
      @delete-goal="handleDeleteGoal"
    />
    <AddGoalModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @add="handleAddGoal"
    />
    <DebugPanel
      :visible="showDebugPanel"
      @close="showDebugPanel = false"
    />
    <button
      v-if="!showDebugPanel"
      @click="showDebugPanel = true"
      class="debug-toggle-btn"
      title="打开调试面板 (Ctrl+D)"
    >
      🐛
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { loadData, saveData } from './utils/storage'
import { logInfo, logDebug, logError, logWarn } from './utils/logger'
import Header from './components/Header.vue'
import GoalList from './components/GoalList.vue'
import AddGoalModal from './components/AddGoalModal.vue'
import DebugPanel from './components/DebugPanel.vue'

const goals = ref([])
const showAddModal = ref(false)
const showDebugPanel = ref(false)

let keyDownHandler = null

onMounted(() => {
  logInfo('应用启动')
  const data = loadData()
  goals.value = data.goals || []
  logDebug('加载数据', { goalCount: goals.value.length })
  
  // 快捷键：Ctrl+D 打开调试面板
  keyDownHandler = (e) => {
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault()
      showDebugPanel.value = !showDebugPanel.value
      logDebug('切换调试面板', { visible: showDebugPanel.value })
    }
  }
  window.addEventListener('keydown', keyDownHandler)
})

onUnmounted(() => {
  if (keyDownHandler) {
    window.removeEventListener('keydown', keyDownHandler)
  }
})

const handleAddGoal = (goal) => {
  logInfo('添加新目标', { goalName: goal.name, goalType: goal.type, category: goal.category })
  const newGoal = {
    id: Date.now().toString(),
    ...goal,
    createdAt: new Date().toISOString(),
    records: [],
    completed: false,
    subGoals: goal.subGoals || []
  }
  goals.value.push(newGoal)
  saveData({ goals: goals.value })
  showAddModal.value = false
  logDebug('目标已保存', { goalId: newGoal.id, category: newGoal.category, subGoalsCount: newGoal.subGoals?.length || 0 })
}

const handleAddRecord = (goalId, record) => {
  logInfo('添加记录', { goalId, recordType: record.value !== undefined ? 'numeric' : 'task' })
  const goalIndex = goals.value.findIndex(g => g.id === goalId)
  if (goalIndex === -1) {
    logWarn('目标不存在', { goalId })
    return
  }

  const goal = goals.value[goalIndex]
  const newRecord = {
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
    ...record
  }
  
  goal.records.push(newRecord)
  logDebug('记录已添加', { 
    goalName: goal.name, 
    recordId: newRecord.id,
    value: record.value,
    score: record.score,
    hasSubGoals: !!record.subGoalValues
  })
  
  // 检查是否完成目标
  if (goal.type === 'numeric') {
    const recordType = goal.recordType || 'cumulative'
    if (recordType === 'target') {
      // 浮动型：只要有一次达到目标值就算完成
      const maxValue = Math.max(...goal.records.map(r => r.value || 0))
      const wasCompleted = goal.completed
      goal.completed = maxValue >= goal.targetValue
      if (!wasCompleted && goal.completed) {
        logInfo('目标已完成（浮动型）', { goalName: goal.name, maxValue, targetValue: goal.targetValue })
      }
    } else {
      // 累加型：累计值达到目标
      const total = goal.records.reduce((sum, r) => sum + (r.value || 0), 0)
      const wasCompleted = goal.completed
      goal.completed = total >= goal.targetValue
      if (!wasCompleted && goal.completed) {
        logInfo('目标已完成（累加型）', { goalName: goal.name, total, targetValue: goal.targetValue })
      }
    }
  } else if (goal.type === 'task') {
    if (record.score !== undefined && record.score >= goal.targetScore) {
      const wasCompleted = goal.completed
      goal.completed = true
      if (!wasCompleted) {
        logInfo('目标已完成（任务型）', { goalName: goal.name, score: record.score, targetScore: goal.targetScore })
      }
    }
  }
  
  saveData({ goals: goals.value })
  logDebug('数据已保存')
}

const handleDeleteGoal = (goalId) => {
  const goal = goals.value.find(g => g.id === goalId)
  logInfo('删除目标', { goalId, goalName: goal?.name })
  goals.value = goals.value.filter(goal => goal.id !== goalId)
  saveData({ goals: goals.value })
  logDebug('目标已删除，数据已保存')
}
</script>

<style scoped>
.app {
  min-height: 100vh;
}

.debug-toggle-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  font-size: 24px;
  cursor: pointer;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.debug-toggle-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}
</style>

