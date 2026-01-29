"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function PrintPortal({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div id="print-root" className="print-only-root">
      {children}
    </div>,
    document.body,
  );
}
