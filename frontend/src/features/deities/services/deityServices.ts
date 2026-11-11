
import api from "@/axios/axios";

import type { CreateDeityPayload, Deity, DeitiesApiResponse, DeityApiResponse, UpdateDeityPayload,} from "../deityTypes";
const API_URL = "/v1/deities";
export const getDeitiesApi = async (): Promise<Deity[]> => {
  const response = await api.get<DeitiesApiResponse>(API_URL);
  return response.data.data;
};

export const getDeityByIdApi = async (
  id: number
): Promise<Deity> => {
  const response = await api.get<DeityApiResponse>(
    `${API_URL}/${id}`
  );
  return response.data.data;
};

export const createDeityApi = async (
  payload: CreateDeityPayload
): Promise<Deity> => {
  const response = await api.post<DeityApiResponse>(
    API_URL,
    payload
  );
  return response.data.data;
};

export const updateDeityApi = async (
  id: number,
  payload: UpdateDeityPayload
): Promise<Deity> => {
  const response = await api.put<DeityApiResponse>(
    `${API_URL}/${id}`,
    payload
  );
  return response.data.data;
};

export const deleteDeityApi = async (
  id: number
): Promise<void> => {
  await api.delete(`${API_URL}/${id}`);
};