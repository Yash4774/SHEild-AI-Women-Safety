import { useRef, useEffect } from "react";

export function RadarHero() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf,
      t = 0;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const nodes = Array.from({ length: 22 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0003,
      vy: (Math.random() - 0.5) * 0.0003,
      r: Math.random() * 2.5 + 1.5,
      phase: Math.random() * Math.PI * 2,
      col: ["#7c3aed", "#06b6d4", "#10b981", "#db2777", "#f59e0b"][
        Math.floor(Math.random() * 5)
      ],
    }));
    const draw = () => {
      t += 0.008;
      const W = canvas.width,
        H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const hs = 44;
      ctx.strokeStyle = "rgba(124,58,237,0.05)";
      ctx.lineWidth = 0.5;
      for (let row = -1; row < H / (hs * 1.5) + 2; row++) {
        for (let col = -1; col < W / (hs * 1.732) + 2; col++) {
          const x = col * hs * 1.732 + (row % 2) * hs * 0.866,
            y = row * hs * 1.5;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI) / 3 - Math.PI / 6;
            const px = x + hs * Math.cos(a),
              py = y + hs * Math.sin(a);
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      nodes.forEach((n, i) => {
        nodes.forEach((m, j) => {
          if (j <= i) return;
          const dx = (n.x - m.x) * W,
            dy = (n.y - m.y) * H,
            d = Math.hypot(dx, dy);
          if (d < 185) {
            ctx.strokeStyle = `rgba(124,58,237,${(1 - d / 185) * 0.1})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(n.x * W, n.y * H);
            ctx.lineTo(m.x * W, m.y * H);
            ctx.stroke();
          }
        });
      });
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.phase += 0.04;
        if (n.x < 0 || n.x > 1) n.vx *= -1;
        if (n.y < 0 || n.y > 1) n.vy *= -1;
        const pr = n.r + Math.sin(n.phase) * 1.5;
        const g = ctx.createRadialGradient(
          n.x * W,
          n.y * H,
          0,
          n.x * W,
          n.y * H,
          pr * 5,
        );
        g.addColorStop(0, n.col + "60");
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x * W, n.y * H, pr * 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = n.col;
        ctx.beginPath();
        ctx.arc(n.x * W, n.y * H, pr, 0, Math.PI * 2);
        ctx.fill();
      });
      const cx = W * 0.5,
        cy = H * 0.44,
        rr = Math.min(W, H) * 0.35;
      ctx.strokeStyle = "rgba(124,58,237,0.1)";
      ctx.lineWidth = 1;
      [0.38, 0.68, 1].forEach((s) => {
        ctx.beginPath();
        ctx.arc(cx, cy, rr * s, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.strokeStyle = "rgba(124,58,237,0.06)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(cx - rr, cy);
      ctx.lineTo(cx + rr, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - rr);
      ctx.lineTo(cx, cy + rr);
      ctx.stroke();
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.8);
      const sg = ctx.createLinearGradient(0, 0, rr, 0);
      sg.addColorStop(0, "rgba(124,58,237,0.32)");
      sg.addColorStop(1, "rgba(124,58,237,0)");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, rr, -0.52, 0.52);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
