import { ImageResponse } from "next/og";

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
          background: "#050505",
          color: "#f1eee6",
          fontSize: 106,
          fontWeight: 700,
          letterSpacing: "-0.1em",
        }}
      >
        <span>SN</span>
        <span style={{ color: "#ff3b12" }}>.</span>
      </div>
    ),
    size,
  );
}
