

// "use client"

// import {
//   useEffect,
//   useState,
// } from "react"

// import {
//   NavLink,
//   useNavigate,
//   useParams,
// } from "react-router-dom"

// import {
//   useDispatch,
//   useSelector,
// } from "react-redux"

// import {
//   ArrowLeft,
//   Building2,
//   Calendar,
//   Clock,
//   FileText,
//   Globe,
//   // Mail,
//   MapPin,
//   // Pencil,
//   Phone,
//   Save,
//   ShieldCheck,
//   X,
// } from "lucide-react"

// import type { AppDispatch } from "@/app/store"

// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"

// // import {
// //   Badge,
// // } from "@/components/ui/badge"

// import {
//   Button,
// } from "@/components/ui/button"

// import {
//   Input,
// } from "@/components/ui/input"

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"

// import {
//   fetchOrganizationById,
//   updateOrganization,
// } from "../organizationThunks"

// import {
//   selectSelectedOrganization,
//   selectOrganizationDetailsLoading,
//   selectOrganizationSubmitting,
//   selectOrganizationError,
// } from "../organizationSelectors"

// import type {
//   OrganizationDetails,
//   OrganizationStatus,
// } from "../organizationsTypes"

// /* =========================================================
//    COMPONENT
// ========================================================= */

// export default function EditOrganizations() {
//   const { id } = useParams<{
//     id: string
//   }>()

//   const navigate = useNavigate()

//   const dispatch =
//     useDispatch<AppDispatch>()

//   /* =========================================================
//      REDUX
//   ========================================================= */

//   const organization =
//     useSelector(
//       selectSelectedOrganization,
//     )

//   const loading =
//     useSelector(
//       selectOrganizationDetailsLoading,
//     )

//   const submitting =
//     useSelector(
//       selectOrganizationSubmitting,
//     )

//   const error =
//     useSelector(
//       selectOrganizationError,
//     )

//   /* =========================================================
//      LOCAL FORM
//   ========================================================= */

//   const [formData, setFormData] =
//     useState<OrganizationDetails | null>(
//       null,
//     )

//   const [formError, setFormError] =
//     useState<string | null>(null)

//   /* =========================================================
//      FETCH ORGANIZATION
//   ========================================================= */

//   useEffect(() => {
//     if (!id) {
//       return
//     }

//     dispatch(
//       fetchOrganizationById(id),
//     )
//   }, [dispatch, id])

//   /* =========================================================
//      SET FORM DATA
//   ========================================================= */

//   useEffect(() => {
//     if (!organization) {
//       return
//     }

//     setFormData({
//       ...organization,
//     })

//     setFormError(null)
//   }, [organization])

//   /* =========================================================
//      UPDATE FIELD
//   ========================================================= */

//   const updateField = <
//     K extends keyof OrganizationDetails,
//   >(
//     field: K,
//     value: OrganizationDetails[K],
//   ) => {
//     setFormData((previous) => {
//       if (!previous) {
//         return previous
//       }

//       return {
//         ...previous,
//         [field]: value,
//       }
//     })
//   }

//   /* =========================================================
//      SAVE
//   ========================================================= */

//   const handleSave = async () => {
//     if (!formData) {
//       return
//     }

//     setFormError(null)

//     /* -------------------------------------------------------
//        BASIC VALIDATION
//     ------------------------------------------------------- */

//     if (!formData.org_name.trim()) {
//       setFormError(
//         "Organization name is required.",
//       )

//       return
//     }

//     if (!formData.org_email.trim()) {
//       setFormError(
//         "Organization email is required.",
//       )

//       return
//     }

//     if (!formData.org_phone.trim()) {
//       setFormError(
//         "Organization phone is required.",
//       )

//       return
//     }

//     if (!formData.org_city.trim()) {
//       setFormError(
//         "City is required.",
//       )

//       return
//     }

//     try {
//       /* -----------------------------------------------------
//          CURRENT UPDATE THUNK PAYLOAD
         
//          Your current UpdateOrganizationPayload
//          uses:
         
//          name
//          code
//          email
//          phone
//          city
//          status
         
//          Therefore we map the detail object to
//          that existing payload.
//       ----------------------------------------------------- */

//       await dispatch(
//         updateOrganization({
//           id: formData.id,

//           name: formData.org_name,

//           code: formData.org_slug,

//           email: formData.org_email,

//           org_phone: formData.org_phone,

//           org_city: formData.org_city,

//           org_status:
//             formData.org_status,
//         }),
//       ).unwrap()

//       /* -----------------------------------------------------
//          Reload latest organization data
//       ----------------------------------------------------- */

//       await dispatch(
//         fetchOrganizationById(
//           formData.id,
//         ),
//       ).unwrap()

//       /* -----------------------------------------------------
//          Go back to view page
//       ----------------------------------------------------- */

//       navigate(
//         `/organizations/view/${formData.id}`,
//       )
//     } catch (error) {
//       setFormError(
//         typeof error === "string"
//           ? error
//           : "Failed to update organization.",
//       )
//     }
//   }

//   /* =========================================================
//      CANCEL
//   ========================================================= */

//   const handleCancel = () => {
//     if (!formData) {
//       navigate("/organizations")
//       return
//     }

//     navigate(
//       `/organizations/view/${formData.id}`,
//     )
//   }

//   /* =========================================================
//      LOADING
//   ========================================================= */

//   if (loading) {
//     return (
//       <div className="flex min-h-[400px] items-center justify-center">
//         <div className="text-sm text-muted-foreground">
//           Loading organization...
//         </div>
//       </div>
//     )
//   }

//   /* =========================================================
//      ERROR
//   ========================================================= */

//   if (error && !organization) {
//     return (
//       <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">

//         <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
//           <Building2 className="size-6 text-destructive" />
//         </div>

//         <div className="text-center">

//           <h2 className="text-lg font-semibold">
//             Failed to load organization
//           </h2>

//           <p className="mt-1 text-sm text-muted-foreground">
//             {error}
//           </p>

//         </div>

//         <Button
//           variant="outline"
       
//         >
//           <NavLink to="/organizations">
//             Back to Organizations
//           </NavLink>
//         </Button>

//       </div>
//     )
//   }

//   /* =========================================================
//      NOT FOUND
//   ========================================================= */

//   if (!formData) {
//     return (
//       <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">

//         <Building2 className="size-10 text-muted-foreground" />

//         <h2 className="text-lg font-semibold">
//           Organization not found
//         </h2>

//         <Button
//           variant="outline"
         
//         >
//           <NavLink to="/organizations">
//             Back to Organizations
//           </NavLink>
//         </Button>

//       </div>
//     )
//   }

//   /* =========================================================
//      STATUS
//   ========================================================= */

//   const isActive =
//     formData.org_status === "active"

//   /* =========================================================
//      RENDER
//   ========================================================= */

//   return (
//     <div className="w-full space-y-6">

//       {/* =====================================================
//           PAGE HEADER
//       ===================================================== */}

//       <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

//         <div>

//           <p className="text-sm text-muted-foreground">
//             Organizations
//           </p>

//           <h1 className="text-2xl font-semibold tracking-tight">
//             Edit Organization
//           </h1>

//           <p className="mt-1 text-sm text-muted-foreground">
//             Update organization information
//           </p>

//         </div>

//         <div className="flex gap-2">

//           <Button
//             variant="outline"
          
//           >
//             <NavLink
//               to={`/organizations`}
//             >
//               <ArrowLeft className="mr-2 size-4" />
//               Back
//             </NavLink>
//           </Button>

//         </div>

//       </div>

//       {/* =====================================================
//           FORM ERROR
//       ===================================================== */}

//       {(formError || error) && (
//         <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
//           {formError || error}
//         </div>
//       )}

//       {/* =====================================================
//           ORGANIZATION PROFILE
//       ===================================================== */}

//       <Card>

//         <CardHeader>

//           <CardTitle className="flex items-center gap-2">
//             <Building2 className="size-5" />
//             Organization Profile
//           </CardTitle>

//           <p className="text-sm text-muted-foreground">
//             Update basic organization information.
//           </p>

//         </CardHeader>

//         <CardContent>

//           <div className="grid gap-6 lg:grid-cols-[120px_1fr]">

//             {/* =================================================
//                 LOGO
//             ================================================= */}

//             <div className="flex">

//               <div className="flex size-28 items-center justify-center overflow-hidden rounded-xl border bg-muted">

//                 {formData.org_img_name ? (
//                   <img
//                     src={formData.org_img_name}
//                     alt={formData.org_name}
//                     className="size-full object-cover"
//                   />
//                 ) : (
//                   <Building2 className="size-12 text-muted-foreground" />
//                 )}

//               </div>

//             </div>

//             {/* =================================================
//                 BASIC FIELDS
//             ================================================= */}

//             <div className="grid gap-5 sm:grid-cols-2">

//               <FormField
//                 label="Organization Name"
//                 required
//               >
//                 <Input
//                   value={
//                     formData.org_name
//                   }
//                   onChange={(event) =>
//                     updateField(
//                       "org_name",
//                       event.target.value,
//                     )
//                   }
//                   placeholder="Organization name"
//                 />
//               </FormField>

//               <FormField
//                 label="Organization Slug"
//               >
//                 <Input
//                   value={
//                     formData.org_slug
//                   }
//                   onChange={(event) =>
//                     updateField(
//                       "org_slug",
//                       event.target.value,
//                     )
//                   }
//                   placeholder="Organization slug"
//                 />
//               </FormField>

//               <FormField
//                 label="Email"
//                 required
//               >
//                 <Input
//                   type="email"
//                   value={
//                     formData.org_email
//                   }
//                   onChange={(event) =>
//                     updateField(
//                       "org_email",
//                       event.target.value,
//                     )
//                   }
//                   placeholder="Email"
//                 />
//               </FormField>

//               <FormField
//                 label="Phone"
//                 required
//               >
//                 <Input
//                   value={
//                     formData.org_phone
//                   }
//                   onChange={(event) =>
//                     updateField(
//                       "org_phone",
//                       event.target.value,
//                     )
//                   }
//                   placeholder="Phone"
//                 />
//               </FormField>

//               <FormField
//                 label="Status"
//                 required
//               >
//                 <Select
//                   value={
//                     formData.org_status
//                   }
//                   onValueChange={(value) => {
//                     if (
//                       value === "active" ||
//                       value === "inactive"
//                     ) {
//                       updateField(
//                         "org_status",
//                         value as OrganizationStatus,
//                       )
//                     }
//                   }}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select status" />
//                   </SelectTrigger>

//                   <SelectContent>

//                     <SelectItem value="active">
//                       Active
//                     </SelectItem>

//                     <SelectItem value="inactive">
//                       Inactive
//                     </SelectItem>

//                   </SelectContent>
//                 </Select>
//               </FormField>

//               <FormField
//                 label="Timezone"
//               >
//                 <Input
//                   value={
//                     formData.org_timezone
//                   }
//                   onChange={(event) =>
//                     updateField(
//                       "org_timezone",
//                       event.target.value,
//                     )
//                   }
//                   placeholder="Timezone"
//                 />
//               </FormField>

//             </div>

//           </div>

//         </CardContent>

//       </Card>

//       {/* =====================================================
//           LEGAL INFORMATION
//       ===================================================== */}

//       <Card>

//         <CardHeader>

//           <CardTitle className="flex items-center gap-2">
//             <FileText className="size-5" />
//             Legal Information
//           </CardTitle>

//         </CardHeader>

//         <CardContent>

//           <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

//             <FormField
//               label="Legal Name"
//             >
//               <Input
//                 value={
//                   formData.org_legal_name
//                 }
//                 onChange={(event) =>
//                   updateField(
//                     "org_legal_name",
//                     event.target.value,
//                   )
//                 }
//                 placeholder="Legal name"
//               />
//             </FormField>

//             <FormField
//               label="Registration Number"
//             >
//               <Input
//                 value={
//                   formData.org_registration_number
//                 }
//                 onChange={(event) =>
//                   updateField(
//                     "org_registration_number",
//                     event.target.value,
//                   )
//                 }
//                 placeholder="Registration number"
//               />
//             </FormField>

//             <FormField
//               label="GST Number"
//             >
//               <Input
//                 value={
//                   formData.org_gst_number ?? ""
//                 }
//                 onChange={(event) =>
//                   updateField(
//                     "org_gst_number",
//                     event.target.value ||
//                       null,
//                   )
//                 }
//                 placeholder="GST number"
//               />
//             </FormField>

//           </div>

//         </CardContent>

//       </Card>

//       {/* =====================================================
//           CONTACT
//       ===================================================== */}

//       <Card>

//         <CardHeader>

//           <CardTitle className="flex items-center gap-2">
//             <Phone className="size-5" />
//             Contact Information
//           </CardTitle>

//         </CardHeader>

//         <CardContent>

//           <div className="grid gap-5 sm:grid-cols-2">

//             <FormField
//               label="Email"
//               required
//             >
//               <Input
//                 type="email"
//                 value={
//                   formData.org_email
//                 }
//                 onChange={(event) =>
//                   updateField(
//                     "org_email",
//                     event.target.value,
//                   )
//                 }
//               />
//             </FormField>

//             <FormField
//               label="Phone"
//               required
//             >
//               <Input
//                 value={
//                   formData.org_phone
//                 }
//                 onChange={(event) =>
//                   updateField(
//                     "org_phone",
//                     event.target.value,
//                   )
//                 }
//               />
//             </FormField>

//           </div>

//         </CardContent>

//       </Card>

//       {/* =====================================================
//           ADDRESS
//       ===================================================== */}

//       <Card>

//         <CardHeader>

//           <CardTitle className="flex items-center gap-2">
//             <MapPin className="size-5" />
//             Address Information
//           </CardTitle>

//         </CardHeader>

//         <CardContent>

//           <div className="grid gap-5 sm:grid-cols-2">

//             <FormField
//               label="Address Line 1"
//             >
//               <Input
//                 value={
//                   formData.org_address_line1
//                 }
//                 onChange={(event) =>
//                   updateField(
//                     "org_address_line1",
//                     event.target.value,
//                   )
//                 }
//                 placeholder="Address line 1"
//               />
//             </FormField>

//             <FormField
//               label="Address Line 2"
//             >
//               <Input
//                 value={
//                   formData.org_address_line2
//                 }
//                 onChange={(event) =>
//                   updateField(
//                     "org_address_line2",
//                     event.target.value,
//                   )
//                 }
//                 placeholder="Address line 2"
//               />
//             </FormField>

//             <FormField
//               label="City"
//               required
//             >
//               <Input
//                 value={
//                   formData.org_city
//                 }
//                 onChange={(event) =>
//                   updateField(
//                     "org_city",
//                     event.target.value,
//                   )
//                 }
//                 placeholder="City"
//               />
//             </FormField>

//             <FormField
//               label="State"
//             >
//               <Input
//                 value={
//                   formData.org_state
//                 }
//                 onChange={(event) =>
//                   updateField(
//                     "org_state",
//                     event.target.value,
//                   )
//                 }
//                 placeholder="State"
//               />
//             </FormField>

//             <FormField
//               label="Country"
//             >
//               <Input
//                 value={
//                   formData.org_country
//                 }
//                 onChange={(event) =>
//                   updateField(
//                     "org_country",
//                     event.target.value,
//                   )
//                 }
//                 placeholder="Country"
//               />
//             </FormField>

//             <FormField
//               label="Pincode"
//             >
//               <Input
//                 value={
//                   formData.org_pincode
//                 }
//                 onChange={(event) =>
//                   updateField(
//                     "org_pincode",
//                     event.target.value,
//                   )
//                 }
//                 placeholder="Pincode"
//               />
//             </FormField>

//           </div>

//         </CardContent>

//       </Card>

//       {/* =====================================================
//           SYSTEM INFORMATION
//       ===================================================== */}

//       <Card>

//         <CardHeader>

//           <CardTitle className="flex items-center gap-2">
//             <ShieldCheck className="size-5" />
//             System Information
//           </CardTitle>

//         </CardHeader>

//         <CardContent>

//           <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

//             <InfoItem
//               icon={<FileText />}
//               label="Organization ID"
//               value={String(formData.id)}
//             />

//             <InfoItem
//               icon={<Globe />}
//               label="Slug"
//               value={formData.org_slug}
//             />

//             <InfoItem
//               icon={<Calendar />}
//               label="Created At"
//               value={formatDate(
//                 formData.created_at,
//               )}
//             />

//             <InfoItem
//               icon={<Calendar />}
//               label="Updated At"
//               value={formatDate(
//                 formData.updated_at,
//               )}
//             />

//             <InfoItem
//               icon={<Clock />}
//               label="Timezone"
//               value={
//                 formData.org_timezone
//               }
//             />

//             <InfoItem
//               icon={<ShieldCheck />}
//               label="Current Status"
//               value={
//                 formData.org_status
//               }
//             />

//           </div>

//         </CardContent>

//       </Card>

//       {/* =====================================================
//           ACTIONS
//       ===================================================== */}

//       <Card>

//         <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:justify-end">

//           <Button
//             variant="outline"
//             onClick={handleCancel}
//             disabled={submitting}
//           >
//             <X className="mr-2 size-4" />
//             Cancel
//           </Button>

//           <Button
//             onClick={handleSave}
//             disabled={submitting}
//           >

//             {submitting ? (
//               <>
//                 Saving...
//               </>
//             ) : (
//               <>
//                 <Save className="mr-2 size-4" />
//                 Save Changes
//               </>
//             )}

//           </Button>

//         </CardContent>
//       </Card>

//     </div>
//   )
// }

// /* =========================================================
//    FORM FIELD
// ========================================================= */

// function FormField({
//   label,
//   required = false,
//   children,
// }: {
//   label: string
//   required?: boolean
//   children: React.ReactNode
// }) {
//   return (
//     <div className="space-y-2">

//       <label className="text-sm font-medium">

//         {label}

//         {required && (
//           <span className="ml-1 text-destructive">
//             *
//           </span>
//         )}

//       </label>

//       {children}

//     </div>
//   )
// }

// /* =========================================================
//    INFO ITEM
// ========================================================= */

// function InfoItem({
//   icon,
//   label,
//   value,
// }: {
//   icon: React.ReactNode
//   label: string
//   value?: string | null
// }) {
//   return (
//     <div className="flex gap-3">

//       <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-4">
//         {icon}
//       </div>

//       <div className="min-w-0">

//         <p className="text-xs text-muted-foreground">
//           {label}
//         </p>

//         <p className="mt-1 break-words text-sm font-medium">
//           {value || "Not Available"}
//         </p>

//       </div>

//     </div>
//   )
// }

// /* =========================================================
//    DATE
// ========================================================= */

// function formatDate(
//   value?: string | null,
// ) {
//   if (!value) {
//     return "Not Available"
//   }

//   const date = new Date(value)

//   if (Number.isNaN(date.getTime())) {
//     return "Not Available"
//   }

//   return date.toLocaleString(
//     "en-IN",
//     {
//       dateStyle: "medium",
//       timeStyle: "short",
//     },
//   )
// }

export default function EditOrganizations() {

  return(
    <>
    edit
    </>
  )
}
