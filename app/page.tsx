"use client"

import { Provider } from "react-redux"
import { store } from "@/store/store"
import { ThemeProvider } from "@/components/ThemeProvider"
import DataTableManager from "@/components/DataTableManager"
import { Box, CircularProgress } from "@mui/material"
import { useEffect, useState } from "react"

export default function Home() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <CircularProgress size={60} sx={{ color: "white" }} />
      </Box>
    )
  }

  return (
    <Provider store={store}>
      <ThemeProvider>
        <DataTableManager />
      </ThemeProvider>
    </Provider>
  )
}
