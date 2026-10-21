import aboutImg1 from "../assets/team-img-1.jpg";
import aboutImg2 from "../assets/team-img-2.jpg";
import aboutImg3 from "../assets/team-img-3.jpg";
import aboutImg4 from "../assets/team-img-4.jpg";
import timeline1 from "../assets/timeline-img-1.jpg";
import timeline2 from "../assets/timeline-img-2.jpg";
import timeline3 from "../assets/timeline-img-3.jpg";
import timeline4 from "../assets/timeline-img-4.jpg";
import timeline5 from "../assets/timeline-img-5.jpg";
import timeline6 from "../assets/timeline-img-6.jpg";
import author1 from "../assets/author-img-1.png";
import author2 from "../assets/author-img-2.jpg";
import author3 from "../assets/author-img-3.jpg";
import author4 from "../assets/author-img-4.jpg";
import author5 from "../assets/author-img-5.jpg";
import logo1 from "../assets/testimonial-logo-1.png";
import logo2 from "../assets/testimonial-logo-2.png";
import logo3 from "../assets/testimonial-logo-3.png";
import logo4 from "../assets/testimonial-logo-4.png";
import logo5 from "../assets/testimonial-logo-5.png";
import life1 from "../assets/AlgoShack-img-1.jpg";
import life2 from "../assets/AlgoShack-img-2.jpg";
import life3 from "../assets/AlgoShack-img-3.jpg";
import life4 from "../assets/AlgoShack-img-4.jpg";
import life5 from "../assets/AlgoShack-img-5.jpg";
import location1 from "../assets/location-img-1.png";
import location2 from "../assets/location-img-2.png";

export type FieldType = "text" | "textarea" | "image" | "url" | "number" | "checkbox" | "select";

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  options?: string[];
}

export type Row = Record<string, string | number | boolean>;

export interface ModuleDef {
  key: string;
  label: string;
  description: string;
  kind: "single" | "list";
  fields: Field[];
  defaults: Row | Row[];
  // Section heading (eyebrow / title / description) stored next to the items
  headerFields?: Field[];
  headerDefaults?: Row;
  itemLabel?: (row: Row) => string;
}

const sectionHeader = (eyebrow: string, title: string, description?: string) => ({
  headerFields: [
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "title", label: "Heading", type: "text" },
    ...(description === undefined
      ? []
      : ([{ name: "description", label: "Description", type: "textarea" }] as Field[])),
  ] as Field[],
  headerDefaults: { eyebrow, title, ...(description === undefined ? {} : { description }) } as Row,
});

export const USECASE_ICONS = ["heartbeat", "bag", "bank", "truck", "monitor"];

export const modules: ModuleDef[] = [
  {
    key: "hero",
    label: "Hero / About",
    description: "Top banner of the home page: heading, paragraph and the two buttons.",
    kind: "single",
    fields: [
      { name: "heading", label: "Heading", type: "text", required: true },
      { name: "paragraph", label: "Paragraph", type: "textarea", required: true },
      { name: "primaryLabel", label: "Primary button text", type: "text" },
      { name: "primaryHref", label: "Primary button link", type: "url" },
      { name: "secondaryLabel", label: "Secondary button text", type: "text" },
      { name: "secondaryHref", label: "Secondary button link", type: "url" },
    ],
    defaults: {
      heading: "Engineering quality at the speed of AI.",
      paragraph:
        "AlgoShack is a digital-native platform company specialising in AI-augmented autonomous testing and quality engineering. Our flagship product, algoQA, uses GenAI and agentic AI to autonomously generate test cases, executable scripts and datasets, cutting testing cost for DevOps teams by up to 80%.",
      primaryLabel: "See the platform",
      primaryHref: "#platform",
      secondaryLabel: "Life at AlgoShack",
      secondaryHref: "#life",
    },
  },
  {
    key: "stats",
    label: "Stats",
    description: "The 'AlgoShack at a glance' number cards.",
    kind: "list",
    fields: [
      { name: "number", label: "Number", type: "text", required: true },
      { name: "label", label: "Label", type: "text", required: true },
    ],
    defaults: [
      { number: "8+", label: "Years of quality engineering" },
      { number: "250+", label: "Enterprise engagements" },
      { number: "300+", label: "People on the team" },
      { number: "37%+", label: "Women in workspace" },
      { number: "96 / 94", label: "SaaS / SaSo NPS" },
    ],
    itemLabel: (row) => `${row.number} — ${row.label}`,
  },
  {
    key: "timeline",
    label: "Timeline (Our journey)",
    description: "Year-by-year milestones.",
    kind: "list",
    ...sectionHeader(
      "Our journey",
      "Eight years, one direction.",
      "From a Bengaluru start-up to a globally ranked quality engineering platform company with customers on two continents."
    ),
    fields: [
      { name: "year", label: "Year", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "text", label: "Text", type: "textarea", required: true },
      { name: "image", label: "Image", type: "image", required: true },
      { name: "alt", label: "Image description", type: "text" },
    ],
    defaults: [
      { year: "2018", title: "AlgoShack is founded", text: "Established in January in Bengaluru with a small team and a conviction that testing needed a system, not more testers.", image: timeline1.src, alt: "AlgoShack's early team" },
      { year: "2019", title: "First Fortune 100 recognition", text: "Philips Best Innovation Award at the Supplier Innovation Event. Named among BusinessSight Media's 20 Best Places to Work.", image: timeline2.src, alt: "AlgoShack team celebrating an award" },
      { year: "2021", title: "Certified for regulated work", text: "ISO 9001:2015 certification, with ISO 14971:2007 and IEC 62304:2006 attestations for safety-critical MedTech software.", image: timeline3.src, alt: "Team working together" },
      { year: "2023", title: "Most resilient supplier", text: "GE HealthCare names AlgoShack Most Resilient Supplier in Delivery at the India Supplier Summit, Bengaluru.", image: timeline4.src, alt: "AlgoShack colleagues at an event" },
      { year: "2024", title: "GenAI and agentic AI arrive", text: "algoQA moves from rules to autonomous agents. Six patents published. The team crosses 300 people.", image: timeline5.src, alt: "Team collaborating on technology" },
      { year: "2026", title: "Ranked #3 globally", text: "Ranked #3 among 700+ test automation companies worldwide, with 250+ enterprise engagements delivered.", image: timeline6.src, alt: "AlgoShack team members" },
    ],
    itemLabel: (row) => `${row.year} — ${row.title}`,
  },
  {
    key: "leadership",
    label: "Leadership team",
    description: "People cards in the Leadership section.",
    kind: "list",
    ...sectionHeader(
      "Leadership",
      "The people accountable for it.",
      "A leadership team drawn from enterprise quality engineering, product and delivery, with decades of shipping software into regulated environments."
    ),
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "role", label: "Role", type: "text", required: true },
      { name: "image", label: "Photo", type: "image", required: true },
      { name: "linkedin", label: "LinkedIn URL", type: "url" },
      { name: "bio", label: "Bio", type: "textarea", help: "Separate paragraphs with a blank line. Leave empty to hide the 'see bio' button." },
    ],
    defaults: [
      { name: "Lina Zhao", role: "Chief Marketing Officer", image: aboutImg1.src, linkedin: "https://www.linkedin.com/", bio: "Lina brings over 12 years of experience in strategic marketing and brand management. She previously worked as Marketing Director at Innovate Media, where she led campaigns that increased brand visibility and market share.\n\nHer focus includes digital marketing, consumer insights, and content strategy. Lina has successfully launched several high-profile marketing initiatives, which resulted in increased engagement and customer loyalty across various sectors." },
      { name: "Lina Zhao", role: "Chief Innovation Officer", image: aboutImg2.src, linkedin: "https://www.linkedin.com/", bio: "Placeholder bio. Add the background, previous roles and focus here.\n\nSecond paragraph: achievements, domains and experience." },
      { name: "Rajiv Kumar", role: "Co-founder", image: aboutImg3.src, linkedin: "https://www.linkedin.com/", bio: "Placeholder bio. Add the background, previous roles and focus here.\n\nSecond paragraph: achievements, domains and experience." },
      { name: "Maya Patel", role: "Designer", image: aboutImg4.src, linkedin: "https://www.linkedin.com/", bio: "Placeholder bio. Add the background, previous roles and focus here.\n\nSecond paragraph: achievements, domains and experience." },
    ],
    itemLabel: (row) => `${row.name} — ${row.role}`,
  },
  {
    key: "testimonials",
    label: "Testimonials",
    description: "Customer quotes in the sliding marquee.",
    kind: "list",
    ...sectionHeader("Testimonials", "What happens after the first conversation."),
    fields: [
      { name: "quote", label: "Quote", type: "textarea", required: true },
      { name: "logo", label: "Company logo", type: "image" },
      { name: "logoAlt", label: "Logo description", type: "text" },
      { name: "logoWidth", label: "Logo width (px)", type: "number" },
      { name: "authorImage", label: "Author photo", type: "image" },
      { name: "authorName", label: "Author name / title", type: "text", required: true },
      { name: "authorRole", label: "Author role / place", type: "text" },
    ],
    defaults: [
      { quote: "The integration of AI has significantly reduced our manual testing hours, allowing us to focus on innovation rather than routine checks.", logo: logo1.src, logoAlt: "Client logo 1", logoWidth: 104, authorImage: author1.src, authorName: "Product Manager", authorRole: "E-commerce, San Francisco" },
      { quote: "Regression that used to take a full sprint now closes inside a day, and every result traces back to the requirement that asked for it.", logo: logo2.src, logoAlt: "Client logo 2", logoWidth: 131, authorImage: author2.src, authorName: "QA Director", authorRole: "MedTech, Bengaluru" },
      { quote: "We kept our Selenium estate. algoQA extended it instead of asking us to throw four years of work away.", logo: logo3.src, logoAlt: "Client logo 3", logoWidth: 128, authorImage: author3.src, authorName: "Test Architect", authorRole: "Banking & fintech, London" },
      { quote: "Self-healing removed the single biggest source of noise in our pipeline. Nobody misses the Monday morning locator triage.", logo: logo4.src, logoAlt: "Client logo 4", logoWidth: 148, authorImage: author4.src, authorName: "Head of Engineering", authorRole: "Retail, New Jersey" },
      { quote: "Implementing continuous testing has enabled us to deploy updates multiple times a day without fear of breaking existing features.", logo: logo5.src, logoAlt: "Client logo 5", logoWidth: 149, authorImage: author5.src, authorName: "DevOps Engineer", authorRole: "Tech Startup, Austin" },
    ],
    itemLabel: (row) => `${row.authorName} — ${String(row.quote).slice(0, 50)}…`,
  },
  {
    key: "life",
    label: "Life at AlgoShack cards",
    description: "Employee story cards in the sliding marquee.",
    kind: "list",
    ...sectionHeader(
      "Life at AlgoShack",
      "Come for the problem. Stay for the people.",
      "We treat each employee fairly with mutual respect, give them the opportunity and the input to excel in the work, and keep encouraging them."
    ),
    fields: [
      { name: "image", label: "Image", type: "image", required: true },
      { name: "alt", label: "Image description", type: "text" },
      { name: "quote", label: "Quote", type: "textarea", required: true },
      { name: "name", label: "Name", type: "text", required: true },
      { name: "role", label: "Role / team", type: "text" },
    ],
    defaults: [
      { image: life1.src, alt: "AlgoShack team member at work", quote: "I started my career here and learnt so much from the moment I started. In a very short time I got the opportunity to deal with clients.", name: "QA Director", role: "MedTech, Bengaluru" },
      { image: life2.src, alt: "AlgoShack team members working together", quote: "I started my career here and learnt so much from the moment I started. In a very short time I got the opportunity to deal with clients.", name: "QA Director", role: "MedTech, Bengaluru" },
      { image: life3.src, alt: "AlgoShack colleague", quote: "AlgoShack is a great place to learn new technologies, has a nice working atmosphere, and in a short time I was communicating with clients.", name: "Nagajyothi Kapuluru", role: "Quality engineering" },
      { image: life4.src, alt: "AlgoShack colleague", quote: "A great working experience. Very friendly environment, you always feel supported by the mentors, with exposure to a lot of new and exciting things.", name: "Yashi Rathore", role: "Test engineering" },
      { image: life5.src, alt: "AlgoShack team member", quote: "I started my career here and learnt so much from the moment I started. In a very short time I got the opportunity to deal with clients.", name: "QA Director", role: "MedTech, Bengaluru" },
    ],
    itemLabel: (row) => `${row.name} — ${String(row.quote).slice(0, 50)}…`,
  },
  {
    key: "usecases",
    label: "Use cases / Industries",
    description: "Expanding industry panels.",
    kind: "list",
    ...sectionHeader(
      "Industries",
      "Proven where the cost of a bug is highest.",
      "algoQA is built for regulated environments. Governance and traceability are in the platform, not bolted on. Your data is never used to train anyone else's model."
    ),
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "text", label: "Description", type: "textarea", required: true },
      { name: "image", label: "Background image", type: "image", required: true },
      { name: "href", label: "Explore link", type: "url" },
      { name: "icon", label: "Icon", type: "select", options: USECASE_ICONS },
      { name: "visible", label: "Show on website", type: "checkbox" },
    ],
    defaults: [
      { title: "MedTech & Radiology Informatics", text: "Regulated, safety-critical, IEC 62304 and ISO 14971 territory. Traceability isn't optional.", image: "/images/slider-img-1.jpg", href: "#", icon: "heartbeat", visible: true },
      { title: "Retail & digital commerce", text: "Add a short description for Retail & digital commerce here.", image: "/images/slider-img-2.jpg", href: "#", icon: "bag", visible: true },
      { title: "Banking & fintech", text: "Add a short description for Banking & fintech here.", image: "/images/slider-img-3.jpg", href: "#", icon: "bank", visible: true },
      { title: "Logistics", text: "Add a short description for Logistics here.", image: "/images/slider-img-2.jpg", href: "#", icon: "truck", visible: false },
      { title: "Information & Technology", text: "Add a short description for Information & Technology here.", image: "/images/slider-img-3.jpg", href: "#", icon: "monitor", visible: false },
    ],
    itemLabel: (row) => String(row.title),
  },
  {
    key: "locations",
    label: "Locations",
    description: "Office cards.",
    kind: "list",
    ...sectionHeader(
      "Locations",
      "Two offices, one team.",
      "300+ professionals across India and the United States, with delivery coverage in both time zones."
    ),
    fields: [
      { name: "tag", label: "Tag (e.g. Headquarters)", type: "text" },
      { name: "city", label: "City", type: "text", required: true },
      { name: "address", label: "Address", type: "textarea", required: true },
      { name: "image", label: "Image", type: "image", required: true },
      { name: "directions", label: "Custom directions link", type: "url", help: "Leave empty to use a Google Maps search of the address." },
      { name: "visible", label: "Show on website", type: "checkbox" },
    ],
    defaults: [
      { tag: "Americas", city: "New Jersey, United States", address: "131 Continental Dr Ste 301, Newark, DE 19713, USA", image: location1.src, directions: "", visible: true },
      { tag: "Headquarters", city: "Bengaluru, India", address: "AlgoShack Technologies Pvt. Ltd. Outer Ring Road, Bellandur Bengaluru, Karnataka 560103", image: location2.src, directions: "", visible: true },
      { tag: "Headquarters", city: "Bengaluru, India", address: "AlgoShack Technologies Pvt. Ltd. Outer Ring Road, Bellandur Bengaluru, Karnataka 560103", image: location2.src, directions: "", visible: true },
    ],
    itemLabel: (row) => `${row.city} (${row.tag})`,
  },
  {
    key: "faqs",
    label: "FAQs",
    description: "Questions and answers accordion.",
    kind: "list",
    ...sectionHeader("FAQs", "About the company", "The questions people ask before they get in touch."),
    fields: [
      { name: "question", label: "Question", type: "text", required: true },
      { name: "answer", label: "Answer", type: "textarea", required: true },
    ],
    defaults: [
      { question: "What is AlgoShack?", answer: "A digital-native platform company established in January 2018, specialising in AI-augmented autonomous testing and quality engineering. 300+ people across India and the United States, 2,000+ person-years of testing expertise, six published patents, and 250+ enterprise engagements." },
      { question: "What is algoQA?", answer: "algoQA is AlgoShack's AI-augmented autonomous testing platform. Its agents plan, generate, run and maintain tests across web, mobile and API layers, so quality engineering keeps pace with every release." },
      { question: "Where is AlgoShack based?", answer: "We operate from offices across India and the United States, with teams working closely with customers across time zones." },
      { question: "Who do you work with?", answer: "We partner with 250+ enterprises across industries, from fast-moving digital businesses to large regulated organisations that need dependable, scalable quality engineering." },
      { question: "What certifications do you hold?", answer: "Our teams hold leading industry testing and cloud certifications, and our delivery follows established quality and information-security standards." },
      { question: "Are you hiring?", answer: "Yes. We are always looking for engineers, testers and AI specialists who care about quality. Get in touch and tell us about yourself." },
    ],
    itemLabel: (row) => String(row.question),
  },
  {
    key: "knowledge",
    label: "Knowledge hub",
    description: "Resource cards under 'See the platform in action'.",
    kind: "list",
    headerFields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "heading", label: "Heading", type: "text" },
      { name: "text", label: "Description", type: "textarea" },
    ],
    headerDefaults: {
      eyebrow: "Knowledge hub",
      heading: "See the platform in action.",
      text: "An AI-augmented autonomous testing platform for intelligent automation of software testing, leveraging GenAI and agentic AI. Six stages, continuously. Each one feeds the next, and the whole loop learns the application as it runs.",
    },
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "text", label: "Text", type: "textarea", required: true },
      { name: "href", label: "Link", type: "url" },
      { name: "icon", label: "Icon (SVG shapes)", type: "textarea", help: "Inner SVG shapes only (path/rect/circle). Keep the existing value if unsure." },
    ],
    defaults: [
      { title: "AlgoShack in the news", text: "Press releases, coverage and where to find us next.", href: "#", icon: `<path d="M9 6h22a2 2 0 0 1 2 2v26H9a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z"/><path d="M33 14h3a1 1 0 0 1 1 1v16a3 3 0 0 1-3 3h-1"/><path d="M12 13h14"/><path d="M12 19h14"/><path d="M12 25h8"/>` },
      { title: "Analyst reports", text: "Independent evaluations of the platform and the category.", href: "#", icon: `<path d="M23 4H10a2 2 0 0 0-2 2v28a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V13z"/><path d="M23 4v9h9"/><path d="M14 29v-4"/><path d="M20 29v-8"/><path d="M26 29v-6"/>` },
      { title: "algoQA for enterprise", text: "Deployment models, governance and Service-as-Software.", href: "#", icon: `<rect x="8" y="5" width="16" height="30" rx="2"/><path d="M24 15h6a2 2 0 0 1 2 2v18"/><path d="M13 12h6"/><path d="M13 18h6"/><path d="M13 24h6"/><path d="M15 35v-5h2v5"/><path d="M4 35h32"/>` },
      { title: "Integrations", text: "Frameworks, CI/CD, ALM, execution cloud and AI models.", href: "#", icon: `<path d="M14 5v8"/><path d="M26 5v8"/><path d="M10 13h20v6a10 10 0 0 1-20 0z"/><path d="M20 29v6"/>` },
      { title: "Success stories", text: "What changed for customers, with the numbers attached.", href: "#", icon: `<path d="M12 5h16v10a8 8 0 0 1-16 0z"/><path d="M12 9H6v3a6 6 0 0 0 6 6"/><path d="M28 9h6v3a6 6 0 0 1-6 6"/><path d="M20 23v7"/><path d="M13 35h14"/><path d="M15 35v-5h10v5"/>` },
      { title: "Patents", text: "Six published applications behind the autonomous loop.", href: "#", icon: `<rect x="4" y="6" width="32" height="22" rx="2.5"/><path d="M10 13h20"/><path d="M10 19h10"/><circle cx="28" cy="22" r="3.5"/><path d="m26 25-1.5 9 3.5-2 3.5 2-1.5-9"/>` },
      { title: "Partners", text: "Consulting, services and technology partnerships.", href: "#", icon: `<circle cx="12" cy="14" r="6"/><circle cx="28" cy="14" r="6"/><path d="M4 34v-2a7 7 0 0 1 7-7h2"/><path d="M36 34v-2a7 7 0 0 0-7-7h-2"/><path d="M14 33l6-5 6 5"/>` },
      { title: "Contact us", text: "Sales, support, HR, recruitment and both offices.", href: "#", icon: `<rect x="4" y="8" width="32" height="24" rx="3"/><path d="m5 11 15 12L35 11"/>` },
    ],
    itemLabel: (row) => String(row.title),
  },
];

export const getModuleDef = (key: string) => modules.find((moduleDef) => moduleDef.key === key);
