/**
 * Mock 数据模块
 * 包含课程、考试、待办的模拟数据
 */

// 课程数据
export const courses = [
  {
    id: 'course_001',
    name: '数据结构',
    teacher: '张老师',
    weekday: 2,
    startTime: '10:00',
    endTime: '11:40',
    classroom: '教三301',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  {
    id: 'course_002',
    name: '高等数学',
    teacher: '李老师',
    weekday: 1,
    startTime: '08:00',
    endTime: '09:40',
    classroom: '教一204',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  {
    id: 'course_003',
    name: '大学英语',
    teacher: '王老师',
    weekday: 3,
    startTime: '14:00',
    endTime: '15:40',
    classroom: '教二401',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  {
    id: 'course_004',
    name: '操作系统',
    teacher: '赵老师',
    weekday: 4,
    startTime: '16:00',
    endTime: '17:40',
    classroom: '教四205',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  {
    id: 'course_005',
    name: '计算机网络',
    teacher: '刘老师',
    weekday: 5,
    startTime: '10:00',
    endTime: '11:40',
    classroom: '教五301',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  {
    id: 'course_006',
    name: '数据库原理',
    teacher: '陈老师',
    weekday: 2,
    startTime: '14:00',
    endTime: '15:40',
    classroom: '教三401',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  {
    id: 'course_007',
    name: '软件工程',
    teacher: '杨老师',
    weekday: 3,
    startTime: '08:00',
    endTime: '09:40',
    classroom: '教二201',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  {
    id: 'course_008',
    name: 'Python程序设计',
    teacher: '周老师',
    weekday: 1,
    startTime: '14:00',
    endTime: '15:40',
    classroom: '教六102',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  }
]

// 考试数据
export const exams = [
  {
    id: 'exam_001',
    course: '数据结构',
    date: '2026-08-21',
    startTime: '09:00',
    endTime: '11:00',
    classroom: '教三楼501'
  },
  {
    id: 'exam_002',
    course: '大学英语',
    date: '2026-08-25',
    startTime: '14:00',
    endTime: '16:00',
    classroom: '教二401'
  },
  {
    id: 'exam_003',
    course: '操作系统',
    date: '2026-09-02',
    startTime: '09:00',
    endTime: '11:00',
    classroom: '教四205'
  }
]

// 待办数据
export const tasks = [
  {
    id: 'task_001',
    title: '实验三：二叉树',
    course: '数据结构',
    deadline: '2026-08-18T23:59:00',
    type: 'experiment',
    finished: false
  },
  {
    id: 'task_002',
    title: '英语作文',
    course: '大学英语',
    deadline: '2026-08-18T22:00:00',
    type: 'homework',
    finished: false
  },
  {
    id: 'task_003',
    title: '操作系统报告',
    course: '操作系统',
    deadline: '2026-08-22T18:00:00',
    type: 'report',
    finished: false
  },
  {
    id: 'task_004',
    title: '数据库实验四',
    course: '数据库原理',
    deadline: '2026-08-20T23:59:00',
    type: 'experiment',
    finished: false
  },
  {
    id: 'task_005',
    title: '网络编程作业',
    course: '计算机网络',
    deadline: '2026-08-25T23:59:00',
    type: 'homework',
    finished: false
  },
  {
    id: 'task_006',
    title: '软件需求文档',
    course: '软件工程',
    deadline: '2026-08-28T18:00:00',
    type: 'report',
    finished: false
  },
  {
    id: 'task_007',
    title: 'Python爬虫作业',
    course: 'Python程序设计',
    deadline: '2026-08-19T23:59:00',
    type: 'homework',
    finished: false
  },
  {
    id: 'task_008',
    title: '高数练习册',
    course: '高等数学',
    deadline: '2026-08-21T23:59:00',
    type: 'homework',
    finished: true
  }
]
