import { useEffect } from "react"

import {
  useDispatch,
  useSelector,
} from "react-redux"

import {
  Settings2,
} from "lucide-react"

import type {
  AppDispatch,
} from "@/app/store"

// import RoleForm from "../components/RoleForm"

// import type {
//   RoleFormData,
// } from "../components/RoleForm"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"

import {
  fetchSystemDefaults,
  updateSystemDefault,
} from "../systemDefaultsThunks"

import {
  selectSystemDefaults,
  selectSystemDefaultsError,
  selectSystemDefaultsLoading,
  selectSystemDefaultsSaving,
} from "../systemDefaultsSelectors"

import SystemDefaultsTable from "../components/SystemDefaultsTable"

// import {
//   fetchSubModules,
// } from "../../sub_modules/submoduleThunks"

// import {
//   selectSubModules,
//   selectSubModulesLoading,
// } from "../../sub_modules/submoduleSelectors"


export default function View() {

  const dispatch =
    useDispatch<AppDispatch>()




  const systemDefaults =
    useSelector(
      selectSystemDefaults,
    )

  const systemDefaultsLoading =
    useSelector(
      selectSystemDefaultsLoading,
    )

  const systemDefaultsSaving =
    useSelector(
      selectSystemDefaultsSaving,
    )

  const systemDefaultsError =
    useSelector(
      selectSystemDefaultsError,
    )


  /* =====================================================
     SUBMODULES
  ===================================================== */

  // const subModules =
  //   useSelector(
  //     selectSubModules,
  //   )

  // const subModulesLoading =
  //   useSelector(
  //     selectSubModulesLoading,
  //   )


  /* =====================================================
     FETCH SUBMODULES
  ===================================================== */

  // useEffect(() => {

  //   dispatch(
  //     fetchSubModules({}),
  //   )

  // }, [dispatch])


  /* =====================================================
     FETCH SYSTEM DEFAULTS
  ===================================================== */

  useEffect(() => {

    dispatch(
      fetchSystemDefaults({
        page: 1,
        limit: 100,
      }),
    )

  }, [dispatch])



  const handleUpdate = async (
    id: number,
    value: number,
    description: string,
  ) => {

    await dispatch(
      updateSystemDefault({
        id,

        data: {
          value_int: value,
          description,
        },
      }),
    ).unwrap()

  }




  // const handleSubmit = async (
  //   data: RoleFormData,
  // ) => {

  //   console.log(
  //     "ROLE DATA:",
  //     data,
  //   )

  //   /*
  //     Example output:

  //     {
  //       role_name: "Temple Manager",

  //       submodule_ids: [
  //         1,
  //         2,
  //         4,
  //         7
  //       ],

  //       permissions: [
  //         {
  //           role_id: 4,
  //           permission: 6
  //         }
  //       ]
  //     }
  //   */


  //   /*
  //     CREATE ROLE API / THUNK

  //     Later:

  //     await dispatch(
  //       createRole(data)
  //     ).unwrap()
  //   */

  // }


  /* =====================================================
     RETURN
  ===================================================== */

  return (

    <>

    

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

            <Settings2
              className="h-5 w-5"
            />

          </div>


          <div>

            <h1 className="
              text-2xl
              font-semibold
            ">

              Default Settings

            </h1>


            <p className="
              text-sm
              text-muted-foreground
            ">

              Manage global system default values
              for the TMS application.

            </p>

          </div>

        </div>


        {/* =================================================
            SYSTEM DEFAULT ERROR
        ================================================= */}

        {systemDefaultsError && (

          <Alert
            variant="destructive"
          >

            <AlertDescription>

              {
                systemDefaultsError
              }

            </AlertDescription>

          </Alert>

        )}


        {/* =================================================
            SYSTEM DEFAULTS CARD
        ================================================= */}

        <Card>

          <CardHeader>

            <CardTitle>

              System Defaults

            </CardTitle>

          </CardHeader>


          <CardContent>

            {systemDefaultsLoading ? (

              <div className="
                py-10
                text-center
                text-sm
                text-muted-foreground
              ">

                Loading system defaults...

              </div>

            ) : (

              <SystemDefaultsTable

                systemDefaults={
                  systemDefaults
                }

                saving={
                  systemDefaultsSaving
                }

                onUpdate={
                  handleUpdate
                }

              />

            )}

          </CardContent>

        </Card>

      </div>


   

      {/* <div className="
        mt-6
        w-full
      ">

        {subModulesLoading ? (

          <Card>

            <CardContent className="
              py-10
              text-center
              text-sm
              text-muted-foreground
            ">

              Loading submodules...

            </CardContent>

          </Card>

        ) : (

          <RoleForm

        

            subModules={
              subModules
            }


          

            onSubmit={
              handleSubmit
            }


        

            loading={
              false
            }

          />

        )}

      </div> */}

    </>

  )
}