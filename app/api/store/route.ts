import { NextResponse } from "next/server";
import { mergeClientStore, readStore, writeStore } from "@/lib/store";
import type { Store } from "@/lib/types";

export async function GET() {
  const store = await readStore();
  return NextResponse.json(store);
}

export async function PUT(req: Request) {
  const incoming = (await req.json()) as Store;
  const current = await readStore();
  const store = mergeClientStore(current, incoming);
  await writeStore(store);
  return NextResponse.json(store);
}
