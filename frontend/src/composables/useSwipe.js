import { ref, onBeforeUnmount } from 'vue'

const SWIPE_THRESHOLD = 80
const MAX_SWIPE = 120
const TOUCH_CANCEL = 15

export function useSwipe({ onSwipeRight, onSwipeLeft, disabled = false }) {
  const swipeProgress = ref(0)
  const isSwiping = ref(false)

  let startX = 0
  let startY = 0
  let currentX = 0
  let element = null
  let rafId = null
  let cancelled = false

  const handleTouchStart = (e) => {
    if (disabled.value || e.touches.length !== 1) return
    if (e.target.closest('button, a, input, select, textarea, .cog-btn')) return

    const touch = e.touches[0]
    startX = touch.clientX
    startY = touch.clientY
    currentX = startX
    element = e.currentTarget
    cancelled = false
  }

  const handleTouchMove = (e) => {
    if (!element || cancelled) return
    if (e.touches.length !== 1) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      cancelled = true
      return
    }

    if (Math.abs(deltaX) > TOUCH_CANCEL && !isSwiping.value) {
      isSwiping.value = true
      element.style.transition = 'none'
      if (navigator.vibrate) navigator.vibrate(10)
    }

    if (isSwiping.value) {
      currentX = startX + deltaX
      const progress = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, deltaX))
      swipeProgress.value = progress
      element.style.transform = `translateX(${progress}px)`
      element.style.boxShadow = `${progress > 0 ? '4px' : '-4px'} 0 20px rgba(0,0,0,0.3)`
    }
  }

  const handleTouchEnd = () => {
    if (!element || cancelled || !isSwiping.value) {
      resetSwipe()
      return
    }

    const progress = swipeProgress.value
    const threshold = SWIPE_THRESHOLD

    element.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s'

    if (progress > threshold) {
      swipeProgress.value = MAX_SWIPE
      element.style.transform = `translateX(${MAX_SWIPE}px)`
      element.style.boxShadow = '8px 0 30px rgba(59, 130, 246, 0.4)'
      element.style.opacity = '0.8'

      setTimeout(() => {
        if (onSwipeRight) onSwipeRight()
        resetSwipe()
      }, 200)
    } else if (progress < -threshold) {
      swipeProgress.value = -MAX_SWIPE
      element.style.transform = `translateX(-${MAX_SWIPE}px)`
      element.style.boxShadow = '-8px 0 30px rgba(239, 68, 68, 0.4)'
      element.style.opacity = '0.8'

      setTimeout(() => {
        if (onSwipeLeft) onSwipeLeft()
        resetSwipe()
      }, 200)
    } else {
      resetSwipe()
    }
  }

  const resetSwipe = () => {
    if (!element) return
    element.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s, opacity 0.3s'
    element.style.transform = 'translateX(0)'
    element.style.boxShadow = ''
    element.style.opacity = ''
    swipeProgress.value = 0
    isSwiping.value = false
    element = null
    cancelled = false
  }

  const handleTouchCancel = () => {
    resetSwipe()
  }

  const bind = (el) => {
    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend', handleTouchEnd)
    el.addEventListener('touchcancel', handleTouchCancel)
  }

  const unbind = (el) => {
    el.removeEventListener('touchstart', handleTouchStart)
    el.removeEventListener('touchmove', handleTouchMove)
    el.removeEventListener('touchend', handleTouchEnd)
    el.removeEventListener('touchcancel', handleTouchCancel)
  }

  onBeforeUnmount(() => {
    if (element) unbind(element)
  })

  return { swipeProgress, isSwiping, bind, unbind, resetSwipe }
}