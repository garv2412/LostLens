import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Tag, Sparkles } from "lucide-react";
import { Listing } from "@/lib/types/listing";
import { ListingTypeBadge, ListingStatusBadge } from "./ListingStatusBadge";
import { formatDate } from "@/lib/utils/formatters";

export interface ListingCardProps {
  listing: Listing;
  matchScore?: number;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, matchScore }) => {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group flex flex-col rounded-xl border border-slate-200/80 bg-white shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden"
    >
      {/* Image Preview Container */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        {listing.imageUrl ? (
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            No image available
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <ListingTypeBadge type={listing.type} />
          <ListingStatusBadge status={listing.status} />
        </div>

        {matchScore !== undefined && (
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-600/90 text-white text-[11px] font-bold backdrop-blur-xs shadow-sm">
            <Sparkles className="h-3 w-3" />
            <span>{Math.round(matchScore)}%</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold mb-1">
          <Tag className="h-3.5 w-3.5" />
          <span>{listing.category}</span>
        </div>

        <h3 className="font-semibold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1.5">
          {listing.title}
        </h3>

        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
          {listing.description}
        </p>

        {/* Detected visual labels pills */}
        {listing.detectedLabels && listing.detectedLabels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {listing.detectedLabels.slice(0, 3).map((lbl) => (
              <span
                key={lbl.name}
                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
              >
                {lbl.name}
              </span>
            ))}
          </div>
        )}

        {/* Footer Metadata */}
        <div className="mt-auto pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1 truncate max-w-[60%]">
            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="truncate">{listing.location}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Calendar className="h-3 w-3 text-slate-400" />
            <span>{formatDate(listing.date)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
