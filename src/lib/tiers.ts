import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type Tier = {
  id: string;
  name: string;
  price_naira: number;
  whatsapp_link: string;
  is_active: boolean;
  sort_order: number;
};

export const tiersQueryOptions = queryOptions({
  queryKey: ["tiers"],
  queryFn: async (): Promise<Tier[]> => {
    const { data, error } = await supabase
      .from("tiers")
      .select("id, name, price_naira, whatsapp_link, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as Tier[];
  },
  staleTime: 60_000,
});
