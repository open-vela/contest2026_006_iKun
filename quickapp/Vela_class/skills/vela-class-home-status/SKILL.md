---
name: vela-class-home-status
description: 围绕 VELA CLASS 首页四态智能感知（下一节课/上课中/今日结束/今日无课）与应用内提醒（课前、考前、待办截止，vibrator + Toast）提供开发与讲解指引。当用户问到首页状态、当前课、倒计时、课前提醒、考前提醒、待办紧急、校园助手状态时使用。
---

# Vela Class 首页智能状态与应用内提醒

## When to use
- 修改或解释首页如何根据时间自动切换四态
- 处理今日课程、下一节、上课进度、今日无课与最近考试展示
- 调整课前/考前/待办截止的应用内提醒阈值与文案
- 向评委说明「智能状态感知」而不是完整教务系统缩小版

## Project context
- 工程根（相对参赛仓）：quickapp/Vela_class
- 本 Skill 路径：quickapp/Vela_class/skills/vela-class-home-status/SKILL.md
- openvela QuickApp，466×466 圆屏手表，离线本地数据
- 相关文件（相对工程根）：
  - src/pages/home/home.ux — 首页状态机、定时刷新、checkReminders
  - src/common/schedule.js — 今日课程、下一节、进度、教学周
  - src/common/exam.js — 最近考试、倒计时
  - src/common/task.js — 待办分组与紧急度
  - src/common/storage.js — 本地存储与 Mock
- 已声明系统能力见 src/manifest.json（storage、vibrator、prompt、router、device 等）
- 明确边界：提醒仅在应用打开时生效；无系统级通知；无语音 ASR；无云端同步

## 首页四态（已实现）
1. ongoing：正在上课 — 课程名、剩余分钟、进度条
2. next：下一节课 — 名称、时间、教室、倒计时
3. finished：今日课程已结束 — 明天/最近跨天课程
4. noClass：今日无课 — 可展示最近考试倒计时
刷新：约每秒更新时间；约 30s 重算课程状态与提醒；约 60s 更新考试倒计时。

## 应用内提醒（已实现）
- 课程：距下一节开始约 0～10 分钟 → vibrator + Toast
- 考试：最近未开始考试约 0～60 分钟内 → vibrator + Toast
- 待办：最近未完成截止约 0～60 分钟内 → vibrator + Toast
- reminderDone 按事件去重，避免重复提示

## How to use
1. 改状态逻辑时先读 schedule.js 与 home.ux 的 updateCourseStatus，保持四态互斥
2. 改提醒时先读 home.ux 的 checkReminders，保持阈值与去重键
3. 数据变更后依赖页面 onShow 刷新 storage 缓存与摘要
4. 文案要短，适配圆表；颜色与现有状态色一致（蓝/绿/红/紫/橙）
5. 讲解/答辩时只陈述应用内提醒，不要承诺息屏系统推送
6. 模拟器验证：AIoT-IDE 打开应用观察状态与 Toast；真机振动待有设备再测

## Example
User: 首页为什么显示「正在上课」？
→ 查 schedule.getCurrentCourse(now) 与 home 状态机
→ 说明：当前时间落在该课 start/end 内时 status=ongoing，并展示剩余时间与进度。

User: 课前提醒怎么做的？
→ 说明 checkReminders 在应用内扫描下一节课，差值 ≤10 分钟时 vibrate + prompt.showToast，并用 reminderDone 去重。

## Constraints
- 不要写未实现的功能（AI 简报、系统通知、语音唤醒、云端同步）
- 不要建议使用 manifest 未声明的系统能力
- 修改建议必须落在上述真实文件与已实现流程上
