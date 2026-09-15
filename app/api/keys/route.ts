import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { getUserKeyHints, saveUserKeys } from "@/lib/user-keys";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const hints = await getUserKeyHints(user.id);
  return NextResponse.json(hints);
}

export async function PUT(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as {
    openai?: string;
    neuronpedia?: string;
  };
  const openai = body.openai?.trim();
  const neuronpedia = body.neuronpedia?.trim();
  if (!openai && !neuronpedia) {
    return NextResponse.json({ error: "Provide at least one key" }, { status: 400 });
  }
  try {
    const hints = await saveUserKeys(user.id, {
      openai: openai || undefined,
      neuronpedia: neuronpedia || undefined,
    });
    return NextResponse.json(hints);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save keys";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
