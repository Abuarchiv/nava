interface PageHeaderAction {
  label: string
  onClick: () => void
  icon?: React.ReactNode
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: PageHeaderAction
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between px-4 py-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold text-gray-900 truncate">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-gray-500 truncate">{subtitle}</p>
        )}
      </div>

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="ml-4 flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700 transition-colors"
        >
          {action.icon && <span className="w-4 h-4">{action.icon}</span>}
          {action.label}
        </button>
      )}
    </div>
  )
}
