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
          background: "#8b3a1f",
          color: "#efe7d7",
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 105,
          letterSpacing: -2,
        }}
      >
        R
      </div>
    ),
    { width: 192, height: 192 }
  );
}
