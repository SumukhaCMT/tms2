const CUSTOM_ROUTES: Record<string, string> = {
  organizations: "/organizations",
  temples: "/temples",
  deities: "/deities",
  donations: "/donations",
  sevas: "/sevas",
  seva_booking: "/seva-booking",
  seva_bookings: "/seva-booking",
  tokens: "/tokens",
  devotees: "/devotees",
  payment_methods: "/payment-methods",
  hundi: "/hundi",
  hundi_module: "/hundi",
  inventory: "/inventory",
  inventory_module: "/inventory",
  pricing: "/pricing",
  modules: "/modules",
  submodules: "/submodule",
  sub_modules: "/submodule",
  subscription_plans: "/subscriptionplans",
  subscription_bundles: "/subscriptionbundles",
  roles: "/roles",
  settings: "/settings",
  users: "/users",
  trustees: "/trustees",
}

function autoSlug(code: string) {
  return `/${code.toLowerCase().replace(/_/g, "-")}`
}

export function getSidebarRoute(code: string): string {
  return CUSTOM_ROUTES[code.toLowerCase()] ?? autoSlug(code)
}
