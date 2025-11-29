/**
 * 计算剩余天数
 * @param deadline 截止日期，ISO格式字符串 (YYYY-MM-DD)
 * @returns 剩余天数，如果已过期返回负数，如果未设置返回null
 */
export function getDaysRemaining(deadline: string | undefined): number | null {
  if (!deadline) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const deadlineDate = new Date(deadline)
  deadlineDate.setHours(0, 0, 0, 0)

  const diffTime = deadlineDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * 格式化剩余天数显示
 * @param days 剩余天数
 * @returns 格式化的字符串
 */
export function formatDaysRemaining(days: number | null): string {
  if (days === null) return ''

  if (days < 0) {
    return `已过期 ${Math.abs(days)} 天`
  } else if (days === 0) {
    return '今天到期'
  } else if (days === 1) {
    return '明天到期'
  } else if (days <= 7) {
    return `剩余 ${days} 天`
  } else if (days <= 30) {
    const weeks = Math.floor(days / 7)
    const remainingDays = days % 7
    if (remainingDays === 0) {
      return `剩余 ${weeks} 周`
    } else {
      return `剩余 ${weeks} 周 ${remainingDays} 天`
    }
  } else {
    const months = Math.floor(days / 30)
    const remainingDays = days % 30
    if (remainingDays === 0) {
      return `剩余 ${months} 个月`
    } else {
      return `剩余约 ${months} 个月`
    }
  }
}

/**
 * 获取剩余天数的状态（用于样式）
 * @param days 剩余天数
 * @returns 'urgent' | 'warning' | 'normal' | 'expired'
 */
export function getCountdownStatus(days: number | null): 'urgent' | 'warning' | 'normal' | 'expired' | null {
  if (days === null) return null

  if (days < 0) {
    return 'expired'
  } else if (days <= 3) {
    return 'urgent'
  } else if (days <= 7) {
    return 'warning'
  } else {
    return 'normal'
  }
}

