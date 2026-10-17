import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import type { Image as ContentImage } from "@/content/types";

export type Connection = { title: string; body?: string; href: string };

/**
 * The people in the room: a short statement about who comes and what happens
 * between the talks, then the ways to stay connected, set as hairline rows
 * (type and an arrow, no cards). The edition's audience photograph sits
 * beside it when there is one.
 */
export function Connections({
  heading,
  body,
  image,
  links,
}: {
  heading: string;
  body?: string;
  image?: ContentImage;
  links: Connection[];
}) {
  const focus = image?.focus ?? { x: 0.5, y: 0.5 };
  return (
    <div className="grid grid-cols-4 items-center gap-x-6 gap-y-14 md:grid-cols-12">
      {image && (
        <Reveal className="col-span-4 md:col-span-5">
          <div className="relative aspect-4/5 overflow-hidden bg-ink-900">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              style={{ objectPosition: `${focus.x * 100}% ${focus.y * 100}%` }}
              className="object-cover"
            />
          </div>
        </Reveal>
      )}
      <div className={image ? "col-span-4 flex flex-col gap-10 md:col-span-6 md:col-start-7" : "col-span-4 flex flex-col gap-10 md:col-span-9"}>
        <div className="flex flex-col gap-6">
          <Reveal as="h2" className="text-display font-medium text-balance">
            <span id="connections-title">{heading}</span>
          </Reveal>
          {body && (
            <Reveal as="p" className="max-w-xl text-lead text-ink-300">
              {body}
            </Reveal>
          )}
        </div>
        {links.length > 0 && (
          <Reveal as="ul" stagger>
            {links.map((link) => {
              const external = /^https?:\/\//.test(link.href);
              const Arrow = external ? ArrowUpRight : ArrowRight;
              return (
                <li key={link.href} className="border-t border-rule last:border-b">
                  <Link
                    href={link.href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group flex items-center justify-between gap-6 py-5"
                  >
                    <span className="flex flex-col gap-1">
                      <span className="text-heading font-medium text-balance">{link.title}</span>
                      {link.body && <span className="max-w-md text-body text-muted">{link.body}</span>}
                    </span>
                    <Arrow
                      aria-hidden="true"
                      className="size-5 shrink-0 text-muted transition-colors duration-fast group-hover:text-foreground group-focus-visible:text-foreground"
                    />
                  </Link>
                </li>
              );
            })}
          </Reveal>
        )}
      </div>
    </div>
  );
}
