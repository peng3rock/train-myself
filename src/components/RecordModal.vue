<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>添加记录 - {{ goal.name }}</h2>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-form">
        <div v-if="goal.type === 'numeric'" class="form-group">
          <label>今日练习数值</label>
          <input
            type="number"
            v-model.number="value"
            :placeholder="`例如：10 ${goal.unit || ''}`"
            min="0"
            step="0.1"
            required
            autofocus
          />
        </div>
        <div v-else class="form-group">
          <label>测验分数</label>
          <input
            type="number"
            v-model.number="score"
            :placeholder="`满分：${goal.targetScore}`"
            min="0"
            :max="goal.targetScore"
            required
            autofocus
          />
        </div>

        <!-- 子目标输入 -->
        <div v-if="goal.subGoals && goal.subGoals.length > 0" class="form-group">
          <label>子目标数值</label>
          <div class="subgoals-input-container">
            <div
              v-for="(subGoal, index) in goal.subGoals"
              :key="index"
              class="subgoal-input-item"
            >
              <label class="subgoal-label">{{ subGoal.name }}：</label>
              <input
                type="number"
                v-model.number="subGoalValues[index]"
                :placeholder="goal.type === 'numeric' ? `数值` : `分数`"
                :min="0"
                :max="goal.type === 'task' ? goal.targetScore : undefined"
                step="0.1"
                class="subgoal-value-input"
              />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>备注（可选）</label>
          <textarea
            v-model="notes"
            placeholder="记录一些心得体会..."
            rows="3"
          />
        </div>

        <div class="modal-actions">
          <button type="button" class="cancel-button" @click="$emit('close')">
            取消
          </button>
          <button type="submit" class="submit-button">
            添加记录
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Goal, Record } from '../types'

const props = defineProps<{
  goal: Goal
}>()

const emit = defineEmits<{
  'close': []
  'add': [record: Omit<Record, 'id' | 'date'>]
}>()

const value = ref<number | string>('')
const score = ref<number | string>('')
const notes = ref('')
const subGoalValues = ref<(number | string)[]>([])

// 初始化子目标数值数组
watch(() => props.goal.subGoals, (subGoals) => {
  if (subGoals && subGoals.length > 0) {
    subGoalValues.value = new Array(subGoals.length).fill('')
  } else {
    subGoalValues.value = []
  }
}, { immediate: true })

const handleSubmit = (): void => {
  if (props.goal.type === 'numeric') {
    if (!value.value || Number(value.value) <= 0) {
      alert('请输入有效的数值')
      return
    }
    const record: Omit<Record, 'id' | 'date'> = {
      value: Number(value.value),
      notes: notes.value.trim()
    }

    // 添加子目标数据
    if (props.goal.subGoals && props.goal.subGoals.length > 0) {
      record.subGoalValues = {}
      props.goal.subGoals.forEach((subGoal, index) => {
        if (subGoalValues.value[index] !== '' && subGoalValues.value[index] !== null) {
          record.subGoalValues![subGoal.name] = Number(subGoalValues.value[index])
        }
      })
    }

    emit('add', record)
  } else {
    if (score.value === '' || Number(score.value) < 0) {
      alert('请输入有效的分数')
      return
    }
    const record: Omit<Record, 'id' | 'date'> = {
      score: Number(score.value),
      notes: notes.value.trim()
    }

    // 添加子目标数据
    if (props.goal.subGoals && props.goal.subGoals.length > 0) {
      record.subGoalValues = {}
      props.goal.subGoals.forEach((subGoal, index) => {
        if (subGoalValues.value[index] !== '' && subGoalValues.value[index] !== null) {
          record.subGoalValues![subGoal.name] = Number(subGoalValues.value[index])
        }
      })
    }

    emit('add', record)
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s, color 0.2s;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #333;
}

.modal-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
}

.subgoals-input-container {
  margin-top: 8px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.subgoal-input-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.subgoal-input-item:last-child {
  margin-bottom: 0;
}

.subgoal-label {
  min-width: 80px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin: 0;
}

.subgoal-value-input {
  flex: 1;
  padding: 10px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
}

.subgoal-value-input:focus {
  outline: none;
  border-color: #667eea;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.cancel-button,
.submit-button {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: none;
}

.cancel-button {
  background: #f3f4f6;
  color: #333;
}

.cancel-button:hover {
  background: #e5e7eb;
}

.submit-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
}

.submit-button:active {
  transform: translateY(0);
}
</style>
