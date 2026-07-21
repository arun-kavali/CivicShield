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
      alert_incident_map: {
        Row: {
          alert_id: string
          created_at: string
          incident_id: string
        }
        Insert: {
          alert_id: string
          created_at?: string
          incident_id: string
        }
        Update: {
          alert_id?: string
          created_at?: string
          incident_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_incident_map_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_incident_map_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          ai_analysis: Json | null
          ai_analyzed_at: string | null
          ai_used: boolean | null
          alert_type: string
          confidence: number | null
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          raw_data: Json | null
          raw_log: Json | null
          risk_score: number | null
          severity: string
          source_system: string
          status: string
          timestamp: string
          title: string | null
          updated_at: string
        }
        Insert: {
          ai_analysis?: Json | null
          ai_analyzed_at?: string | null
          ai_used?: boolean | null
          alert_type: string
          confidence?: number | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          raw_data?: Json | null
          raw_log?: Json | null
          risk_score?: number | null
          severity: string
          source_system: string
          status?: string
          timestamp: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          ai_analysis?: Json | null
          ai_analyzed_at?: string | null
          ai_used?: boolean | null
          alert_type?: string
          confidence?: number | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          raw_data?: Json | null
          raw_log?: Json | null
          risk_score?: number | null
          severity?: string
          source_system?: string
          status?: string
          timestamp?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          organization_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          organization_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      data_connectors: {
        Row: {
          config: Json | null
          created_at: string
          error_message: string | null
          id: string
          last_sync: string | null
          name: string
          organization_id: string | null
          records_imported: number | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync?: string | null
          name: string
          organization_id?: string | null
          records_imported?: number | null
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync?: string | null
          name?: string
          organization_id?: string | null
          records_imported?: number | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_connectors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_activity: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          incident_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          incident_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          incident_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_activity_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          affected_systems: string[] | null
          ai_analysis: Json | null
          ai_confidence: number | null
          ai_recommended_actions: string[] | null
          ai_summary: string | null
          assigned_to: string | null
          auto_created: boolean | null
          business_impact: string | null
          confidence: number | null
          containment_steps: string[] | null
          created_at: string
          description: string | null
          id: string
          incident_reason: string | null
          iocs: Json | null
          mitre_attack: Json | null
          organization_id: string | null
          possible_losses: string | null
          prevention_steps: string[] | null
          recovery_steps: string[] | null
          resolved_at: string | null
          risk_score: number | null
          root_cause: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          affected_systems?: string[] | null
          ai_analysis?: Json | null
          ai_confidence?: number | null
          ai_recommended_actions?: string[] | null
          ai_summary?: string | null
          assigned_to?: string | null
          auto_created?: boolean | null
          business_impact?: string | null
          confidence?: number | null
          containment_steps?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          incident_reason?: string | null
          iocs?: Json | null
          mitre_attack?: Json | null
          organization_id?: string | null
          possible_losses?: string | null
          prevention_steps?: string[] | null
          recovery_steps?: string[] | null
          resolved_at?: string | null
          risk_score?: number | null
          root_cause?: string | null
          severity: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          affected_systems?: string[] | null
          ai_analysis?: Json | null
          ai_confidence?: number | null
          ai_recommended_actions?: string[] | null
          ai_summary?: string | null
          assigned_to?: string | null
          auto_created?: boolean | null
          business_impact?: string | null
          confidence?: number | null
          containment_steps?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          incident_reason?: string | null
          iocs?: Json | null
          mitre_attack?: Json | null
          organization_id?: string | null
          possible_losses?: string | null
          prevention_steps?: string[] | null
          recovery_steps?: string[] | null
          resolved_at?: string | null
          risk_score?: number | null
          root_cause?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string | null
          metadata: Json | null
          organization_id: string
          read: boolean
          severity: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          metadata?: Json | null
          organization_id: string
          read?: boolean
          severity?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          metadata?: Json | null
          organization_id?: string
          read?: boolean
          severity?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string | null
          id: string
          invited_by: string | null
          organization_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          token: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          token?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          joined_at: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          joined_at?: string
          organization_id: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          joined_at?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          sector: string | null
          security_score: number | null
          slug: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          sector?: string | null
          security_score?: number | null
          slug?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          sector?: string | null
          security_score?: number | null
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: { Args: { org_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "analyst" | "org_admin" | "alert_source"
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
      app_role: ["admin", "analyst", "org_admin", "alert_source"],
    },
  },
} as const
