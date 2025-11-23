import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Goal, Record } from '../types'
import { loadData, saveData } from '../utils/storage'
import { logInfo, logDebug, logWarn } from '../utils/logger'

export const useGoalsStore = defineStore('goals', () => {
  const goals = ref<Goal[]>([])

  // 初始化：从本地存储加载数据
  const init = (): void => {
    logInfo('初始化目标数据')
    const data = loadData()
    goals.value = data.goals || []
    logDebug('加载数据', { goalCount: goals.value.length })
  }

  // 添加目标
  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt' | 'records' | 'completed'>): void => {
    logInfo('添加新目标', { goalName: goal.name, goalType: goal.type, category: goal.category })
    const newGoal: Goal = {
      id: Date.now().toString(),
      ...goal,
      createdAt: new Date().toISOString(),
      records: [],
      completed: false,
      subGoals: goal.subGoals || []
    }
    goals.value.push(newGoal)
    saveData({ goals: goals.value })
    logDebug('目标已保存', {
      goalId: newGoal.id,
      category: newGoal.category,
      subGoalsCount: newGoal.subGoals?.length || 0
    })
  }

  // 添加记录
  const addRecord = (goalId: string, record: Omit<Record, 'id' | 'date'>): void => {
    logInfo('添加记录', { goalId, recordType: record.value !== undefined ? 'numeric' : 'task' })
    const goalIndex = goals.value.findIndex(g => g.id === goalId)
    if (goalIndex === -1) {
      logWarn('目标不存在', { goalId })
      return
    }

    const goal = goals.value[goalIndex]
    const newRecord: Record = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      ...record
    }

    goal.records.push(newRecord)
    logDebug('记录已添加', {
      goalName: goal.name,
      recordId: newRecord.id,
      value: record.value,
      score: record.score,
      hasSubGoals: !!record.subGoalValues
    })

    // 检查是否完成目标
    if (goal.type === 'numeric') {
      const recordType = goal.recordType || 'cumulative'
      if (recordType === 'target') {
        // 浮动型：只要有一次达到目标值就算完成
        const maxValue = Math.max(...goal.records.map(r => r.value || 0))
        const wasCompleted = goal.completed
        goal.completed = maxValue >= (goal.targetValue || 0)
        if (!wasCompleted && goal.completed) {
          logInfo('目标已完成（浮动型）', {
            goalName: goal.name,
            maxValue,
            targetValue: goal.targetValue
          })
        }
      } else {
        // 累加型：累计值达到目标
        const total = goal.records.reduce((sum, r) => sum + (r.value || 0), 0)
        const wasCompleted = goal.completed
        goal.completed = total >= (goal.targetValue || 0)
        if (!wasCompleted && goal.completed) {
          logInfo('目标已完成（累加型）', {
            goalName: goal.name,
            total,
            targetValue: goal.targetValue
          })
        }
      }
    } else if (goal.type === 'task') {
      if (record.score !== undefined && record.score >= (goal.targetScore || 0)) {
        const wasCompleted = goal.completed
        goal.completed = true
        if (!wasCompleted) {
          logInfo('目标已完成（任务型）', {
            goalName: goal.name,
            score: record.score,
            targetScore: goal.targetScore
          })
        }
      }
    }

    saveData({ goals: goals.value })
    logDebug('数据已保存')
  }

  // 删除目标
  const deleteGoal = (goalId: string): void => {
    const goal = goals.value.find(g => g.id === goalId)
    logInfo('删除目标', { goalId, goalName: goal?.name })
    goals.value = goals.value.filter(goal => goal.id !== goalId)
    saveData({ goals: goals.value })
    logDebug('目标已删除，数据已保存')
  }

  return {
    goals,
    init,
    addGoal,
    addRecord,
    deleteGoal
  }
})
