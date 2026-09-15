import { NextResponse } from "next/server";
import { filterJudgeChatModels } from "@/lib/openai-judge-models";
import { requireUser } from "@/lib/supabase/server";
import { readUserKeys } from "@/lib/user-keys";

type OpenAIModel = {
  id?: string;
};

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keys = await readUserKeys(user.id);
  const openai = keys?.openai?.trim();
  if (!openai) {
    return NextResponse.json(
      { error: "Add an OpenAI key in Settings to load models." },
      { status: 400 },
    );
  }

  const res = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${openai}` },
    next: { revalidate: 60 * 60 * 24 * 7 },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "OpenAI could not list models for this key." },
      { status: 502 },
    );
  }

  const body = (await res.json()) as { data?: OpenAIModel[] };
  const models = filterJudgeChatModels(
    (body.data ?? [])
      .map((model) => model.id?.trim())
      .filter((id): id is string => Boolean(id)),
  );

  return NextResponse.json(
    { models },
    {
      headers: {
        "Cache-Control": "private, max-age=604800, stale-while-revalidate=86400",
      },
    },
  );
}
