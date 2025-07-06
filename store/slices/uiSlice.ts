import { createSlice } from "@reduxjs/toolkit"

interface UIState {
  isDarkMode: boolean
}

const initialState: UIState = {
  isDarkMode: false,
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode
    },
  },
})

export const { toggleTheme } = uiSlice.actions
export default uiSlice.reducer
