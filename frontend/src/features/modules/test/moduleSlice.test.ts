// import { describe, expect, it } from "vitest"

// import moduleReducer, {
//   clearModuleError,
//   clearModuleSuccess,
//   clearModules,
// } from "@/features/modules/moduleSlice"

// import {
//   fetchModules,
//   addModule,
//   editModule,
//   removeModule,
// } from "@/features/modules/moduleThunks"

// const moduleData = {
//   id: 1,
//   module_code: "DONATION",
//   module_name: "Donation Management",
//   module_type: "feature" as const,
//   capacity_type: null,
//   consumable_type: null,
//   display_order: 1,
//   status: "active" as const,
// }

// // const initialState = {
// //   modules: [],
// //   loading: false,
// //   error: null,
// //   success: false,
// // }
// const initialState = {
//   modules: [],
//   pagination: {
//     page: 1,
//     limit: 10,
//     total: 0,
//     totalPages: 0,
//   },
//   loading: false,
//   error: null,
//   success: false,
// }

// describe("moduleSlice CRUD", () => {
//   describe("READ", () => {
//     it("sets loading when fetching modules", () => {
//       const action = {
//         type: fetchModules.pending.type,
//       }

//       const state = moduleReducer(
//         initialState,
//         action
//       )

//       expect(state.loading).toBe(true)
//       expect(state.error).toBe(null)
//     })

//     it("stores modules after successful fetch", () => {
//       // const action = {
//       //   type: fetchModules.fulfilled.type,
//       //   payload: [moduleData],
//       // }
//       const action = {
//   type: fetchModules.fulfilled.type,
//   payload: {
//     success: true,
//     data: [moduleData],
//     pagination: {
//       page: 1,
//       limit: 10,
//       total: 1,
//       totalPages: 1,
//     },
//   },
// }

//       const state = moduleReducer(
//         initialState,
//         action
//       )

//       expect(state.loading).toBe(false)
//       expect(state.modules).toEqual([moduleData])
//     })

//     it("stores error when fetch fails", () => {
//       const action = {
//         type: fetchModules.rejected.type,
//         payload: "Failed to fetch modules.",
//       }

//       const state = moduleReducer(
//         initialState,
//         action
//       )

//       expect(state.loading).toBe(false)
//       expect(state.error).toBe(
//         "Failed to fetch modules."
//       )
//     })
//   })

//   describe("CREATE", () => {
//     it("sets loading when creating module", () => {
//       const action = {
//         type: addModule.pending.type,
//       }

//       const state = moduleReducer(
//         initialState,
//         action
//       )

//       expect(state.loading).toBe(true)
//       expect(state.success).toBe(false)
//     })

//     it("adds module after successful create", () => {
//       const action = {
//         type: addModule.fulfilled.type,
//         payload: moduleData,
//       }

//       const state = moduleReducer(
//         initialState,
//         action
//       )

//       expect(state.loading).toBe(false)
//       expect(state.success).toBe(true)
//       expect(state.modules).toHaveLength(1)
//       expect(state.modules[0]).toEqual(moduleData)
//     })

//     it("stores create error", () => {
//       const action = {
//         type: addModule.rejected.type,
//         payload: "Failed to create module.",
//       }

//       const state = moduleReducer(
//         initialState,
//         action
//       )

//       expect(state.loading).toBe(false)
//       expect(state.error).toBe(
//         "Failed to create module."
//       )
//     })
//   })

//   describe("UPDATE", () => {
//     it("sets loading when updating module", () => {
//       const stateWithModule = {
//         ...initialState,
//         modules: [moduleData],
//       }

//       const action = {
//         type: editModule.pending.type,
//       }

//       const state = moduleReducer(
//         stateWithModule,
//         action
//       )

//       expect(state.loading).toBe(true)
//       expect(state.success).toBe(false)
//     })

//     it("updates existing module", () => {
//       const stateWithModule = {
//         ...initialState,
//         modules: [moduleData],
//       }

//       const updatedModule = {
//         ...moduleData,
//         module_name: "Updated Donation Management",
//       }

//       const action = {
//         type: editModule.fulfilled.type,
//         payload: updatedModule,
//       }

//       const state = moduleReducer(
//         stateWithModule,
//         action
//       )

//       expect(state.loading).toBe(false)
//       expect(state.success).toBe(true)
//       expect(state.modules[0].module_name).toBe(
//         "Updated Donation Management"
//       )
//     })

//     it("stores update error", () => {
//       const action = {
//         type: editModule.rejected.type,
//         payload: "Failed to update module.",
//       }

//       const state = moduleReducer(
//         initialState,
//         action
//       )

//       expect(state.loading).toBe(false)
//       expect(state.error).toBe(
//         "Failed to update module."
//       )
//     })
//   })

//   describe("DELETE", () => {
//     it("sets loading when deleting module", () => {
//       const stateWithModule = {
//         ...initialState,
//         modules: [moduleData],
//       }

//       const action = {
//         type: removeModule.pending.type,
//       }

//       const state = moduleReducer(
//         stateWithModule,
//         action
//       )

//       expect(state.loading).toBe(true)
//     })

//     it("removes module after successful delete", () => {
//       const stateWithModule = {
//         ...initialState,
//         modules: [moduleData],
//       }

//       const action = {
//         type: removeModule.fulfilled.type,
//         payload: 1,
//       }

//       const state = moduleReducer(
//         stateWithModule,
//         action
//       )

//       expect(state.loading).toBe(false)
//       expect(state.modules).toEqual([])
//     })

//     it("keeps other modules after deleting one", () => {
//       const secondModule = {
//         ...moduleData,
//         id: 2,
//         module_code: "SEVA",
//         module_name: "Seva Management",
//       }

//       const stateWithModules = {
//         ...initialState,
//         modules: [moduleData, secondModule],
//       }

//       const action = {
//         type: removeModule.fulfilled.type,
//         payload: 1,
//       }

//       const state = moduleReducer(
//         stateWithModules,
//         action
//       )

//       expect(state.modules).toEqual([
//         secondModule,
//       ])
//     })

//     it("stores delete error", () => {
//       const action = {
//         type: removeModule.rejected.type,
//         payload: "Failed to delete module.",
//       }

//       const state = moduleReducer(
//         initialState,
//         action
//       )

//       expect(state.loading).toBe(false)
//       expect(state.error).toBe(
//         "Failed to delete module."
//       )
//     })
//   })

//   describe("Local reducers", () => {
//     it("clears module error", () => {
//       const state = {
//         ...initialState,
//         error: "Some error",
//       }

//       const result = moduleReducer(
//         state,
//         clearModuleError()
//       )

//       expect(result.error).toBe(null)
//     })

//     it("clears success state", () => {
//       const state = {
//         ...initialState,
//         success: true,
//       }

//       const result = moduleReducer(
//         state,
//         clearModuleSuccess()
//       )

//       expect(result.success).toBe(false)
//     })

//     it("clears all modules", () => {
//       const state = {
//         ...initialState,
//         modules: [moduleData],
//       }

//       const result = moduleReducer(
//         state,
//         clearModules()
//       )

//       expect(result.modules).toEqual([])
//     })
//   })
// })



import { describe, expect, it } from "vitest"

import moduleReducer, {
  clearModuleError,
  clearModuleSuccess,
  clearModules,
} from "@/features/modules/moduleSlice"

import {
  fetchModules,
  addModule,
  editModule,
  removeModule,
} from "@/features/modules/moduleThunks"

const moduleData = {
  id: 1,
  module_code: "DONATION",
  module_name: "Donation Management",
  module_type: "feature" as const,
  capacity_type: null,
  consumable_type: null,
  display_order: 1,
  status: "active" as const,
}

const pagination = {
  page: 1,
  limit: 10,
  total: 1,
  totalPages: 1,
}

const modulesResponse = {
  success: true,
  data: [moduleData],
  pagination,
}

const initialState = {
  modules: [],
  loading: false,
  error: null,
  success: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
}

describe("moduleSlice CRUD", () => {
  describe("READ", () => {
    it("sets loading when fetching modules", () => {
      const action = {
        type: fetchModules.pending.type,
      }

      const state = moduleReducer(
        initialState,
        action
      )

      expect(state.loading).toBe(true)
      expect(state.error).toBe(null)
    })

    it("stores modules after successful fetch", () => {
      const action = {
        type: fetchModules.fulfilled.type,
        payload: modulesResponse,
      }

      const state = moduleReducer(
        initialState,
        action
      )

      expect(state.loading).toBe(false)
      expect(state.modules).toEqual([moduleData])
      expect(state.pagination).toEqual(pagination)
    })

    it("stores error when fetch fails", () => {
      const action = {
        type: fetchModules.rejected.type,
        payload: "Failed to fetch modules.",
      }

      const state = moduleReducer(
        initialState,
        action
      )

      expect(state.loading).toBe(false)
      expect(state.error).toBe(
        "Failed to fetch modules."
      )
    })
  })

  describe("CREATE", () => {
    it("sets loading when creating module", () => {
      const action = {
        type: addModule.pending.type,
      }

      const state = moduleReducer(
        initialState,
        action
      )

      expect(state.loading).toBe(true)
      expect(state.success).toBe(false)
    })

    it("adds module after successful create", () => {
      const action = {
        type: addModule.fulfilled.type,
        payload: moduleData,
      }

      const state = moduleReducer(
        initialState,
        action
      )

      expect(state.loading).toBe(false)
      expect(state.success).toBe(true)
      expect(state.modules).toHaveLength(1)
      expect(state.modules[0]).toEqual(moduleData)
    })

    it("stores create error", () => {
      const action = {
        type: addModule.rejected.type,
        payload: "Failed to create module.",
      }

      const state = moduleReducer(
        initialState,
        action
      )

      expect(state.loading).toBe(false)
      expect(state.error).toBe(
        "Failed to create module."
      )
    })
  })

  describe("UPDATE", () => {
    it("sets loading when updating module", () => {
      const stateWithModule = {
        ...initialState,
        modules: [moduleData],
      }

      const action = {
        type: editModule.pending.type,
      }

      const state = moduleReducer(
        stateWithModule,
        action
      )

      expect(state.loading).toBe(true)
      expect(state.success).toBe(false)
    })

    it("updates existing module", () => {
      const stateWithModule = {
        ...initialState,
        modules: [moduleData],
      }

      const updatedModule = {
        ...moduleData,
        module_name: "Updated Donation Management",
      }

      const action = {
        type: editModule.fulfilled.type,
        payload: updatedModule,
      }

      const state = moduleReducer(
        stateWithModule,
        action
      )

      expect(state.loading).toBe(false)
      expect(state.success).toBe(true)
      expect(state.modules[0].module_name).toBe(
        "Updated Donation Management"
      )
    })

    it("stores update error", () => {
      const action = {
        type: editModule.rejected.type,
        payload: "Failed to update module.",
      }

      const state = moduleReducer(
        initialState,
        action
      )

      expect(state.loading).toBe(false)
      expect(state.error).toBe(
        "Failed to update module."
      )
    })
  })

  describe("DELETE", () => {
    it("sets loading when deleting module", () => {
      const stateWithModule = {
        ...initialState,
        modules: [moduleData],
      }

      const action = {
        type: removeModule.pending.type,
      }

      const state = moduleReducer(
        stateWithModule,
        action
      )

      expect(state.loading).toBe(true)
    })

    it("removes module after successful delete", () => {
      const stateWithModule = {
        ...initialState,
        modules: [moduleData],
        pagination: {
          ...initialState.pagination,
          total: 1,
        },
      }

      const action = {
        type: removeModule.fulfilled.type,
        payload: 1,
      }

      const state = moduleReducer(
        stateWithModule,
        action
      )

      expect(state.loading).toBe(false)
      expect(state.modules).toEqual([])
      expect(state.pagination.total).toBe(0)
    })

    it("keeps other modules after deleting one", () => {
      const secondModule = {
        ...moduleData,
        id: 2,
        module_code: "SEVA",
        module_name: "Seva Management",
      }

      const stateWithModules = {
        ...initialState,
        modules: [moduleData, secondModule],
        pagination: {
          ...initialState.pagination,
          total: 2,
        },
      }

      const action = {
        type: removeModule.fulfilled.type,
        payload: 1,
      }

      const state = moduleReducer(
        stateWithModules,
        action
      )

      expect(state.modules).toEqual([
        secondModule,
      ])

      expect(state.pagination.total).toBe(1)
    })

    it("stores delete error", () => {
      const action = {
        type: removeModule.rejected.type,
        payload: "Failed to delete module.",
      }

      const state = moduleReducer(
        initialState,
        action
      )

      expect(state.loading).toBe(false)
      expect(state.error).toBe(
        "Failed to delete module."
      )
    })
  })

  describe("Local reducers", () => {
    it("clears module error", () => {
      const state = {
        ...initialState,
        error: "Some error",
      }

      const result = moduleReducer(
        state,
        clearModuleError()
      )

      expect(result.error).toBe(null)
    })

    it("clears success state", () => {
      const state = {
        ...initialState,
        success: true,
      }

      const result = moduleReducer(
        state,
        clearModuleSuccess()
      )

      expect(result.success).toBe(false)
    })

    it("clears all modules", () => {
      const state = {
        ...initialState,
        modules: [moduleData],
      }

      const result = moduleReducer(
        state,
        clearModules()
      )

      expect(result.modules).toEqual([])
    })
  })
})

