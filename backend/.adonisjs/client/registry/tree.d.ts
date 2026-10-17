/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  newAccount: {
    store: typeof routes['new_account.store']
  }
  accessTokens: {
    store: typeof routes['access_tokens.store']
    destroy: typeof routes['access_tokens.destroy']
  }
  profile: {
    show: typeof routes['profile.show']
  }
  tasks: {
    index: typeof routes['tasks.index']
    trash: typeof routes['tasks.trash']
    store: typeof routes['tasks.store']
    bulkStatus: typeof routes['tasks.bulk_status']
    bulkTrash: typeof routes['tasks.bulk_trash']
    restore: typeof routes['tasks.restore']
    purge: typeof routes['tasks.purge']
    update: typeof routes['tasks.update']
    destroy: typeof routes['tasks.destroy']
  }
}
