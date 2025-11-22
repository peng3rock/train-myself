// 调试日志系统
import { ref } from 'vue'

const MAX_LOG_ENTRIES = 500 // 最多保存500条日志

const logs = ref([])

// 日志级别
export const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
}

// 添加日志
export const addLog = (level, message, data = null) => {
  const timestamp = new Date().toISOString()
  const logEntry = {
    id: Date.now() + Math.random(),
    timestamp,
    level,
    message,
    data: data ? JSON.parse(JSON.stringify(data)) : null
  }
  
  logs.value.push(logEntry)
  
  // 限制日志数量
  if (logs.value.length > MAX_LOG_ENTRIES) {
    logs.value.shift()
  }
  
  // 在控制台也输出
  const consoleMethod = level === 'ERROR' ? 'error' : 
                       level === 'WARN' ? 'warn' : 
                       level === 'DEBUG' ? 'debug' : 'log'
  console[consoleMethod](`[${level}] ${message}`, data || '')
}

// 便捷方法
export const logDebug = (message, data) => addLog(LogLevel.DEBUG, message, data)
export const logInfo = (message, data) => addLog(LogLevel.INFO, message, data)
export const logWarn = (message, data) => addLog(LogLevel.WARN, message, data)
export const logError = (message, data) => addLog(LogLevel.ERROR, message, data)

// 获取所有日志
export const getLogs = () => logs.value

// 清空日志
export const clearLogs = () => {
  logs.value = []
  logInfo('日志已清空')
}

// 导出日志
export const exportLogs = () => {
  const logText = logs.value.map(log => {
    const dataStr = log.data ? JSON.stringify(log.data, null, 2) : ''
    return `[${log.timestamp}] [${log.level}] ${log.message}${dataStr ? '\n' + dataStr : ''}`
  }).join('\n\n')
  
  const blob = new Blob([logText], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `logs-${new Date().toISOString().split('T')[0]}.txt`
  a.click()
  URL.revokeObjectURL(url)
  
  logInfo('日志已导出')
}

// 导出 logs ref
export { logs }

