/**
 * Mock 数据模块
 * 包含课程、考试、待办的模拟数据
 */

// 课程数据
export const courses = [
  // 周一
  {
    id: 'course_001',
    name: '习近平新时代中国特色社会主义思想概论',
    teacher: '',
    weekday: 1,
    startTime: '15:20',
    endTime: '16:55',
    classroom: '',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  {
    id: 'course_002',
    name: '形势与政策',
    teacher: '',
    weekday: 1,
    startTime: '18:00',
    endTime: '19:35',
    classroom: '',
    weeks: [9, 10, 11]
  },
  // 周二
  {
    id: 'course_003',
    name: '自动控制原理基础',
    teacher: '',
    weekday: 2,
    startTime: '08:00',
    endTime: '09:35',
    classroom: '',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8]
  },
  {
    id: 'course_004',
    name: '工程伦理',
    teacher: '',
    weekday: 2,
    startTime: '13:30',
    endTime: '15:05',
    classroom: '',
    weeks: [1, 3, 5, 7, 9, 11, 13, 15]
  },
  {
    id: 'course_005',
    name: '智能交通信息专题',
    teacher: '',
    weekday: 2,
    startTime: '15:20',
    endTime: '16:55',
    classroom: '',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8]
  },
  {
    id: 'course_006',
    name: '嵌入式软件开发',
    teacher: '',
    weekday: 2,
    startTime: '15:20',
    endTime: '16:55',
    classroom: '',
    weeks: [9, 10, 11, 12, 13, 14, 15, 16]
  },
  // 周三
  {
    id: 'course_007',
    name: '交通感知与信息处理',
    teacher: '',
    weekday: 3,
    startTime: '15:20',
    endTime: '16:55',
    classroom: '',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  },
  // 周四
  {
    id: 'course_008',
    name: '智能交通信息专题',
    teacher: '',
    weekday: 4,
    startTime: '08:00',
    endTime: '09:35',
    classroom: '',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8]
  },
  {
    id: 'course_009',
    name: '嵌入式软件开发',
    teacher: '',
    weekday: 4,
    startTime: '13:30',
    endTime: '15:05',
    classroom: '',
    weeks: [9, 10, 11, 12, 13, 14, 15, 16]
  },
  {
    id: 'course_010',
    name: '习近平新时代中国特色社会主义思想概论',
    teacher: '',
    weekday: 4,
    startTime: '15:20',
    endTime: '16:55',
    classroom: '',
    weeks: [2, 4, 6, 8, 10, 12, 14, 16]
  },
  // 周五
  {
    id: 'course_011',
    name: '交通感知与信息处理',
    teacher: '',
    weekday: 5,
    startTime: '08:00',
    endTime: '09:35',
    classroom: '',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  },
  {
    id: 'course_012',
    name: '自动控制原理基础',
    teacher: '',
    weekday: 5,
    startTime: '13:30',
    endTime: '15:05',
    classroom: '',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8]
  },
  {
    id: 'course_013',
    name: '小红书内容创作与运营',
    teacher: '',
    weekday: 5,
    startTime: '18:00',
    endTime: '19:35',
    classroom: '',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  }
]

// 考试数据（日期调整到未来）
export const exams = [
  {
    id: 'exam_001',
    course: '数据结构',
    date: '2026-09-16',
    startTime: '09:00',
    endTime: '11:00',
    classroom: '教三楼501'
  },
  {
    id: 'exam_002',
    course: '大学英语',
    date: '2026-09-20',
    startTime: '14:00',
    endTime: '16:00',
    classroom: '教二401'
  },
  {
    id: 'exam_003',
    course: '操作系统',
    date: '2026-09-27',
    startTime: '09:00',
    endTime: '11:00',
    classroom: '教四205'
  }
]

// 待办数据（截止时间调整到未来）
export const tasks = [
  {
    id: 'task_001',
    title: '实验三：二叉树',
    course: '数据结构',
    deadline: '2026-09-16T23:59:00',
    type: 'experiment',
    finished: false
  },
  {
    id: 'task_002',
    title: '英语作文',
    course: '大学英语',
    deadline: '2026-09-18T22:00:00',
    type: 'homework',
    finished: false
  },
  {
    id: 'task_003',
    title: '操作系统报告',
    course: '操作系统',
    deadline: '2026-09-19T18:00:00',
    type: 'report',
    finished: false
  },
  {
    id: 'task_004',
    title: '数据库实验四',
    course: '数据库原理',
    deadline: '2026-09-22T23:59:00',
    type: 'experiment',
    finished: false
  },
  {
    id: 'task_005',
    title: '网络编程作业',
    course: '计算机网络',
    deadline: '2026-09-23T23:59:00',
    type: 'homework',
    finished: false
  },
  {
    id: 'task_006',
    title: '软件需求文档',
    course: '软件工程',
    deadline: '2026-09-18T18:00:00',
    type: 'report',
    finished: false
  },
  {
    id: 'task_007',
    title: 'Python爬虫作业',
    course: 'Python程序设计',
    deadline: '2026-09-19T23:59:00',
    type: 'homework',
    finished: false
  },
  {
    id: 'task_008',
    title: '高数练习册',
    course: '高等数学',
    deadline: '2026-09-11T23:59:00',
    type: 'homework',
    finished: true
  }
]
