<template>
  <div class="goal-detail-page" v-if="goal">
    <!-- 返回按钮 -->
    <div class="back-button-container">
      <router-link to="/" class="back-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>返回</span>
      </router-link>
    </div>

    <!-- 目标头部信息 -->
    <div class="goal-header">
      <div class="goal-title-section">
        <span class="goal-category">{{ goal.category || '✨ 其他' }}</span>
        <h1 class="goal-title">{{ goal.name }}</h1>
        <div class="goal-meta">
          <span class="meta-item">创建时间：{{ formatDate(goal.createdAt) }}</span>
          <span class="meta-item">记录次数：{{ goal.records.length }}</span>
          <span v-if="goal.completed" class="completed-status">已完成</span>
        </div>
      </div>

      <div class="goal-actions">
        <button
          class="add-record-btn"
          @click="showRecordModal = true"
        >
          + 添加记录
        </button>
        <button
          class="delete-btn"
          @click="handleDelete"
        >
          删除目标
        </button>
      </div>
    </div>

    <!-- 目标详细信息 -->
    <div class="goal-details">
      <!-- 目标与进度 -->
      <div class="detail-section">
        <!-- 完成进度 - 最显眼 -->
        <div class="progress-hero" :class="{ 'completed': progress.percentage >= 100 }">
          <div class="progress-percentage-large">
            <span class="percentage-number" :class="{ 'completed': progress.percentage >= 100 }">{{ Math.round(progress.percentage) }}</span>
            <span class="percentage-unit" :class="{ 'completed': progress.percentage >= 100 }">%</span>
          </div>
          <div class="progress-label-large">
            {{ progress.percentage >= 100 ? '🎉 目标已完成！' : '完成进度' }}
          </div>
          <div class="progress-bar-hero">
            <div
              class="progress-bar-fill"
              :class="{ 'completed': progress.percentage >= 100 }"
              :style="{ width: `${Math.min(progress.percentage, 100)}%` }"
            />
          </div>
          <div class="progress-stats-inline">
            <template v-if="goal.type === 'numeric'">
              <span class="stat-inline">
                <span class="stat-label">{{ progress.isFloating ? '当前' : '累计' }}：</span>
                <span class="stat-number">{{ progress.total }} {{ goal.unit || '' }}</span>
              </span>
              <span class="stat-divider">|</span>
              <span class="stat-inline">
                <span class="stat-label">目标：</span>
                <span class="stat-number">{{ goal.targetValue }} {{ goal.unit || '' }}</span>
              </span>
              <span v-if="progress.isFloating && progress.maxValue !== progress.total" class="stat-inline">
                <span class="stat-divider">|</span>
                <span class="stat-label">最高：</span>
                <span class="stat-number">{{ progress.maxValue }} {{ goal.unit || '' }}</span>
              </span>
            </template>
            <template v-else>
              <span class="stat-inline">
                <span class="stat-label">最近分数：</span>
                <span class="stat-number">{{ progress.latestScore !== null ? progress.latestScore : '-' }} / {{ goal.targetScore }}</span>
              </span>
              <span class="stat-divider">|</span>
              <span class="stat-inline">
                <span class="stat-label">测验次数：</span>
                <span class="stat-number">{{ progress.recordCount }}</span>
              </span>
            </template>
          </div>
        </div>

        <!-- 子目标 - 可折叠 -->
        <div v-if="goal.subGoals && goal.subGoals.length > 0" class="subgoals-collapsible">
          <button 
            class="subgoals-toggle"
            @click="showSubGoals = !showSubGoals"
          >
            <span class="subgoals-toggle-icon" :class="{ 'expanded': showSubGoals }">▼</span>
            <span class="subgoals-toggle-text">子目标 ({{ goal.subGoals.length }})</span>
          </button>
          <div v-show="showSubGoals" class="subgoals-list">
            <div
              v-for="(subGoal, index) in goal.subGoals"
              :key="index"
              class="subgoal-item"
            >
              <span class="subgoal-name">{{ subGoal.name }}</span>
            </div>
          </div>
        </div>

        <!-- 技术信息 - 不显眼 -->
        <div class="tech-info">
          <span class="tech-item">
            {{ goal.type === 'numeric' ? (goal.recordType === 'cumulative' ? '累计目标' : '单次目标') : '任务目标' }}
          </span>
        </div>
      </div>

      <!-- 图表区域 -->
      <div v-if="goal.records.length > 0" class="detail-section chart-section">
        <ProgressChart :goal="goal" />
      </div>

      <!-- 记录历史 -->
      <div class="detail-section">
        <h3>📝 记录历史</h3>
        <div v-if="goal.records.length === 0" class="no-records">
          <div class="no-records-icon">📋</div>
          <h4>还没有记录</h4>
          <p>点击"添加记录"按钮开始追踪您的进度吧！</p>
        </div>
        <div v-else class="records-table-container">
          <div class="records-table">
            <div class="table-header">
              <div class="table-cell date-cell">日期</div>
              <div class="table-cell value-cell">数值</div>
              <template v-if="goal.subGoals && goal.subGoals.length > 0">
                <div
                  v-for="subGoal in goal.subGoals"
                  :key="subGoal.id"
                  class="table-cell subgoal-cell"
                >
                  {{ subGoal.name }}
                </div>
              </template>
              <div class="table-cell notes-cell">备注</div>
            </div>
            <div class="table-body">
            <div
              v-for="record in sortedRecords"
              :key="record.id"
              class="table-row"
            >
              <div class="table-cell date-cell">
                <div class="date-display">{{ formatDate(record.date) }}</div>
              </div>
              <div class="table-cell value-cell">
                <div class="value-display">
                  <template v-if="goal.type === 'numeric'">
                    <span class="main-value">{{ record.value }}{{ goal.unit ? ` ${goal.unit}` : '' }}</span>
                  </template>
                  <template v-else>
                    <span class="main-value">{{ record.score }} 分</span>
                  </template>
                </div>
              </div>
              <template v-if="goal.subGoals && goal.subGoals.length > 0">
                <div
                  v-for="subGoal in goal.subGoals"
                  :key="subGoal.id"
                  class="table-cell subgoal-cell"
                >
                  <div class="subgoal-value">
                    {{ record.subGoalValues?.[subGoal.name] || '-' }}
                  </div>
                </div>
              </template>
              <div class="table-cell notes-cell">
                <div class="notes-display" :title="record.notes">
                  {{ record.notes || '-' }}
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加记录模态框 -->
    <RecordModal
      v-if="showRecordModal"
      :goal="goal"
      @close="showRecordModal = false"
      @add="handleAddRecord"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGoalsStore } from '../stores/goals'
import { logInfo } from '../utils/logger'
import type { Record as GoalRecord } from '../types'
import ProgressChart from '../components/ProgressChart.vue'
import RecordModal from '../components/RecordModal.vue'

const route = useRoute()
const router = useRouter()
const goalsStore = useGoalsStore()

const showRecordModal = ref(false)
const showSubGoals = ref(false)

const goalId = route.params.id as string
const goal = computed(() => {
  const foundGoal = goalsStore.goals.find(g => g.id === goalId)
  if (!foundGoal) {
    // 如果找不到目标，返回首页
    router.push('/')
    return null
  }
  return foundGoal
})

const sortedRecords = computed(() => {
  if (!goal.value) return []
  return [...goal.value.records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const progress = computed(() => {
  if (!goal.value) return { percentage: 0, total: 0, isFloating: false, maxValue: 0, latestValue: 0, recordCount: 0, latestScore: null }

  if (goal.value.type === 'numeric') {
    const recordType = goal.value.recordType || 'cumulative'

    if (recordType === 'target') {
      // 浮动型：显示当前最高值或最近值
      const values = goal.value.records.map(r => r.value || 0)
      const maxValue = values.length > 0 ? Math.max(...values) : 0
      const latestValue = values.length > 0 ? values[values.length - 1] : 0
      const displayValue = maxValue >= goal.value.targetValue ? maxValue : latestValue
      const percentage = Math.min((displayValue / (goal.value.targetValue || 1)) * 100, 100)
      return {
        total: displayValue,
        percentage,
        isFloating: true,
        maxValue,
        latestValue
      }
    } else {
      // 累加型：显示累计值
      const total = goal.value.records.reduce((sum, r) => sum + (r.value || 0), 0)
      const percentage = Math.min((total / (goal.value.targetValue || 1)) * 100, 100)
      return { total, percentage, isFloating: false }
    }
  } else {
    const latestRecord = goal.value.records[goal.value.records.length - 1]
    const latestScore = latestRecord?.score || null
    const targetScore = goal.value.targetScore || 100
    const percentage = latestScore !== null ? Math.min((latestScore / targetScore) * 100, 100) : 0
    return {
      latestScore,
      recordCount: goal.value.records.length,
      percentage
    }
  }
})

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleAddRecord = (record: Omit<GoalRecord, 'id' | 'date'>): void => {
  if (goal.value) {
    goalsStore.addRecord(goal.value.id, record)
    showRecordModal.value = false
    logInfo('从详情页添加记录', { goalId: goal.value.id })
  }
}

const handleDelete = (): void => {
  if (goal.value && confirm('确定要删除这个目标吗？此操作不可撤销。')) {
    goalsStore.deleteGoal(goal.value.id)
    logInfo('从详情页删除目标', { goalId: goal.value.id })
    router.push('/')
  }
}

onMounted(() => {
  if (!goal.value) {
    router.push('/')
  }
})
</script>

<style scoped>
.goal-detail-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 50%, #cbd5e1 75%, #94a3b8 100%);
  min-height: 100vh;
  box-sizing: border-box;
  width: 100%;
  overflow-x: hidden;
  animation: pageFadeIn 0.6s ease-out;
}

@keyframes pageFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.back-button-container {
  margin-bottom: 32px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.85) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: #475569;
  text-decoration: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  border: 1px solid rgba(226, 232, 240, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.back-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.05), transparent);
  transition: left 0.5s ease;
}

.back-button:hover::before {
  left: 100%;
}

.back-button:hover {
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4);
  color: #334155;
  border-color: rgba(102, 126, 234, 0.2);
}

.back-button:active {
  transform: translateY(0);
}

.back-button svg {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.back-button:hover svg {
  transform: translateX(-3px);
}

.goal-header {
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  box-sizing: border-box;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.goal-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%);
  pointer-events: none;
}

.goal-title-section {
  flex: 1;
}

.goal-category {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
}

.goal-title {
  font-size: 36px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 16px 0;
  letter-spacing: -0.025em;
}

.goal-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #6b7280;
}

.meta-item {
  display: flex;
  align-items: center;
}

.completed-status {
  color: #059669;
  font-weight: 600;
}

.goal-actions {
  display: flex;
  gap: 16px;
  flex-shrink: 0;
}

.add-record-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 16px 28px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease-out-expo;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
  position: relative;
  overflow: hidden;
}

.add-record-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}

.add-record-btn:hover::before {
  left: 100%;
}

.add-record-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 16px 28px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.2);
}

.goal-details {
  display: grid;
  gap: 32px;
  margin-top: 32px;
}

.detail-section {
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-sizing: border-box;
  width: 100%;
  overflow-x: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.detail-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.detail-section h3 {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: -0.025em;
}

.detail-section h4 {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
}

.chart-section {
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
}

.chart-section:hover {
  transform: none;
  box-shadow: none;
}

/* 完成进度 - 最显眼 */
.progress-hero {
  text-align: center;
  padding: 48px 24px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: 20px;
  margin-bottom: 32px;
  border: 2px solid rgba(102, 126, 234, 0.1);
  transition: all 0.4s ease-out-expo;
  position: relative;
  overflow: hidden;
}

.progress-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.progress-hero:hover::before {
  opacity: 1;
}

.progress-hero.completed {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.08) 100%);
  border: 2px solid rgba(16, 185, 129, 0.2);
  animation: celebrate 3s ease-in-out infinite;
}

@keyframes celebrate {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.1);
  }
  50% {
    transform: scale(1.01);
    box-shadow: 0 12px 32px rgba(16, 185, 129, 0.15);
  }
}

.progress-percentage-large {
  margin-bottom: 12px;
  line-height: 1;
}

.percentage-number {
  font-size: 72px;
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -2px;
  transition: all 0.3s ease;
}

.percentage-number.completed {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.percentage-unit {
  font-size: 36px;
  font-weight: 700;
  color: #3b82f6;
  margin-left: 4px;
  transition: color 0.3s ease;
}

.percentage-unit.completed {
  color: #10b981;
}

.progress-label-large {
  font-size: 18px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 20px;
}

.progress-bar-hero {
  height: 24px;
  background: #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  margin: 0 auto 16px;
  max-width: 600px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}

.progress-bar-fill.completed {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.5); }
  50% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.8); }
}

.progress-bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-stats-inline {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 15px;
  color: #475569;
}

.stat-inline {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-label {
  color: #64748b;
  font-weight: 500;
}

.stat-number {
  color: #1e293b;
  font-weight: 700;
}

.stat-divider {
  color: #cbd5e1;
  margin: 0 4px;
}

/* 子目标 - 可折叠 */
.subgoals-collapsible {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.subgoals-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  padding: 8px 0;
  cursor: pointer;
  color: #475569;
  font-size: 15px;
  font-weight: 600;
  transition: color 0.2s;
  width: 100%;
  text-align: left;
}

.subgoals-toggle:hover {
  color: #1e293b;
}

.subgoals-toggle-icon {
  font-size: 12px;
  transition: transform 0.3s ease;
  color: #64748b;
}

.subgoals-toggle-icon.expanded {
  transform: rotate(180deg);
}

.subgoals-list {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.subgoal-item {
  background: #f1f5f9;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;
  border: 1px solid #e2e8f0;
}

/* 技术信息 - 不显眼 */
.tech-info {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
  text-align: center;
}

.tech-item {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 400;
}

.no-records {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.no-records-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-records h4 {
  font-size: 20px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.no-records p {
  font-size: 14px;
  margin: 0;
  font-style: italic;
}

.records-table-container {
  overflow-x: auto;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.5);
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  width: 100%;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.records-table {
  min-width: 600px;
  width: 100%;
  box-sizing: border-box;
}

.table-header {
  display: flex;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 2px solid rgba(226, 232, 240, 0.5);
  font-weight: 700;
  color: #0f172a;
  font-size: 13px;
  letter-spacing: -0.01em;
}

.table-header .table-cell {
  padding: 16px 12px;
  border-right: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
}

.table-header .table-cell:last-child {
  border-right: none;
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: flex;
  border-bottom: 1px solid rgba(241, 245, 249, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.table-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.1), transparent);
  transition: width 0.3s ease;
}

.table-row:hover {
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.6) 0%, rgba(241, 245, 249, 0.6) 100%);
  transform: translateX(2px);
}

.table-row:hover::before {
  width: 3px;
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  padding: 14px 12px;
  border-right: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #374151;
}

.table-cell:last-child {
  border-right: none;
}

.date-cell {
  width: 140px;
  min-width: 140px;
  max-width: 140px;
  flex-shrink: 0;
}

.value-cell {
  width: 100px;
  min-width: 100px;
  max-width: 100px;
  flex-shrink: 0;
}

.subgoal-cell {
  width: 80px;
  min-width: 80px;
  max-width: 80px;
  justify-content: center;
  flex-shrink: 0;
}

.notes-cell {
  flex: 1;
  min-width: 150px;
  max-width: none;
}

.date-display {
  font-weight: 500;
  color: #111827;
}

.value-display {
  text-align: center;
  width: 100%;
}

.main-value {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.subgoal-value {
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  width: 100%;
}

.notes-display {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}

@media (max-width: 768px) {
  .goal-detail-page {
    padding: 16px;
  }

  .goal-header {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }

  .goal-title {
    font-size: 24px;
  }

  .goal-actions {
    width: 100%;
    flex-direction: column;
  }

  .add-record-btn,
  .delete-btn {
    width: 100%;
  }

  .detail-section {
    padding: 20px;
  }

  .progress-hero {
    padding: 24px 16px;
  }

  .percentage-number {
    font-size: 56px;
  }

  .percentage-unit {
    font-size: 28px;
  }

  .progress-bar-hero {
    height: 20px;
    max-width: 100%;
  }

  .progress-stats-inline {
    font-size: 12px;
    gap: 6px;
    flex-direction: column;
  }

  .stat-divider {
    display: none;
  }

  .subgoals-collapsible {
    margin-top: 20px;
    padding-top: 20px;
  }

  .records-table-container {
    border-radius: 8px;
    margin: 0 -4px;
  }

  .records-table {
    min-width: 500px;
  }

  .table-header .table-cell {
    padding: 10px 8px;
    font-size: 12px;
  }

  .table-cell {
    padding: 10px 8px;
    font-size: 12px;
    min-height: 40px;
  }

  .date-cell {
    width: 100px;
    min-width: 100px;
    max-width: 100px;
  }

  .value-cell {
    width: 80px;
    min-width: 80px;
    max-width: 80px;
  }

  .subgoal-cell {
    width: 60px;
    min-width: 60px;
    max-width: 60px;
  }

  .notes-cell {
    min-width: 120px;
  }

  .main-value {
    font-size: 13px;
  }

  .subgoal-value {
    font-size: 11px;
  }

  .notes-display {
    font-size: 11px;
  }
}
</style>
