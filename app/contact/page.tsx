import type { Metadata } from "next";
import { Mail, FileText, MapPin, KeyRound } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { PageHeader, Panel, Pill } from "@/components/ui/Panel";
import { profile } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${profile.name} — email, GitHub, LinkedIn, and security disclosure details.`,
};

const CHANNELS = [
  {
    label: "Email",
    value: profile.email,
    href: `mailto:${profile.email}`,
    icon: Mail,
    external: false,
    primary: true,
  },
  {
    label: "LinkedIn",
    value: "james-randall-magpantay",
    href: profile.socials.linkedin,
    icon: LinkedinIcon,
    external: true,
    primary: false,
  },
  {
    label: "GitHub",
    value: profile.handle,
    href: profile.socials.github,
    icon: GithubIcon,
    external: true,
    primary: false,
  },
  {
    label: "Curriculum vitae",
    value: "Download PDF",
    href: profile.resume,
    icon: FileText,
    external: true,
    primary: false,
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 pb-24 sm:px-6 lg:px-10">
      <PageHeader
        eyebrow="mx-contact — gi0/8"
        title="Reach me, and how to do it securely"
        lede="Open to security internships, entry-level roles, and any conversation about network defence or AI red teaming. Email is the fastest route."
        meta={<Pill tone="ok">{profile.availability}</Pill>}
      />

      <section className="mt-10">
        <ul className="grid gap-px overflow-hidden rounded-panel border border-line bg-line">
          {CHANNELS.map((c) => {
            const Icon = c.icon;
            return (
              <li key={c.label}>
                <a
                  href={c.href}
                  {...(c.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="group flex items-center gap-4 bg-panel px-4 py-4 transition-colors hover:bg-panel-2"
                >
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-[3px] border transition-colors ${
                      c.primary
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : "border-line bg-panel-2 text-dim group-hover:text-accent"
                    }`}
                  >
                    <Icon size={15} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-mono text-[0.6rem] tracking-[0.13em] text-dim uppercase">
                      {c.label}
                    </span>
                    <span className="mt-0.5 block truncate font-cond text-[1.05rem] font-semibold text-text">
                      {c.value}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <Panel title="Location">
          <p className="inline-flex items-center gap-2 text-[0.95rem] text-muted">
            <MapPin size={14} className="text-accent-deep" />
            {profile.location}
          </p>
          <p className="mt-2 text-[0.88rem] leading-relaxed text-dim">
            Available for on-site work in Metro Manila and remote engagements.
          </p>
        </Panel>

        <Panel title="Security disclosure" accent="warn">
          <p className="inline-flex items-center gap-2 font-cond text-[1.02rem] font-semibold">
            <KeyRound size={14} className="text-warn" />
            Coming with the hardening pass
          </p>
          <p className="mt-2 text-[0.88rem] leading-relaxed text-muted">
            A signed{" "}
            <code className="rounded-[3px] border border-line bg-panel-2 px-1 py-0.5 font-mono text-[0.85em] text-accent-soft">
              /.well-known/security.txt
            </code>{" "}
            and a published PGP key land in the security phase of this build. If
            you find something wrong with this site before then, email me.
          </p>
        </Panel>
      </section>
    </div>
  );
}
