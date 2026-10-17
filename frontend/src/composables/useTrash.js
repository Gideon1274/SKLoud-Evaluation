import { ref, computed } from 'vue'
import api from '../services/api'

export function useTrash() {
  const trashed = ref([])
  const loading = ref(false)
  const errorMessage = ref('')
  const busy = ref(false)
  const selectedIds = ref([])

  const selectedCount = computed(() => selectedIds.value.length)
  const allSelected = computed(
    () => trashed.value.length > 0 && selectedIds.value.length === trashed.value.length
  )

  const isSelected = (id) => selectedIds.value.includes(id)

  const toggleSelect = (id) => {
    selectedIds.value = isSelected(id)
      ? selectedIds.value.filter((x) => x !== id)
      : [...selectedIds.value, id]
  }

  const toggleSelectAll = () => {
    selectedIds.value = allSelected.value ? [] : trashed.value.map((t) => t.id)
  }

  const fetchTrash = async () => {
    loading.value = true
    errorMessage.value = ''
    try {
      const response = await api.getTrash()
      trashed.value = response.data
      const existing = new Set(trashed.value.map((t) => t.id))
      selectedIds.value = selectedIds.value.filter((id) => existing.has(id))
    } catch (err) {
      errorMessage.value = 'Failed to load trash. Check if backend is running.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const removeFromList = (ids) => {
    const gone = new Set(ids)
    trashed.value = trashed.value.filter((t) => !gone.has(t.id))
    selectedIds.value = selectedIds.value.filter((id) => !gone.has(id))
  }

  /** Returns true on success so the caller can refresh the dashboard. */
  const restore = async (ids) => {
    if (ids.length === 0) return false
    busy.value = true
    try {
      await api.restoreTasks(ids)
      removeFromList(ids)
      return true
    } catch (err) {
      errorMessage.value = 'Failed to restore tasks.'
      console.error(err)
      return false
    } finally {
      busy.value = false
    }
  }

  const purge = async (ids) => {
    if (ids.length === 0) return false
    busy.value = true
    try {
      await api.purgeTasks(ids)
      removeFromList(ids)
      return true
    } catch (err) {
      errorMessage.value = 'Failed to delete tasks permanently.'
      console.error(err)
      return false
    } finally {
      busy.value = false
    }
  }

  return {
    trashed,
    loading,
    busy,
    errorMessage,
    selectedIds,
    selectedCount,
    allSelected,
    isSelected,
    toggleSelect,
    toggleSelectAll,
    fetchTrash,
    restore,
    purge,
  }
}
