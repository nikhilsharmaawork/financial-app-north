export function ScreenHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <header className="flex items-end justify-between gap-4 px-6 pb-4 pt-8">
      <div>
        {subtitle && (
          <p className="text-sm font-medium text-primary">{subtitle}</p>
        )}
        <h1 className="font-serif text-3xl leading-tight text-foreground text-balance">
          {title}
        </h1>
      </div>
      {action}
    </header>
  )
}
