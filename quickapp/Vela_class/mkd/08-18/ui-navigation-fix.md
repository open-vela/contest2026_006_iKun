# UI 与导航修复记录

## 1. 本次修改的文件

**修改的文件：**
- `src/manifest.json`
- `src/app.ux`

**新增的文件：**
- `src/common/data.js` - Mock 数据
- `src/common/time.js` - 时间工具函数
- `src/common/schedule.js` - 课程判断逻辑
- `src/common/exam.js` - 考试逻辑
- `src/common/task.js` - 待办逻辑
- `src/common/storage.js` - 本地存储
- `src/pages/home/home.ux` - 首页「此刻」
- `src/pages/schedule/schedule.ux` - 课表页
- `src/pages/exam/exam.ux` - 考试页
- `src/pages/task/task.ux` - 待办页
- `src/pages/course-detail/course-detail.ux` - 课程详情
- `src/pages/task-detail/task-detail.ux` - 待办详情
- `src/DEMO.md` - Demo 说明文档

## 2. 修改内容

### manifest.json
- `designWidth` 从 `device-width` 改为 `466`
- `router.entry` 从 `pages/index` 改为 `pages/home`
- 新增 6 个页面路由：home、schedule、exam、task、course-detail、task-detail
- 新增 `system.vibrator` feature 声明

### app.ux
- 新增 `initStorage()` 调用，应用启动时初始化本地存储

### 新增页面
- **home**：根据时间显示当前课程状态（下一节课/正在上课/今日结束/今日无课），底部显示考试和待办摘要卡片，点击可跳转对应页面
- **schedule**：支持「今天」和「本周」两种模式，今天模式为纵向时间轴，本周模式有星期选择器
- **exam**：顶部大卡片显示最近考试倒计时，下方列表显示后续考试
- **task**：按「今天/本周/以后」分组显示待办，支持点击标记完成
- **course-detail**：显示课程详情、时间、教室、教师，进行中显示进度条
- **task-detail**：显示待办详情，支持切换完成状态

## 3. 路由与返回逻辑

### 页面跳转关系
```
home ──→ schedule（点击课表入口）
home ──→ exam（点击考试摘要）
home ──→ task（点击待办摘要）
home ──→ course-detail（点击课程卡片）
schedule ──→ course-detail（点击课程条目）
task ──→ task-detail（点击待办条目）
```

### 返回逻辑
- **course-detail**：使用 `router.back()` 返回
- **task-detail**：使用 `router.back()` 返回
- **schedule**：无返回按钮（一级页面）
- **exam**：无返回按钮（一级页面）
- **task**：无返回按钮（一级页面）

## 4. 构建检查

- 是否执行构建：是
- 构建是否成功：成功
- 构建耗时：约 600ms
- 输出文件：`com.application.watch.demo.debug.1.0.0.rpk`

## 5. 需要手动确认的项目

- 首页主卡片在圆屏边缘是否被裁切
- 底部考试/待办摘要卡片位置是否合适
- 课表页星期选择器是否被圆屏裁切
- 考试页倒计时圆形区域显示效果
- 各页面字体大小在 466×466 屏幕上是否清晰可读
- 长课程名称是否正确截断
- 列表滚动是否正常
- 返回按钮位置是否合理（course-detail、task-detail）
