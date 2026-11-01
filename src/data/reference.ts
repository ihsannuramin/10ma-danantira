import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Area = { id: string; name: string };
export type Venue = { id: string; name: string; areaId: string; areaName: string };

export async function getAreas(): Promise<Area[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("areas").select("id, name").order("sort_order");
  if (error) throw new Error(`Failed to load areas: ${error.message}`);
  return data;
}

export async function getVenues(): Promise<Venue[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("venues")
    .select("id, name, area_id, areas(name, sort_order)")
    .order("name")
    .returns<{ id: string; name: string; area_id: string; areas: { name: string } | null }[]>();
  if (error) throw new Error(`Failed to load venues: ${error.message}`);
  return data.map((v) => ({ id: v.id, name: v.name, areaId: v.area_id, areaName: v.areas?.name ?? "" }));
}
