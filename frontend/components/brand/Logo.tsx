import Image from "next/image";
import { cn } from "@/lib/utils";

export default function Logo({
  className,
  size = 48,
  priority = false,
  solid = false,
  transparent = false,
}: {
  className?: string;
  size?: number;
  priority?: boolean;
  solid?: boolean;
  transparent?: boolean;
}) {
  const transparentWidth = Math.round(size * (870 / 606));

  return (
    <Image
      src={transparent ? "/logo-transparent.png" : solid ? "/logo-solid.png" : "/logo.png"}
      alt="ספר המתכונים"
      width={transparent ? transparentWidth : size}
      height={size}
      priority={priority}
      className={cn("object-contain", className)}
    />
  );
}
