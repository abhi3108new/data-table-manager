"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Box,
  TextField,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Avatar,
  Tooltip,
} from "@mui/material"
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowUpward,
  ArrowDownward,
  Person as PersonIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/store/store"
import { setPage, setRowsPerPage, setSortConfig, updateRow, deleteRow } from "@/store/slices/tableSlice"
import { useForm, Controller } from "react-hook-form"
import ConfirmDialog from "./ConfirmDialog"
import type { TableData } from "@/types/table"

interface DataTableProps {
  data: TableData[]
}

export default function DataTable({ data }: DataTableProps) {
  const dispatch = useDispatch()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const { page, rowsPerPage, sortConfig, visibleColumns } = useSelector((state: RootState) => state.table)

  const [editingRows, setEditingRows] = useState<Set<string>>(new Set())
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [rowToDelete, setRowToDelete] = useState<string | null>(null)

  const { control, handleSubmit, reset, getValues } = useForm()

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof TableData]
      const bVal = b[sortConfig.key as keyof TableData]

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1
      return 0
    })
  }, [data, sortConfig])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage
    return sortedData.slice(startIndex, startIndex + rowsPerPage)
  }, [sortedData, page, rowsPerPage])

  const handleSort = (columnKey: string) => {
    const newDirection = sortConfig.key === columnKey && sortConfig.direction === "asc" ? "desc" : "asc"
    dispatch(setSortConfig({ key: columnKey, direction: newDirection }))
  }

  const handleEdit = (rowId: string) => {
    setEditingRows((prev) => new Set([...prev, rowId]))
    const row = data.find((r) => r.id === rowId)
    if (row) {
      reset(row)
    }
  }

  const handleSave = (rowId: string) => {
    handleSubmit((formData) => {
      dispatch(updateRow({ id: rowId, data: formData }))
      setEditingRows((prev) => {
        const newSet = new Set(prev)
        newSet.delete(rowId)
        return newSet
      })
    })()
  }

  const handleCancel = (rowId: string) => {
    setEditingRows((prev) => {
      const newSet = new Set(prev)
      newSet.delete(rowId)
      return newSet
    })
    reset()
  }

  const handleDelete = (rowId: string) => {
    setRowToDelete(rowId)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (rowToDelete) {
      dispatch(deleteRow(rowToDelete))
      setRowToDelete(null)
    }
    setDeleteConfirmOpen(false)
  }

  const handleSaveAll = () => {
    const formData = getValues()
    editingRows.forEach((rowId) => {
      dispatch(updateRow({ id: rowId, data: formData }))
    })
    setEditingRows(new Set())
  }

  const handleCancelAll = () => {
    setEditingRows(new Set())
    reset()
  }

  const visibleColumnsOnly = visibleColumns.filter((col) => col.visible)

  const getFieldIcon = (key: string) => {
    switch (key) {
      case "name":
        return <PersonIcon fontSize="small" />
      case "email":
        return <EmailIcon fontSize="small" />
      case "role":
        return <WorkIcon fontSize="small" />
      case "location":
        return <LocationIcon fontSize="small" />
      default:
        return null
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (isMobile) {
    // Mobile card view
    return (
      <Box>
        {editingRows.size > 0 && (
          <Card sx={{ mb: 3, background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)" }}>
            <CardContent>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveAll} size="small">
                  Save All
                </Button>
                <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleCancelAll} size="small">
                  Cancel All
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}

        <Stack spacing={2}>
          {paginatedData.map((row) => (
            <Card
              key={row.id}
              elevation={0}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  boxShadow: theme.shadows[4],
                  transform: "translateY(-2px)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Header with Avatar */}
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    sx={{
                      mr: 2,
                      background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
                      width: 48,
                      height: 48,
                    }}
                  >
                    {getInitials(row.name)}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="h6" fontWeight="bold">
                      {row.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {row.email}
                    </Typography>
                  </Box>
                </Box>

                {/* Fields */}
                <Stack spacing={2}>
                  {visibleColumnsOnly
                    .filter((col) => col.key !== "name" && col.key !== "email")
                    .map((column) => (
                      <Box key={column.key} display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={1}>
                          {getFieldIcon(column.key)}
                          <Typography variant="body2" fontWeight="medium" color="text.secondary">
                            {column.label}:
                          </Typography>
                        </Box>
                        <Box>
                          {editingRows.has(row.id) ? (
                            <Controller
                              name={column.key}
                              control={control}
                              defaultValue={row[column.key as keyof TableData]}
                              rules={
                                column.key === "age"
                                  ? {
                                      pattern: { value: /^\d+$/, message: "Age must be a number" },
                                    }
                                  : {}
                              }
                              render={({ field, fieldState }) => (
                                <TextField
                                  {...field}
                                  size="small"
                                  error={!!fieldState.error}
                                  helperText={fieldState.error?.message}
                                  sx={{ minWidth: 120 }}
                                />
                              )}
                            />
                          ) : (
                            <Chip label={row[column.key as keyof TableData] || "N/A"} size="small" variant="outlined" />
                          )}
                        </Box>
                      </Box>
                    ))}
                </Stack>

                {/* Actions */}
                <Box
                  display="flex"
                  justifyContent="flex-end"
                  gap={1}
                  mt={3}
                  pt={2}
                  borderTop={`1px solid ${theme.palette.divider}`}
                >
                  {editingRows.has(row.id) ? (
                    <>
                      <Tooltip title="Save Changes">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleSave(row.id)}
                          sx={{
                            background: "rgba(37, 99, 235, 0.1)",
                            "&:hover": { background: "rgba(37, 99, 235, 0.2)" },
                          }}
                        >
                          <SaveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancel Changes">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleCancel(row.id)}
                          sx={{
                            background: "rgba(124, 58, 237, 0.1)",
                            "&:hover": { background: "rgba(124, 58, 237, 0.2)" },
                          }}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Tooltip title="Edit Row">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(row.id)}
                          sx={{
                            background: "rgba(37, 99, 235, 0.1)",
                            "&:hover": { background: "rgba(37, 99, 235, 0.2)" },
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Row">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(row.id)}
                          sx={{
                            background: "rgba(239, 68, 68, 0.1)",
                            "&:hover": { background: "rgba(239, 68, 68, 0.2)" },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>

        <Box mt={3}>
          <TablePagination
            component="div"
            count={data.length}
            page={page}
            onPageChange={(_, newPage) => dispatch(setPage(newPage))}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => dispatch(setRowsPerPage(Number.parseInt(e.target.value, 10)))}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Box>

        <ConfirmDialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Row"
          content="Are you sure you want to delete this row? This action cannot be undone."
        />
      </Box>
    )
  }

  // Desktop table view
  return (
    <Box>
      {editingRows.size > 0 && (
        <Card sx={{ mb: 3, background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)" }}>
          <CardContent>
            <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                {editingRows.size} row(s) being edited
              </Typography>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveAll}>
                Save All Changes
              </Button>
              <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleCancelAll}>
                Cancel All Changes
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      <TableContainer sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {visibleColumnsOnly.map((column) => (
                <TableCell
                  key={column.key}
                  sortDirection={sortConfig.key === column.key ? sortConfig.direction : false}
                  sx={{
                    fontWeight: 600,
                    background: theme.palette.mode === "dark" ? "#1e293b" : "#f8fafc",
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    sx={{
                      cursor: "pointer",
                      userSelect: "none",
                      "&:hover": { color: "primary.main" },
                    }}
                    onClick={() => handleSort(column.key)}
                  >
                    {getFieldIcon(column.key)}
                    <Typography variant="subtitle2" sx={{ ml: 1, mr: 1 }}>
                      {column.label}
                    </Typography>
                    {sortConfig.key === column.key &&
                      (sortConfig.direction === "asc" ? (
                        <ArrowUpward fontSize="small" color="primary" />
                      ) : (
                        <ArrowDownward fontSize="small" color="primary" />
                      ))}
                  </Box>
                </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow
                key={row.id}
                hover
                onDoubleClick={() => !editingRows.has(row.id) && handleEdit(row.id)}
                sx={{
                  cursor: editingRows.has(row.id) ? "default" : "pointer",
                  "&:hover": {
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                  },
                  backgroundColor:
                    index % 2 === 0
                      ? "transparent"
                      : theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.02)"
                        : "rgba(0,0,0,0.01)",
                }}
              >
                {visibleColumnsOnly.map((column) => (
                  <TableCell key={column.key}>
                    {editingRows.has(row.id) ? (
                      <Controller
                        name={column.key}
                        control={control}
                        defaultValue={row[column.key as keyof TableData]}
                        rules={
                          column.key === "age"
                            ? {
                                pattern: { value: /^\d+$/, message: "Age must be a number" },
                              }
                            : {}
                        }
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            size="small"
                            fullWidth
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />
                    ) : (
                      <Box display="flex" alignItems="center" gap={1}>
                        {column.key === "name" && (
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
                              fontSize: "0.875rem",
                            }}
                          >
                            {getInitials(row.name)}
                          </Avatar>
                        )}
                        <Typography variant="body2">{row[column.key as keyof TableData] || "N/A"}</Typography>
                      </Box>
                    )}
                  </TableCell>
                ))}
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    {editingRows.has(row.id) ? (
                      <>
                        <Tooltip title="Save Changes">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleSave(row.id)}
                            sx={{
                              background: "rgba(37, 99, 235, 0.1)",
                              "&:hover": { background: "rgba(37, 99, 235, 0.2)" },
                            }}
                          >
                            <SaveIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel Changes">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleCancel(row.id)}
                            sx={{
                              background: "rgba(124, 58, 237, 0.1)",
                              "&:hover": { background: "rgba(124, 58, 237, 0.2)" },
                            }}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <>
                        <Tooltip title="Edit Row (Double-click row)">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(row.id)}
                            sx={{
                              background: "rgba(37, 99, 235, 0.1)",
                              "&:hover": { background: "rgba(37, 99, 235, 0.2)" },
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Row">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(row.id)}
                            sx={{
                              background: "rgba(239, 68, 68, 0.1)",
                              "&:hover": { background: "rgba(239, 68, 68, 0.2)" },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={3}>
        <TablePagination
          component="div"
          count={data.length}
          page={page}
          onPageChange={(_, newPage) => dispatch(setPage(newPage))}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => dispatch(setRowsPerPage(Number.parseInt(e.target.value, 10)))}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Box>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Row"
        content="Are you sure you want to delete this row? This action cannot be undone."
      />
    </Box>
  )
}
