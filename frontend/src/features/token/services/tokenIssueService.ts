// import api from "@/axios/axios";
// import type {
//   IssueTokenPayload,
//   IssuedToken,
// } from "../tokenTypes";

// interface IssuedTokenApiResponse {
//   success?: boolean;
//   message?: string;
//   data: IssuedToken;
// }

// export const createTokenIssueApi = async (
//   payload: IssueTokenPayload,
// ): Promise<IssuedToken> => {
//   const response = await api.post<IssuedTokenApiResponse>(
//     "/v1/issued-tokens/",
//     payload,
//   );

//   return response.data.data;
// };


// import api from "@/axios/axios";

// import type {
//   IssueTokenPayload,
//   IssuedToken,
// } from "../tokenTypes";

// interface IssuedTokenApiResponse {
//   success?: boolean;
//   message?: string;
//   data: IssuedToken;
// }

// export const createTokenIssueApi = async (
//   payload: IssueTokenPayload,
// ): Promise<IssuedToken> => {
//   const response = await api.post<IssuedTokenApiResponse>(
//     "/v1/issued-tokens/",
//     payload,
//   );

//   return response.data.data;
// };

// export const printTokenReceiptApi = async (
//   id: number,
// ): Promise<string> => {
//   const response = await api.get<string>(
//     `/v1/issued-tokens/${id}/print`,
//     {
//       responseType: "text",
//       headers: {
//         Accept: "text/html",
//       },
//     },
//   );

//   return response.data;
// };


import api from "@/axios/axios";
import type {
  IssueTokenPayload,
 
} from "../tokenTypes";

interface IssuedTokenApiResponse {
  success?: boolean;
  message?: string;
  data: IssuedToken;
}
import type {
  IssuedToken,
  
  IssuedTokensApiResponse,
  IssuedTokensListResult,
  FetchIssuedTokensParams,
} from "../tokenTypes";

const API_URL = "/v1/issued-tokens";

export const getIssuedTokensApi = async (
  params: FetchIssuedTokensParams,
): Promise<IssuedTokensListResult> => {
  const response = await api.get<IssuedTokensApiResponse>(API_URL, {
    params: {
      page: params.page,
      limit: params.limit,
      ...(params.search?.trim()
        ? { search: params.search.trim() }
        : {}),
      ...(params.temple_id ? { temple_id: params.temple_id } : {}),
      ...(params.token_status
        ? { token_status: params.token_status }
        : {}),
      ...(params.from_date ? { from_date: params.from_date } : {}),
      ...(params.to_date ? { to_date: params.to_date } : {}),
    },
  });

  const result = response.data;

  return {
    items: result.data,
    pagination: result.pagination ?? {
      page: params.page,
      limit: params.limit,
      total: result.data.length,
      totalPages: Math.max(
        1,
        Math.ceil(result.data.length / params.limit),
      ),
    },
  };
};
export const createTokenIssueApi = async (
  payload: IssueTokenPayload,
): Promise<IssuedToken> => {
  const response = await api.post<IssuedTokenApiResponse>(
    "/v1/issued-tokens/",
    payload,
  );

  return response.data.data;
};
export const getIssuedTokenByIdApi = async (
  id: number,
): Promise<IssuedToken> => {
  const response = await api.get<IssuedTokenApiResponse>(
    `${API_URL}/${id}`,
  );

  return response.data.data;
};

export const printTokenReceiptApi = async (
  id: number,
): Promise<string> => {
  const response = await api.get<string>(
    `${API_URL}/${id}/print`,
    {
      responseType: "text",
      headers: { Accept: "text/html" },
    },
  );

  return response.data;
};