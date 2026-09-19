/**
 * 本地存储模块
 * 使用 @system.storage 实现离线数据持久化
 * 内存缓存 + system.storage 持久化
 * 
 * 数据架构：单源 + Mock ID 过滤
 * - 所有数据统一存在 storage/cache 中
 * - Mock 数据可删可改，无保护限制
 * - 用原始 Mock ID 集合记录哪些是默认数据，用于开关过滤显示
 */

import storage from '@system.storage'
import { courses, exams, tasks } from './data'

const STORAGE_KEYS = {
  COURSES: 'campus_courses',
  EXAMS: 'campus_exams',
  TASKS: 'campus_tasks',
  SEMESTER_START: 'campus_semester_start',
  DEBUG_USE_MOCK_DATA: 'debug_use_mock_data',
  TASK_HISTORY_DAYS: 'task_history_days'
}

// 原始 Mock ID 集合，用于区分默认数据和用户数据
const ORIGINAL_COURSE_IDS = new Set(courses.map(c => c.id))
const ORIGINAL_EXAM_IDS = new Set(exams.map(e => e.id))
const ORIGINAL_TASK_IDS = new Set(tasks.map(t => t.id))

// 内存缓存
let courseCache = []
let examCache = []
let taskCache = []
let semesterWeek1StartCache = null
let useMockDataCache = true
let taskHistoryDaysCache = 15
let storageReady = false
let initPromise = null

/**
 * 同步Mock数据设置状态
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
 * 首次启动时将 Mock 数据深拷贝初始化写入 storage
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
    const total = 6

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
        // 首次启动，初始化 Mock 课程数据
        courseCache = courses.map(c => ({ ...c, weeks: [...c.weeks] }))
        storage.set({
          key: STORAGE_KEYS.COURSES,
          value: JSON.stringify(courseCache),
          success: function () {
            checkComplete()
          },
          fail: function () {
            checkComplete()
          }
        })
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
        // 首次启动，初始化 Mock 考试数据
        examCache = exams.map(e => ({ ...e }))
        storage.set({
          key: STORAGE_KEYS.EXAMS,
          value: JSON.stringify(examCache),
          success: function () {
            checkComplete()
          },
          fail: function () {
            checkComplete()
          }
        })
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
        // 首次启动，初始化 Mock 任务数据
        taskCache = tasks.map(t => ({ ...t }))
        storage.set({
          key: STORAGE_KEYS.TASKS,
          value: JSON.stringify(taskCache),
          success: function () {
            checkComplete()
          },
          fail: function () {
            checkComplete()
          }
        })
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

    // 读取历史待办归档天数
    storage.get({
      key: STORAGE_KEYS.TASK_HISTORY_DAYS,
      success: function (data) {
        const parsed = parseInt(data)
        taskHistoryDaysCache = isNaN(parsed) ? 15 : parsed
        checkComplete()
      },
      fail: function () {
        taskHistoryDaysCache = 15
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
 * 获取课程数据（单源 + 开关过滤）
 * @returns {Array}
 */
export function getCourses() {
  if (!useMockDataCache) {
    return courseCache.filter(c => !ORIGINAL_COURSE_IDS.has(c.id))
  }
  return courseCache
}

/**
 * 获取考试数据（单源 + 开关过滤）
 * @returns {Array}
 */
export function getExams() {
  if (!useMockDataCache) {
    return examCache.filter(e => !ORIGINAL_EXAM_IDS.has(e.id))
  }
  return examCache
}

/**
 * 获取待办数据（单源 + 开关过滤）
 * @returns {Array}
 */
export function getTasks() {
  if (!useMockDataCache) {
    return taskCache.filter(t => !ORIGINAL_TASK_IDS.has(t.id))
  }
  return taskCache
}

/**
 * 从Storage读取是否使用默认Mock数据
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
 * 更新任务状态并持久化
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
      if (finished) {
        return { ...task, finished: true, finishedAt: new Date().toISOString() }
      } else {
        return { ...task, finished: false, finishedAt: '' }
      }
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
  return !ORIGINAL_COURSE_IDS.has(courseId)
}

/**
 * 删除课程（允许删除 Mock 课程）
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
 * 清空所有课程
 * @returns {Promise<boolean>}
 */
export function clearAllCourses() {
  return new Promise((resolve, reject) => {
    const oldCourseCache = courseCache

    courseCache = []

    storage.set({
      key: STORAGE_KEYS.COURSES,
      value: JSON.stringify([]),
      success: function () {
        resolve(true)
      },
      fail: function () {
        courseCache = oldCourseCache
        reject(new Error('Failed to clear courses'))
      }
    })
  })
}

/**
 * 更新课程（允许更新 Mock 课程）
 * @param {string} courseId 课程ID
 * @param {object} courseData 课程数据（不含id）
 * @returns {Promise<object>} 更新后的课程对象
 */
export function updateCourse(courseId, courseData) {
  return new Promise((resolve, reject) => {
    const index = courseCache.findIndex(c => c.id === courseId)
    if (index === -1) {
      reject(new Error('Course not found'))
      return
    }

    const oldCourseCache = courseCache
    const updated = { id: courseId, ...courseData }
    courseCache = courseCache.map(c => (c.id === courseId ? updated : c))

    storage.set({
      key: STORAGE_KEYS.COURSES,
      value: JSON.stringify(courseCache),
      success: function () {
        resolve(updated)
      },
      fail: function (data, code) {
        courseCache = oldCourseCache
        reject(new Error('Failed to update course'))
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
  return !ORIGINAL_EXAM_IDS.has(examId)
}

/**
 * 删除考试（允许删除 Mock 考试）
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
 * 批量删除考试
 * @param {Array<string>} examIds 要删除的考试ID数组
 * @returns {Promise<boolean>}
 */
export function clearHistoryExams(examIds) {
  return new Promise((resolve, reject) => {
    const oldExamCache = examCache

    examCache = examCache.filter(e => !examIds.includes(e.id))

    storage.set({
      key: STORAGE_KEYS.EXAMS,
      value: JSON.stringify(examCache),
      success: function () {
        resolve(true)
      },
      fail: function () {
        examCache = oldExamCache
        reject(new Error('Failed to clear history exams'))
      }
    })
  })
}

/**
 * 批量删除待办
 * @param {Array<string>} taskIds 要删除的待办ID数组
 * @returns {Promise<boolean>}
 */
export function clearHistoryTasks(taskIds) {
  return new Promise((resolve, reject) => {
    const oldTaskCache = taskCache

    taskCache = taskCache.filter(t => !taskIds.includes(t.id))

    storage.set({
      key: STORAGE_KEYS.TASKS,
      value: JSON.stringify(taskCache),
      success: function () {
        resolve(true)
      },
      fail: function () {
        taskCache = oldTaskCache
        reject(new Error('Failed to clear history tasks'))
      }
    })
  })
}

/**
 * 更新考试（允许更新 Mock 考试）
 * @param {string} examId 考试ID
 * @param {object} examData 考试数据（不含id）
 * @returns {Promise<object>} 更新后的考试对象
 */
export function updateExam(examId, examData) {
  return new Promise((resolve, reject) => {
    const index = examCache.findIndex(e => e.id === examId)
    if (index === -1) {
      reject(new Error('Exam not found'))
      return
    }

    const oldExamCache = examCache
    const updated = { id: examId, ...examData }
    examCache = examCache.map(e => (e.id === examId ? updated : e))

    storage.set({
      key: STORAGE_KEYS.EXAMS,
      value: JSON.stringify(examCache),
      success: function () {
        resolve(updated)
      },
      fail: function (data, code) {
        examCache = oldExamCache
        reject(new Error('Failed to update exam'))
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
  return !ORIGINAL_TASK_IDS.has(taskId)
}

/**
 * 删除待办（允许删除 Mock 待办）
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
 * 更新待办（允许更新 Mock 待办）
 * @param {string} taskId 待办ID
 * @param {object} taskData 待办数据（不含id和finished）
 * @returns {Promise<object>} 更新后的待办对象
 */
export function updateTask(taskId, taskData) {
  return new Promise((resolve, reject) => {
    const index = taskCache.findIndex(t => t.id === taskId)
    if (index === -1) {
      reject(new Error('Task not found'))
      return
    }

    const oldTaskCache = taskCache
    const oldTask = taskCache.find(t => t.id === taskId)
    const updated = { id: taskId, ...taskData, finished: oldTask.finished }
    taskCache = taskCache.map(t => (t.id === taskId ? updated : t))

    storage.set({
      key: STORAGE_KEYS.TASKS,
      value: JSON.stringify(taskCache),
      success: function () {
        resolve(updated)
      },
      fail: function (data, code) {
        taskCache = oldTaskCache
        reject(new Error('Failed to update task'))
      }
    })
  })
}

/**
 * 重置默认数据（恢复 Mock 数据到初始状态，保留用户添加的数据）
 * @returns {Promise}
 */
export function resetToDefaultData() {
  return new Promise((resolve, reject) => {
    // 处理课程：移除旧默认 + 添加新默认 + 保留用户数据
    const userCourses = courseCache.filter(c => !ORIGINAL_COURSE_IDS.has(c.id))
    const defaultCourses = courses.map(c => ({ ...c, weeks: [...c.weeks] }))
    courseCache = [...userCourses, ...defaultCourses]

    // 处理考试
    const userExams = examCache.filter(e => !ORIGINAL_EXAM_IDS.has(e.id))
    const defaultExams = exams.map(e => ({ ...e }))
    examCache = [...userExams, ...defaultExams]

    // 处理待办
    const userTasks = taskCache.filter(t => !ORIGINAL_TASK_IDS.has(t.id))
    const defaultTasks = tasks.map(t => ({ ...t }))
    taskCache = [...userTasks, ...defaultTasks]

    let completed = 0
    let hasError = false

    const checkComplete = () => {
      completed++
      if (completed === 3) {
        if (hasError) {
          reject(new Error('Failed to reset data'))
        } else {
          resolve()
        }
      }
    }

    storage.set({
      key: STORAGE_KEYS.COURSES,
      value: JSON.stringify(courseCache),
      success: checkComplete,
      fail: function () { hasError = true; checkComplete() }
    })

    storage.set({
      key: STORAGE_KEYS.EXAMS,
      value: JSON.stringify(examCache),
      success: checkComplete,
      fail: function () { hasError = true; checkComplete() }
    })

    storage.set({
      key: STORAGE_KEYS.TASKS,
      value: JSON.stringify(taskCache),
      success: checkComplete,
      fail: function () { hasError = true; checkComplete() }
    })
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

/**
 * 获取历史待办归档天数
 * @returns {number}
 */
export function getTaskHistoryDays() {
  return taskHistoryDaysCache
}

/**
 * 设置历史待办归档天数
 * @param {number} days
 * @returns {Promise}
 */
export function setTaskHistoryDays(days) {
  return new Promise((resolve, reject) => {
    const oldValue = taskHistoryDaysCache
    taskHistoryDaysCache = days

    storage.set({
      key: STORAGE_KEYS.TASK_HISTORY_DAYS,
      value: String(days),
      success: function () {
        resolve()
      },
      fail: function (data, code) {
        taskHistoryDaysCache = oldValue
        reject(new Error('Failed to save task history days'))
      }
    })
  })
}

/**
 * 从 Storage 重新读取历史待办归档天数
 * @returns {Promise<number>}
 */
export function refreshTaskHistoryDaysFromStorage() {
  return new Promise((resolve, reject) => {
    storage.get({
      key: STORAGE_KEYS.TASK_HISTORY_DAYS,
      success: function (data) {
        const parsed = parseInt(data)
        taskHistoryDaysCache = isNaN(parsed) ? 15 : parsed
        resolve(taskHistoryDaysCache)
      },
      fail: function () {
        resolve(taskHistoryDaysCache)
      }
    })
  })
}
