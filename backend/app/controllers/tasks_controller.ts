import type { HttpContext } from '@adonisjs/core/http'
import Task from '#models/task'
import {
    createTaskValidator,
    updateTaskValidator,
    bulkIdsValidator,
    bulkStatusValidator,
} from '#validators/task'
import { DateTime } from 'luxon'

export default class TasksController {
    /** Active (non-trashed) tasks only. */
    async index({ request, response, auth }: HttpContext) {
        const user = auth.getUserOrFail()
        const { status, priority } = request.qs()
        const query = Task.query().where('user_id', user.id).where('is_active', true)

        if (status) query.where('status', status)
        if (priority) query.where('priority', priority)

        const tasks = await query.orderBy('created_at', 'desc')
        return response.ok(tasks)
    }

    /** Trashed (soft-deleted) tasks, most recently deleted first. */
    async trash({ response, auth }: HttpContext) {
        const user = auth.getUserOrFail()
        const tasks = await Task.query()
            .where('user_id', user.id)
            .where('is_active', false)
            .orderBy('updated_at', 'desc')
        return response.ok(tasks)
    }

    async store({ request, response, auth }: HttpContext) {
        const user = auth.getUserOrFail()
        const payload = await request.validateUsing(createTaskValidator)

        const taskData = {
            ...payload,
            userId: user.id,
            isActive: true,
            dueDate: payload.dueDate ? DateTime.fromISO(payload.dueDate) : null,
        }

        const task = await Task.create(taskData)
        return response.created(task)
    }

    async update({ params, request, response, auth }: HttpContext) {
        const user = auth.getUserOrFail()
        const task = await Task.query()
            .where('id', params.id)
            .andWhere('user_id', user.id)
            .andWhere('is_active', true)
            .firstOrFail()

        const payload = await request.validateUsing(updateTaskValidator)

        const { dueDate, ...rest } = payload

        task.merge(rest)

        if (dueDate !== undefined) {
            task.dueDate = dueDate ? DateTime.fromISO(dueDate) : null
        }

        await task.save()

        return response.ok(task)
    }

    /** Soft delete: moves a single task to the trash. */
    async destroy({ params, response, auth }: HttpContext) {
        const user = auth.getUserOrFail()
        const task = await Task.query()
            .where('id', params.id)
            .andWhere('user_id', user.id)
            .andWhere('is_active', true)
            .firstOrFail()

        task.isActive = false
        await task.save()
        return response.ok({ message: 'Task moved to trash' })
    }

    // ---------------------------------------------------------------------
    // Bulk actions (always scoped to the authenticated user)
    // ---------------------------------------------------------------------

    /** Change the status of several active tasks at once. */
    async bulkStatus({ request, response, auth }: HttpContext) {
        const user = auth.getUserOrFail()
        const { ids, status } = await request.validateUsing(bulkStatusValidator)

        const updated = await Task.query()
            .where('user_id', user.id)
            .where('is_active', true)
            .whereIn('id', ids)
            .update({ status, updated_at: DateTime.now().toSQL() })

        return response.ok({ message: 'Tasks updated', count: Number(updated) })
    }

    /** Soft delete several tasks at once. */
    async bulkTrash({ request, response, auth }: HttpContext) {
        const user = auth.getUserOrFail()
        const { ids } = await request.validateUsing(bulkIdsValidator)

        const updated = await Task.query()
            .where('user_id', user.id)
            .where('is_active', true)
            .whereIn('id', ids)
            .update({ is_active: false, updated_at: DateTime.now().toSQL() })

        return response.ok({ message: 'Tasks moved to trash', count: Number(updated) })
    }

    /** Restore trashed tasks. */
    async restore({ request, response, auth }: HttpContext) {
        const user = auth.getUserOrFail()
        const { ids } = await request.validateUsing(bulkIdsValidator)

        const updated = await Task.query()
            .where('user_id', user.id)
            .where('is_active', false)
            .whereIn('id', ids)
            .update({ is_active: true, updated_at: DateTime.now().toSQL() })

        return response.ok({ message: 'Tasks restored', count: Number(updated) })
    }

    /** Permanently delete tasks. Only tasks already in the trash can be purged. */
    async purge({ request, response, auth }: HttpContext) {
        const user = auth.getUserOrFail()
        const { ids } = await request.validateUsing(bulkIdsValidator)

        const deleted = await Task.query()
            .where('user_id', user.id)
            .where('is_active', false)
            .whereIn('id', ids)
            .delete()

        return response.ok({ message: 'Tasks permanently deleted', count: Number(deleted) })
    }
}
