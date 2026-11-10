import { ImageResponse } from "next/og";

export const alt = "Skander Nefli — Full-Stack Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "#050505",
          color: "#f1eee6",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            color: "#ff3b12",
            fontSize: 24,
            letterSpacing: "0.18em",
          }}
        >
          SKANDER NEFLI
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
            }}
          >
            Full-Stack Software Engineer
          </div>
          <div style={{ color: "#aaa69e", fontSize: 28 }}>
            Integration Specialist · Concept to launch
          </div>
        </div>
        <div
          style={{
            color: "#ff3b12",
            fontSize: 20,
            letterSpacing: "0.12em",
          }}
        >
          WWW.SKANDERNEFLI.EU
        </div>
      </div>
    ),
    size,
  );
}
