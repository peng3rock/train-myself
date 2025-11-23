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
        <template v-else>
          <div class="form-group">
            <label>目标分数</label>
            <input
              type="number"
              v-model.number="formData.targetScore"
              placeholder="例如：100"
              min="1"
              required
            />
          </div>
        </template>

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

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['close', 'add'])

const formData = ref({
  name: '',
  recordType: 'target', // 'target' | 'cumulative'
  targetValue: '',
  unit: '',
  hasSubGoals: false,
  subGoals: [{ name: '' }],
  category: '',
  customCategory: ''
})

const addSubGoal = () => {
  formData.value.subGoals.push({ name: '' })
}

const removeSubGoal = (index) => {
  formData.value.subGoals.splice(index, 1)
}

// 计算最终的分类标签
const finalCategory = computed(() => {
  return formData.value.customCategory.trim() || formData.value.category || '✨ 其他'
})

const handleSubmit = () => {
  if (!formData.value.name.trim()) {
    alert('请输入目标名称')
    return
  }

  const goalData = {
    name: formData.value.name.trim(),
    category: finalCategory.value,
    type: 'numeric',
    recordType: formData.value.recordType,
    targetValue: Number(formData.value.targetValue),
    unit: formData.value.unit.trim()
  }

  if (!formData.value.targetValue || formData.value.targetValue <= 0) {
    alert('请输入有效的目标数值')
    return
  }

  if (!formData.value.unit.trim()) {
    alert('请输入单位')
    return
  }

  if (formData.value.hasSubGoals) {
    const validSubGoals = formData.value.subGoals
      .filter(sg => sg.name.trim())
      .map(sg => ({ name: sg.name.trim() }))
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

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: border-color 0.2s, background 0.2s;
}

.radio-label:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.radio-label input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.radio-label span {
  flex: 1;
  font-size: 14px;
  color: #333;
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

.subgoals-container {
  margin-top: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.subgoal-item {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: center;
}

.subgoal-item:last-of-type {
  margin-bottom: 0;
}

.subgoal-input {
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
}

.subgoal-input:focus {
  outline: none;
  border-color: #667eea;
}

.remove-subgoal-btn {
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.remove-subgoal-btn:hover {
  background: #dc2626;
}

.add-subgoal-btn {
  width: 100%;
  padding: 8px;
  background: #f3f4f6;
  color: #333;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 8px;
}

.add-subgoal-btn:hover {
  background: #e5e7eb;
}
</style>

