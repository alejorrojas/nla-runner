import { NextResponse } from "next/server";
import { mergeClientStore, readUserStore, writeUserStore } from "@/lib/store";
import { requireUser } from "@/lib/supabase/server";
import type { Store } from "@/lib/types";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const store = await readUserStore(user.id);
  return NextResponse.json(store);
}

export async function PUT(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const incoming = (await req.json()) as Store;
  const current = await readUserStore(user.id);
  const store = mergeClientStore(current, incoming);
  await writeUserStore(user.id, store);
  return NextResponse.json(store);
}
