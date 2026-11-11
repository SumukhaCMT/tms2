import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { AuthProvider } from "@/features/auth/useAuth"
import { Toaster } from "sonner"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import Layout from "@/components/layout/Layout"
import DashboardSkeleton from "@/features/dashboards/components/DashboardSkeleton"
import PublicRoute from "@/routes/PublicRoute"
import ProtectedRoute from "@/routes/ProtectedRoute"

const Login = lazy(() => import("@/features/auth/Login"))
const AuthLayout = lazy(() => import("@/features/auth/AuthLayout"))
const ForgotPassword = lazy(() => import("@/features/auth/ForgotPassword"))
const ResetPassword = lazy(() => import("@/features/auth/ResetPassword"))
const SetPassword = lazy(() => import("@/features/auth/SetPassword"))
const Profile = lazy(() => import("@/features/auth/Profile"))
const Contact = lazy(() => import("@/features/contact/Contact"))

// Lazy-loaded pages
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

const PricingPlans = lazy(() => import("@/features/subscription/pages/PricingPlans"))
const MySubscriptions = lazy(() => import("@/features/subscription/pages/MySubscriptions"))
const RenewSubscription = lazy(() => import("@/features/subscription/pages/RenewSubscription"))


const Users = lazy(() => import("@/features/users/users"))
const AddUser = lazy(() => import("@/features/users/addUser"))
const EditUser = lazy(() => import("@/features/users/editUser"))
const ViewUser = lazy(() => import("@/features/users/viewUser"))
const OrgAdminRoute = lazy(() => import("@/features/users/OrgAdminRoute"))
const UserPermissions = lazy(() => import("@/features/org_user_permissions/UserPermissions"))
const SuperAdminRoute = lazy(() => import("@/features/order_requests/SuperAdminRoute"))
const ManualOrders = lazy(() => import("@/features/order_requests/ManualOrders"))
const AddManualOrder = lazy(() => import("@/features/order_requests/AddManualOrder"))
const EditManualOrder = lazy(() => import("@/features/order_requests/EditManualOrder"))
const ManualOrderView = lazy(() => import("@/features/order_requests/ManualOrderViewPage"))

const Donations = lazy(() => import("@/features/donations/donations"))
const DonationView = lazy(() => import("@/features/donations/DonationViewPage"))
const AddDonations = lazy(() => import("@/features/donations/addDonations"))
const EditDonations = lazy(() => import("@/features/donations/EditDonations"))

const Hundi = lazy(() => import("@/features/hundi/hundi"))
const HundiView = lazy(() => import("@/features/hundi/HundiViewPage"))
const AddHundi = lazy(() => import("@/features/hundi/addHundi"))
const EditHundi = lazy(() => import("@/features/hundi/EditHundi"))
const HundiTable = lazy(() => import("@/features/hundi/hundi-table"))
const HundiTracking = lazy(() => import("@/features/hundi/hundiTracking"))
const AddHundiTracking = lazy(() => import("@/features/hundi/addHundiTracking"))
const EditHundiTracking = lazy(() => import("@/features/hundi/editHundiTracking"))

const Inventory = lazy(() => import("@/features/inventory/inventory"))
const InventoryView = lazy(() => import("@/features/inventory/InventoryViewPage"))
const AddInventory = lazy(() => import("@/features/inventory/addInventory"))
const EditInventory = lazy(() => import("@/features/inventory/editInventory"))
const InventoryUsage = lazy(() => import("@/features/inventory/inventoryUsage"))
const AddInventoryUsage = lazy(() => import("@/features/inventory/addInventoryUsage"))
const EditInventoryUsage = lazy(() => import("@/features/inventory/editInventoryUsage"))
const ViewInventoryUsage = lazy(() => import("@/features/inventory/viewInventoryUsage"))

const AddSubModule = lazy(
  () => import("@/features/sub_modules/pages/AddSubModule")
)
const EditSubModule = lazy(
  () => import("@/features/sub_modules/pages/EditSubModule")
)

const SubscriptionPlans = lazy(
  () => import("@/pages/SubscriptionPalns")
)
const AddSubscriptionPlans = lazy(
  () => import("@/features/subscription/pages/AddSubscriptionPlans")
)
const SubscriptionPlan = lazy(
  () => import("@/features/subscription/pages/SubscriptionPlans")
)
const EditSubscriptionPlans = lazy(
  () => import("@/features/subscription/pages/EditSubscriptionPlans")
)
const ViewSubscriptionPlans = lazy(
  () => import("@/features/subscription/pages/ViewSubscriptionPlans")
)

const SubscriptionBundle = lazy(
  () => import("@/pages/SubscriptionBundle")
)
const SubscriptionBundles = lazy(
  () => import("@/features/subscription_bundles/pages/SubscriptionBundles")
)
const AddSubscriptionBundle = lazy(
  () => import("@/features/subscription_bundles/pages/AddSubscriptionBundle")
)
const EditSubscriptionBundle = lazy(
  () => import("@/features/subscription_bundles/pages/EditSubscriptionBundle")
)
const ViewSubscriptionBundle = lazy(
  () => import("@/features/subscription_bundles/pages/ViewSubscriptionBundle")
)
const Settings = lazy(
  () => import("@/pages/Settings")
)
const View = lazy(
  () => import("@/features/setting/pages/View")
)


const Role = lazy(
  () => import("@/pages/Role")
)

const RolesTable = lazy(
  () => import("@/features/roles/components/RolesTable")
)

const AddRole = lazy(
  () => import("@/features/roles/pages/AddRole")
)
const ViewRole = lazy(
  () => import("@/features/roles/pages/ViewRole")
)
const EditRole = lazy(
  () => import("@/features/roles/pages/EditRole")
)

const Temple = lazy(
  () => import("@/pages/Temple")
)
const TempleTable = lazy(
  () => import("@/features/temple/components/TempleTable")
)
const AddTemple = lazy(
  () => import("@/features/temple/pages/AddTemple")
)
const EditTemple = lazy(
  () => import("@/features/temple/pages/EditTemple")
)

const ViewTemple = lazy(
  () => import("@/features/temple/pages/ViewTemple")
)

const Deities = lazy(() => import("@/pages/Deities"));

const DeitiesTable = lazy(
  () => import("@/features/deities/pages/Deities")
);

const AddDeities = lazy(
  () => import("@/features/deities/pages/AddDeities")
);

const ViewDeity = lazy(() => import("@/features/deities/pages/ViewDeity"));
const EditDeities = lazy(
  () => import("@/features/deities/pages/EditDeities")
);
const PaymentMethod = lazy(
  () => import("@/pages/PaymentMethod")
)

const PaymentMethodTable = lazy(
  () => import("@/features/payment_method/pages/PaymentMethods")
)

const AddPaymentMethod = lazy(
  () => import("@/features/payment_method/pages/AddPaymentMethod")
)

const EditPaymentMethod = lazy(
  () => import("@/features/payment_method/pages/EditPaymentMethod")
)


const  Seva =lazy(()=>import("@/pages/Seva"))
const  SevaTable =lazy(()=> import("@/features/seva/pages/Seva"))
const  AddSeva =lazy(()=> import("@/features/seva/pages/AddSeva"))
const  EditSeva =lazy(()=> import("@/features/seva/pages/EditSeva"))






const  Trustees =lazy(()=>import("@/pages/Trustees"))
const  TrusteesTable =lazy(()=> import("@/features/trustees/pages/Trustees"))
const  AddTrustees =lazy(()=> import("@/features/trustees/pages/AddTrustee"))
const  EditTrustees =lazy(()=> import("@/features/trustees/pages/EditTrustee"))

const  Tokens =lazy(()=>import("@/pages/Tokens"))
const  TokensTable =lazy(()=> import("@/features/token/pages/Tokens"))
const  AddTokens =lazy(()=> import("@/features/token/pages/AddToken"))
const  EditTokens =lazy(()=> import("@/features/token/pages/EditToken"))
const  IssuedTokenList =lazy(()=> import("@/features/token/pages/IssuedTokenList"))
const  SevaBooking =lazy(()=>import("@/pages/SevaBooking"))
const  SevaBookingTable =lazy(()=> import("@/features/seva_booking/pages/SevaBooking"))
const  AddSevaBooking =lazy(()=> import("@/features/seva_booking/pages/AddSevaBooking"))

const  ViewSevaBooking =lazy(()=> import("@/features/seva_booking/pages/ViewSevaBooking"))
const  Devotees =lazy(()=>import("@/pages/Devootes"))
const  DevoteesTable =lazy(()=> import("@/features/devotee/pages/Devotees"))
const ViewDevotee =lazy(()=> import("@/features/devotee/pages/ViewDevotee"))
const EditDevotee =lazy(()=> import("@/features/devotee/pages/EditDevotee"))
const AddDevotee =lazy(()=> import("@/features/devotee/pages/AddDevotee"))

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<DashboardSkeleton />}>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/set-password" element={<SetPassword />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route element={<ProtectedRoute requiredPermission="contact" requiredAction="READ" />}>
                <Route path="/contact" element={<Contact />} />
              </Route>
              <Route path="/renew/:code" element={<RenewSubscription />} />
              <Route element={<ProtectedRoute requiredPermission="plans" requiredAction="READ" />}>
                <Route path="/plans" element={<PricingPlans />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission="subscriptions" requiredAction="READ" />}>
                <Route path="/subscriptions" element={<MySubscriptions />} />
              </Route>

              <Route element={<SuperAdminRoute />}>
                <Route path="/manual_order" element={<ManualOrders />} />
                <Route path="/manual_order/add" element={<AddManualOrder />} />
                <Route path="/manual_order/view/:id" element={<ManualOrderView />} />
                <Route path="/manual_order/edit/:id" element={<EditManualOrder />} />
              </Route>

              <Route element={<OrgAdminRoute />}>
                <Route path="/users" element={<Users />} />
                <Route path="/users/add" element={<AddUser />} />
                <Route path="/users/:id" element={<ViewUser />} />
                <Route path="/users/:id/edit" element={<EditUser />} />
                <Route path="/org-user-permissions" element={<UserPermissions />} />
              </Route>

              <Route element={<ProtectedRoute requiredPermission="donations" requiredAction="READ" />}>
                <Route path="/donations" element={<Donations />} />
                <Route path="/donations/view/:id" element={<DonationView />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission="donations" requiredAction="ADD" />}>
                <Route path="/donations/add" element={<AddDonations />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission="donations" requiredAction="EDIT" />}>
                <Route path="/donations/edit/:id" element={<EditDonations />} />
              </Route>

              <Route element={<ProtectedRoute requiredPermission="hundi" requiredAction="READ" />}>
                <Route path="/hundi" element={<Hundi />} />
                <Route path="/hundi/view/:id" element={<HundiView />} />
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
                <Route path="/inventory/view/:id" element={<InventoryView />} />
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
                <Route path="/submodules" element={<SubModules />}>
                  <Route index element={<SubModule />} />
                  <Route element={<ProtectedRoute requiredPermission="submodules" requiredAction="ADD" />}>
                    <Route path="add" element={<AddSubModule />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="submodules" requiredAction="EDIT" />}>
                    <Route path="edit/:id" element={<EditSubModule />} />
                  </Route>
                </Route>
              </Route>

              <Route element={<ProtectedRoute requiredPermission="subscriptionplans" requiredAction="READ" />}>
                <Route path="/subscriptionplans" element={<SubscriptionPlans />}>
                  <Route index element={<SubscriptionPlan />} />
                  <Route path="view/:id" element={<ViewSubscriptionPlans />} />
                  <Route element={<ProtectedRoute requiredPermission="subscriptionplans" requiredAction="ADD" />}>
                    <Route path="add" element={<AddSubscriptionPlans />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="subscriptionplans" requiredAction="EDIT" />}>
                    <Route path="edit/:id" element={<EditSubscriptionPlans />} />
                  </Route>
                </Route>
              </Route>

              <Route element={<ProtectedRoute requiredPermission="subscription_bundles" requiredAction="READ" />}>
                <Route path="/subscription_bundles" element={<SubscriptionBundle />}>
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

              <Route element={<ProtectedRoute requiredPermission="temples" requiredAction="READ" />}>
                <Route path="/temples" element={<Temple />}>
                  <Route index element={<TempleTable />} />
                  <Route path="view/:id" element={<ViewTemple />} />
                  <Route element={<ProtectedRoute requiredPermission="temples" requiredAction="ADD" />}>
                    <Route path="add" element={<AddTemple />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="temples" requiredAction="EDIT" />}>
                    <Route path="edit/:id" element={<EditTemple />} />
                  </Route>
                </Route>
              </Route>


              <Route element={ <ProtectedRoute requiredPermission="Deities" requiredAction="READ" /> }>
                <Route path="/deities" element={<Deities />}>
                  <Route index element={<DeitiesTable />} />
                  <Route path="view/:id" element={<ViewDeity />} />
                  <Route  element={  <ProtectedRoute requiredPermission="Deities"  requiredAction="ADD" /> } >
                    <Route path="add" element={<AddDeities />} />
                  </Route>
                  <Route
                    element={ <ProtectedRoute  requiredPermission="Deities"  requiredAction="EDIT" /> } >
                    <Route path="edit/:id" element={<EditDeities />} />
                  </Route>
                </Route>
              </Route>

              <Route element={ <ProtectedRoute requiredPermission="payment_methods" requiredAction="READ" /> } >
                  <Route path="/payment_methods" element={<PaymentMethod />}>
                    <Route index element={<PaymentMethodTable />} />

                    <Route element={ <ProtectedRoute requiredPermission="payment_methods"  requiredAction="ADD" /> } >
                      <Route path="add" element={<AddPaymentMethod />} />
                    </Route>

                    <Route element={ <ProtectedRoute  requiredPermission="payment_methods"  requiredAction="EDIT" />  }  >
                      <Route path="edit/:id" element={<EditPaymentMethod />} />
                    </Route>
                  </Route>
              </Route>

              <Route element={  <ProtectedRoute  requiredPermission="sevas"  requiredAction="READ" />  }>
                <Route path="/sevas" element={<Seva />}>
                  <Route index element={<SevaTable />} />

                  <Route element={ <ProtectedRoute requiredPermission="sevas"  requiredAction="ADD"  /> }>
                    <Route path="add" element={<AddSeva />} />
                  </Route>

                  <Route element={ <ProtectedRoute  requiredPermission="sevas" requiredAction="EDIT" /> }>
                    <Route path="edit/:id" element={<EditSeva />} />
                  </Route>
                </Route>
              </Route>
              

              <Route element={  <ProtectedRoute  requiredPermission="Trustees"  requiredAction="READ" />  }>
                <Route path="/trustees" element={<Trustees />}>
                  <Route index element={<TrusteesTable />} />

                  <Route element={ <ProtectedRoute requiredPermission="Trustees"  requiredAction="ADD"  /> }>
                    <Route path="add" element={<AddTrustees />} />
                  </Route>

                  <Route element={ <ProtectedRoute  requiredPermission="Trustees" requiredAction="EDIT" /> }>
                    <Route path="edit/:id" element={<EditTrustees />} />
                  </Route>
                </Route>
              </Route>

              <Route element={  <ProtectedRoute  requiredPermission="tokens"  requiredAction="READ" />  }>
                <Route path="/tokens" element={<Tokens />}>
                  <Route index element={<TokensTable />} />

                  <Route element={ <ProtectedRoute requiredPermission="tokens"  requiredAction="ADD"  /> }>
                    <Route path="add" element={<AddTokens />} />
                  </Route>
                  <Route element={ <ProtectedRoute requiredPermission="tokens"  requiredAction="READ"  /> }>
                    <Route path="issued" element={<IssuedTokenList />} />
                  </Route>
                  <Route element={ <ProtectedRoute  requiredPermission="tokens" requiredAction="EDIT" /> }>
                    <Route path="edit/:id" element={<EditTokens />} />
                  </Route>
                 
                </Route>
              </Route>
              <Route element={  <ProtectedRoute  requiredPermission="seva_booking"  requiredAction="READ" />  }>
                <Route path="/seva_booking" element={<SevaBooking />}>
                  <Route index element={<SevaBookingTable />} />
                  <Route element={ <ProtectedRoute requiredPermission="seva_booking"  requiredAction="ADD"  /> }>
                    <Route path="add" element={<AddSevaBooking />} />
                  </Route>
                  
                
                  <Route element={ <ProtectedRoute requiredPermission="seva_booking"  requiredAction="READ"  /> }>
                    <Route path="view/:id" element={<ViewSevaBooking />} />
                  </Route>
                </Route>
              </Route>

              <Route element={  <ProtectedRoute  requiredPermission="Devotees"  requiredAction="READ" />  }>
                <Route path="/devotees" element={<Devotees />}>
                  <Route index element={<DevoteesTable />} />
                  
                  <Route element={ <ProtectedRoute  requiredPermission="Devotees" requiredAction="EDIT" /> }>
                    <Route path="edit/:id" element={<EditDevotee />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="Devotees" requiredAction="ADD" />}>
                    <Route path="add" element={<AddDevotee />} />
                  </Route>
                  <Route element={ <ProtectedRoute requiredPermission="Devotees"  requiredAction="READ"  /> }>
                    <Route path="view/:id" element={<ViewDevotee />} />
                  </Route>
                </Route>
              </Route>

            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
      <Toaster />
      <ConfirmDeleteDialog />
    </AuthProvider>
  )
}

export default App
