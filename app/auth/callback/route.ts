import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { appUrl } from "@/lib/urls";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/lab";
  if (code) {
    const supabase = await createServerSupabase();
    await supabase.auth.exchangeCodeForSession(code);
  }
  const base = origin.includes("localhost") ? origin : appUrl();
  return NextResponse.redirect(new URL(next, base));
}
