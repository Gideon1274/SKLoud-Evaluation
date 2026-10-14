/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'tasks.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/tasks',
    tokens: [{"old":"/api/tasks","type":0,"val":"api","end":""},{"old":"/api/tasks","type":0,"val":"tasks","end":""}],
    types: placeholder as Registry['tasks.index']['types'],
  },
  'tasks.store': {
    methods: ["POST"],
    pattern: '/api/tasks',
    tokens: [{"old":"/api/tasks","type":0,"val":"api","end":""},{"old":"/api/tasks","type":0,"val":"tasks","end":""}],
    types: placeholder as Registry['tasks.store']['types'],
  },
  'tasks.update': {
    methods: ["PUT"],
    pattern: '/api/tasks/:id',
    tokens: [{"old":"/api/tasks/:id","type":0,"val":"api","end":""},{"old":"/api/tasks/:id","type":0,"val":"tasks","end":""},{"old":"/api/tasks/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['tasks.update']['types'],
  },
  'tasks.destroy': {
    methods: ["DELETE"],
    pattern: '/api/tasks/:id',
    tokens: [{"old":"/api/tasks/:id","type":0,"val":"api","end":""},{"old":"/api/tasks/:id","type":0,"val":"tasks","end":""},{"old":"/api/tasks/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['tasks.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
