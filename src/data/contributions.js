const statusMap = {
  Approved: "approved",
  "Under Review": "under-review",
  "In Progress": "in-progress",
};

const statusLabelMap = {
  approved: "Approved",
  "under-review": "Under Review",
  "in-progress": "In Progress",
};

export const statusOptions = Object.values(statusLabelMap).map((label) => ({
  label,
  value: statusMap[label],
}));

export const contributionFilters = [
  { label: "All", value: "all" },
  { label: "Approved", value: "approved" },
  { label: "Review", value: "under-review" },
  { label: "Progress", value: "in-progress" },
];

export const defaultContributions = [
  {
    id: "suricata-tcp-bounds",
    project: "Suricata",
    title: "Hardened TCP stream reassembly against evasive out-of-order payloads",
    description:
      "Added defensive bounds checks in the reassembly path so malformed segment ordering cannot push inspection state into inconsistent branches.",
    status: "Approved",
    impact:
      "Prevents unstable reconstruction behavior and parser-side failures when hostile or out-of-order TCP segments are reassembled inside high-throughput IDS inspection paths.",
    learnings:
      "Understood how stream reconstruction assumptions can turn into correctness issues in IDS engines, and how defensive state validation protects both stability and detection fidelity.",
    area: "Network Security",
    link: "https://github.com/OISF/suricata/pulls",
    date: "2026-03-08",
    featured: true,
  },
  {
    id: "zeek-edns-resilience",
    project: "Zeek",
    title: "Improved EDNS option decoding resilience in the Zeek DNS analyzer",
    description:
      "Tightened length validation around EDNS option parsing so malformed payloads fail predictably instead of degrading analyzer output.",
    status: "Under Review",
    impact:
      "Protects DNS telemetry quality by ensuring malformed EDNS metadata cannot quietly distort downstream interpretation used in detection and forensic analysis.",
    learnings:
      "Learned that parser hardening is only complete when failure paths are both safe and understandable enough for maintainers to debug unusual captures quickly.",
    area: "Protocol Analysis",
    link: "https://github.com/zeek/zeek/pulls",
    date: "2026-02-17",
    featured: true,
  },
  {
    id: "linux-netfilter-conntrack",
    project: "Linux",
    title: "Investigated conntrack timeout behavior under bursty container traffic",
    description:
      "Profiled conntrack pressure in short-lived container workloads to understand where timeout policy and flow churn interact badly.",
    status: "In Progress",
    impact:
      "Helps explain premature state eviction and inconsistent firewall behavior in container-heavy Linux environments where connection churn is high and timing assumptions break down.",
    learnings:
      "Understood how workload shape drives kernel networking behavior, and why realistic traffic reproduction is often more valuable than isolated code-path reasoning.",
    area: "Kernel-Level Systems",
    link: "https://github.com/torvalds/linux/pulls",
    date: "2026-01-29",
    featured: true,
  },
  {
    id: "suricata-parser-logging",
    project: "Suricata",
    title: "Made parser rejection paths easier to trace during malformed session analysis",
    description:
      "Improved rejection-path logging so maintainers can see why suspicious sessions were dropped before deeper detection stages run.",
    status: "Approved",
    impact:
      "Cuts debugging time during signature validation and regression analysis by making early parser rejection decisions explicit instead of buried in control flow.",
    learnings:
      "Learned that observability is part of correctness in security tooling: engineers trust parser behavior more when rejection boundaries are visible and explainable.",
    area: "IDS Engineering",
    link: "https://github.com/OISF/suricata/pulls",
    date: "2025-12-11",
  },
  {
    id: "zeek-dns-compression",
    project: "Zeek",
    title: "Handled recursive DNS compression-pointer edge cases more safely",
    description:
      "Refined recursive compression-pointer handling so malformed pointer chains terminate safely without breaking valid name parsing.",
    status: "Under Review",
    impact:
      "Prevents recursive pointer abuse from destabilizing DNS analysis while preserving accurate parsing for legitimate traffic seen in production investigations.",
    learnings:
      "Understood how recursion safety and protocol semantics need to stay separate so low-level parser defenses remain robust without making analyzer logic unreadable.",
    area: "Protocol Analysis",
    link: "https://github.com/zeek/zeek/pulls",
    date: "2025-11-03",
  },
  {
    id: "linux-netfilter-tracing",
    project: "Linux",
    title: "Built a focused tracing workflow for netfilter hook-stage debugging",
    description:
      "Designed a narrower tracing approach to inspect packet flow through hook stages without relying on noisy broad-spectrum instrumentation.",
    status: "In Progress",
    impact:
      "Improves how quickly hook-stage routing and rule-evaluation problems can be isolated in Linux packet paths where generic tracing produces too much noise to be useful.",
    learnings:
      "Learned to treat debugging workflows like product design: reduce noise first, then surface only the state that moves kernel-level investigation forward.",
    area: "Kernel-Level Systems",
    link: "https://github.com/torvalds/linux/pulls",
    date: "2025-10-18",
  },
  {
    id: "protocol-replay-harness",
    project: "Protocol Tooling",
    title: "Built a malformed-packet replay harness for parser regression testing",
    description:
      "Turned difficult packet edge cases into replayable fixtures so parser fixes can be validated repeatedly across future changes.",
    status: "In Progress",
    impact:
      "Makes parser hardening durable by converting one-off malformed-packet investigations into repeatable regression coverage for future refactors and review cycles.",
    learnings:
      "Understood that engineering confidence comes from repeatability: a parser fix becomes far more valuable once another engineer can replay, verify, and extend it quickly.",
    area: "Verification",
    link: "https://github.com/OISF/suricata/pulls",
    date: "2025-09-02",
  },
];

export function getStatusKey(status = "In Progress") {
  return statusMap[status] ?? "in-progress";
}

export function getStatusLabel(statusKey = "in-progress") {
  return statusLabelMap[statusKey] ?? "In Progress";
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createId(contribution, index) {
  const base = slugify(
    `${contribution.project || "contribution"}-${contribution.title || index}`,
  );

  return base || `contribution-${index + 1}`;
}

export function normalizeContribution(contribution = {}, index = 0) {
  const statusKey =
    contribution.statusKey ?? getStatusKey(contribution.status || "In Progress");
  const status = contribution.status ?? getStatusLabel(statusKey);

  return {
    id: contribution.id || createId(contribution, index),
    project: contribution.project?.trim?.() ?? "",
    title: contribution.title?.trim?.() ?? "",
    description: contribution.description?.trim?.() ?? "",
    status,
    statusKey: getStatusKey(status),
    impact: contribution.impact?.trim?.() ?? "",
    learnings: contribution.learnings?.trim?.() ?? "",
    area: contribution.area?.trim?.() ?? "",
    link: contribution.link?.trim?.() ?? "",
    date: contribution.date?.trim?.() ?? "",
    featured: Boolean(contribution.featured),
  };
}

export function normalizeContributions(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => normalizeContribution(item, index));
}

export function getDashboardMetrics(items) {
  const safeItems = normalizeContributions(items);
  const topProjects = [...new Set(safeItems.map((item) => item.project).filter(Boolean))]
    .slice(0, 3)
    .join(" / ");
  const topAreas = [...new Set(safeItems.map((item) => item.area).filter(Boolean))]
    .slice(0, 3)
    .join(" / ");

  return [
    { label: "Total Contributions", value: `${safeItems.length}` },
    { label: "Projects", value: topProjects || "Suricata / Zeek / Linux" },
    { label: "Areas", value: topAreas || "Network / Kernel / Security" },
  ];
}

export function getFeaturedContributions(items) {
  const safeItems = normalizeContributions(items);
  const featuredItems = safeItems.filter((item) => item.featured);

  if (featuredItems.length > 0) {
    return featuredItems.slice(0, 3);
  }

  return safeItems.slice(0, 3);
}

export const derivedSkills = [
  {
    title: "C/C++ debugging in packet-processing paths",
    detail:
      "Tracing parser state, reconstructing failure conditions, and isolating boundary bugs inside performance-sensitive code used by detection engines.",
  },
  {
    title: "Network protocol analysis",
    detail:
      "Working directly with TCP and DNS behaviors, malformed input patterns, and analyzer expectations to preserve trustworthy telemetry.",
  },
  {
    title: "Memory safety and parser hardening",
    detail:
      "Designing validation gates and fail-safe decode paths that reject hostile input cleanly without weakening valid traffic analysis.",
  },
  {
    title: "IDS/IPS systems engineering",
    detail:
      "Understanding how Suricata and Zeek normalize packets, manage state, and expose the observability needed to debug detection regressions.",
  },
  {
    title: "Linux kernel networking workflows",
    detail:
      "Reasoning about netfilter, conntrack pressure, packet traversal, and hook-stage behavior under bursty infrastructure traffic.",
  },
];
