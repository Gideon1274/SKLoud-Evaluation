// /*
// |--------------------------------------------------------------------------
// | Routes file
// |--------------------------------------------------------------------------
// |
// | The routes file is used for defining the HTTP routes.
// |
// */

// import { middleware } from '#start/kernel'
// import router from '@adonisjs/core/services/router'
// import { controllers } from '#generated/controllers'
// import TasksController from '#controllers/tasks_controller'

// router.get('/', () => {
//   return { hello: 'world' }
// })

// router
//   .group(() => {
//     router
//       .group(() => {
//         router.post('signup', [controllers.NewAccount, 'store'])
//         router.post('login', [controllers.AccessTokens, 'store'])
//       })
//       .prefix('auth')
//       .as('auth')

//     router
//       .group(() => {
//         router.get('profile', [controllers.Profile, 'show'])
//         router.post('logout', [controllers.AccessTokens, 'destroy'])
//       })
//       .prefix('account')
//       .as('profile')
//       .use(middleware.auth())

//     //remove wrap if auth is unnceessary
//     router.group(() => {
//       router.get('tasks', [TasksController, 'index'])
//       router.post('tasks', [TasksController, 'store'])
//       router.put('tasks/:id', [TasksController, 'update'])
//       router.delete('tasks/:id', [TasksController, 'destroy'])
//     }).use(middleware.auth())

//   })
//   .prefix('/api/v1')

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import TasksController from '#controllers/tasks_controller'
import { controllers } from '#generated/controllers'

router.group(() => {
  router
    .group(() => {
      router.post('signup', [controllers.NewAccount, 'store'])
      router.post('login', [controllers.AccessTokens, 'store'])
    })
    .prefix('auth')

  router
    .group(() => {
      router.get('profile', [controllers.Profile, 'show'])
      router.post('logout', [controllers.AccessTokens, 'destroy'])
    })
    .prefix('account')
    .use(middleware.auth())

  router
    .group(() => {
      router.get('tasks', [TasksController, 'index'])
      router.get('tasks/trash', [TasksController, 'trash'])
      router.post('tasks', [TasksController, 'store'])

      // Bulk actions (declared before the :id routes)
      router.post('tasks/bulk/status', [TasksController, 'bulkStatus'])
      router.post('tasks/bulk/trash', [TasksController, 'bulkTrash'])
      router.post('tasks/bulk/restore', [TasksController, 'restore'])
      router.post('tasks/bulk/purge', [TasksController, 'purge'])

      router.put('tasks/:id', [TasksController, 'update'])
      router.delete('tasks/:id', [TasksController, 'destroy'])
    })
    .use(middleware.auth())
}).prefix('/api')
