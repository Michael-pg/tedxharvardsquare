import Image from "next/image";
import type { Image as ImageContent, Partner } from "@/content";

/**
 * The partners' logos in one quiet row, white on black. Each links to the
 * partner's site when Studio has a URL for it. Logos share one height and keep
 * their own width, so no partner is boxed into a tile.
 *
 * Uses the white "on dark" logo; a partner with only a full-colour logo is
 * flattened to white so the row stays one colour.
 */
export function PartnerLogos({ partners }: { partners: Partner[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-16 gap-y-10">
      {partners.map((partner) => {
        const logo: ImageContent | undefined = partner.logoOnDark ?? partner.logo;
        if (!logo) return null;
        const ratio = logo.width && logo.height ? logo.width / logo.height : 3;
        const img = (
          <Image
            src={logo.src}
            alt={logo.alt || `${partner.name} logo`}
            width={Math.round(80 * ratio)}
            height={80}
            className={`h-8 w-auto opacity-70 transition-opacity duration-fast group-hover:opacity-100 md:h-10 ${
              partner.logoOnDark ? "" : "brightness-0 invert"
            }`}
          />
        );
        return (
          <li key={partner.slug}>
            {partner.url ? (
              <a href={partner.url} target="_blank" rel="noopener noreferrer" className="group block">
                {img}
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : (
              img
            )}
          </li>
        );
      })}
    </ul>
  );
}
