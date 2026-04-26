import type {
  ExpenseWithSplits,
  Settlement,
  SettlementSuggestion,
  UserBalance,
  WGMemberWithProfile,
} from '@nava/types';
import { roundToTwo } from './currency.js';

/**
 * Calculate the net balance for every member of a WG.
 *
 * Algorithm:
 *  1. For each expense, credit the payer with the full amount.
 *  2. For each split, debit each participant with their share_amount.
 *  3. For each settlement, adjust from/to balances accordingly.
 *
 * Positive balance  → the user is owed money.
 * Negative balance  → the user owes money.
 */
export function calculateBalances(
  expenses: ExpenseWithSplits[],
  members: WGMemberWithProfile[],
  settlements: Settlement[],
): UserBalance[] {
  const balanceMap = new Map<string, UserBalance>();

  // Initialise every member at 0
  for (const member of members) {
    balanceMap.set(member.user_id, {
      userId: member.user_id,
      displayName: member.profiles.display_name ?? member.user_id,
      avatarUrl: member.profiles.avatar_url,
      balance: 0,
    });
  }

  const getOrCreate = (userId: string): UserBalance => {
    if (!balanceMap.has(userId)) {
      balanceMap.set(userId, {
        userId,
        displayName: userId,
        avatarUrl: null,
        balance: 0,
      });
    }
    // biome-ignore lint/style/noNonNullAssertion: just set above
    return balanceMap.get(userId)!;
  };

  // Process expenses
  for (const expense of expenses) {
    // Credit payer
    const payer = getOrCreate(expense.paid_by);
    payer.balance += expense.amount;

    // Debit each split participant
    for (const split of expense.expense_splits) {
      const participant = getOrCreate(split.user_id);
      participant.balance -= split.share_amount;
    }
  }

  // Process settlements  (from_user paid to_user → from_user's debt decreases)
  for (const settlement of settlements) {
    const from = getOrCreate(settlement.from_user);
    const to = getOrCreate(settlement.to_user);
    from.balance += settlement.amount;
    to.balance -= settlement.amount;
  }

  // Round every balance and return
  return Array.from(balanceMap.values()).map((b) => ({
    ...b,
    balance: roundToTwo(b.balance),
  }));
}

/**
 * Simplify debts using a greedy algorithm.
 *
 * Strategy  (O(n log n)):
 *  - Separate creditors (positive balance) and debtors (negative balance).
 *  - Sort both lists by absolute value descending.
 *  - Greedily match the largest debtor to the largest creditor.
 *  - Each iteration produces exactly one transaction.
 *
 * This minimises the total number of transactions needed.
 * Business-critical: this must always be correct.
 */
export function simplifyDebts(balances: UserBalance[]): SettlementSuggestion[] {
  const suggestions: SettlementSuggestion[] = [];

  // Work on mutable copies keyed by userId
  const debtors: Array<{ info: UserBalance; amount: number }> = [];
  const creditors: Array<{ info: UserBalance; amount: number }> = [];

  for (const b of balances) {
    const rounded = roundToTwo(b.balance);
    if (rounded < -0.005) {
      debtors.push({ info: b, amount: Math.abs(rounded) });
    } else if (rounded > 0.005) {
      creditors.push({ info: b, amount: rounded });
    }
  }

  // Sort descending by amount — largest first
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  let di = 0;
  let ci = 0;

  while (di < debtors.length && ci < creditors.length) {
    const debtor = debtors[di];
    const creditor = creditors[ci];

    if (!debtor || !creditor) break;

    const transferAmount = roundToTwo(Math.min(debtor.amount, creditor.amount));

    if (transferAmount > 0.005) {
      suggestions.push({
        from: {
          userId: debtor.info.userId,
          displayName: debtor.info.displayName,
          avatarUrl: debtor.info.avatarUrl,
          balance: -debtor.amount,
        },
        to: {
          userId: creditor.info.userId,
          displayName: creditor.info.displayName,
          avatarUrl: creditor.info.avatarUrl,
          balance: creditor.amount,
        },
        amount: transferAmount,
      });
    }

    debtor.amount = roundToTwo(debtor.amount - transferAmount);
    creditor.amount = roundToTwo(creditor.amount - transferAmount);

    if (debtor.amount <= 0.005) di++;
    if (creditor.amount <= 0.005) ci++;
  }

  return suggestions;
}

/**
 * Alias for simplifyDebts — generates minimal settlement suggestions.
 */
export function generateSettlementSuggestions(
  balances: UserBalance[],
): SettlementSuggestion[] {
  return simplifyDebts(balances);
}
