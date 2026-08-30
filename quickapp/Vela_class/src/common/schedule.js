/**
 * 课程逻辑模块
 * 提供课程筛选、当前课程判断、下一课程查找等功能
 */

import { getCourses, getSemesterWeek1Start } from './storage'
import { getNow, parseTimeToDate, diffMinutes, getWeekdayNumber, formatRemainingMinutes } from './time'

/**
 * 获取学期第一周的周一日期
 * @returns {Date|null}
 */
function getWeek1Monday() {
  const week1Start = getSemesterWeek1Start()
  if (!week1Start) {
    return null
  }
  return new Date(week1Start + 'T00:00:00')
}

/**
 * 根据日期计算该日期所在周的周一
 * @param {Date} date
 * @returns {Date}
 */
function getMondayOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * 计算当前教学周
 * @param {Date} now 当前时间
 * @returns {number} 教学周数，未设置学期第一周时返回1，在学期开始前返回0
 */
export function calculateCurrentWeek(now) {
  const week1Monday = getWeek1Monday()

  // 如果未设置学期第一周，默认返回第1周
  if (!week1Monday) {
    return 1
  }

  // 计算当前日期所在周的周一
  const currentMonday = getMondayOfWeek(now)

  // 计算周数差
  const diffTime = currentMonday.getTime() - week1Monday.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const weekNumber = Math.floor(diffDays / 7) + 1

  // 如果在第一周之前，返回0表示学期开始前
  if (weekNumber < 1) {
    return 0
  }

  return weekNumber
}

/**
 * 获取今天的课程列表
 * @param {Date} now 当前时间
 * @param {number} currentWeek 当前教学周（不传则自动计算）
 * @returns {Array}
 */
export function getTodayCourses(now, currentWeek) {
  const week = currentWeek !== undefined ? currentWeek : calculateCurrentWeek(now)
  const weekday = getWeekdayNumber(now)
  return getCourses()
    .filter(c => c.weekday === weekday && c.weeks.includes(week))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

/**
 * 获取指定星期的课程（按教学周过滤）
 * @param {number} weekday 星期几（1-7）
 * @param {number} currentWeek 当前教学周
 * @returns {Array}
 */
export function getCoursesByWeekday(weekday, currentWeek = 1) {
  return getCourses()
    .filter(c => c.weekday === weekday && c.weeks.includes(currentWeek))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

/**
 * 获取指定星期的所有课程（不按教学周过滤，用于全部模式）
 * @param {number} weekday 星期几（1-7）
 * @returns {Array}
 */
export function getAllCoursesByWeekday(weekday) {
  return getCourses()
    .filter(c => c.weekday === weekday)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

/**
 * 格式化课程周次显示
 * @param {Array} weeks 周次数组
 * @returns {string}
 */
export function formatCourseWeeks(weeks) {
  if (!weeks || weeks.length === 0) return ''

  const totalWeeks = 16
  const allWeeks = Array.from({ length: totalWeeks }, (_, i) => i + 1)

  // 判断是否为全周课程（1-16周）
  if (weeks.length === totalWeeks && allWeeks.every(w => weeks.includes(w))) {
    return '1-16周'
  }

  // 判断是否为单周（奇数周）
  const oddWeeks = allWeeks.filter(w => w % 2 === 1)
  if (weeks.length === oddWeeks.length && oddWeeks.every(w => weeks.includes(w))) {
    return '单周'
  }

  // 判断是否为双周（偶数周）
  const evenWeeks = allWeeks.filter(w => w % 2 === 0)
  if (weeks.length === evenWeeks.length && evenWeeks.every(w => weeks.includes(w))) {
    return '双周'
  }

  // 不规则周次，显示具体周次
  return weeks.join(',') + '周'
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
export function getCurrentCourse(now, currentWeek) {
  const week = currentWeek !== undefined ? currentWeek : calculateCurrentWeek(now)
  const todayCourses = getTodayCourses(now, week)
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
export function getNextCourse(now, currentWeek) {
  const week = currentWeek !== undefined ? currentWeek : calculateCurrentWeek(now)
  const todayCourses = getTodayCourses(now, week)
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
export function getNextCourseAcrossDays(now, currentWeek) {
  const week = currentWeek !== undefined ? currentWeek : calculateCurrentWeek(now)
  // 先检查今天剩余课程
  const nextToday = getNextCourse(now, week)
  if (nextToday) {
    return { course: nextToday, daysLater: 0, date: now }
  }

  // 检查未来7天
  for (let i = 1; i <= 7; i++) {
    const futureDate = new Date(now)
    futureDate.setDate(futureDate.getDate() + i)
    const weekday = getWeekdayNumber(futureDate)
    const courses = getCoursesByWeekday(weekday, week)
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
export function isTodayCoursesFinished(now, currentWeek) {
  const week = currentWeek !== undefined ? currentWeek : calculateCurrentWeek(now)
  const todayCourses = getTodayCourses(now, week)
  if (todayCourses.length === 0) return true
  return todayCourses.every(c => getCourseStatus(c, now) === 'finished')
}
