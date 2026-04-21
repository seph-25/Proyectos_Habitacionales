export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      project_images: {
        Row: {
          id: string
          project_id: string
          url: string
          caption: string | null
          image_type: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          url: string
          caption?: string | null
          image_type?: string
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          url?: string
          caption?: string | null
          image_type?: string
          display_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address: string | null
          amenities: string[] | null
          area_m2_from: number | null
          canton: string
          coordinates: string | null
          created_at: string
          description: string | null
          financing_options: Json | null
          id: string
          name: string
          price_from: number | null
          project_type: string | null
          province: string
          start_date: string | null
          status: string
          unit_types: Json | null
          units: number | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          area_m2_from?: number | null
          canton: string
          coordinates?: string | null
          created_at?: string
          description?: string | null
          financing_options?: Json | null
          id?: string
          name: string
          price_from?: number | null
          project_type?: string | null
          province: string
          start_date?: string | null
          status?: string
          unit_types?: Json | null
          units?: number | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          area_m2_from?: number | null
          canton?: string
          coordinates?: string | null
          created_at?: string
          description?: string | null
          financing_options?: Json | null
          id?: string
          name?: string
          price_from?: number | null
          project_type?: string | null
          province?: string
          start_date?: string | null
          status?: string
          unit_types?: Json | null
          units?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          full_name: string
          role: string
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: string
          created_at?: string
        }
        Relationships: []
      }
      prospectos: {
        Row: {
          id: string
          nombre: string
          apellidos: string
          correo: string | null
          telefono: string | null
          cedula: string | null
          proyecto_id: string | null
          presupuesto: number | null
          tipo_unidad_buscada: string | null
          status: string
          agente_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          apellidos: string
          correo?: string | null
          telefono?: string | null
          cedula?: string | null
          proyecto_id?: string | null
          presupuesto?: number | null
          tipo_unidad_buscada?: string | null
          status?: string
          agente_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          apellidos?: string
          correo?: string | null
          telefono?: string | null
          cedula?: string | null
          proyecto_id?: string | null
          presupuesto?: number | null
          tipo_unidad_buscada?: string | null
          status?: string
          agente_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      prospecto_notas: {
        Row: {
          id: string
          prospecto_id: string
          contenido: string
          autor_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          prospecto_id: string
          contenido: string
          autor_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          prospecto_id?: string
          contenido?: string
          autor_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      citas: {
        Row: {
          id: string
          prospecto_id: string
          agente_id: string | null
          proyecto_id: string | null
          fecha_hora: string
          tipo: string
          status: string
          notas: string | null
          created_at: string
        }
        Insert: {
          id?: string
          prospecto_id: string
          agente_id?: string | null
          proyecto_id?: string | null
          fecha_hora: string
          tipo?: string
          status?: string
          notas?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          prospecto_id?: string
          agente_id?: string | null
          proyecto_id?: string | null
          fecha_hora?: string
          tipo?: string
          status?: string
          notas?: string | null
          created_at?: string
        }
        Relationships: []
      }
      status_history: {
        Row: {
          changed_at: string
          changed_by: string
          id: string
          new_status: string
          previous_status: string | null
          project_id: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string
          id?: string
          new_status: string
          previous_status?: string | null
          project_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string
          id?: string
          new_status?: string
          previous_status?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
