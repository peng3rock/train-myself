<template>
  <div v-if="goals.length === 0" class="empty-state">
    <p class="empty-text">还没有目标，点击"添加目标"开始记录吧！</p>
  </div>
  <div v-else class="goal-list">
    <GoalCard
      v-for="goal in goals"
      :key="goal.id"
      :goal="goal"
      @add-record="$emit('add-record', $event.goalId, $event.record)"
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
  'add-record': [goalId: string, record: any]
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

@media (max-width: 600px) {
  .goal-list {
    grid-template-columns: 1fr;
  }
}
</style>

