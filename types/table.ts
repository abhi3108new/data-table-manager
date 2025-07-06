export interface TableData {
  id: string
  name: string
  email: string
  age: number | string
  role: string
  department?: string
  location?: string
  [key: string]: any
}

export interface Column {
  key: string
  label: string
  visible: boolean
}
