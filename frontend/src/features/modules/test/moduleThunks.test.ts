
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest"

import {
  getModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
} from "@/features/modules/services/moduleServices"

import {
  fetchModules,
  fetchModuleById,
  addModule,
  editModule,
  removeModule,
} from "@/features/modules/moduleThunks"

import type { ModulesResponse } from "@/features/modules/moduleTypes"

vi.mock("@/features/modules/services/moduleServices", () => ({
  getModules: vi.fn(),
  getModuleById: vi.fn(),
  createModule: vi.fn(),
  updateModule: vi.fn(),
  deleteModule: vi.fn(),
}))

const mockedGetModules = vi.mocked(getModules)
const mockedGetModuleById = vi.mocked(getModuleById)
const mockedCreateModule = vi.mocked(createModule)
const mockedUpdateModule = vi.mocked(updateModule)
const mockedDeleteModule = vi.mocked(deleteModule)

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

const createPayload = {
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

describe("moduleThunks CRUD", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("fetchModules", () => {
    it("returns modules on success", async () => {
      mockedGetModules.mockResolvedValueOnce(
        modulesResponse
      )

      const dispatch = vi.fn()
      const getState = vi.fn()

      const result = await fetchModules({
        page: 1,
        limit: 10,
      })(
        dispatch,
        getState,
        undefined
      )

      expect(result.payload).toEqual(
        modulesResponse
      )

      expect(
        mockedGetModules
      ).toHaveBeenCalledWith(1, 10)
    })

    it("returns rejected value on failure", async () => {
      mockedGetModules.mockRejectedValueOnce(
        new Error("Network error")
      )

      const result = await fetchModules({
        page: 1,
        limit: 10,
      })(
        vi.fn(),
        vi.fn(),
        undefined
      )

      expect(result.payload).toBe(
        "Network error"
      )
    })
  })

  describe("fetchModuleById", () => {
    it("fetches module by ID", async () => {
      mockedGetModuleById.mockResolvedValueOnce(
        moduleData
      )

      const result = await fetchModuleById(1)(
        vi.fn(),
        vi.fn(),
        undefined
      )

      expect(result.payload).toEqual(
        moduleData
      )

      expect(
        mockedGetModuleById
      ).toHaveBeenCalledWith(1)
    })

    it("handles failure", async () => {
      mockedGetModuleById.mockRejectedValueOnce(
        new Error("Module not found")
      )

      const result = await fetchModuleById(1)(
        vi.fn(),
        vi.fn(),
        undefined
      )

      expect(result.payload).toBe(
        "Module not found"
      )
    })
  })

  describe("addModule", () => {
    it("creates module successfully", async () => {
      mockedCreateModule.mockResolvedValueOnce(
        moduleData
      )

      const result = await addModule(
        createPayload
      )(
        vi.fn(),
        vi.fn(),
        undefined
      )

      expect(result.payload).toEqual(
        moduleData
      )

      expect(
        mockedCreateModule
      ).toHaveBeenCalledWith(
        createPayload
      )
    })

    it("handles create failure", async () => {
      mockedCreateModule.mockRejectedValueOnce(
        new Error("Create failed")
      )

      const result = await addModule(
        createPayload
      )(
        vi.fn(),
        vi.fn(),
        undefined
      )

      expect(result.payload).toBe(
        "Create failed"
      )
    })
  })

  describe("editModule", () => {
    it("updates module successfully", async () => {
      const payload = {
        ...createPayload,
        id: 1,
        module_name: "Updated Module",
      }

      const updatedModule = {
        ...moduleData,
        module_name: "Updated Module",
      }

      mockedUpdateModule.mockResolvedValueOnce(
        updatedModule
      )

      const result = await editModule(payload)(
        vi.fn(),
        vi.fn(),
        undefined
      )

      expect(result.payload).toEqual(
        updatedModule
      )

      expect(
        mockedUpdateModule
      ).toHaveBeenCalledWith(payload)
    })

    it("handles update failure", async () => {
      mockedUpdateModule.mockRejectedValueOnce(
        new Error("Update failed")
      )

      const payload = {
        ...createPayload,
        id: 1,
      }

      const result = await editModule(payload)(
        vi.fn(),
        vi.fn(),
        undefined
      )

      expect(result.payload).toBe(
        "Update failed"
      )
    })
  })

  describe("removeModule", () => {
    it("deletes module successfully", async () => {
      mockedDeleteModule.mockResolvedValueOnce()

      const result = await removeModule(1)(
        vi.fn(),
        vi.fn(),
        undefined
      )

      expect(result.payload).toBe(1)

      expect(
        mockedDeleteModule
      ).toHaveBeenCalledWith(1)
    })

    it("handles delete failure", async () => {
      mockedDeleteModule.mockRejectedValueOnce(
        new Error("Delete failed")
      )

      const result = await removeModule(1)(
        vi.fn(),
        vi.fn(),
        undefined
      )

      expect(result.payload).toBe(
        "Delete failed"
      )
    })
  })
})

