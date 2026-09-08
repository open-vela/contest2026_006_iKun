/**
 * 待办逻辑模块
 * 提供待办筛选、分类、倒计时等功能
 */

import { getTasks, updateTaskStatus } from './storage'
import { parseDateTime, diffMinutes, getNow, isToday } from './time'

// 性能诊断
const TASK_PERF_START = Date.now()
function perfLog(label) {
  console.log('[PERF:TASK]', label, '+', Date.now() - TASK_PERF_START, 'ms')
}

/**
 * 获取已逾期待办（截止时间早于当前时间且未完成）
 * @param {Date} now
 * @returns {Array}
 */
export function getOverdueTasks(now) {
  const tasks = getTasks()
  return tasks.filter(t => {
    if (t.finished) return false
    const deadline = parseDateTime(t.deadline)
    return deadline < now
  }).sort((a, b) => parseDateTime(a.deadline) - parseDateTime(b.deadline))
}

/**
 * 获取今日待办（今天截止且未过期、未完成）
 * @param {Date} now
 * @returns {Array}
 */
export function getTodayTasks(now) {
  const tasks = getTasks()
  return tasks.filter(t => {
    if (t.finished) return false
    const deadline = parseDateTime(t.deadline)
    // 今天截止且尚未过期
    return isToday(deadline, now) && deadline >= now
  }).sort((a, b) => parseDateTime(a.deadline) - parseDateTime(b.deadline))
}

/**
 * 获取本周结束日期（周日 23:59:59.999）
 * @param {Date} now
 * @returns {Date}
 */
function getWeekEnd(now) {
  const weekEnd = new Date(now)
  // 将 JavaScript 的周日=0 转换为业务中的周日=7
  const day = weekEnd.getDay() === 0 ? 7 : weekEnd.getDay()
  weekEnd.setDate(weekEnd.getDate() + (7 - day))
  weekEnd.setHours(23, 59, 59, 999)
  return weekEnd
}

/**
 * 获取本周待办（本周内、非今天、未过期、未完成）
 * @param {Date} now
 * @returns {Array}
 */
export function getWeekTasks(now) {
  const tasks = getTasks()
  const weekEnd = getWeekEnd(now)

  return tasks.filter(t => {
    if (t.finished) return false
    const deadline = parseDateTime(t.deadline)
    return deadline > now && deadline <= weekEnd && !isToday(deadline, now)
  }).sort((a, b) => parseDateTime(a.deadline) - parseDateTime(b.deadline))
}

/**
 * 获取未来待办（本周之后、未完成）
 * @param {Date} now
 * @returns {Array}
 */
export function getFutureTasks(now) {
  const tasks = getTasks()
  const weekEnd = getWeekEnd(now)

  return tasks.filter(t => {
    if (t.finished) return false
    const deadline = parseDateTime(t.deadline)
    return deadline > weekEnd
  }).sort((a, b) => parseDateTime(a.deadline) - parseDateTime(b.deadline))
}

/**
 * 获取已完成待办
 * @returns {Array}
 */
export function getFinishedTasks() {
  const tasks = getTasks()
  return tasks.filter(t => t.finished)
}

/**
 * 获取待办剩余时间
 * @param {object} task
 * @param {Date} now
 * @returns {object} { value, unit, isUrgent, isCritical }
 */
export function getTaskCountdown(task, now) {
  const deadline = parseDateTime(task.deadline)
  const remaining = deadline - now

  if (remaining <= 0) {
    return { value: 0, unit: '已截止', isUrgent: false, isCritical: true }
  }

  const minutes = Math.floor(remaining / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  // 判断紧急程度
  const isCritical = hours < 1
  const isUrgent = hours < 6

  if (days > 0) {
    return { value: days, unit: '天', isUrgent, isCritical }
  }
  if (hours > 0) {
    return { value: hours, unit: '小时', isUrgent, isCritical }
  }
  return { value: minutes, unit: '分钟', isUrgent, isCritical }
}

/**
 * 格式化待办倒计时文字
 * @param {object} task
 * @param {Date} now
 * @returns {string}
 */
export function formatTaskCountdown(task, now) {
  const countdown = getTaskCountdown(task, now)
  if (countdown.unit === '已截止') return '已截止'
  return `还有 ${countdown.value} ${countdown.unit}`
}

/**
 * 获取待办摘要
 * @param {Date} now
 * @returns {object} { todayCount, totalCount, urgentCount }
 */
export function getTaskSummary(now) {
  perfLog('getTaskSummary_START')
  const todayTasks = getTodayTasks(now)
  const allTasks = getTasks().filter(t => !t.finished)
  const urgentCount = allTasks.filter(t => {
    const countdown = getTaskCountdown(t, now)
    return countdown.isUrgent
  }).length

  const result = {
    todayCount: todayTasks.length,
    totalCount: allTasks.length,
    urgentCount
  }
  perfLog('getTaskSummary_END (today: ' + result.todayCount + ', total: ' + result.totalCount + ')')
  return result
}

/**
 * 切换任务完成状态
 * @param {string} taskId
 * @param {boolean} newStatus
 * @returns {Promise<boolean>}
 */
export function toggleTaskStatus(taskId, newStatus) {
  return updateTaskStatus(taskId, newStatus)
}

/**
 * 获取待办类型文字
 * @param {string} type
 * @returns {string}
 */
export function getTaskTypeText(type) {
  const typeMap = {
    experiment: '实验',
    homework: '作业',
    report: '报告',
    other: '其他'
  }
  return typeMap[type] || '其他'
}
