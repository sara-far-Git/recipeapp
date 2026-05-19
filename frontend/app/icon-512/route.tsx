import { ImageResponse } from "next/og";

export const runtime = "edge";
export const revalidate = 31536000;

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #d47c3a 0%, #b86028 60%, #9a4d20 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "22%",
          fontSize: 320,
        }}
      >
        🔥
      </div>
    ),
    { width: 512, height: 512 }
  );
}
