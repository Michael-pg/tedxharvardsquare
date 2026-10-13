import Image from "next/image";
import type { Image as ImageContent, Partner } from "@/content";

/**
 * Current partners, each given a wide cell of its own between hairlines, the
 * logo centred in white with the partner's name beneath. The cells give the
 * partners their weight; the logos themselves stay capped.
 *
 * TEDx rules: partner logos never appear on the homepage, and wherever they
 * do appear they must be smaller than the event's own logo (the header lockup
 * is 40px / 48px tall and about 142px wide, so these fit within 36px / 44px
 * tall and 120px / 136px wide).
 *
 * Uses the white "on dark" logo; a partner with only a full-colour logo is
 * flattened to white so the set stays one colour. Links to the partner's site
 * when Studio has a URL for it.
 */
export function PartnerWall({ partners }: { partners: Partner[] }) {
  return (
    <ul className="grid grid-cols-1 border-t border-l border-rule sm:grid-cols-2 lg:grid-cols-3">
      {partners.map((partner) => {
        const logo: ImageContent | undefined = partner.logoOnDark ?? partner.logo;
        if (!logo) return null;
        const ratio = logo.width && logo.height ? logo.width / logo.height : 3;
        const body = (
          <>
            <Image
              src={logo.src}
              alt={logo.alt || `${partner.name} logo`}
              width={Math.round(176 * ratio)}
              height={176}
              className={`h-9 w-auto max-w-30 object-contain opacity-80 transition-opacity duration-fast group-hover:opacity-100 md:h-11 md:max-w-34 ${
                partner.logoOnDark ? "" : "brightness-0 invert"
              }`}
            />
            <span aria-hidden className="absolute bottom-5 left-6 text-small text-muted">
              {partner.name}
            </span>
          </>
        );
        const cell = "group flex size-full items-center justify-center";
        return (
          <li key={partner.slug} className="relative aspect-2/1 border-r border-b border-rule">
            {partner.url ? (
              <a href={partner.url} target="_blank" rel="noopener noreferrer" className={cell}>
                {body}
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : (
              <div className={cell}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
