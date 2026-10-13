import React from "react";
import { ListingStatus, ListingType } from "@/lib/types/listing";
import { Badge } from "../ui/Badge";

export const ListingTypeBadge: React.FC<{ type: ListingType }> = ({ type }) => {
  if (type === "lost") {
    return (
      <Badge variant="warning" className="font-semibold uppercase tracking-wider text-[10px]">
        Lost Report
      </Badge>
    );
  }
  return (
    <Badge variant="indigo" className="font-semibold uppercase tracking-wider text-[10px]">
      Found Item
    </Badge>
  );
};

export const ListingStatusBadge: React.FC<{ status: ListingStatus }> = ({ status }) => {
  switch (status) {
    case "active":
      return (
        <Badge variant="default" className="text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          Active
        </Badge>
      );
    case "in_claim":
      return (
        <Badge variant="warning">
          Claim in Review
        </Badge>
      );
    case "resolved":
      return (
        <Badge variant="success">
          Recovered
        </Badge>
      );
    case "closed":
      return (
        <Badge variant="outline" className="text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700">
          Closed
        </Badge>
      );
    default:
      return null;
  }
};
