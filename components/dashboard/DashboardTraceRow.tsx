import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { formatArchiveDate } from "@/lib/utils/dates";
import type { TimelineItem } from "@/lib/queries/activities";

function getStatus(item: TimelineItem) {
  if (item.status === "PENDING") return { label: "Extracting…", tone: "pending" };
  if (item.status === "FAILED") return { label: "Extraction failed", tone: "failed" };
  if (item.needsReview) return { label: "Needs review", tone: "review" };
  if (item.eventStatus && item.eventStatus !== "completed") {
    return { label: item.eventStatus, tone: "review" };
  }
  return null;
}

export function DashboardTraceRow({
  item, demo = false, index, isSameDayAsPrev = false, isSameDayAsNext = false,
}: {
  item: TimelineItem;
  demo?: boolean;
  index: number;
  isSameDayAsPrev?: boolean;
  isSameDayAsNext?: boolean;
}) {
  const status = getStatus(item);
  const suffix = demo ? "?demo=jimmy" : "";
  const displayTime = item.timeHint ||
    (item.timeOfDay && item.timeOfDay !== "unknown" ? item.timeOfDay : null);

  return (
    <article className={"dashboard-trace" + (isSameDayAsPrev ? " dashboard-trace--same-day" : "")}
      data-index={index} data-continues={isSameDayAsNext || undefined}>
      <div className="dashboard-trace-date">
        <time dateTime={item.occurredAt} className={isSameDayAsPrev ? "sr-only" : undefined}>
          {formatArchiveDate(item.occurredAt)}
        </time>
        {isSameDayAsPrev && <span className="dashboard-date-continuation" aria-hidden="true" />}
        {displayTime && <span>{displayTime}</span>}
      </div>

      <div className="dashboard-trace-body">
        <div className="dashboard-trace-meta">
          <span className="dashboard-trace-category">{item.category ?? "other"}</span>
          {item.isFirstTime && <span>First time</span>}
          {status && (
            <span className={"dashboard-trace-status dashboard-trace-status--" + status.tone}
              role={status.tone === "failed" ? "alert" : "status"}>
              {item.needsReview && <AlertTriangle aria-hidden="true" size={12} />}
              {status.label}
            </span>
          )}
        </div>
        <p className="dashboard-trace-summary">
          <Link href={"/timeline" + suffix}>{item.summary}</Link>
        </p>
        {(item.people.length > 0 || item.places.length > 0 || item.topics.length > 0) && (
          <div className="dashboard-trace-context">
            {item.people.map((person) => (
              <Link key={person.id} href={"/people" + suffix}>{person.name}</Link>
            ))}
            {item.places.map((place) => (
              <Link key={place.id} href={"/places" + suffix}>{place.name}</Link>
            ))}
            {item.topics.slice(0, 2).map((topic) => (
              <span key={topic.id}>#{topic.name}</span>
            ))}
            {item.topics.length > 2 && <span>+{item.topics.length - 2}</span>}
          </div>
        )}
      </div>
      {item.imageUrls?.[0] && (
        <div className="dashboard-trace-thumbnail">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageUrls[0]} alt={"Image accompanying: " + item.summary}
            loading="lazy" width={72} height={72} />
        </div>
      )}
    </article>
  );
}
