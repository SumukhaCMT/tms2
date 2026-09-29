// "use client"

// import {
//   useMemo,
//   useState,
// } from "react"

// import {
//   useForm,
// } from "@tanstack/react-form"

// import {
//   useSelector,
// } from "react-redux"

// import {
//   Check,
//   ChevronsUpDown,
//   ChevronLeft,
//   ChevronRight,
//   Search,
//   X,
// } from "lucide-react"

// import {
//   Button,
// } from "@/components/ui/button"

// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"

// import {
//   Field,
//   FieldDescription,
//   FieldError,
//   FieldGroup,
//   FieldLabel,
// } from "@/components/ui/field"

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
//   Checkbox,
// } from "@/components/ui/checkbox"

// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover"

// import type {
//   RootState,
// } from "@/app/store"

// import type {
//   CreateOrganizationPayload,
// } from "../organizationsTypes"

// import {
//   registrationFormSchema,
//   validateRegistrationStep,
//   type RegistrationFormSchema,
// } from "../organizationsValidation"

// /* =========================================================
//    TYPES
// ========================================================= */

// type WizardStep = 1 | 2 | 3

// interface FieldErrors {
//   [key: string]: string
// }

// interface OrganizationFormProps {
//   onSubmit: (
//     data: CreateOrganizationPayload,
//   ) => Promise<void> | void

//   loading?: boolean

//   onCancel: () => void
// }

// /* =========================================================
//    COMPONENT
// ========================================================= */

// export default function OrganizationForm({
//   onSubmit,
//   loading = false,
//   onCancel,
// }: OrganizationFormProps) {
//   /* =======================================================
//      WIZARD
//   ======================================================= */

//   const [
//     currentStep,
//     setCurrentStep,
//   ] = useState<WizardStep>(1)

//   /* =======================================================
//      ERRORS
//   ======================================================= */

//   const [
//     fieldErrors,
//     setFieldErrors,
//   ] = useState<FieldErrors>({})

//   /* =======================================================
//      PLAN SEARCH
//   ======================================================= */

//   const [
//     planSearch,
//     setPlanSearch,
//   ] = useState("")

//   const [
//     planDropdownOpen,
//     setPlanDropdownOpen,
//   ] = useState(false)

//   /* =======================================================
//      BUNDLE SEARCH
//   ======================================================= */

//   const [
//     bundleSearch,
//     setBundleSearch,
//   ] = useState("")

//   const [
//     bundleDropdownOpen,
//     setBundleDropdownOpen,
//   ] = useState(false)

//   /* =======================================================
//      REDUX DATA
//   ======================================================= */

//   const plans = useSelector(
//     (state: RootState) =>
//       state.subscriptionPlans.plans,
//   )

//   const bundles = useSelector(
//     (state: RootState) =>
//       state.subscriptionBundles.bundles,
//   )

//   /* =======================================================
//      FORM
//   ======================================================= */

//   const form = useForm({
//     defaultValues: {
//       /* -----------------------------------------------------
//          ORGANIZATION
//       ----------------------------------------------------- */

//       organization_name: "",

//       contact_person_name: "",

//       email: "",

//       phone: "",

//       /* -----------------------------------------------------
//          SELECTION
//       ----------------------------------------------------- */

//       selection_type:
//         "plan" as "plan" | "bundle",

//       plan_ids: [] as number[],

//       bundle_id:
//         null as number | null,

//       bundle_type:
//         null as
//           | "subscription"
//           | "perpetual"
//           | null,

//       /* -----------------------------------------------------
//          PAYMENT
//       ----------------------------------------------------- */

//       payment_method:
//         "manual" as "manual",

//       /* -----------------------------------------------------
//          BILLING
//       ----------------------------------------------------- */

//       billing_name: "",

//       billing_email: "",

//       billing_address: "",
//           billing_address2: "",

//       billing_city: "",

//       billing_state: "",

//       billing_country: "India",

//       billing_pincode: "",

//       /* -----------------------------------------------------
//          PAYMENT DETAILS
//       ----------------------------------------------------- */

//       payment_reference: "",

//       payment_date: "",

//       start_date: "",

//       payment_amount:
//         null as number | null,

//       payment_notes: "",
//     },

//     onSubmit: async ({
//       value,
//     }) => {
//       const formValues =
//         value as RegistrationFormSchema

//       /* ===================================================
//          FINAL VALIDATION
//       =================================================== */

//       const validation =
//         registrationFormSchema.safeParse(
//           formValues,
//         )

//       if (!validation.success) {
//         setValidationErrors(
//           validation.error.issues,
//         )

//         const firstIssue =
//           validation.error.issues[0]

//         if (firstIssue) {
//           const firstPath =
//             String(
//               firstIssue.path[0] ?? "",
//             )

//           /* STEP 1 */

//           if (
//             [
//               "organization_name",
//               "contact_person_name",
//               "email",
//               "phone",
//             ].includes(firstPath)
//           ) {
//             setCurrentStep(1)
//           }

//           /* STEP 2 */

//           else if (
//             [
//               "selection_type",
//               "plan_ids",
//               "bundle_id",
//               "bundle_type",
//             ].includes(firstPath)
//           ) {
//             setCurrentStep(2)
//           }

//           /* STEP 3 */

//           else {
//             setCurrentStep(3)
//           }
//         }

//         return
//       }

//       /* ===================================================
//          SELECTED PLANS
//       =================================================== */

//       const selectedPlans =
//         plans.filter(
//           (plan) =>
//             formValues.plan_ids.includes(
//               Number(plan.id),
//             ),
//         )

//       /* ===================================================
//          SELECTED BUNDLE
//       =================================================== */

//       const selectedBundle =
//         formValues.bundle_id !== null
//           ? bundles.find(
//               (bundle) =>
//                 Number(bundle.id) ===
//                 Number(
//                   formValues.bundle_id,
//                 ),
//             )
//           : undefined

//       /* ===================================================
//          PLAN VALIDATION
//       =================================================== */

//       if (
//         formValues.selection_type ===
//           "plan" &&
//         selectedPlans.length === 0
//       ) {
//         setFieldErrors({
//           plan_ids:
//             "Please select at least one subscription plan.",
//         })

//         setCurrentStep(2)

//         return
//       }

//       /* ===================================================
//          BUNDLE VALIDATION
//       =================================================== */

//       if (
//         formValues.selection_type ===
//           "bundle" &&
//         !selectedBundle
//       ) {
//         setFieldErrors({
//           bundle_id:
//             "Please select one subscription bundle.",
//         })

//         setCurrentStep(2)

//         return
//       }

//       /* ===================================================
//          BUILD ORDER ITEMS
//       =================================================== */

//       const orderItems =
//         formValues.selection_type ===
//         "plan"
//           ? selectedPlans.map(
//               (plan) => ({
//                 plan_id:
//                   Number(plan.id),

//                 item_name:
//                   plan.plan_name,

//                 item_code:
//                   plan.plan_code,

//                 license_type:
//                   plan.plan_type ===
//                   "perpetual"
//                     ? "perpetual" as const
//                     : "subscription" as const,

//                 quantity: 1,

//                 unit_price:
//                   Number(
//                     plan.plan_price ?? 0,
//                   ),

//                 gst_percentage:
//                   Number(
//                     plan.plan_gst_percentage ??
//                       0,
//                   ),

//                 ...(formValues.start_date
//                   ? {
//                       start_date:
//                         formValues.start_date,
//                     }
//                   : {}),
//               }),
//             )
//           : [
//               {
//                 bundle_id:
//                   Number(
//                     selectedBundle!.id,
//                   ),

//                 item_name:
//                   selectedBundle!.bundle_name,

//                 item_code:
//                   selectedBundle!.bundle_code,

//                 license_type:
//                   selectedBundle!.bundle_type ===
//                   "perpetual"
//                     ? "perpetual" as const
//                     : "subscription" as const,

//                 quantity: 1,

//                 unit_price:
//                   Number(
//                     selectedBundle!
//                       .bundle_price ?? 0,
//                   ),

//                 gst_percentage:
//                   Number(
//                     selectedBundle!
//                       .bundle_gst_percentage ??
//                       0,
//                   ),

//                 ...(formValues.start_date
//                   ? {
//                       start_date:
//                         formValues.start_date,
//                     }
//                   : {}),
//               },
//             ]

//       /* ===================================================
//          BUILD PAYLOAD
//       =================================================== */

//       const payload:
//         CreateOrganizationPayload = {
//         /* -------------------------------------------------
//            ORGANIZATION
//         ------------------------------------------------- */

//         org_name:
//           formValues.organization_name.trim(),

//         user_name:
//           formValues.contact_person_name.trim(),

//         org_email:
//           formValues.email.trim(),

//         org_phone:
//           formValues.phone.trim(),

//         org_country:
//           "india",

//         /* -------------------------------------------------
//            ORDER
//         ------------------------------------------------- */

//         order: {
//           item_type:
//             formValues.selection_type,

//           items:
//             orderItems,

//           payment_method:
//             "manual",

//           manual_payment_mode:
//             "upi",

//           /* -----------------------------------------------
//              BILLING
//           ----------------------------------------------- */

//           billing_name:
//             formValues.billing_name.trim(),

//           billing_email:
//             formValues.billing_email.trim(),

//           billing_address:
//             formValues.billing_address.trim(),
//   billing_address2:
//             formValues.billing_address2?.trim()|| '',
//           billing_city:
//             formValues.billing_city.trim(),

//           billing_state:
//             formValues.billing_state.trim(),

//           billing_country:
//             formValues.billing_country.trim(),

//           billing_pincode:
//             formValues.billing_pincode.trim(),

//           /* -----------------------------------------------
//              PAYMENT
//           ----------------------------------------------- */

//           manual_payment_reference:
//             formValues.payment_reference.trim(),

//           manual_payment_date:
//             formValues.payment_date,

//           start_date:
//             formValues.start_date,

//           note:
//             formValues.payment_notes.trim() ||
//             undefined,
//         },
//       }

//       console.log(
//         "Registration Payload:",
//         JSON.stringify(
//           payload,
//           null,
//           2,
//         ),
//       )

//       // try {
//       //   setFieldErrors({})

//       //   await onSubmit(payload)
//       // } catch (error) {
//       //   console.error(
//       //     "Organization registration failed:",
//       //     error,
//       //   )
//       // }

//       try {
//   setFieldErrors({})

//   await onSubmit(payload)
// } catch (error: any) {
//   console.error(
//     "Organization registration failed:",
//     error,
//   )

//   const message =
//     error?.response?.data?.message ||
//     error?.message ||
//     "Organization registration failed."

//   const normalizedMessage =
//     message.toLowerCase()

//   const errors: FieldErrors = {}

//   if (
//     normalizedMessage.includes("email") &&
//     (
//       normalizedMessage.includes("exist") ||
//       normalizedMessage.includes("already")
//     )
//   ) {
//     errors.email =
//       "This email is already registered."
//   }

//   if (
//     normalizedMessage.includes("phone") &&
//     (
//       normalizedMessage.includes("exist") ||
//       normalizedMessage.includes("already")
//     )
//   ) {
//     errors.phone =
//       "This phone number is already registered."
//   }

//   if (
//     Object.keys(errors).length > 0
//   ) {
//     setFieldErrors(errors)

//     // Email/phone are Step 1
//     setCurrentStep(1)

//     return
//   }

//   // General backend error
//   setFieldErrors({
//     submit: message,
//   })
// }
//     },
//   })

//   /* =======================================================
//      CURRENT FORM VALUES
//   ======================================================= */

//   const values =
//     form.state.values as RegistrationFormSchema

//   /*
//    * IMPORTANT:
//    * Always call this function when validation happens.
//    * Do not use an old values closure for validation.
//    */
//   const getCurrentValues =
//     (): RegistrationFormSchema =>
//       form.state.values as RegistrationFormSchema

//   /* =======================================================
//      SELECTED PLANS
//   ======================================================= */

//   const selectedPlans =
//     useMemo(() => {
//       const selectedIds =
//         values.plan_ids ?? []

//       return plans.filter(
//         (plan) =>
//           selectedIds.includes(
//             Number(plan.id),
//           ),
//       )
//     }, [
//       plans,
//       values.plan_ids,
//     ])

//   /* =======================================================
//      SELECTED BUNDLE
//   ======================================================= */

//   const selectedBundle =
//     useMemo(() => {
//       if (
//         values.bundle_id === null
//       ) {
//         return undefined
//       }

//       return bundles.find(
//         (bundle) =>
//           Number(bundle.id) ===
//           Number(
//             values.bundle_id,
//           ),
//       )
//     }, [
//       bundles,
//       values.bundle_id,
//     ])

//   /* =======================================================
//      PRICING ITEMS
//   ======================================================= */

//   const pricingItems =
//     values.selection_type ===
//     "plan"
//       ? selectedPlans
//       : selectedBundle
//         ? [selectedBundle]
//         : []

//   /* =======================================================
//      GET ITEM PRICE
//   ======================================================= */

//   const getItemPrice = (
//     item:
//       | (typeof plans)[number]
//       | (typeof bundles)[number],
//   ) => {
//     if (
//       "plan_name" in item
//     ) {
//       return Number(
//         item.plan_price ?? 0,
//       )
//     }

//     return Number(
//       item.bundle_price ?? 0,
//     )
//   }

//   /* =======================================================
//      GET ITEM GST
//   ======================================================= */

//   const getItemGst = (
//     item:
//       | (typeof plans)[number]
//       | (typeof bundles)[number],
//   ) => {
//     if (
//       "plan_name" in item
//     ) {
//       return Number(
//         item.plan_gst_percentage ??
//           0,
//       )
//     }

//     return Number(
//       item.bundle_gst_percentage ??
//         0,
//     )
//   }

//   /* =======================================================
//      REGISTRATION PRICE
//   ======================================================= */

//   const registrationPrice =
//     useMemo(() => {
//       return pricingItems.reduce(
//         (
//           total,
//           item,
//         ) =>
//           total +
//           getItemPrice(item),
//         0,
//       )
//     }, [
//       pricingItems,
//     ])

//   /* =======================================================
//      GST
//   ======================================================= */

//   const gstAmount =
//     useMemo(() => {
//       return Number(
//         pricingItems
//           .reduce(
//             (
//               total,
//               item,
//             ) =>
//               total +
//               (
//                 getItemPrice(item) *
//                 getItemGst(item)
//               ) /
//                 100,
//             0,
//           )
//           .toFixed(2),
//       )
//     }, [
//       pricingItems,
//     ])

//   /* =======================================================
//      TOTAL
//   ======================================================= */

//   const registrationTotal =
//     useMemo(() => {
//       return Number(
//         (
//           registrationPrice +
//           gstAmount
//         ).toFixed(2),
//       )
//     }, [
//       registrationPrice,
//       gstAmount,
//     ])

//   /* =======================================================
//      ERROR
//   ======================================================= */

//   const getError = (
//     name: string,
//   ) =>
//     fieldErrors[name]

//   /* =======================================================
//      CLEAR ERROR
//   ======================================================= */

//   const clearFieldError = (
//     name: string,
//   ) => {
//     setFieldErrors(
//       (previous) => {
//         if (!previous[name]) {
//           return previous
//         }

//         const next = {
//           ...previous,
//         }

//         delete next[name]

//         return next
//       },
//     )
//   }

//   /* =======================================================
//      SET VALIDATION ERRORS
//   ======================================================= */

//   // const setValidationErrors = (
//   //   issues: Array<{
//   //     path: readonly (
//   //       | string
//   //       | number
//   //     )[]
//   //     message: string
//   //   }>,
//   // ) => {
//   //   const errors:
//   //     FieldErrors = {}

//   //   for (
//   //     const issue of issues
//   //   ) {
//   //     const path =
//   //       issue.path
//   //         .map(String)
//   //         .join(".")

//   //     if (
//   //       !errors[path]
//   //     ) {
//   //       errors[path] =
//   //         issue.message
//   //     }
//   //   }

//   //   setFieldErrors(
//   //     errors,
//   //   )
//   // }


//   const setValidationErrors = (
//   issues: readonly {
//     path: readonly PropertyKey[]
//     message: string
//   }[],
// ) => {
//   const errors: FieldErrors = {}

//   for (const issue of issues) {
//     const path = issue.path
//       .map(String)
//       .join(".")

//     if (!errors[path]) {
//       errors[path] = issue.message
//     }
//   }

//   setFieldErrors(errors)
// }
//   /* =======================================================
//      TOGGLE PLAN
//   ======================================================= */

//   const handleTogglePlan = (
//     planId: number,
//   ) => {
//     const currentIds =
//       form.state.values.plan_ids ??
//       []

//     const exists =
//       currentIds.includes(
//         planId,
//       )

//     const nextIds =
//       exists
//         ? currentIds.filter(
//             (id) =>
//               id !== planId,
//           )
//         : [
//             ...currentIds,
//             planId,
//           ]

//     form.setFieldValue(
//       "plan_ids",
//       nextIds,
//     )

//     clearFieldError(
//       "plan_ids",
//     )
//   }

//   /* =======================================================
//      SELECT ALL PLANS
//   ======================================================= */

//   const handleSelectAllPlans =
//     () => {
//       const allPlanIds =
//         plans.map(
//           (plan) =>
//             Number(plan.id),
//         )

//       form.setFieldValue(
//         "plan_ids",
//         allPlanIds,
//       )

//       clearFieldError(
//         "plan_ids",
//       )
//     }

//   /* =======================================================
//      CLEAR ALL PLANS
//   ======================================================= */

//   const handleClearAllPlans =
//     () => {
//       form.setFieldValue(
//         "plan_ids",
//         [],
//       )

//       clearFieldError(
//         "plan_ids",
//       )
//     }

//   /* =======================================================
//      VALIDATE ALL STEPS
//   ======================================================= */

//   const validateAllSteps =
//     () => {
//       /*
//        * IMPORTANT:
//        * Get the latest values here.
//        * Do not pass the render-time `values`.
//        */
//       const currentValues =
//         getCurrentValues()

//       const steps:
//         WizardStep[] = [
//           1,
//           2,
//           3,
//         ]

//       for (
//         const step of steps
//       ) {
//         const result =
//           validateRegistrationStep(
//             step,
//             currentValues,
//           )

//         if (
//           !result.success
//         ) {
//           setValidationErrors(
//             result.error.issues,
//           )

//           setCurrentStep(
//             step,
//           )

//           return false
//         }
//       }

//       setFieldErrors({})

//       return true
//     }

//   /* =======================================================
//      VALIDATE CURRENT STEP
//   ======================================================= */

//   const validateStep = (
//     step: WizardStep,
//   ) => {
//     /*
//      * Always get fresh values.
//      */
//     const currentValues =
//       getCurrentValues()

//     const result =
//       validateRegistrationStep(
//         step,
//         currentValues,
//       )

//     if (
//       result.success
//     ) {
//       setFieldErrors({})

//       return true
//     }

//     setValidationErrors(
//       result.error.issues,
//     )

//     return false
//   }

//   /* =======================================================
//      NEXT
//   ======================================================= */

//   const handleNext = () => {
//     const valid =
//       validateStep(
//         currentStep,
//       )

//     if (!valid) {
//       return
//     }

//     if (
//       currentStep === 2
//     ) {
//       form.setFieldValue(
//         "payment_amount",
//         registrationTotal,
//       )
//     }

//     if (
//       currentStep < 3
//     ) {
//       setCurrentStep(
//         (currentStep + 1) as WizardStep,
//       )

//       setFieldErrors({})
//     }
//   }

//   /* =======================================================
//      PREVIOUS
//   ======================================================= */

//   const handlePrevious = () => {
//     if (
//       currentStep > 1
//     ) {
//       setCurrentStep(
//         (currentStep - 1) as WizardStep,
//       )

//       setFieldErrors({})
//     }
//   }

//   /* =======================================================
//      SELECTION TYPE
//   ======================================================= */

//   const handleSelectionTypeChange =
//     (
//       type:
//         | "plan"
//         | "bundle",
//     ) => {
//       form.setFieldValue(
//         "selection_type",
//         type,
//       )

//       form.setFieldValue(
//         "plan_ids",
//         [],
//       )

//       form.setFieldValue(
//         "bundle_id",
//         null,
//       )

//       form.setFieldValue(
//         "bundle_type",
//         null,
//       )

//       form.setFieldValue(
//         "payment_amount",
//         null,
//       )

//       setPlanSearch("")
//       setBundleSearch("")

//       setPlanDropdownOpen(
//         false,
//       )

//       setBundleDropdownOpen(
//         false,
//       )

//       setFieldErrors({})
//     }

//   /* =======================================================
//      SELECT BUNDLE
//   ======================================================= */

//   const handleSelectBundle = (
//     bundleId: number,
//   ) => {
//     const bundle =
//       bundles.find(
//         (item) =>
//           Number(item.id) ===
//           bundleId,
//       )

//     if (!bundle) {
//       return
//     }

//     form.setFieldValue(
//       "bundle_id",
//       bundleId,
//     )

//     form.setFieldValue(
//       "bundle_type",
//       bundle.bundle_type ??
//         null,
//     )

//     form.setFieldValue(
//       "payment_amount",
//       null,
//     )

//     clearFieldError(
//       "bundle_id",
//     )

//     clearFieldError(
//       "bundle_type",
//     )

//     setBundleDropdownOpen(
//       false,
//     )

//     setBundleSearch("")
//   }

//   /* =======================================================
//      REMOVE BUNDLE
//   ======================================================= */

//   const handleRemoveBundle =
//     () => {
//       form.setFieldValue(
//         "bundle_id",
//         null,
//       )

//       form.setFieldValue(
//         "bundle_type",
//         null,
//       )

//       form.setFieldValue(
//         "payment_amount",
//         null,
//       )

//       clearFieldError(
//         "bundle_id",
//       )

//       clearFieldError(
//         "bundle_type",
//       )
//     }

//   /* =======================================================
//      ERROR COMPONENT
//   ======================================================= */

//   const ErrorMessage = ({
//     name,
//   }: {
//     name: string
//   }) => {
//     const error =
//       getError(name)

//     if (!error) {
//       return null
//     }

//     return (
//       <FieldError>
//         {error}
//       </FieldError>
//     )
//   }

//   /* =======================================================
//      FILTERED PLANS
//   ======================================================= */

//   const filteredPlans =
//     useMemo(() => {
//       const search =
//         planSearch
//           .toLowerCase()
//           .trim()

//       if (!search) {
//         return plans
//       }

//       return plans.filter(
//         (plan) =>
//           plan.plan_name
//             .toLowerCase()
//             .includes(search) ||
//           plan.plan_code
//             .toLowerCase()
//             .includes(search),
//       )
//     }, [
//       plans,
//       planSearch,
//     ])

//   /* =======================================================
//      FILTERED BUNDLES
//   ======================================================= */

//   const filteredBundles =
//     useMemo(() => {
//       const search =
//         bundleSearch
//           .toLowerCase()
//           .trim()

//       if (!search) {
//         return bundles
//       }

//       return bundles.filter(
//         (bundle) =>
//           bundle.bundle_name
//             .toLowerCase()
//             .includes(search) ||
//           bundle.bundle_code
//             .toLowerCase()
//             .includes(search) ||
//           bundle.bundle_type
//             .toLowerCase()
//             .includes(search),
//       )
//     }, [
//       bundles,
//       bundleSearch,
//     ])

//   /* =======================================================
//      ALL PLAN IDS
//   ======================================================= */

//   const allPlanIds =
//     useMemo(
//       () =>
//         plans.map(
//           (plan) =>
//             Number(plan.id),
//         ),
//       [plans],
//     )

//   const allPlansSelected =
//     allPlanIds.length > 0 &&
//     allPlanIds.every(
//       (id) =>
//         values.plan_ids.includes(
//           id,
//         ),
//     )

//   /* =======================================================
//      RENDER
//   ======================================================= */

//   return (
//     <Card className="w-full">

//       {/* =================================================
//           HEADER
//       ================================================= */}

//       <CardHeader>
//         <CardTitle>
//           Organization Registration
//         </CardTitle>

//         <div className="flex items-center justify-between pt-4">
//           {[
//             {
//               id: 1,
//               label: "Organization",
//             },
//             {
//               id: 2,
//               label: "Subscription",
//             },
//             {
//               id: 3,
//               label: "Payment",
//             },
//           ].map(
//             (
//               step,
//               index,
//             ) => (
//               <div
//                 key={step.id}
//                 className="flex flex-1 items-center"
//               >
//                 <div className="flex flex-col items-center">
//                   <div
//                     className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium ${
//                       currentStep >=
//                       step.id
//                         ? "bg-primary text-primary-foreground"
//                         : "bg-muted"
//                     }`}
//                   >
//                     {currentStep >
//                     step.id ? (
//                       <Check className="h-4 w-4" />
//                     ) : (
//                       step.id
//                     )}
//                   </div>

//                   <span className="mt-1 text-xs">
//                     {step.label}
//                   </span>
//                 </div>

//                 {index < 2 && (
//                   <div className="mx-2 h-px flex-1 bg-border" />
//                 )}
//               </div>
//             ),
//           )}
//         </div>
//       </CardHeader>

//       {/* =================================================
//           CONTENT
//       ================================================= */}
// {getError("submit") && (
//   <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
//     {getError("submit")}
//   </div>
// )}
//       <CardContent>

//         {/* =================================================
//             STEP 1
//         ================================================= */}

//         {currentStep === 1 && (
//           <FieldGroup>
//             <div className="grid gap-4 md:grid-cols-3">

//               {/* ORGANIZATION NAME */}

//               <form.Field
//                 name="organization_name"
//                 children={(
//                   field,
//                 ) => (
//                   <Field>
//                     <FieldLabel>
//                       Organization Name
//                       <span className="text-destructive">
//                         *
//                       </span>
//                     </FieldLabel>

//                     <Input
//                       value={
//                         field.state.value
//                       }
//                       onChange={(
//                         event,
//                       ) => {
//                         field.handleChange(
//                           event.target.value,
//                         )

//                         clearFieldError(
//                           "organization_name",
//                         )
//                       }}
//                       placeholder="Enter organization name"
//                     />

//                     <ErrorMessage
//                       name="organization_name"
//                     />
//                   </Field>
//                 )}
//               />

//               {/* CONTACT PERSON */}

//               <form.Field
//                 name="contact_person_name"
//                 children={(
//                   field,
//                 ) => (
//                   <Field>
//                     <FieldLabel>
//                       Contact Person Name
//                       <span className="text-destructive">
//                         *
//                       </span>
//                     </FieldLabel>

//                     <Input
//                       value={
//                         field.state.value
//                       }
//                       onChange={(
//                         event,
//                       ) => {
//                         field.handleChange(
//                           event.target.value,
//                         )

//                         clearFieldError(
//                           "contact_person_name",
//                         )
//                       }}
//                       placeholder="Enter contact person name"
//                     />

//                     <ErrorMessage
//                       name="contact_person_name"
//                     />
//                   </Field>
//                 )}
//               />

//               {/* EMAIL */}

//               <form.Field
//                 name="email"
//                 children={(
//                   field,
//                 ) => (
//                   <Field>
//                     <FieldLabel>
//                       Organization Admin Email
//                       <span className="text-destructive">
//                         *
//                       </span>
//                     </FieldLabel>

//                     <Input
//                       type="email"
//                       value={
//                         field.state.value
//                       }
//                       onChange={(
//                         event,
//                       ) => {
//                         field.handleChange(
//                           event.target.value,
//                         )

//                         clearFieldError(
//                           "email",
//                         )
//                       }}
//                       placeholder="organization@example.com"
//                     />

//                     <FieldDescription>
//                       Email address for the organization administrator.
//                     </FieldDescription>

//                     <ErrorMessage
//                       name="email"
//                     />
//                   </Field>
//                 )}
//               />

//               {/* PHONE */}

//               <form.Field
//                 name="phone"
//                 children={(
//                   field,
//                 ) => (
//                   <Field>
//                     <FieldLabel>
//                       Phone
//                       <span className="text-destructive">
//                         *
//                       </span>
//                     </FieldLabel>

//                     <Input
//                       type="tel"
//                       value={
//                         field.state.value
//                       }
//                       onChange={(
//                         event,
//                       ) => {
//                         field.handleChange(
//                           event.target.value,
//                         )

//                         clearFieldError(
//                           "phone",
//                         )
//                       }}
//                       placeholder="9876543210"
//                     />

//                     <ErrorMessage
//                       name="phone"
//                     />
//                   </Field>
//                 )}
//               />

//               {/* ADMIN INFO */}

//               <div className="rounded-lg border bg-muted/30 p-4 md:col-span-2">
//                 <p className="font-medium">
//                   Admin Account
//                 </p>

//                 <p className="mt-1 text-sm text-muted-foreground">
//                   The contact person and organization admin email will be used to create the organization administrator account.
//                 </p>
//               </div>

//             </div>
//           </FieldGroup>
//         )}

//         {/* =================================================
//             STEP 2
//         ================================================= */}

//         {currentStep === 2 && (
//           <FieldGroup>
//             <div className="grid gap-4 md:grid-cols-3">

//               {/* SELECTION TYPE */}

//               <form.Field
//                 name="selection_type"
//                 children={(
//                   field,
//                 ) => (
//                   <Field>
//                     <FieldLabel>
//                       Selection Type
//                       <span className="text-destructive">
//                         *
//                       </span>
//                     </FieldLabel>

//                     <Select
//                       value={
//                         field.state.value
//                       }
//                       onValueChange={(
//                         value,
//                       ) => {
//                         if (
//                           value === "plan" ||
//                           value === "bundle"
//                         ) {
//                           handleSelectionTypeChange(
//                             value,
//                           )
//                         }
//                       }}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select type" />
//                       </SelectTrigger>

//                       <SelectContent>
//                         <SelectItem value="plan">
//                           Subscription Plans
//                         </SelectItem>

//                         <SelectItem value="bundle">
//                           Subscription Bundle
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>

//                     <ErrorMessage
//                       name="selection_type"
//                     />
//                   </Field>
//                 )}
//               />

//               {/* PLANS */}

//               {values.selection_type ===
//                 "plan" && (
//                 <div className="md:col-span-2">
//                   <form.Field
//                     name="plan_ids"
//                     children={(
//                       field,
//                     ) => {
//                       const selectedPlanIds =
//                         field.state.value ?? []

//                       return (
//                         <Field>

//                           <FieldLabel>
//                             Subscription Plans
//                             <span className="text-destructive">
//                               *
//                             </span>
//                           </FieldLabel>

//                           <FieldDescription>
//                             Select one, multiple, or all plans.
//                           </FieldDescription>

//                           <Popover
//                             open={
//                               planDropdownOpen
//                             }
//                             onOpenChange={
//                               setPlanDropdownOpen
//                             }
//                           >
//                             <PopoverTrigger >
//                               <Button
//                                 type="button"
//                                 variant="outline"
//                                 role="combobox"
//                                 aria-expanded={
//                                   planDropdownOpen
//                                 }
//                                 className="w-full justify-between font-normal"
//                               >
//                                 <span className="truncate">
//                                   {selectedPlanIds.length ===
//                                   0
//                                     ? "Select subscription plans"
//                                     : `${selectedPlanIds.length} plan${
//                                         selectedPlanIds.length !==
//                                         1
//                                           ? "s"
//                                           : ""
//                                       } selected`}
//                                 </span>

//                                 <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                               </Button>
//                             </PopoverTrigger>

//                             <PopoverContent
//   className="w-[var(--radix-popover-trigger-width)] p-0"
//   align="start"
// >
//   <div className="flex flex-col">

//     {/* SEARCH */}
//     <div className="flex items-center border-b px-3">
//       <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />

//       <Input
//         value={planSearch}
//         onChange={(event) => {
//           setPlanSearch(event.target.value)
//         }}
//         placeholder="Search plans..."
//         className="border-0 px-0 focus-visible:ring-0"
//       />
//     </div>

//     {/* SELECT ALL */}
//     <div className="flex items-center justify-between border-b p-2">
//       <Button
//         type="button"
//         variant="ghost"
//         size="sm"
//         disabled={
//           allPlansSelected ||
//           allPlanIds.length === 0
//         }
//         onClick={(event) => {
//           event.preventDefault()
//           event.stopPropagation()

//           handleSelectAllPlans()
//         }}
//       >
//         Select All
//       </Button>

//       <Button
//         type="button"
//         variant="ghost"
//         size="sm"
//         disabled={selectedPlanIds.length === 0}
//         onClick={(event) => {
//           event.preventDefault()
//           event.stopPropagation()

//           handleClearAllPlans()
//         }}
//       >
//         Clear All
//       </Button>
//     </div>

//     {/* PLAN LIST */}
//     <div className="max-h-64 overflow-y-auto p-1">
//       {filteredPlans.length === 0 ? (
//         <p className="px-3 py-6 text-center text-sm text-muted-foreground">
//           No plans found.
//         </p>
//       ) : (
//         filteredPlans.map((plan) => {
//           const planId = Number(plan.id)

//           const checked =
//             selectedPlanIds.includes(planId)

//           const price = Number(
//             plan.plan_price ?? 0,
//           )

//           return (
//             <div
//               key={planId}
//               className="flex w-full items-center gap-3 rounded-md px-3 py-2 hover:bg-muted"
//             >
//               <Checkbox
//                 checked={checked}
//                 onCheckedChange={() =>
//                   handleTogglePlan(planId)
//                 }
//               />

//               <button
//                 type="button"
//                 className="min-w-0 flex-1 text-left"
//                 onClick={() =>
//                   handleTogglePlan(planId)
//                 }
//               >
//                 <p className="truncate text-sm font-medium">
//                   {plan.plan_name}
//                 </p>

//                 <p className="truncate text-xs text-muted-foreground">
//                   {plan.plan_code}
//                   {" · ₹"}
//                   {price.toLocaleString("en-IN")}
//                 </p>
//               </button>

//               {checked && (
//                 <Check className="h-4 w-4 shrink-0" />
//               )}
//             </div>
//           )
//         })
//       )}
//     </div>
//   </div>
// </PopoverContent>
//                           </Popover>

//                           {selectedPlanIds.length >
//                             0 && (
//                             <div className="mt-3 flex flex-wrap gap-2">
//                               {selectedPlans.map(
//                                 (
//                                   plan,
//                                 ) => (
//                                   <div
//                                     key={
//                                       plan.id
//                                     }
//                                     className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"
//                                   >
//                                     <span className="max-w-[200px] truncate">
//                                       {
//                                         plan.plan_name
//                                       }
//                                     </span>

//                                     <button
//                                       type="button"
//                                       onClick={() =>
//                                         handleTogglePlan(
//                                           Number(
//                                             plan.id,
//                                           ),
//                                         )
//                                       }
//                                       className="ml-1 rounded-sm opacity-60 hover:opacity-100"
//                                       aria-label={`Remove ${plan.plan_name}`}
//                                     >
//                                       <X className="h-3 w-3" />
//                                     </button>
//                                   </div>
//                                 ),
//                               )}
//                             </div>
//                           )}

//                           <ErrorMessage
//                             name="plan_ids"
//                           />
//                         </Field>
//                       )
//                     }}
//                   />
//                 </div>
//               )}

//               {/* BUNDLE */}

//               {values.selection_type ===
//                 "bundle" && (
//                 <div className="md:col-span-2">
//                   <form.Field
//                     name="bundle_id"
//                     children={(
//                       field,
//                     ) => (
//                       <Field>

//                         <FieldLabel>
//                           Subscription Bundle
//                           <span className="text-destructive">
//                             *
//                           </span>
//                         </FieldLabel>

//                         <FieldDescription>
//                           Select exactly one bundle.
//                         </FieldDescription>

//                         <Popover
//                           open={
//                             bundleDropdownOpen
//                           }
//                           onOpenChange={
//                             setBundleDropdownOpen
//                           }
//                         >
//                           <PopoverTrigger >
//                             <Button
//                               type="button"
//                               variant="outline"
//                               role="combobox"
//                               aria-expanded={
//                                 bundleDropdownOpen
//                               }
//                               className="w-full justify-between font-normal"
//                             >
//                               <span className="truncate">
//                                 {selectedBundle
//                                   ? selectedBundle.bundle_name
//                                   : "Select subscription bundle"}
//                               </span>

//                               <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                             </Button>
//                           </PopoverTrigger>

//                           <PopoverContent
//                             className="w-[var(--radix-popover-trigger-width)] p-0"
//                             align="start"
//                           >
//                             <div className="flex flex-col">

//                               {/* SEARCH */}

//                               <div className="flex items-center border-b px-3">
//                                 <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />

//                                 <Input
//                                   value={
//                                     bundleSearch
//                                   }
//                                   onChange={(
//                                     event,
//                                   ) =>
//                                     setBundleSearch(
//                                       event.target.value,
//                                     )
//                                   }
//                                   placeholder="Search bundles..."
//                                   className="border-0 px-0 focus-visible:ring-0"
//                                 />
//                               </div>

//                               {/* BUNDLE LIST */}

//                               <div className="max-h-64 overflow-y-auto p-1">
//                                 {filteredBundles.length ===
//                                 0 ? (
//                                   <p className="px-3 py-6 text-center text-sm text-muted-foreground">
//                                     No bundles found.
//                                   </p>
//                                 ) : (
//                                   filteredBundles.map(
//                                     (
//                                       bundle,
//                                     ) => {
//                                       const bundleId =
//                                         Number(
//                                           bundle.id,
//                                         )

//                                       const checked =
//                                         Number(
//                                           field.state.value,
//                                         ) ===
//                                         bundleId

//                                       const price =
//                                         Number(
//                                           bundle.bundle_price ??
//                                             0,
//                                         )

//                                       return (
//                                         <button
//                                           key={
//                                             bundleId
//                                           }
//                                           type="button"
//                                           onClick={() =>
//                                             handleSelectBundle(
//                                               bundleId,
//                                             )
//                                           }
//                                           className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-muted"
//                                         >
//                                           <div className="flex h-4 w-4 items-center justify-center">
//                                             {checked && (
//                                               <Check className="h-4 w-4" />
//                                             )}
//                                           </div>

//                                           <div className="min-w-0 flex-1">
//                                             <p className="truncate text-sm font-medium">
//                                               {
//                                                 bundle.bundle_name
//                                               }
//                                             </p>

//                                             <p className="truncate text-xs text-muted-foreground">
//                                               {
//                                                 bundle.bundle_code
//                                               }

//                                               {" · "}

//                                               {
//                                                 bundle.bundle_type
//                                               }

//                                               {" · ₹"}

//                                               {price.toLocaleString(
//                                                 "en-IN",
//                                               )}
//                                             </p>
//                                           </div>
//                                         </button>
//                                       )
//                                     },
//                                   )
//                                 )}
//                               </div>
//                             </div>
//                           </PopoverContent>
//                         </Popover>

//                         {selectedBundle && (
//                           <div className="mt-2 flex w-fit items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
//                             <span className="max-w-[250px] truncate">
//                               {
//                                 selectedBundle.bundle_name
//                               }
//                             </span>

//                             <button
//                               type="button"
//                               onClick={
//                                 handleRemoveBundle
//                               }
//                               className="ml-1 rounded-sm opacity-60 hover:opacity-100"
//                               aria-label="Remove bundle"
//                             >
//                               <X className="h-3 w-3" />
//                             </button>
//                           </div>
//                         )}

//                         <ErrorMessage
//                           name="bundle_id"
//                         />

//                         <ErrorMessage
//                           name="bundle_type"
//                         />

//                       </Field>
//                     )}
//                   />
//                 </div>
//               )}

//               {/* BUNDLE INFORMATION */}

//               {selectedBundle && (
//                 <div className="space-y-3 rounded-lg border bg-muted/30 p-4 md:col-span-3">

//                   <h3 className="font-semibold">
//                     Selected Bundle
//                   </h3>

//                   <div className="grid gap-4 rounded-md border bg-background p-3 md:grid-cols-4">

//                     <div>
//                       <p className="text-xs text-muted-foreground">
//                         Bundle
//                       </p>

//                       <p className="font-medium">
//                         {
//                           selectedBundle.bundle_name
//                         }
//                       </p>
//                     </div>

//                     <div>
//                       <p className="text-xs text-muted-foreground">
//                         Type
//                       </p>

//                       <p className="font-medium capitalize">
//                         {
//                           selectedBundle.bundle_type
//                         }
//                       </p>
//                     </div>

//                     <div>
//                       <p className="text-xs text-muted-foreground">
//                         Price
//                       </p>

//                       <p className="font-medium">
//                         ₹
//                         {getItemPrice(
//                           selectedBundle,
//                         ).toLocaleString(
//                           "en-IN",
//                           {
//                             minimumFractionDigits: 2,
//                           },
//                         )}
//                       </p>
//                     </div>

//                     <div>
//                       <p className="text-xs text-muted-foreground">
//                         Duration
//                       </p>

//                       <p className="font-medium">
//                         {selectedBundle.bundle_duration_months
//                           ? `${selectedBundle.bundle_duration_months} months`
//                           : "Perpetual"}
//                       </p>
//                     </div>

//                   </div>
//                 </div>
//               )}

//               {/* PRICING */}

//               {pricingItems.length >
//                 0 && (
//                 <div className="rounded-lg border bg-muted/30 p-4 md:col-span-3">

//                   <h3 className="mb-4 font-semibold">
//                     Subscription Summary
//                   </h3>

//                   <div className="space-y-2 text-sm">

//                     {pricingItems.map(
//                       (
//                         item,
//                       ) => {
//                         const isPlan =
//                           "plan_name" in
//                           item

//                         const name =
//                           isPlan
//                             ? item.plan_name
//                             : item.bundle_name

//                         const price =
//                           getItemPrice(
//                             item,
//                           )

//                         return (
//                           <div
//                             key={
//                               item.id
//                             }
//                             className="flex justify-between"
//                           >
//                             <span className="text-muted-foreground">
//                               {name}
//                             </span>

//                             <span>
//                               ₹
//                               {price.toLocaleString(
//                                 "en-IN",
//                                 {
//                                   minimumFractionDigits: 2,
//                                 },
//                               )}
//                             </span>
//                           </div>
//                         )
//                       },
//                     )}

//                     <div className="flex justify-between border-t pt-2">
//                       <span className="text-muted-foreground">
//                         Subtotal
//                       </span>

//                       <span>
//                         ₹
//                         {registrationPrice.toLocaleString(
//                           "en-IN",
//                           {
//                             minimumFractionDigits: 2,
//                           },
//                         )}
//                       </span>
//                     </div>

//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">
//                         GST
//                       </span>

//                       <span>
//                         ₹
//                         {gstAmount.toLocaleString(
//                           "en-IN",
//                           {
//                             minimumFractionDigits: 2,
//                           },
//                         )}
//                       </span>
//                     </div>

//                     <div className="flex justify-between border-t pt-2 text-base font-semibold">
//                       <span>
//                         Registration Total
//                       </span>

//                       <span>
//                         ₹
//                         {registrationTotal.toLocaleString(
//                           "en-IN",
//                           {
//                             minimumFractionDigits: 2,
//                           },
//                         )}
//                       </span>
//                     </div>

//                   </div>
//                 </div>
//               )}

//             </div>
//           </FieldGroup>
//         )}

//         {/* =================================================
//             STEP 3
//         ================================================= */}

//         {currentStep === 3 && (
//           <FieldGroup>
//             <div className="grid gap-4 md:grid-cols-3">

//               {/* PAYMENT METHOD */}

//               <form.Field
//                 name="payment_method"
//                 children={(
//                   field,
//                 ) => (
//                   <Field>
//                     <FieldLabel>
//                       Payment Method
//                       <span className="text-destructive">
//                         *
//                       </span>
//                     </FieldLabel>

//                     <Select
//                       value={
//                         field.state.value
//                       }
//                       onValueChange={(
//                         value,
//                       ) => {
//                         if (
//                           value ===
//                           "manual"
//                         ) {
//                           field.handleChange(
//                             "manual",
//                           )

//                           clearFieldError(
//                             "payment_method",
//                           )
//                         }
//                       }}
//                     >
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>

//                       <SelectContent>
//                         <SelectItem value="manual">
//                           Manual Payment
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>

//                     <ErrorMessage
//                       name="payment_method"
//                     />
//                   </Field>
//                 )}
//               />

//               {/* BILLING NAME */}

//               <form.Field
//                 name="billing_name"
//                 children={(
//                   field,
//                 ) => (
//                   <Field>
//                     <FieldLabel>
//                       Billing Name
//                       <span className="text-destructive">
//                         *
//                       </span>
//                     </FieldLabel>

//                     <Input
//                       value={
//                         field.state.value
//                       }
//                       onChange={(
//                         event,
//                       ) => {
//                         field.handleChange(
//                           event.target.value,
//                         )

//                         clearFieldError(
//                           "billing_name",
//                         )
//                       }}
//                       placeholder="Enter billing name"
//                     />

//                     <ErrorMessage
//                       name="billing_name"
//                     />
//                   </Field>
//                 )}
//               />

//               {/* BILLING EMAIL */}

//               <form.Field
//                 name="billing_email"
//                 children={(
//                   field,
//                 ) => (
//                   <Field>
//                     <FieldLabel>
//                       Billing Email
//                       <span className="text-destructive">
//                         *
//                       </span>
//                     </FieldLabel>

//                     <Input
//                       type="email"
//                       value={
//                         field.state.value
//                       }
//                       onChange={(
//                         event,
//                       ) => {
//                         field.handleChange(
//                           event.target.value,
//                         )

//                         clearFieldError(
//                           "billing_email",
//                         )
//                       }}
//                       placeholder="billing@example.com"
//                     />

//                     <ErrorMessage
//                       name="billing_email"
//                     />
//                   </Field>
//                 )}
//               />

//               {/* BILLING ADDRESS */}

//               <form.Field
//                 name="billing_address"
//                 children={(
//                   field,
//                 ) => (
//                   <Field className="md:col-span-2">
//                     <FieldLabel>
//                       Billing Address 1
//                       <span className="text-destructive">
//                         *
//                       </span>
//                     </FieldLabel>

//                     <Input
//                       value={
//                         field.state.value
//                       }
//                       onChange={(
//                         event,
//                       ) => {
//                         field.handleChange(
//                           event.target.value,
//                         )

//                         clearFieldError(
//                           "billing_address",
//                         )
//                       }}
//                       placeholder="Enter complete billing address"
//                     />

//                     <ErrorMessage
//                       name="billing_address"
//                     />
//                   </Field>
//                 )}
//               />
//               <form.Field
//                 name="billing_address2"
//                 children={(
//                   field,
//                 ) => (
//                   <Field className="md:col-span-2">
//                     <FieldLabel>
//                       Billing Address 2
                      
//                     </FieldLabel>

//                     <Input
//                       value={
//                         field.state.value
//                       }
//                       onChange={(
//                         event,
//                       ) => {
//                         field.handleChange(
//                           event.target.value,
//                         )

//                         clearFieldError(
//                           "billing_address2",
//                         )
//                       }}
//                       placeholder="Enter complete billing address"
//                     />

//                     <ErrorMessage
//                       name="billing_address2"
//                     />
//                   </Field>
//                 )}
//               />
//               {/* BILLING CITY */}

//               <form.Field
//                 name="billing_city"
//                 children={(
//                   field,
//                 ) => (
//                   <Field>
//                     <FieldLabel>
//                       City
//                       <span className="text-destructive">
//                         *
//                       </span>
//                     </FieldLabel>

//                     <Input
//                       value={
//                         field.state.value
//                       }
//                       onChange={(
//                         event,
//                       ) => {
//                         field.handleChange(
//                           event.target.value,
//                         )

//                         clearFieldError(
//                           "billing_city",
//                         )
//                       }}
//                       placeholder="Enter city"
//                     />

//                     <ErrorMessage
//                       name="billing_city"
//                     />
//                   </Field>
//                 )}
//               />

//               {/* BILLING STATE */}

//               <form.Field
//                 name="billing_state"
//                 children={(
//                   field,
//                 ) => (
//                   <Field>
//                     <FieldLabel>
//                       State
//                       <span className="text-destructive">
//                         *
//                       </span>
//                     </FieldLabel>

//                     <Input
//                       value={
//                         field.state.value
//                       }
//                       onChange={(
//                         event,
//                       ) => {
//                         field.handleChange(
//                           event.target.value,
//                         )

//                         clearFieldError(
//                           "billing_state",
//                         )
//                       }}
//                       placeholder="Enter state"
//                     />

//                     <ErrorMessage
//                       name="billing_state"
//                     />
//                   </Field>
//                 )}
//               />

//               {/* COUNTRY */}

//               <form.Field
//                 name="billing_country"
//                 children={(
//                   field,
//                 ) => (
//                   <Field>
//                     <FieldLabel>
//                       Country
//                       <span className="text-destructive">
//                         *
//                       </span>
//                     </FieldLabel>

//                     <Input
//                       value={
//                         field.state.value
//                       }
//                       onChange={(
//                         event,
//                       ) => {
//                         field.handleChange(
//                           event.target.value,
//                         )

//                         clearFieldError(
//                           "billing_country",
//                         )
//                       }}
//                       placeholder="Enter country"
//                     />

//                     <ErrorMessage
//                       name="billing_country"
//                     />
//                   </Field>
//                 )}
//               />

//               {/* PINCODE */}

//               <form.Field
//                 name="billing_pincode"
//                 children={(
//                   field,
//                 ) => (
//                   <Field>
//                     <FieldLabel>
//                       Pincode
//                       <span className="text-destructive">
//                         *
//                       </span>
//                     </FieldLabel>

//                     <Input
//                       type="text"
//                       inputMode="numeric"
//                       maxLength={6}
//                       value={
//                         field.state.value
//                       }
//                       onChange={(
//                         event,
//                       ) => {
//                         const value =
//                           event.target.value.replace(
//                             /\D/g,
//                             "",
//                           )

//                         field.handleChange(
//                           value,
//                         )

//                         clearFieldError(
//                           "billing_pincode",
//                         )
//                       }}
//                       placeholder="Enter 6-digit pincode"
//                     />

//                     <ErrorMessage
//                       name="billing_pincode"
//                     />
//                   </Field>
//                 )}
//               />

//               {/* PAYMENT REFERENCE */}

//               <form.Field
//                 name="payment_reference"
//                 children={(
//                   field,
//                 ) => (
//                   <Field>
//                     <FieldLabel>
//                       Payment Reference
//                       <span className="text-destructive">
//                         *
//                       </span>
//                     </FieldLabel>

//                     <Input
//                       value={
//                         field.state.value
//                       }
//                       onChange={(
//                         event,
//                       ) => {
//                         field.handleChange(
//                           event.target.value,
//                         )

//                         clearFieldError(
//                           "payment_reference",
//                         )
//                       }}
//                       placeholder="Transaction / receipt number"
//                     />

//                     <ErrorMessage
//                       name="payment_reference"
//                     />
//                   </Field>
//                 )}
//               />

//               {/* PAYMENT DATE */}

//               <form.Field
//                 name="payment_date"
//                 children={(
//                   field,
//                 ) => (
//                   <Field>
//                     <FieldLabel>
//                       Payment Date
//                       <span className="text-destructive">
//                         *
//                       </span>
//                     </FieldLabel>

//                     <Input
//                       type="date"
//                       value={
//                         field.state.value
//                       }
//                       onChange={(
//                         event,
//                       ) => {
//                         field.handleChange(
//                           event.target.value,
//                         )

//                         clearFieldError(
//                           "payment_date",
//                         )
//                       }}
//                     />

//                     <ErrorMessage
//                       name="payment_date"
//                     />
//                   </Field>
//                 )}
//               />

//               {/* START DATE */}

//               <form.Field
//                 name="start_date"
//                 children={(
//                   field,
//                 ) => (
//                   <Field>
//                     <FieldLabel>
//                       Start Date
//                       <span className="text-destructive">
//                         *
//                       </span>
//                     </FieldLabel>

//                     <Input
//                       type="date"
//                       value={
//                         field.state.value
//                       }
//                       onChange={(
//                         event,
//                       ) => {
//                         field.handleChange(
//                           event.target.value,
//                         )

//                         clearFieldError(
//                           "start_date",
//                         )
//                       }}
//                     />

//                     <FieldDescription>
//                       Subscription/license start date.
//                     </FieldDescription>

//                     <ErrorMessage
//                       name="start_date"
//                     />
//                   </Field>
//                 )}
//               />

//               {/* PAYMENT AMOUNT */}

//               <div className="rounded-lg border bg-muted/30 p-4 md:col-span-3">

//                 <div className="flex items-center justify-between">

//                   <span className="text-sm text-muted-foreground">
//                     Payment Amount
//                   </span>

//                   <span className="text-lg font-semibold">
//                     ₹
//                     {registrationTotal.toLocaleString(
//                       "en-IN",
//                       {
//                         minimumFractionDigits: 2,
//                       },
//                     )}
//                   </span>

//                 </div>

//                 <p className="mt-1 text-xs text-muted-foreground">
//                   Payment amount is automatically calculated from the selected plans or bundle.
//                 </p>

//                 <ErrorMessage
//                   name="payment_amount"
//                 />

//               </div>

//               {/* PAYMENT NOTES */}

//               <form.Field
//                 name="payment_notes"
//                 children={(
//                   field,
//                 ) => (
//                   <Field className="md:col-span-3">
//                     <FieldLabel>
//                       Payment Notes
//                     </FieldLabel>

//                     <Input
//                       value={
//                         field.state.value
//                       }
//                       onChange={(
//                         event,
//                       ) => {
//                         field.handleChange(
//                           event.target.value,
//                         )

//                         clearFieldError(
//                           "payment_notes",
//                         )
//                       }}
//                       placeholder="Optional payment notes"
//                     />

//                     <ErrorMessage
//                       name="payment_notes"
//                     />
//                   </Field>
//                 )}
//               />

//             </div>
//           </FieldGroup>
//         )}

//       </CardContent>

//       {/* ===================================================
//           FOOTER
//       =================================================== */}

//       <CardFooter className="flex justify-between">

//         <Button
//           type="button"
//           variant="outline"
//           onClick={
//             currentStep === 1
//               ? onCancel
//               : handlePrevious
//           }
//           disabled={
//             loading
//           }
//         >
//           <ChevronLeft className="mr-2 h-4 w-4" />

//           {currentStep === 1
//             ? "Cancel"
//             : "Previous"}
//         </Button>

//         {currentStep < 3 ? (
//           <Button
//             type="button"
//             onClick={
//               handleNext
//             }
//             disabled={
//               loading
//             }
//           >
//             Next

//             <ChevronRight className="ml-2 h-4 w-4" />
//           </Button>
//         ) : (
//           <Button
//             type="button"
//             disabled={
//               loading
//             }
//             onClick={() => {
//               /*
//                * IMPORTANT:
//                * validateAllSteps() now gets the
//                * latest TanStack Form values itself.
//                */
//               const valid =
//                 validateAllSteps()

//               if (!valid) {
//                 return
//               }

//               form.handleSubmit()
//             }}
//           >
//             {loading
//               ? "Submitting..."
//               : "Complete Registration"}

//             {!loading && (
//               <Check className="ml-2 h-4 w-4" />
//             )}
//           </Button>
//         )}

//       </CardFooter>
//     </Card>
//   )
// }


"use client"

import {
  useCallback,
  useMemo,
  useState,
} from "react"

import {
  useForm,
} from "@tanstack/react-form"

import {
  useSelector,
} from "react-redux"

import {
  Check,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react"

import {
  Button,
} from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

import {
  Input,
} from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Checkbox,
} from "@/components/ui/checkbox"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import type {
  RootState,
} from "@/app/store"

import type {
  CreateOrganizationPayload,
} from "../organizationsTypes"

import {
  registrationFormSchema,
  validateRegistrationStep,
  type RegistrationFormSchema,
} from "../organizationsValidation"

/* =========================================================
   TYPES
========================================================= */

type WizardStep = 1 | 2 | 3

interface FieldErrors {
  [key: string]: string
}

interface OrganizationFormProps {
  onSubmit: (
    data: CreateOrganizationPayload,
  ) => Promise<void> | void

  loading?: boolean

  onCancel: () => void
}

interface ErrorMessageProps {
  error?: string
}

/* =========================================================
   ERROR MESSAGE
========================================================= */

function ErrorMessage({
  error,
}: ErrorMessageProps) {
  if (!error) {
    return null
  }

  return (
    <FieldError>
      {error}
    </FieldError>
  )
}

/* =========================================================
   COMPONENT
========================================================= */

export default function OrganizationForm({
  onSubmit,
  loading = false,
  onCancel,
}: OrganizationFormProps) {
  /* =======================================================
     WIZARD
  ======================================================= */

  const [
    currentStep,
    setCurrentStep,
  ] = useState<WizardStep>(1)

  /* =======================================================
     ERRORS
  ======================================================= */

  const [
    fieldErrors,
    setFieldErrors,
  ] = useState<FieldErrors>({})

  /* =======================================================
     PLAN SEARCH
  ======================================================= */

  const [
    planSearch,
    setPlanSearch,
  ] = useState("")

  const [
    planDropdownOpen,
    setPlanDropdownOpen,
  ] = useState(false)

  /* =======================================================
     BUNDLE SEARCH
  ======================================================= */

  const [
    bundleSearch,
    setBundleSearch,
  ] = useState("")

  const [
    bundleDropdownOpen,
    setBundleDropdownOpen,
  ] = useState(false)

  /* =======================================================
     REDUX DATA
  ======================================================= */

  const plans = useSelector(
    (state: RootState) =>
      state.subscriptionPlans.plans,
  )

  const bundles = useSelector(
    (state: RootState) =>
      state.subscriptionBundles.bundles,
  )

  /* =======================================================
     FORM
  ======================================================= */

  const form = useForm({
    defaultValues: {
      /* -----------------------------------------------------
         ORGANIZATION
      ----------------------------------------------------- */

      organization_name: "",

      contact_person_name: "",

      email: "",

      phone: "",

      /* -----------------------------------------------------
         SELECTION
      ----------------------------------------------------- */

      selection_type:
        "plan" as "plan" | "bundle",

      plan_ids: [] as number[],

      bundle_id:
        null as number | null,

      bundle_type:
        null as
          | "subscription"
          | "perpetual"
          | null,

      /* -----------------------------------------------------
         PAYMENT
      ----------------------------------------------------- */

      payment_method: "manual",

      /* -----------------------------------------------------
         BILLING
      ----------------------------------------------------- */

      billing_name: "",

      billing_email: "",

      billing_address: "",

      billing_address2: "",

      billing_city: "",

      billing_state: "",

      billing_country: "India",

      billing_pincode: "",

      /* -----------------------------------------------------
         PAYMENT DETAILS
      ----------------------------------------------------- */

      payment_reference: "",

      payment_date: "",

      start_date: "",

      payment_amount:
        null as number | null,

      payment_notes: "",
    },

    onSubmit: async ({
      value,
    }) => {
      const formValues =
        value as RegistrationFormSchema

      /* ===================================================
         FINAL VALIDATION
      =================================================== */

      const validation =
        registrationFormSchema.safeParse(
          formValues,
        )

      if (!validation.success) {
        setValidationErrors(
          validation.error.issues,
        )

        const firstIssue =
          validation.error.issues[0]

        if (firstIssue) {
          const firstPath =
            String(
              firstIssue.path[0] ?? "",
            )

          /* STEP 1 */

          if (
            [
              "organization_name",
              "contact_person_name",
              "email",
              "phone",
            ].includes(firstPath)
          ) {
            setCurrentStep(1)
          }

          /* STEP 2 */

          else if (
            [
              "selection_type",
              "plan_ids",
              "bundle_id",
              "bundle_type",
            ].includes(firstPath)
          ) {
            setCurrentStep(2)
          }

          /* STEP 3 */

          else {
            setCurrentStep(3)
          }
        }

        return
      }

      /* ===================================================
         SELECTED PLANS
      =================================================== */

      const selectedPlans =
        plans.filter(
          (plan) =>
            formValues.plan_ids.includes(
              Number(plan.id),
            ),
        )

      /* ===================================================
         SELECTED BUNDLE
      =================================================== */

      const selectedBundle =
        formValues.bundle_id !== null
          ? bundles.find(
              (bundle) =>
                Number(bundle.id) ===
                Number(
                  formValues.bundle_id,
                ),
            )
          : undefined

      /* ===================================================
         PLAN VALIDATION
      =================================================== */

      if (
        formValues.selection_type ===
          "plan" &&
        selectedPlans.length === 0
      ) {
        setFieldErrors({
          plan_ids:
            "Please select at least one subscription plan.",
        })

        setCurrentStep(2)

        return
      }

      /* ===================================================
         BUNDLE VALIDATION
      =================================================== */

      if (
        formValues.selection_type ===
          "bundle" &&
        !selectedBundle
      ) {
        setFieldErrors({
          bundle_id:
            "Please select one subscription bundle.",
        })

        setCurrentStep(2)

        return
      }

      /* ===================================================
         BUILD ORDER ITEMS
      =================================================== */

      const orderItems =
        formValues.selection_type ===
        "plan"
          ? selectedPlans.map(
              (plan) => ({
                plan_id:
                  Number(plan.id),

                item_name:
                  plan.plan_name,

                item_code:
                  plan.plan_code,

                license_type:
                  plan.plan_type ===
                  "perpetual"
                    ? "perpetual" as const
                    : "subscription" as const,

                quantity: 1,

                unit_price:
                  Number(
                    plan.plan_price ?? 0,
                  ),

                gst_percentage:
                  Number(
                    plan.plan_gst_percentage ??
                      0,
                  ),

                ...(formValues.start_date
                  ? {
                      start_date:
                        formValues.start_date,
                    }
                  : {}),
              }),
            )
          : [
              {
                bundle_id:
                  Number(
                    selectedBundle!.id,
                  ),

                item_name:
                  selectedBundle!.bundle_name,

                item_code:
                  selectedBundle!.bundle_code,

                license_type:
                  selectedBundle!.bundle_type ===
                  "perpetual"
                    ? "perpetual" as const
                    : "subscription" as const,

                quantity: 1,

                unit_price:
                  Number(
                    selectedBundle!
                      .bundle_price ?? 0,
                  ),

                gst_percentage:
                  Number(
                    selectedBundle!
                      .bundle_gst_percentage ??
                      0,
                  ),

                ...(formValues.start_date
                  ? {
                      start_date:
                        formValues.start_date,
                    }
                  : {}),
              },
            ]

      /* ===================================================
         BUILD PAYLOAD
      =================================================== */

      const payload:
        CreateOrganizationPayload = {
        /* -------------------------------------------------
           ORGANIZATION
        ------------------------------------------------- */

        org_name:
          formValues.organization_name.trim(),

        user_name:
          formValues.contact_person_name.trim(),

        org_email:
          formValues.email.trim(),

        org_phone:
          formValues.phone.trim(),

        org_country:
          "india",

        /* -------------------------------------------------
           ORDER
        ------------------------------------------------- */

        order: {
          item_type:
            formValues.selection_type,

          items:
            orderItems,

          payment_method:
            "manual",

          manual_payment_mode:
            "upi",

          /* -----------------------------------------------
             BILLING
          ----------------------------------------------- */

          billing_name:
            formValues.billing_name.trim(),

          billing_email:
            formValues.billing_email.trim(),

          billing_address:
            formValues.billing_address.trim(),

          billing_address2:
            formValues.billing_address2?.trim() ??
            "",

          billing_city:
            formValues.billing_city.trim(),

          billing_state:
            formValues.billing_state.trim(),

          billing_country:
            formValues.billing_country.trim(),

          billing_pincode:
            formValues.billing_pincode.trim(),

          /* -----------------------------------------------
             PAYMENT
          ----------------------------------------------- */

          manual_payment_reference:
            formValues.payment_reference.trim(),

          manual_payment_date:
            formValues.payment_date,

          start_date:
            formValues.start_date,

          note:
            formValues.payment_notes.trim() ||
            undefined,
        },
      }

      console.log(
        "Registration Payload:",
        JSON.stringify(
          payload,
          null,
          2,
        ),
      )

      /* ===================================================
         SUBMIT
      =================================================== */

      try {
        setFieldErrors({})

        await onSubmit(payload)
      } catch (error: unknown) {
        console.error(
          "Organization registration failed:",
          error,
        )

        let message =
          "Organization registration failed."

        if (
          typeof error === "object" &&
          error !== null
        ) {
          const errorObject =
            error as {
              message?: unknown
              response?: {
                data?: {
                  message?: unknown
                }
              }
            }

          const backendMessage =
            errorObject.response?.data?.message

          if (
            typeof backendMessage ===
              "string" &&
            backendMessage.trim()
          ) {
            message =
              backendMessage
          } else if (
            typeof errorObject.message ===
              "string" &&
            errorObject.message.trim()
          ) {
            message =
              errorObject.message
          }
        }

        const normalizedMessage =
          message.toLowerCase()

        const errors:
          FieldErrors = {}

        if (
          normalizedMessage.includes(
            "email",
          ) &&
          (
            normalizedMessage.includes(
              "exist",
            ) ||
            normalizedMessage.includes(
              "already",
            )
          )
        ) {
          errors.email =
            "This email is already registered."
        }

        if (
          normalizedMessage.includes(
            "phone",
          ) &&
          (
            normalizedMessage.includes(
              "exist",
            ) ||
            normalizedMessage.includes(
              "already",
            )
          )
        ) {
          errors.phone =
            "This phone number is already registered."
        }

        if (
          Object.keys(errors).length > 0
        ) {
          setFieldErrors(errors)

          setCurrentStep(1)

          return
        }

        setFieldErrors({
          submit: message,
        })
      }
    },
  })

  /* =======================================================
     CURRENT FORM VALUES
  ======================================================= */

  const values =
    form.state.values as RegistrationFormSchema

  /*
   * Always get latest TanStack Form values.
   */
  const getCurrentValues =
    (): RegistrationFormSchema =>
      form.state.values as RegistrationFormSchema

  /* =======================================================
     SELECTED PLANS
  ======================================================= */

  const selectedPlans =
    useMemo(() => {
      const selectedIds =
        values.plan_ids ?? []

      return plans.filter(
        (plan) =>
          selectedIds.includes(
            Number(plan.id),
          ),
      )
    }, [
      plans,
      values.plan_ids,
    ])

  /* =======================================================
     SELECTED BUNDLE
  ======================================================= */

  const selectedBundle =
    useMemo(() => {
      if (
        values.bundle_id === null
      ) {
        return undefined
      }

      return bundles.find(
        (bundle) =>
          Number(bundle.id) ===
          Number(
            values.bundle_id,
          ),
      )
    }, [
      bundles,
      values.bundle_id,
    ])

  /* =======================================================
     GET ITEM PRICE
  ======================================================= */

  const getItemPrice =
    useCallback(
      (
        item:
          | (typeof plans)[number]
          | (typeof bundles)[number],
      ) => {
        if (
          "plan_name" in item
        ) {
          return Number(
            item.plan_price ?? 0,
          )
        }

        return Number(
          item.bundle_price ?? 0,
        )
      },
      [],
    )

  /* =======================================================
     GET ITEM GST
  ======================================================= */

  const getItemGst =
    useCallback(
      (
        item:
          | (typeof plans)[number]
          | (typeof bundles)[number],
      ) => {
        if (
          "plan_name" in item
        ) {
          return Number(
            item.plan_gst_percentage ??
              0,
          )
        }

        return Number(
          item.bundle_gst_percentage ??
            0,
        )
      },
      [],
    )

  /* =======================================================
     PRICING ITEMS
  ======================================================= */

  const pricingItems =
    useMemo(
      () =>
        values.selection_type ===
        "plan"
          ? selectedPlans
          : selectedBundle
            ? [selectedBundle]
            : [],
      [
        values.selection_type,
        selectedPlans,
        selectedBundle,
      ],
    )

  /* =======================================================
     REGISTRATION PRICE
  ======================================================= */

  const registrationPrice =
    useMemo(() => {
      return pricingItems.reduce(
        (
          total,
          item,
        ) =>
          total +
          getItemPrice(item),
        0,
      )
    }, [
      pricingItems,
      getItemPrice,
    ])

  /* =======================================================
     GST
  ======================================================= */

  const gstAmount =
    useMemo(() => {
      return Number(
        pricingItems
          .reduce(
            (
              total,
              item,
            ) =>
              total +
              (
                getItemPrice(item) *
                getItemGst(item)
              ) /
                100,
            0,
          )
          .toFixed(2),
      )
    }, [
      pricingItems,
      getItemGst,
      getItemPrice,
    ])

  /* =======================================================
     TOTAL
  ======================================================= */

  const registrationTotal =
    useMemo(() => {
      return Number(
        (
          registrationPrice +
          gstAmount
        ).toFixed(2),
      )
    }, [
      registrationPrice,
      gstAmount,
    ])

  /* =======================================================
     ERROR
  ======================================================= */

  const getError = (
    name: string,
  ) =>
    fieldErrors[name]

  /* =======================================================
     CLEAR ERROR
  ======================================================= */

  const clearFieldError = (
    name: string,
  ) => {
    setFieldErrors(
      (previous) => {
        if (!previous[name]) {
          return previous
        }

        const next = {
          ...previous,
        }

        delete next[name]

        return next
      },
    )
  }

  /* =======================================================
     SET VALIDATION ERRORS
  ======================================================= */

  const setValidationErrors = (
    issues: readonly {
      path: readonly PropertyKey[]
      message: string
    }[],
  ) => {
    const errors:
      FieldErrors = {}

    for (
      const issue of issues
    ) {
      const path =
        issue.path
          .map(String)
          .join(".")

      if (!errors[path]) {
        errors[path] =
          issue.message
      }
    }

    setFieldErrors(errors)
  }

  /* =======================================================
     TOGGLE PLAN
  ======================================================= */

  const handleTogglePlan = (
    planId: number,
  ) => {
    const currentIds =
      form.state.values.plan_ids ??
      []

    const exists =
      currentIds.includes(
        planId,
      )

    const nextIds =
      exists
        ? currentIds.filter(
            (id) =>
              id !== planId,
          )
        : [
            ...currentIds,
            planId,
          ]

    form.setFieldValue(
      "plan_ids",
      nextIds,
    )

    clearFieldError(
      "plan_ids",
    )
  }

  /* =======================================================
     SELECT ALL PLANS
  ======================================================= */

  const handleSelectAllPlans =
    () => {
      const allPlanIds =
        plans.map(
          (plan) =>
            Number(plan.id),
        )

      form.setFieldValue(
        "plan_ids",
        allPlanIds,
      )

      clearFieldError(
        "plan_ids",
      )
    }

  /* =======================================================
     CLEAR ALL PLANS
  ======================================================= */

  const handleClearAllPlans =
    () => {
      form.setFieldValue(
        "plan_ids",
        [],
      )

      clearFieldError(
        "plan_ids",
      )
    }

  /* =======================================================
     VALIDATE ALL STEPS
  ======================================================= */

  const validateAllSteps =
    () => {
      const currentValues =
        getCurrentValues()

      const steps:
        WizardStep[] = [
          1,
          2,
          3,
        ]

      for (
        const step of steps
      ) {
        const result =
          validateRegistrationStep(
            step,
            currentValues,
          )

        if (
          !result.success
        ) {
          setValidationErrors(
            result.error.issues,
          )

          setCurrentStep(
            step,
          )

          return false
        }
      }

      setFieldErrors({})

      return true
    }

  /* =======================================================
     VALIDATE CURRENT STEP
  ======================================================= */

  const validateStep = (
    step: WizardStep,
  ) => {
    const currentValues =
      getCurrentValues()

    const result =
      validateRegistrationStep(
        step,
        currentValues,
      )

    if (
      result.success
    ) {
      setFieldErrors({})

      return true
    }

    setValidationErrors(
      result.error.issues,
    )

    return false
  }

  /* =======================================================
     NEXT
  ======================================================= */

  const handleNext = () => {
    const valid =
      validateStep(
        currentStep,
      )

    if (!valid) {
      return
    }

    if (
      currentStep === 2
    ) {
      form.setFieldValue(
        "payment_amount",
        registrationTotal,
      )
    }

    if (
      currentStep < 3
    ) {
      setCurrentStep(
        (currentStep + 1) as WizardStep,
      )

      setFieldErrors({})
    }
  }

  /* =======================================================
     PREVIOUS
  ======================================================= */

  const handlePrevious = () => {
    if (
      currentStep > 1
    ) {
      setCurrentStep(
        (currentStep - 1) as WizardStep,
      )

      setFieldErrors({})
    }
  }

  /* =======================================================
     SELECTION TYPE
  ======================================================= */

  const handleSelectionTypeChange =
    (
      type:
        | "plan"
        | "bundle",
    ) => {
      form.setFieldValue(
        "selection_type",
        type,
      )

      form.setFieldValue(
        "plan_ids",
        [],
      )

      form.setFieldValue(
        "bundle_id",
        null,
      )

      form.setFieldValue(
        "bundle_type",
        null,
      )

      form.setFieldValue(
        "payment_amount",
        null,
      )

      setPlanSearch("")

      setBundleSearch("")

      setPlanDropdownOpen(
        false,
      )

      setBundleDropdownOpen(
        false,
      )

      setFieldErrors({})
    }

  /* =======================================================
     SELECT BUNDLE
  ======================================================= */

  const handleSelectBundle = (
    bundleId: number,
  ) => {
    const bundle =
      bundles.find(
        (item) =>
          Number(item.id) ===
          bundleId,
      )

    if (!bundle) {
      return
    }

    form.setFieldValue(
      "bundle_id",
      bundleId,
    )

    form.setFieldValue(
      "bundle_type",
      bundle.bundle_type ??
        null,
    )

    form.setFieldValue(
      "payment_amount",
      null,
    )

    clearFieldError(
      "bundle_id",
    )

    clearFieldError(
      "bundle_type",
    )

    setBundleDropdownOpen(
      false,
    )

    setBundleSearch("")
  }

  /* =======================================================
     REMOVE BUNDLE
  ======================================================= */

  const handleRemoveBundle =
    () => {
      form.setFieldValue(
        "bundle_id",
        null,
      )

      form.setFieldValue(
        "bundle_type",
        null,
      )

      form.setFieldValue(
        "payment_amount",
        null,
      )

      clearFieldError(
        "bundle_id",
      )

      clearFieldError(
        "bundle_type",
      )
    }

  /* =======================================================
     FILTERED PLANS
  ======================================================= */

  const filteredPlans =
    useMemo(() => {
      const search =
        planSearch
          .toLowerCase()
          .trim()

      if (!search) {
        return plans
      }

      return plans.filter(
        (plan) =>
          plan.plan_name
            .toLowerCase()
            .includes(search) ||
          plan.plan_code
            .toLowerCase()
            .includes(search),
      )
    }, [
      plans,
      planSearch,
    ])

  /* =======================================================
     FILTERED BUNDLES
  ======================================================= */

  const filteredBundles =
    useMemo(() => {
      const search =
        bundleSearch
          .toLowerCase()
          .trim()

      if (!search) {
        return bundles
      }

      return bundles.filter(
        (bundle) =>
          bundle.bundle_name
            .toLowerCase()
            .includes(search) ||
          bundle.bundle_code
            .toLowerCase()
            .includes(search) ||
          bundle.bundle_type
            .toLowerCase()
            .includes(search),
      )
    }, [
      bundles,
      bundleSearch,
    ])

  /* =======================================================
     ALL PLAN IDS
  ======================================================= */

  const allPlanIds =
    useMemo(
      () =>
        plans.map(
          (plan) =>
            Number(plan.id),
        ),
      [plans],
    )

  const allPlansSelected =
    allPlanIds.length > 0 &&
    allPlanIds.every(
      (id) =>
        values.plan_ids.includes(
          id,
        ),
    )

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Card className="w-full">

      {/* =================================================
          HEADER
      ================================================= */}

      <CardHeader>
        <CardTitle>
          Organization Registration
        </CardTitle>

        <div className="flex items-center justify-between pt-4">
          {[
            {
              id: 1,
              label: "Organization",
            },
            {
              id: 2,
              label: "Subscription",
            },
            {
              id: 3,
              label: "Payment",
            },
          ].map(
            (
              step,
              index,
            ) => (
              <div
                key={step.id}
                className="flex flex-1 items-center"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium ${
                      currentStep >=
                      step.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {currentStep >
                    step.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </div>

                  <span className="mt-1 text-xs">
                    {step.label}
                  </span>
                </div>

                {index < 2 && (
                  <div className="mx-2 h-px flex-1 bg-border" />
                )}
              </div>
            ),
          )}
        </div>
      </CardHeader>

      {/* =================================================
          CONTENT
      ================================================= */}

      {getError("submit") && (
        <div className="mx-6 mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {getError("submit")}
        </div>
      )}

      <CardContent>

        {/* =================================================
            STEP 1
        ================================================= */}

        {currentStep === 1 && (
          <FieldGroup>
            <div className="grid gap-4 md:grid-cols-3">

              {/* ORGANIZATION NAME */}

              <form.Field
                name="organization_name"
                children={(
                  field,
                ) => (
                  <Field>
                    <FieldLabel>
                      Organization Name
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Input
                      value={
                        field.state.value
                      }
                      onChange={(
                        event,
                      ) => {
                        field.handleChange(
                          event.target.value,
                        )

                        clearFieldError(
                          "organization_name",
                        )
                      }}
                      placeholder="Enter organization name"
                    />

                    <ErrorMessage
                      error={getError(
                        "organization_name",
                      )}
                    />
                  </Field>
                )}
              />

              {/* CONTACT PERSON */}

              <form.Field
                name="contact_person_name"
                children={(
                  field,
                ) => (
                  <Field>
                    <FieldLabel>
                      Contact Person Name
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Input
                      value={
                        field.state.value
                      }
                      onChange={(
                        event,
                      ) => {
                        field.handleChange(
                          event.target.value,
                        )

                        clearFieldError(
                          "contact_person_name",
                        )
                      }}
                      placeholder="Enter contact person name"
                    />

                    <ErrorMessage
                      error={getError(
                        "contact_person_name",
                      )}
                    />
                  </Field>
                )}
              />

              {/* EMAIL */}

              <form.Field
                name="email"
                children={(
                  field,
                ) => (
                  <Field>
                    <FieldLabel>
                      Organization Admin Email
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Input
                      type="email"
                      value={
                        field.state.value
                      }
                      onChange={(
                        event,
                      ) => {
                        field.handleChange(
                          event.target.value,
                        )

                        clearFieldError(
                          "email",
                        )
                      }}
                      placeholder="organization@example.com"
                    />

                    <FieldDescription>
                      Email address for the organization administrator.
                    </FieldDescription>

                    <ErrorMessage
                      error={getError(
                        "email",
                      )}
                    />
                  </Field>
                )}
              />

              {/* PHONE */}

              <form.Field
                name="phone"
                children={(
                  field,
                ) => (
                  <Field>
                    <FieldLabel>
                      Phone
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Input
                      type="tel"
                      value={
                        field.state.value
                      }
                      onChange={(
                        event,
                      ) => {
                        field.handleChange(
                          event.target.value,
                        )

                        clearFieldError(
                          "phone",
                        )
                      }}
                      placeholder="9876543210"
                    />

                    <ErrorMessage
                      error={getError(
                        "phone",
                      )}
                    />
                  </Field>
                )}
              />

              {/* ADMIN INFO */}

              <div className="rounded-lg border bg-muted/30 p-4 md:col-span-2">
                <p className="font-medium">
                  Admin Account
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  The contact person and organization admin email will be used to create the organization administrator account.
                </p>
              </div>

            </div>
          </FieldGroup>
        )}

        {/* =================================================
            STEP 2
        ================================================= */}

        {currentStep === 2 && (
          <FieldGroup>
            <div className="grid gap-4 md:grid-cols-3">

              {/* SELECTION TYPE */}

              <form.Field
                name="selection_type"
                children={(
                  field,
                ) => (
                  <Field>
                    <FieldLabel>
                      Selection Type
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Select
                      value={
                        field.state.value
                      }
                      onValueChange={(
                        value,
                      ) => {
                        if (
                          value === "plan" ||
                          value === "bundle"
                        ) {
                          handleSelectionTypeChange(
                            value,
                          )
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="plan">
                          Subscription Plans
                        </SelectItem>

                        <SelectItem value="bundle">
                          Subscription Bundle
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <ErrorMessage
                      error={getError(
                        "selection_type",
                      )}
                    />
                  </Field>
                )}
              />

              {/* PLANS */}

              {values.selection_type ===
                "plan" && (
                <div className="md:col-span-2">
                  <form.Field
                    name="plan_ids"
                    children={(
                      field,
                    ) => {
                      const selectedPlanIds =
                        field.state.value ?? []

                      return (
                        <Field>

                          <FieldLabel>
                            Subscription Plans
                            <span className="text-destructive">
                              *
                            </span>
                          </FieldLabel>

                          <FieldDescription>
                            Select one, multiple, or all plans.
                          </FieldDescription>

                          <Popover
                            open={
                              planDropdownOpen
                            }
                            onOpenChange={
                              setPlanDropdownOpen
                            }
                          >
                            <PopoverTrigger>
                              <Button
                                type="button"
                                variant="outline"
                                role="combobox"
                                aria-expanded={
                                  planDropdownOpen
                                }
                                className="w-full justify-between font-normal"
                              >
                                <span className="truncate">
                                  {selectedPlanIds.length ===
                                  0
                                    ? "Select subscription plans"
                                    : `${selectedPlanIds.length} plan${
                                        selectedPlanIds.length !==
                                        1
                                          ? "s"
                                          : ""
                                      } selected`}
                                </span>

                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>

                            <PopoverContent
                              className="w-[var(--radix-popover-trigger-width)] p-0"
                              align="start"
                            >
                              <div className="flex flex-col">

                                {/* SEARCH */}

                                <div className="flex items-center border-b px-3">
                                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />

                                  <Input
                                    value={
                                      planSearch
                                    }
                                    onChange={(
                                      event,
                                    ) => {
                                      setPlanSearch(
                                        event.target.value,
                                      )
                                    }}
                                    placeholder="Search plans..."
                                    className="border-0 px-0 focus-visible:ring-0"
                                  />
                                </div>

                                {/* SELECT ALL */}

                                <div className="flex items-center justify-between border-b p-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={
                                      allPlansSelected ||
                                      allPlanIds.length ===
                                        0
                                    }
                                    onClick={(
                                      event,
                                    ) => {
                                      event.preventDefault()
                                      event.stopPropagation()

                                      handleSelectAllPlans()
                                    }}
                                  >
                                    Select All
                                  </Button>

                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={
                                      selectedPlanIds.length ===
                                      0
                                    }
                                    onClick={(
                                      event,
                                    ) => {
                                      event.preventDefault()
                                      event.stopPropagation()

                                      handleClearAllPlans()
                                    }}
                                  >
                                    Clear All
                                  </Button>
                                </div>

                                {/* PLAN LIST */}

                                <div className="max-h-64 overflow-y-auto p-1">
                                  {filteredPlans.length ===
                                  0 ? (
                                    <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                                      No plans found.
                                    </p>
                                  ) : (
                                    filteredPlans.map(
                                      (plan) => {
                                        const planId =
                                          Number(
                                            plan.id,
                                          )

                                        const checked =
                                          selectedPlanIds.includes(
                                            planId,
                                          )

                                        const price =
                                          Number(
                                            plan.plan_price ??
                                              0,
                                          )

                                        return (
                                          <div
                                            key={planId}
                                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 hover:bg-muted"
                                          >
                                            <Checkbox
                                              checked={
                                                checked
                                              }
                                              onCheckedChange={() =>
                                                handleTogglePlan(
                                                  planId,
                                                )
                                              }
                                            />

                                            <button
                                              type="button"
                                              className="min-w-0 flex-1 text-left"
                                              onClick={() =>
                                                handleTogglePlan(
                                                  planId,
                                                )
                                              }
                                            >
                                              <p className="truncate text-sm font-medium">
                                                {
                                                  plan.plan_name
                                                }
                                              </p>

                                              <p className="truncate text-xs text-muted-foreground">
                                                {
                                                  plan.plan_code
                                                }

                                                {" · ₹"}

                                                {price.toLocaleString(
                                                  "en-IN",
                                                )}
                                              </p>
                                            </button>

                                            {checked && (
                                              <Check className="h-4 w-4 shrink-0" />
                                            )}
                                          </div>
                                        )
                                      },
                                    )
                                  )}
                                </div>

                              </div>
                            </PopoverContent>
                          </Popover>

                          {selectedPlanIds.length >
                            0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {selectedPlans.map(
                                (
                                  plan,
                                ) => (
                                  <div
                                    key={
                                      plan.id
                                    }
                                    className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"
                                  >
                                    <span className="max-w-[200px] truncate">
                                      {
                                        plan.plan_name
                                      }
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleTogglePlan(
                                          Number(
                                            plan.id,
                                          ),
                                        )
                                      }
                                      className="ml-1 rounded-sm opacity-60 hover:opacity-100"
                                      aria-label={`Remove ${plan.plan_name}`}
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ),
                              )}
                            </div>
                          )}

                          <ErrorMessage
                            error={getError(
                              "plan_ids",
                            )}
                          />

                        </Field>
                      )
                    }}
                  />
                </div>
              )}

              {/* BUNDLE */}

              {values.selection_type ===
                "bundle" && (
                <div className="md:col-span-2">
                  <form.Field
                    name="bundle_id"
                    children={(
                      field,
                    ) => (
                      <Field>

                        <FieldLabel>
                          Subscription Bundle
                          <span className="text-destructive">
                            *
                          </span>
                        </FieldLabel>

                        <FieldDescription>
                          Select exactly one bundle.
                        </FieldDescription>

                        <Popover
                          open={
                            bundleDropdownOpen
                          }
                          onOpenChange={
                            setBundleDropdownOpen
                          }
                        >
                          <PopoverTrigger>
                            <Button
                              type="button"
                              variant="outline"
                              role="combobox"
                              aria-expanded={
                                bundleDropdownOpen
                              }
                              className="w-full justify-between font-normal"
                            >
                              <span className="truncate">
                                {selectedBundle
                                  ? selectedBundle.bundle_name
                                  : "Select subscription bundle"}
                              </span>

                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent
                            className="w-[var(--radix-popover-trigger-width)] p-0"
                            align="start"
                          >
                            <div className="flex flex-col">

                              {/* SEARCH */}

                              <div className="flex items-center border-b px-3">
                                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />

                                <Input
                                  value={
                                    bundleSearch
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    setBundleSearch(
                                      event.target.value,
                                    )
                                  }
                                  placeholder="Search bundles..."
                                  className="border-0 px-0 focus-visible:ring-0"
                                />
                              </div>

                              {/* BUNDLE LIST */}

                              <div className="max-h-64 overflow-y-auto p-1">
                                {filteredBundles.length ===
                                0 ? (
                                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                                    No bundles found.
                                  </p>
                                ) : (
                                  filteredBundles.map(
                                    (
                                      bundle,
                                    ) => {
                                      const bundleId =
                                        Number(
                                          bundle.id,
                                        )

                                      const checked =
                                        Number(
                                          field.state.value,
                                        ) ===
                                        bundleId

                                      const price =
                                        Number(
                                          bundle.bundle_price ??
                                            0,
                                        )

                                      return (
                                        <button
                                          key={
                                            bundleId
                                          }
                                          type="button"
                                          onClick={() =>
                                            handleSelectBundle(
                                              bundleId,
                                            )
                                          }
                                          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-muted"
                                        >
                                          <div className="flex h-4 w-4 items-center justify-center">
                                            {checked && (
                                              <Check className="h-4 w-4" />
                                            )}
                                          </div>

                                          <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                              {
                                                bundle.bundle_name
                                              }
                                            </p>

                                            <p className="truncate text-xs text-muted-foreground">
                                              {
                                                bundle.bundle_code
                                              }

                                              {" · "}

                                              {
                                                bundle.bundle_type
                                              }

                                              {" · ₹"}

                                              {price.toLocaleString(
                                                "en-IN",
                                              )}
                                            </p>
                                          </div>
                                        </button>
                                      )
                                    },
                                  )
                                )}
                              </div>

                            </div>
                          </PopoverContent>
                        </Popover>

                        {selectedBundle && (
                          <div className="mt-2 flex w-fit items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
                            <span className="max-w-[250px] truncate">
                              {
                                selectedBundle.bundle_name
                              }
                            </span>

                            <button
                              type="button"
                              onClick={
                                handleRemoveBundle
                              }
                              className="ml-1 rounded-sm opacity-60 hover:opacity-100"
                              aria-label="Remove bundle"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}

                        <ErrorMessage
                          error={getError(
                            "bundle_id",
                          )}
                        />

                        <ErrorMessage
                          error={getError(
                            "bundle_type",
                          )}
                        />

                      </Field>
                    )}
                  />
                </div>
              )}

              {/* BUNDLE INFORMATION */}

              {selectedBundle && (
                <div className="space-y-3 rounded-lg border bg-muted/30 p-4 md:col-span-3">

                  <h3 className="font-semibold">
                    Selected Bundle
                  </h3>

                  <div className="grid gap-4 rounded-md border bg-background p-3 md:grid-cols-4">

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Bundle
                      </p>

                      <p className="font-medium">
                        {
                          selectedBundle.bundle_name
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Type
                      </p>

                      <p className="font-medium capitalize">
                        {
                          selectedBundle.bundle_type
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Price
                      </p>

                      <p className="font-medium">
                        ₹
                        {getItemPrice(
                          selectedBundle,
                        ).toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                          },
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Duration
                      </p>

                      <p className="font-medium">
                        {selectedBundle.bundle_duration_months
                          ? `${selectedBundle.bundle_duration_months} months`
                          : "Perpetual"}
                      </p>
                    </div>

                  </div>
                </div>
              )}

              {/* PRICING */}

              {pricingItems.length >
                0 && (
                <div className="rounded-lg border bg-muted/30 p-4 md:col-span-3">

                  <h3 className="mb-4 font-semibold">
                    Subscription Summary
                  </h3>

                  <div className="space-y-2 text-sm">

                    {pricingItems.map(
                      (
                        item,
                      ) => {
                        const isPlan =
                          "plan_name" in
                          item

                        const name =
                          isPlan
                            ? item.plan_name
                            : item.bundle_name

                        const price =
                          getItemPrice(
                            item,
                          )

                        return (
                          <div
                            key={
                              item.id
                            }
                            className="flex justify-between"
                          >
                            <span className="text-muted-foreground">
                              {name}
                            </span>

                            <span>
                              ₹
                              {price.toLocaleString(
                                "en-IN",
                                {
                                  minimumFractionDigits: 2,
                                },
                              )}
                            </span>
                          </div>
                        )
                      },
                    )}

                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground">
                        Subtotal
                      </span>

                      <span>
                        ₹
                        {registrationPrice.toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                          },
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        GST
                      </span>

                      <span>
                        ₹
                        {gstAmount.toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                          },
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between border-t pt-2 text-base font-semibold">
                      <span>
                        Registration Total
                      </span>

                      <span>
                        ₹
                        {registrationTotal.toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                          },
                        )}
                      </span>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </FieldGroup>
        )}

        {/* =================================================
            STEP 3
        ================================================= */}

        {currentStep === 3 && (
          <FieldGroup>
            <div className="grid gap-4 md:grid-cols-3">

              {/* PAYMENT METHOD */}

              <form.Field
                name="payment_method"
                children={(
                  field,
                ) => (
                  <Field>
                    <FieldLabel>
                      Payment Method
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Select
                      value={
                        field.state.value
                      }
                      onValueChange={(
                        value,
                      ) => {
                        if (
                          value ===
                          "manual"
                        ) {
                          field.handleChange(
                            "manual",
                          )

                          clearFieldError(
                            "payment_method",
                          )
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="manual">
                          Manual Payment
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <ErrorMessage
                      error={getError(
                        "payment_method",
                      )}
                    />
                  </Field>
                )}
              />

              {/* BILLING NAME */}

              <form.Field
                name="billing_name"
                children={(
                  field,
                ) => (
                  <Field>
                    <FieldLabel>
                      Billing Name
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Input
                      value={
                        field.state.value
                      }
                      onChange={(
                        event,
                      ) => {
                        field.handleChange(
                          event.target.value,
                        )

                        clearFieldError(
                          "billing_name",
                        )
                      }}
                      placeholder="Enter billing name"
                    />

                    <ErrorMessage
                      error={getError(
                        "billing_name",
                      )}
                    />
                  </Field>
                )}
              />

              {/* BILLING EMAIL */}

              <form.Field
                name="billing_email"
                children={(
                  field,
                ) => (
                  <Field>
                    <FieldLabel>
                      Billing Email
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Input
                      type="email"
                      value={
                        field.state.value
                      }
                      onChange={(
                        event,
                      ) => {
                        field.handleChange(
                          event.target.value,
                        )

                        clearFieldError(
                          "billing_email",
                        )
                      }}
                      placeholder="billing@example.com"
                    />

                    <ErrorMessage
                      error={getError(
                        "billing_email",
                      )}
                    />
                  </Field>
                )}
              />

              {/* BILLING ADDRESS */}

              <form.Field
                name="billing_address"
                children={(
                  field,
                ) => (
                  <Field className="md:col-span-2">
                    <FieldLabel>
                      Billing Address 1
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Input
                      value={
                        field.state.value
                      }
                      onChange={(
                        event,
                      ) => {
                        field.handleChange(
                          event.target.value,
                        )

                        clearFieldError(
                          "billing_address",
                        )
                      }}
                      placeholder="Enter complete billing address"
                    />

                    <ErrorMessage
                      error={getError(
                        "billing_address",
                      )}
                    />
                  </Field>
                )}
              />

              {/* BILLING ADDRESS 2 */}

              <form.Field
                name="billing_address2"
                children={(
                  field,
                ) => (
                  <Field className="md:col-span-2">
                    <FieldLabel>
                      Billing Address 2
                    </FieldLabel>

                    <Input
                      value={
                        field.state.value
                      }
                      onChange={(
                        event,
                      ) => {
                        field.handleChange(
                          event.target.value,
                        )

                        clearFieldError(
                          "billing_address2",
                        )
                      }}
                      placeholder="Enter complete billing address"
                    />

                    <ErrorMessage
                      error={getError(
                        "billing_address2",
                      )}
                    />
                  </Field>
                )}
              />

              {/* BILLING CITY */}

              <form.Field
                name="billing_city"
                children={(
                  field,
                ) => (
                  <Field>
                    <FieldLabel>
                      City
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Input
                      value={
                        field.state.value
                      }
                      onChange={(
                        event,
                      ) => {
                        field.handleChange(
                          event.target.value,
                        )

                        clearFieldError(
                          "billing_city",
                        )
                      }}
                      placeholder="Enter city"
                    />

                    <ErrorMessage
                      error={getError(
                        "billing_city",
                      )}
                    />
                  </Field>
                )}
              />

              {/* BILLING STATE */}

              <form.Field
                name="billing_state"
                children={(
                  field,
                ) => (
                  <Field>
                    <FieldLabel>
                      State
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Input
                      value={
                        field.state.value
                      }
                      onChange={(
                        event,
                      ) => {
                        field.handleChange(
                          event.target.value,
                        )

                        clearFieldError(
                          "billing_state",
                        )
                      }}
                      placeholder="Enter state"
                    />

                    <ErrorMessage
                      error={getError(
                        "billing_state",
                      )}
                    />
                  </Field>
                )}
              />

              {/* COUNTRY */}

              <form.Field
                name="billing_country"
                children={(
                  field,
                ) => (
                  <Field>
                    <FieldLabel>
                      Country
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Input
                      value={
                        field.state.value
                      }
                      onChange={(
                        event,
                      ) => {
                        field.handleChange(
                          event.target.value,
                        )

                        clearFieldError(
                          "billing_country",
                        )
                      }}
                      placeholder="Enter country"
                    />

                    <ErrorMessage
                      error={getError(
                        "billing_country",
                      )}
                    />
                  </Field>
                )}
              />

              {/* PINCODE */}

              <form.Field
                name="billing_pincode"
                children={(
                  field,
                ) => (
                  <Field>
                    <FieldLabel>
                      Pincode
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={
                        field.state.value
                      }
                      onChange={(
                        event,
                      ) => {
                        const value =
                          event.target.value.replace(
                            /\D/g,
                            "",
                          )

                        field.handleChange(
                          value,
                        )

                        clearFieldError(
                          "billing_pincode",
                        )
                      }}
                      placeholder="Enter 6-digit pincode"
                    />

                    <ErrorMessage
                      error={getError(
                        "billing_pincode",
                      )}
                    />
                  </Field>
                )}
              />

              {/* PAYMENT REFERENCE */}

              <form.Field
                name="payment_reference"
                children={(
                  field,
                ) => (
                  <Field>
                    <FieldLabel>
                      Payment Reference
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Input
                      value={
                        field.state.value
                      }
                      onChange={(
                        event,
                      ) => {
                        field.handleChange(
                          event.target.value,
                        )

                        clearFieldError(
                          "payment_reference",
                        )
                      }}
                      placeholder="Transaction / receipt number"
                    />

                    <ErrorMessage
                      error={getError(
                        "payment_reference",
                      )}
                    />
                  </Field>
                )}
              />

              {/* PAYMENT DATE */}

              <form.Field
                name="payment_date"
                children={(
                  field,
                ) => (
                  <Field>
                    <FieldLabel>
                      Payment Date
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Input
                      type="date"
                      value={
                        field.state.value
                      }
                      onChange={(
                        event,
                      ) => {
                        field.handleChange(
                          event.target.value,
                        )

                        clearFieldError(
                          "payment_date",
                        )
                      }}
                    />

                    <ErrorMessage
                      error={getError(
                        "payment_date",
                      )}
                    />
                  </Field>
                )}
              />

              {/* START DATE */}

              <form.Field
                name="start_date"
                children={(
                  field,
                ) => (
                  <Field>
                    <FieldLabel>
                      Start Date
                      <span className="text-destructive">
                        *
                      </span>
                    </FieldLabel>

                    <Input
                      type="date"
                      value={
                        field.state.value
                      }
                      onChange={(
                        event,
                      ) => {
                        field.handleChange(
                          event.target.value,
                        )

                        clearFieldError(
                          "start_date",
                        )
                      }}
                    />

                    <FieldDescription>
                      Subscription/license start date.
                    </FieldDescription>

                    <ErrorMessage
                      error={getError(
                        "start_date",
                      )}
                    />
                  </Field>
                )}
              />

              {/* PAYMENT AMOUNT */}

              <div className="rounded-lg border bg-muted/30 p-4 md:col-span-3">

                <div className="flex items-center justify-between">

                  <span className="text-sm text-muted-foreground">
                    Payment Amount
                  </span>

                  <span className="text-lg font-semibold">
                    ₹
                    {registrationTotal.toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                      },
                    )}
                  </span>

                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  Payment amount is automatically calculated from the selected plans or bundle.
                </p>

                <ErrorMessage
                  error={getError(
                    "payment_amount",
                  )}
                />

              </div>

              {/* PAYMENT NOTES */}

              <form.Field
                name="payment_notes"
                children={(
                  field,
                ) => (
                  <Field className="md:col-span-3">
                    <FieldLabel>
                      Payment Notes
                    </FieldLabel>

                    <Input
                      value={
                        field.state.value
                      }
                      onChange={(
                        event,
                      ) => {
                        field.handleChange(
                          event.target.value,
                        )

                        clearFieldError(
                          "payment_notes",
                        )
                      }}
                      placeholder="Optional payment notes"
                    />

                    <ErrorMessage
                      error={getError(
                        "payment_notes",
                      )}
                    />
                  </Field>
                )}
              />

            </div>
          </FieldGroup>
        )}

      </CardContent>

      {/* ===================================================
          FOOTER
      =================================================== */}

      <CardFooter className="flex justify-between">

        <Button
          type="button"
          variant="outline"
          onClick={
            currentStep === 1
              ? onCancel
              : handlePrevious
          }
          disabled={
            loading
          }
        >
          <ChevronLeft className="mr-2 h-4 w-4" />

          {currentStep === 1
            ? "Cancel"
            : "Previous"}
        </Button>

        {currentStep < 3 ? (
          <Button
            type="button"
            onClick={
              handleNext
            }
            disabled={
              loading
            }
          >
            Next

            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            disabled={
              loading
            }
            onClick={() => {
              const valid =
                validateAllSteps()

              if (!valid) {
                return
              }

              form.handleSubmit()
            }}
          >
            {loading
              ? "Submitting..."
              : "Complete Registration"}

            {!loading && (
              <Check className="ml-2 h-4 w-4" />
            )}
          </Button>
        )}

      </CardFooter>
    </Card>
  )
}