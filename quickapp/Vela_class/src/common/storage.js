/**
 * 本地存储模块
 * 使用 @system.storage 实现离线数据持久化
 * 内存缓存 + system.storage 持久化
 */

import storage from '@system.storage'
import { courses, exams, tasks } from './data'

const STORAGE_KEYS = {
  COURSES: 'campus_courses',
  EXAMS: 'campus_exams',
  TASKS: 'campus_tasks'
}

// 内存缓存
let courseCache = []
let examCache = []
let taskCache = []
let storageReady = false
let initPromise = null

/**
 * 初始化存储（单例）
 * 从 system.storage 读取数据，如果不存在则使用 Mock数据
 * @returns {Promise}
 */
export function initStorage() {
  // 已经初始化完成
  if (storageReady) {
    return Promise.resolve()
  }

  // 正在初始化中，返回同一个 Promise
  if (initPromise) {
    return initPromise
  }

  initPromise = new Promise((resolve) => {
    let loaded = 0
    const total = 3

    const checkComplete = () => {
      loaded++
      if (loaded >= total) {
        storageReady = true
        resolve()
      }
    }

    // 读取课程
    storage.get({
      key: STORAGE_KEYS.COURSES,
      success: function (data) {
        try {
          courseCache = data ? JSON.parse(data) : [...courses]
        } catch (e) {
          console.error('Failed to parse courses:', e)
          courseCache = [...courses]
        }
        checkComplete()
      },
      fail: function (data, code) {
        console.error('Failed to get courses:', code)
        courseCache = [...courses]
        checkComplete()
      }
    })

    // 读取考试
    storage.get({
      key: STORAGE_KEYS.EXAMS,
      success: function (data) {
        try {
          examCache = data ? JSON.parse(data) : [...exams]
        } catch (e) {
          console.error('Failed to parse exams:', e)
          examCache = [...exams]
        }
        checkComplete()
      },
      fail: function (data, code) {
        console.error('Failed to get exams:', code)
        examCache = [...exams]
        checkComplete()
      }
    })

    // 读取任务
    storage.get({
      key: STORAGE_KEYS.TASKS,
      success: function (data) {
        try {
          taskCache = data ? JSON.parse(data) : [...tasks]
        } catch (e) {
          console.error('Failed to parse tasks:', e)
          taskCache = [...tasks]
        }
        // 如果是首次运行（没有存储数据），写入 Mock 数据
        if (!data) {
          saveTasksToStorage()
        }
        checkComplete()
      },
      fail: function (data, code) {
        console.error('Failed to get tasks:', code)
        taskCache = [...tasks]
        saveTasksToStorage()
        checkComplete()
      }
    })
  })

  return initPromise
}

/**
 * 确保 Storage 已初始化完成
 * @returns {Promise}
 */
export function ensureStorageReady() {
  if (storageReady) {
    return Promise.resolve()
  }

  return initStorage()
}

/**
 * 保存任务到 system.storage
 */
function saveTasksToStorage() {
  storage.set({
    key: STORAGE_KEYS.TASKS,
    value: JSON.stringify(taskCache),
    success: function () {
      console.log('Tasks saved to storage')
    },
    fail: function (data, code) {
      console.error('Failed to save tasks:', code)
    }
  })
}

/**
 * 获取课程数据
 * @returns {Array}
 */
export function getCourses() {
  return courseCache
}

/**
 * 获取考试数据
 * @returns {Array}
 */
export function getExams() {
  return examCache
}

/**
 * 获取待办数据
 * @returns {Array}
 */
export function getTasks() {
  return taskCache
}

/**
 * 更新任务状态并持久化（不可变更新）
 * @param {string} taskId
 * @param {boolean} finished
 * @returns {Promise<boolean>}
 */
export function updateTaskStatus(taskId, finished) {
  return new Promise((resolve, reject) => {
    const index = taskCache.findIndex(t => t.id === taskId)
    if (index === -1) {
      reject(new Error('Task not found'))
      return
    }

    // 保存旧缓存用于回滚
    const oldTaskCache = taskCache

    // 不可变更新：创建新数组和新任务对象
    taskCache = taskCache.map(task => {
      if (task.id !== taskId) {
        return task
      }
      return { ...task, finished: finished }
    })

    // 持久化到 storage
    storage.set({
      key: STORAGE_KEYS.TASKS,
      value: JSON.stringify(taskCache),
      success: function () {
        console.log('Task status updated and saved:', taskId, finished)
        resolve(true)
      },
      fail: function (data, code) {
        console.error('Failed to save task status:', code)
        // 回滚到旧缓存
        taskCache = oldTaskCache
        reject(new Error('Failed to save task status'))
      }
    })
  })
}

/**
 * 从 Storage 重新读取任务数据
 * @returns {Promise<Array>}
 */
export function refreshTasksFromStorage() {
  return new Promise((resolve, reject) => {
    storage.get({
      key: STORAGE_KEYS.TASKS,
      success: function (data) {
        try {
          // 没有持久化数据时使用默认 mock 数据
          const parsed = data ? JSON.parse(data) : [...tasks]
          // 生成新的数组和对象，避免引用旧对象
          taskCache = parsed.map(task => ({ ...task }))
          resolve(taskCache)
        } catch (e) {
          console.error('Failed to parse tasks on refresh:', e)
          // 读取失败时保留当前缓存
          resolve(taskCache)
        }
      },
      fail: function (data, code) {
        console.error('Failed to refresh tasks from storage:', code)
        // 读取失败时保留当前缓存
        resolve(taskCache)
      }
    })
  })
}

/**
 * 从 Storage 重新读取考试数据
 * @returns {Promise<Array>}
 */
export function refreshExamsFromStorage() {
  return new Promise((resolve, reject) => {
    storage.get({
      key: STORAGE_KEYS.EXAMS,
      success: function (data) {
        try {
          // 没有持久化数据时使用默认 mock 数据
          const parsed = data ? JSON.parse(data) : [...exams]
          // 生成新的数组和对象，避免引用旧对象
          examCache = parsed.map(exam => ({ ...exam }))
          resolve(examCache)
        } catch (e) {
          console.error('Failed to parse exams on refresh:', e)
          // 读取失败时保留当前缓存
          resolve(examCache)
        }
      },
      fail: function (data, code) {
        console.error('Failed to refresh exams from storage:', code)
        // 读取失败时保留当前缓存
        resolve(examCache)
      }
    })
  })
}

/**
 * 从 Storage 重新读取课程数据
 * @returns {Promise<Array>}
 */
export function refreshCoursesFromStorage() {
  return new Promise((resolve, reject) => {
    storage.get({
      key: STORAGE_KEYS.COURSES,
      success: function (data) {
        try {
          // 没有持久化数据时使用默认 mock 数据
          const parsed = data ? JSON.parse(data) : [...courses]
          // 生成新的数组和对象，避免引用旧对象
          courseCache = parsed.map(course => ({ ...course }))
          resolve(courseCache)
        } catch (e) {
          console.error('Failed to parse courses on refresh:', e)
          // 读取失败时保留当前缓存
          resolve(courseCache)
        }
      },
      fail: function (data, code) {
        console.error('Failed to refresh courses from storage:', code)
        // 读取失败时保留当前缓存
        resolve(courseCache)
      }
    })
  })
}

/**
 * 重置为 Mock 数据（调试用）
 * @returns {Promise}
 */
export function resetToMockData() {
  return new Promise((resolve) => {
    courseCache = [...courses]
    examCache = [...exams]
    taskCache = [...tasks]

    let saved = 0
    const total = 3

    const checkComplete = () => {
      saved++
      if (saved >= total) {
        resolve()
      }
    }

    storage.set({
      key: STORAGE_KEYS.COURSES,
      value: JSON.stringify(courseCache),
      success: checkComplete,
      fail: checkComplete
    })

    storage.set({
      key: STORAGE_KEYS.EXAMS,
      value: JSON.stringify(examCache),
      success: checkComplete,
      fail: checkComplete
    })

    storage.set({
      key: STORAGE_KEYS.TASKS,
      value: JSON.stringify(taskCache),
      success: checkComplete,
      fail: checkComplete
    })
  })
}
