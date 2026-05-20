import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
  (
  <div
  style={{
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#efe7d7",
  borderRadius: 6,
  }}
  >
  {/* Book spine */}
  <div style={{
  display: "flex",
  width: 22,
  height: 20,
  position: "relative",
  }}>
  {/* Left page */}
  <div style={{
  width: 9, height: 20,
  background: "#fff",
  border: "1.5px solid #8b3a1f",
  borderRight: "none",
  borderRadius: "2px 0 0 2px",
  }} />
  {/* Spine */}
  <div style={{
  width: 4, height: 20,
  background: "#8b3a1f",
  }} />
  {/* Right page */}
  <div style={{
  width: 9, height: 20,
  background: "#fff",
  border: "1.5px solid #8b3a1f",
  borderLeft: "none",
  borderRadius: "0 2px 2px 0",
  }} />
  </div>
  </div>
  ),
  { ...size }
  );
}
