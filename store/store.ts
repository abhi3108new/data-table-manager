import { configureStore } from "@reduxjs/toolkit"
import tableSlice from "./slices/tableSlice"
import uiSlice from "./slices/uiSlice"

/* ---------- localStorage helpers ---------- */
const STORAGE_KEY = "table_manager_state"

function loadState() {
  if (typeof window === "undefined") return undefined
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

function saveState(state: RootState) {
  try {
    const serialised = JSON.stringify({
      table: state.table,
      ui: state.ui,
    })
    localStorage.setItem(STORAGE_KEY, serialised)
  } catch {
    /* ignore write errors */
  }
}
/* ------------------------------------------ */

export const store = configureStore({
  reducer: {
    table: tableSlice,
    ui: uiSlice,
  },
  preloadedState: loadState(),
})

if (typeof window !== "undefined") {
  // throttle to every 1 s so we don't hammer localStorage
  let timeout: ReturnType<typeof setTimeout> | null = null
  store.subscribe(() => {
    if (timeout) return
    timeout = setTimeout(() => {
      saveState(store.getState())
      timeout = null
    }, 1000)
  })
}

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
