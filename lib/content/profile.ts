import type { Education, SkillGroup, Award, SiteSection } from "./types";

export const profile = {
  name: "James Randall A. Magpantay",
  shortName: "James Magpantay",
  handle: "jamesmagpantay",
  title: "Cybersecurity & Network Security",
  tagline: "IT student building and breaking secure systems.",
  /** Used on the home hero — first person, present tense, no buzzwords. */
  intro:
    "I am an Information Technology student at the Polytechnic University of the Philippines, focused on network security, secure development, and AI red teaming. I spend most of my time on the parts of security you can actually touch — configuring segmented networks, auditing code for real vulnerabilities, and pulling apart systems to find where they give.",
  location: "Antipolo City, Philippines",
  email: "jamess.a.magpantay@gmail.com",
  phone: "0991 586 3298",
  photo: "/james-magpantay.jpg",
  resume: "/James_Magpantay_CV.pdf",
  socials: {
    github: "https://github.com/jamesmagpantay",
    linkedin: "https://www.linkedin.com/in/james-randall-magpantay",
  },
  /** Shown in the status bar as the current operational focus. */
  currentFocus: "Google Cybersecurity Professional",
  availability: "Open to security internships & entry roles",
} as const;

export const objective =
  "A dedicated and detail-oriented Information Technology student with a strong foundation in networking, cybersecurity, and systems administration. Seeking opportunities in IT, network, and security-focused roles where I can apply hands-on technical skills to support and secure organizational infrastructure.";

export const education: Education[] = [
  {
    school: "Polytechnic University of the Philippines",
    credential: "BS Information Technology",
    location: "Manila, Philippines",
    period: "Expected 2028",
    status: "current",
    notes: [
      "Relevant coursework: Operating Systems, Network Administration, Data Communications and Networking",
      "Gokongwei Brothers Foundation Scholar",
      "President's Lister, AY 2024–2025",
    ],
  },
  {
    school: "FEU Roosevelt Cainta",
    credential: "STEM — Science, Technology, Engineering & Mathematics",
    location: "Cainta, Rizal, Philippines",
    period: "Graduated 2024",
    status: "complete",
    notes: [
      "Top 3 Overall, Senior High School",
      "Best in Research and Innovation",
      "Graduated With High Honors",
    ],
  },
];

export const skills: SkillGroup[] = [
  {
    group: "Security & Governance",
    items: [
      "CIA Triad",
      "AAA",
      "Network Security Fundamentals",
      "ISC2 CC Standards",
      "Security Auditing",
      "CWE Classification",
    ],
  },
  {
    group: "Networking",
    items: [
      "IPv4/IPv6 Subnetting",
      "VLANs",
      "Trunking",
      "STP",
      "DHCP",
      "DNS",
      "ACLs",
      "EtherChannel",
      "Routing",
      "OSI & TCP/IP",
    ],
  },
  {
    group: "AI Red Teaming",
    items: [
      "Adversarial ML",
      "Prompt Injection",
      "Data Poisoning",
      "Safety Filter Bypassing",
    ],
  },
  {
    group: "Tools & Platforms",
    items: [
      "Cisco Packet Tracer",
      "Nmap",
      "Burp Suite",
      "CyberChef",
      "PuTTY",
      "Git",
      "GitHub",
      "VirtualBox",
    ],
  },
  {
    group: "Systems",
    items: ["Windows 10/11", "Kali Linux", "VirtualBox"],
  },
  {
    group: "Programming",
    items: ["Python", "Java", "SQL", "C"],
  },
];

export const awards: Award[] = [
  { name: "Gokongwei Brothers Foundation Scholar", year: "2024" },
  {
    name: "President's Lister",
    detail: "Polytechnic University of the Philippines, AY 2024–2025",
    year: "2025",
  },
  {
    name: "2nd Place — Build With AI Hackathon",
    detail: "Project: GISING",
    year: "2026",
  },
  { name: "Top 3 Overall — Senior High School", year: "2024" },
  { name: "With High Honors — Senior High School", year: "2024" },
  { name: "Best in Research and Innovation", detail: "Senior High School", year: "2024" },
];

/**
 * The topology. Every entry is both a node on the homepage map
 * and a row in the nav rail — no content is reachable only via the map.
 */
export const sections: SiteSection[] = [
  {
    href: "/about",
    label: "About",
    hostname: "srv-about",
    kind: "server",
    port: "gi0/1",
    blurb: "Who I am and how I got here",
  },
  {
    href: "/projects",
    label: "Projects",
    hostname: "srv-projects",
    kind: "server",
    port: "gi0/2",
    blurb: "Things I built, and what they defend against",
  },
  {
    href: "/writeups",
    label: "Writeups",
    hostname: "srv-writeups",
    kind: "server",
    port: "gi0/3",
    blurb: "CTF solutions and security notes",
  },
  {
    href: "/certifications",
    label: "Certifications",
    hostname: "fw-certs",
    kind: "firewall",
    port: "gi0/4",
    blurb: "Credentials, earned and in flight",
  },
  {
    href: "/experience",
    label: "Experience",
    hostname: "ids-experience",
    kind: "ids",
    port: "gi0/5",
    blurb: "Work, internships, and org positions",
  },
  {
    href: "/events",
    label: "Events",
    hostname: "ap-events",
    kind: "ap",
    port: "gi0/6",
    blurb: "Hackathons, CTFs, and workshops",
  },
  {
    href: "/personal",
    label: "Personal",
    hostname: "host-personal",
    kind: "host",
    port: "gi0/7",
    blurb: "Life outside the terminal",
  },
  {
    href: "/contact",
    label: "Contact",
    hostname: "mx-contact",
    kind: "mail",
    port: "gi0/8",
    blurb: "Reach me, and how to do it securely",
  },
];
