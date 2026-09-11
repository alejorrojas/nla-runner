import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt =
  "NLASmith — from one activation to a systematic experiment";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const plexSemiBold = await readFile(
  join(process.cwd(), "app/fonts/IBMPlexSans-SemiBold.ttf"),
);
const plexRegular = await readFile(
  join(process.cwd(), "app/fonts/IBMPlexSans-Regular.ttf"),
);
const logo = await readFile(join(process.cwd(), "public/brand/logo.png"));

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#000000",
          overflow: "hidden",
          fontFamily: "IBM Plex Sans",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -180,
            bottom: -200,
            width: 980,
            height: 780,
            borderRadius: 980,
            background:
              "radial-gradient(circle at 42% 38%, #5cd3e8 0%, #00bfff 32%, rgba(0,0,0,0) 70%)",
            opacity: 0.88,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -220,
            top: -160,
            width: 920,
            height: 720,
            borderRadius: 920,
            background:
              "radial-gradient(circle at 58% 48%, #a8ecff 0%, #5cd3e8 26%, rgba(0,0,0,0) 68%)",
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 420,
            top: 80,
            width: 520,
            height: 420,
            borderRadius: 520,
            background:
              "radial-gradient(circle at 50% 50%, rgba(0,191,255,0.35) 0%, rgba(0,0,0,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.2)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 44,
            left: 52,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <img
            src={`data:image/png;base64,${logo.toString("base64")}`}
            width={40}
            height={40}
          />
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 600,
              color: "#ffffff",
              letterSpacing: -0.4,
            }}
          >
            NLASmith
          </div>
        </div>
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 16,
              fontWeight: 500,
              letterSpacing: 3.2,
              color: "rgba(255,255,255,0.7)",
              textTransform: "uppercase",
            }}
          >
            NLASmith · CONAIISI 2026
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 22,
              fontSize: 64,
              fontWeight: 600,
              lineHeight: 0.95,
              color: "#ffffff",
              letterSpacing: -1.8,
            }}
          >
            <div style={{ display: "flex" }}>From one activation</div>
            <div style={{ display: "flex" }}>to a systematic experiment.</div>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              maxWidth: 820,
              fontSize: 22,
              fontWeight: 400,
              lineHeight: 1.4,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            Datasets, token policies, Neuronpedia NLA, and LLM-as-judge —
            systematic evaluation of Natural Language Activations.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "IBM Plex Sans",
          data: plexRegular,
          style: "normal",
          weight: 400,
        },
        {
          name: "IBM Plex Sans",
          data: plexSemiBold,
          style: "normal",
          weight: 600,
        },
      ],
    },
  );
}
