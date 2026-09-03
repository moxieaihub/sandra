import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function createRegistration(input: {
  fullName: string;
  email: string;
  phone: string;
  phoneCountryCode: string | null;
  phoneNational: string;
  phoneE164: string;
  country: string | null;
  countryCode: string | null;
  state: string;
  city: string | null;
  category: string;
  tierId: string;
  heardFrom: string;
}): Promise<{ id: string }> {
  const { data, error } = await supabaseAdmin
    .from("registrations")
    .insert({
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      phone_country_code: input.phoneCountryCode,
      phone_national: input.phoneNational,
      phone_e164: input.phoneE164,
      country: input.country,
      country_code: input.countryCode,
      state: input.state,
      city: input.city,
      category: input.category,
      tier_id: input.tierId,
      heard_from: input.heardFrom,
      payment_status: "pending",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[registration] insert failed", error);
    throw new Error("We couldn't start your enrolment. Please check your details and try again.");
  }

  return { id: data.id };
}