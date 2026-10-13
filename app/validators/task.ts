import vine from '@vinejs/vine'

export const createTaskValidator = vine.compile(
    vine.object({
        title: vine.string().trim().minLength(1).maxLength(255),
        description: vine.string().trim().optional(),
        status: vine.enum(['todo', 'in_progress', 'completed']).optional(),
        priority: vine.enum(['low', 'medium', 'high']).optional(),
        dueDate: vine.string().optional(),
    })
)

export const updateTaskValidator = vine.compile(
    vine.object({
        title: vine.string().trim().minLength(1).maxLength(255).optional(),
        description: vine.string().trim().optional(),
        status: vine.enum(['todo', 'in_progress', 'completed']).optional(),
        priority: vine.enum(['low', 'medium', 'high']).optional(),
        dueDate: vine.string().optional(),
    })
)