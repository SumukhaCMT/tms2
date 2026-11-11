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


import {
  Card,
  CardContent,
  CardDescription,
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
import LoginImageCard from "../components/LoginImageCard"
import { showCmtToast } from "@/components/ui/cmt-toast"



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

  const amcDefaults = systemDefaults.filter((item) => item.key_name.startsWith("amc_"))
  const generalDefaults = systemDefaults.filter((item) => !item.key_name.startsWith("amc_"))


 

 


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
    showCmtToast("success", "System default updated successfully.")

  }




  


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
                  generalDefaults
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

        <Card>
          <CardHeader>
            <CardTitle>AMC Settings</CardTitle>
            <CardDescription>
              AMC price, GST and duration used for perpetual plans without their own AMC price.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {systemDefaultsLoading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Loading AMC settings...
              </div>
            ) : (
              <SystemDefaultsTable
                systemDefaults={amcDefaults}
                saving={systemDefaultsSaving}
                onUpdate={handleUpdate}
              />
            )}
          </CardContent>
        </Card>

        <LoginImageCard />

      </div>


   

     

    </>

  )
}