import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { AuthProvider } from "@/features/auth/useAuth"
import { Toaster } from "sonner"
import Layout from "@/components/layout/Layout"
import DashboardSkeleton from "@/features/dashboards/components/DashboardSkeleton"
import PublicRoute from "@/routes/PublicRoute"
import ProtectedRoute from "@/routes/ProtectedRoute"

const Login = lazy(() => import("@/features/auth/Login"))
const ForgotPassword = lazy(() => import("@/features/auth/ForgotPassword"))
const ResetPassword = lazy(() => import("@/features/auth/ResetPassword"))

const Dashboard = lazy(() => import("@/pages/Dashboard"))

const Organizations = lazy(() => import("@/pages/Organizations"))
const OrganizationsTable = lazy(() => import("@/features/organizations/pages/Organizations"))
const AddOrganizations = lazy(() => import("@/features/organizations/pages/AddOrganization"))
const EditOrganizations = lazy(() => import("@/features/organizations/pages/EditOrganizations"))
const ViewOrganizations = lazy(() => import("@/features/organizations/pages/ViewOrganizations"))

const Modules = lazy(() => import("@/pages/Modules"))
const ModulesTable = lazy(() => import("@/features/modules/pages/Modules"))
const AddModules = lazy(() => import("@/features/modules/pages/AddModule"))
const EditModule = lazy(() => import("@/features/modules/pages/EditModule"))
const ViewModule = lazy(() => import("@/features/modules/pages/ViewModule"))

const SubModules = lazy(() => import("@/pages/Modules"))
const SubModule = lazy(() => import("@/features/sub_modules/pages/SubModule"))
const AddSubModule = lazy(() => import("@/features/sub_modules/pages/AddSubModule"))
const EditSubModule = lazy(() => import("@/features/sub_modules/pages/EditSubModule"))

const SubscriptionPlans = lazy(() => import("@/pages/SubscriptionPalns"))
const SubscriptionPlan = lazy(() => import("@/features/subscription/pages/SubscriptionPlans"))
const AddSubscriptionPlans = lazy(() => import("@/features/subscription/pages/AddSubscriptionPlans"))
const EditSubscriptionPlans = lazy(() => import("@/features/subscription/pages/EditSubscriptionPlans"))
const ViewSubscriptionPlans = lazy(() => import("@/features/subscription/pages/ViewSubscriptionPlans"))

const SubscriptionBundle = lazy(() => import("@/pages/SubscriptionBundle"))
const SubscriptionBundles = lazy(() => import("@/features/subscription_bundles/pages/SubscriptionBundles"))
const AddSubscriptionBundle = lazy(() => import("@/features/subscription_bundles/pages/AddSubscriptionBundle"))
const EditSubscriptionBundle = lazy(() => import("@/features/subscription_bundles/pages/EditSubscriptionBundle"))
const ViewSubscriptionBundle = lazy(() => import("@/features/subscription_bundles/pages/ViewSubscriptionBundle"))

const Settings = lazy(() => import("@/pages/Settings"))
const View = lazy(() => import("@/features/setting/pages/View"))

const Role = lazy(() => import("@/pages/Role"))
const RolesTable = lazy(() => import("@/features/roles/components/RolesTable"))
const AddRole = lazy(() => import("@/features/roles/pages/AddRole"))
const ViewRole = lazy(() => import("@/features/roles/pages/ViewRole"))
const EditRole = lazy(() => import("@/features/roles/pages/EditRole"))

const Donations = lazy(() => import("@/features/donations/donations"))
const AddDonations = lazy(() => import("@/features/donations/addDonations"))
const EditDonations = lazy(() => import("@/features/donations/EditDonations"))

const Hundi = lazy(() => import("@/features/hundi/hundi"))
const AddHundi = lazy(() => import("@/features/hundi/addHundi"))
const EditHundi = lazy(() => import("@/features/hundi/EditHundi"))
const HundiTable = lazy(() => import("@/features/hundi/hundi-table"))
const HundiTracking = lazy(() => import("@/features/hundi/hundiTracking"))
const AddHundiTracking = lazy(() => import("@/features/hundi/addHundiTracking"))
const EditHundiTracking = lazy(() => import("@/features/hundi/editHundiTracking"))

const Inventory = lazy(() => import("@/features/inventory/inventory"))
const AddInventory = lazy(() => import("@/features/inventory/addInventory"))
const EditInventory = lazy(() => import("@/features/inventory/editInventory"))
const InventoryUsage = lazy(() => import("@/features/inventory/inventoryUsage"))
const AddInventoryUsage = lazy(() => import("@/features/inventory/addInventoryUsage"))
const EditInventoryUsage = lazy(() => import("@/features/inventory/editInventoryUsage"))
const ViewInventoryUsage = lazy(() => import("@/features/inventory/viewInventoryUsage"))

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<DashboardSkeleton />}>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />

              <Route element={<ProtectedRoute requiredPermission="donations" requiredAction="READ" />}>
                <Route path="/donations" element={<Donations />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission="donations" requiredAction="ADD" />}>
                <Route path="/donations/add" element={<AddDonations />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission="donations" requiredAction="EDIT" />}>
                <Route path="/donations/edit/:id" element={<EditDonations />} />
              </Route>

              <Route element={<ProtectedRoute requiredPermission="hundi" requiredAction="READ" />}>
                <Route path="/hundi" element={<Hundi />} />
                <Route path="/hundi/define" element={<HundiTable />} />
                <Route path="/hundi/tracking" element={<HundiTracking />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission="hundi" requiredAction="ADD" />}>
                <Route path="/hundi/add" element={<AddHundi />} />
                <Route path="/hundi/tracking/add" element={<AddHundiTracking />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission="hundi" requiredAction="EDIT" />}>
                <Route path="/hundi/edit/:id" element={<EditHundi />} />
                <Route path="/hundi/tracking/edit/:id" element={<EditHundiTracking />} />
              </Route>

              <Route element={<ProtectedRoute requiredPermission="inventory" requiredAction="READ" />}>
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/inventory/usage" element={<InventoryUsage />} />
                <Route path="/inventory/usage/view/:id" element={<ViewInventoryUsage />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission="inventory" requiredAction="ADD" />}>
                <Route path="/inventory/add" element={<AddInventory />} />
                <Route path="/inventory/usage/add" element={<AddInventoryUsage />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission="inventory" requiredAction="EDIT" />}>
                <Route path="/inventory/edit/:id" element={<EditInventory />} />
                <Route path="/inventory/usage/edit/:id" element={<EditInventoryUsage />} />
              </Route>

              <Route element={<ProtectedRoute requiredPermission="organizations" requiredAction="READ" />}>
                <Route path="/organizations" element={<Organizations />}>
                  <Route index element={<OrganizationsTable />} />
                  <Route path="view/:id" element={<ViewOrganizations />} />
                  <Route element={<ProtectedRoute requiredPermission="organizations" requiredAction="ADD" />}>
                    <Route path="add" element={<AddOrganizations />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="organizations" requiredAction="EDIT" />}>
                    <Route path="edit/:id" element={<EditOrganizations />} />
                  </Route>
                </Route>
              </Route>

              <Route element={<ProtectedRoute requiredPermission="modules" requiredAction="READ" />}>
                <Route path="/modules" element={<Modules />}>
                  <Route index element={<ModulesTable />} />
                  <Route path="view/:id" element={<ViewModule />} />
                  <Route element={<ProtectedRoute requiredPermission="modules" requiredAction="ADD" />}>
                    <Route path="add" element={<AddModules />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="modules" requiredAction="EDIT" />}>
                    <Route path="edit/:id" element={<EditModule />} />
                  </Route>
                </Route>
              </Route>

              <Route element={<ProtectedRoute requiredPermission="submodules" requiredAction="READ" />}>
                <Route path="/submodule" element={<SubModules />}>
                  <Route index element={<SubModule />} />
                  <Route element={<ProtectedRoute requiredPermission="submodules" requiredAction="ADD" />}>
                    <Route path="add" element={<AddSubModule />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="submodules" requiredAction="EDIT" />}>
                    <Route path="edit/:id" element={<EditSubModule />} />
                  </Route>
                </Route>
              </Route>

              <Route element={<ProtectedRoute requiredPermission="subscription_plans" requiredAction="READ" />}>
                <Route path="/subscriptionplans" element={<SubscriptionPlans />}>
                  <Route index element={<SubscriptionPlan />} />
                  <Route path="view/:id" element={<ViewSubscriptionPlans />} />
                  <Route element={<ProtectedRoute requiredPermission="subscription_plans" requiredAction="ADD" />}>
                    <Route path="add" element={<AddSubscriptionPlans />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="subscription_plans" requiredAction="EDIT" />}>
                    <Route path="edit/:id" element={<EditSubscriptionPlans />} />
                  </Route>
                </Route>
              </Route>

              <Route element={<ProtectedRoute requiredPermission="subscription_bundles" requiredAction="READ" />}>
                <Route path="/subscriptionbundles" element={<SubscriptionBundle />}>
                  <Route index element={<SubscriptionBundles />} />
                  <Route path="view/:id" element={<ViewSubscriptionBundle />} />
                  <Route element={<ProtectedRoute requiredPermission="subscription_bundles" requiredAction="ADD" />}>
                    <Route path="add" element={<AddSubscriptionBundle />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="subscription_bundles" requiredAction="EDIT" />}>
                    <Route path="edit/:id" element={<EditSubscriptionBundle />} />
                  </Route>
                </Route>
              </Route>

              <Route element={<ProtectedRoute requiredPermission="settings" requiredAction="READ" />}>
                <Route path="/settings" element={<Settings />}>
                  <Route index element={<View />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute requiredPermission="roles" requiredAction="READ" />}>
                <Route path="/roles" element={<Role />}>
                  <Route index element={<RolesTable />} />
                  <Route path="view/:id" element={<ViewRole />} />
                  <Route element={<ProtectedRoute requiredPermission="roles" requiredAction="ADD" />}>
                    <Route path="add" element={<AddRole />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="roles" requiredAction="EDIT" />}>
                    <Route path="edit/:id" element={<EditRole />} />
                  </Route>
                </Route>
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
      <Toaster />
    </AuthProvider>
  )
}

export default App
