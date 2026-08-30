import Image from "next/image";
import { cn } from "@/lib/utils";

export default function Logo({
  className,
  size = 48,
  priority = false,
  solid = false,
}: {
  className?: string;
  size?: number;
  priority?: boolean;
  solid?: boolean;
}) {
  return (
    <Image
      src={solid ? "/logo-solid.png" : "/logo.png"}
      alt="ספר המתכונים"
      width={size}
      height={size}
      priority={priority}
      className={cn("object-contain", className)}
    />
  );
}
