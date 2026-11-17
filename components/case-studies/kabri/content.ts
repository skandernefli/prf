export const overview = {
  title: "Overview",
  paragraphs: [
    "Kabri (a pseudonym used to protect the company’s identity) is a growing Canadian company specializing in the design and construction of cabins, offering a range of products and services to both new and returning customers.",
    "As the business expanded, its existing digital infrastructure struggled to keep pace with its operational needs. Previous digitalization efforts had not delivered the flexibility and efficiency the company required, leading to the decision to build a new system from the ground up while preserving and migrating its existing business data.",
  ],
};

export const intro = {
  title: ["What’s", "happening"],
  body: "The process begins when a new lead or existing customer requests a quote for a product or service. This initiates a negotiation phase, during which requirements, specifications, and pricing may go through several iterations. Once the customer approves the final quote, a manufacturing order is issued to the factory. Upon completion, the finished product is shipped and delivered to the customer's specified address.",
};

export const messages = {
  customer: {
    label: "Customer / lead",
    lines: ["Roof Truss", "Shipment: Alberta", "Request a quote"],
    tone: "light" as const,
    side: "in" as const,
  },
  quote1: {
    label: "Kabri",
    lines: ["Quote 1"],
    tone: "dark" as const,
    side: "out" as const,
  },
  negotiable: {
    lines: ["It’s negotiable"],
    tone: "light" as const,
    side: "out" as const,
  },
  quote2: {
    lines: ["Quote 2"],
    tone: "dark" as const,
    side: "out" as const,
  },
  approved: {
    lines: ["Approved"],
    tone: "light" as const,
    side: "out" as const,
  },
  quoteReady: {
    label: "Kabri",
    lines: ["Quote is ready"],
    tone: "dark" as const,
    side: "out" as const,
  },
  addShed: {
    lines: ["I want to add", "a shed"],
    tone: "light" as const,
    side: "out" as const,
  },
};

export const before = {
  title: "Before reaching out",
  lead: "Behind the scenes, however, the process is far more complex than it might appear. To understand why, we first need to understand Kabri itself.",
  paragraphs: [
    "Kabri started as a family-run business operating for just four months each year, shaped by Canada’s seasonal weather. It began with one contractor, one pickup truck, and one person with no way of knowing how far the business would eventually grow.",
    "Season after season, that one-person operation grew into a larger team, serving an expanding customer base. But the administrative processes remained largely unchanged. Paper-based quotes, invoices, and payroll records could no longer keep up with the growing business.",
    "The company began investing in custom software, but rather than developing one comprehensive system, it approached digitalization incrementally, addressing its most urgent needs first. A dedicated application for quotations, another for invoicing, another for employee management, and so on. Each application was developed by a different external agency. Over time, this resulted in eight separate applications, each with its own database and no meaningful communication with the others. Worse, many of these systems did little more than digitize existing paperwork. Employees were still required to manually enter operational data. For example, generating a quotation meant manually entering each product component, its quantity, and its price, rather than having the system handle product configuration and calculations automatically.",
  ],
  requestNote: "Request a quote",
  enteringNote: ["Entering details", "in sys A"],
  callouts: [
    "Customer details are manual, not even looking if the customer is in database",
    "Can’t add more than one product per quote",
    "Product pieces names are entered manually (just normal text input), no control, same piece have different name from quote to quote",
  ],
};

export const browserA = {
  url: "sys-a.ca",
  customerTitle: "Customer",
  customerFields: ["Jhon", "Doe", "Jhon.doe@gmail.com", "514-555-0199"],
  quoteTitle: "Quote",
  productLabel: "Product Name",
  productValue: "Roof Truss",
  tableHead: ["Components", "Quantity", "Price/piece"],
  rows: [
    ["SPF (Spruce-Pine-Fir) dimension lumber (2×6)", "X15", "$3.89"],
    ["Galvanized steel toothed plates", "-", "-"],
  ],
  exportNote: "Export",
  updateNote: "Update",
};

export const quoteDoc = {
  brand: "KABRI",
  tagline: "Sheds on demand",
  categories: ["SHEDS", "GARAGES", "HOUSES"],
  title: "QUOTE",
  idLabel: "QUOTE ID",
  id: "KA-1042",
  tableHead: ["Piece", "QTY", "UNIT", "AMOUNT"],
  dateLabel: "Date",
  date: "04/28/2022",
  totalLabel: "Total",
  total: "7080.00",
};

export const wallet = {
  label: "COMPANY WALLET",
  amount: "₹49,760",
  delta: "-₹240",
  status: "APPROVED",
};

export const browserB = {
  url: "sys-b.ca",
  title: "Manufacturing order",
  productLabel: "Product",
  productValue: "Roof Truss",
  tableHead: ["Components", "Quantity"],
  rows: [
    ["SPF (Spruce-Pine-Fir) dimension lumber (2×6)", "X15"],
    ["Mitek 11 1/4\"", "x5"],
    ["Standard triangular (Fink) truss", "x9"],
    ["Gusset Plate/Plywood - 3/4\" × 4×8 ft", "x7"],
    ["Simpson Strong-Tie", "14"],
  ],
  bondNote: [
    "Making manufacturing bond",
    "Copying the same details",
    "from sys A to sys B to",
    "match technical requirements",
  ],
  exportNote: "Export and send to factory",
};

export const effect = {
  title: "Effect",
  systems: ["System A", "System B", "System C"],
  items: [
    "Fragmented Data",
    "Inconsistent Customer Experience",
    "Manual Employee Workload",
    "Operational Bottlenecks",
    "Deadline Uncertainty",
    "Growing Technical Overhead",
    "Limited Scalability",
  ],
};

export const solution = {
  title: "Solution",
  subtitle: "One centralized app which does everything",
  paragraphs: [
    "The solution was to replace the fragmented application landscape with a single, centralized business management platform, bringing the company's core operations under one roof.",
    "Instead of maintaining separate applications for quotations, invoicing, employee management, and other business processes, the new platform was designed around a shared data foundation, allowing information to flow across the business rather than remain isolated in individual systems.",
    "The goal went beyond simply consolidating eight applications into one. It was to rethink how the business operated digitally: reduce repetitive manual data entry, eliminate unnecessary duplication, connect previously disconnected workflows, and make information accessible where and when it was needed.",
    "The platform was built from the ground up while preserving the company's existing business data, providing a unified foundation that could support its current operations and accommodate future growth.",
  ],
  systems: ["System A", "System B", "System C"],
  allInOne: "All in one",
};
