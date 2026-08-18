/**
 * 考试逻辑模块
 * 提供考试筛选、倒计时计算等功能
 */

import { getExams } from './storage'
import { formatCountdown, formatExamCountdown, parseDateTime, getNow } from './time'

/**
 * 获取最近的考试
 * @param {Date} now
 * @returns {object|null}
 */
export function getNearestExam(now) {
  const exams = getExams()
  const upcomingExams = exams
    .filter(e => parseDateTime(`${e.date}T${e.startTime}:00`) > now)
    .sort((a, b) => {
      const dateA = parseDateTime(`${a.date}T${a.startTime}:00`)
      const dateB = parseDateTime(`${b.date}T${b.startTime}:00`)
      return dateA - dateB
    })
  return upcomingExams.length > 0 ? upcomingExams[0] : null
}

/**
 * 获取所有即将到来的考试
 * @param {Date} now
 * @returns {Array}
 */
export function getUpcomingExams(now) {
  const exams = getExams()
  return exams
    .filter(e => parseDateTime(`${e.date}T${e.startTime}:00`) > now)
    .sort((a, b) => {
      const dateA = parseDateTime(`${a.date}T${a.startTime}:00`)
      const dateB = parseDateTime(`${b.date}T${b.startTime}:00`)
      return dateA - dateB
    })
}

/**
 * 获取考试倒计时
 * @param {object} exam
 * @param {Date} now
 * @returns {object} { value, unit }
 */
export function getExamCountdown(exam, now) {
  const examDate = parseDateTime(`${exam.date}T${exam.startTime}:00`)
  return formatCountdown(examDate, now)
}

/**
 * 获取考试精确倒计时（用于非常临近的情况）
 * @param {object} exam
 * @param {Date} now
 * @returns {string}
 */
export function getExamPreciseCountdown(exam, now) {
  const examDate = parseDateTime(`${exam.date}T${exam.startTime}:00`)
  return formatExamCountdown(examDate, now)
}

/**
 * 获取考试日期格式化
 * @param {object} exam
 * @returns {string} 如：8月21日 · 09:00
 */
export function formatExamDate(exam) {
  const date = parseDateTime(`${exam.date}T00:00:00`)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日 · ${exam.startTime}`
}

/**
 * 获取考试状态
 * @param {object} exam
 * @param {Date} now
 * @returns {string} 'upcoming' | 'today' | 'finished'
 */
export function getExamStatus(exam, now) {
  const examDate = parseDateTime(`${exam.date}T${exam.startTime}:00`)
  const examEnd = parseDateTime(`${exam.date}T${exam.endTime}:00`)

  if (now >= examEnd) return 'finished'
  if (now >= examDate) return 'ongoing'

  // 判断是否是今天
  const examDay = new Date(exam.date)
  if (examDay.toDateString() === now.toDateString()) return 'today'

  return 'upcoming'
}

/**
 * 获取考试数量摘要
 * @param {Date} now
 * @returns {object} { count, nearestCourse, daysUntil }
 */
export function getExamSummary(now) {
  const nearest = getNearestExam(now)
  if (!nearest) {
    return { count: 0, nearestCourse: null, daysUntil: null }
  }

  const countdown = getExamCountdown(nearest, now)
  return {
    count: getUpcomingExams(now).length,
    nearestCourse: nearest.course,
    daysUntil: countdown
  }
}
