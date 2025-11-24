<template>
  <div class="goal-detail-page" v-if="goal">
    <!-- 返回按钮 -->
    <div class="back-button-container">
      <router-link to="/" class="back-button">
        ← 返回首页
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
      <div class="detail-section">
        <h3>目标详情</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <label>目标类型：</label>
            <span>{{ goal.type === 'numeric' ? '数值型' : '任务型' }}</span>
          </div>
          <div class="detail-item">
            <label>记录类型：</label>
            <span>{{ goal.recordType === 'cumulative' ? '累加型' : '浮动型' }}</span>
          </div>
          <div v-if="goal.type === 'numeric'" class="detail-item">
            <label>目标值：</label>
            <span>{{ goal.targetValue }} {{ goal.unit || '' }}</span>
          </div>
          <div v-else class="detail-item">
            <label>目标分数：</label>
            <span>{{ goal.targetScore }}</span>
          </div>
        </div>

        <!-- 子目标显示 -->
        <div v-if="goal.subGoals && goal.subGoals.length > 0" class="subgoals-section">
          <h4>子目标</h4>
          <div class="subgoals-list">
            <div
              v-for="(subGoal, index) in goal.subGoals"
              :key="index"
              class="subgoal-item"
            >
              <span class="subgoal-name">{{ subGoal.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 进度统计 -->
      <div class="detail-section">
        <h3>进度统计</h3>
        <div class="progress-stats">
          <template v-if="goal.type === 'numeric'">
            <div class="stat-item">
              <label>{{ progress.isFloating ? '当前值' : '累计值' }}：</label>
              <span class="stat-value">{{ progress.total }} {{ goal.unit || '' }}</span>
            </div>
            <div v-if="progress.isFloating" class="stat-item">
              <label>最高值：</label>
              <span class="stat-value">{{ progress.maxValue }} {{ goal.unit || '' }}</span>
            </div>
            <div class="stat-item">
              <label>目标值：</label>
              <span class="stat-value">{{ goal.targetValue }} {{ goal.unit || '' }}</span>
            </div>
            <div class="stat-item">
              <label>完成进度：</label>
              <span class="stat-value">{{ Math.round(progress.percentage) }}%</span>
            </div>
          </template>
          <template v-else>
            <div class="stat-item">
              <label>测验次数：</label>
              <span class="stat-value">{{ progress.recordCount }}</span>
            </div>
            <div v-if="progress.latestScore !== null" class="stat-item">
              <label>最近分数：</label>
              <span class="stat-value">{{ progress.latestScore }} / {{ goal.targetScore }}</span>
            </div>
            <div class="stat-item">
              <label>目标分数：</label>
              <span class="stat-value">{{ goal.targetScore }}</span>
            </div>
          </template>
        </div>

        <!-- 进度条 -->
        <div class="progress-visual">
          <div class="progress-bar-container">
            <div
              class="progress-bar"
              :style="{ width: `${progress.percentage}%` }"
            />
          </div>
          <div class="progress-text">
            {{ Math.round(progress.percentage) }}% 完成
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div v-if="goal.records.length > 0" class="detail-section">
        <h3>📊 进度图表</h3>
        <div class="chart-container">
          <ProgressChart :goal="goal" />
        </div>
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
    return {
      latestScore: latestRecord?.score || null,
      recordCount: goal.value.records.length
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
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
}

.back-button-container {
  margin-bottom: 20px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f3f4f6;
  color: #374151;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background 0.2s;
}

.back-button:hover {
  background: #e5e7eb;
}

.goal-header {
  background: white;
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
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
  gap: 12px;
}

.add-record-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.add-record-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.delete-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.delete-btn:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

.goal-details {
  display: grid;
  gap: 24px;
  margin-top: 24px;
}

.detail-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.detail-section h3 {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item label {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
}

.detail-item span {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.subgoals-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.subgoals-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.subgoal-item {
  background: #f3f4f6;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.stat-item label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.progress-visual {
  margin-top: 20px;
}

.progress-bar-container {
  height: 16px;
  background: #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-text {
  text-align: center;
  font-size: 15px;
  color: #475569;
  font-weight: 600;
  background: #f8fafc;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  display: inline-block;
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
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: white;
}

.records-table {
  min-width: 800px;
}

.table-header {
  display: flex;
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
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
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
}

.table-row:hover {
  background: #f9fafb;
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
  width: 120px;
  min-width: 120px;
}

.value-cell {
  width: 120px;
  min-width: 120px;
}

.subgoal-cell {
  width: 100px;
  min-width: 100px;
  justify-content: center;
}

.notes-cell {
  flex: 1;
  min-width: 200px;
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
}

@media (max-width: 768px) {
  .goal-header {
    flex-direction: column;
    gap: 16px;
  }

  .goal-title {
    font-size: 24px;
  }

  .goal-actions {
    width: 100%;
  }

  .add-record-btn,
  .delete-btn {
    flex: 1;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .progress-stats {
    grid-template-columns: 1fr;
  }

  .record-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .record-values {
    align-items: flex-start;
  }

  .records-table-container {
    border-radius: 8px;
  }

  .table-header .table-cell {
    padding: 12px 8px;
    font-size: 12px;
  }

  .table-cell {
    padding: 10px 8px;
    font-size: 13px;
    min-height: 40px;
  }

  .main-value {
    font-size: 14px;
  }

  .subgoal-value {
    font-size: 12px;
    padding: 3px 6px;
  }

  .notes-display {
    font-size: 12px;
    max-width: 200px;
  }
}
</style>
