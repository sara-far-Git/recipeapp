/**
 * The frame the privacy policy, the terms and the accessibility statement
 * share: the same heading, sections and footer line, so the three read as one
 * set and a fix to one reaches all of them.
 */
import { isPlaceholder } from "@/lib/legal";

export function LegalPage({
  eyebrow,
  title,
  updated,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="experience-hero text-center mb-12">
        <span className="eyebrow mb-4 justify-center">
          <span className="plus-badge text-bark-500" aria-hidden="true">
            <svg viewBox="0 0 12 12" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M6 1v10M1 6h10" />
            </svg>
          </span>
          {eyebrow}
        </span>
        <h1 className="display-lg text-bark-500 mb-3">{title}</h1>
        <p className="text-bark-400 text-[15px] font-semibold">עדכון אחרון: {updated}</p>
        {intro && <div className="text-bark-400 text-[15px] leading-relaxed mt-5 text-right">{intro}</div>}
      </div>

      <div>{children}</div>

      <div className="text-center mt-12 pt-6 border-t border-surface-300">
        <p className="text-bark-400 text-xs">עדכון אחרון: {updated}</p>
      </div>
    </div>
  );
}

export function LegalSection({
  id,
  title,
  children,
  last = false,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined}
      className={last ? "py-6 scroll-mt-24" : "py-6 border-b border-surface-300 scroll-mt-24"}>
      <h2 id={id ? `${id}-title` : undefined} className="section-title text-bark-500 mb-3">{title}</h2>
      <div className="legal-body text-bark-400 text-[15px] leading-relaxed space-y-3" style={{ lineHeight: 1.75 }}>
        {children}
      </div>
    </section>
  );
}

/** A detail from lib/legal — highlighted while it is still a placeholder. */
export function Detail({ value }: { value: string }) {
  if (!isPlaceholder(value)) return <>{value}</>;
  return (
    <mark className="px-1 font-bold" style={{ background: "#FCE7A8", color: "#3D2A00" }}>
      {value}
    </mark>
  );
}

export function MailLink({ email }: { email: string }) {
  return (
    <a href={`mailto:${email}`} className="font-semibold underline text-bark-500" dir="ltr">
      {email}
    </a>
  );
}
