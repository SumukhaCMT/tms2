import type {
  Temple,
  TempleFormData,
  TempleApiResponse,
} from "../templeTypes";
import api from "@/axios/axios";

const API_URL = "/v1/temples";


/**
 * Extract API response data.
 *
 * Supports both:
 *
 * {
 *   success: true,
 *   message: "...",
 *   data: {...}
 * }
 *
 * and direct response:
 *
 * {...}
 */
const extractData = <T>(
  responseData: TempleApiResponse<T> | T,
): T => {
  if (
    responseData &&
    typeof responseData === "object" &&
    "data" in responseData &&
    "success" in responseData
  ) {
    return (
      responseData as TempleApiResponse<T>
    ).data
  }

  return responseData as T
}

export const templeService = {
  /**
   * Get all temples
   */
  async getTemples(search?: string): Promise<Temple[]> {
    const response = await api.get(API_URL, { params: search ? { search } : undefined });

    const data = extractData<
      Temple[] | { temples?: Temple[] }
    >(response.data)

    if (Array.isArray(data)) {
      return data
    }

    return data.temples ?? []
  },

  async getTemple(id: number): Promise<Temple> {
    const response = await api.get(`${API_URL}/${id}`);

    return extractData<Temple>(
      response.data,
    )
  },

  /**
   * Create temple
   */
  async createTemple(
    payload: TempleFormData,
  ): Promise<Temple> {
    const response = await api.post(
      API_URL,
      payload
    );

    return extractData<Temple>(
      response.data,
    )
  },

 
   async updateTemple(
    id: number,
    payload: Partial<TempleFormData>,
  ): Promise<Temple> {
    const response = await api.put(
      `${API_URL}/${id}`,
      payload);

    console.log(
      "API UPDATE RESPONSE:",
      response.data,
    )

    return extractData<Temple>(
      response.data,
    )
  },

  async deleteTemple(id: number): Promise<void> {
    await api.delete(`${API_URL}/${id}`)
  },
}