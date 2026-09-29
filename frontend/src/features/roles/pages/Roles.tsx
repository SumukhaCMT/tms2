"use client"

import {
  useEffect,
} from "react"

import {
  useDispatch,
  useSelector,
} from "react-redux"

import {
  ShieldCheck,
} from "lucide-react"

import type {
  AppDispatch,
} from "@/app/store"

import {
  Card,
  CardContent,
} from "@/components/ui/card"

import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"

import {
  fetchRoles,
} from "../roleThunks"

import {
  // selectRoles,
  selectRolesError,
  selectRolesLoading,
} from "../roleSelectors"

import RolesTable from "../components/RolesTable"


export default function Roles() {

  const dispatch =
    useDispatch<AppDispatch>()


  // const roles =
  //   useSelector(
  //     selectRoles,
  //   )

  const loading =
    useSelector(
      selectRolesLoading,
    )

  const error =
    useSelector(
      selectRolesError,
    )


  useEffect(() => {

    dispatch(
      fetchRoles(),
    )

  }, [dispatch])


  return (

    <div className="space-y-6">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="
        flex
        items-center
        gap-3
      ">

        <div className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-lg
          border
          bg-muted
        ">

          <ShieldCheck
            className="h-5 w-5"
          />

        </div>


        <div>

          <h1 className="
            text-2xl
            font-semibold
          ">

            Roles

          </h1>


          <p className="
            text-sm
            text-muted-foreground
          ">

            Manage application roles
            and their permissions.

          </p>

        </div>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <Alert
          variant="destructive"
        >

          <AlertDescription>

            {error}

          </AlertDescription>

        </Alert>

      )}


      {/* =================================================
          ROLES TABLE
      ================================================= */}

      <Card>

        <CardContent className="p-6">

          {loading ? (

            <div className="
              py-10
              text-center
              text-sm
              text-muted-foreground
            ">

              Loading roles...

            </div>

          ) : (

            <RolesTable
              // roles={roles}
            />

          )}

        </CardContent>

      </Card>

    </div>

  )
}