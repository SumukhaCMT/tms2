

import request from "supertest"

import {
  describe,
  expect,
  it,
} from "vitest"

import app from "../../../app"

describe("Modules API - CRUD", () => {
  let moduleId: number

  const uniqueId = Date.now()

  const moduleData = {
    module_code: `TEST_MODULE_${uniqueId}`,
    module_name: `Test Module ${uniqueId}`,
    module_type: "feature",
    capacity_type: null,
    consumable_type: null,
    display_order: 999,
    status: "active",
  }

  const updatedModuleName =
    `Updated Test Module ${uniqueId}`

  it("should create a module", async () => {
    const response = await request(app)
      .post("/api/v1/modules")
      .send(moduleData)

    expect(response.status).toBe(201)

    expect(response.body.success).toBe(true)

    expect(response.body.data).toHaveProperty("id")

    moduleId = response.body.data.id

    expect(moduleId).toBeGreaterThan(0)
  })

  // it("should get all modules", async () => {
  //   const response = await request(app)
  //     .get("/api/v1/modules")

  //   expect(response.status).toBe(200)

  //   expect(response.body.success).toBe(true)

  //   expect(Array.isArray(response.body.data))
  //     .toBe(true)
  // })
// pagibation 
  it("should get paginated modules", async () => {
  const response = await request(app)
    .get("/api/v1/modules?page=1&limit=10")

  expect(response.status).toBe(200)

  expect(response.body.success).toBe(true)

  expect(Array.isArray(response.body.data))
    .toBe(true)

  expect(response.body.pagination).toEqual(
    expect.objectContaining({
      page: 1,
      limit: 10,
      total: expect.any(Number),
      totalPages: expect.any(Number),
    }),
  )
})
it("should use default pagination", async () => {
  const response = await request(app)
    .get("/api/v1/modules")

  expect(response.status).toBe(200)

  expect(response.body.pagination.page)
    .toBe(1)

  expect(response.body.pagination.limit)
    .toBe(10)
})
it("should limit maximum page size", async () => {
  const response = await request(app)
    .get("/api/v1/modules?page=1&limit=1000")

  expect(response.status).toBe(200)

  expect(response.body.pagination.limit)
    .toBe(100)
})
  it("should get module by ID", async () => {
    const response = await request(app)
      .get(`/api/v1/modules/${moduleId}`)

    expect(response.status).toBe(200)

    expect(response.body.success).toBe(true)

    expect(response.body.data.id)
      .toBe(moduleId)

    expect(response.body.data.module_code)
      .toBe(moduleData.module_code)
  })

  it("should update a module", async () => {
    const response = await request(app)
      .put(`/api/v1/modules/${moduleId}`)
      .send({
        module_name: updatedModuleName,
      })

    expect(response.status).toBe(200)

    expect(response.body.success).toBe(true)

    expect(response.body.message)
      .toBe("Module updated successfully")
  })

  it("should verify module update", async () => {
    const response = await request(app)
      .get(`/api/v1/modules/${moduleId}`)

    expect(response.status).toBe(200)

    expect(response.body.data.module_name)
      .toBe(updatedModuleName)
  })

  it("should soft delete a module", async () => {
    const response = await request(app)
      .delete(`/api/v1/modules/${moduleId}`)

    expect(response.status).toBe(200)

    expect(response.body.success).toBe(true)

    expect(response.body.message)
      .toBe("Module deleted successfully")
  })

  it("should not return deleted module by ID", async () => {
    const response = await request(app)
      .get(`/api/v1/modules/${moduleId}`)

    expect(response.status).toBe(404)

    expect(response.body.success).toBe(false)

    expect(response.body.message)
      .toBe("Module not found")
  })

  it("should exclude deleted module from list", async () => {
    const response = await request(app)
      .get("/api/v1/modules")

    expect(response.status).toBe(200)

    expect(response.body.success).toBe(true)

    const deletedModule = response.body.data.find(
      (module: { id: number }) =>
        module.id === moduleId,
    )

    expect(deletedModule).toBeUndefined()
  })

  it("should reject invalid GET module ID", async () => {
    const response = await request(app)
      .get("/api/v1/modules/abc")

    expect(response.status).toBe(400)

    expect(response.body.success).toBe(false)

    expect(response.body.message)
      .toBe("Invalid module ID")
  })

  it("should reject invalid UPDATE module ID", async () => {
    const response = await request(app)
      .put("/api/v1/modules/abc")
      .send({
        module_name: "Invalid",
      })

    expect(response.status).toBe(400)

    expect(response.body.success).toBe(false)

    expect(response.body.message)
      .toBe("Invalid module ID")
  })

  it("should reject invalid DELETE module ID", async () => {
    const response = await request(app)
      .delete("/api/v1/modules/abc")

    expect(response.status).toBe(400)

    expect(response.body.success).toBe(false)

    expect(response.body.message)
      .toBe("Invalid module ID")
  })

  it("should return 404 for non-existing module", async () => {
    const response = await request(app)
      .get("/api/v1/modules/999999999")

    expect(response.status).toBe(404)

    expect(response.body.success).toBe(false)

    expect(response.body.message)
      .toBe("Module not found")
  })

  it("should return 404 when updating non-existing module", async () => {
    const response = await request(app)
      .put("/api/v1/modules/999999999")
      .send({
        module_name: "Does Not Exist",
      })

    expect(response.status).toBe(404)

    expect(response.body.success).toBe(false)

    expect(response.body.message)
      .toBe("Module not found")
  })

  it("should return 404 when deleting non-existing module", async () => {
    const response = await request(app)
      .delete("/api/v1/modules/999999999")

    expect(response.status).toBe(404)

    expect(response.body.success).toBe(false)

    expect(response.body.message)
      .toBe("Module not found")
  })

  it("should return 404 when deleting already deleted module", async () => {
    const response = await request(app)
      .delete(`/api/v1/modules/${moduleId}`)

    expect(response.status).toBe(404)

    expect(response.body.success).toBe(false)

    expect(response.body.message)
      .toBe("Module not found")
  })
})