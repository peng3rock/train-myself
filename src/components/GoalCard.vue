<template>
  <div :class="['goal-card', { completed: goal.completed }]">
    <div class="goal-card-header">
      <div class="goal-title-section">
        <span class="goal-category">{{ goal.category || '✨ 其他' }}</span>
        <h3 class="goal-title">{{ goal.name }}</h3>
      </div>
      <div class="goal-header-actions">
        <span v-if="goal.completed" class="completed-badge">已完成</span>
        <button
          class="delete-button"
          @click="$emit('delete', goal.id)"
          title="删除目标"
        >
          ×
        </button>
      </div>
    </div>
    
    <div class="goal-info">
      <template v-if="goal.type === 'numeric'">
        <div class="progress-info">
          <span class="progress-label">
            {{ progress.isFloating ? '当前值' : '累计值' }}：
          </span>
          <span class="progress-value">
            {{ progress.total }} / {{ goal.targetValue }} {{ goal.unit || '' }}
          </span>
        </div>
        <div v-if="progress.isFloating && progress.maxValue !== progress.latestValue" class="progress-info-secondary">
          <span class="progress-label-small">最高值：{{ progress.maxValue }} {{ goal.unit || '' }}</span>
        </div>
        <div class="progress-bar-container">
          <div 
            class="progress-bar"
            :style="{ width: `${progress.percentage}%` }"
          />
        </div>
      </template>
      <template v-else>
        <div class="task-info">
          <div class="info-row">
            <span>测验次数：</span>
            <span class="info-value">{{ progress.recordCount }}</span>
          </div>
          <div v-if="progress.latestScore !== null" class="info-row">
            <span>最近分数：</span>
            <span class="info-value">{{ progress.latestScore }} / {{ goal.targetScore }}</span>
          </div>
        </div>
      </template>
    </div>

    <div class="goal-meta">
      <span class="meta-text">创建于：{{ formatDate(goal.createdAt) }}</span>
      <span class="meta-text">记录数：{{ goal.records.length }}</span>
    </div>

    <!-- 子目标显示 -->
    <div v-if="goal.subGoals && goal.subGoals.length > 0" class="subgoals-display">
      <div class="subgoals-title">子目标：</div>
      <div class="subgoals-list">
        <span
          v-for="(subGoal, index) in goal.subGoals"
          :key="index"
          class="subgoal-tag"
        >
          {{ subGoal.name }}
        </span>
      </div>
    </div>

    <!-- 统计图表 -->
    <ProgressChart
      v-if="goal.records && goal.records.length > 0"
      :goal="goal"
    />

    <button 
      class="record-button"
      @click="showRecordModal = true"
    >
      添加记录
    </button>
  </div>

  <RecordModal
    v-if="showRecordModal"
    :goal="goal"
    @close="showRecordModal = false"
    @add="handleAddRecord"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import RecordModal from './RecordModal.vue'
import ProgressChart from './ProgressChart.vue'

const props = defineProps({
  goal: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete', 'add-record'])

const showRecordModal = ref(false)

const progress = computed(() => {
  if (props.goal.type === 'numeric') {
    const recordType = props.goal.recordType || 'cumulative'

    if (recordType === 'target') {
      // 浮动型：显示当前最高值或最近值
      const values = props.goal.records.map(r => r.value || 0)
      const maxValue = values.length > 0 ? Math.max(...values) : 0
      const latestValue = values.length > 0 ? values[values.length - 1] : 0
      const displayValue = maxValue >= props.goal.targetValue ? maxValue : latestValue
      const percentage = Math.min((displayValue / props.goal.targetValue) * 100, 100)
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
      const percentage = Math.min((total / props.goal.targetValue) * 100, 100)
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

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const handleAddRecord = (record) => {
  emit('add-record', { goalId: props.goal.id, record })
  showRecordModal.value = false
}
</script>

<style scoped>
.goal-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.goal-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.goal-card.completed {
  border: 2px solid #10b981;
  background: linear-gradient(to bottom, #ffffff 0%, #f0fdf4 100%);
}

.goal-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.goal-title-section {
  flex: 1;
  min-width: 0;
}

.goal-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.goal-category {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 6px;
}

.goal-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.completed-badge {
  background: #10b981;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.delete-button {
  background: #ef4444;
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

.delete-button:hover {
  background: #dc2626;
}

.goal-info {
  margin-bottom: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.progress-label {
  color: #666;
}

.progress-value {
  font-weight: 600;
  color: #333;
}

.progress-bar-container {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
}

.info-value {
  font-weight: 600;
  color: #333;
}

.progress-info-secondary {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.progress-label-small {
  font-size: 12px;
}

.goal-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  font-size: 12px;
  color: #999;
}

.record-button {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.record-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
}

.record-button:active {
  transform: translateY(0);
}

.subgoals-display {
  margin-bottom: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.subgoals-title {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
}

.subgoals-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.subgoal-tag {
  padding: 4px 12px;
  background: white;
  border: 1px solid #667eea;
  border-radius: 12px;
  font-size: 12px;
  color: #667eea;
  font-weight: 500;
}
</style>

