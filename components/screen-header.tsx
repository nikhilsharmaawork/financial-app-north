'use client'

import { useStore } from '@/lib/store'

export function ScreenHeader({
  title,
  subtitle,
  action,
  onProfileClick,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  /** If provided, shows a profile avatar button at the top-left that opens Settings. */
  onProfileClick?: () => void
}) {
  const { state } = useStore()

  return (
    <header className="flex items-end justify-between gap-4 px-6 pb-4 pt-8">
      <div className="flex items-end gap-3">
        {onProfileClick && (
          <button
            onClick={onProfileClick}
            aria-label="Open profile settings"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/15 text-primary transition-colors hover:bg-primary/25"
          >
            <span className="font-serif text-lg">
              {state.profile.name.charAt(0).toUpperCase() || '?'}
            </span>
          </button>
        )}
        <div>
          {subtitle && (
            <p className="text-sm font-medium text-primary">{subtitle}</p>
          )}
          <h1 className="font-serif text-3xl leading-tight text-foreground text-balance">
            {title}
          </h1>
        </div>
      </div>
      {action}
    </header>
  )
}
