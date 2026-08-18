/**
 * 待办逻辑模块
 * 提供待办筛选、分类、倒计时等功能
 */

import { getTasks, updateTaskStatus } from './storage'
import { parseDateTime, diffMinutes, getNow, isToday } from './time'

/**
 * 获取今日待办
 * @param {Date} now
 * @returns {Array}
 */
export function getTodayTasks(now) {
  const tasks = getTasks()
  return tasks.filter(t => {
    if (t.finished) return false
    const deadline = parseDateTime(t.deadline)
    return isToday(deadline, now)
  }).sort((a, b) => parseDateTime(a.deadline) - parseDateTime(b.deadline))
}

/**
 * 获取本周待办
 * @param {Date} now
 * @returns {Array}
 */
export function getWeekTasks(now) {
  const tasks = getTasks()
  const weekEnd = new Date(now)
  weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()))
  weekEnd.setHours(23, 59, 59, 999)

  return tasks.filter(t => {
    if (t.finished) return false
    const deadline = parseDateTime(t.deadline)
    return deadline > now && deadline <= weekEnd && !isToday(deadline, now)
  }).sort((a, b) => parseDateTime(a.deadline) - parseDateTime(b.deadline))
}

/**
 * 获取未来待办
 * @param {Date} now
 * @returns {Array}
 */
export function getFutureTasks(now) {
  const tasks = getTasks()
  const weekEnd = new Date(now)
  weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()))
  weekEnd.setHours(23, 59, 59, 999)

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
 * @returns {object} { todayCount, urgentCount }
 */
export function getTaskSummary(now) {
  const todayTasks = getTodayTasks(now)
  const allTasks = getTasks().filter(t => !t.finished)
  const urgentCount = allTasks.filter(t => {
    const countdown = getTaskCountdown(t, now)
    return countdown.isUrgent
  }).length

  return {
    todayCount: todayTasks.length,
    urgentCount
  }
}

/**
 * 切换任务完成状态
 * @param {string} taskId
 * @returns {boolean} 新状态
 */
export function toggleTaskStatus(taskId) {
  const tasks = getTasks()
  const task = tasks.find(t => t.id === taskId)
  if (task) {
    const newStatus = !task.finished
    updateTaskStatus(taskId, newStatus)
    return newStatus
  }
  return false
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
