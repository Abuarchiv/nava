export type ExpenseCategory =
  | 'groceries'
  | 'household'
  | 'utilities'
  | 'rent'
  | 'entertainment'
  | 'other'

const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  { emoji: string; label: string; bg: string }
> = {
  groceries:     { emoji: '🛒', label: 'Lebensmittel',  bg: 'bg-green-100' },
  household:     { emoji: '🏠', label: 'Haushalt',       bg: 'bg-blue-100' },
  utilities:     { emoji: '⚡', label: 'Nebenkosten',    bg: 'bg-yellow-100' },
  rent:          { emoji: '🔑', label: 'Miete',          bg: 'bg-purple-100' },
  entertainment: { emoji: '🎬', label: 'Unterhaltung',   bg: 'bg-pink-100' },
  other:         { emoji: '📦', label: 'Sonstiges',      bg: 'bg-gray-100' },
}

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_CONFIG).map(
  ([slug, cfg]) => ({ slug: slug as ExpenseCategory, ...cfg }),
)

interface CategoryIconProps {
  category: ExpenseCategory | string | null | undefined
  size?: 'sm' | 'md' | 'lg'
}

export function CategoryIcon({ category, size = 'md' }: CategoryIconProps) {
  const key = (category ?? 'other') as ExpenseCategory
  const cfg = CATEGORY_CONFIG[key] ?? CATEGORY_CONFIG.other

  const sizeClass = {
    sm: 'w-8 h-8 text-base',
    md: 'w-10 h-10 text-lg',
    lg: 'w-12 h-12 text-xl',
  }[size]

  return (
    <div
      className={`${sizeClass} ${cfg.bg} rounded-full flex items-center justify-center flex-shrink-0`}
      title={cfg.label}
    >
      {cfg.emoji}
    </div>
  )
}

export function categoryLabel(category: ExpenseCategory | string | null | undefined): string {
  const key = (category ?? 'other') as ExpenseCategory
  return CATEGORY_CONFIG[key]?.label ?? 'Sonstiges'
}
