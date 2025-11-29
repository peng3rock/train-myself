<template>
  <div class="goal-card-container">
    <router-link :to="`/goal/${goal.id}`" class="goal-card-link">
      <div :class="['goal-card', { completed: goal.completed }]">
        <!-- 卡片头部 -->
        <div class="card-header">
          <div class="category-badge">
            <span class="category-icon">{{ getCategoryIcon(goal.category) }}</span>
            <span class="category-text">{{ getCategoryText(goal.category) }}</span>
          </div>

          <div class="card-actions">
            <button
              v-if="goal.completed"
              class="status-badge completed"
              disabled
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>已完成</span>
            </button>
          </div>
        </div>

        <!-- 目标标题 -->
        <div class="card-title">
          <h3 class="goal-title">{{ goal.name }}</h3>
        </div>

        <!-- 进度信息 -->
        <div class="progress-section">
          <template v-if="goal.type === 'numeric'">
            <div class="progress-stats">
              <div class="stat-item">
                <span class="stat-label">{{ progress.isFloating ? '当前值' : '累计值' }}</span>
                <span class="stat-value">{{ progress.total }}</span>
              </div>
              <div class="stat-divider">/</div>
              <div class="stat-item">
                <span class="stat-label">目标</span>
                <span class="stat-value">{{ goal.targetValue }}</span>
              </div>
              <div class="stat-unit">{{ goal.unit || '' }}</div>
            </div>

            <div v-if="progress.isFloating && progress.maxValue !== progress.latestValue" class="progress-secondary">
              <span class="secondary-label">最高值：</span>
              <span class="secondary-value">{{ progress.maxValue }} {{ goal.unit || '' }}</span>
            </div>

            <div class="progress-visual">
              <div class="progress-bar-bg">
                <div
                  class="progress-bar-fill"
                  :class="{ completed: progress.percentage >= 100 }"
                  :style="{ width: `${Math.min(progress.percentage, 100)}%` }"
                />
              </div>
              <div class="progress-percentage">{{ Math.round(progress.percentage) }}%</div>
            </div>
          </template>

          <template v-else>
            <div class="task-stats">
              <div class="stat-item">
                <span class="stat-label">测验次数</span>
                <span class="stat-value">{{ progress.recordCount }}</span>
              </div>
              <div v-if="progress.latestScore !== null" class="stat-item">
                <span class="stat-label">最近分数</span>
                <span class="stat-value">{{ progress.latestScore }}/{{ goal.targetScore }}</span>
              </div>
            </div>
          </template>
        </div>

        <!-- 子目标指示器 -->
        <div v-if="goal.subGoals && goal.subGoals.length > 0" class="subgoals-indicator">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ goal.subGoals.length }} 个子目标</span>
        </div>

        <!-- 倒数日指示器 -->
        <div v-if="goal.deadline" class="countdown-indicator" :class="countdownStatus">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ countdownText }}</span>
        </div>

        <!-- 卡片底部 -->
        <div class="card-footer">
          <div class="meta-info">
            <span class="meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ formatDate(goal.createdAt) }}
            </span>
            <span class="meta-divider">•</span>
            <span class="meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12H15M9 16H15M17 8H7C5.89543 8 5 8.89543 5 10V18C5 19.1046 5.89543 20 7 20H17C18.1046 20 19 19.1046 19 18V10C19 8.89543 18.1046 8 17 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ goal.records.length }} 条记录
            </span>
          </div>

          <div class="view-action">
            <span class="view-text">查看详情</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5L16 12L9 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <!-- 悬停效果装饰 -->
        <div class="card-hover-effect"></div>
      </div>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Goal } from '../types'
import { getDaysRemaining, formatDaysRemaining, getCountdownStatus } from '../utils/countdown'

const props = defineProps<{
  goal: Goal
}>()


const progress = computed(() => {
  if (props.goal.type === 'numeric') {
    const recordType = props.goal.recordType || 'cumulative'

    if (recordType === 'target') {
      // 浮动型：显示当前最高值或最近值
      const values = props.goal.records.map(r => r.value || 0)
      const maxValue = values.length > 0 ? Math.max(...values) : 0
      const latestValue = values.length > 0 ? values[values.length - 1] : 0
      const displayValue = maxValue >= (props.goal.targetValue || 0) ? maxValue : latestValue
      const percentage = Math.min((displayValue / (props.goal.targetValue || 1)) * 100, 100)
      return {
        total: displayValue,
        percentage,
        isFloating: true,
        maxValue,
        latestValue
      }
    } else {
      // 累加型：显示累计值
      const total = props.goal.records.reduce((sum, r) => sum + (r.value || 0), 0)
      const percentage = Math.min((total / (props.goal.targetValue || 1)) * 100, 100)
      return { total, percentage, isFloating: false }
    }
  } else {
    const latestRecord = props.goal.records[props.goal.records.length - 1]
    return {
      latestScore: latestRecord?.score || null,
      recordCount: props.goal.records.length
    }
  }
})

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    '🎸 音乐': '🎸',
    '🏃 运动': '🏃',
    '💻 编程': '💻',
    '📚 学习': '📚',
    '🎨 艺术': '🎨',
    '🗣️ 语言': '🗣️',
    '⚽ 爱好': '⚽',
    '✨ 其他': '✨'
  }
  return icons[category] || '✨'
}

const getCategoryText = (category: string): string => {
  if (!category) return '其他'
  // 移除开头的emoji图标，只保留文本部分
  // 匹配开头的emoji（可能包含多个字符，如 🗣️）
  const text = category.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s]+/u, '').trim()
  return text || '其他'
}

// 倒数日相关计算
const daysRemaining = computed(() => getDaysRemaining(props.goal.deadline))
const countdownText = computed(() => formatDaysRemaining(daysRemaining.value))
const countdownStatus = computed(() => getCountdownStatus(daysRemaining.value))
</script>

<style scoped>
.goal-card-container {
  position: relative;
}

.goal-card-link {
  text-decoration: none;
  color: inherit;
  display: block;
  position: relative;
  z-index: 1;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  width: 100%;
  height: 100%;
}

.goal-card-link:active {
  opacity: 0.9;
}

.goal-card {
  position: relative;
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transition: all 0.4s ease-out-expo;
  overflow: hidden;
  cursor: pointer;
  animation: cardSlideIn 0.5s ease-out both;
  pointer-events: auto;
  touch-action: manipulation;
  z-index: 1;
}

.goal-card > * {
  position: relative;
  z-index: 2;
}

@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.goal-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.goal-card.completed {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.08);
}

.goal-card.completed:hover {
  box-shadow: 0 12px 32px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(102, 126, 234, 0.15);
  transition: all 0.2s ease;
}

.category-icon {
  font-size: 14px;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-badge.completed {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: default;
}


/* 目标标题 */
.card-title {
  margin-bottom: 20px;
}

.goal-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

/* 进度信息 */
.progress-section {
  margin-bottom: 20px;
}

.progress-stats {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 15px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.stat-value {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.stat-divider {
  color: #cbd5e1;
  font-weight: 400;
  margin: 0 4px;
}

.stat-unit {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  margin-left: 4px;
}

.progress-secondary {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 12px;
}

.progress-visual {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar-bg {
  flex: 1;
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 3px;
  position: relative;
}

.progress-bar-fill.completed {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.progress-bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: progress-shine 2s infinite;
}

@keyframes progress-shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-percentage {
  font-size: 14px;
  font-weight: 700;
  color: #475569;
  min-width: 40px;
  text-align: right;
}

.task-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 子目标指示器 */
.subgoals-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(102, 126, 234, 0.08);
  color: #667eea;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(102, 126, 234, 0.12);
  margin-bottom: 12px;
}

/* 倒数日指示器 */
.countdown-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 16px;
  border: 1px solid;
  transition: all 0.3s ease;
}

.countdown-indicator svg {
  flex-shrink: 0;
}

.countdown-indicator.normal {
  background: rgba(59, 130, 246, 0.08);
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.15);
}

.countdown-indicator.warning {
  background: rgba(251, 191, 36, 0.1);
  color: #f59e0b;
  border-color: rgba(251, 191, 36, 0.2);
}

.countdown-indicator.urgent {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
  animation: pulse-urgent 2s ease-in-out infinite;
}

.countdown-indicator.expired {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  border-color: rgba(107, 114, 128, 0.2);
}

@keyframes pulse-urgent {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
}

/* 卡片底部 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(226, 232, 240, 0.5);
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-divider {
  color: #cbd5e1;
}

.view-action {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #667eea;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
  pointer-events: auto;
  cursor: pointer;
  user-select: none;
}

.view-text {
  pointer-events: auto;
  cursor: pointer;
}

.goal-card:hover .view-action {
  color: #5a67d8;
  transform: translateX(2px);
}

/* 悬停效果装饰 */
.card-hover-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 0;
}

.goal-card:hover .card-hover-effect {
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .goal-card {
    padding: 20px;
    border-radius: 16px;
  }

  .goal-title {
    font-size: 18px;
  }

  .stat-value {
    font-size: 16px;
  }

  .progress-stats {
    font-size: 14px;
  }

  .card-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .view-action {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .goal-card {
    padding: 16px;
  }

  .card-header {
    margin-bottom: 12px;
  }

  .goal-title {
    font-size: 16px;
  }

  .progress-section {
    margin-bottom: 16px;
  }

  .progress-stats {
    flex-wrap: wrap;
    gap: 4px;
  }

  .stat-unit {
    margin-left: 0;
  }
}
</style>

