import { useEffect } from "react"

import {
  useNavigate,
  useParams,
} from "react-router-dom"

import { useDispatch, useSelector } from "react-redux"

import type { AppDispatch } from "@/app/store"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Button,
} from "@/components/ui/button"

import {
  Badge,
} from "@/components/ui/badge"

import {
  ArrowLeft,
  Pencil,
} from "lucide-react"

import {
  fetchSubscriptionBundleById,
} from "../subscriptionBundleThunks"

import {
  selectSelectedSubscriptionBundle,
  selectSubscriptionBundleLoading,
} from "../subscriptionBundleSelectors"

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(value || 0))
}

export default function ViewSubscriptionBundle() {
  const { id } = useParams()

  const navigate = useNavigate()

  const dispatch = useDispatch<AppDispatch>()

  const bundle = useSelector(
    selectSelectedSubscriptionBundle,
  )

  const loading = useSelector(
    selectSubscriptionBundleLoading,
  )

  useEffect(() => {
    if (id) {
      dispatch(
        fetchSubscriptionBundleById(
          Number(id),
        ),
      )
    }
  }, [dispatch, id])

  if (loading) {
    return (
      <div className="py-10 text-center">
        Loading subscription bundle...
      </div>
    )
  }

  if (!bundle) {
    return (
      <div className="py-10 text-center">
        Subscription bundle not found.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Subscription Bundle
          </h1>

          <p className="text-muted-foreground">
            View bundle details.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() =>
              navigate("/subscriptionbundles")
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button
            className="cursor-pointer"
            onClick={() =>
              navigate(
                `/subscriptionbundles/edit/${bundle.id}`,
              )
            }
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Basic Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Bundle Name
              </p>

              <p className="font-medium">
                {bundle.bundle_name}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Bundle Code
              </p>

              <p className="font-medium">
                {bundle.bundle_code}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Bundle Type
              </p>

              <p className="capitalize font-medium">
                {bundle.bundle_type}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Duration
              </p>

              <p className="font-medium">
                {bundle.bundle_duration_months ??
                  "Lifetime"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Status
              </p>

              <Badge>
                {bundle.bundle_status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Pricing
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Bundle Price
              </p>

              <p className="font-medium">
                {formatCurrency(
                  bundle.bundle_price,
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                GST
              </p>

              <p className="font-medium">
                {bundle.bundle_gst_percentage}%
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Total Price
              </p>

              <p className="text-xl font-bold">
                {formatCurrency(
                  bundle.bundle_total_price,
                )}
              </p>
            </div>

            {bundle.bundle_type === "perpetual" && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">
                    AMC Price
                  </p>

                  <p className="font-medium">
                    {formatCurrency(
                      bundle.bundle_amc_price ?? 0,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    AMC Duration
                  </p>

                  <p className="font-medium">
                    {bundle.bundle_amc_duration_months ??
                      "-"}{" "}
                    months
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    AMC GST
                  </p>

                  <p className="font-medium">
                    {bundle.bundle_amc_gst_percentage ??
                      0}
                    %
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              Included Subscription Plans
            </CardTitle>
          </CardHeader>

          <CardContent>
            {bundle.plan_ids.length === 0 ? (
              <p className="text-muted-foreground">
                No plans assigned.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {bundle.plan_ids.map(
                  (planId) => (
                    <Badge
                      key={planId}
                      variant="secondary"
                    >
                      Plan #{planId}
                    </Badge>
                  ),
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}