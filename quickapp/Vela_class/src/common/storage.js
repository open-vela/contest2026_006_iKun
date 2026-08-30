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
  SEMESTER_START: 'campus_semester_start'
}

// 内存缓存
let courseCache = []
let examCache = []
let taskCache = []
let semesterWeek1StartCache = null // 学期第一周周一日期字符串 YYYY-MM-DD
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
    const total = 4 // 课程、考试、任务、学期设置

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

    // 读取学期第一周设置
    storage.get({
      key: STORAGE_KEYS.SEMESTER_START,
      success: function (data) {
        semesterWeek1StartCache = data || null
        checkComplete()
      },
      fail: function (data, code) {
        console.error('Failed to get semester start:', code)
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
 * 添加新课程并持久化
 * @param {object} courseData 课程数据（不含id）
 * @returns {Promise<object>} 新课程对象
 */
export function addCourse(courseData) {
  return new Promise((resolve, reject) => {
    // 生成唯一ID
    const newId = 'course_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    
    // 创建新课程对象
    const newCourse = {
      id: newId,
      ...courseData
    }

    // 保存旧缓存用于回滚
    const oldCourseCache = courseCache

    // 不可变更新：创建新数组
    courseCache = [...courseCache, newCourse]

    // 持久化到 storage
    storage.set({
      key: STORAGE_KEYS.COURSES,
      value: JSON.stringify(courseCache),
      success: function () {
        console.log('Course added and saved:', newId)
        resolve(newCourse)
      },
      fail: function (data, code) {
        console.error('Failed to save course:', code)
        // 回滚到旧缓存
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
  // 默认课程 ID 存在于 data.js 的 courses 中
  const isDefaultCourse = courses.some(c => c.id === courseId)
  if (isDefaultCourse) {
    return false
  }
  // 检查是否存在于 courseCache 中
  return courseCache.some(c => c.id === courseId)
}

/**
 * 删除用户手动添加的课程
 * @param {string} courseId
 * @returns {Promise<boolean>}
 */
export function deleteCourse(courseId) {
  return new Promise((resolve, reject) => {
    // 检查课程是否存在
    const courseIndex = courseCache.findIndex(c => c.id === courseId)
    if (courseIndex === -1) {
      reject(new Error('Course not found'))
      return
    }

    // 检查是否为默认课程
    const isDefaultCourse = courses.some(c => c.id === courseId)
    if (isDefaultCourse) {
      reject(new Error('Cannot delete default course'))
      return
    }

    // 保存旧缓存用于回滚
    const oldCourseCache = courseCache

    // 不可变更新：过滤掉指定课程
    courseCache = courseCache.filter(c => c.id !== courseId)

    // 持久化到 storage
    storage.set({
      key: STORAGE_KEYS.COURSES,
      value: JSON.stringify(courseCache),
      success: function () {
        console.log('Course deleted and saved:', courseId)
        resolve(true)
      },
      fail: function (data, code) {
        console.error('Failed to delete course:', code)
        // 回滚到旧缓存
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
    // 生成唯一ID
    const newId = 'exam_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

    // 创建新考试对象
    const newExam = {
      id: newId,
      ...examData
    }

    // 保存旧缓存用于回滚
    const oldExamCache = examCache

    // 不可变更新：创建新数组
    examCache = [...examCache, newExam]

    // 持久化到 storage
    storage.set({
      key: STORAGE_KEYS.EXAMS,
      value: JSON.stringify(examCache),
      success: function () {
        console.log('Exam added and saved:', newId)
        resolve(newExam)
      },
      fail: function (data, code) {
        console.error('Failed to save exam:', code)
        // 回滚到旧缓存
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
  // 默认考试 ID 存在于 data.js 的 exams 中
  const isDefaultExam = exams.some(e => e.id === examId)
  if (isDefaultExam) {
    return false
  }
  // 检查是否存在于 examCache 中
  return examCache.some(e => e.id === examId)
}

/**
 * 删除用户手动添加的考试
 * @param {string} examId
 * @returns {Promise<boolean>}
 */
export function deleteExam(examId) {
  return new Promise((resolve, reject) => {
    // 检查考试是否存在
    const examIndex = examCache.findIndex(e => e.id === examId)
    if (examIndex === -1) {
      reject(new Error('Exam not found'))
      return
    }

    // 检查是否为默认考试
    const isDefaultExam = exams.some(e => e.id === examId)
    if (isDefaultExam) {
      reject(new Error('Cannot delete default exam'))
      return
    }

    // 保存旧缓存用于回滚
    const oldExamCache = examCache

    // 不可变更新：过滤掉指定考试
    examCache = examCache.filter(e => e.id !== examId)

    // 持久化到 storage
    storage.set({
      key: STORAGE_KEYS.EXAMS,
      value: JSON.stringify(examCache),
      success: function () {
        console.log('Exam deleted and saved:', examId)
        resolve(true)
      },
      fail: function (data, code) {
        console.error('Failed to delete exam:', code)
        // 回滚到旧缓存
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
    // 生成唯一ID
    const newId = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

    // 创建新待办对象
    const newTask = {
      id: newId,
      ...taskData,
      finished: false
    }

    // 保存旧缓存用于回滚
    const oldTaskCache = taskCache

    // 不可变更新：创建新数组
    taskCache = [...taskCache, newTask]

    // 持久化到 storage
    storage.set({
      key: STORAGE_KEYS.TASKS,
      value: JSON.stringify(taskCache),
      success: function () {
        console.log('Task added and saved:', newId)
        resolve(newTask)
      },
      fail: function (data, code) {
        console.error('Failed to save task:', code)
        // 回滚到旧缓存
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
  // 默认待办 ID 存在于 data.js 的 tasks 中
  const isDefaultTask = tasks.some(t => t.id === taskId)
  if (isDefaultTask) {
    return false
  }
  // 检查是否存在于 taskCache 中
  return taskCache.some(t => t.id === taskId)
}

/**
 * 删除用户手动添加的待办
 * @param {string} taskId
 * @returns {Promise<boolean>}
 */
export function deleteTask(taskId) {
  return new Promise((resolve, reject) => {
    // 检查待办是否存在
    const taskIndex = taskCache.findIndex(t => t.id === taskId)
    if (taskIndex === -1) {
      reject(new Error('Task not found'))
      return
    }

    // 检查是否为默认待办
    const isDefaultTask = tasks.some(t => t.id === taskId)
    if (isDefaultTask) {
      reject(new Error('Cannot delete default task'))
      return
    }

    // 保存旧缓存用于回滚
    const oldTaskCache = taskCache

    // 不可变更新：过滤掉指定待办
    taskCache = taskCache.filter(t => t.id !== taskId)

    // 持久化到 storage
    storage.set({
      key: STORAGE_KEYS.TASKS,
      value: JSON.stringify(taskCache),
      success: function () {
        console.log('Task deleted and saved:', taskId)
        resolve(true)
      },
      fail: function (data, code) {
        console.error('Failed to delete task:', code)
        // 回滚到旧缓存
        taskCache = oldTaskCache
        reject(new Error('Failed to delete task'))
      }
    })
  })
}

/**
 * 重置为 Mock 数据（调试用）
 * 同时更新内存缓存和 Storage
 * @returns {Promise}
 */
export function resetToMockData() {
  return new Promise((resolve, reject) => {
    // 1. 从 data.js 加载默认数据并深拷贝
    const defaultCourses = courses.map(c => ({ ...c }))
    const defaultExams = exams.map(e => ({ ...e }))
    const defaultTasks = tasks.map(t => ({ ...t }))

    // 2. 更新内存缓存
    courseCache = defaultCourses
    examCache = defaultExams
    taskCache = defaultTasks

    let saved = 0
    let hasError = false
    const total = 3

    const checkComplete = (success) => {
      if (!success) hasError = true
      saved++
      if (saved >= total) {
        if (hasError) {
          reject(new Error('Failed to save some data'))
        } else {
          resolve()
        }
      }
    }

    // 3. 保存到 Storage
    storage.set({
      key: STORAGE_KEYS.COURSES,
      value: JSON.stringify(courseCache),
      success: () => checkComplete(true),
      fail: () => checkComplete(false)
    })

    storage.set({
      key: STORAGE_KEYS.EXAMS,
      value: JSON.stringify(examCache),
      success: () => checkComplete(true),
      fail: () => checkComplete(false)
    })

    storage.set({
      key: STORAGE_KEYS.TASKS,
      value: JSON.stringify(taskCache),
      success: () => checkComplete(true),
      fail: () => checkComplete(false)
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
      fail: function (data, code) {
        console.error('Failed to refresh semester start from storage:', code)
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
    semesterWeek1StartCache = dateStr

    storage.set({
      key: STORAGE_KEYS.SEMESTER_START,
      value: dateStr,
      success: function () {
        console.log('Semester week1 start saved:', dateStr)
        resolve()
      },
      fail: function (data, code) {
        console.error('Failed to save semester start:', code)
        reject(new Error('Failed to save semester start'))
      }
    })
  })
}
