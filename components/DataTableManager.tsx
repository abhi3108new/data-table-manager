"use client"

import type React from "react"

import { useState, useMemo } from "react"
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  Chip,
  useMediaQuery,
  useTheme as useMUITheme,
  Card,
  CardContent,
  Stack,
  Badge,
} from "@mui/material"
import {
  Search as SearchIcon,
  Add as AddIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  TableChart as TableIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/store/store"
import { setSearchTerm, setPage } from "@/store/slices/tableSlice"
import { useTheme } from "./ThemeProvider"
import DataTable from "./DataTable"
import ColumnManagerModal from "./ColumnManagerModal"
import ImportModal from "./ImportModal"
import AddRowModal from "./AddRowModal"
import { exportToCSV } from "@/utils/csvUtils"

export default function DataTableManager() {
  const dispatch = useDispatch()
  const muiTheme = useMUITheme()
  const { toggleTheme } = useTheme()
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"))

  const { data, searchTerm, visibleColumns } = useSelector((state: RootState) => state.table)
  const { isDarkMode } = useSelector((state: RootState) => state.ui)

  const [columnManagerOpen, setColumnManagerOpen] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [addRowModalOpen, setAddRowModalOpen] = useState(false)

  const filteredData = useMemo(() => {
    if (!searchTerm) return data

    return data.filter((row) =>
      Object.values(row).some((value) => value?.toString().toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [data, searchTerm])

  const visibleColumnCount = visibleColumns.filter((col) => col.visible).length

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(event.target.value))
    dispatch(setPage(0))
  }

  const handleExport = () => {
    const visibleData = filteredData.map((row) => {
      const filteredRow: any = {}
      visibleColumns.forEach((col) => {
        if (col.visible) {
          filteredRow[col.key] = row[col.key as keyof typeof row]
        }
      })
      return filteredRow
    })

    exportToCSV(visibleData, "table-data.csv")
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: isDarkMode
          ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
          : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Header Section */}
        <Card
          elevation={0}
          sx={{
            mb: 4,
            background: isDarkMode
              ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)"
              : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            border: `1px solid ${isDarkMode ? "#334155" : "#e2e8f0"}`,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
                    color: "white",
                  }}
                >
                  <TableIcon fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                    Data Table Manager
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Manage your data with powerful tools and beautiful interface
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  p: 2,
                  background: isDarkMode ? "#334155" : "#f1f5f9",
                  "&:hover": {
                    background: isDarkMode ? "#475569" : "#e2e8f0",
                  },
                }}
              >
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Box>

            {/* Stats Cards */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Card variant="outlined" sx={{ flex: 1, background: "transparent" }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {data.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Records
                  </Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ flex: 1, background: "transparent" }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" color="secondary" fontWeight="bold">
                    {visibleColumnCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Visible Columns
                  </Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ flex: 1, background: "transparent" }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" color="success.main" fontWeight="bold">
                    {filteredData.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Filtered Results
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Paper
          elevation={0}
          sx={{
            p: 0,
            borderRadius: 3,
            border: `1px solid ${isDarkMode ? "#334155" : "#e2e8f0"}`,
            overflow: "hidden",
          }}
        >
          {/* Toolbar */}
          <Box
            sx={{
              p: 3,
              background: isDarkMode ? "#1e293b" : "#f8fafc",
              borderBottom: `1px solid ${isDarkMode ? "#334155" : "#e2e8f0"}`,
            }}
          >
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
              {/* Search */}
              <Box sx={{ position: "relative", flex: 1, maxWidth: { md: 400 } }}>
                <SearchIcon
                  sx={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "text.secondary",
                    zIndex: 1,
                  }}
                />
                <TextField
                  fullWidth
                  placeholder="Search across all fields..."
                  value={searchTerm}
                  onChange={handleSearch}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      pl: 5,
                      background: isDarkMode ? "#334155" : "#ffffff",
                    },
                  }}
                />
              </Box>

              {/* Action Buttons */}
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setAddRowModalOpen(true)}
                  size={isMobile ? "small" : "medium"}
                >
                  Add Row
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={() => setImportModalOpen(true)}
                  size={isMobile ? "small" : "medium"}
                >
                  Import
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExport}
                  size={isMobile ? "small" : "medium"}
                >
                  Export
                </Button>
                <Badge badgeContent={visibleColumnCount} color="primary">
                  <Button
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                    onClick={() => setColumnManagerOpen(true)}
                    size={isMobile ? "small" : "medium"}
                  >
                    Columns
                  </Button>
                </Badge>
              </Stack>
            </Stack>

            {/* Active Filters */}
            {searchTerm && (
              <Box mt={2}>
                <Chip
                  icon={<FilterIcon />}
                  label={`Search: "${searchTerm}"`}
                  onDelete={() => dispatch(setSearchTerm(""))}
                  color="primary"
                  variant="outlined"
                  sx={{
                    background: isDarkMode ? "#334155" : "#ffffff",
                    "& .MuiChip-deleteIcon": {
                      color: "primary.main",
                    },
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Data Table */}
          <Box sx={{ p: 3 }}>
            <DataTable data={filteredData} />
          </Box>
        </Paper>

        {/* Modals */}
        <ColumnManagerModal open={columnManagerOpen} onClose={() => setColumnManagerOpen(false)} />
        <ImportModal open={importModalOpen} onClose={() => setImportModalOpen(false)} />
        <AddRowModal open={addRowModalOpen} onClose={() => setAddRowModalOpen(false)} />
      </Container>
    </Box>
  )
}
