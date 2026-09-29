import { systemDefaultsRepository } from "../repositoriers/systemDefaultsRepository"

import type {
  CreateSystemDefaultPayload,
  UpdateSystemDefaultPayload,
  SystemDefaultListParams,
} from "../systemDefaultsTypes"

export const systemDefaultsService = {
  async getAll(params: SystemDefaultListParams) {
    return systemDefaultsRepository.findAll(params)
  },

  async getById(id: number) {
    const systemDefault =
      await systemDefaultsRepository.findById(id)

    if (!systemDefault) {
      throw new Error("System default not found")
    }

    return systemDefault
  },

  async getByKey(keyName: string) {
    const systemDefault =
      await systemDefaultsRepository.findByKey(keyName)

    if (!systemDefault) {
      throw new Error("System default not found")
    }

    return systemDefault
  },

  async create(data: CreateSystemDefaultPayload) {
    const existing =
      await systemDefaultsRepository.findByKey(
        data.key_name,
      )

    if (existing) {
      throw new Error(
        "System default key already exists",
      )
    }

    return systemDefaultsRepository.create(data)
  },

  async update(
    id: number,
    data: UpdateSystemDefaultPayload,
  ) {
    await this.getById(id)

    return systemDefaultsRepository.update(
      id,
      data,
    )
  },

  async delete(id: number) {
    await this.getById(id)

    return systemDefaultsRepository.delete(id)
  },
}