"use client";

import { useEffect, useRef } from "react";
import { animate } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
}

export function AnimatedCounter({ value, duration = 1.5 }: AnimatedCounterProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const node = nodeRef.current;
    if (node) {
      // Animate from 0 to value only on initial mount/change
      const from = hasAnimated.current ? parseInt(node.textContent || "0", 10) : 0;
      
      const controls = animate(from, value, {
        duration,
        ease: "easeOut",
        onUpdate(v) {
          node.textContent = Math.round(v).toString();
        },
      });
      
      hasAnimated.current = true;
      return () => controls.stop();
    }
  }, [value, duration]);

  return <span ref={nodeRef}>{value}</span>;
}
