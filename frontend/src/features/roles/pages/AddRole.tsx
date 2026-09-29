
"use client"

import {
  useEffect,
} from "react"

import {
  useDispatch,
  useSelector,
} from "react-redux"

import {
  useNavigate,
} from "react-router-dom"

import type {
  AppDispatch,
} from "@/app/store"

import RoleForm from "../components/RoleForm"

import type {
  RoleFormData,
} from "../components/RoleForm"

import {
  createRole,
} from "../roleThunks"

import {
  selectRolesSaving,
} from "../roleSelectors"

import {
  fetchSubModules,
} from "../../sub_modules/submoduleThunks"

import {
  selectSubModules,
  selectSubModulesLoading,
} from "../../sub_modules/submoduleSelectors"


export default function AddRole() {

  const dispatch =
    useDispatch<AppDispatch>()

  const navigate =
    useNavigate()


  /* =========================================================
     SUBMODULES
  ========================================================= */

  const subModules =
    useSelector(
      selectSubModules,
    )

  const subModulesLoading =
    useSelector(
      selectSubModulesLoading,
    )


  /* =========================================================
     ROLE LOADING
  ========================================================= */

  const loading =
    useSelector(
      selectRolesSaving,
    )


  /* =========================================================
     FETCH SUBMODULES
  ========================================================= */

  useEffect(() => {

    dispatch(
      fetchSubModules({}),
    )

  }, [dispatch])


  /* =========================================================
     CREATE ROLE
  ========================================================= */

  const handleSubmit = async (
    data: RoleFormData,
  ) => {

    try {

      /*
       * IMPORTANT
       *
       * Backend expects:
       *
       * user_role_name
       * permissions[]
       *
       * Each permission contains:
       *
       * sub_module_id
       * permission
       *
       * DO NOT use role_id here.
       */

      const payload = {

        user_role_name:
          data.role_name.trim(),

        permissions:
          data.permissions.map(
            (permission) => ({
              sub_module_id:
                permission.sub_module_id,

              permission:
                permission.permission,
            }),
          ),

      }


      console.log(
        "ROLE CREATE PAYLOAD:",
        payload,
      )


      /*
       * CREATE ROLE
       */

      await dispatch(
        createRole(payload),
      ).unwrap()


      /*
       * SUCCESS
       */

      navigate(
        "/roles",
      )

    } catch (error) {

      console.error(
        "Create role failed:",
        error,
      )

    }

  }


  /* =========================================================
     SUBMODULE LOADING
  ========================================================= */

  if (
    subModulesLoading
  ) {

    return (
      <div
        className="
          py-10
          text-center
          text-sm
          text-muted-foreground
        "
      >
        Loading submodules...
      </div>
    )

  }


  /* =========================================================
     PAGE
  ========================================================= */

  return (

    <div className="w-full">

      <RoleForm

        subModules={
          subModules
        }

        onSubmit={
          handleSubmit
        }

        loading={
          loading
        }

      />

    </div>

  )
}

