import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";
import type { Store } from "@/lib/types";

export async function GET() {
  const store = await readStore();
  return NextResponse.json(store);
}

export async function PUT(req: Request) {
  const store = (await req.json()) as Store;
  await writeStore(store);
  return NextResponse.json(store);
}
