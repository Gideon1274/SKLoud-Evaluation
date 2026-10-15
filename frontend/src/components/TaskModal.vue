<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  // null => create mode, task object => edit mode
  task: { type: Object, default: null },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['save', 'delete', 'close'])

const blank = () => ({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' })
const form = ref(blank())

watch(
  () => props.task,
  (task) => {
    form.value = task
      ? {
          title: task.title,
          description: task.description || '',
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        }
      : blank()
  },
  { immediate: true }
)

const submit = () => {
  if (!form.value.title.trim() || !form.value.dueDate) return
  emit('save', { ...form.value })
}

const onKey = (e) => {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="ui-overlay" @click.self="emit('close')">
    <div class="ui-modal" role="dialog" aria-modal="true">
      <h2>{{ task ? 'Edit Task' : 'Create New Task' }}</h2>
      <form @submit.prevent="submit">
        <div class="form-group">
          <label for="task-title">Title *</label>
          <input id="task-title" v-model="form.title" class="ui-input" type="text" required placeholder="Task title..." autofocus />
        </div>

        <div class="form-group">
          <label for="task-desc">Description</label>
          <textarea id="task-desc" v-model="form.description" class="ui-input" placeholder="Optional details..."></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="task-status">Status</label>
            <select id="task-status" v-model="form.status" class="ui-input">
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div class="form-group">
            <label for="task-priority">Priority</label>
            <select id="task-priority" v-model="form.priority" class="ui-input">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="task-due">Due Date *</label>
          <input id="task-due" v-model="form.dueDate" class="ui-input" type="date" required />
        </div>

        <div class="modal-actions">
          <button
            v-if="task"
            type="button"
            class="ui-btn ui-btn-ghost-danger delete-btn"
            @click="emit('delete')"
          >
            Delete
          </button>
          <button type="button" class="ui-btn ui-btn-secondary" @click="emit('close')">Cancel</button>
          <button type="submit" class="ui-btn ui-btn-primary" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save Task' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 13px;
  color: #cbd5e1;
}

.form-group textarea {
  resize: vertical;
  min-height: 70px;
}

.form-row {
  display: flex;
  gap: 14px;
}

.form-row .form-group {
  flex: 1;
  min-width: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.delete-btn {
  margin-right: auto;
}

@media (max-width: 480px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .modal-actions {
    flex-wrap: wrap;
  }

  .modal-actions .ui-btn {
    flex: 1 1 calc(50% - 5px);
  }

  .delete-btn {
    order: 3;
    flex-basis: 100%;
    margin-right: 0;
  }
}
</style>
