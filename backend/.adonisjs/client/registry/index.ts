/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'new_account.store': {
    methods: ["POST"],
    pattern: '/api/auth/signup',
    tokens: [{"old":"/api/auth/signup","type":0,"val":"api","end":""},{"old":"/api/auth/signup","type":0,"val":"auth","end":""},{"old":"/api/auth/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'access_tokens.store': {
    methods: ["POST"],
    pattern: '/api/auth/login',
    tokens: [{"old":"/api/auth/login","type":0,"val":"api","end":""},{"old":"/api/auth/login","type":0,"val":"auth","end":""},{"old":"/api/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['access_tokens.store']['types'],
  },
  'profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/account/profile',
    tokens: [{"old":"/api/account/profile","type":0,"val":"api","end":""},{"old":"/api/account/profile","type":0,"val":"account","end":""},{"old":"/api/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.show']['types'],
  },
  'access_tokens.destroy': {
    methods: ["POST"],
    pattern: '/api/account/logout',
    tokens: [{"old":"/api/account/logout","type":0,"val":"api","end":""},{"old":"/api/account/logout","type":0,"val":"account","end":""},{"old":"/api/account/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['access_tokens.destroy']['types'],
  },
  'tasks.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/tasks',
    tokens: [{"old":"/api/tasks","type":0,"val":"api","end":""},{"old":"/api/tasks","type":0,"val":"tasks","end":""}],
    types: placeholder as Registry['tasks.index']['types'],
  },
  'tasks.trash': {
    methods: ["GET","HEAD"],
    pattern: '/api/tasks/trash',
    tokens: [{"old":"/api/tasks/trash","type":0,"val":"api","end":""},{"old":"/api/tasks/trash","type":0,"val":"tasks","end":""},{"old":"/api/tasks/trash","type":0,"val":"trash","end":""}],
    types: placeholder as Registry['tasks.trash']['types'],
  },
  'tasks.store': {
    methods: ["POST"],
    pattern: '/api/tasks',
    tokens: [{"old":"/api/tasks","type":0,"val":"api","end":""},{"old":"/api/tasks","type":0,"val":"tasks","end":""}],
    types: placeholder as Registry['tasks.store']['types'],
  },
  'tasks.bulk_status': {
    methods: ["POST"],
    pattern: '/api/tasks/bulk/status',
    tokens: [{"old":"/api/tasks/bulk/status","type":0,"val":"api","end":""},{"old":"/api/tasks/bulk/status","type":0,"val":"tasks","end":""},{"old":"/api/tasks/bulk/status","type":0,"val":"bulk","end":""},{"old":"/api/tasks/bulk/status","type":0,"val":"status","end":""}],
    types: placeholder as Registry['tasks.bulk_status']['types'],
  },
  'tasks.bulk_trash': {
    methods: ["POST"],
    pattern: '/api/tasks/bulk/trash',
    tokens: [{"old":"/api/tasks/bulk/trash","type":0,"val":"api","end":""},{"old":"/api/tasks/bulk/trash","type":0,"val":"tasks","end":""},{"old":"/api/tasks/bulk/trash","type":0,"val":"bulk","end":""},{"old":"/api/tasks/bulk/trash","type":0,"val":"trash","end":""}],
    types: placeholder as Registry['tasks.bulk_trash']['types'],
  },
  'tasks.restore': {
    methods: ["POST"],
    pattern: '/api/tasks/bulk/restore',
    tokens: [{"old":"/api/tasks/bulk/restore","type":0,"val":"api","end":""},{"old":"/api/tasks/bulk/restore","type":0,"val":"tasks","end":""},{"old":"/api/tasks/bulk/restore","type":0,"val":"bulk","end":""},{"old":"/api/tasks/bulk/restore","type":0,"val":"restore","end":""}],
    types: placeholder as Registry['tasks.restore']['types'],
  },
  'tasks.purge': {
    methods: ["POST"],
    pattern: '/api/tasks/bulk/purge',
    tokens: [{"old":"/api/tasks/bulk/purge","type":0,"val":"api","end":""},{"old":"/api/tasks/bulk/purge","type":0,"val":"tasks","end":""},{"old":"/api/tasks/bulk/purge","type":0,"val":"bulk","end":""},{"old":"/api/tasks/bulk/purge","type":0,"val":"purge","end":""}],
    types: placeholder as Registry['tasks.purge']['types'],
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
