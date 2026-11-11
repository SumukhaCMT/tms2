import {
  LayoutDashboard,
  Building2,
  Package,
  Landmark,
  Users,
  ShieldCheck,
  FileText,
  Sparkles,
  CalendarCheck,
  HandCoins,
  Coins,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  Folder,
  Boxes,
  ReceiptText,
  CalendarClock,
  Headset,
  type LucideIcon,
} from "lucide-react"

const SIDEBAR_ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  organizations: Building2,
  modules: Package,
  submodules: Package,
  subscription_plans: CreditCard,
  subscription_bundles: CreditCard,
  manual_order: ReceiptText,
  subscriptions: CalendarClock,
  temples: Landmark,
  users: Users,
  roles: ShieldCheck,
  reports: FileText,
  deities: Sparkles,
  sevas: CalendarCheck,
  seva_bookings: CalendarCheck,
  seva_booking: CalendarCheck,
  seva_tokens: CalendarCheck,
  donations: HandCoins,
  hundi: Coins,
  inventory: Boxes,
  payments: CreditCard,
  analytics: BarChart3,
  notifications: Bell,
  settings: Settings,
  contact: Headset,
}

export const DEFAULT_SIDEBAR_ICON: LucideIcon = Folder

export function getSidebarIcon(code: string): LucideIcon {
  return SIDEBAR_ICONS[code.toLowerCase()] ?? DEFAULT_SIDEBAR_ICON
}
