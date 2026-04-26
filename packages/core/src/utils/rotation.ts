import type { ChoreAssignment, Enums } from '@nava/types';

export type ChoreFrequency = Enums<'chore_frequency'>;

/**
 * Return the next member in a round-robin rotation.
 * If `lastAssignee` is not in the list, returns the first member.
 */
export function getNextAssignee(members: string[], lastAssignee: string): string {
  if (members.length === 0) {
    throw new Error('Cannot determine next assignee: members array is empty');
  }

  const currentIndex = members.indexOf(lastAssignee);

  if (currentIndex === -1) {
    return members[0] as string;
  }

  const nextIndex = (currentIndex + 1) % members.length;
  return members[nextIndex] as string;
}

/**
 * Advance a date by one frequency unit.
 */
export function getNextDueDate(from: Date, frequency: ChoreFrequency): Date {
  const next = new Date(from);

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
  }

  return next;
}

/**
 * Generate a rotation schedule for a chore.
 *
 * @param choreId   - ID of the chore
 * @param members   - Ordered list of member user_ids to rotate through
 * @param startDate - First due date
 * @param frequency - How often the chore repeats
 * @param periods   - How many assignments to generate (default: 12)
 */
export function generateRotationSchedule(
  choreId: string,
  members: string[],
  startDate: Date,
  frequency: ChoreFrequency,
  periods = 12,
): Pick<ChoreAssignment, 'chore_id' | 'user_id' | 'due_on'>[] {
  if (members.length === 0) return [];

  const assignments: Pick<ChoreAssignment, 'chore_id' | 'user_id' | 'due_on'>[] = [];
  let currentDate = new Date(startDate);

  for (let i = 0; i < periods; i++) {
    const assigneeIndex = i % members.length;
    const assignee = members[assigneeIndex] as string;

    assignments.push({
      chore_id: choreId,
      user_id: assignee,
      due_on: currentDate.toISOString().slice(0, 10), // YYYY-MM-DD
    });

    currentDate = getNextDueDate(currentDate, frequency);
  }

  return assignments;
}
