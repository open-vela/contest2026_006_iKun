/**
 * 考试逻辑模块
 * 提供考试筛选、倒计时计算等功能
 */

import { getExams } from './storage'
import { formatCountdown, formatExamCountdown, parseDateTime, getNow } from './time'

// 性能诊断
const EXAM_PERF_START = Date.now()
function perfLog(label) {
  console.log('[PERF:EXAM]', label, '+', Date.now() - EXAM_PERF_START, 'ms')
}

/**
 * 获取最近的考试（优先选择进行中的考试）
 * 选择优先级：
 * 1. 正在进行中的考试（结束时间更早的优先）
 * 2. 即将开始的考试（开始时间更早的优先）
 * @param {Date} now
 * @returns {object|null}
 */
export function getNearestExam(now) {
  perfLog('getNearestExam_START')
  const exams = getExams()
  const validExams = exams
    .filter(e => {
      // 考试结束时间 > 当前时间 才算有效
      const examEnd = parseDateTime(`${e.date}T${e.endTime}:00`)
      return examEnd > now
    })

  // 分类：进行中 和 即将开始
  const ongoingExams = []
  const upcomingExams = []

  validExams.forEach(e => {
    const status = getExamStatus(e, now)
    if (status === 'ongoing') {
      ongoingExams.push(e)
    } else {
      upcomingExams.push(e)
    }
  })

  // 优先选择进行中的考试
  if (ongoingExams.length > 0) {
    // 多个进行中考试时，选择结束时间更早的
    ongoingExams.sort((a, b) => {
      const endA = parseDateTime(`${a.date}T${a.endTime}:00`)
      const endB = parseDateTime(`${b.date}T${b.endTime}:00`)
      return endA - endB
    })
    perfLog('getNearestExam_END (ongoing)')
    return ongoingExams[0]
  }

  // 否则选择即将开始的考试
  upcomingExams.sort((a, b) => {
    const startA = parseDateTime(`${a.date}T${a.startTime}:00`)
    const startB = parseDateTime(`${b.date}T${b.startTime}:00`)
    return startA - startB
  })

  const result = upcomingExams.length > 0 ? upcomingExams[0] : null
  perfLog('getNearestExam_END (found: ' + !!result + ')')
  return result
}

/**
 * 获取所有即将到来的考试（包括进行中的考试）
 * @param {Date} now
 * @returns {Array}
 */
export function getUpcomingExams(now) {
  const exams = getExams()
  return exams
    .filter(e => {
      // 考试结束时间 > 当前时间 才算有效
      const examEnd = parseDateTime(`${e.date}T${e.endTime}:00`)
      return examEnd > now
    })
    .sort((a, b) => {
      const dateA = parseDateTime(`${a.date}T${a.startTime}:00`)
      const dateB = parseDateTime(`${b.date}T${b.startTime}:00`)
      return dateA - dateB
    })
}

/**
 * 获取考试倒计时（根据状态返回不同信息）
 * @param {object} exam
 * @param {Date} now
 * @returns {object} { value, unit, status, isOngoing }
 */
export function getExamCountdown(exam, now) {
  const status = getExamStatus(exam, now)
  const examDate = parseDateTime(`${exam.date}T${exam.startTime}:00`)
  const examEnd = parseDateTime(`${exam.date}T${exam.endTime}:00`)

  if (status === 'ongoing') {
    // 考试进行中：计算剩余时间
    const remaining = examEnd - now
    const totalMinutes = Math.floor(remaining / (1000 * 60))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    if (hours > 0) {
      return { value: hours, unit: '小时', status: 'ongoing', isOngoing: true, remainingMinutes: minutes }
    }
    return { value: minutes, unit: '分钟', status: 'ongoing', isOngoing: true, remainingMinutes: 0 }
  }

  // 考试未开始：计算距离开始的时间
  const result = formatCountdown(examDate, now)
  return { ...result, status: status, isOngoing: false }
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
  perfLog('getExamSummary_START')
  const nearest = getNearestExam(now)
  if (!nearest) {
    perfLog('getExamSummary_END (no exam)')
    return { count: 0, nearestCourse: null, daysUntil: null }
  }

  const countdown = getExamCountdown(nearest, now)
  const result = {
    count: getUpcomingExams(now).length,
    nearestCourse: nearest.course,
    daysUntil: countdown
  }
  perfLog('getExamSummary_END (count: ' + result.count + ')')
  return result
}

/**
 * 获取历史考试（已结束的考试）
 * @param {Date} now
 * @returns {Array}
 */
export function getHistoryExams(now) {
  const exams = getExams()
  return exams
    .filter(e => {
      // 考试结束时间 <= 当前时间 才算历史考试
      const examEnd = parseDateTime(`${e.date}T${e.endTime}:00`)
      return examEnd <= now
    })
    .sort((a, b) => {
      // 按结束时间倒序排列，最近结束的在前面
      const dateA = parseDateTime(`${a.date}T${a.endTime}:00`)
      const dateB = parseDateTime(`${b.date}T${b.endTime}:00`)
      return dateB - dateA
    })
}

/**
 * 格式化考试日期（详细）
 * @param {object} exam
 * @returns {string} 如：2026年9月5日
 */
export function formatExamDateFull(exam) {
  const date = parseDateTime(`${exam.date}T00:00:00`)
  if (!date) return exam.date
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}年${month}月${day}日`
}
