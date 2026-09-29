"use client"

import {
  useEffect,
  useState,
} from "react"

import {
  useDispatch,
  useSelector,
} from "react-redux"

import {
  useNavigate,
  useParams,
} from "react-router-dom"

import type {
  AppDispatch,
} from "@/app/store"

import {
  fetchRoleById,
  updateRole,
} from "../roleThunks"

import {
  selectSelectedRole,
  selectRolesLoading,
  selectRolesSaving,
} from "../roleSelectors"

import {
  Button,
} from "@/components/ui/button"

import {
  Input,
} from "@/components/ui/input"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Field,
  FieldLabel,
} from "@/components/ui/field"


export default function EditRole() {

  /* =========================================================
     ROUTE PARAM
  ========================================================= */

  const {
    id,
  } = useParams<{
    id: string
  }>()


  /* =========================================================
     REDUX
  ========================================================= */

  const dispatch =
    useDispatch<AppDispatch>()


  const navigate =
    useNavigate()


  const role =
    useSelector(
      selectSelectedRole,
    )


  const loading =
    useSelector(
      selectRolesLoading,
    )


  const saving =
    useSelector(
      selectRolesSaving,
    )


  /* =========================================================
     LOCAL FORM STATE

     Only User Role Name is editable.

     User Role is read-only, so it does not need
     separate local state.
  ========================================================= */

  const [
    roleName,
    setRoleName,
  ] = useState<string | null>(
    null,
  )


  /* =========================================================
     FETCH ROLE
  ========================================================= */

  useEffect(() => {

    if (!id) {
      return
    }

    void dispatch(
      fetchRoleById(
        Number(id),
      ),
    )

  }, [
    dispatch,
    id,
  ])


  /* =========================================================
     CURRENT FORM VALUES
  ========================================================= */

  const currentRoleName =
    roleName ??
    role?.user_role_name ??
    ""


  const currentUserRole =
    role?.user_role ??
    ""


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (
      <div className="flex min-h-[300px] items-center justify-center">

        <p className="text-sm text-muted-foreground">
          Loading role...
        </p>

      </div>
    )

  }


  /* =========================================================
     ROLE NOT FOUND
  ========================================================= */

  if (!role) {

    return (
      <div className="flex min-h-[300px] items-center justify-center">

        <p className="text-sm text-muted-foreground">
          Role not found.
        </p>

      </div>
    )

  }


  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {

    event.preventDefault()


    if (!id) {
      return
    }


    const trimmedRoleName =
      currentRoleName.trim()


    const trimmedUserRole =
      currentUserRole.trim()


    /* =======================================================
       VALIDATION
    ======================================================= */

    if (!trimmedRoleName) {
      return
    }


    if (!trimmedUserRole) {
      return
    }


    try {

      await dispatch(
        updateRole({
          id: Number(id),

          data: {
            user_role_name:
              trimmedRoleName,

            user_role:
              trimmedUserRole,
          },
        }),
      ).unwrap()


      /* =====================================================
         SUCCESS
      ===================================================== */

      navigate(
        "/roles",
      )

    } catch (error) {

      console.error(
        "Update role failed:",
        error,
      )

    }

  }


  /* =========================================================
     CANCEL
  ========================================================= */

  const handleCancel = () => {

    navigate(
      "/roles",
    )

  }


  /* =========================================================
     UI
  ========================================================= */

  return (

    <div className="w-full">

      <Card>

        {/* ===================================================
            CARD HEADER
        =================================================== */}

        <CardHeader>

          <CardTitle>
            Edit Role
          </CardTitle>

        </CardHeader>


        {/* ===================================================
            CARD CONTENT
        =================================================== */}

        <CardContent>

          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-6"
          >

            {/* ===============================================
                USER ROLE NAME
            ================================================ */}

            <Field>

              <FieldLabel htmlFor="role_name">
                User Role Name
              </FieldLabel>


              <Input
                id="role_name"
                name="role_name"
                value={
                  currentRoleName
                }
                onChange={(
                  event,
                ) => {

                  setRoleName(
                    event.target.value,
                  )

                }}
                placeholder="Enter user role name"
                disabled={saving}
              />

            </Field>


            {/* ===============================================
                USER ROLE
            ================================================ */}

            <Field>

              <FieldLabel htmlFor="user_role">
                User Role
              </FieldLabel>


              <Input
                id="user_role"
                name="user_role"
                value={
                  currentUserRole
                }
                readOnly
                placeholder="Enter user role"
                disabled={saving}
              />

            </Field>


            {/* ===============================================
                BUTTONS
            ================================================ */}

            <div className="flex justify-end gap-3">

              {/* CANCEL */}

              <Button
                type="button"
                variant="outline"
                onClick={
                  handleCancel
                }
                disabled={saving}
              >
                Cancel
              </Button>


              {/* UPDATE */}

              <Button
                type="submit"
                disabled={
                  saving ||
                  !currentRoleName.trim() ||
                  !currentUserRole.trim()
                }
              >

                {saving
                  ? "Updating..."
                  : "Update Role"}

              </Button>

            </div>

          </form>

        </CardContent>

      </Card>

    </div>

  )
}