import { ref, onBeforeUnmount } from 'vue'

const LONG_PRESS_MS = 280 // touch: hold to pick up a card (so normal scrolling still works)
const MOUSE_THRESHOLD = 5 // mouse: pixels moved before a drag starts
const TOUCH_CANCEL = 10 // touch: moving further than this before the long-press = user is scrolling
const EDGE = 56 // px from a screen/board edge where auto-scroll kicks in

/**
 * Pointer-based drag and drop that works the same for mouse, pen and touch.
 * Cards call `startDrag(event, task, cardElement)`. Drop targets are any elements
 * with a `data-drop-status` attribute.
 */
export function useDragDrop({ onDrop, getScroller }) {
  const draggingId = ref(null)
  const overStatus = ref(null)

  let pending = null // pointer is down but drag not started yet
  let active = null // { task, ghost, offsetX, offsetY }
  let pointer = { x: 0, y: 0 }
  let rafId = null

  const blockTouchScroll = (e) => {
    if (active && e.cancelable) e.preventDefault()
  }
  const blockContextMenu = (e) => {
    if (pending || active) e.preventDefault()
  }

  const listen = () => {
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    window.addEventListener('touchmove', blockTouchScroll, { passive: false })
    window.addEventListener('contextmenu', blockContextMenu)
  }

  const unlisten = () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onCancel)
    window.removeEventListener('touchmove', blockTouchScroll)
    window.removeEventListener('contextmenu', blockContextMenu)
  }

  const startDrag = (event, task, cardEl) => {
    if (active || pending) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if (event.target.closest('button, a, input, select, textarea')) return

    pending = {
      task,
      cardEl,
      pointerType: event.pointerType,
      startX: event.clientX,
      startY: event.clientY,
      timer: null,
    }
    pointer = { x: event.clientX, y: event.clientY }

    if (event.pointerType !== 'mouse') {
      pending.timer = setTimeout(() => beginDrag(), LONG_PRESS_MS)
    }
    listen()
  }

  const beginDrag = () => {
    if (!pending) return
    const { task, cardEl, startX, startY } = pending
    clearTimeout(pending.timer)
    const rect = cardEl.getBoundingClientRect()

    const ghost = cardEl.cloneNode(true)
    ghost.classList.add('drag-ghost')
    ghost.style.width = `${rect.width}px`
    ghost.style.left = '0px'
    ghost.style.top = '0px'
    document.body.appendChild(ghost)

    active = { task, ghost, offsetX: startX - rect.left, offsetY: startY - rect.top }
    pending = null
    draggingId.value = task.id
    document.body.classList.add('is-dragging-task')
    if (navigator.vibrate) navigator.vibrate(15)

    positionGhost()
    updateTarget()
    rafId = requestAnimationFrame(autoScroll)
  }

  const positionGhost = () => {
    if (!active) return
    const x = pointer.x - active.offsetX
    const y = pointer.y - active.offsetY
    active.ghost.style.transform = `translate(${x}px, ${y}px) rotate(1.5deg)`
  }

  const updateTarget = () => {
    const el = document.elementFromPoint(pointer.x, pointer.y)
    overStatus.value = el?.closest('[data-drop-status]')?.dataset.dropStatus || null
  }

  const autoScroll = () => {
    if (!active) return
    const scroller = getScroller?.()
    if (scroller) {
      const r = scroller.getBoundingClientRect()
      if (scroller.scrollWidth > scroller.clientWidth) {
        if (pointer.x < r.left + EDGE) scroller.scrollLeft -= 12
        else if (pointer.x > r.right - EDGE) scroller.scrollLeft += 12
      }
    }
    if (pointer.y < EDGE) window.scrollBy(0, -12)
    else if (pointer.y > window.innerHeight - EDGE) window.scrollBy(0, 12)
    updateTarget()
    rafId = requestAnimationFrame(autoScroll)
  }

  const onMove = (e) => {
    pointer = { x: e.clientX, y: e.clientY }
    if (pending) {
      const dist = Math.hypot(e.clientX - pending.startX, e.clientY - pending.startY)
      if (pending.pointerType === 'mouse') {
        if (dist > MOUSE_THRESHOLD) beginDrag()
      } else if (dist > TOUCH_CANCEL) {
        cleanup() // finger moved before long-press: it's a scroll, not a drag
      }
      return
    }
    if (active) {
      positionGhost()
      updateTarget()
    }
  }

  const onUp = () => {
    if (active) {
      const { task } = active
      const target = overStatus.value
      cleanup()
      if (target && target !== task.status) onDrop(task, target)
    } else {
      cleanup()
    }
  }

  const onCancel = () => cleanup()

  const cleanup = () => {
    if (pending) clearTimeout(pending.timer)
    if (active) active.ghost.remove()
    if (rafId) cancelAnimationFrame(rafId)
    pending = null
    active = null
    rafId = null
    draggingId.value = null
    overStatus.value = null
    document.body.classList.remove('is-dragging-task')
    unlisten()
  }

  onBeforeUnmount(cleanup)

  return { draggingId, overStatus, startDrag }
}
