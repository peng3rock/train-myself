<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>添加记录 - {{ goal.name }}</h2>
        <button class="modal-close" @click="$emit('close')" aria-label="关闭">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
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
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  animation: overlayFadeIn 0.3s ease-out;
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 24px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-content::-webkit-scrollbar {
  width: 4px;
}

.modal-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 2px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 32px 20px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  position: relative;
}

.modal-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  opacity: 0.6;
}

.modal-header h2 {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.025em;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  padding: 0;
}

.modal-close svg {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}


.modal-close:hover {
  background: rgba(239, 68, 68, 0.15);
  transform: scale(1.05);
}

.modal-close:hover svg {
  transform: rotate(90deg);
}

.modal-form {
  padding: 32px;
  padding-top: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
  letter-spacing: -0.01em;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group textarea {
  width: 100%;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  font-family: inherit;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.subgoals-input-container {
  margin-top: 16px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%);
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.subgoal-input-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.subgoal-input-item:last-child {
  margin-bottom: 0;
}

.subgoal-label {
  min-width: 100px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.subgoal-value-input {
  flex: 1;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(226, 232, 240, 0.8);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.subgoal-value-input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modal-actions {
  display: flex;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(226, 232, 240, 0.5);
}

.cancel-button,
.submit-button {
  flex: 1;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  position: relative;
  overflow: hidden;
}

.cancel-button {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  border: 1px solid rgba(107, 114, 128, 0.2);
}

.cancel-button:hover {
  background: rgba(107, 114, 128, 0.15);
  transform: translateY(-1px);
}

.submit-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.submit-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}

.submit-button:hover::before {
  left: 100%;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.submit-button:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 640px) {
  .modal-content {
    margin: 8px;
    max-width: none;
    border-radius: 20px;
  }

  .modal-header {
    padding: 24px 20px 16px;
  }

  .modal-header h2 {
    font-size: 20px;
  }

  .modal-form {
    padding: 24px 20px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .cancel-button,
  .submit-button {
    width: 100%;
  }
}
</style>
