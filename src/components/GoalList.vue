<template>
  <div v-if="goals.length === 0" class="empty-state">
    <div class="empty-state-icon">🎯</div>
    <p class="empty-text">还没有目标，点击"添加目标"开始记录吧！</p>
  </div>
  <div v-else class="goal-list">
    <GoalCard
      v-for="(goal, index) in goals"
      :key="goal.id"
      :goal="goal"
      :style="{ animationDelay: `${index * 0.1}s` }"
    />
  </div>
</template>

<script setup lang="ts">
import GoalCard from './GoalCard.vue'
import type { Goal } from '../types'

defineProps<{
  goals: Goal[]
}>()

</script>

<style scoped>
.goal-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
  animation: fadeInUp 0.6s ease-out 0.1s both;
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

.empty-state {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 80px 40px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.empty-state::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.03) 0%, transparent 70%);
  animation: float 8s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  50% {
    transform: translate(-50%, -50%) rotate(5deg);
  }
}

.empty-text {
  font-size: 20px;
  font-weight: 600;
  color: #64748b;
  margin: 0;
  position: relative;
  z-index: 1;
}

.empty-state-icon {
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.6;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
  60% {
    transform: translateY(-4px);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .goal-list {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .goal-list {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .empty-state {
    padding: 60px 30px;
    border-radius: 20px;
  }

  .empty-text {
    font-size: 18px;
  }

  .empty-state-icon {
    font-size: 48px;
    margin-bottom: 20px;
  }
}

@media (max-width: 480px) {
  .goal-list {
    gap: 16px;
  }

  .empty-state {
    padding: 40px 20px;
    border-radius: 16px;
  }

  .empty-text {
    font-size: 16px;
  }

  .empty-state-icon {
    font-size: 40px;
    margin-bottom: 16px;
  }
}
</style>

