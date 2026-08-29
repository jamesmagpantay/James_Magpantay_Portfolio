import type { Role } from "./types";

/** Newest first. Rendered as a single unified timeline on /experience. */
export const roles: Role[] = [
  {
    org: "Department of Science and Technology (DOST)",
    title: "Software Developer Intern",
    location: "Manila, Philippines",
    start: "Jul 2026",
    end: "Aug 2026",
    kind: "work",
    highlights: [
      "Remediated a verification flaw in the authentication service that accepted forged tokens, restoring signature validation",
      "Blocked malicious file uploads by checking file contents against the claimed type and rejecting files with embedded scripts",
      "Conducted security audits for vulnerabilities, documenting CWE findings and patching insecure upload and SVG handling",
    ],
    tags: ["AppSec", "Authentication", "CWE", "Code Audit"],
  },
  {
    org: "Cisco NetConnect PUP",
    title: "Vice Chief Technology Officer — CCNA Trained",
    location: "Manila, Philippines",
    start: "Feb 2026",
    end: "Jul 2026",
    kind: "org",
    highlights: [
      "Applied CCNA concepts including VLANs, trunking, STP, and network segmentation to strengthen infrastructure security",
      "Configured IPv4/IPv6 addressing, subnetting, DHCP, and DNS to maintain secure and reliable network operations",
      "Designed, analyzed, and troubleshot network topologies in Cisco Packet Tracer, incorporating security best practices",
    ],
    tags: ["CCNA", "VLANs", "Segmentation", "Packet Tracer"],
  },
  {
    org: "Google Developer Groups PUP",
    title: "Cybersecurity Compliance Analyst",
    location: "Manila, Philippines",
    start: "Feb 2026",
    end: "Jul 2026",
    kind: "org",
    highlights: [
      "Ensured the integrity of cybersecurity learning materials distributed to a cohort of 200+ Cybersecurity Cadets",
      "Co-facilitated cybersecurity workshops covering security tools, best practices, and core concepts",
      "Designed a CTF challenge with a deliberate vulnerability, giving participants hands-on exploitation in a controlled environment",
    ],
    tags: ["Compliance", "CTF Design", "Workshops", "Training"],
  },
  {
    org: "DataCamp",
    title: "Scholar",
    location: "Manila, Philippines",
    start: "Dec 2025",
    end: "Present",
    kind: "program",
    highlights: [
      "Integrated data literacy and security best practices into collaborative technical projects",
      "Gained proficiency in SQL for database management and Java for object-oriented programming",
      "Advanced from foundational to intermediate Python for complex data processing and script development",
    ],
    tags: ["Python", "SQL", "Java", "Data Security"],
  },
];
