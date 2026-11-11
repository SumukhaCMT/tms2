import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { ServerCartItem } from "./pricingCart"

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [] as ServerCartItem[] },
  reducers: {
    setCartItems: (state, action: PayloadAction<ServerCartItem[]>) => {
      state.items = action.payload
    },
  },
})

export const { setCartItems } = cartSlice.actions

export default cartSlice.reducer
