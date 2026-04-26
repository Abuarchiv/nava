import type { Tables } from './database';
export type Profile = Tables<'profiles'>;
export type WG = Tables<'wgs'>;
export type WGMember = Tables<'wg_members'>;
export type Expense = Tables<'expenses'>;
export type ExpenseSplit = Tables<'expense_splits'>;
export type ExpenseCategory = Tables<'expense_categories'>;
export type Settlement = Tables<'settlements'>;
export type Chore = Tables<'chores'>;
export type ChoreAssignment = Tables<'chore_assignments'>;
export type ChoreCompletion = Tables<'chore_completions'>;
export type ShoppingItem = Tables<'shopping_items'>;
export type Announcement = Tables<'announcements'>;
export type InviteLink = Tables<'invite_links'>;
export type PushToken = Tables<'push_tokens'>;
export type NotificationPreference = Tables<'notification_preferences'>;
export type WGMemberWithProfile = WGMember & {
    profiles: Profile;
};
export type WGWithMembers = WG & {
    wg_members: WGMemberWithProfile[];
};
export type ExpenseWithSplits = Expense & {
    expense_splits: (ExpenseSplit & {
        profiles: Profile;
    })[];
    expense_categories: ExpenseCategory | null;
    profiles: Profile;
};
export type ChoreWithAssignments = Chore & {
    chore_assignments: (ChoreAssignment & {
        profiles: Profile;
        chore_completions: ChoreCompletion[];
    })[];
};
export type ShoppingItemWithProfiles = ShoppingItem & {
    added_by_profile: Profile;
    bought_by_profile: Profile | null;
};
export type AnnouncementWithProfile = Announcement & {
    profiles: Profile;
};
export type UserBalance = {
    userId: string;
    displayName: string;
    avatarUrl: string | null;
    balance: number;
};
export type SettlementSuggestion = {
    from: UserBalance;
    to: UserBalance;
    amount: number;
};
export type CreateExpenseInput = {
    wg_id: string;
    paid_by: string;
    category_id?: string;
    description: string;
    amount: number;
    payment_method?: string;
    paid_on: string;
    splits: {
        user_id: string;
        share_amount: number;
        is_equal_split?: boolean;
    }[];
};
export type CreateChoreInput = {
    wg_id: string;
    name: string;
    description?: string;
    frequency: Tables<'chores'>['frequency'];
    assigned_to?: string;
    due_date?: string;
    created_by: string;
};
export type CreateSettlementInput = {
    wg_id: string;
    from_user: string;
    to_user: string;
    amount: number;
    description?: string;
};
export type CreateAnnouncementInput = {
    wg_id: string;
    posted_by: string;
    title: string;
    content: string;
    pinned?: boolean;
};
export type AddShoppingItemInput = {
    wg_id: string;
    name: string;
    category?: string;
    quantity?: number;
    unit?: string;
    added_by: string;
    notes?: string;
};
//# sourceMappingURL=app.d.ts.map