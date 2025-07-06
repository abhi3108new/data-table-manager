import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { TableData, Column } from "@/types/table"

export interface SortConfig {
  key: string
  direction: "asc" | "desc"
}

interface TableState {
  data: TableData[]
  visibleColumns: Column[]
  searchTerm: string
  page: number
  rowsPerPage: number
  sortConfig: SortConfig
}

const initialColumns: Column[] = [
  { key: "name", label: "Name", visible: true },
  { key: "email", label: "Email", visible: true },
  { key: "age", label: "Age", visible: true },
  { key: "role", label: "Role", visible: true },
  { key: "department", label: "Department", visible: false },
  { key: "location", label: "Location", visible: false },
]

const initialData: TableData[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    age: 30,
    role: "Senior Developer",
    department: "Engineering",
    location: "New York",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    age: 28,
    role: "UX Designer",
    department: "Design",
    location: "San Francisco",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    age: 35,
    role: "Product Manager",
    department: "Product",
    location: "Chicago",
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice.brown@example.com",
    age: 32,
    role: "Data Analyst",
    department: "Analytics",
    location: "Boston",
  },
  {
    id: "5",
    name: "Charlie Wilson",
    email: "charlie.wilson@example.com",
    age: 29,
    role: "Frontend Developer",
    department: "Engineering",
    location: "Seattle",
  },
  {
    id: "6",
    name: "Diana Prince",
    email: "diana.prince@example.com",
    age: 31,
    role: "Marketing Manager",
    department: "Marketing",
    location: "Los Angeles",
  },
  {
    id: "7",
    name: "Edward Clark",
    email: "edward.clark@example.com",
    age: 27,
    role: "Backend Developer",
    department: "Engineering",
    location: "Austin",
  },
  {
    id: "8",
    name: "Fiona Davis",
    email: "fiona.davis@example.com",
    age: 33,
    role: "HR Manager",
    department: "Human Resources",
    location: "Denver",
  },
]

const initialState: TableState = {
  data: initialData,
  visibleColumns: initialColumns,
  searchTerm: "",
  page: 0,
  rowsPerPage: 10,
  sortConfig: { key: "", direction: "asc" },
}

const tableSlice = createSlice({
  name: "table",
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload
    },
    setRowsPerPage: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload
      state.page = 0 // Reset to first page
    },
    setSortConfig: (state, action: PayloadAction<SortConfig>) => {
      state.sortConfig = action.payload
    },
    toggleColumnVisibility: (state, action: PayloadAction<string>) => {
      const column = state.visibleColumns.find((col) => col.key === action.payload)
      if (column) {
        column.visible = !column.visible
      }
    },
    addColumn: (state, action: PayloadAction<Column>) => {
      state.visibleColumns.push(action.payload)
      // Add empty values for existing rows
      state.data.forEach((row) => {
        ;(row as any)[action.payload.key] = ""
      })
    },
    reorderColumns: (state, action: PayloadAction<Column[]>) => {
      state.visibleColumns = action.payload
    },
    addRow: (state, action: PayloadAction<TableData>) => {
      state.data.push(action.payload)
    },
    updateRow: (state, action: PayloadAction<{ id: string; data: Partial<TableData> }>) => {
      const index = state.data.findIndex((row) => row.id === action.payload.id)
      if (index !== -1) {
        state.data[index] = { ...state.data[index], ...action.payload.data }
      }
    },
    deleteRow: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter((row) => row.id !== action.payload)
    },
    importData: (state, action: PayloadAction<TableData[]>) => {
      state.data = [...state.data, ...action.payload]
    },
  },
})

export const {
  setSearchTerm,
  setPage,
  setRowsPerPage,
  setSortConfig,
  toggleColumnVisibility,
  addColumn,
  reorderColumns,
  addRow,
  updateRow,
  deleteRow,
  importData,
} = tableSlice.actions

export default tableSlice.reducer
