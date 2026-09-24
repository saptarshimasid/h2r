import { ImageResponse } from "next/og";

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
          background: "#090b0a",
          borderRadius: 4,
        }}
      >
        {/* Skewed bars — matching the brand-mark in the header */}
        <div
          style={{
            display: "flex",
            gap: 2,
            transform: "skewX(-25deg)",
          }}
        >
          <div style={{ width: 4, height: 18, background: "#9aff00", borderRadius: 1 }} />
          <div style={{ width: 4, height: 13, background: "#9aff00", borderRadius: 1 }} />
          <div style={{ width: 4, height: 8, background: "#9aff00", borderRadius: 1 }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
