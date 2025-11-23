import type { StorageData } from '../types'
// 本地存储管理
const STORAGE_KEY = 'practice_tracker_data'

// 安全的日志记录函数，避免循环依赖
const safeLog = (level: string, message: string, data?: any): void => {
  try {
    // 动态导入，避免循环依赖
    import('./logger').then(logger => {
      const logFn = (logger as any)[`log${level}`] || (logger as any).logInfo
      logFn(message, data)
    }).catch(() => {
      // 如果 logger 未初始化，只在控制台输出
      const consoleMethod = (console as any)[level.toLowerCase()] || console.log
      consoleMethod(`[${level}] ${message}`, data)
    })
  } catch (e) {
    // 静默失败
  }
}

export const saveData = (data: StorageData): void => {
  try {
    const dataStr = JSON.stringify(data)
    localStorage.setItem(STORAGE_KEY, dataStr)
    safeLog('Debug', '数据已保存到本地存储', {
      goalCount: data.goals?.length || 0,
      dataSize: `${(dataStr.length / 1024).toFixed(2)}KB`
    })
  } catch (error) {
    console.error('保存数据失败:', error)
    safeLog('Error', '保存数据失败', { error: (error as Error).message })
  }
}

export const loadData = (): StorageData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data) as StorageData
      safeLog('Debug', '从本地存储加载数据', {
        goalCount: parsed.goals?.length || 0
      })
      return parsed
    } else {
      safeLog('Info', '本地存储为空，返回默认数据')
      return { goals: [] }
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    safeLog('Error', '加载数据失败', { error: (error as Error).message })
    return { goals: [] }
  }
}
