import type { EventEntry } from "./types";

/**
 * Newest first.
 * PHOTOS: drop image files into /public/events/ and list the filenames
 * in the `photos` array, e.g. photos: ["/events/codekada-1.jpg"].
 * Cards render a placeholder frame until photos are added.
 */
export const events: EventEntry[] = [
  {
    slug: "codekada-2026",
    name: "CODEKADA Hackathon",
    kind: "hackathon",
    role: "Cybersecurity Lead",
    project: "Eely — AI Electricity Bill Scanner",
    date: "May 2026",
    location: "Manila, Philippines",
    takeaway:
      "Privacy work has to happen before the model does, not after. We wrote the data handling rules first and the extraction pipeline second.",
    highlights: [
      "Formulated data privacy protocols for AI modeling to secure sensitive utility data",
      "Established security protocols safeguarding data integrity during AI extraction",
      "Streamlined UI/UX to translate complex energy insights into intuitive interactions",
    ],
    photos: [],
  },
  {
    slug: "ibm-bob-dev-day-2026",
    name: "IBM Bob Dev Day Hackathon",
    kind: "hackathon",
    role: "AI Developer & System Architect",
    project: "Skillet",
    date: "April 2026",
    location: "Virtual — International",
    takeaway:
      "Automating a process end to end is worth more than optimizing any single step of it. We replaced the manual extraction entirely rather than speeding it up.",
    highlights: [
      "Built a two-repo system that fully automated dev-session mining",
      "Engineered Skills Factory for autonomous session mining via text processing and frequency analysis",
      "Built a React dashboard for browsing skill libraries and previewing live mining results",
    ],
    photos: [],
  },
  {
    slug: "ai-odyssey-ctf-2026",
    name: "AI Odyssey CTF",
    kind: "ctf",
    role: "CTF Participant — AI Red Teamer",
    date: "April 2026",
    location: "TryHackMe — Virtual, International",
    takeaway:
      "LLM safety filters fail in the same places input validation always has: at the boundary where trusted instructions and untrusted input get concatenated.",
    highlights: [
      "Bypassed LLM safety filters via prompt injection to capture flags and document vulnerabilities",
      "Leveraged Burp Suite to exploit machine learning vulnerabilities and intercept model traffic",
      "Analyzed AI/ML threats with a focus on model-specific weaknesses and adversarial ML risks",
    ],
    photos: [],
  },
  {
    slug: "build-with-ai-2026",
    name: "Build With AI Hackathon",
    kind: "hackathon",
    role: "Business Strategist",
    project: "GISING — Preclinical Stroke Detection",
    date: "April 2026",
    location: "Manila, Philippines",
    result: "2nd Place",
    takeaway:
      "A three-hour sprint rewards a team that decides what not to build in the first ten minutes.",
    highlights: [
      "Placed 2nd building a preclinical stroke detection prototype with IoT and AI in three hours",
      "Devised revenue models and growth strategies for long-term sustainability",
      "Mapped key partnerships and channels aligning AI medical hardware with healthcare markets",
    ],
    photos: [],
  },
  {
    slug: "aws-cloud-club-ai-workshop-2026",
    name: "AWS Cloud Club PUP — AI Workshop",
    kind: "workshop",
    role: "AI Developer & System Architect",
    project: "PUP Enrollment Buddy",
    date: "February 2026",
    location: "Manila, Philippines",
    takeaway:
      "Retrieval quality decides answer quality. Most of the work in a RAG system is not the model, it is what you feed it.",
    highlights: [
      "Built a RAG chatbot using LangFlow, DataStax Astra DB, and Google AI Studio",
      "Applied prompt engineering to improve response accuracy and relevance",
      "Worked with LLM architectures inside a real conversational interface",
    ],
    photos: [],
  },
];

export const eventStats = {
  total: events.length,
  hackathons: events.filter((e) => e.kind === "hackathon").length,
  ctfs: events.filter((e) => e.kind === "ctf").length,
  placements: events.filter((e) => e.result).length,
};
