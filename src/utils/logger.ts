import { ref } from 'vue'
import { LogLevel, type LogEntry } from '../types'

const MAX_LOG_ENTRIES = 500 // 最多保存500条日志

const logs = ref<LogEntry[]>([])

// 添加日志
export const addLog = (level: LogLevel, message: string, data: any = null): void => {
  const timestamp = new Date().toISOString()
  const logEntry: LogEntry = {
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
  const consoleMethod = level === LogLevel.ERROR ? 'error' :
                       level === LogLevel.WARN ? 'warn' :
                       level === LogLevel.DEBUG ? 'debug' : 'log'
  console[consoleMethod as keyof Console](`[${level}] ${message}`, data || '')
}

// 便捷方法
export const logDebug = (message: string, data?: any): void => addLog(LogLevel.DEBUG, message, data)
export const logInfo = (message: string, data?: any): void => addLog(LogLevel.INFO, message, data)
export const logWarn = (message: string, data?: any): void => addLog(LogLevel.WARN, message, data)
export const logError = (message: string, data?: any): void => addLog(LogLevel.ERROR, message, data)

// 获取所有日志
export const getLogs = (): LogEntry[] => logs.value

// 清空日志
export const clearLogs = (): void => {
  logs.value = []
  logInfo('日志已清空')
}

// 导出日志
export const exportLogs = (): void => {
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
