/**
 * 本地存储模块
 * 使用 @system.storage 实现离线数据持久化
 */

import { courses, exams, tasks } from './data'

const STORAGE_KEYS = {
  COURSES: 'campus_courses',
  EXAMS: 'campus_exams',
  TASKS: 'campus_tasks',
  SETTINGS: 'campus_settings'
}

/**
 * 初始化存储（首次启动时写入 Mock 数据）
 */
export function initStorage() {
  try {
    // 检查是否已有数据
    const storedCourses = localStorage.getItem(STORAGE_KEYS.COURSES)
    if (!storedCourses) {
      // 首次启动，写入 Mock 数据
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses))
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams))
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
      console.log('Storage initialized with mock data')
    } else {
      console.log('Storage already initialized')
    }
  } catch (e) {
    console.error('Failed to init storage:', e)
  }
}

/**
 * 获取课程数据
 * @returns {Array}
 */
export function getCourses() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COURSES)
    return data ? JSON.parse(data) : courses
  } catch (e) {
    console.error('Failed to get courses:', e)
    return courses
  }
}

/**
 * 获取考试数据
 * @returns {Array}
 */
export function getExams() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EXAMS)
    return data ? JSON.parse(data) : exams
  } catch (e) {
    console.error('Failed to get exams:', e)
    return exams
  }
}

/**
 * 获取待办数据
 * @returns {Array}
 */
export function getTasks() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS)
    return data ? JSON.parse(data) : tasks
  } catch (e) {
    console.error('Failed to get tasks:', e)
    return tasks
  }
}

/**
 * 更新任务状态
 * @param {string} taskId
 * @param {boolean} finished
 */
export function updateTaskStatus(taskId, finished) {
  try {
    const tasks = getTasks()
    const index = tasks.findIndex(t => t.id === taskId)
    if (index !== -1) {
      tasks[index].finished = finished
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
    }
  } catch (e) {
    console.error('Failed to update task:', e)
  }
}

/**
 * 重置为 Mock 数据（调试用）
 */
export function resetToMockData() {
  try {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses))
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams))
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
    console.log('Storage reset to mock data')
  } catch (e) {
    console.error('Failed to reset storage:', e)
  }
}
