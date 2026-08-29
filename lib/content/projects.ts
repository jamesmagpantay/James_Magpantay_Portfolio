import type { Project } from "./types";

/**
 * Add `repo` and `demo` URLs as they become available — the cards
 * render the links only when present, so partial data is safe.
 */
export const projects: Project[] = [
  {
    slug: "siem-ticketing",
    name: "SIEM & Ticketing System",
    role: "Independent Developer",
    org: "PUP Office of the University Secretary",
    date: "March 2026",
    category: "security",
    summary:
      "A custom SIEM that makes audit logs tamper-evident and cuts alert noise down to what a human can actually triage.",
    problem:
      "Audit logs are only useful if you can prove they have not been edited, and alert feeds are only useful if they are not drowning the person reading them. This system addresses both.",
    highlights: [
      "Achieved 100% audit log tamper detection by implementing SHA-256 hash chaining on all database writes",
      "Reduced security alert noise by grouping concurrent events by source IP in a custom correlation engine",
      "Mitigated brute-force login attempts using client-IP rate limits and account lockout logic",
    ],
    stack: ["Python", "SHA-256 Hash Chaining", "Event Correlation", "SQL"],
    metric: { value: "100%", label: "Log tamper detection" },
  },
  {
    slug: "network-vulnerability-scanner",
    name: "Automated Network Vulnerability & Change Scanner",
    role: "Independent Developer",
    date: "March 2026",
    category: "security",
    summary:
      "A two-phase scanning engine that finds hosts fast, fingerprints them carefully, and tells you what changed since last time.",
    problem:
      "A one-off port scan is a snapshot. What defenders actually need is the diff — which ports opened, closed, or changed since the last sweep.",
    highlights: [
      "Created a two-phase engine using Python and Nmap for rapid host discovery followed by targeted OS and version detection",
      "Built a risk classification system that labels open ports by severity and provides plain-language security explanations",
      "Implemented an algorithm to flag new, closed, or modified port states by comparing scan results over time",
    ],
    stack: ["Python", "Nmap", "Risk Classification", "Diff Analysis"],
    metric: { value: "2-phase", label: "Discovery then fingerprint" },
  },
  {
    slug: "pup-ous-pams",
    name: "Personnel Accomplishment Monitoring System",
    role: "Cybersecurity Lead & Project Manager",
    org: "PUP Office of the University Secretary",
    date: "March 2026",
    category: "systems",
    summary:
      "Task automation for multi-departmental personnel, built with authentication and data handling policy designed in from the start.",
    problem:
      "Accomplishment tracking across departments was manual and inconsistent, and the personnel data involved needed handling rules before a single record was stored.",
    highlights: [
      "Directed the end-to-end project lifecycle to automate task management for multi-departmental personnel",
      "Enforced secure authentication with strong password requirements aligned with modern standards",
      "Established data handling policies supporting the confidentiality, integrity, and availability of personnel information",
    ],
    stack: ["Project Management", "Authentication Design", "Data Governance"],
    metric: { value: "Multi-dept", label: "Scope of rollout" },
  },
  {
    slug: "skillet",
    name: "Skillet",
    role: "AI Developer & System Architect",
    org: "IBM Bob Dev Day Hackathon",
    date: "April 2026",
    category: "ai",
    summary:
      "A two-repo system that fully automated dev-session mining, replacing a manual extraction process.",
    problem:
      "Useful patterns were buried in development sessions and only surfaced if someone went digging by hand. Skillet does the digging.",
    highlights: [
      "Developed a two-repo system that fully automated dev-session mining, replacing manual extraction",
      "Engineered Skills Factory to autonomously mine sessions using local text processing and frequency analysis",
      "Built a React-based dashboard for browsing skill libraries and previewing real-time session mining results",
    ],
    stack: ["React", "Text Processing", "Frequency Analysis"],
  },
  {
    slug: "eely",
    name: "Eely — AI Electricity Bill Scanner",
    role: "Cybersecurity Lead",
    org: "CODEKADA Hackathon",
    date: "May 2026",
    category: "ai",
    summary:
      "An AI bill scanner where the security work was the interesting part — sensitive utility data extracted without leaking it.",
    problem:
      "Utility bills carry name, address, and consumption patterns. Running them through an AI extraction pipeline creates a privacy problem that has to be solved before the feature ships.",
    highlights: [
      "Formulated data privacy protocols for AI modeling, ensuring full compliance in securing sensitive utility data",
      "Established security protocols to safeguard data integrity during AI extraction",
      "Streamlined UI/UX design to translate complex AI energy insights into intuitive user interactions",
    ],
    stack: ["AI Extraction", "Data Privacy Protocols", "UI/UX"],
  },
  {
    slug: "gising",
    name: "GISING",
    role: "Business Strategist",
    org: "Build With AI Hackathon",
    date: "April 2026",
    category: "ai",
    summary:
      "A preclinical stroke detection prototype built with IoT and AI in a three-hour sprint. Placed 2nd.",
    problem:
      "Stroke outcomes depend on how early it is caught. The prototype explored whether low-cost IoT sensing plus AI could flag warning signs before a clinical presentation.",
    highlights: [
      "Won 2nd Place by building a preclinical stroke detection prototype using IoT and AI within a three-hour sprint",
      "Devised revenue models and growth strategies to ensure long-term sustainability for the application",
      "Mapped key partnerships and channels to align AI medical hardware with healthcare and consumer markets",
    ],
    stack: ["IoT", "AI", "Business Modeling"],
    metric: { value: "2nd", label: "Place — Build With AI" },
  },
  {
    slug: "pup-enrollment-buddy",
    name: "PUP Enrollment Buddy",
    role: "AI Developer & System Architect",
    org: "AWS Cloud Club PUP — AI Workshop",
    date: "Feb 2026",
    category: "ai",
    summary:
      "A retrieval-augmented chatbot that answers university enrollment questions from real institutional documents.",
    problem:
      "Enrollment processes are documented, but scattered. A RAG chatbot puts the answers where students actually ask the question.",
    highlights: [
      "Built a RAG chatbot using LangFlow, DataStax Astra DB, and Google AI Studio to refine university processes",
      "Implemented prompt engineering techniques to improve response accuracy and relevance of AI outputs",
      "Applied Large Language Model architectures within a real-world conversational interface",
    ],
    stack: ["LangFlow", "DataStax Astra DB", "Google AI Studio", "RAG"],
  },
];

export const projectsByCategory = {
  security: projects.filter((p) => p.category === "security"),
  systems: projects.filter((p) => p.category === "systems"),
  ai: projects.filter((p) => p.category === "ai"),
};
