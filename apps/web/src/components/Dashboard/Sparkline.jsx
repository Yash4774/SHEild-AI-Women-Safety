export function Sparkline({ values, color = "#7c3aed" }) {
  if (!values || values.length < 2) return null;
  const max = Math.max(...values, 1);
  const w = 80,
    h = 28;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - (v / max) * h;
      return x + "," + y;
    })
    .join(" ");
  return (
    <svg
      width={w}
      height={h}
      viewBox={"0 0 " + w + " " + h}
      style={{ overflow: "visible" }}
    >
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={parseFloat(pts.split(" ").pop().split(",")[0])}
        cy={parseFloat(pts.split(" ").pop().split(",")[1])}
        r="2.5"
        fill={color}
      />
    </svg>
  );
}
