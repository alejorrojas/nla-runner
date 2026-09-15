import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt =
  "NLASmith, from one activation to a systematic experiment";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const jakartaBold = await readFile(
  join(process.cwd(), "app/fonts/PlusJakartaSans-Bold.ttf"),
);
const jakartaMedium = await readFile(
  join(process.cwd(), "app/fonts/PlusJakartaSans-Medium.ttf"),
);
const logoSrc = `data:image/png;base64,${await readFile(
  join(process.cwd(), "public/brand/mark-og.png"),
  "base64",
)}`;

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#2a211c",
          overflow: "hidden",
          fontFamily: "Plus Jakarta Sans",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -280,
            top: -320,
            width: 920,
            height: 780,
            borderRadius: 920,
            background:
              "radial-gradient(circle at 42% 40%, #d97757 0%, rgba(217,119,87,0) 62%)",
            opacity: 0.95,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -260,
            top: -280,
            width: 860,
            height: 720,
            borderRadius: 860,
            background:
              "radial-gradient(circle at 58% 42%, #e3dacc 0%, rgba(227,218,204,0) 58%)",
            opacity: 0.78,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 40,
            bottom: -280,
            width: 780,
            height: 680,
            borderRadius: 780,
            background:
              "radial-gradient(circle at 50% 40%, #c4785a 0%, rgba(196,120,90,0) 64%)",
            opacity: 0.88,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(20,20,19,0.15)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 180,
            background:
              "linear-gradient(to top, #faf9f5 0%, rgba(250,249,245,0) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 40,
            left: 52,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 40,
              height: 40,
            }}
          >
            <img src={logoSrc} width={40} height={40} />
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 16,
              fontWeight: 600,
              color: "#ffffff",
              letterSpacing: -0.3,
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
            padding: "0 96px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: 2.8,
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
              alignItems: "center",
              marginTop: 22,
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 0.94,
              color: "#ffffff",
              letterSpacing: -2.4,
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex" }}>From one activation</div>
            <div style={{ display: "flex" }}>to a systematic experiment.</div>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 26,
              maxWidth: 780,
              fontSize: 20,
              fontWeight: 500,
              lineHeight: 1.4,
              color: "rgba(255,255,255,0.8)",
              textAlign: "center",
            }}
          >
            Datasets, token policies, configurable judges, and aggregated
            metrics. This lets hypotheses about internal representations be run
            and compared.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 36,
              gap: 12,
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 44,
                padding: "0 24px",
                borderRadius: 999,
                backgroundColor: "#faf9f5",
                color: "#141413",
                fontSize: 16,
                fontWeight: 500,
              }}
            >
              Open the prototype
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 44,
                padding: "0 24px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.4)",
                color: "#ffffff",
                fontSize: 16,
                fontWeight: 500,
              }}
            >
              See the pipeline
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Plus Jakarta Sans",
          data: jakartaMedium,
          style: "normal",
          weight: 500,
        },
        {
          name: "Plus Jakarta Sans",
          data: jakartaBold,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
