/**
 * Mock 数据模块
 * 包含课程、考试、待办的模拟数据
 */

// 课程数据（覆盖周一至周五，每天上午/下午/晚上）
export const courses = [
  // 周一
  {
    id: 'course_001',
    name: '高等数学',
    teacher: '李老师',
    weekday: 1,
    startTime: '08:00',
    endTime: '09:40',
    classroom: '教一204',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  {
    id: 'course_002',
    name: 'Python程序设计',
    teacher: '周老师',
    weekday: 1,
    startTime: '14:00',
    endTime: '15:40',
    classroom: '教六102',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  {
    id: 'course_003',
    name: '线性代数',
    teacher: '吴老师',
    weekday: 1,
    startTime: '18:30',
    endTime: '20:10',
    classroom: '教一305',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  // 周二
  {
    id: 'course_004',
    name: '数据结构',
    teacher: '张老师',
    weekday: 2,
    startTime: '10:00',
    endTime: '11:40',
    classroom: '教三301',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  {
    id: 'course_005',
    name: '数据库原理',
    teacher: '陈老师',
    weekday: 2,
    startTime: '14:00',
    endTime: '15:40',
    classroom: '教三401',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  {
    id: 'course_006',
    name: 'Java程序设计',
    teacher: '孙老师',
    weekday: 2,
    startTime: '18:30',
    endTime: '20:10',
    classroom: '教六201',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  // 周三
  {
    id: 'course_007',
    name: '大学英语',
    teacher: '王老师',
    weekday: 3,
    startTime: '08:00',
    endTime: '09:40',
    classroom: '教二401',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  {
    id: 'course_008',
    name: '软件工程',
    teacher: '杨老师',
    weekday: 3,
    startTime: '14:00',
    endTime: '15:40',
    classroom: '教二201',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  {
    id: 'course_009',
    name: '人工智能导论',
    teacher: '郑老师',
    weekday: 3,
    startTime: '18:30',
    endTime: '20:10',
    classroom: '教五301',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  // 周四
  {
    id: 'course_010',
    name: '操作系统',
    teacher: '赵老师',
    weekday: 4,
    startTime: '08:00',
    endTime: '09:40',
    classroom: '教四205',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  {
    id: 'course_011',
    name: '计算机网络',
    teacher: '刘老师',
    weekday: 4,
    startTime: '14:00',
    endTime: '15:40',
    classroom: '教五301',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  {
    id: 'course_012',
    name: 'Web前端开发',
    teacher: '马老师',
    weekday: 4,
    startTime: '18:30',
    endTime: '20:10',
    classroom: '教六102',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  // 周五
  {
    id: 'course_013',
    name: '概率论与数理统计',
    teacher: '钱老师',
    weekday: 5,
    startTime: '08:00',
    endTime: '09:40',
    classroom: '教一204',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  {
    id: 'course_014',
    name: '编译原理',
    teacher: '冯老师',
    weekday: 5,
    startTime: '14:00',
    endTime: '15:40',
    classroom: '教四205',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  {
    id: 'course_015',
    name: '移动应用开发',
    teacher: '黄老师',
    weekday: 5,
    startTime: '18:30',
    endTime: '20:10',
    classroom: '教六201',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  }
]

// 考试数据（日期调整到未来）
export const exams = [
  {
    id: 'exam_001',
    course: '数据结构',
    date: '2026-09-09',
    startTime: '09:00',
    endTime: '11:00',
    classroom: '教三楼501'
  },
  {
    id: 'exam_002',
    course: '大学英语',
    date: '2026-09-13',
    startTime: '14:00',
    endTime: '16:00',
    classroom: '教二401'
  },
  {
    id: 'exam_003',
    course: '操作系统',
    date: '2026-09-20',
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
    deadline: '2026-09-06T23:59:00',
    type: 'experiment',
    finished: false
  },
  {
    id: 'task_002',
    title: '英语作文',
    course: '大学英语',
    deadline: '2026-09-08T22:00:00',
    type: 'homework',
    finished: false
  },
  {
    id: 'task_003',
    title: '操作系统报告',
    course: '操作系统',
    deadline: '2026-09-09T18:00:00',
    type: 'report',
    finished: false
  },
  {
    id: 'task_004',
    title: '数据库实验四',
    course: '数据库原理',
    deadline: '2026-09-12T23:59:00',
    type: 'experiment',
    finished: false
  },
  {
    id: 'task_005',
    title: '网络编程作业',
    course: '计算机网络',
    deadline: '2026-09-13T23:59:00',
    type: 'homework',
    finished: false
  },
  {
    id: 'task_006',
    title: '软件需求文档',
    course: '软件工程',
    deadline: '2026-09-08T18:00:00',
    type: 'report',
    finished: false
  },
  {
    id: 'task_007',
    title: 'Python爬虫作业',
    course: 'Python程序设计',
    deadline: '2026-09-09T23:59:00',
    type: 'homework',
    finished: false
  },
  {
    id: 'task_008',
    title: '高数练习册',
    course: '高等数学',
    deadline: '2026-09-01T23:59:00',
    type: 'homework',
    finished: true
  }
]
