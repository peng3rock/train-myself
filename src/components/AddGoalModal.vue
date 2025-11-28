<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>添加新目标</h2>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label>目标名称</label>
          <input
            type="text"
            v-model="formData.name"
            placeholder="例如：每天跑步、练习编程等"
            required
          />
        </div>

        <div class="form-group">
          <label>项目标签</label>
          <select v-model="formData.category" class="category-select">
            <option value="">选择项目类型...</option>
            <option value="🎸 音乐">🎸 音乐</option>
            <option value="🏃 运动">🏃 运动</option>
            <option value="💻 编程">💻 编程</option>
            <option value="📚 学习">📚 学习</option>
            <option value="🎨 艺术">🎨 艺术</option>
            <option value="🗣️ 语言">🗣️ 语言</option>
            <option value="⚽ 爱好">⚽ 爱好</option>
            <option value="✨ 其他">✨ 其他</option>
          </select>
          <input
            type="text"
            v-model="formData.customCategory"
            placeholder="或输入自定义标签..."
            class="custom-category-input"
          />
        </div>

        <div class="form-group">
          <label>记录类型</label>
          <div class="radio-group">
            <label class="radio-label">
              <input
                type="radio"
                value="target"
                v-model="formData.recordType"
              />
              <span>🎯 目标值型（练琴速度等，每天记录一个目标值）</span>
            </label>
            <label class="radio-label">
              <input
                type="radio"
                value="cumulative"
                v-model="formData.recordType"
              />
              <span>📊 累加型（游泳距离等，每天累加记录总值）</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>目标数值</label>
          <input
            type="number"
            v-model.number="formData.targetValue"
            :placeholder="formData.recordType === 'target' ? '例如：130' : '例如：1000'"
            min="1"
            required
          />
        </div>
        <div class="form-group">
          <label>单位</label>
          <input
            type="text"
            v-model="formData.unit"
            :placeholder="formData.recordType === 'target' ? '例如：bpm' : '例如：米'"
            required
          />
        </div>

        <div class="form-group">
          <label class="subgoals-toggle">
            <input
              type="checkbox"
              v-model="formData.hasSubGoals"
            />
            <span class="checkbox-text">添加子目标</span>
            <span class="checkbox-desc">（如练习的不同部分：速度、准确性等）</span>
          </label>
          <div v-if="formData.hasSubGoals" class="subgoals-container">
            <p class="subgoals-description">
              为每个子目标单独记录数值，可以生成独立的进度曲线图
            </p>
            <div
              v-for="(subGoal, index) in formData.subGoals"
              :key="index"
              class="subgoal-item"
            >
              <input
                type="text"
                v-model="subGoal.name"
                :placeholder="`子目标 ${index + 1} 名称，例如：速度、准确性、技巧`"
                class="subgoal-input"
              />
              <button
                type="button"
                @click="removeSubGoal(index)"
                class="remove-subgoal-btn"
                v-if="formData.subGoals.length > 1"
              >
                删除
              </button>
            </div>
            <button
              type="button"
              @click="addSubGoal"
              class="add-subgoal-btn"
            >
              + 添加子目标
            </button>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="cancel-button" @click="$emit('close')">
            取消
          </button>
          <button type="submit" class="submit-button">
            创建目标
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Goal, SubGoal } from '../types'

const emit = defineEmits<{
  'close': []
  'add': [goal: Omit<Goal, 'id' | 'createdAt' | 'records' | 'completed'>]
}>()

interface FormData {
  name: string
  recordType: 'target' | 'cumulative'
  targetValue: number | string
  unit: string
  hasSubGoals: boolean
  subGoals: Array<{ name: string }>
  category: string
  customCategory: string
}

const formData = ref<FormData>({
  name: '',
  recordType: 'target',
  targetValue: '',
  unit: '',
  hasSubGoals: false,
  subGoals: [{ name: '' }],
  category: '',
  customCategory: ''
})

const addSubGoal = (): void => {
  formData.value.subGoals.push({ name: '' })
}

const removeSubGoal = (index: number): void => {
  formData.value.subGoals.splice(index, 1)
}

// 计算最终的分类标签
const finalCategory = computed(() => {
  return formData.value.customCategory.trim() || formData.value.category || '✨ 其他'
})

const handleSubmit = (): void => {
  if (!formData.value.name.trim()) {
    alert('请输入目标名称')
    return
  }

  const goalData: Omit<Goal, 'id' | 'createdAt' | 'records' | 'completed'> = {
    name: formData.value.name.trim(),
    category: finalCategory.value,
    type: 'numeric',
    recordType: formData.value.recordType,
    targetValue: Number(formData.value.targetValue),
    unit: formData.value.unit.trim()
  }

  if (!formData.value.targetValue || Number(formData.value.targetValue) <= 0) {
    alert('请输入有效的目标数值')
    return
  }

  if (!formData.value.unit.trim()) {
    alert('请输入单位')
    return
  }

  if (formData.value.hasSubGoals) {
    const validSubGoals: SubGoal[] = formData.value.subGoals
      .filter(sg => sg.name.trim())
      .map((sg, index) => ({
        id: index.toString(),
        name: sg.name.trim()
      }))
    if (validSubGoals.length > 0) {
      goalData.subGoals = validSubGoals
    }
  }

  emit('add', goalData)
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
  max-width: 520px;
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

/* 滚动条样式 */
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
  font-size: 24px;
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
}

.modal-close::before {
  content: '×';
  font-size: 20px;
  font-weight: 300;
  line-height: 1;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.15);
  transform: scale(1.05);
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
.form-group select,
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
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.form-group select {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364758b' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 14px center;
  background-repeat: no-repeat;
  background-size: 18px;
  padding-right: 44px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  padding: 16px;
  background: rgba(255, 255, 255, 0.6);
  border: 2px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.radio-label::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.radio-label:hover {
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.08);
}

.radio-label:hover::before {
  opacity: 1;
}

.radio-label input[type="radio"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin-top: 2px;
  accent-color: #667eea;
}

.radio-label span {
  flex: 1;
  font-size: 14px;
  color: #374151;
  line-height: 1.4;
}

.subgoals-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 12px 16px;
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.subgoals-toggle:hover {
  background: rgba(102, 126, 234, 0.08);
}

.subgoals-toggle input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #667eea;
}

.checkbox-text {
  font-weight: 600;
  color: #374151;
}

.checkbox-desc {
  color: #6b7280;
  font-size: 13px;
  font-weight: 400;
}

.subgoals-container {
  margin-top: 16px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%);
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.subgoals-description {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 16px;
  line-height: 1.4;
}

.subgoal-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  align-items: center;
}

.subgoal-item:last-of-type {
  margin-bottom: 0;
}

.subgoal-label {
  min-width: 100px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.subgoal-input {
  flex: 1;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(226, 232, 240, 0.8);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.subgoal-input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.remove-subgoal-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.2);
}

.remove-subgoal-btn:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
}

.add-subgoal-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.8);
  color: #667eea;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 12px;
}

.add-subgoal-btn::before {
  content: '+';
  font-size: 16px;
  font-weight: 400;
}

.add-subgoal-btn:hover {
  background: rgba(102, 126, 234, 0.05);
  border-color: rgba(102, 126, 234, 0.4);
  transform: translateY(-1px);
}

.custom-category-input {
  margin-top: 8px;
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

