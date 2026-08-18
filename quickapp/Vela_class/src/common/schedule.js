/**
 * 课程逻辑模块
 * 提供课程筛选、当前课程判断、下一课程查找等功能
 */

import { courses } from './data'
import { getNow, parseTimeToDate, diffMinutes, getWeekdayNumber, formatRemainingMinutes } from './time'

/**
 * 获取今天的课程列表
 * @param {Date} now 当前时间
 * @param {number} currentWeek 当前教学周（默认1）
 * @returns {Array}
 */
export function getTodayCourses(now, currentWeek = 1) {
  const weekday = getWeekdayNumber(now)
  return courses
    .filter(c => c.weekday === weekday && c.weeks.includes(currentWeek))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

/**
 * 获取指定星期的课程
 * @param {number} weekday 星期几（1-7）
 * @param {number} currentWeek 当前教学周
 * @returns {Array}
 */
export function getCoursesByWeekday(weekday, currentWeek = 1) {
  return courses
    .filter(c => c.weekday === weekday && c.weeks.includes(currentWeek))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

/**
 * 获取本周所有课程
 * @param {number} currentWeek 当前教学周
 * @returns {object} 按星期分组的课程
 */
export function getWeekCourses(currentWeek = 1) {
  const weekCourses = {}
  for (let i = 1; i <= 7; i++) {
    weekCourses[i] = getCoursesByWeekday(i, currentWeek)
  }
  return weekCourses
}

/**
 * 获取当前正在进行的课程
 * @param {Date} now
 * @param {number} currentWeek
 * @returns {object|null}
 */
export function getCurrentCourse(now, currentWeek = 1) {
  const todayCourses = getTodayCourses(now, currentWeek)
  for (const course of todayCourses) {
    const startTime = parseTimeToDate(course.startTime, now)
    const endTime = parseTimeToDate(course.endTime, now)
    if (now >= startTime && now < endTime) {
      return course
    }
  }
  return null
}

/**
 * 获取下一节课（今天内）
 * @param {Date} now
 * @param {number} currentWeek
 * @returns {object|null}
 */
export function getNextCourse(now, currentWeek = 1) {
  const todayCourses = getTodayCourses(now, currentWeek)
  for (const course of todayCourses) {
    const startTime = parseTimeToDate(course.startTime, now)
    if (startTime > now) {
      return course
    }
  }
  return null
}

/**
 * 跨天查找下一节课
 * @param {Date} now
 * @param {number} currentWeek
 * @returns {object|null} { course, daysLater, date }
 */
export function getNextCourseAcrossDays(now, currentWeek = 1) {
  // 先检查今天剩余课程
  const nextToday = getNextCourse(now, currentWeek)
  if (nextToday) {
    return { course: nextToday, daysLater: 0, date: now }
  }

  // 检查未来7天
  for (let i = 1; i <= 7; i++) {
    const futureDate = new Date(now)
    futureDate.setDate(futureDate.getDate() + i)
    const weekday = getWeekdayNumber(futureDate)
    const courses = getCoursesByWeekday(weekday, currentWeek)
    if (courses.length > 0) {
      return { course: courses[0], daysLater: i, date: futureDate }
    }
  }
  return null
}

/**
 * 获取课程进度（0-1）
 * @param {object} course
 * @param {Date} now
 * @returns {number}
 */
export function getCourseProgress(course, now) {
  const startTime = parseTimeToDate(course.startTime, now)
  const endTime = parseTimeToDate(course.endTime, now)
  const total = endTime - startTime
  const elapsed = now - startTime
  const progress = elapsed / total
  return Math.max(0, Math.min(1, progress))
}

/**
 * 获取课程剩余时间（分钟）
 * @param {object} course
 * @param {Date} now
 * @returns {number}
 */
export function getCourseRemainingTime(course, now) {
  const endTime = parseTimeToDate(course.endTime, now)
  return Math.max(0, diffMinutes(now, endTime))
}

/**
 * 获取课程状态
 * @param {object} course
 * @param {Date} now
 * @returns {string} 'finished' | 'ongoing' | 'upcoming'
 */
export function getCourseStatus(course, now) {
  const startTime = parseTimeToDate(course.startTime, now)
  const endTime = parseTimeToDate(course.endTime, now)
  if (now >= endTime) return 'finished'
  if (now >= startTime) return 'ongoing'
  return 'upcoming'
}

/**
 * 获取距离开始的分钟数
 * @param {object} course
 * @param {Date} now
 * @returns {number}
 */
export function getMinutesUntilStart(course, now) {
  const startTime = parseTimeToDate(course.startTime, now)
  return Math.max(0, diffMinutes(now, startTime))
}

/**
 * 格式化课程开始状态文字
 * @param {object} course
 * @param {Date} now
 * @returns {string}
 */
export function formatCourseStartStatus(course, now) {
  const minutes = getMinutesUntilStart(course, now)
  if (minutes === 0) return '即将开始'
  return `还有 ${minutes} 分钟`
}

/**
 * 判断今日课程是否全部结束
 * @param {Date} now
 * @param {number} currentWeek
 * @returns {boolean}
 */
export function isTodayCoursesFinished(now, currentWeek = 1) {
  const todayCourses = getTodayCourses(now, currentWeek)
  if (todayCourses.length === 0) return true
  return todayCourses.every(c => getCourseStatus(c, now) === 'finished')
}
