import type { HttpContext } from '@adonisjs/core/http'
import Task from '#models/task'
import { createTaskValidator, updateTaskValidator } from '#validators/task'
import { DateTime } from 'luxon'

export default class TasksController {
    async index({ request, response, auth }: HttpContext) {
        const user = auth.getUserOrFail()
        const { status, priority } = request.qs()
        const query = Task.query().where('user_id', user.id)

        if (status) query.where('status', status)
        if (priority) query.where('priority', priority)

        const tasks = await query.orderBy('created_at', 'desc')
        return response.ok(tasks)
    }

    async store({ request, response, auth }: HttpContext) {
        const user = auth.getUserOrFail()
        const payload = await request.validateUsing(createTaskValidator)

        const taskData = {
            ...payload,
            userId: user.id,
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

    async destroy({ params, response, auth }: HttpContext) {
        const user = auth.getUserOrFail()
        const task = await Task.query()
            .where('id', params.id)
            .andWhere('user_id', user.id)
            .firstOrFail()

        await task.delete()
        return response.ok({ message: 'Task deleted successfully' })
    }
}