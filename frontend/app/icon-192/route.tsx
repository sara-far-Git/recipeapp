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
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #f5efe2, #e8dcc4)",
        }}
      >
        {/* Open book */}
        <div style={{ display: "flex", position: "relative", width: 116, height: 96 }}>
          {/* Left page */}
          <div style={{
            width: 50, height: 96,
            background: "#fff",
            border: "3.5px solid #8b3a1f",
            borderRight: "none",
            borderRadius: "7px 0 0 7px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingRight: 9,
            gap: 8,
          }}>
            {[40, 30, 34].map((w, i) => (
              <div key={i} style={{ width: w, height: 5, background: "#d9c79a", borderRadius: 2 }} />
            ))}
          </div>
          {/* Spine */}
          <div style={{
            width: 16, height: 96,
            background: "#8b3a1f",
          }} />
          {/* Right page */}
          <div style={{
            width: 50, height: 96,
            background: "#fff",
            border: "3.5px solid #8b3a1f",
            borderLeft: "none",
            borderRadius: "0 7px 7px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingLeft: 9,
            gap: 8,
          }}>
            {[36, 40, 28].map((w, i) => (
              <div key={i} style={{ width: w, height: 5, background: "#d9c79a", borderRadius: 2 }} />
            ))}
          </div>
        </div>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
