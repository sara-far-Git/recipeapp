"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  count?: number;
  interactive?: boolean;
  userRating?: number | null;
  onRate?: (score: number) => void;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({
  rating,
  count,
  interactive = false,
  userRating,
  onRate,
  size = "md",
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const sizes = { sm: "w-3.5 h-3.5", md: "w-5 h-5", lg: "w-7 h-7" };
  const iconSize = sizes[size];
  const displayRating = hovered || userRating || rating;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRate?.(star)}
            onMouseEnter={() => interactive && setHovered(star)}
            onMouseLeave={() => interactive && setHovered(0)}
            disabled={!interactive}
            className={cn(
              "transition-all duration-200",
              interactive && "hover:scale-125 cursor-pointer",
              !interactive && "cursor-default"
            )}
          >
            <Star
              className={cn(
                iconSize,
                "transition-colors duration-200",
                star <= Math.round(displayRating)
                  ? "fill-fire-200 text-fire-300"
                  : "text-smoke-500"
              )}
            />
          </button>
        ))}
      </div>
      {count !== undefined && count > 0 && (
        <span className="text-xs text-gray-500 mr-1">
          ({rating.toFixed(1)} · {count})
        </span>
      )}
    </div>
  );
}
