export const dashboardMetrics = [
  { label: "Featured upstream tracks", value: "3" },
  { label: "Contribution stories", value: "7" },
  { label: "Core engineering domains", value: "5" },
];

export const contributionFilters = [
  { label: "All", value: "all" },
  { label: "Approved", value: "approved" },
  { label: "Under Review", value: "under-review" },
  { label: "In Progress", value: "in-progress" },
];

export const contributions = [
  {
    id: "suricata-tcp-bounds",
    project: "Suricata",
    repo: "OISF/suricata",
    title: "TCP stream reassembly bounds validation for evasive packet sequences",
    status: "Approved",
    statusKey: "approved",
    impact:
      "Tightened validation around segmented TCP payload reconstruction so malformed or adversarial packet ordering cannot corrupt inspection state or reduce rule fidelity during normalization.",
    area: "Network Security",
    link: "https://github.com/OISF/suricata/pulls",
    description:
      "Hardened reassembly checks to keep IDS state transitions stable when fragmented application data arrives in edge-case order.",
    featured: true,
  },
  {
    id: "zeek-edns-resilience",
    project: "Zeek",
    repo: "zeek/zeek",
    title: "DNS analyzer resilience for malformed EDNS option decoding",
    status: "Under Review",
    statusKey: "under-review",
    impact:
      "Improved defensive parsing around EDNS metadata so truncated or inconsistent option lengths fail cleanly instead of poisoning downstream protocol interpretation.",
    area: "Protocol Analysis",
    link: "https://github.com/zeek/zeek/pulls",
    description:
      "Adds stricter length checks and clearer analyzer failure behavior to preserve trustworthy DNS telemetry under malformed traffic.",
    featured: true,
  },
  {
    id: "linux-netfilter-conntrack",
    project: "Linux",
    repo: "torvalds/linux",
    title: "Netfilter conntrack timeout tuning for bursty container workloads",
    status: "In Progress",
    statusKey: "in-progress",
    impact:
      "Investigates state churn under short-lived, high-rate flows to reduce premature connection eviction and improve firewall predictability for container-heavy network paths.",
    area: "Kernel",
    link: "https://github.com/torvalds/linux/pulls",
    description:
      "Profiles conntrack pressure and timeout behavior in service-mesh-like traffic where rapid connection turnover amplifies packet tracking edge cases.",
    featured: true,
  },
  {
    id: "suricata-parser-logging",
    project: "Suricata",
    repo: "OISF/suricata",
    title: "Improved parser rejection logging for malformed session analysis",
    status: "Approved",
    statusKey: "approved",
    impact:
      "Expanded observability around rejection paths so malformed session handling is easier to trace during signature debugging and engine regression analysis.",
    area: "Detection Engineering",
    link: "https://github.com/OISF/suricata/pulls",
    description:
      "Surfaces clearer debugging signal when decode paths reject suspicious or malformed traffic before detection logic executes.",
  },
  {
    id: "zeek-dns-compression",
    project: "Zeek",
    repo: "zeek/zeek",
    title: "DNS name compression pointer edge-case handling",
    status: "Under Review",
    statusKey: "under-review",
    impact:
      "Refined recursive compression handling so malformed pointer chains terminate safely without degrading analysis of surrounding valid packets in the same capture.",
    area: "Protocol Analysis",
    link: "https://github.com/zeek/zeek/pulls",
    description:
      "Protects the analyzer from ambiguous compression loops while preserving accurate parsing for valid DNS name resolution.",
  },
  {
    id: "linux-netfilter-tracing",
    project: "Linux",
    repo: "torvalds/linux",
    title: "Targeted tracing workflow for netfilter hook-stage debugging",
    status: "In Progress",
    statusKey: "in-progress",
    impact:
      "Builds a narrower debugging path for packet traversal latency and rule evaluation behavior without relying on broad, noisy instrumentation.",
    area: "Linux Networking",
    link: "https://github.com/torvalds/linux/pulls",
    description:
      "Creates a more focused method to inspect packet path behavior through hook stages and stateful filtering decisions.",
  },
  {
    id: "protocol-replay-harness",
    project: "Protocol Tooling",
    repo: "security-lab/regression-harness",
    title: "Malformed packet replay harness for parser regression testing",
    status: "In Progress",
    statusKey: "in-progress",
    impact:
      "Establishes a repeatable replay workflow for validating parser and inspection fixes across future refactors and hostile packet samples.",
    area: "Verification",
    link: "https://github.com/OISF/suricata/pulls",
    description:
      "Turns hard-to-reproduce malformed traffic cases into regression-ready fixtures that make parser hardening durable.",
  },
];

export const featuredContributions = contributions.filter(
  (item) => item.featured,
);

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
