<template>
  <div v-if="visible" class="debug-panel">
    <div class="debug-notice">
      🔧 开发人员调试面板 - 仅用于开发调试
    </div>
    <div class="debug-header">
      <h3>调试日志面板</h3>
      <div class="debug-actions">
        <button @click="clearLogs" class="debug-btn">清空</button>
        <button @click="exportLogs" class="debug-btn">导出</button>
        <button @click="toggleFilter" class="debug-btn">
          {{ showFilter ? '隐藏' : '显示' }}筛选
        </button>
        <button @click="$emit('close')" class="debug-btn close-btn">×</button>
      </div>
    </div>
    
    <div v-if="showFilter" class="debug-filter">
      <label>
        <input type="checkbox" v-model="filterLevels.debug" />
        DEBUG
      </label>
      <label>
        <input type="checkbox" v-model="filterLevels.info" />
        INFO
      </label>
      <label>
        <input type="checkbox" v-model="filterLevels.warn" />
        WARN
      </label>
      <label>
        <input type="checkbox" v-model="filterLevels.error" />
        ERROR
      </label>
      <input
        type="text"
        v-model="searchText"
        placeholder="搜索日志..."
        class="search-input"
      />
    </div>
    
    <div class="debug-content" ref="logContainer">
      <div
        v-for="log in filteredLogs"
        :key="log.id"
        :class="['log-entry', `log-${log.level.toLowerCase()}`]"
      >
        <div class="log-header">
          <span class="log-time">{{ formatTime(log.timestamp) }}</span>
          <span :class="['log-level', `level-${log.level.toLowerCase()}`]">
            {{ log.level }}
          </span>
        </div>
        <div class="log-message">{{ log.message }}</div>
        <div v-if="log.data" class="log-data">
          <pre>{{ formatData(log.data) }}</pre>
        </div>
      </div>
      <div v-if="filteredLogs.length === 0" class="no-logs">
        暂无日志
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { logs, clearLogs as clearLogsUtil, exportLogs as exportLogsUtil } from '../utils/logger'
import { LogLevel } from '../types'

const props = defineProps<{
  visible?: boolean
}>()

defineEmits<{
  'close': []
}>()

const showFilter = ref(false)
const filterLevels = ref({
  debug: true,
  info: true,
  warn: true,
  error: true
})
const searchText = ref('')
const logContainer = ref<HTMLElement | null>(null)

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    // 级别筛选
    const levelMap: Record<string, boolean> = {
      [LogLevel.DEBUG]: filterLevels.value.debug,
      [LogLevel.INFO]: filterLevels.value.info,
      [LogLevel.WARN]: filterLevels.value.warn,
      [LogLevel.ERROR]: filterLevels.value.error
    }
    if (!levelMap[log.level]) return false

    // 文本搜索
    if (searchText.value) {
      const searchLower = searchText.value.toLowerCase()
      const messageMatch = log.message.toLowerCase().includes(searchLower)
      const dataMatch = log.data ? JSON.stringify(log.data).toLowerCase().includes(searchLower) : false
      if (!messageMatch && !dataMatch) return false
    }

    return true
  }).reverse() // 最新的在前
})

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  } as Intl.DateTimeFormatOptions)
}

const formatData = (data: any): string => {
  try {
    return JSON.stringify(data, null, 2)
  } catch (e) {
    return String(data)
  }
}

const clearLogs = (): void => {
  if (confirm('确定要清空所有日志吗？')) {
    clearLogsUtil()
  }
}

const exportLogs = (): void => {
  exportLogsUtil()
}

const toggleFilter = (): void => {
  showFilter.value = !showFilter.value
}

// 自动滚动到底部
watch(() => logs.value.length, () => {
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = 0 // 因为反转了，所以滚动到顶部
    }
  })
})
</script>

<style scoped>
.debug-notice {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  border-bottom: 2px solid #f59e0b;
}

.debug-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 500px;
  max-width: 90vw;
  height: 100vh;
  background: #1e1e1e;
  color: #d4d4d4;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.3);
}

.debug-header {
  padding: 16px;
  background: #252526;
  border-bottom: 1px solid #3e3e42;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.debug-header h3 {
  margin: 0;
  font-size: 16px;
  color: #cccccc;
}

.debug-actions {
  display: flex;
  gap: 8px;
}

.debug-btn {
  padding: 6px 12px;
  background: #0e639c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.debug-btn:hover {
  background: #1177bb;
}

.close-btn {
  background: #c72e2e;
  width: 28px;
  height: 28px;
  padding: 0;
  font-size: 18px;
  line-height: 1;
}

.close-btn:hover {
  background: #e63939;
}

.debug-filter {
  padding: 12px 16px;
  background: #2d2d30;
  border-bottom: 1px solid #3e3e42;
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.debug-filter label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  cursor: pointer;
}

.search-input {
  flex: 1;
  min-width: 150px;
  padding: 6px 10px;
  background: #3c3c3c;
  border: 1px solid #555;
  border-radius: 4px;
  color: #d4d4d4;
  font-size: 12px;
}

.search-input:focus {
  outline: none;
  border-color: #0e639c;
}

.debug-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
}

.log-entry {
  margin-bottom: 12px;
  padding: 10px;
  background: #252526;
  border-left: 3px solid #555;
  border-radius: 4px;
}

.log-entry.log-debug {
  border-left-color: #569cd6;
}

.log-entry.log-info {
  border-left-color: #4ec9b0;
}

.log-entry.log-warn {
  border-left-color: #dcdcaa;
}

.log-entry.log-error {
  border-left-color: #f48771;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.log-time {
  color: #858585;
  font-size: 11px;
}

.log-level {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.level-debug {
  background: #569cd6;
  color: #1e1e1e;
}

.level-info {
  background: #4ec9b0;
  color: #1e1e1e;
}

.level-warn {
  background: #dcdcaa;
  color: #1e1e1e;
}

.level-error {
  background: #f48771;
  color: #1e1e1e;
}

.log-message {
  color: #d4d4d4;
  margin-bottom: 6px;
  word-break: break-word;
}

.log-data {
  margin-top: 8px;
  padding: 8px;
  background: #1e1e1e;
  border-radius: 4px;
  overflow-x: auto;
}

.log-data pre {
  margin: 0;
  color: #ce9178;
  font-size: 11px;
  white-space: pre-wrap;
  word-break: break-word;
}

.no-logs {
  text-align: center;
  color: #858585;
  padding: 40px;
}

/* 滚动条样式 */
.debug-content::-webkit-scrollbar {
  width: 8px;
}

.debug-content::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.debug-content::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: 4px;
}

.debug-content::-webkit-scrollbar-thumb:hover {
  background: #4e4e4e;
}
</style>

