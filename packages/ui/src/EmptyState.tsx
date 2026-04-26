import React from 'react'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-12 gap-4">
      {icon && (
        <div className="flex items-center justify-center h-14 w-14 rounded-full bg-gray-100 text-gray-400">
          {icon}
        </div>
      )}

      <div className="flex flex-col gap-1 max-w-sm">
        <p className="text-base font-semibold text-gray-900">{title}</p>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>

      {action && (
        <Button variant="primary" size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
