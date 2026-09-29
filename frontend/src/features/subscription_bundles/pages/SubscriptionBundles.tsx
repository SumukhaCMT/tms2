



import SubscriptionBundlesTable from "../components/SubscriptionBundlesTable"

export default function SubscriptionBundles() {
  return (
    <div className="w-full space-y-6">

      {/* <div>
        <h1 className="text-2xl font-semibold">
          Subscription Plans
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage subscription plans and pricing.
        </p>
      </div> */}

      <SubscriptionBundlesTable />

    </div>
  )
}