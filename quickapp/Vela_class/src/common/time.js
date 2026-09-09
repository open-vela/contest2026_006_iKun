/**
 * 时间工具模块
 * 提供日期格式化、倒计时计算等功能
 */

/**
 * 获取当前时间（支持调试覆盖）
 * @param {Date} debugNow 调试用时间
 * @returns {Date}
 */
export function getNow(debugNow) {
  return debugNow || new Date()
}

/**
 * 格式化时间为 HH:MM
 * @param {Date} date
 * @returns {string}
 */
export function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * 格式化完整日期：8月18日 · 周二
 * @param {Date} date
 * @returns {string}
 */
export function formatFullDate(date) {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${month}月${day}日 · ${days[date.getDay()]}`
}

/**
 * 解析时间字符串为当天的 Date 对象
 * @param {string} timeStr 格式：HH:MM
 * @param {Date} baseDate 基准日期
 * @returns {Date}
 */
export function parseTimeToDate(timeStr, baseDate) {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const date = new Date(baseDate)
  date.setHours(hours, minutes, 0, 0)
  return date
}

/**
 * 解析日期时间字符串
 * @param {string} dateTimeStr 格式：YYYY-MM-DDTHH:MM:SS
 * @returns {Date|null} 解析失败返回 null
 */
export function parseDateTime(dateTimeStr) {
  if (!dateTimeStr) {
    return null
  }
  const date = new Date(dateTimeStr)
  if (isNaN(date.getTime())) {
    return null
  }
  return date
}

/**
 * 计算两个时间之间的分钟差
 * @param {Date} start
 * @param {Date} end
 * @returns {number}
 */
export function diffMinutes(start, end) {
  return Math.floor((end - start) / (1000 * 60))
}

/**
 * 格式化倒计时（考试用）
 * @param {Date} targetDate
 * @param {Date} now
 * @returns {object} { value, unit }
 */
export function formatCountdown(targetDate, now) {
  const diffMs = targetDate - now
  if (diffMs <= 0) return { value: 0, unit: '已结束', isFinished: true }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return { value: diffDays, unit: '天', isFinished: false }
  }
  if (diffHours > 0) {
    return { value: diffHours, unit: '小时', isFinished: false }
  }

  const diffMins = Math.floor(diffMs / (1000 * 60))
  return { value: diffMins, unit: '分钟', isFinished: false }
}

/**
 * 获取星期数字（1-7，1是周一）
 * @param {Date} date
 * @returns {number}
 */
export function getWeekdayNumber(date) {
  const day = date.getDay()
  return day === 0 ? 7 : day
}

/**
 * 判断是否是今天
 * @param {Date} date
 * @param {Date} now
 * @returns {boolean}
 */
export function isToday(date, now) {
  if (!date || !now) {
    return false
  }
  return date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
}
