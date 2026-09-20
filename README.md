# VELA CLASS

## 一、作品简介

**VELA CLASS** 是一款运行在 openvela 智能手表上的学生校园助手，基于 **QuickApp** 框架开发（`manifest.json`：`deviceTypeList: ["watch"]`，`designWidth: 466`，包名 `com.application.watch.demo`）。

作品面向校园场景，把课表、考试、待办收在一处，并按**当前时间**自动呈现首页信息：下一节课 / 正在上课 / 今日课程结束 / 今日无课。本地 `storage` 持久化，**离线可用**（应用代码未使用网络类 feature）。另含课表三模式、考试倒计时、待办分组，以及**应用内提醒**（课前/考前/待办截止阈值扫描 + 振动 + Toast）。

说明（避免误解）：

- 「智能状态感知」「待办分组」等为**本地时间规则与数据逻辑**，不是设备端大模型推理，也不依赖云端对话。
- 提醒仅在**应用处于前台**时由页面定时器触发；未打开应用时**不会**产生系统级通知（公开 Vela JS 接口未提供第三方通用系统通知/闹钟 API，后台运行也不含定时提醒）。
- 当前仓内打包产物为 **debug** rpk；参赛正式提交需自行生成 **release.rpk**。

核心能力（均有对应源码）：

| 能力 | 实现位置 |
|------|----------|
| 首页四态状态机 | `src/pages/home/home.ux`（`ongoing` / `next` / `finished` / `noClass`） |
| 课表「今天 / 本周 / 全部」 | `src/pages/schedule/schedule.ux`（`mode` 切换） |
| 教学周 / 今日课程计算 | `src/common/schedule.js` |
| 考试倒计时与历史 | `src/common/exam.js` |
| 待办分组（逾期/今天/本周等） | `src/common/task.js` |
| 应用内提醒 | `home.ux` 的 `checkReminders`：课前 ≤10 分钟，考前/待办截止 ≤60 分钟，`vibrator` + `prompt.showToast`，`reminderDone` 去重 |
| 本地存储与 Mock | `src/common/storage.js`、`data.js` |
| 自定义拼音输入法 | `src/components/InputMethod/` |
| Debug 入口 | 连点首页「VELA CLASS」5 次 → `/pages/debug` |

## 二、选题方向

**手表应用创新（快应用）**

理由：面向学生在手腕上快速查看「现在上什么课 / 最近考什么 / 今天要交什么」；开发形态为 openvela QuickApp，便于在 AIoT-IDE 中迭代。本赛段验证环境以 **AIoT-IDE 模拟器**为主（日志中有大量 `aiot build` / toolkit 构建记录）。

## 三、目录结构

```text
contest2026_006_iKun/
├── quickapp/Vela_class/              # 本作品工程
│   ├── package.json                  # aiot-toolkit：start / build / release
│   ├── src/
│   │   ├── app.ux
│   │   ├── manifest.json             # 包名、路由、features（storage/vibrator/prompt/router/device）
│   │   ├── common/                   # storage / schedule / exam / task / time / data(Mock)
│   │   ├── components/InputMethod/   # 自定义输入法
│   │   └── pages/                    # home、schedule、exam、task 及详情/添加/设置/debug 等
│   ├── skills/vela-class-home-status/
│   │   └── SKILL.md                  # 自定义 Skill（对应已实现的首页状态 + 应用内提醒）
│   └── dist/                         # 现有：com.application.watch.demo.debug.1.0.0.rpk
├── quickapp/hello_quickapp/          # 组委会快应用示例，非本作品
├── app/hello_app/                    # 组委会示例，本作品未使用
├── board/contest_board/              # 组委会示例，本作品未使用
├── logs/Junan-X/                     # AI Coding 日志（OpenCode 归集）
├── contest2026_006_iKun.xml
├── openvela.xml
└── README.md
```

## 四、运行方式

### 方式 A：AIoT-IDE（本赛段主要验证路径）

1. 安装 [AIoT-IDE](https://iot.mi.com/vela/quickapp/zh/guide/start/use-ide.html)  
2. 以 `quickapp/Vela_class` 为工程根（含 `package.json`、`src/`）  
3. 选择手表模拟器（文档中镜像名为 **vela-watch-5**），编译运行  

也可在工程目录执行（与 `logs/` 中记录一致）：

```bash
cd quickapp/Vela_class
npm install
npm run start    # aiot start --watch
npm run build    # 产出 debug 包到 dist/
npm run release  # 生产包（提交用，需签名/发布配置）
```

当前仓内已有：

```text
quickapp/Vela_class/dist/com.application.watch.demo.debug.1.0.0.rpk
```

> **尚无 release.rpk**。按大赛要求，提交前请在 IDE「发布」或 `npm run release` 生成生产包，并与源码一并放入本仓。

### 方式 B：openvela 模拟器部署（官方通用流程）

适用于评委/选手在 **Ubuntu** 上按大赛文档部署 rpk（本队赛段以 AIoT-IDE 验证为主，下列步骤来自官方快应用指南，**未在本队环境完整复现时请以官方文档为准**）：

```bash
# 拉取 openvela 大赛工程（若尚未同步）
repo init -u https://github.com/open-vela/contest2026_006_iKun \
  -b dev-ai-contest-2026 -m contest2026_006_iKun.xml
repo sync -c -j8
```

部署 rpk 时注意包名与 `manifest.json` 一致：

```text
package = com.application.watch.demo
```

解压后推送到 `/data/app/<package>/`，在模拟器串口执行：

```text
vapp hap://app/com.application.watch.demo
```

中文字体需按官方文档推送到设备 `/data/font/`。

### 功能自测（与源码行为对齐）

| 操作 | 预期（依据源码） |
|------|------------------|
| 启动首页 | 时间、学期周次、四态课程卡片 |
| 课表页 | 「今天 / 本周 / 全部」切换 |
| 考试 / 待办 | 倒计时、分组与完成态 |
| 添加后返回首页 | `onShow` 刷新 storage 与摘要 |
| 应用打开且达到阈值 | 课前≤10min 或考前/DDL≤60min 时振动 + Toast |
| 连点「VELA CLASS」5 次（约 2s 内） | 进入 Debug 页 |

## 五、AI Coding 使用说明

开发过程以 **OpenCode + Xiaomi MiMo** 对话协作为主（`logs/Junan-X/manifest.json`：`tool: opencode`，模型 `mimo/mimo-v2.5-pro` 等），人工负责需求确认、业务规则校验与最终打包。

### 工具（按日志与环境实际）

| 工具 | 说明 |
|------|------|
| **OpenCode + MiMo** | 日志中大量代码阅读、修改、`npm run build`（aiot-toolkit）会话 |
| **AIoT-IDE / aiot-toolkit** | 快应用构建与调试（`package.json` scripts） |
| openvela 官方 AI Skills（`.claude`） | 工程树内可参考；**本仓 AI 日志以 OpenCode/MiMo 为主**，不单独宣称每项 Skill 均被实际调用 |

### Token 用量

根据导出的 MiMo Token Plan 用量表（2026-08-01～2026-09-30，三份 xlsx **逐日 Total Tokens 加总**）：

- 合计约 **1,112,576,520（约 1112.58M）**
- 请求次数合计约 **2,563**
- 若导出表存在重复账号/重复区间，请以控制台去重后为准并同步修改本节与技术报告

### 沉淀 Skill（仅列仓内真实文件）

| Skill | 路径 |
|-------|------|
| `vela-class-home-status` | `quickapp/Vela_class/skills/vela-class-home-status/SKILL.md` |

内容对应**已实现**的首页四态与应用内提醒，不含未实现的系统推送/云端简报等能力。

### 日志

```text
logs/Junan-X/
```

由 OpenCode 归集流程写入，含 `manifest.json` 与按日期会话文件。

---

**队伍**：iKun（`contest2026_006_iKun`）  
**选题**：手表应用创新  
**协议**：Apache 2.0  
