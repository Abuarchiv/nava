'use client'

import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] px-6 py-10 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Etwas ist schiefgelaufen
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            Ein unerwarteter Fehler ist aufgetreten. Wir wurden benachrichtigt und
            arbeiten daran.
          </p>
          {this.state.error && (
            <p className="text-xs text-gray-400 font-mono mb-6 max-w-xs break-all">
              {this.state.error.message}
            </p>
          )}
          <button
            type="button"
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 active:bg-indigo-700 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Erneut versuchen
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
