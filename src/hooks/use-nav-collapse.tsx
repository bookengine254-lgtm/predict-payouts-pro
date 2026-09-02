import { useEffect, useRef, useState } from "react";

/**
 * Mobile chrome auto-collapse.
 *
 * Rules, deliberately conservative so navigation never feels lost:
 * - Collapse only after the reader has committed to the page (past `threshold`).
 * - Collapse on downward intent, restore immediately on any upward intent.
 * - Always expanded at the very top of a page and after a route change.
 * - Small jitter (< 6px) is ignored so momentum scrolling doesn't flicker.
 */
export function useNavCollapse(key: string, threshold = 96) {
  const [collapsed, setCollapsed] = useState(false);
  const lastY = useRef(0);
  const frame = useRef(0);

  useEffect(() => {
    setCollapsed(false);
    lastY.current = window.scrollY;
  }, [key]);

  useEffect(() => {
    const onScroll = () => {
      if (frame.current) return;
      frame.current = window.requestAnimationFrame(() => {
        frame.current = 0;
        const y = window.scrollY;
        const dy = y - lastY.current;
        if (Math.abs(dy) < 6) return;
        lastY.current = y;
        if (y < threshold) setCollapsed(false);
        else setCollapsed(dy > 0);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame.current) window.cancelAnimationFrame(frame.current);
    };
  }, [threshold]);

  return collapsed;
}
