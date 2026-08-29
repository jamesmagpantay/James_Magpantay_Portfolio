/**
 * Shared content types.
 *
 * Everything the site renders comes from the files in this folder.
 * To update the portfolio, edit the data — not the components.
 */

export type NodeKind =
  | "core"
  | "server"
  | "firewall"
  | "ids"
  | "ap"
  | "host"
  | "mail";

export type SiteSection = {
  /** Route path, e.g. "/projects" */
  href: string;
  /** Human label used in the nav rail */
  label: string;
  /** Device hostname shown on the topology node */
  hostname: string;
  /** Device class — drives the node icon and color */
  kind: NodeKind;
  /** Interface the node hangs off, e.g. "gi0/2" */
  port: string;
  /** One line shown on hover and in the node tooltip */
  blurb: string;
};

export type Role = {
  org: string;
  title: string;
  location: string;
  start: string;
  end: string;
  /** true when this is a paid/professional role rather than an org position */
  kind: "work" | "org" | "program";
  highlights: string[];
  tags: string[];
};

export type Project = {
  slug: string;
  name: string;
  role: string;
  org?: string;
  date: string;
  /** One-sentence pitch */
  summary: string;
  /** The problem it existed to solve */
  problem: string;
  highlights: string[];
  stack: string[];
  /** "security" projects get the shield treatment on the card */
  category: "security" | "ai" | "systems";
  repo?: string;
  demo?: string;
  /** Headline metric, rendered large on the card */
  metric?: { value: string; label: string };
};

export type Certification = {
  id: number;
  name: string;
  issuer: string;
  status: "active" | "in-progress" | "candidate";
  year?: string;
  verifyUrl?: string;
  /** Rendered in the ACL "action" column */
  action: "PERMIT" | "PENDING";
};

export type EventEntry = {
  slug: string;
  name: string;
  kind: "hackathon" | "ctf" | "workshop" | "conference" | "program";
  role: string;
  project?: string;
  date: string;
  location: string;
  result?: string;
  takeaway: string;
  highlights: string[];
  /** Files under /public/events/ — add photos here */
  photos: string[];
};

export type Award = {
  name: string;
  detail?: string;
  year: string;
};

export type Education = {
  school: string;
  credential: string;
  location: string;
  period: string;
  status: "current" | "complete";
  notes: string[];
};

export type SkillGroup = {
  group: string;
  items: string[];
};

export type Hobby = {
  name: string;
  detail: string;
  /** lucide-react icon name */
  icon: string;
  /** Set false until James confirms — placeholders are flagged in the UI */
  confirmed: boolean;
};
