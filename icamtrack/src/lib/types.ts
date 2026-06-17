export type UserRole = 'student' | 'admin'
export type EquipmentStatus = 'available' | 'borrowed' | 'unavailable'
export type LoanStatus = 'pending' | 'active' | 'closed' | 'rejected'

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  email: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  description: string | null
}

export interface Equipment {
  id: string
  name: string
  category_id: string
  serial_number: string | null
  status: EquipmentStatus
  notes: string | null
  created_at: string
  category?: Category
}

export interface LoanItem {
  id: string
  loan_id: string
  category_id: string
  equipment_id: string | null
  returned_at: string | null
  category?: Category
  equipment?: Equipment
}

export interface LoanRequest {
  id: string
  student_id: string
  status: LoanStatus
  due_date: string | null
  admin_note: string | null
  created_at: string
  closed_at: string | null
  student?: Profile
  items?: LoanItem[]
}

export interface Pack {
  id: string
  name: string
  description: string | null
  created_at: string
  items?: PackItem[]
}

export interface PackItem {
  id: string
  pack_id: string
  category_id: string
  quantity: number
  category?: Category
}
