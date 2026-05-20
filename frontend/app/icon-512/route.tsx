import { ImageResponse } from "next/og";

export const runtime = "edge";
export const revalidate = 31536000;

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #f5efe2, #e8dcc4)",
          gap: 28,
        }}
      >
        {/* Open book */}
        <div style={{ display: "flex", position: "relative", width: 300, height: 240 }}>
          {/* Left page */}
          <div style={{
            width: 130, height: 240,
            background: "#fff",
            border: "8px solid #8b3a1f",
            borderRight: "none",
            borderRadius: "16px 0 0 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingRight: 20,
            gap: 18,
          }}>
            {[90, 70, 80, 60].map((w, i) => (
              <div key={i} style={{ width: w, height: 10, background: "#d9c79a", borderRadius: 4 }} />
            ))}
          </div>
          {/* Spine */}
          <div style={{
            width: 40, height: 240,
            background: "#8b3a1f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <div style={{ width: 4, height: 180, background: "rgba(255,255,255,0.2)", borderRadius: 2 }} />
          </div>
          {/* Right page */}
          <div style={{
            width: 130, height: 240,
            background: "#fff",
            border: "8px solid #8b3a1f",
            borderLeft: "none",
            borderRadius: "0 16px 16px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingLeft: 20,
            gap: 18,
          }}>
            {[80, 90, 65, 75].map((w, i) => (
              <div key={i} style={{ width: w, height: 10, background: "#d9c79a", borderRadius: 4 }} />
            ))}
          </div>
        </div>

        {/* App name */}
        <div style={{
          fontSize: 52,
          fontWeight: 700,
          color: "#3a2618",
          fontFamily: "Georgia, serif",
          letterSpacing: 4,
          textTransform: "uppercase",
        }}>
          Recipes Book
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
