export interface Database {
  public: {
    Tables: {
      gyubaek_todos: {
        Row: {
          id: string
          created_at: string
          text: string
          completed: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          text: string
          completed?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          text?: string
          completed?: boolean
        }
      }
    }
  }
} 