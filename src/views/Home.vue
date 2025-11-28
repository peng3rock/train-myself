<template>
  <div class="home-page">
    <Header @add-click="showAddModal = true" />

    <main class="main-content">
      <GoalList
        :goals="goalsStore.goals"
        @delete-goal="handleDeleteGoal"
      />
    </main>

    <!-- 模态框 -->
    <AddGoalModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @add="handleAddGoal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGoalsStore } from '../stores/goals'
import { logInfo } from '../utils/logger'
import type { Goal } from '../types'
import Header from '../components/Header.vue'
import GoalList from '../components/GoalList.vue'
import AddGoalModal from '../components/AddGoalModal.vue'

const goalsStore = useGoalsStore()
const showAddModal = ref(false)

// 初始化应用
goalsStore.init()
logInfo('应用启动')

const handleAddGoal = (goal: Omit<Goal, 'id' | 'createdAt' | 'records' | 'completed'>): void => {
  goalsStore.addGoal(goal)
  showAddModal.value = false
  logInfo('添加新目标', { goalName: goal.name })
}

const handleDeleteGoal = (goalId: string): void => {
  goalsStore.deleteGoal(goalId)
  logInfo('删除目标', { goalId })
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.main-content {
  padding: 32px 24px;
  max-width: 1400px;
  margin: 0 auto;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 24px 16px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 20px 12px;
  }
}
</style>
