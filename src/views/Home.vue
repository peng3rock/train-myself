<template>
  <div class="app">
    <Header @add-click="showAddModal = true" />
    <GoalList
      :goals="goalsStore.goals"
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
    <!-- 调试面板触发器 - 开发人员专用 -->
    <!-- 方式1: 连续点击页面空白区域3次 -->
    <!-- 方式2: 按 Ctrl+Shift+D 快捷键 -->
    <button
      v-if="showDebugPanel"
      @click="showDebugPanel = false"
      class="debug-toggle-btn"
      title="关闭调试面板"
    >
      ❌
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
let clickCount = 0
let clickTimer: number | null = null

onMounted(() => {
  logInfo('应用启动')
  goalsStore.init()

  // 快捷键：Ctrl+Shift+D 打开调试面板（开发人员专用）
  keyDownHandler = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault()
      showDebugPanel.value = !showDebugPanel.value
      logDebug('切换调试面板 (快捷键)', { visible: showDebugPanel.value })
    }
  }
  window.addEventListener('keydown', keyDownHandler)

  // 连续点击空白区域3次打开调试面板（开发人员专用）
  const handlePageClick = () => {
    clickCount++
    if (clickCount >= 3) {
      showDebugPanel.value = true
      logDebug('切换调试面板 (连续点击)', { visible: showDebugPanel.value })
      clickCount = 0
    }

    if (clickTimer) {
      clearTimeout(clickTimer)
    }
    clickTimer = window.setTimeout(() => {
      clickCount = 0
    }, 1000) // 1秒内必须完成3次点击
  }

  // 只在页面空白区域监听点击
  document.addEventListener('click', (e) => {
    // 如果点击的是按钮、链接或其他交互元素，不计数
    const target = e.target as HTMLElement
    if (target.tagName === 'BUTTON' || target.tagName === 'A' ||
        target.closest('button') || target.closest('a') ||
        target.closest('.goal-card') || target.closest('.modal-overlay')) {
      return
    }
    handlePageClick()
  })
})

onUnmounted(() => {
  if (keyDownHandler) {
    window.removeEventListener('keydown', keyDownHandler)
  }
  if (clickTimer) {
    clearTimeout(clickTimer)
  }
})

const handleAddGoal = (goal: Omit<Goal, 'id' | 'createdAt' | 'records' | 'completed'>): void => {
  goalsStore.addGoal(goal)
  showAddModal.value = false
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
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
  font-size: 16px;
  cursor: pointer;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  animation: pulse 2s infinite;
}

.debug-toggle-btn:hover {
  background: rgba(220, 38, 38, 1);
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.6);
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* 移动端样式 */
@media (max-width: 768px) {
  .app {
    padding: 16px;
  }

  .debug-toggle-btn {
    bottom: 16px;
    right: 16px;
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
}
</style>
