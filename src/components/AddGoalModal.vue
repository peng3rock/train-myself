<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>添加新目标</h2>
        <button class="modal-close" @click="$emit('close')" aria-label="关闭">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- 步骤指示器 -->
      <div class="step-indicator">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="step-item"
          :class="{ 
            'active': currentStep === index,
            'completed': currentStep > index
          }"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-label">{{ step.label }}</div>
        </div>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-form">
        <!-- 步骤1: 目标名称和标签 -->
        <transition name="step-fade" mode="out-in">
          <div v-if="currentStep === 0" key="step1" class="step-content">
            <div class="step-header">
              <h3 class="step-title">为你的目标起个名字</h3>
              <p class="step-description">给目标起一个清晰的名字，方便你识别和追踪</p>
            </div>
            <div class="form-group">
              <label>目标名称</label>
              <input
                type="text"
                v-model="formData.name"
                placeholder="例如：每天跑步、练习编程等"
                class="name-input"
                required
                autofocus
              />
            </div>
            <div class="form-group">
              <label>项目标签</label>
              <div class="category-selector-wrapper">
                <button
                  type="button"
                  class="category-selector-btn"
                  :class="{ 'has-category': categoryInputValue }"
                  @click="toggleCategoryPanel"
                >
                  <span class="category-display" v-if="categoryInputValue">{{ categoryInputValue }}</span>
                  <span class="category-placeholder" v-else>选择标签</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="category-arrow">
                    <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-7 7a2 2 0 0 1-2.828 0l-7-7A1.994 1.994 0 0 1 3 12V7a4 4 0 0 1 4-4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <transition name="category-panel">
                  <div v-if="showCategoryPanel" class="category-panel" @click.stop>
                    <div class="category-presets">
                      <button
                        type="button"
                        v-for="preset in categoryPresets"
                        :key="preset"
                        class="category-preset-btn"
                        :class="{ active: categoryInputValue === preset }"
                        @click="selectCategory(preset)"
                      >
                        {{ preset }}
                      </button>
                    </div>
                    <div class="category-custom-section">
                      <input
                        type="text"
                        v-model="categoryInputValue"
                        placeholder="输入自定义标签"
                        class="category-custom-input"
                        @input="handleCategoryInput"
                        @keyup.enter="handleCategoryBlur"
                      />
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>

          <!-- 步骤2: 记录类型 -->
          <div v-else-if="currentStep === 1" key="step2" class="step-content">
            <div class="step-header">
              <h3 class="step-title">选择记录类型</h3>
              <p class="step-description">根据你的目标特点，选择最适合的记录方式</p>
            </div>
            <div class="form-group">
              <div class="radio-group">
                <label class="radio-label" @click="formData.recordType = 'target'">
                  <input
                    type="radio"
                    value="target"
                    v-model="formData.recordType"
                  />
                  <div class="radio-content">
                    <div class="radio-icon">🎯</div>
                    <div class="radio-text">
                      <div class="radio-title">目标值型</div>
                      <div class="radio-desc">每天记录一个目标值，如练琴速度、测验分数等</div>
                    </div>
                  </div>
                </label>
                <label class="radio-label" @click="formData.recordType = 'cumulative'">
                  <input
                    type="radio"
                    value="cumulative"
                    v-model="formData.recordType"
                  />
                  <div class="radio-content">
                    <div class="radio-icon">📊</div>
                    <div class="radio-text">
                      <div class="radio-title">累加型</div>
                      <div class="radio-desc">每天累加记录总值，如跑步距离、学习时长等</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- 步骤3: 目标数值和单位 -->
          <div v-else-if="currentStep === 2" key="step3" class="step-content">
            <div class="step-header">
              <h3 class="step-title">设定目标数值</h3>
              <p class="step-description">设置你想要达到的目标数值和单位</p>
            </div>
            <div class="form-group">
              <label>目标数值</label>
              <input
                type="number"
                v-model.number="formData.targetValue"
                :placeholder="formData.recordType === 'target' ? '例如：130' : '例如：1000'"
                min="1"
                step="0.01"
                class="value-input"
                required
                autofocus
              />
            </div>
            <div class="form-group">
              <label>单位</label>
              <div class="unit-wrapper">
                <select
                  v-model="formData.unit"
                  class="unit-select"
                  @change="handleUnitChange"
                >
                  <option value="">选择单位（可选）</option>
                  <optgroup v-if="formData.recordType === 'target'" label="速度/频率">
                    <option value="bpm">bpm</option>
                    <option value="次/分钟">次/分钟</option>
                    <option value="次/秒">次/秒</option>
                    <option value="km/h">km/h</option>
                    <option value="m/s">m/s</option>
                  </optgroup>
                  <optgroup v-if="formData.recordType === 'target'" label="分数/等级">
                    <option value="分">分</option>
                    <option value="级">级</option>
                    <option value="段">段</option>
                  </optgroup>
                  <optgroup v-if="formData.recordType === 'cumulative'" label="距离">
                    <option value="米">米</option>
                    <option value="公里">公里</option>
                    <option value="千米">千米</option>
                    <option value="km">km</option>
                  </optgroup>
                  <optgroup v-if="formData.recordType === 'cumulative'" label="重量">
                    <option value="克">克</option>
                    <option value="千克">千克</option>
                    <option value="公斤">公斤</option>
                    <option value="kg">kg</option>
                  </optgroup>
                  <optgroup v-if="formData.recordType === 'cumulative'" label="时间">
                    <option value="分钟">分钟</option>
                    <option value="小时">小时</option>
                    <option value="天">天</option>
                  </optgroup>
                  <optgroup label="其他">
                    <option value="次">次</option>
                    <option value="个">个</option>
                    <option value="页">页</option>
                    <option value="题">题</option>
                  </optgroup>
                  <option value="__custom__">自定义</option>
                </select>
                <input
                  v-if="isCustomUnit"
                  type="text"
                  v-model="customUnitValue"
                  placeholder="输入自定义单位"
                  class="custom-unit-input"
                  @input="handleCustomUnitInput"
                  @blur="handleCustomUnitBlur"
                />
              </div>
            </div>
          </div>

          <!-- 步骤4: 目标期限 -->
          <div v-else-if="currentStep === 3" key="step4" class="step-content">
            <div class="step-header">
              <h3 class="step-title">设置目标期限</h3>
              <p class="step-description">为你的目标设定一个截止日期，帮助保持动力</p>
            </div>
            <div class="form-group">
              <label class="deadline-label">目标期限</label>
              <div class="deadline-wrapper">
                  <div class="deadline-picker-container">
                    <div class="date-picker-wrapper">
                      <DatePicker
                        v-model="formData.deadline"
                        :min-date="minDate"
                        :dark="false"
                        :auto-apply="false"
                        :close-on-scroll="true"
                        :enable-time-picker="false"
                        :format="'yyyy-MM-dd'"
                        :text-input="false"
                        :clearable="false"
                        placeholder="选择日期"
                        class="custom-datepicker"
                        @update:model-value="onDateChange"
                      >
                        <template #trigger>
                          <div class="deadline-card" :class="countdownStatusClass">
                            <div class="deadline-card-content">
                              <div class="countdown-time">
                                <span class="countdown-number">{{ String(countdownDisplay.days).padStart(2, '0') }}</span>
                                <span class="countdown-unit">天</span>
                                <span class="countdown-separator">:</span>
                                <span class="countdown-number">{{ String(countdownDisplay.hours).padStart(2, '0') }}</span>
                                <span class="countdown-unit">时</span>
                                <span class="countdown-separator">:</span>
                                <span class="countdown-number">{{ String(countdownDisplay.minutes).padStart(2, '0') }}</span>
                                <span class="countdown-unit">分</span>
                                <span class="countdown-separator">:</span>
                                <span class="countdown-number">{{ String(countdownDisplay.seconds).padStart(2, '0') }}</span>
                                <span class="countdown-unit">秒</span>
                              </div>
                              <div class="date-info">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="date-icon">
                                  <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span class="date-text">{{ formattedDate }}</span>
                              </div>
                            </div>
                          </div>
                        </template>
                      </DatePicker>
                    </div>
                  </div>
                  <div class="deadline-presets">
                    <button
                      type="button"
                      v-for="option in quickOptions"
                      :key="option.days"
                      class="preset-btn"
                      :class="{ active: isPresetActive(option.days) }"
                      @click="setPresetDate(option.days)"
                    >
                      {{ option.label }}
                    </button>
                  </div>
                </div>
            </div>
          </div>

          <!-- 步骤5: 汇总确认 -->
          <div v-else-if="currentStep === 4" key="step5" class="step-content summary-step">
            <div class="step-header">
              <h3 class="step-title">确认信息</h3>
              <p class="step-description">请确认以下信息，确认无误后点击创建</p>
            </div>
            <div class="summary-content">
              <div class="summary-item">
                <div class="summary-label">目标名称</div>
                <div class="summary-value">{{ formData.name || '未填写' }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">项目标签</div>
                <div class="summary-value">{{ finalCategory }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">记录类型</div>
                <div class="summary-value">{{ formData.recordType === 'target' ? '🎯 目标值型' : '📊 累加型' }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">目标数值</div>
                <div class="summary-value">{{ formData.targetValue }} {{ formData.unit || '（无单位）' }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">目标期限</div>
                <div class="summary-value">{{ formattedDate }}</div>
              </div>
            </div>
          </div>
        </transition>

        <div class="modal-actions">
          <button 
            type="button" 
            class="step-button step-back" 
            @click="prevStep"
            v-if="currentStep > 0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            返回
          </button>
          <button 
            type="button" 
            class="step-button step-next" 
            @click="nextStep"
            v-if="currentStep < steps.length - 1"
          >
            继续
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button 
            type="submit" 
            class="step-button step-submit"
            v-if="currentStep === steps.length - 1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            创建目标
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { Goal, SubGoal } from '../types'
import { VueDatePicker as DatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const emit = defineEmits<{
  'close': []
  'add': [goal: Omit<Goal, 'id' | 'createdAt' | 'records' | 'completed'>]
}>()

// 步骤管理
const steps = [
  { label: '名称', key: 'name' },
  { label: '类型', key: 'type' },
  { label: '数值', key: 'value' },
  { label: '期限', key: 'deadline' },
  { label: '确认', key: 'confirm' }
]

const currentStep = ref(0)

// 下一步
const nextStep = (): void => {
  // 验证当前步骤
  if (currentStep.value === 0) {
    if (!formData.value.name.trim()) {
      alert('请输入目标名称')
      return
    }
  } else if (currentStep.value === 2) {
    if (!formData.value.targetValue || Number(formData.value.targetValue) <= 0) {
      alert('请输入有效的目标数值')
      return
    }
  }
  
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

// 上一步
const prevStep = (): void => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

interface FormData {
  name: string
  recordType: 'target' | 'cumulative'
  targetValue: number | string
  unit: string
  hasSubGoals: boolean
  subGoals: Array<{ name: string }>
  category: string
  customCategory: string
  hasDeadline: boolean
  deadline: string
}

// 快速选项
const quickOptions = [
  { days: 3, label: '3天' },
  { days: 7, label: '1周' },
  { days: 30, label: '1个月' }
]

// 获取最小日期（今天）
const minDate = computed(() => {
  const today = new Date()
  today.setDate(today.getDate() + 1) // 至少是明天
  return today.toISOString().split('T')[0]
})

// 根据天数计算日期
const getDateFromDays = (days: number): string => {
  const deadline = new Date()
  deadline.setDate(deadline.getDate() + days)
  return deadline.toISOString().split('T')[0]
}

// 根据日期计算剩余天数
const getDaysRemaining = (date: string): number => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadline = new Date(date)
  deadline.setHours(0, 0, 0, 0)
  const diffTime = deadline.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// 根据日期计算天数（用于匹配预设）
const getDaysFromDate = (date: string): number => {
  return getDaysRemaining(date)
}

const formData = ref<FormData>({
  name: '',
  recordType: 'target',
  targetValue: '',
  unit: '',
  hasSubGoals: false,
  subGoals: [{ name: '' }],
  category: '',
  customCategory: '',
  hasDeadline: true, // 默认开启
  deadline: getDateFromDays(7) // 默认1周
})

// 项目标签相关
const categoryPresets = ['🎸 音乐', '🏃 运动', '💻 编程', '📚 学习', '🎨 艺术', '🗣️ 语言', '⚽ 爱好', '✨ 其他']
const showCategoryPanel = ref(false)
const categoryInputValue = ref('')

// 选择预设标签
const selectCategory = (category: string): void => {
  categoryInputValue.value = category
  formData.value.category = category
  formData.value.customCategory = ''
  showCategoryPanel.value = false
}

// 处理标签输入
const handleCategoryInput = (event: Event): void => {
  const value = (event.target as HTMLInputElement).value.trim()
  categoryInputValue.value = value
  
  // 如果输入的是预设标签，使用预设
  if (categoryPresets.includes(value)) {
    formData.value.category = value
    formData.value.customCategory = ''
  } else {
    // 否则使用自定义标签
    formData.value.category = ''
    formData.value.customCategory = value
  }
}

// 切换标签面板
const toggleCategoryPanel = (): void => {
  showCategoryPanel.value = !showCategoryPanel.value
}

// 处理标签输入框失焦
const handleCategoryBlur = (): void => {
  // 延迟关闭，让点击按钮有时间触发
  setTimeout(() => {
    showCategoryPanel.value = false
  }, 200)
}

// 点击外部关闭面板
const handleClickOutside = (event: MouseEvent | TouchEvent): void => {
  const target = event.target as HTMLElement
  // 检查是否点击在面板或按钮外部
  if (!target.closest('.category-selector-wrapper') && !target.closest('.category-panel')) {
    showCategoryPanel.value = false
  }
}

// 处理触摸事件，延迟执行以避免与点击冲突
let touchStartTime = 0
const handleTouchStart = (): void => {
  touchStartTime = Date.now()
}

// 监听点击外部

// 监听formData变化，同步到输入框
watch([() => formData.value.category, () => formData.value.customCategory], () => {
  if (formData.value.category) {
    categoryInputValue.value = formData.value.category
  } else if (formData.value.customCategory) {
    categoryInputValue.value = formData.value.customCategory
  } else {
    categoryInputValue.value = ''
  }
}, { immediate: true })

// 自定义单位相关
const customUnitValue = ref('')
const isCustomUnit = computed(() => formData.value.unit === '__custom__')

// 处理单位选择变化
const handleUnitChange = (): void => {
  if (formData.value.unit !== '__custom__') {
    // 如果选择预设单位，清空自定义值
    customUnitValue.value = ''
  } else {
    // 如果选择自定义，恢复之前输入的自定义值（如果有）
    if (customUnitValue.value) {
      // 保持__custom__状态，让输入框显示
    }
  }
}

// 处理自定义单位输入
const handleCustomUnitInput = (event: Event): void => {
  const value = (event.target as HTMLInputElement).value.trim()
  customUnitValue.value = value
  // 更新实际单位值
  formData.value.unit = value || '__custom__'
}

// 处理自定义单位失焦
const handleCustomUnitBlur = (): void => {
  if (!customUnitValue.value.trim()) {
    // 如果自定义单位为空，恢复为选择状态
    formData.value.unit = ''
  } else {
    // 确保单位值是最新的自定义值
    formData.value.unit = customUnitValue.value.trim()
  }
}

// 实时倒计时
const countdownDisplay = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
})

let countdownTimer: number | null = null

// 计算倒计时状态类
const countdownStatusClass = computed(() => {
  const totalSeconds = countdownDisplay.value.days * 86400 + 
                      countdownDisplay.value.hours * 3600 + 
                      countdownDisplay.value.minutes * 60 + 
                      countdownDisplay.value.seconds
  
  if (totalSeconds <= 86400) return 'urgent' // 1天内
  if (totalSeconds <= 259200) return 'warning' // 3天内
  return 'normal'
})

// 更新倒计时
const updateCountdown = (): void => {
  if (!formData.value.deadline) {
    countdownDisplay.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return
  }
  
  const now = new Date()
  const deadline = new Date(formData.value.deadline)
  deadline.setHours(23, 59, 59, 999) // 设置为当天的最后一刻
  
  const diff = deadline.getTime() - now.getTime()
  
  if (diff <= 0) {
    countdownDisplay.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  countdownDisplay.value = { days, hours, minutes, seconds }
}

// 启动倒计时
const startCountdown = (): void => {
  updateCountdown()
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  countdownTimer = window.setInterval(updateCountdown, 1000)
}

// 停止倒计时
const stopCountdown = (): void => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

// 格式化日期显示
const formattedDate = computed(() => {
  if (!formData.value.deadline) return '选择日期'
  const date = new Date(formData.value.deadline)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  // 判断是否是明天
  if (date.toDateString() === tomorrow.toDateString()) {
    return '明天'
  }
  
  // 判断是否是今天
  if (date.toDateString() === today.toDateString()) {
    return '今天'
  }
  
  // 格式化日期
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = date.toLocaleDateString('zh-CN', { weekday: 'short' })
  
  return `${month}月${day}日 ${weekday}`
})

// 剩余天数文本
const daysRemainingText = computed(() => {
  if (!formData.value.deadline) return ''
  const days = getDaysRemaining(formData.value.deadline)
  
  if (days < 0) return '已过期'
  if (days === 0) return '今天到期'
  if (days === 1) return '明天到期'
  if (days < 7) return `还有 ${days} 天`
  if (days < 30) return `还有 ${Math.floor(days / 7)} 周`
  if (days < 365) return `还有 ${Math.floor(days / 30)} 个月`
  return `还有 ${Math.floor(days / 365)} 年`
})

// 检查预设是否激活
const isPresetActive = (days: number): boolean => {
  if (!formData.value.deadline) return false
  const currentDays = getDaysFromDate(formData.value.deadline)
  return currentDays === days
}

// 设置预设日期
const setPresetDate = (days: number): void => {
  formData.value.deadline = getDateFromDays(days)
  updateCountdown()
}

// 日期改变处理
const onDateChange = (): void => {
  // 确保日期至少是明天
  if (formData.value.deadline && formData.value.deadline < minDate.value) {
    formData.value.deadline = minDate.value
  }
  updateCountdown()
}


// 监听期限变化，自动更新倒计时
watch(() => formData.value.deadline, () => {
  updateCountdown()
}, { immediate: true })


// 更新步骤指示器进度
watch(currentStep, (newStep) => {
  const stepIndicator = document.querySelector('.step-indicator') as HTMLElement
  if (stepIndicator) {
    stepIndicator.style.setProperty('--current-step', String(newStep))
  }
}, { immediate: true })

onMounted(() => {
  startCountdown()
  // 延迟处理点击外部，避免与按钮点击冲突
  document.addEventListener('click', (e) => {
    setTimeout(() => handleClickOutside(e), 200)
  })
  // 初始化步骤指示器
  const stepIndicator = document.querySelector('.step-indicator') as HTMLElement
  if (stepIndicator) {
    stepIndicator.style.setProperty('--current-step', '0')
  }
})

onUnmounted(() => {
  stopCountdown()
  document.removeEventListener('click', handleClickOutside as EventListener)
})

const addSubGoal = (): void => {
  formData.value.subGoals.push({ name: '' })
}

const removeSubGoal = (index: number): void => {
  formData.value.subGoals.splice(index, 1)
}

// 计算最终的分类标签
const finalCategory = computed(() => {
  return categoryInputValue.value.trim() || '✨ 其他'
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
    unit: formData.value.unit ? formData.value.unit.trim() : ''
  }

  // 添加截止日期（必须设置）
  if (formData.value.deadline) {
    goalData.deadline = formData.value.deadline
  }

  if (!formData.value.targetValue || Number(formData.value.targetValue) <= 0) {
    alert('请输入有效的目标数值')
    return
  }

  // 单位是可选的，如果为空则使用空字符串

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

@media (max-width: 640px) {
  .modal-overlay {
    padding: 16px;
    align-items: center;
  }
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

/* 步骤指示器 */
.step-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.3);
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.5) 0%, rgba(241, 245, 249, 0.3) 100%);
  position: relative;
}

.step-indicator::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(226, 232, 240, 0.3);
  z-index: 0;
}

.step-indicator::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
  width: calc((100% / 4) * var(--current-step, 0));
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  position: relative;
  z-index: 2;
}

.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  background: rgba(226, 232, 240, 0.6);
  color: #94a3b8;
  border: 2px solid transparent;
}

.step-item.active .step-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 
    0 0 0 4px rgba(102, 126, 234, 0.1),
    0 4px 12px rgba(102, 126, 234, 0.2);
  transform: scale(1.1);
}

.step-item.completed .step-number {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.9) 100%);
  color: white;
  border-color: rgba(16, 185, 129, 0.3);
}

.step-item.completed .step-number::after {
  content: '✓';
  font-size: 18px;
}

.step-label {
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
  transition: all 0.3s ease;
  text-align: center;
}

.step-item.active .step-label {
  color: #667eea;
  font-weight: 600;
}

.step-item.completed .step-label {
  color: #10b981;
}

/* 步骤内容 */
.step-content {
  min-height: 400px;
  padding: 8px 0;
}

@media (max-width: 640px) {
  .step-content {
    min-height: auto;
    padding: 4px 0;
  }
}

.step-header {
  margin-bottom: 32px;
  text-align: center;
}

@media (max-width: 640px) {
  .step-header {
    margin-bottom: 20px;
  }
}

.step-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

@media (max-width: 640px) {
  .step-title {
    font-size: 20px;
    margin: 0 0 8px 0;
  }
}

.step-description {
  font-size: 15px;
  color: #64748b;
  margin: 0;
  line-height: 1.6;
  font-weight: 400;
}

@media (max-width: 640px) {
  .step-description {
    font-size: 13px;
    line-height: 1.5;
  }
}

/* 汇总页面 */
.summary-step {
  min-height: auto;
}

.summary-content {
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.6) 0%, rgba(241, 245, 249, 0.4) 100%);
  border-radius: 12px;
  padding: 24px;
  border: 1.5px solid rgba(226, 232, 240, 0.6);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid rgba(226, 232, 240, 0.4);
  transition: all 0.2s ease;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item:hover {
  background: rgba(255, 255, 255, 0.5);
  margin: 0 -12px;
  padding: 16px 12px;
  border-radius: 8px;
}

.summary-label {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  flex-shrink: 0;
}

.summary-value {
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
  text-align: right;
  flex: 1;
  margin-left: 16px;
}

/* 步骤按钮 */
.step-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: none;
  position: relative;
  overflow: hidden;
}

.step-back {
  background: rgba(255, 255, 255, 0.8);
  border: 1.5px solid rgba(226, 232, 240, 0.6);
  color: #64748b;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.step-back:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(203, 213, 225, 0.8);
  color: #475569;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.step-next,
.step-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 
    0 4px 12px rgba(102, 126, 234, 0.25),
    0 2px 4px rgba(102, 126, 234, 0.15);
}

.step-next:hover,
.step-submit:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 16px rgba(102, 126, 234, 0.35),
    0 4px 8px rgba(102, 126, 234, 0.2);
}

.step-next:active,
.step-submit:active {
  transform: translateY(0);
}

.step-cancel {
  background: rgba(239, 68, 68, 0.1);
  border: 1.5px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.step-cancel:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

.step-button svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

.step-next:hover svg,
.step-back:hover svg {
  transform: translateX(2px);
}

.step-back:hover svg {
  transform: translateX(-2px);
}

/* 步骤切换动画 */
.step-fade-enter-active,
.step-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.step-fade-enter-from {
  opacity: 0;
  transform: translateX(20px) scale(0.98);
}

.step-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px) scale(0.98);
}

/* 改进的单选按钮样式 */
.radio-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
}

.radio-icon {
  font-size: 32px;
  flex-shrink: 0;
  line-height: 1;
}

.radio-text {
  flex: 1;
}

.radio-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 6px;
}

.radio-desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
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
  font-size: 13.5px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
  letter-spacing: 0.01em;
  line-height: 1.5;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 13px 15px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 1.5px solid rgba(226, 232, 240, 0.6);
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-family: inherit;
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.03),
    0 1px 3px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #94a3b8;
  font-weight: 400;
  opacity: 0.7;
}

.form-group input:hover:not(:focus),
.form-group select:hover:not(:focus),
.form-group textarea:hover:not(:focus) {
  border-color: rgba(203, 213, 225, 0.8);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.04),
    0 2px 6px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transform: translateY(-0.5px);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.6);
  background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 
    0 0 0 3px rgba(102, 126, 234, 0.08),
    0 4px 12px rgba(102, 126, 234, 0.12),
    0 2px 4px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 1);
  transform: translateY(-1px) scale(1.002);
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

/* 数值和单位组合输入框 - 精致设计 */
.value-unit-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  align-items: start;
}

.value-input {
  width: 100%;
  padding: 13px 15px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 1.5px solid rgba(226, 232, 240, 0.6);
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
  letter-spacing: 0.3px;
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.03),
    0 1px 3px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.value-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
  opacity: 0.7;
}

.value-input:hover:not(:focus) {
  border-color: rgba(203, 213, 225, 0.8);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.04),
    0 2px 6px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transform: translateY(-0.5px);
}

.value-input:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.6);
  background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 
    0 0 0 3px rgba(102, 126, 234, 0.08),
    0 4px 12px rgba(102, 126, 234, 0.12),
    0 2px 4px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 1);
  transform: translateY(-1px) scale(1.002);
}

.unit-select {
  width: 100%;
  padding: 13px 15px;
  padding-right: 42px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 1.5px solid rgba(226, 232, 240, 0.6);
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex-shrink: 1;
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.03),
    0 1px 3px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  position: relative;
}

/* 箭头图标 - 使用伪元素 */
.unit-select::after {
  content: '';
  position: absolute;
  right: 13px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364758b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.8' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  pointer-events: none;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.unit-select:hover:not(:focus) {
  border-color: rgba(203, 213, 225, 0.8);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.04),
    0 2px 6px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transform: translateY(-0.5px);
}

.unit-select:hover:not(:focus)::after {
  animation: arrowWiggle 0.6s ease-in-out infinite;
}

.unit-select:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.6);
  background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 
    0 0 0 3px rgba(102, 126, 234, 0.08),
    0 4px 12px rgba(102, 126, 234, 0.12),
    0 2px 4px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 1);
  transform: translateY(-1px) scale(1.002);
}

.unit-select:focus::after {
  animation: arrowWiggle 0.5s ease-in-out infinite;
  transform: translateY(-50%) rotate(180deg);
}

/* 箭头晃动动画 */
@keyframes arrowWiggle {
  0%, 100% {
    transform: translateY(-50%) rotate(0deg);
  }
  25% {
    transform: translateY(-50%) rotate(-8deg);
  }
  75% {
    transform: translateY(-50%) rotate(8deg);
  }
}

.unit-select option {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 10px 12px;
  font-weight: 400;
}

.unit-select optgroup {
  font-weight: 600;
  font-size: 13px;
  color: #64748b;
  padding: 10px 12px 6px;
  letter-spacing: 0.2px;
}

.unit-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.custom-unit-input {
  width: 100%;
  padding: 13px 15px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.02) 100%);
  border: 1.5px solid rgba(102, 126, 234, 0.4);
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  animation: slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 
    0 1px 2px rgba(102, 126, 234, 0.05),
    0 1px 3px rgba(102, 126, 234, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.custom-unit-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
  opacity: 0.7;
}

.custom-unit-input:hover:not(:focus) {
  border-color: rgba(102, 126, 234, 0.5);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.03) 100%);
  box-shadow: 
    0 2px 4px rgba(102, 126, 234, 0.08),
    0 2px 6px rgba(102, 126, 234, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
  transform: translateY(-0.5px);
}

.custom-unit-input:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.7);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.06) 0%, rgba(118, 75, 162, 0.04) 100%);
  box-shadow: 
    0 0 0 3px rgba(102, 126, 234, 0.12),
    0 4px 12px rgba(102, 126, 234, 0.15),
    0 2px 4px rgba(102, 126, 234, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transform: translateY(-1px) scale(1.002);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    max-height: 100px;
  }
}

/* 移动端优化 - 保持精致 */
@media (max-width: 768px) {
  .value-unit-group {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: stretch;
  }

  .value-input {
    flex: 1;
    min-width: 0;
    font-size: 16px; /* 防止iOS缩放 */
    padding: 12px 13px;
    border-radius: 9px;
  }

  .unit-wrapper {
    flex: 1;
    min-width: 0;
    gap: 5px;
  }

  .unit-select {
    width: 100%;
    font-size: 16px; /* 防止iOS缩放 */
    padding: 12px 13px;
    padding-right: 35px;
    border-radius: 9px;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    min-width: 0;
    max-width: 100%;
  }

  .unit-select::after {
    right: 12px;
    width: 15px;
    height: 15px;
  }

  .custom-unit-input {
    font-size: 16px;
    padding: 12px 13px;
    border-radius: 9px;
  }
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

.add-subgoal-btn svg {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.add-subgoal-btn:hover svg {
  transform: rotate(90deg);
}

.add-subgoal-btn:hover {
  background: rgba(102, 126, 234, 0.05);
  border-color: rgba(102, 126, 234, 0.4);
  transform: translateY(-1px);
}

/* 目标名称与标签组合输入框 - 精致设计 */
.name-category-combo {
  display: flex;
  gap: 8px;
  align-items: stretch;
  position: relative;
}

.name-input {
  flex: 1;
  min-width: 0;
  padding: 13px 15px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 1.5px solid rgba(226, 232, 240, 0.6);
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.03),
    0 1px 3px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.name-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
  opacity: 0.7;
}

.name-input:hover:not(:focus) {
  border-color: rgba(203, 213, 225, 0.8);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.04),
    0 2px 6px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transform: translateY(-0.5px);
}

.name-input:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.6);
  background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 
    0 0 0 3px rgba(102, 126, 234, 0.08),
    0 4px 12px rgba(102, 126, 234, 0.12),
    0 2px 4px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 1);
  transform: translateY(-1px) scale(1.002);
}

.category-selector-wrapper {
  position: relative;
  flex-shrink: 0;
}

.category-selector-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 13px 12px;
  min-width: 90px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 1.5px solid rgba(226, 232, 240, 0.6);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.03),
    0 1px 3px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.category-selector-btn:hover {
  border-color: rgba(203, 213, 225, 0.8);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.04),
    0 2px 6px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transform: translateY(-0.5px);
}

.category-selector-btn.has-category {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.06) 100%);
  border-color: rgba(102, 126, 234, 0.3);
  color: #667eea;
}

.category-selector-btn.has-category:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.08) 100%);
  border-color: rgba(102, 126, 234, 0.4);
}

.category-display {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.category-placeholder {
  flex: 1;
  color: #94a3b8;
  font-weight: 400;
  opacity: 0.7;
}

.category-arrow {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  color: currentColor;
  opacity: 0.6;
}

.category-selector-wrapper:has(.category-panel-enter-active) .category-arrow,
.category-selector-btn:hover .category-arrow {
  transform: rotate(180deg);
  opacity: 1;
}

/* 标签选择面板 */
.category-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 280px;
  max-width: 320px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%);
  border: 1.5px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  padding: 12px;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.08),
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(255, 255, 255, 0.5);
  z-index: 1000;
  overflow: hidden;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.category-presets {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-bottom: 10px;
}

.category-preset-btn {
  padding: 10px 8px;
  background: rgba(255, 255, 255, 0.8);
  border: 1.5px solid rgba(226, 232, 240, 0.6);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.category-preset-btn:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.08) 100%);
  border-color: rgba(102, 126, 234, 0.4);
  color: #667eea;
  transform: translateY(-1px) scale(1.02);
  box-shadow: 
    0 2px 8px rgba(102, 126, 234, 0.15),
    0 1px 3px rgba(0, 0, 0, 0.05);
}

.category-preset-btn.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.12) 100%);
  border-color: rgba(102, 126, 234, 0.5);
  color: #667eea;
  font-weight: 600;
  box-shadow: 
    0 2px 8px rgba(102, 126, 234, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.category-custom-section {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(226, 232, 240, 0.5);
}

.category-custom-input {
  width: 100%;
  padding: 10px 12px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.03) 100%);
  border: 1.5px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
}

.category-custom-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
  opacity: 0.7;
}

.category-custom-input:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.5);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.05) 100%);
  box-shadow: 
    0 0 0 3px rgba(102, 126, 234, 0.1),
    0 2px 8px rgba(102, 126, 234, 0.15);
}

/* 面板动画 */
.category-panel-enter-active,
.category-panel-leave-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.category-panel-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}

.category-panel-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .name-category-combo {
    flex-direction: column;
    gap: 10px;
  }

  .name-input {
    font-size: 16px; /* 防止iOS缩放 */
    padding: 12px 14px;
  }

  .category-selector-btn {
    width: 100%;
    font-size: 15px;
    padding: 12px 14px;
    min-width: auto;
  }

  .category-panel {
    position: absolute;
    left: 0;
    right: 0;
    top: calc(100% + 8px);
    bottom: auto !important;
    min-width: auto;
    max-width: none;
    padding: 12px;
    z-index: 1000;
    max-height: 400px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .category-presets {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-bottom: 12px;
  }

  .category-preset-btn {
    padding: 12px 10px;
    font-size: 14px;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    word-break: break-word;
    white-space: normal;
    line-height: 1.3;
  }

  .category-custom-section {
    margin-top: 12px;
    padding-top: 12px;
  }

  .category-custom-input {
    font-size: 15px;
    padding: 12px 14px;
  }
}

/* 目标期限样式 */
.deadline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.deadline-label {
  display: block;
  font-size: 13.5px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
  letter-spacing: 0.01em;
  line-height: 1.5;
}

.deadline-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: deadlineSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 合并的倒计时和日期卡片 */
.deadline-card {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  border: 2px solid rgba(226, 232, 240, 0.6);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  flex-direction: column;
  gap: 12px;
  text-align: center;
}

.deadline-card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.countdown-time {
  display: flex;
  align-items: baseline;
  gap: 1px;
  justify-content: center;
}

.countdown-number {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.countdown-unit {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  margin: 0;
}

.countdown-separator {
  font-size: 18px;
  font-weight: 400;
  color: #94a3b8;
  margin: 0;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.8;
}

.date-icon {
  flex-shrink: 0;
  color: #64748b;
}

.date-text {
  font-size: 14px;
  font-weight: 500;
  color: #475569;
}

.deadline-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.deadline-card:hover::before {
  left: 100%;
}

.deadline-card.normal {
  border-color: rgba(102, 126, 234, 0.3);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
}

.deadline-card.normal:hover {
  border-color: rgba(102, 126, 234, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
}

.deadline-card.warning {
  border-color: rgba(251, 191, 36, 0.5);
  background: linear-gradient(135deg, rgba(255, 251, 235, 0.95) 0%, rgba(254, 243, 199, 0.95) 100%);
  box-shadow: 0 4px 16px rgba(251, 191, 36, 0.15);
}

.deadline-card.warning:hover {
  border-color: rgba(251, 191, 36, 0.7);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(251, 191, 36, 0.25);
}

.deadline-card.urgent {
  border-color: rgba(239, 68, 68, 0.5);
  background: linear-gradient(135deg, rgba(254, 242, 242, 0.95) 0%, rgba(254, 226, 226, 0.95) 100%);
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.2);
  animation: pulseUrgent 2s ease-in-out infinite;
}

.deadline-card.urgent:hover {
  border-color: rgba(239, 68, 68, 0.7);
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(239, 68, 68, 0.3);
}

@keyframes pulseUrgent {
  0%, 100% {
    box-shadow: 0 4px 20px rgba(239, 68, 68, 0.2);
  }
  50% {
    box-shadow: 0 4px 24px rgba(239, 68, 68, 0.35);
  }
}

.deadline-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0; /* 防止flex溢出 */
  overflow: hidden;
}

.countdown-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.countdown-label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.deadline-card.warning .countdown-label {
  color: #f59e0b;
}

.deadline-card.urgent .countdown-label {
  color: #ef4444;
  animation: blink 1s ease-in-out infinite;
}

.date-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid rgba(226, 232, 240, 0.5);
  gap: 8px;
  flex-wrap: wrap;
}

.deadline-card.warning .date-section {
  border-top-color: rgba(251, 191, 36, 0.2);
}

.deadline-card.urgent .date-section {
  border-top-color: rgba(239, 68, 68, 0.2);
}

.date-info {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.date-icon {
  color: #94a3b8;
  flex-shrink: 0;
}

.deadline-card.warning .date-icon {
  color: #f59e0b;
}

.deadline-card.urgent .date-icon {
  color: #ef4444;
}

.date-text {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.deadline-card.warning .date-text {
  color: #92400e;
}

.deadline-card.urgent .date-text {
  color: #991b1b;
}

.date-remaining {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  white-space: nowrap;
  flex-shrink: 0;
  text-align: right;
}

.deadline-card.warning .date-remaining {
  color: #d97706;
}

.deadline-card.urgent .date-remaining {
  color: #dc2626;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.countdown-time {
  display: flex;
  align-items: baseline;
  gap: 2px;
  font-variant-numeric: tabular-nums;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Mono', 'Monaco', 'Menlo', monospace;
  flex-wrap: wrap; /* 允许换行 */
}

.countdown-number {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.deadline-card.warning .countdown-number {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.deadline-card.urgent .countdown-number {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: numberPulse 1s ease-in-out infinite;
}

@keyframes numberPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.countdown-unit {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  margin: 0 1px;
  line-height: 1;
  white-space: nowrap;
  flex-shrink: 0;
}

.deadline-card.warning .countdown-unit {
  color: #f59e0b;
}

.deadline-card.urgent .countdown-unit {
  color: #ef4444;
}

.countdown-separator {
  font-size: 20px;
  font-weight: 300;
  color: #cbd5e1;
  margin: 0 1px;
  line-height: 1;
  flex-shrink: 0;
  white-space: nowrap;
}

.deadline-card.warning .countdown-separator {
  color: #fbbf24;
}

.deadline-card.urgent .countdown-separator {
  color: #fca5a5;
}

.calendar-icon {
  flex-shrink: 0;
  color: #cbd5e1;
  transition: all 0.2s ease;
}

.deadline-card:hover .calendar-icon {
  color: #94a3b8;
  transform: translateX(2px);
}

.deadline-card.warning .calendar-icon {
  color: #fbbf24;
}

.deadline-card.urgent .calendar-icon {
  color: #fca5a5;
}

@keyframes deadlineSlideIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.deadline-fade-enter-active,
.deadline-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.deadline-fade-enter-from,
.deadline-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.deadline-picker-container {
  position: relative;
}

.date-picker-wrapper {
  position: relative;
}

.date-picker {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
}


.deadline-presets {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.preset-btn {
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.8);
  border: 1.5px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
}

.preset-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
  transition: left 0.5s ease;
}

.preset-btn:hover::before {
  left: 100%;
}

.preset-btn:hover {
  background: rgba(102, 126, 234, 0.08);
  border-color: rgba(102, 126, 234, 0.3);
  color: #667eea;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.preset-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.1);
}

.preset-btn.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-color: rgba(102, 126, 234, 0.4);
  color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(226, 232, 240, 0.5);
  justify-content: flex-end;
}

.modal-actions .step-back {
  flex: 0 0 auto;
}

.modal-actions .step-next,
.modal-actions .step-submit {
  flex: 0 0 auto;
  min-width: 120px;
}

.modal-actions .step-cancel {
  flex: 0 0 auto;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .modal-content {
    margin: 0;
    max-width: calc(100% - 32px);
    width: 100%;
    border-radius: 20px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    padding: 20px 20px 16px;
    flex-shrink: 0;
  }

  .modal-header h2 {
    font-size: 20px;
  }

  .step-indicator {
    padding: 16px 20px;
    flex-shrink: 0;
  }

  .step-number {
    width: 32px;
    height: 32px;
    font-size: 13px;
  }

  .step-label {
    font-size: 11px;
  }

  .modal-form {
    padding: 20px;
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .modal-actions {
    display: flex;
    flex-direction: row;
    gap: 10px;
    margin-top: 20px;
    padding-top: 20px;
    flex-shrink: 0;
    align-items: stretch;
    justify-content: flex-end;
  }

  .modal-actions .step-back {
    flex: 0 0 auto;
    min-width: 100px;
  }

  .modal-actions .step-next,
  .modal-actions .step-submit {
    flex: 1 1 auto;
    min-width: 120px;
  }

  .step-button {
    padding: 14px 20px;
    font-size: 15px;
    position: relative;
    z-index: 1;
  }

  .cancel-button,
  .submit-button {
    width: 100%;
  }

  /* 移动端倒计时卡片优化 */
  .deadline-card {
    padding: 16px;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .deadline-card-content {
    gap: 8px;
    text-align: center;
  }

  .countdown-time {
    gap: 1px;
    justify-content: center;
  }

  .countdown-number {
    font-size: 18px;
  }

  .countdown-unit {
    font-size: 9px;
    margin: 0;
  }

  .countdown-separator {
    font-size: 14px;
    margin: 0;
  }

  .date-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    opacity: 0.8;
  }

  .date-icon {
    flex-shrink: 0;
  }

  .date-text {
    font-size: 12px;
    font-weight: 500;
  }

  .deadline-presets {
    flex-wrap: wrap;
    gap: 8px;
  }

  .preset-btn {
    padding: 8px 14px;
    font-size: 12px;
    flex: 1;
    min-width: calc(33.333% - 6px);
  }
}

/* DatePicker组件样式优化 */
.custom-datepicker {
  width: 100%;
}

.custom-datepicker .dp__main {
  width: 100%;
  --dp-primary-color: #667eea;
  --dp-secondary-color: #f1f5f9;
  --dp-success-color: #10b981;
  --dp-danger-color: #ef4444;
  --dp-warning-color: #f59e0b;
  --dp-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --dp-border-radius: 12px;
  --dp-cell-border-radius: 8px;
  --dp-common-transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-datepicker .dp__input {
  display: none; /* 隐藏默认输入框 */
}

/* 自定义弹出菜单样式 */
.custom-datepicker .dp__menu {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px;
}

/* 日历头部样式 */
.custom-datepicker .dp__calendar_header {
  margin-bottom: 16px;
  padding: 0 8px;
}

.custom-datepicker .dp__calendar_header_separator {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  margin: 12px 0;
}

/* 月份/年份选择器 */
.custom-datepicker .dp__month_year_select {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 8px;
  padding: 8px 12px;
  font-weight: 600;
  color: #475569;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-datepicker .dp__month_year_select:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: #667eea;
}

/* 日历网格 */
.custom-datepicker .dp__calendar {
  background: transparent;
}

/* 星期标题 */
.custom-datepicker .dp__weekdays {
  margin-bottom: 8px;
}

.custom-datepicker .dp__weekday {
  color: #64748b;
  font-weight: 600;
  font-size: 12px;
  padding: 8px 0;
}

/* 日期单元格 */
.custom-datepicker .dp__cell_inner {
  border-radius: 8px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 8px;
  margin: 1px;
}

.custom-datepicker .dp__cell:hover .dp__cell_inner {
  background: rgba(102, 126, 234, 0.1);
  transform: scale(1.05);
}

.custom-datepicker .dp__cell_today .dp__cell_inner {
  background: rgba(102, 126, 234, 0.15);
  font-weight: 600;
}

.custom-datepicker .dp__cell_selected .dp__cell_inner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transform: scale(1.05);
}

.custom-datepicker .dp__cell_disabled .dp__cell_inner {
  color: #cbd5e1;
  cursor: not-allowed;
}

/* 底部操作按钮 */
.custom-datepicker .dp__action_buttons {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(226, 232, 240, 0.5);
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.custom-datepicker .dp__action_button {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(226, 232, 240, 0.8);
  background: rgba(255, 255, 255, 0.8);
  color: #64748b;
  cursor: pointer;
}

.custom-datepicker .dp__action_button:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: #667eea;
  color: #667eea;
}

.custom-datepicker .dp__action_button.dp__action_button--default {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.custom-datepicker .dp__action_button.dp__action_button--default:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.date-picker-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 移动端让日期选择器覆盖整个卡片 */
.deadline-card {
  position: relative;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.deadline-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .custom-datepicker .dp__menu {
    margin: 16px;
    max-width: calc(100vw - 32px);
    max-height: calc(100vh - 32px);
    overflow-y: auto;
  }

  .custom-datepicker .dp__action_buttons {
    flex-direction: column-reverse;
  }

  .custom-datepicker .dp__action_button {
    width: 100%;
    padding: 12px 16px;
  }
}
</style>


