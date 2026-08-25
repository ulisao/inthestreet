"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useState } from "react";

export function ProveedorConvex({ children }: { children: React.ReactNode }) {
  const [cliente] = useState(
    () => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!),
  );

  return <ConvexProvider client={cliente}>{children}</ConvexProvider>;
}
