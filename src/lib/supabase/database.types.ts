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
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      areas: {
        Row: {
          city: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          city: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          city?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      mabar_participants: {
        Row: {
          joined_at: string
          mabar_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          mabar_id: string
          user_id: string
        }
        Update: {
          joined_at?: string
          mabar_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mabar_participants_mabar_id_fkey"
            columns: ["mabar_id"]
            isOneToOne: false
            referencedRelation: "mabar_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mabar_participants_mabar_id_fkey"
            columns: ["mabar_id"]
            isOneToOne: false
            referencedRelation: "mabars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mabar_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      mabars: {
        Row: {
          cancelled_at: string | null
          cost_per_player: number | null
          created_at: string
          description: string | null
          ends_at: string
          format: Database["public"]["Enums"]["mabar_format"]
          id: string
          level_max: number
          level_min: number
          match_type: Database["public"]["Enums"]["match_type"]
          max_players: number
          organizer_id: string
          participant_count: number
          starts_at: string
          status: Database["public"]["Enums"]["mabar_status"]
          title: string
          updated_at: string
          venue_id: string
        }
        Insert: {
          cancelled_at?: string | null
          cost_per_player?: number | null
          created_at?: string
          description?: string | null
          ends_at: string
          format: Database["public"]["Enums"]["mabar_format"]
          id?: string
          level_max: number
          level_min: number
          match_type: Database["public"]["Enums"]["match_type"]
          max_players: number
          organizer_id: string
          participant_count?: number
          starts_at: string
          status?: Database["public"]["Enums"]["mabar_status"]
          title: string
          updated_at?: string
          venue_id: string
        }
        Update: {
          cancelled_at?: string | null
          cost_per_player?: number | null
          created_at?: string
          description?: string | null
          ends_at?: string
          format?: Database["public"]["Enums"]["mabar_format"]
          id?: string
          level_max?: number
          level_min?: number
          match_type?: Database["public"]["Enums"]["match_type"]
          max_players?: number
          organizer_id?: string
          participant_count?: number
          starts_at?: string
          status?: Database["public"]["Enums"]["mabar_status"]
          title?: string
          updated_at?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mabars_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "mabars_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      player_ratings: {
        Row: {
          assessment: Json
          created_at: string
          matches_counted: number
          rating: number
          reliability: number
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment: Json
          created_at?: string
          matches_counted?: number
          rating: number
          reliability: number
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment?: Json
          created_at?: string
          matches_counted?: number
          rating?: number
          reliability?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          area_id: string
          availability: Database["public"]["Enums"]["availability_slot"][]
          created_at: string
          display_name: string
          dominant_hand: Database["public"]["Enums"]["dominant_hand"] | null
          gender: Database["public"]["Enums"]["gender"] | null
          photo_url: string | null
          playing_objective: Database["public"]["Enums"]["playing_objective"]
          playing_style: Database["public"]["Enums"]["playing_style"]
          preferred_format: Database["public"]["Enums"]["preferred_format"]
          updated_at: string
          user_id: string
        }
        Insert: {
          area_id: string
          availability?: Database["public"]["Enums"]["availability_slot"][]
          created_at?: string
          display_name: string
          dominant_hand?: Database["public"]["Enums"]["dominant_hand"] | null
          gender?: Database["public"]["Enums"]["gender"] | null
          photo_url?: string | null
          playing_objective?: Database["public"]["Enums"]["playing_objective"]
          playing_style?: Database["public"]["Enums"]["playing_style"]
          preferred_format?: Database["public"]["Enums"]["preferred_format"]
          updated_at?: string
          user_id: string
        }
        Update: {
          area_id?: string
          availability?: Database["public"]["Enums"]["availability_slot"][]
          created_at?: string
          display_name?: string
          dominant_hand?: Database["public"]["Enums"]["dominant_hand"] | null
          gender?: Database["public"]["Enums"]["gender"] | null
          photo_url?: string | null
          playing_objective?: Database["public"]["Enums"]["playing_objective"]
          playing_style?: Database["public"]["Enums"]["playing_style"]
          preferred_format?: Database["public"]["Enums"]["preferred_format"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string | null
          area_id: string
          created_at: string
          created_by: string | null
          id: string
          lat: number | null
          lng: number | null
          name: string
        }
        Insert: {
          address?: string | null
          area_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
        }
        Update: {
          address?: string | null
          area_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "venues_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      mabar_listings: {
        Row: {
          area_id: string | null
          area_name: string | null
          cost_per_player: number | null
          created_at: string | null
          description: string | null
          effective_status: Database["public"]["Enums"]["mabar_status"] | null
          ends_at: string | null
          format: Database["public"]["Enums"]["mabar_format"] | null
          id: string | null
          level_max: number | null
          level_min: number | null
          match_type: Database["public"]["Enums"]["match_type"] | null
          max_players: number | null
          organizer_id: string | null
          organizer_name: string | null
          participant_count: number | null
          starts_at: string | null
          status: Database["public"]["Enums"]["mabar_status"] | null
          title: string | null
          venue_id: string | null
          venue_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mabars_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "mabars_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venues_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      cancel_mabar: { Args: { p_mabar_id: string }; Returns: undefined }
      complete_onboarding: {
        Args: {
          p_area_id: string
          p_assessment: Json
          p_availability: Database["public"]["Enums"]["availability_slot"][]
          p_display_name: string
          p_dominant_hand: Database["public"]["Enums"]["dominant_hand"]
          p_gender: Database["public"]["Enums"]["gender"]
          p_photo_url: string
          p_playing_objective: Database["public"]["Enums"]["playing_objective"]
          p_playing_style: Database["public"]["Enums"]["playing_style"]
          p_preferred_format: Database["public"]["Enums"]["preferred_format"]
          p_rating: number
          p_reliability: number
          p_user_id: string
        }
        Returns: undefined
      }
      create_mabar: {
        Args: {
          p_cost_per_player: number
          p_description: string
          p_ends_at: string
          p_format: Database["public"]["Enums"]["mabar_format"]
          p_level_max: number
          p_level_min: number
          p_match_type: Database["public"]["Enums"]["match_type"]
          p_starts_at: string
          p_title: string
          p_venue_id: string
        }
        Returns: string
      }
      join_mabar: { Args: { p_mabar_id: string }; Returns: undefined }
      leave_mabar: { Args: { p_mabar_id: string }; Returns: undefined }
      mabar_effective_status: {
        Args: {
          p_max_players: number
          p_participant_count: number
          p_starts_at: string
          p_status: Database["public"]["Enums"]["mabar_status"]
        }
        Returns: Database["public"]["Enums"]["mabar_status"]
      }
      my_mabars: {
        Args: { p_scope?: string }
        Returns: {
          area_id: string | null
          area_name: string | null
          cost_per_player: number | null
          created_at: string | null
          description: string | null
          effective_status: Database["public"]["Enums"]["mabar_status"] | null
          ends_at: string | null
          format: Database["public"]["Enums"]["mabar_format"] | null
          id: string | null
          level_max: number | null
          level_min: number | null
          match_type: Database["public"]["Enums"]["match_type"] | null
          max_players: number | null
          organizer_id: string | null
          organizer_name: string | null
          participant_count: number | null
          starts_at: string | null
          status: Database["public"]["Enums"]["mabar_status"] | null
          title: string | null
          venue_id: string | null
          venue_name: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "mabar_listings"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      search_mabars: {
        Args: {
          p_after_id?: string
          p_after_starts_at?: string
          p_area_id?: string
          p_format?: Database["public"]["Enums"]["mabar_format"]
          p_from?: string
          p_level_max?: number
          p_level_min?: number
          p_limit?: number
          p_match_type?: Database["public"]["Enums"]["match_type"]
          p_query?: string
          p_time_slot?: string
          p_to?: string
        }
        Returns: {
          area_id: string | null
          area_name: string | null
          cost_per_player: number | null
          created_at: string | null
          description: string | null
          effective_status: Database["public"]["Enums"]["mabar_status"] | null
          ends_at: string | null
          format: Database["public"]["Enums"]["mabar_format"] | null
          id: string | null
          level_max: number | null
          level_min: number | null
          match_type: Database["public"]["Enums"]["match_type"] | null
          max_players: number | null
          organizer_id: string | null
          organizer_name: string | null
          participant_count: number | null
          starts_at: string | null
          status: Database["public"]["Enums"]["mabar_status"] | null
          title: string | null
          venue_id: string | null
          venue_name: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "mabar_listings"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      availability_slot:
        | "WEEKDAY_MORNING"
        | "WEEKDAY_AFTERNOON"
        | "WEEKDAY_NIGHT"
        | "WEEKEND_MORNING"
        | "WEEKEND_AFTERNOON"
        | "WEEKEND_NIGHT"
      dominant_hand: "RIGHT" | "LEFT"
      gender: "MALE" | "FEMALE"
      mabar_format: "SINGLES" | "DOUBLES"
      mabar_status:
        | "OPEN"
        | "FULL"
        | "UPCOMING"
        | "LIVE"
        | "COMPLETED"
        | "CANCELLED"
        | "EXPIRED"
      match_type: "CASUAL" | "COMPETITIVE"
      playing_objective:
        | "FUN"
        | "FITNESS"
        | "IMPROVE"
        | "COMPETITIVE"
        | "TOURNAMENT"
      playing_style:
        | "BASELINE"
        | "AGGRESSIVE_BASELINER"
        | "ALL_COURT"
        | "SERVE_AND_VOLLEY"
        | "COUNTER_PUNCHER"
        | "STILL_LEARNING"
      preferred_format: "SINGLES" | "DOUBLES" | "BOTH"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      availability_slot: [
        "WEEKDAY_MORNING",
        "WEEKDAY_AFTERNOON",
        "WEEKDAY_NIGHT",
        "WEEKEND_MORNING",
        "WEEKEND_AFTERNOON",
        "WEEKEND_NIGHT",
      ],
      dominant_hand: ["RIGHT", "LEFT"],
      gender: ["MALE", "FEMALE"],
      mabar_format: ["SINGLES", "DOUBLES"],
      mabar_status: [
        "OPEN",
        "FULL",
        "UPCOMING",
        "LIVE",
        "COMPLETED",
        "CANCELLED",
        "EXPIRED",
      ],
      match_type: ["CASUAL", "COMPETITIVE"],
      playing_objective: [
        "FUN",
        "FITNESS",
        "IMPROVE",
        "COMPETITIVE",
        "TOURNAMENT",
      ],
      playing_style: [
        "BASELINE",
        "AGGRESSIVE_BASELINER",
        "ALL_COURT",
        "SERVE_AND_VOLLEY",
        "COUNTER_PUNCHER",
        "STILL_LEARNING",
      ],
      preferred_format: ["SINGLES", "DOUBLES", "BOTH"],
    },
  },
} as const
