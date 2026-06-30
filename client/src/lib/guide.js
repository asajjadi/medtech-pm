// Educational content for newcomers to medical device project management.
// Plain-language explanations of the lifecycle + a starter project template.

// One entry per lifecycle phase (ids match lib/constants.js PHASES).
export const LIFECYCLE = [
  {
    id: "concept",
    label: "Concept",
    what: "You decide what the device is, who it's for, and what problem it solves.",
    why: "Everything downstream traces back to the user needs you define here. Get this vague and the whole project drifts.",
    standards: "User needs feed FDA Design Controls (21 CFR 820.30) and ISO 13485.",
  },
  {
    id: "design_input",
    label: "Design input",
    what: "You turn user needs into concrete, testable requirements the device must meet.",
    why: "Design inputs are the contract for the whole design. Auditors check that every requirement is specific and verifiable.",
    standards: "Core of FDA Design Controls; risk planning starts here under ISO 14971.",
  },
  {
    id: "design_output",
    label: "Design output",
    what: "You create the actual design: drawings, specs, code, and the bill of materials.",
    why: "Outputs must satisfy every design input. This is where 'what we want' becomes 'what we built.'",
    standards: "ISO 14971 (risk analysis like DFMEA); IEC 62304 if the device has software.",
  },
  {
    id: "vv",
    label: "Verification & Validation (V&V)",
    what: "You prove the device works: verification = 'did we build it right?', validation = 'did we build the right thing?'",
    why: "This is your evidence the device is safe and effective. No V&V, no submission.",
    standards: "ISO 10993 (biocompatibility), IEC 62304 (software testing), design controls.",
  },
  {
    id: "transfer",
    label: "Design transfer",
    what: "You hand the design to manufacturing and prove it can be made consistently.",
    why: "A design that works in the lab but can't be mass-produced reliably isn't done.",
    standards: "Process validation (IQ/OQ/PQ) under ISO 13485.",
  },
  {
    id: "regulatory",
    label: "Regulatory",
    what: "You compile and submit the evidence to regulators to get clearance to sell.",
    why: "Without clearance (e.g. FDA 510(k) in the US, CE mark in the EU) you legally can't market the device.",
    standards: "FDA 510(k) / PMA; EU MDR for CE marking.",
  },
  {
    id: "production",
    label: "Production",
    what: "You manufacture, release, and monitor the device in the real world.",
    why: "Post-market surveillance catches problems in the field and feeds them back into the design.",
    standards: "ISO 13485 production controls; post-market surveillance requirements.",
  },
];

// A curated starter project: the standard backbone every medtech project needs,
// so a newcomer learns by working a real (if generic) plan instead of a blank page.
export function starterItems() {
  const today = new Date();
  const d = (offsetDays) => {
    const x = new Date(today);
    x.setDate(x.getDate() + offsetDays);
    return x.toISOString().slice(0, 10);
  };
  const mk = (title, phase, owner, risk, startOff, dueOff) => ({
    title,
    phase,
    status: "backlog",
    risk,
    owner,
    start: d(startOff),
    due: d(dueOff),
  });
  return [
    mk("Define user needs & intended use", "concept", "PM", "low", 0, 14),
    mk("Document design inputs (requirements)", "design_input", "Eng", "med", 14, 44),
    mk("Start risk management file (ISO 14971)", "design_input", "QA", "high", 14, 49),
    mk("Produce design outputs (specs & drawings)", "design_output", "Eng", "med", 44, 79),
    mk("Author V&V test protocols", "vv", "QA", "med", 79, 104),
    mk("Plan design transfer to manufacturing", "transfer", "Mfg", "med", 104, 134),
    mk("Prepare regulatory submission (e.g. 510(k))", "regulatory", "RA", "high", 134, 174),
  ];
}

// Plain-language glossary of common medical-device jargon.
export const GLOSSARY = [
  { term: "Design controls", def: "The FDA-required process (21 CFR 820.30) for designing a device in a documented, traceable way — from user needs to verified output." },
  { term: "Design input", def: "The documented, testable requirements your device must meet. The 'contract' for the design." },
  { term: "Design output", def: "The actual results of designing: drawings, specs, code, bill of materials — what you'll manufacture." },
  { term: "Verification (V)", def: "Checking you built the device right — that outputs meet inputs. ('Did we meet the spec?')" },
  { term: "Validation (V)", def: "Checking you built the right device — that it meets user needs in real use. ('Does it actually work for users?')" },
  { term: "ISO 13485", def: "The international standard for a medical device Quality Management System (QMS) — how your whole company operates." },
  { term: "ISO 14971", def: "The standard for risk management — identifying, evaluating, and controlling risks across the device's life." },
  { term: "IEC 62304", def: "The standard for medical device software lifecycle processes. Applies if your device contains software." },
  { term: "ISO 10993", def: "The standard for biological evaluation (biocompatibility) — is the device safe to contact the body?" },
  { term: "510(k)", def: "A US FDA submission showing your device is 'substantially equivalent' to one already on the market. The most common US clearance path." },
  { term: "PMA", def: "Premarket Approval — the stricter FDA path for high-risk (Class III) devices, requiring clinical evidence." },
  { term: "CE mark", def: "The marking showing a device meets EU requirements (EU MDR), allowing sale in Europe." },
  { term: "DHF", def: "Design History File — the compiled record proving the device was developed under design controls." },
  { term: "DFMEA", def: "Design Failure Mode and Effects Analysis — a structured way to find how a design could fail and how bad it would be." },
  { term: "IQ/OQ/PQ", def: "Installation/Operational/Performance Qualification — the steps to validate a manufacturing process works reliably." },
  { term: "Intended use", def: "The official statement of what the device is for and who uses it. Everything downstream traces back to this." },
];

// Starter questions to seed the Coach so a newcomer knows what they can ask.
export const COACH_PROMPTS = [
  "What does a medical device project look like end to end?",
  "What is design input and why does it matter?",
  "What's a 510(k)?",
  "What should I work on first?",
];
