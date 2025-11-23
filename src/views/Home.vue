<template>
  <div class="app">
    <Header @add-click="showAddModal = true" />
    <GoalList
      :goals="goalsStore.goals"
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

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useGoalsStore } from '../stores/goals'
import { logInfo, logDebug } from '../utils/logger'
import type { Goal, Record } from '../types'
import Header from '../components/Header.vue'
import GoalList from '../components/GoalList.vue'
import AddGoalModal from '../components/AddGoalModal.vue'
import DebugPanel from '../components/DebugPanel.vue'

const goalsStore = useGoalsStore()
const showAddModal = ref(false)
const showDebugPanel = ref(false)

let keyDownHandler: ((e: KeyboardEvent) => void) | null = null

onMounted(() => {
  logInfo('应用启动')
  goalsStore.init()

  // 快捷键：Ctrl+D 打开调试面板
  keyDownHandler = (e: KeyboardEvent) => {
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

const handleAddGoal = (goal: Omit<Goal, 'id' | 'createdAt' | 'records' | 'completed'>): void => {
  goalsStore.addGoal(goal)
  showAddModal.value = false
}

const handleAddRecord = (goalId: string, record: Omit<Record, 'id' | 'date'>): void => {
  goalsStore.addRecord(goalId, record)
}

const handleDeleteGoal = (goalId: string): void => {
  goalsStore.deleteGoal(goalId)
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
