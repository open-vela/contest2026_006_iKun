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
  TASKS: 'campus_tasks',
  SEMESTER_START: 'campus_semester_start',
  DEBUG_USE_MOCK_DATA: 'debug_use_mock_data'
}

// 内存缓存
let courseCache = []
let examCache = []
let taskCache = []
let semesterWeek1StartCache = null // 学期第一周周一日期字符串 YYYY-MM-DD
let useMockDataCache = true // 默认启用Mock数据
let storageReady = false
let initPromise = null

/**
 * 同步Mock数据设置状态
 * 从Storage读取最新状态并更新缓存
 * @returns {Promise<boolean>}
 */
export function syncMockDataSetting() {
  return new Promise((resolve) => {
    storage.get({
      key: STORAGE_KEYS.DEBUG_USE_MOCK_DATA,
      success: function (data) {
        if (data === 'true') {
          useMockDataCache = true
        } else if (data === 'false') {
          useMockDataCache = false
        }
        resolve(useMockDataCache)
      },
      fail: function () {
        resolve(useMockDataCache)
      }
    })
  })
}

/**
 * 初始化存储（单例）
 * 从 system.storage 读取数据，如果不存在则使用 Mock数据
 * @returns {Promise}
 */
export function initStorage() {
  if (storageReady) {
    return Promise.resolve()
  }

  if (initPromise) {
    return initPromise
  }

  initPromise = new Promise((resolve) => {
    let loaded = 0
    const total = 5

    const checkComplete = () => {
      loaded++
      if (loaded >= total) {
        storageReady = true
        resolve()
      }
    }

    // 读取Mock数据设置
    storage.get({
      key: STORAGE_KEYS.DEBUG_USE_MOCK_DATA,
      success: function (data) {
        if (data === 'true') {
          useMockDataCache = true
        } else if (data === 'false') {
          useMockDataCache = false
        }
        checkComplete()
      },
      fail: function () {
        checkComplete()
      }
    })

    // 读取课程
    storage.get({
      key: STORAGE_KEYS.COURSES,
      success: function (data) {
        try {
          courseCache = data ? JSON.parse(data) : []
        } catch (e) {
          courseCache = []
        }
        checkComplete()
      },
      fail: function () {
        courseCache = []
        checkComplete()
      }
    })

    // 读取考试
    storage.get({
      key: STORAGE_KEYS.EXAMS,
      success: function (data) {
        try {
          examCache = data ? JSON.parse(data) : []
        } catch (e) {
          examCache = []
        }
        checkComplete()
      },
      fail: function () {
        examCache = []
        checkComplete()
      }
    })

    // 读取任务
    storage.get({
      key: STORAGE_KEYS.TASKS,
      success: function (data) {
        try {
          taskCache = data ? JSON.parse(data) : []
        } catch (e) {
          taskCache = []
        }
        checkComplete()
      },
      fail: function () {
        taskCache = []
        checkComplete()
      }
    })

    // 读取学期第一周设置
    storage.get({
      key: STORAGE_KEYS.SEMESTER_START,
      success: function (data) {
        semesterWeek1StartCache = data || null
        checkComplete()
      },
      fail: function () {
        semesterWeek1StartCache = null
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
 * 获取课程数据
 * @returns {Array}
 */
export function getCourses() {
  if (useMockDataCache) {
    const userCourseIds = courseCache.map(c => c.id)
    const mockCourses = courses.filter(c => !userCourseIds.includes(c.id))
    return [...mockCourses, ...courseCache]
  }
  return courseCache
}

/**
 * 获取考试数据
 * @returns {Array}
 */
export function getExams() {
  if (useMockDataCache) {
    const userExamIds = examCache.map(e => e.id)
    const mockExams = exams.filter(e => !userExamIds.includes(e.id))
    return [...mockExams, ...examCache]
  }
  return examCache
}

/**
 * 获取待办数据
 * @returns {Array}
 */
export function getTasks() {
  if (useMockDataCache) {
    const userTaskIds = taskCache.map(t => t.id)
    const mockTasks = tasks.filter(t => !userTaskIds.includes(t.id))
    return [...mockTasks, ...taskCache]
  }
  return taskCache
}

/**
 * 从Storage读取是否使用默认Mock数据
 * 与 syncMockDataSetting 复用同一套逻辑
 * @returns {Promise<boolean>}
 */
export function getUseMockDataFromStorage() {
  return syncMockDataSetting()
}

/**
 * 设置是否使用默认Mock数据
 * @param {boolean} useMock
 * @returns {Promise}
 */
export function setUseMockData(useMock) {
  return new Promise((resolve, reject) => {
    const oldValue = useMockDataCache
    
    storage.set({
      key: STORAGE_KEYS.DEBUG_USE_MOCK_DATA,
      value: String(useMock),
      success: function () {
        useMockDataCache = useMock
        resolve()
      },
      fail: function (data, code) {
        useMockDataCache = oldValue
        reject(new Error('Failed to save setting'))
      }
    })
  })
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

    const oldTaskCache = taskCache

    taskCache = taskCache.map(task => {
      if (task.id !== taskId) {
        return task
      }
      return { ...task, finished: finished }
    })

    storage.set({
      key: STORAGE_KEYS.TASKS,
      value: JSON.stringify(taskCache),
      success: function () {
        resolve(true)
      },
      fail: function (data, code) {
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
          const parsed = data ? JSON.parse(data) : []
          taskCache = parsed.map(task => ({ ...task }))
          resolve(taskCache)
        } catch (e) {
          resolve(taskCache)
        }
      },
      fail: function () {
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
          const parsed = data ? JSON.parse(data) : []
          examCache = parsed.map(exam => ({ ...exam }))
          resolve(examCache)
        } catch (e) {
          resolve(examCache)
        }
      },
      fail: function () {
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
          const parsed = data ? JSON.parse(data) : []
          courseCache = parsed.map(course => ({ ...course }))
          resolve(courseCache)
        } catch (e) {
          resolve(courseCache)
        }
      },
      fail: function () {
        resolve(courseCache)
      }
    })
  })
}

/**
 * 添加新课程并持久化
 * @param {object} courseData 课程数据（不含id）
 * @returns {Promise<object>} 新课程对象
 */
export function addCourse(courseData) {
  return new Promise((resolve, reject) => {
    const newId = 'course_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    const newCourse = { id: newId, ...courseData }
    const oldCourseCache = courseCache

    courseCache = [...courseCache, newCourse]

    storage.set({
      key: STORAGE_KEYS.COURSES,
      value: JSON.stringify(courseCache),
      success: function () {
        resolve(newCourse)
      },
      fail: function (data, code) {
        courseCache = oldCourseCache
        reject(new Error('Failed to save course'))
      }
    })
  })
}

/**
 * 判断是否为用户手动添加的课程（非默认 Mock 课程）
 * @param {string} courseId
 * @returns {boolean}
 */
export function isUserCreatedCourse(courseId) {
  const isDefaultCourse = courses.some(c => c.id === courseId)
  if (isDefaultCourse) {
    return false
  }
  return courseCache.some(c => c.id === courseId)
}

/**
 * 删除用户手动添加的课程
 * @param {string} courseId
 * @returns {Promise<boolean>}
 */
export function deleteCourse(courseId) {
  return new Promise((resolve, reject) => {
    const courseIndex = courseCache.findIndex(c => c.id === courseId)
    if (courseIndex === -1) {
      reject(new Error('Course not found'))
      return
    }

    const isDefaultCourse = courses.some(c => c.id === courseId)
    if (isDefaultCourse) {
      reject(new Error('Cannot delete default course'))
      return
    }

    const oldCourseCache = courseCache
    courseCache = courseCache.filter(c => c.id !== courseId)

    storage.set({
      key: STORAGE_KEYS.COURSES,
      value: JSON.stringify(courseCache),
      success: function () {
        resolve(true)
      },
      fail: function (data, code) {
        courseCache = oldCourseCache
        reject(new Error('Failed to delete course'))
      }
    })
  })
}

/**
 * 添加新考试并持久化
 * @param {object} examData 考试数据（不含id）
 * @returns {Promise<object>} 新考试对象
 */
export function addExam(examData) {
  return new Promise((resolve, reject) => {
    const newId = 'exam_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    const newExam = { id: newId, ...examData }
    const oldExamCache = examCache

    examCache = [...examCache, newExam]

    storage.set({
      key: STORAGE_KEYS.EXAMS,
      value: JSON.stringify(examCache),
      success: function () {
        resolve(newExam)
      },
      fail: function (data, code) {
        examCache = oldExamCache
        reject(new Error('Failed to save exam'))
      }
    })
  })
}

/**
 * 判断是否为用户手动添加的考试（非默认 Mock 考试）
 * @param {string} examId
 * @returns {boolean}
 */
export function isUserCreatedExam(examId) {
  const isDefaultExam = exams.some(e => e.id === examId)
  if (isDefaultExam) {
    return false
  }
  return examCache.some(e => e.id === examId)
}

/**
 * 删除用户手动添加的考试
 * @param {string} examId
 * @returns {Promise<boolean>}
 */
export function deleteExam(examId) {
  return new Promise((resolve, reject) => {
    const examIndex = examCache.findIndex(e => e.id === examId)
    if (examIndex === -1) {
      reject(new Error('Exam not found'))
      return
    }

    const isDefaultExam = exams.some(e => e.id === examId)
    if (isDefaultExam) {
      reject(new Error('Cannot delete default exam'))
      return
    }

    const oldExamCache = examCache
    examCache = examCache.filter(e => e.id !== examId)

    storage.set({
      key: STORAGE_KEYS.EXAMS,
      value: JSON.stringify(examCache),
      success: function () {
        resolve(true)
      },
      fail: function (data, code) {
        examCache = oldExamCache
        reject(new Error('Failed to delete exam'))
      }
    })
  })
}

/**
 * 添加新待办并持久化
 * @param {object} taskData 待办数据（不含id和finished）
 * @returns {Promise<object>} 新待办对象
 */
export function addTask(taskData) {
  return new Promise((resolve, reject) => {
    const newId = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    const newTask = { id: newId, ...taskData, finished: false }
    const oldTaskCache = taskCache

    taskCache = [...taskCache, newTask]

    storage.set({
      key: STORAGE_KEYS.TASKS,
      value: JSON.stringify(taskCache),
      success: function () {
        resolve(newTask)
      },
      fail: function (data, code) {
        taskCache = oldTaskCache
        reject(new Error('Failed to save task'))
      }
    })
  })
}

/**
 * 判断是否为用户手动添加的待办（非默认 Mock 待办）
 * @param {string} taskId
 * @returns {boolean}
 */
export function isUserCreatedTask(taskId) {
  const isDefaultTask = tasks.some(t => t.id === taskId)
  if (isDefaultTask) {
    return false
  }
  return taskCache.some(t => t.id === taskId)
}

/**
 * 删除用户手动添加的待办
 * @param {string} taskId
 * @returns {Promise<boolean>}
 */
export function deleteTask(taskId) {
  return new Promise((resolve, reject) => {
    const taskIndex = taskCache.findIndex(t => t.id === taskId)
    if (taskIndex === -1) {
      reject(new Error('Task not found'))
      return
    }

    const isDefaultTask = tasks.some(t => t.id === taskId)
    if (isDefaultTask) {
      reject(new Error('Cannot delete default task'))
      return
    }

    const oldTaskCache = taskCache
    taskCache = taskCache.filter(t => t.id !== taskId)

    storage.set({
      key: STORAGE_KEYS.TASKS,
      value: JSON.stringify(taskCache),
      success: function () {
        resolve(true)
      },
      fail: function (data, code) {
        taskCache = oldTaskCache
        reject(new Error('Failed to delete task'))
      }
    })
  })
}

/**
 * 重新加载默认Mock数据（调试用）
 * 只清理Mock数据缓存，不修改用户数据和开关状态
 * @returns {Promise}
 */
export function reloadMockData() {
  return new Promise((resolve) => {
    resolve()
  })
}

/**
 * 获取学期第一周周一日期
 * @returns {string|null} YYYY-MM-DD 格式，未设置时返回 null
 */
export function getSemesterWeek1Start() {
  return semesterWeek1StartCache
}

/**
 * 从 Storage 重新读取学期第一周设置
 * @returns {Promise<string|null>}
 */
export function refreshSemesterStartFromStorage() {
  return new Promise((resolve, reject) => {
    storage.get({
      key: STORAGE_KEYS.SEMESTER_START,
      success: function (data) {
        semesterWeek1StartCache = data || null
        resolve(semesterWeek1StartCache)
      },
      fail: function () {
        resolve(semesterWeek1StartCache)
      }
    })
  })
}

/**
 * 设置学期第一周周一日期
 * @param {string} dateStr YYYY-MM-DD 格式的日期字符串
 * @returns {Promise}
 */
export function setSemesterWeek1Start(dateStr) {
  return new Promise((resolve, reject) => {
    const oldValue = semesterWeek1StartCache
    semesterWeek1StartCache = dateStr

    storage.set({
      key: STORAGE_KEYS.SEMESTER_START,
      value: dateStr,
      success: function () {
        resolve()
      },
      fail: function (data, code) {
        semesterWeek1StartCache = oldValue
        reject(new Error('Failed to save semester start'))
      }
    })
  })
}
