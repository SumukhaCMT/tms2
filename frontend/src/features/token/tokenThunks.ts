
import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  createTokenApi,
  deleteTokenApi,
  getTokenByIdApi,
  getTokensApi,
  updateTokenApi,
} from "./services/tokenServices";

import { createTokenIssueApi } from "./services/tokenIssueService";
import { printTokenReceiptApi } from "./services/tokenIssueService";
import {
  getIssuedTokensApi,
  getIssuedTokenByIdApi,
} from "./services/tokenIssueService";
import type {
  CreateTokenPayload,
  FetchTokensParams,
  Token,
  TokensListResult,
  UpdateTokenPayload,
  IssueTokenPayload,
  IssuedToken,
   FetchIssuedTokensParams,
  IssuedTokensListResult,
} from "./tokenTypes";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const getErrorMessage = (error: unknown): string => {
  if (typeof error !== "object" || error === null) {
    return "Something went wrong.";
  }

  const err = error as ApiError;

  return (
    err.response?.data?.message ??
    err.message ??
    "Something went wrong."
  );
};

export const fetchTokens = createAsyncThunk<
  TokensListResult,
  FetchTokensParams,
  { rejectValue: string }
>("tokens/fetchTokens", async (params, { rejectWithValue }) => {
  try {
    return await getTokensApi(params);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchTokenById = createAsyncThunk<
  Token,
  number,
  { rejectValue: string }
>("tokens/fetchTokenById", async (id, { rejectWithValue }) => {
  try {
    return await getTokenByIdApi(id);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// Create a master token.
export const createToken = createAsyncThunk<
  Token,
  CreateTokenPayload,
  { rejectValue: string }
>("tokens/createToken", async (payload, { rejectWithValue }) => {
  try {
    return await createTokenApi(payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// Issue an existing master token.
export const createTokenIssue = createAsyncThunk<
  IssuedToken,
  IssueTokenPayload,
  { rejectValue: string }
>("tokens/createTokenIssue", async (payload, { rejectWithValue }) => {
  try {
    return await createTokenIssueApi(payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateToken = createAsyncThunk<
  Token,
  { id: number; payload: UpdateTokenPayload },
  { rejectValue: string }
>("tokens/updateToken", async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await updateTokenApi(id, payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteToken = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("tokens/deleteToken", async (id, { rejectWithValue }) => {
  try {
    await deleteTokenApi(id);
    return id;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const printTokenReceipt = createAsyncThunk<
  string,
  number,
  { rejectValue: string }
>("tokens/printTokenReceipt", async (id, { rejectWithValue }) => {
  try {
    return await printTokenReceiptApi(id);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchIssuedTokens = createAsyncThunk<
  IssuedTokensListResult,
  FetchIssuedTokensParams,
  { rejectValue: string }
>(
  "tokens/fetchIssuedTokens",
  async (params, { rejectWithValue }) => {
    try {
      return await getIssuedTokensApi(params);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchIssuedTokenById = createAsyncThunk<
  IssuedToken,
  number,
  { rejectValue: string }
>(
  "tokens/fetchIssuedTokenById",
  async (id, { rejectWithValue }) => {
    try {
      return await getIssuedTokenByIdApi(id);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);