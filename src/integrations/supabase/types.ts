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
      registrations: {
        Row: {
          amount_paid: number
          category: string
          city: string | null
          country: string | null
          country_code: string | null
          created_at: string
          email: string
          full_name: string
          heard_from: string | null
          id: string
          payment_status: string
          paystack_reference: string | null
          phone: string
          phone_country_code: string | null
          phone_e164: string | null
          phone_national: string | null
          receipt_email_sent: boolean
          state: string | null
          tier_id: string
          whatsapp_link_sent: boolean
        }
        Insert: {
          amount_paid?: number
          category: string
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          email: string
          full_name: string
          heard_from?: string | null
          id?: string
          payment_status?: string
          paystack_reference?: string | null
          phone: string
          phone_country_code?: string | null
          phone_e164?: string | null
          phone_national?: string | null
          receipt_email_sent?: boolean
          state?: string | null
          tier_id: string
          whatsapp_link_sent?: boolean
        }
        Update: {
          amount_paid?: number
          category?: string
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          email?: string
          full_name?: string
          heard_from?: string | null
          id?: string
          payment_status?: string
          paystack_reference?: string | null
          phone?: string
          phone_country_code?: string | null
          phone_e164?: string | null
          phone_national?: string | null
          receipt_email_sent?: boolean
          state?: string | null
          tier_id?: string
          whatsapp_link_sent?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "registrations_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      tiers: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          price_naira: number
          sort_order: number
          whatsapp_link: string
        }
        Insert: {
          created_at?: string
          id: string
          is_active?: boolean
          name: string
          price_naira: number
          sort_order?: number
          whatsapp_link?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          price_naira?: number
          sort_order?: number
          whatsapp_link?: string
        }
        Relationships: []
      }
      waitlist_signups: {
        Row: {
          country: string | null
          country_code: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          interest: string | null
          level: string | null
          location: string | null
          phone: string | null
          phone_country_code: string | null
          phone_e164: string | null
          phone_national: string | null
          session_id: string | null
          signed_up_at: string
          source: string | null
          updated_at: string
        }
        Insert: {
          country?: string | null
          country_code?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          interest?: string | null
          level?: string | null
          location?: string | null
          phone?: string | null
          phone_country_code?: string | null
          phone_e164?: string | null
          phone_national?: string | null
          session_id?: string | null
          signed_up_at?: string
          source?: string | null
          updated_at?: string
        }
        Update: {
          country?: string | null
          country_code?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          interest?: string | null
          level?: string | null
          location?: string | null
          phone?: string | null
          phone_country_code?: string | null
          phone_e164?: string | null
          phone_national?: string | null
          session_id?: string | null
          signed_up_at?: string
          source?: string | null
          updated_at?: string
        }
        Relationships: []
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
