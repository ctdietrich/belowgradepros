import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
            gap: 2,
          }}
        >
          <div style={{ width: 20, height: 7, background: "#C9B8A6" }} />
          <div style={{ width: 16, height: 10, background: "#1E293B" }} />
          <div style={{ width: 16, height: 3, background: "#D97706" }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
