export { createBrowserClient, createServerClient } from './client'
export type { SupabaseClient } from './client'

export {
  getExpenses,
  createExpense,
  deleteExpense,
  getWgBalances,
  createSettlement,
} from './queries/expenses'

export {
  getChores,
  createChore,
  completeChore,
  deleteChore,
} from './queries/chores'

export {
  getShoppingItems,
  addShoppingItem,
  markAsBought,
  deleteShoppingItem,
} from './queries/shopping'

export {
  getMyWgs,
  getWg,
  getWgMembers,
  createWg,
  createInviteLink,
  joinWgByToken,
} from './queries/wg'

export {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  pinAnnouncement,
} from './queries/announcements'
