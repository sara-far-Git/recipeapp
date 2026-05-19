import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #d45a2a 0%, #b8401a 60%, #7a2412 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "30%",
          fontSize: 20,
        }}
      >
        🔥
      </div>
    ),
    { ...size }
  );
}
