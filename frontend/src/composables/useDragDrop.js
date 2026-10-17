import { ref, onBeforeUnmount } from 'vue'

const LONG_PRESS_MS = 280 // touch: hold to pick up a card (so normal scrolling still works)
const MOUSE_THRESHOLD = 5 // mouse: pixels moved before a drag starts
const TOUCH_CANCEL = 24 // touch: moving further than this before the long-press = user is scrolling
const EDGE = 56 // px from a screen/board edge where auto-scroll kicks in
const MAX_STACK = 4 // how many extra cards are drawn behind the dragged one

/**
 * Pointer-based drag and drop that works the same for mouse, pen and touch.
 * Cards call `startDrag(event, task, cardElement)`. Drop targets are any elements
 * with a `data-drop-status` attribute.
 */
export function useDragDrop({ onDrop, getScroller, getDragCount, getDragElements }) {
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
    if (event.target.closest('button, a, input, select, textarea, label')) return

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
    ghost.style.touchAction = 'none'
    const count = getDragCount ? getDragCount(task) : 1
    if (count > 1) ghost.dataset.count = String(count)
    
    // Extra ghosts: the other selected cards, stacked behind the one being dragged.
    const extras = []
    if (count > 1 && getDragElements) {
      const others = getDragElements(task).filter((el) => el !== cardEl).slice(0, MAX_STACK)
      others.forEach((el, i) => {
        const g = el.cloneNode(true)
        g.classList.add('drag-ghost', 'drag-ghost-extra')
        g.style.width = `${rect.width}px`
        g.style.left = '0px'
        g.style.top = '0px'
        g.style.zIndex = String(999 - i)
        g.style.height = `${rect.height}px` // same size as the dragged card so the stack stays tidy
        g.style.overflow = 'hidden'
        g.style.transformOrigin = 'top center'
        document.body.appendChild(g)
        extras.push(g)
      })
    }
    document.body.appendChild(ghost) // appended last so the dragged card is on top of the stack

    if (cardEl) cardEl.style.touchAction = 'none'

    active = { task, ghost, extras, offsetX: startX - rect.left, offsetY: startY - rect.top, cardEl }
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
    const stacked = active.extras.length > 0

    // Dragged card sits on top; no tilt when stacked so the pile looks neat.
    active.ghost.style.transform = `translate(${x}px, ${y}px) rotate(${stacked ? 0 : 1.5}deg)`

    // Cards behind: same position, each one a little lower and narrower, like a deck.
    active.extras.forEach((g, i) => {
      const n = i + 1
      g.style.transform = `translate(${x}px, ${y + n * 14}px) scale(${1 - n * 0.04})`
      g.style.setProperty('opacity', '1', 'important')
      g.style.filter = `brightness(${1 - n * 0.12})`
    })
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
      if (scroller.scrollHeight > scroller.clientHeight) {
        if (pointer.y < r.top + EDGE) scroller.scrollTop -= 12
        else if (pointer.y > r.bottom - EDGE) scroller.scrollTop += 12
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
    if (active) {
      active.ghost.remove()
      active.extras.forEach((g) => g.remove())
      if (active.cardEl) active.cardEl.style.touchAction = ''
    }
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
