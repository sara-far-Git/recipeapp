import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #f5efe2, #e8dcc4)",
          borderRadius: 36,
        }}
      >
        {/* Open book */}
        <div style={{ display: "flex", position: "relative", width: 110, height: 90 }}>
          {/* Left page */}
          <div style={{
            width: 48, height: 90,
            background: "#fff",
            border: "3px solid #8b3a1f",
            borderRight: "none",
            borderRadius: "6px 0 0 6px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingRight: 8,
            gap: 7,
          }}>
            {[48, 38, 42].map((w, i) => (
              <div key={i} style={{ width: w, height: 5, background: "#d9c79a", borderRadius: 2 }} />
            ))}
          </div>
          {/* Spine */}
          <div style={{
            width: 14, height: 90,
            background: "#8b3a1f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <div style={{ width: 2, height: 60, background: "rgba(255,255,255,0.25)", borderRadius: 1 }} />
          </div>
          {/* Right page */}
          <div style={{
            width: 48, height: 90,
            background: "#fff",
            border: "3px solid #8b3a1f",
            borderLeft: "none",
            borderRadius: "0 6px 6px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingLeft: 8,
            gap: 7,
          }}>
            {[44, 40, 36].map((w, i) => (
              <div key={i} style={{ width: w, height: 5, background: "#d9c79a", borderRadius: 2 }} />
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
