import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0F172A",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div style={{ width: 110, height: 36, background: "#C9B8A6", borderRadius: 4 }} />
          <div style={{ width: 88, height: 56, background: "#1E293B", borderRadius: 4 }} />
          <div style={{ width: 88, height: 14, background: "#D97706" }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
