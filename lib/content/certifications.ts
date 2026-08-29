import type { Certification } from "./types";

/**
 * Rendered on /certifications as an access-control list.
 * `id` is the ACL rule number — keep them sequential in tens.
 * Add `verifyUrl` as credential links become available.
 */
export const certifications: Certification[] = [
  {
    id: 10,
    name: "Cyber Threat Intelligence Analysis (CTIA Level III)",
    issuer: "Certification body",
    status: "active",
    action: "PERMIT",
  },
  {
    id: 20,
    name: "Certified Cybersecurity Professional (CCP)",
    issuer: "Appkademiya",
    status: "active",
    action: "PERMIT",
  },
  {
    id: 30,
    name: "Google Cybersecurity Professional Certificate",
    issuer: "Google",
    status: "in-progress",
    action: "PENDING",
  },
  {
    id: 40,
    name: "Certified in Cybersecurity (CC)",
    issuer: "ISC2",
    status: "candidate",
    action: "PENDING",
  },
  {
    id: 50,
    name: "Introduction to Cybersecurity",
    issuer: "Cisco Networking Academy",
    status: "active",
    action: "PERMIT",
  },
  {
    id: 60,
    name: "Introduction to Hardware and Operating Systems",
    issuer: "IBM",
    status: "active",
    action: "PERMIT",
  },
  {
    id: 70,
    name: "Introduction to Data Security",
    issuer: "DataCamp",
    status: "active",
    action: "PERMIT",
  },
];

export const certStats = {
  total: certifications.length,
  active: certifications.filter((c) => c.status === "active").length,
  pending: certifications.filter((c) => c.status !== "active").length,
};
