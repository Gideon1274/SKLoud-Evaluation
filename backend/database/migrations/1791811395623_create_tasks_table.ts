import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tasks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('title').notNullable()
      table.text('description').nullable()
      table.string('status').defaultTo('todo').notNullable() // todo, in_progress, completed
      table.string('priority').defaultTo('medium').notNullable() // low, medium, high

      table.boolean('is_active').defaultTo(true).notNullable()
      
      table.timestamp('due_date').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}