"use client"

import { createContext, useContext, type ReactNode } from "react"
import { ThemeProvider as MUIThemeProvider, createTheme, CssBaseline } from "@mui/material"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/store/store"
import { toggleTheme } from "@/store/slices/uiSlice"

const ThemeContext = createContext<{
  toggleTheme: () => void
}>({
  toggleTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const dispatch = useDispatch()
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode)

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
      primary: {
        main: "#2563eb",
        light: "#3b82f6",
        dark: "#1d4ed8",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#7c3aed",
        light: "#8b5cf6",
        dark: "#6d28d9",
        contrastText: "#ffffff",
      },
      background: {
        default: isDarkMode ? "#0f172a" : "#f8fafc",
        paper: isDarkMode ? "#1e293b" : "#ffffff",
      },
      text: {
        primary: isDarkMode ? "#f1f5f9" : "#0f172a",
        secondary: isDarkMode ? "#94a3b8" : "#64748b",
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 700,
        fontSize: "2rem",
        lineHeight: 1.2,
      },
      h6: {
        fontWeight: 600,
        fontSize: "1.25rem",
      },
      button: {
        textTransform: "none",
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: "8px 16px",
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            },
          },
          contained: {
            background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: isDarkMode ? "0 10px 25px rgba(0,0,0,0.3)" : "0 10px 25px rgba(0,0,0,0.08)",
            border: isDarkMode ? "1px solid #334155" : "1px solid #e2e8f0",
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: isDarkMode ? "1px solid #334155" : "1px solid #e2e8f0",
            padding: "16px",
          },
          head: {
            fontWeight: 600,
            backgroundColor: isDarkMode ? "#1e293b" : "#f8fafc",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
          },
        },
      },
    },
  })

  const handleToggleTheme = () => {
    dispatch(toggleTheme())
  }

  return (
    <ThemeContext.Provider value={{ toggleTheme: handleToggleTheme }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  )
}
