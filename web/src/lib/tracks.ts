/**
 * The seven problem statements (hackathon themes / tracks). Text is from the live site.
 * Not the website's dark/light colour scheme.
 * `tag` is a short domain label for the card and can be edited freely.
 */

/** SVG path data for a circle, so every icon can be a list of paths. */
const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

export interface Track {
  id: string;
  title: string;
  text: string;
  tag: string;
  /** Stroke icon paths, 24x24 viewBox. */
  icon: string[];
}

export const tracks: Track[] = [
  {
    id: "01",
    title: "AI-Enabled Drone & Counter-Drone Threat Simulation Trainer",
    text: "Explore AI-driven simulation and training systems designed to study drone-related threats and improve threat-response preparedness.",
    tag: "AI & Defence",
    icon: [
      circle(12, 12, 2),
      "M10.5 10.5 7 7",
      "M13.5 10.5 17 7",
      "M10.5 13.5 7 17",
      "M13.5 13.5 17 17",
      circle(5, 5, 2.5),
      circle(19, 5, 2.5),
      circle(5, 19, 2.5),
      circle(19, 19, 2.5),
    ],
  },
  {
    id: "02",
    title:
      "AI-Powered Smart Food Waste Reduction & Sustainable Redistribution Ecosystem for Institutional Kitchens and Food Processing Units",
    text: "Develop intelligent solutions for institutional kitchens and food processing units to reduce food waste and support sustainable redistribution.",
    tag: "Sustainability",
    icon: [
      "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z",
      "M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",
    ],
  },
  {
    id: "03",
    title:
      "V2V Visionaries: Engineering the Next Generation of Collision Avoidance & Road Safety",
    text: "Reimagine safer roads through vehicle-to-vehicle communication, intelligent sensing, and next-generation collision avoidance solutions.",
    tag: "Mobility",
    icon: [
      "M2 13.5h8a1 1 0 0 1 1 1V19H2v-4.5a1 1 0 0 1 0-1z",
      "M13 13.5h8a1 1 0 0 1 1 1V19h-9v-4.5a1 1 0 0 1 0-1z",
      "M9 9a4.2 4.2 0 0 1 6 0",
      "M6.5 6.2a8 8 0 0 1 11 0",
    ],
  },
  {
    id: "04",
    title:
      "Edge-AI Smart Stethoscope for Real-Time Cardiopulmonary Screening in Rural PHCs",
    text: "Explore smart, edge-enabled stethoscope systems that support preliminary cardiopulmonary screening in rural Primary Health Centres.",
    tag: "Healthcare",
    icon: [
      "M11 2v2",
      "M5 2v2",
      "M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1",
      "M8 15a6 6 0 0 0 12 0v-3",
      circle(20, 10, 2),
    ],
  },
  {
    id: "05",
    title:
      "On-Site Containment-Based Toilets: Innovative Solutions for Sustainable Waste Treatment",
    text: "Explore technological, biochemical, or nature-based approaches for treating excreta on-site while protecting the environment and groundwater.",
    tag: "Sanitation",
    icon: [
      "M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z",
    ],
  },
  {
    id: "06",
    title: "Indigenous Leak Detection Sensor Systems for Water Supply Pipelines",
    text: "Develop indigenous sensor-based systems for detecting pipeline leaks and improving water-supply operation and maintenance.",
    tag: "Water",
    icon: [
      "M3 6h18v5H3z",
      "M7 6v5",
      "M17 6v5",
      "M12 15c-1 1.5-1.5 2.4-1.5 3.2a1.5 1.5 0 0 0 3 0c0-.8-.5-1.7-1.5-3.2z",
    ],
  },
  {
    id: "07",
    title: "Supply Chain Intelligence & Coastal Chain Intelligence",
    text: "Design real-time tracking, demand forecasting, and risk-management solutions to strengthen port efficiency, coastal trade, and logistics.",
    tag: "Logistics",
    icon: [
      "M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
      "M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76",
      "M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6",
      "M12 10v4",
      "M12 2v3",
    ],
  },
];
