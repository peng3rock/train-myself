// 目标类型
export interface Goal {
  id: string
  name: string
  type: 'numeric' | 'task'
  category?: string
  targetValue?: number
  targetScore?: number
  recordType?: 'cumulative' | 'target'
  createdAt: string
  records: Record[]
  completed: boolean
  subGoals?: SubGoal[]
  deadline?: string // 截止日期，ISO格式字符串
}

// 子目标类型
export interface SubGoal {
  id: string
  name: string
  targetValue?: number
}

// 记录类型
export interface Record {
  id: string
  date: string
  value?: number
  score?: number
  subGoalValues?: Record<string, number>
}

// 日志级别
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// 日志条目
export interface LogEntry {
  id: number
  timestamp: string
  level: LogLevel
  message: string
  data: any | null
}

// 存储数据类型
export interface StorageData {
  goals: Goal[]
}
