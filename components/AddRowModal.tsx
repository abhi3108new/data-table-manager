"use client"

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
} from "@mui/material"
import { Add as AddIcon, Person as PersonIcon } from "@mui/icons-material"
import { useForm, Controller } from "react-hook-form"
import { useDispatch } from "react-redux"
import { addRow } from "@/store/slices/tableSlice"

interface AddRowModalProps {
  open: boolean
  onClose: () => void
}

interface FormData {
  name: string
  email: string
  age: string
  role: string
  department: string
  location: string
}

export default function AddRowModal({ open, onClose }: AddRowModalProps) {
  const dispatch = useDispatch()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      email: "",
      age: "",
      role: "",
      department: "",
      location: "",
    },
  })

  const onSubmit = (data: FormData) => {
    dispatch(
      addRow({
        id: `row_${Date.now()}`,
        ...data,
        age: data.age ? Number(data.age) : "",
      }),
    )
    reset()
    onClose()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <PersonIcon color="primary" />
          <Box>
            <Typography variant="h6">Add New Row</Typography>
            <Typography variant="body2" color="text.secondary">
              Fill in the details to add a new record
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Card variant="outlined" sx={{ mb: 3, background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)" }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Required fields are marked with *
              </Typography>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="name"
                control={control}
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Name *"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    variant="outlined"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Invalid email format",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email *"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    variant="outlined"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="age"
                control={control}
                rules={{
                  pattern: {
                    value: /^\d+$/,
                    message: "Age must be a number",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Age"
                    error={!!errors.age}
                    helperText={errors.age?.message}
                    variant="outlined"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => <TextField {...field} fullWidth label="Role" variant="outlined" />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="department"
                control={control}
                render={({ field }) => <TextField {...field} fullWidth label="Department" variant="outlined" />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="location"
                control={control}
                render={({ field }) => <TextField {...field} fullWidth label="Location" variant="outlined" />}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" startIcon={<AddIcon />}>
            Add Row
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
