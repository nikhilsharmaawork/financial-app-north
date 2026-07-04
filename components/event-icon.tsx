import {
  Banknote,
  Building2,
  CreditCard,
  FileText,
  GraduationCap,
  Receipt,
  type LucideIcon,
} from 'lucide-react'
import type { EventType, Goal } from '@/lib/types'
import {
  Laptop,
  Mountain,
  Plane,
  Shield,
  Target,
} from 'lucide-react'

const eventIcons: Record<EventType, LucideIcon> = {
  bill: Receipt,
  tuition: GraduationCap,
  residence: FileText,
  emi: CreditCard,
  salary: Banknote,
  other: Building2,
}

export function EventIcon({
  type,
  className,
}: {
  type: EventType
  className?: string
}) {
  const Icon = eventIcons[type]
  return <Icon className={className} />
}

const goalIcons: Record<string, LucideIcon> = {
  shield: Shield,
  plane: Plane,
  laptop: Laptop,
  mountain: Mountain,
  target: Target,
}

export function GoalIcon({
  icon,
  className,
  style,
}: {
  icon: Goal['icon']
  className?: string
  style?: React.CSSProperties
}) {
  const Icon = goalIcons[icon] ?? Target
  return <Icon className={className} style={style} />
}
