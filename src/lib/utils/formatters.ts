export function formatDate(dateString: string): string {
  if (!dateString) return "";
  try {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? dateString : d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

export function formatRelativeTime(isoString: string): string {
  if (!isoString) return "";
  try {
    const now = new Date();
    const then = new Date(isoString);
    const diffSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffSeconds < 60) return "just now";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(isoString.slice(0, 10));
  } catch {
    return isoString;
  }
}

export function getScoreBadgeClass(score: number): {
  badge: string;
  text: string;
  bg: string;
  border: string;
} {
  if (score >= 75) {
    return {
      badge: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
      text: "text-emerald-700 dark:text-emerald-400",
      bg: "bg-emerald-500",
      border: "border-emerald-500",
    };
  }
  if (score >= 45) {
    return {
      badge: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60",
      text: "text-indigo-700 dark:text-indigo-400",
      bg: "bg-indigo-500",
      border: "border-indigo-500",
    };
  }
  return {
    badge: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-500",
    border: "border-amber-500",
  };
}
