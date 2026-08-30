import Image from "next/image";
import { cn } from "@/lib/utils";

export default function Logo({
  className,
  size = 48,
  priority = false,
}: {
  className?: string;
  size?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt="ספר המתכונים"
      width={size}
      height={size}
      priority={priority}
      className={cn("object-contain", className)}
    />
  );
}
