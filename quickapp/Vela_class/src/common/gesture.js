/**
 * 边缘滑动手势工具模块
 * 采用状态机模式：touchstart记录 → touchmove跟踪 → touchend判断
 * 只在 touchend 阶段才决定是否触发返回
 */

// 边缘阈值：只有 startX <= 35px 才视为左边缘
export const EDGE_THRESHOLD = 35

// 最小滑动距离：deltaX >= 100px 才视为有效右滑
export const MIN_SWIPE_DISTANCE = 100

// 最大纵向偏移：abs(deltaY) <= 60px 才允许返回
export const MAX_VERTICAL_DISTANCE = 60

// 方向比例：deltaX >= abs(deltaY) * 1.5 才视为横向滑动
export const DIRECTION_RATIO = 1.5

/**
 * 创建手势状态对象
 * @returns {object}
 */
export function createGestureState() {
  return {
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    edgeCandidate: false,
    gestureTriggered: false
  }
}

/**
 * 处理 touchstart 事件
 * @param {object} state 手势状态
 * @param {object} event TouchEvent
 */
export function handleTouchStart(state, event) {
  // 重置状态
  state.gestureTriggered = false
  state.edgeCandidate = false

  // 读取触摸坐标
  const touch = event.touches && event.touches.length > 0 ? event.touches[0] : null
  if (!touch) return

  state.startX = touch.clientX
  state.startY = touch.clientY
  state.lastX = touch.clientX
  state.lastY = touch.clientY

  // 判断是否从左边缘开始
  state.edgeCandidate = state.startX <= EDGE_THRESHOLD
}

/**
 * 处理 touchmove 事件
 * @param {object} state 手势状态
 * @param {object} event TouchEvent
 */
export function handleTouchMove(state, event) {
  // 如果不是边缘候选，直接忽略
  if (!state.edgeCandidate) return

  // 读取触摸坐标
  const touch = event.touches && event.touches.length > 0 ? event.touches[0] : null
  if (!touch) return

  state.lastX = touch.clientX
  state.lastY = touch.clientY

  // 检查是否出现明显反向或纵向移动，取消边缘候选
  const deltaX = state.lastX - state.startX
  const deltaY = state.lastY - state.startY

  // 如果明显向左滑动，取消
  if (deltaX < -20) {
    state.edgeCandidate = false
    return
  }

  // 如果纵向移动明显超过横向，取消
  if (Math.abs(deltaY) > Math.abs(deltaX) * 2 && Math.abs(deltaY) > 30) {
    state.edgeCandidate = false
  }
}

/**
 * 处理 touchend 事件，判断是否应该触发返回
 * @param {object} state 手势状态
 * @param {object} event TouchEvent
 * @returns {boolean} 是否应该触发返回
 */
export function handleTouchEnd(state, event) {
  // 如果已经触发过，不再触发
  if (state.gestureTriggered) return false

  // 如果不是边缘候选，不触发
  if (!state.edgeCandidate) return false

  // 读取结束坐标
  const touch = event.changedTouches && event.changedTouches.length > 0
    ? event.changedTouches[0]
    : null

  if (!touch) return false

  const endX = touch.clientX
  const endY = touch.clientY
  const deltaX = endX - state.startX
  const deltaY = endY - state.startY

  // 必须同时满足所有条件
  // 1. 从左边缘开始
  if (state.startX > EDGE_THRESHOLD) return false

  // 2. 向右滑动足够距离
  if (deltaX < MIN_SWIPE_DISTANCE) return false

  // 3. 纵向偏移在允许范围内
  if (Math.abs(deltaY) > MAX_VERTICAL_DISTANCE) return false

  // 4. 横向移动明显大于纵向移动
  if (deltaX < Math.abs(deltaY) * DIRECTION_RATIO) return false

  // 满足所有条件，标记已触发并返回 true
  state.gestureTriggered = true
  return true
}
