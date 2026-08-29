import type { Metadata } from "next";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { PageHeader, Pill, Stat } from "@/components/ui/Panel";
import { certifications, certStats } from "@/lib/content";

export const metadata: Metadata = {
  title: "Certifications",
  description:
    "Credentials earned and in progress — CTIA Level III, Certified Cybersecurity Professional, ISC2 CC candidate, Google Cybersecurity Professional, and Cisco Networking Academy.",
};

export default function CertificationsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 pb-24 sm:px-6 lg:px-10">
      <PageHeader
        eyebrow="fw-certs — gi0/4"
        title="Credentials, earned and in flight"
        lede="Rendered as an access-control list, because that is what a credential is: a rule that says what you are trusted to do. PERMIT means earned. PENDING means in progress."
      />

      {/* stat strip */}
      <section className="mt-10 grid grid-cols-3 gap-px overflow-hidden rounded-panel border border-line bg-line">
        <div className="bg-panel px-4 py-5">
          <Stat value={String(certStats.total)} label="Total rules" tone="text" />
        </div>
        <div className="bg-panel px-4 py-5">
          <Stat value={String(certStats.active)} label="Permit" tone="ok" />
        </div>
        <div className="bg-panel px-4 py-5">
          <Stat value={String(certStats.pending)} label="Pending" tone="accent" />
        </div>
      </section>

      {/* ACL table */}
      <section className="mt-6">
        <div className="overflow-x-auto rounded-panel border border-line bg-panel">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <caption className="sr-only">
              Certifications listed as access-control list entries
            </caption>
            <thead>
              <tr className="border-b border-line bg-panel-2">
                {["Rule", "Action", "Credential", "Issuer", "Verify"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-4 py-2.5 text-left font-mono text-[0.6rem] font-medium tracking-[0.13em] text-dim uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {certifications.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-line-soft transition-colors last:border-b-0 hover:bg-panel-2"
                >
                  <td className="px-4 py-3 font-mono text-[0.78rem] text-dim tabular-nums">
                    {c.id}
                  </td>
                  <td className="px-4 py-3">
                    <Pill tone={c.action === "PERMIT" ? "ok" : "warn"}>
                      {c.action}
                    </Pill>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-cond text-[1.02rem] leading-snug font-semibold text-text">
                      {c.name}
                    </span>
                    {c.status === "candidate" && (
                      <span className="mt-1 block font-mono text-[0.58rem] tracking-[0.1em] text-dim uppercase">
                        Candidate status
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[0.88rem] text-muted">
                    {c.issuer}
                  </td>
                  <td className="px-4 py-3">
                    {c.verifyUrl ? (
                      <a
                        href={c.verifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-[0.64rem] tracking-[0.1em] text-accent uppercase hover:underline"
                      >
                        <ExternalLink size={11} /> Verify
                      </a>
                    ) : (
                      <span className="font-mono text-[0.62rem] tracking-[0.1em] text-dim uppercase">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 flex items-start gap-2 text-[0.85rem] leading-relaxed text-dim">
          <ShieldCheck size={14} className="mt-0.5 shrink-0 text-accent-deep" />
          Implicit deny at the end of the list — anything not stated here is
          something I have not earned, and I will not claim it.
        </p>
      </section>
    </div>
  );
}
