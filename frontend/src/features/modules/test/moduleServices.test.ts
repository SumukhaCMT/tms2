// import { beforeEach, describe, expect, it, vi } from "vitest"

// import api from "@/axios/axios"

// import {
//   getModules,
//   getModuleById,
//   createModule,
//   updateModule,
//   deleteModule,
// } from "@/features/modules/services/moduleServices"

// import type {
//   CreateModulePayload,
//   UpdateModulePayload,
// } from "../moduleTypes"

// vi.mock("@/axios/axios", () => ({
//   default: {
//     get: vi.fn(),
//     post: vi.fn(),
//     put: vi.fn(),
//     delete: vi.fn(),
//   },
// }))

// const mockedApi = vi.mocked(api)

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

// const createPayload: CreateModulePayload = {
//   module_code: "DONATION",
//   module_name: "Donation Management",
//   module_type: "feature",
//   capacity_type: null,
//   consumable_type: null,
//   display_order: 1,
//   status: "active",
// }

// const updatePayload: UpdateModulePayload = {
//   ...createPayload,
//   id: 1,
// }

// describe("moduleServices CRUD", () => {
//   beforeEach(() => {
//     vi.clearAllMocks()
//   })

//   describe("READ - getModules", () => {
//     it("fetches all modules", async () => {
//       mockedApi.get.mockResolvedValueOnce({
//         data: [moduleData],
//       })

//       const result = await getModules()

//       expect(mockedApi.get).toHaveBeenCalledWith(
//         "/v1/modules"
//       )

//       expect(result).toEqual([moduleData])
//     })

//     it("supports data response format", async () => {
//       mockedApi.get.mockResolvedValueOnce({
//         data: {
//           data: [moduleData],
//         },
//       })

//       const result = await getModules()

//       expect(result).toEqual([moduleData])
//     })

//     it("supports modules response format", async () => {
//       mockedApi.get.mockResolvedValueOnce({
//         data: {
//           modules: [moduleData],
//         },
//       })

//       const result = await getModules()

//       expect(result).toEqual([moduleData])
//     })

//     it("returns empty array when API returns invalid data", async () => {
//       mockedApi.get.mockResolvedValueOnce({
//         data: {},
//       })

//       const result = await getModules()

//       expect(result).toEqual([])
//     })

//     it("throws when API request fails", async () => {
//       mockedApi.get.mockRejectedValueOnce(
//         new Error("Network error")
//       )

//       await expect(getModules()).rejects.toThrow(
//         "Network error"
//       )
//     })
//   })

//   describe("READ - getModuleById", () => {
//     it("fetches module by ID", async () => {
//       mockedApi.get.mockResolvedValueOnce({
//         data: moduleData,
//       })

//       const result = await getModuleById(1)

//       expect(mockedApi.get).toHaveBeenCalledWith(
//         "/v1/modules/1"
//       )

//       expect(result).toEqual(moduleData)
//     })

//     it("supports data response", async () => {
//       mockedApi.get.mockResolvedValueOnce({
//         data: {
//           data: moduleData,
//         },
//       })

//       const result = await getModuleById(1)

//       expect(result).toEqual(moduleData)
//     })

//     it("supports module response", async () => {
//       mockedApi.get.mockResolvedValueOnce({
//         data: {
//           module: moduleData,
//         },
//       })

//       const result = await getModuleById(1)

//       expect(result).toEqual(moduleData)
//     })

//     it("supports string ID", async () => {
//       mockedApi.get.mockResolvedValueOnce({
//         data: moduleData,
//       })

//       await getModuleById("1")

//       expect(mockedApi.get).toHaveBeenCalledWith(
//         "/v1/modules/1"
//       )
//     })
//   })

//   describe("CREATE - createModule", () => {
//     it("creates a module", async () => {
//       mockedApi.post.mockResolvedValueOnce({
//         data: moduleData,
//       })

//       const result = await createModule(createPayload)

//       expect(mockedApi.post).toHaveBeenCalledWith(
//         "/v1/modules",
//         createPayload
//       )

//       expect(result).toEqual(moduleData)
//     })

//     it("supports data response", async () => {
//       mockedApi.post.mockResolvedValueOnce({
//         data: {
//           data: moduleData,
//         },
//       })

//       const result = await createModule(createPayload)

//       expect(result).toEqual(moduleData)
//     })

//     it("throws when create request fails", async () => {
//       mockedApi.post.mockRejectedValueOnce(
//         new Error("Create failed")
//       )

//       await expect(
//         createModule(createPayload)
//       ).rejects.toThrow("Create failed")
//     })
//   })

//   describe("UPDATE - updateModule", () => {
//     it("updates a module", async () => {
//       mockedApi.put.mockResolvedValueOnce({
//         data: moduleData,
//       })

//       const result = await updateModule(updatePayload)

//       expect(mockedApi.put).toHaveBeenCalledWith(
//         "/v1/modules/1",
//         updatePayload
//       )

//       expect(result).toEqual(moduleData)
//     })

//     it("supports data response", async () => {
//       mockedApi.put.mockResolvedValueOnce({
//         data: {
//           data: moduleData,
//         },
//       })

//       const result = await updateModule(updatePayload)

//       expect(result).toEqual(moduleData)
//     })

//     it("throws when update request fails", async () => {
//       mockedApi.put.mockRejectedValueOnce(
//         new Error("Update failed")
//       )

//       await expect(
//         updateModule(updatePayload)
//       ).rejects.toThrow("Update failed")
//     })
//   })

//   describe("DELETE - deleteModule", () => {
//     it("deletes a module", async () => {
//       mockedApi.delete.mockResolvedValueOnce({
//         data: {},
//       })

//       await deleteModule(1)

//       expect(mockedApi.delete).toHaveBeenCalledWith(
//         "/v1/modules/1"
//       )
//     })

//     it("throws when delete request fails", async () => {
//       mockedApi.delete.mockRejectedValueOnce(
//         new Error("Delete failed")
//       )

//       await expect(
//         deleteModule(1)
//       ).rejects.toThrow("Delete failed")
//     })
//   })
// })


import { beforeEach, describe, expect, it, vi } from "vitest"

import api from "@/axios/axios"

import {
  getModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
} from "@/features/modules/services/moduleServices"

import type {
  CreateModulePayload,
  UpdateModulePayload,
  ModulesResponse,
} from "../moduleTypes"

vi.mock("@/axios/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockedApi = vi.mocked(api)

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

const modulesResponse: ModulesResponse = {
  success: true,
  data: [moduleData],
  pagination: {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
  },
}

const createPayload: CreateModulePayload = {
  module_code: "DONATION",
  module_name: "Donation Management",
  module_type: "feature",
  capacity_type: null,
  consumable_type: null,
  display_order: 1,
  status: "active",
}

const updatePayload: UpdateModulePayload = {
  ...createPayload,
  id: 1,
}

describe("moduleServices CRUD", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /* ------------------------------------------------------------------------ */
  /* READ - getModules                                                        */
  /* ------------------------------------------------------------------------ */

  describe("READ - getModules", () => {
    it("fetches modules with default pagination", async () => {
      mockedApi.get.mockResolvedValueOnce({
        data: modulesResponse,
      })

      const result = await getModules()

      expect(mockedApi.get).toHaveBeenCalledWith(
        "/v1/modules?page=1&limit=10"
      )

      expect(result).toEqual(modulesResponse)
    })

    it("fetches modules with custom pagination", async () => {
      const response: ModulesResponse = {
        ...modulesResponse,
        pagination: {
          page: 2,
          limit: 20,
          total: 21,
          totalPages: 2,
        },
      }

      mockedApi.get.mockResolvedValueOnce({
        data: response,
      })

      const result = await getModules(2, 20)

      expect(mockedApi.get).toHaveBeenCalledWith(
        "/v1/modules?page=2&limit=20"
      )

      expect(result).toEqual(response)
    })

    it("returns paginated module response", async () => {
      mockedApi.get.mockResolvedValueOnce({
        data: modulesResponse,
      })

      const result = await getModules(1, 10)

      expect(result.success).toBe(true)
      expect(result.data).toEqual([moduleData])
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      })
    })

    it("supports empty module data", async () => {
      const emptyResponse: ModulesResponse = {
        success: true,
        data: [],
        pagination: {
          page: 2,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      }

      mockedApi.get.mockResolvedValueOnce({
        data: emptyResponse,
      })

      const result = await getModules(2, 10)

      expect(result).toEqual(emptyResponse)
      expect(result.data).toEqual([])
    })

    it("throws when API request fails", async () => {
      mockedApi.get.mockRejectedValueOnce(
        new Error("Network error")
      )

      await expect(
        getModules()
      ).rejects.toThrow("Network error")
    })
  })

  /* ------------------------------------------------------------------------ */
  /* READ - getModuleById                                                     */
  /* ------------------------------------------------------------------------ */

  describe("READ - getModuleById", () => {
    it("fetches module by ID", async () => {
      mockedApi.get.mockResolvedValueOnce({
        data: moduleData,
      })

      const result = await getModuleById(1)

      expect(mockedApi.get).toHaveBeenCalledWith(
        "/v1/modules/1"
      )

      expect(result).toEqual(moduleData)
    })

    it("supports data response", async () => {
      mockedApi.get.mockResolvedValueOnce({
        data: {
          data: moduleData,
        },
      })

      const result = await getModuleById(1)

      expect(result).toEqual(moduleData)
    })

    it("supports module response", async () => {
      mockedApi.get.mockResolvedValueOnce({
        data: {
          module: moduleData,
        },
      })

      const result = await getModuleById(1)

      expect(result).toEqual(moduleData)
    })

    it("supports string ID", async () => {
      mockedApi.get.mockResolvedValueOnce({
        data: moduleData,
      })

      await getModuleById("1")

      expect(mockedApi.get).toHaveBeenCalledWith(
        "/v1/modules/1"
      )
    })
  })

  /* ------------------------------------------------------------------------ */
  /* CREATE - createModule                                                    */
  /* ------------------------------------------------------------------------ */

  describe("CREATE - createModule", () => {
    it("creates a module", async () => {
      mockedApi.post.mockResolvedValueOnce({
        data: moduleData,
      })

      const result = await createModule(
        createPayload
      )

      expect(mockedApi.post).toHaveBeenCalledWith(
        "/v1/modules",
        createPayload
      )

      expect(result).toEqual(moduleData)
    })

    it("supports data response", async () => {
      mockedApi.post.mockResolvedValueOnce({
        data: {
          data: moduleData,
        },
      })

      const result = await createModule(
        createPayload
      )

      expect(result).toEqual(moduleData)
    })

    it("supports module response", async () => {
      mockedApi.post.mockResolvedValueOnce({
        data: {
          module: moduleData,
        },
      })

      const result = await createModule(
        createPayload
      )

      expect(result).toEqual(moduleData)
    })

    it("throws when create request fails", async () => {
      mockedApi.post.mockRejectedValueOnce(
        new Error("Create failed")
      )

      await expect(
        createModule(createPayload)
      ).rejects.toThrow("Create failed")
    })
  })

  /* ------------------------------------------------------------------------ */
  /* UPDATE - updateModule                                                    */
  /* ------------------------------------------------------------------------ */

  describe("UPDATE - updateModule", () => {
    it("updates a module", async () => {
      mockedApi.put.mockResolvedValueOnce({
        data: moduleData,
      })

      const result = await updateModule(
        updatePayload
      )

      expect(mockedApi.put).toHaveBeenCalledWith(
        "/v1/modules/1",
        updatePayload
      )

      expect(result).toEqual(moduleData)
    })

    it("supports data response", async () => {
      mockedApi.put.mockResolvedValueOnce({
        data: {
          data: moduleData,
        },
      })

      const result = await updateModule(
        updatePayload
      )

      expect(result).toEqual(moduleData)
    })

    it("supports module response", async () => {
      mockedApi.put.mockResolvedValueOnce({
        data: {
          module: moduleData,
        },
      })

      const result = await updateModule(
        updatePayload
      )

      expect(result).toEqual(moduleData)
    })

    it("throws when update request fails", async () => {
      mockedApi.put.mockRejectedValueOnce(
        new Error("Update failed")
      )

      await expect(
        updateModule(updatePayload)
      ).rejects.toThrow("Update failed")
    })
  })

  /* ------------------------------------------------------------------------ */
  /* DELETE - deleteModule                                                    */
  /* ------------------------------------------------------------------------ */

  describe("DELETE - deleteModule", () => {
    it("deletes a module", async () => {
      mockedApi.delete.mockResolvedValueOnce({
        data: {},
      })

      await deleteModule(1)

      expect(
        mockedApi.delete
      ).toHaveBeenCalledWith(
        "/v1/modules/1"
      )
    })

    it("throws when delete request fails", async () => {
      mockedApi.delete.mockRejectedValueOnce(
        new Error("Delete failed")
      )

      await expect(
        deleteModule(1)
      ).rejects.toThrow("Delete failed")
    })
  })
})

