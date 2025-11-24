<template>
  <div v-if="goals.length === 0" class="empty-state">
    <p class="empty-text">还没有目标，点击"添加目标"开始记录吧！</p>
  </div>
  <div v-else class="goal-list">
    <GoalCard
      v-for="goal in goals"
      :key="goal.id"
      :goal="goal"
      @delete="$emit('delete-goal', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import GoalCard from './GoalCard.vue'
import type { Goal } from '../types'

defineProps<{
  goals: Goal[]
}>()

defineEmits<{
  'delete-goal': [goalId: string]
}>()
</script>

<style scoped>
.goal-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.empty-state {
  background: white;
  border-radius: 16px;
  padding: 60px 32px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.empty-text {
  font-size: 18px;
  color: #666;
  margin: 0;
}

@media (max-width: 768px) {
  .goal-list {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .empty-state {
    padding: 40px 20px;
    border-radius: 12px;
  }

  .empty-text {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .goal-list {
    gap: 12px;
  }

  .empty-state {
    padding: 30px 16px;
  }

  .empty-text {
    font-size: 15px;
  }
}
</style>

