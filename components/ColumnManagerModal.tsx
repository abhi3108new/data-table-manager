"use client"

import { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  TextField,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Stack,
  Chip,
} from "@mui/material"
import {
  Add as AddIcon,
  DragIndicator,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ViewColumn as ViewColumnIcon,
} from "@mui/icons-material"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/store/store"
import { toggleColumnVisibility, addColumn, reorderColumns } from "@/store/slices/tableSlice"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

interface ColumnManagerModalProps {
  open: boolean
  onClose: () => void
}

export default function ColumnManagerModal({ open, onClose }: ColumnManagerModalProps) {
  const dispatch = useDispatch()
  const { visibleColumns } = useSelector((state: RootState) => state.table)

  const [newColumnName, setNewColumnName] = useState("")

  const handleToggleColumn = (columnKey: string) => {
    dispatch(toggleColumnVisibility(columnKey))
  }

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      const key = newColumnName.toLowerCase().replace(/\s+/g, "_")
      dispatch(
        addColumn({
          key,
          label: newColumnName.trim(),
          visible: true,
        }),
      )
      setNewColumnName("")
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(visibleColumns)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    dispatch(reorderColumns(items))
  }

  const visibleCount = visibleColumns.filter((col) => col.visible).length

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <ViewColumnIcon color="primary" />
          <Box>
            <Typography variant="h6">Manage Columns</Typography>
            <Typography variant="body2" color="text.secondary">
              Add, reorder, and toggle column visibility
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Stats */}
        <Card sx={{ mb: 3, background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)" }}>
          <CardContent>
            <Stack direction="row" spacing={3} justifyContent="center">
              <Box textAlign="center">
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {visibleColumns.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Columns
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" color="success.main" fontWeight="bold">
                  {visibleCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Visible
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" color="warning.main" fontWeight="bold">
                  {visibleColumns.length - visibleCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hidden
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Add New Column */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
              <AddIcon color="primary" />
              Add New Column
            </Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Column Name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddColumn()}
                placeholder="e.g., Department, Status, Priority"
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddColumn}
                disabled={!newColumnName.trim()}
                sx={{ minWidth: 120 }}
              >
                Add
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Divider sx={{ my: 2 }} />

        {/* Column Management */}
        <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
          <DragIndicator color="primary" />
          Column Visibility & Order
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Drag to reorder columns, toggle visibility with checkboxes
        </Typography>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="columns">
            {(provided) => (
              <List {...provided.droppableProps} ref={provided.innerRef}>
                {visibleColumns.map((column, index) => (
                  <Draggable key={column.key} draggableId={column.key} index={index}>
                    {(provided, snapshot) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{
                          border: 1,
                          borderColor: "divider",
                          borderRadius: 2,
                          mb: 1,
                          backgroundColor: snapshot.isDragging ? "action.hover" : "background.paper",
                          boxShadow: snapshot.isDragging ? 4 : 1,
                          transition: "all 0.2s ease-in-out",
                        }}
                      >
                        <ListItemIcon {...provided.dragHandleProps}>
                          <DragIndicator color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body1" fontWeight="medium">
                                {column.label}
                              </Typography>
                              <Chip size="small" label={column.key} variant="outlined" sx={{ fontSize: "0.75rem" }} />
                            </Box>
                          }
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={column.visible}
                              onChange={() => handleToggleColumn(column.key)}
                              icon={<VisibilityOffIcon />}
                              checkedIcon={<VisibilityIcon />}
                            />
                          }
                          label={column.visible ? "Visible" : "Hidden"}
                        />
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="contained">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  )
}
