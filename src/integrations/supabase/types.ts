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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      conteudos: {
        Row: {
          category: Database["public"]["Enums"]["content_category"]
          created_at: string
          description: string
          how_it_helped: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["content_category"]
          created_at?: string
          description: string
          how_it_helped?: string | null
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["content_category"]
          created_at?: string
          description?: string
          how_it_helped?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pci_results: {
        Row: {
          created_at: string
          dominante: string
          id: string
          respostas: Json
          scores: Json
          secundario: string
          terciario: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dominante: string
          id?: string
          respostas: Json
          scores: Json
          secundario: string
          terciario: string
          user_id: string
        }
        Update: {
          created_at?: string
          dominante?: string
          id?: string
          respostas?: Json
          scores?: Json
          secundario?: string
          terciario?: string
          user_id?: string
        }
        Relationships: []
      }
      personality_notes: {
        Row: {
          created_at: string
          id: string
          personality_id: string
          relato: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          personality_id: string
          relato: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          personality_id?: string
          relato?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: string
          is_anonymous: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          email: string
          id: string
          plan: Database["public"]["Enums"]["user_plan"]
          points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name: string
          email: string
          id?: string
          plan?: Database["public"]["Enums"]["user_plan"]
          points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          plan?: Database["public"]["Enums"]["user_plan"]
          points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      psi_checkins: {
        Row: {
          created_at: string
          dificuldades: string | null
          executou: string
          id: string
          produtividade: number | null
          task_id: string
          tempo_usado_min: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          dificuldades?: string | null
          executou: string
          id?: string
          produtividade?: number | null
          task_id: string
          tempo_usado_min?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          dificuldades?: string | null
          executou?: string
          id?: string
          produtividade?: number | null
          task_id?: string
          tempo_usado_min?: number | null
          user_id?: string
        }
        Relationships: []
      }
      psi_projects: {
        Row: {
          categoria: string | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          objetivo: string
          pci_result_id: string | null
          prazo_dias: number
          prioridade: Database["public"]["Enums"]["psi_prioridade"]
          status: Database["public"]["Enums"]["psi_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          objetivo: string
          pci_result_id?: string | null
          prazo_dias?: number
          prioridade?: Database["public"]["Enums"]["psi_prioridade"]
          status?: Database["public"]["Enums"]["psi_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          objetivo?: string
          pci_result_id?: string | null
          prazo_dias?: number
          prioridade?: Database["public"]["Enums"]["psi_prioridade"]
          status?: Database["public"]["Enums"]["psi_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      psi_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          descricao: string
          dificuldade: Database["public"]["Enums"]["psi_task_dificuldade"]
          id: string
          objetivo: string | null
          ordem: number
          status: Database["public"]["Enums"]["psi_task_status"]
          tempo_estimado_min: number
          titulo: string
          week_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          descricao: string
          dificuldade?: Database["public"]["Enums"]["psi_task_dificuldade"]
          id?: string
          objetivo?: string | null
          ordem: number
          status?: Database["public"]["Enums"]["psi_task_status"]
          tempo_estimado_min?: number
          titulo: string
          week_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          descricao?: string
          dificuldade?: Database["public"]["Enums"]["psi_task_dificuldade"]
          id?: string
          objetivo?: string | null
          ordem?: number
          status?: Database["public"]["Enums"]["psi_task_status"]
          tempo_estimado_min?: number
          titulo?: string
          week_id?: string
        }
        Relationships: []
      }
      psi_weeks: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          numero: number
          project_id: string
          status: Database["public"]["Enums"]["psi_week_status"]
          titulo: string
          unlocked_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          numero: number
          project_id: string
          status?: Database["public"]["Enums"]["psi_week_status"]
          titulo: string
          unlocked_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          numero?: number
          project_id?: string
          status?: Database["public"]["Enums"]["psi_week_status"]
          titulo?: string
          unlocked_at?: string | null
        }
        Relationships: []
      }
      stage_challenges: {
        Row: {
          action: string | null
          created_at: string
          description: string
          id: string
          points: number
          position: number
          reflection: string | null
          stage_id: string
          title: string
          updated_at: string
        }
        Insert: {
          action?: string | null
          created_at?: string
          description: string
          id?: string
          points?: number
          position: number
          reflection?: string | null
          stage_id: string
          title: string
          updated_at?: string
        }
        Update: {
          action?: string | null
          created_at?: string
          description?: string
          id?: string
          points?: number
          position?: number
          reflection?: string | null
          stage_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stage_challenges_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      stages: {
        Row: {
          created_at: string
          description: string | null
          id: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          position: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_challenge_progress: {
        Row: {
          available_at: string | null
          challenge_id: string
          completed_at: string | null
          created_at: string
          id: string
          stage_id: string
          unlocked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available_at?: string | null
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          stage_id: string
          unlocked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available_at?: string | null
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          stage_id?: string
          unlocked_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "stage_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_challenge_progress_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stage_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          stage_id: string
          unlocked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          stage_id: string
          unlocked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          stage_id?: string
          unlocked_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stage_progress_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_points: {
        Args: { _amount: number; _user_id: string }
        Returns: number
      }
      complete_user_challenge: {
        Args: { _challenge_id: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      initialize_user_progress: {
        Args: { _user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      content_category: "book" | "movie" | "meditation" | "music" | "community"
      psi_prioridade: "baixa" | "media" | "alta"
      psi_status: "active" | "completed" | "abandoned"
      psi_task_dificuldade: "facil" | "media" | "dificil"
      psi_task_status: "pending" | "in_progress" | "paused" | "completed"
      psi_week_status: "locked" | "active" | "completed"
      user_plan: "free" | "premium"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
      content_category: ["book", "movie", "meditation", "music", "community"],
      psi_prioridade: ["baixa", "media", "alta"],
      psi_status: ["active", "completed", "abandoned"],
      psi_task_dificuldade: ["facil", "media", "dificil"],
      psi_task_status: ["pending", "in_progress", "paused", "completed"],
      psi_week_status: ["locked", "active", "completed"],
      user_plan: ["free", "premium"],
    },
  },
} as const
