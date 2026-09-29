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
  type LucideIcon,
} from "lucide-react"

const SIDEBAR_ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  organizations: Building2,
  modules: Package,
  submodules: Package,
  sub_modules: Package,
  subscription_plans: CreditCard,
  subscription_bundles: CreditCard,
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
  hundi_module: Coins,
  inventory: Boxes,
  inventory_module: Boxes,
  payments: CreditCard,
  analytics: BarChart3,
  notifications: Bell,
  settings: Settings,
}

export const DEFAULT_SIDEBAR_ICON: LucideIcon = Folder

export function getSidebarIcon(code: string): LucideIcon {
  return SIDEBAR_ICONS[code.toLowerCase()] ?? DEFAULT_SIDEBAR_ICON
}
