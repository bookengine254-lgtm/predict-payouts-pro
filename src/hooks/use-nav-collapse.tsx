import { useEffect, useRef, useState } from "react";

/**
 * Mobile chrome auto-hide.
 *
 * Rules, tuned so the bars never flicker:
 * - Always visible near the top of a page and right after a route change.
 * - Direction changes only count once the reader has moved a meaningful
 *   distance (`travel`) in that direction, which kills momentum jitter.
 * - Hidden only while scrolling down past `threshold`; any real upward
 *   intent brings the chrome straight back.
 */
export function useNavCollapse(key: string, threshold = 120, travel = 28) {
  const [collapsed, setCollapsed] = useState(false);
  const lastY = useRef(0);
  const anchor = useRef(0);
  const dir = useRef<"up" | "down">("up");
  const frame = useRef(0);

  useEffect(() => {
    setCollapsed(false);
    lastY.current = window.scrollY;
    anchor.current = window.scrollY;
    dir.current = "up";
  }, [key]);

  useEffect(() => {
    const onScroll = () => {
      if (frame.current) return;
      frame.current = window.requestAnimationFrame(() => {
        frame.current = 0;
        const y = Math.max(0, window.scrollY);
        const dy = y - lastY.current;
        lastY.current = y;
        if (dy === 0) return;

        const nextDir = dy > 0 ? "down" : "up";
        if (nextDir !== dir.current) {
          // Direction flipped — restart measuring from here.
          dir.current = nextDir;
          anchor.current = y;
          return;
        }

        if (y <= threshold) {
          anchor.current = y;
          setCollapsed(false);
          return;
        }

        if (Math.abs(y - anchor.current) < travel) return;
        anchor.current = y;
        setCollapsed(nextDir === "down");
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame.current) window.cancelAnimationFrame(frame.current);
    };
  }, [threshold, travel]);

  return collapsed;
}
