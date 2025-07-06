"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Stack,
  Chip,
} from "@mui/material"
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from "@mui/icons-material"
import { useDispatch } from "react-redux"
import { importData } from "@/store/slices/tableSlice"
import Papa from "papaparse"

interface ImportModalProps {
  open: boolean
  onClose: () => void
}

interface ImportError {
  row: number
  field: string
  message: string
}

export default function ImportModal({ open, onClose }: ImportModalProps) {
  const dispatch = useDispatch()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<ImportError[]>([])
  const [success, setSuccess] = useState(false)
  const [importStats, setImportStats] = useState<{
    total: number
    valid: number
    invalid: number
  } | null>(null)

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const validateRow = (row: any, index: number): ImportError[] => {
    const errors: ImportError[] = []

    // Check required fields
    if (!row.name?.trim()) {
      errors.push({ row: index + 1, field: "name", message: "Name is required" })
    }

    if (!row.email?.trim()) {
      errors.push({ row: index + 1, field: "email", message: "Email is required" })
    } else if (!/\S+@\S+\.\S+/.test(row.email)) {
      errors.push({ row: index + 1, field: "email", message: "Invalid email format" })
    }

    if (row.age && (isNaN(Number(row.age)) || Number(row.age) < 0)) {
      errors.push({ row: index + 1, field: "age", message: "Age must be a valid positive number" })
    }

    return errors
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setErrors([{ row: 0, field: "file", message: "Please select a valid CSV file" }])
      return
    }

    setIsLoading(true)
    setErrors([])
    setSuccess(false)
    setImportStats(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validationErrors: ImportError[] = []
        const validRows: any[] = []

        results.data.forEach((row: any, index) => {
          const rowErrors = validateRow(row, index)
          validationErrors.push(...rowErrors)

          if (rowErrors.length === 0) {
            validRows.push({
              id: `imported_${Date.now()}_${index}`,
              name: row.name?.trim() || "",
              email: row.email?.trim() || "",
              age: row.age ? Number(row.age) : "",
              role: row.role?.trim() || "",
              department: row.department?.trim() || "",
              location: row.location?.trim() || "",
            })
          }
        })

        setImportStats({
          total: results.data.length,
          valid: validRows.length,
          invalid: results.data.length - validRows.length,
        })

        if (validationErrors.length > 0) {
          setErrors(validationErrors)
        } else {
          dispatch(importData(validRows))
          setSuccess(true)
          setTimeout(() => {
            onClose()
            setSuccess(false)
            setImportStats(null)
          }, 2000)
        }

        setIsLoading(false)
      },
      error: (error) => {
        setErrors([{ row: 0, field: "file", message: `Failed to parse CSV: ${error.message}` }])
        setIsLoading(false)
      },
    })

    // Reset file input
    event.target.value = ""
  }

  const handleClose = () => {
    setErrors([])
    setSuccess(false)
    setImportStats(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <UploadIcon color="primary" />
          <Box>
            <Typography variant="h6">Import CSV Data</Typography>
            <Typography variant="body2" color="text.secondary">
              Upload a CSV file to import data into your table
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Upload Area */}
        <Card
          variant="outlined"
          sx={{
            mb: 3,
            background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
            border: "2px dashed #3b82f6",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              borderColor: "#2563eb",
              transform: "translateY(-2px)",
            },
          }}
          onClick={handleFileSelect}
        >
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: "none" }}
            />

            <UploadIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Select CSV File
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Click here to browse and select your CSV file
            </Typography>
            <Button variant="contained" startIcon={<UploadIcon />} disabled={isLoading} sx={{ mt: 2 }}>
              Choose File
            </Button>
          </CardContent>
        </Card>

        {/* Expected Format */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom display="flex" alignItems="center" gap={1}>
              <InfoIcon color="info" />
              Expected CSV Format
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {["name", "email", "age", "role", "department", "location"].map((field) => (
                <Chip
                  key={field}
                  label={field}
                  size="small"
                  variant="outlined"
                  color={field === "name" || field === "email" ? "primary" : "default"}
                />
              ))}
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <strong>Required:</strong> name, email | <strong>Optional:</strong> age, role, department, location
            </Typography>
          </CardContent>
        </Card>

        {/* Loading */}
        {isLoading && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="body2" gutterBottom>
                Processing file...
              </Typography>
              <LinearProgress />
            </CardContent>
          </Card>
        )}

        {/* Import Stats */}
        {importStats && (
          <Card sx={{ mb: 3, background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom display="flex" alignItems="center" gap={1}>
                <CheckIcon color="success" />
                Import Summary
              </Typography>
              <Stack direction="row" spacing={3}>
                <Box textAlign="center">
                  <Typography variant="h6" color="text.primary" fontWeight="bold">
                    {importStats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Rows
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h6" color="success.main" fontWeight="bold">
                    {importStats.valid}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Valid
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h6" color="error.main" fontWeight="bold">
                    {importStats.invalid}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Invalid
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Success */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} icon={<CheckIcon />}>
            <Typography variant="subtitle2">Data imported successfully!</Typography>
            <Typography variant="body2">{importStats?.valid} rows have been added to your table.</Typography>
          </Alert>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Alert severity="error" sx={{ mb: 2 }} icon={<ErrorIcon />}>
                <Typography variant="subtitle2">Found {errors.length} error(s) in the CSV file</Typography>
                <Typography variant="body2">Please fix these issues and try again.</Typography>
              </Alert>
              <List dense sx={{ maxHeight: 300, overflow: "auto" }}>
                {errors.map((error, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip label={`Row ${error.row}`} size="small" color="error" variant="outlined" />
                          <Chip label={error.field} size="small" variant="outlined" />
                        </Box>
                      }
                      secondary={error.message}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
