#!/usr/bin/env node
// scripts/generate-other-tracks.mjs
// Generates 30 lesson files each for FREELANCE_ESCROW, DAO, and DEVELOPER_REPUTATION
// following the same 30-lesson group structure from the gist.

import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const LESSONS_DIR = resolve(ROOT, "src", "content", "lessons");
const HASH = `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function normalizeQ(s) {
  let r = "";
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c === 0x2018 || c === 0x2019) r += "'";
    else if (c === 0x201C || c === 0x201D) r += '"';
    else r += s[i];
  }
  return r;
}
function dqEscape(s) {
  return normalizeQ(s)
    .replace(/"/g, "'")
    .replace(/\\/g, "/")
    .replace(/\n/g, " ")
    .trim();
}
function tsEscape(s) {
  return normalizeQ(s)
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}
function file(lessonId, projectPath, explanation, starterCode, task, h1, h2, h3, expectedCode) {
  const escapedExpected = expectedCode && expectedCode !== starterCode
    ? `\n  expectedCode: \`${tsEscape(expectedCode)}\`,`
    : "";
  return `import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: ${lessonId},
  projectPath: "${projectPath}",
  explanation: \`${tsEscape(explanation)}\`,
  starterCode: \`${tsEscape(starterCode)}\`,${escapedExpected}
  task: \`${tsEscape(task)}\`,
  hints: [
    "${dqEscape(h1)}",
    "${dqEscape(h2)}",
    "${dqEscape(h3)}",
  ],
};

export default content;
`;
}
function write(lessonId, projectPath, explanation, starterCode, task, h1, h2, h3, expectedCode) {
  const nn = String(lessonId).padStart(2, "0");
  const fp = resolve(LESSONS_DIR, `lesson-${nn}-${projectPath}.ts`);
  writeFileSync(fp, file(lessonId, projectPath, explanation, starterCode, task, h1, h2, h3, expectedCode), "utf8");
  console.log(`  ✓ lesson-${nn}-${projectPath}.ts`);
}

// ─────────────────────────────────────────────────────────────────────────────
//  FREELANCE_ESCROW  (TrustLance)
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n── Generating FREELANCE_ESCROW ──────────────────");

const FE = "FREELANCE_ESCROW";
const feBase = `# { "Depends": "${HASH}" }

import json
from genlayer import *


class TrustLance(gl.Contract):
    owner: Address
    platform_name: str
    platform_description: str`;

const feL5 = feBase + `

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "TrustLance"
        self.platform_description = "A GenLayer freelance escrow platform."

    @gl.public.view
    def get_platform_name(self) -> str:
        return self.platform_name

    @gl.public.view
    def get_platform_description(self) -> str:
        return self.platform_description

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner.as_hex

    @gl.public.view
    def get_contract_summary(self) -> str:
        return self.platform_name + ": " + self.platform_description

    @gl.public.write
    def update_platform_description(self, new_description: str) -> None:
        assert gl.message.sender_address == self.owner, "Only owner can update"
        assert len(new_description) > 0, "Description cannot be empty"
        self.platform_description = new_description`;

const feL10 = feL5 + `

    job_count: u256
    job_titles: TreeMap[str, str]
    job_descriptions: TreeMap[str, str]
    job_clients: TreeMap[str, Address]
    job_budgets: TreeMap[str, u256]
    job_statuses: TreeMap[str, str]
    job_freelancers: TreeMap[str, Address]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "TrustLance"
        self.platform_description = "A GenLayer freelance escrow platform."
        self.job_count = u256(0)

    @gl.public.write
    def create_job(self, title: str, description: str, budget: u256) -> str:
        assert len(title) > 0, "Title cannot be empty"
        assert len(description) > 0, "Description cannot be empty"
        assert budget > u256(0), "Budget must be greater than zero"

        job_id = str(self.job_count)
        self.job_titles[job_id] = title
        self.job_descriptions[job_id] = description
        self.job_clients[job_id] = gl.message.sender_address
        self.job_budgets[job_id] = budget
        self.job_statuses[job_id] = "open"
        self.job_count = self.job_count + u256(1)
        return job_id`;

const feL15 = feL10 + `

    job_ids: DynArray[str]

    @gl.public.view
    def get_job_json(self, job_id: str) -> str:
        assert job_id in self.job_titles, "Job not found"
        return json.dumps({
            "id": job_id,
            "title": self.job_titles[job_id],
            "description": self.job_descriptions[job_id],
            "client": self.job_clients[job_id].as_hex,
            "budget": str(self.job_budgets[job_id]),
            "status": self.job_statuses[job_id],
        }, sort_keys=True)

    @gl.public.view
    def get_open_jobs_json(self) -> str:
        result = []
        for job_id in self.job_ids:
            if self.job_statuses[job_id] == "open":
                result.append({"id": job_id, "title": self.job_titles[job_id], "budget": str(self.job_budgets[job_id])})
        return json.dumps(result, sort_keys=True)

    @gl.public.view
    def get_all_jobs_json(self) -> str:
        result = []
        for job_id in self.job_ids:
            result.append({"id": job_id, "title": self.job_titles[job_id], "status": self.job_statuses[job_id]})
        return json.dumps(result, sort_keys=True)

    @gl.public.write
    def close_job(self, job_id: str) -> None:
        assert job_id in self.job_titles, "Job not found"
        assert gl.message.sender_address == self.job_clients[job_id], "Only client can close"
        assert self.job_statuses[job_id] == "open", "Only open jobs can be closed"
        self.job_statuses[job_id] = "closed"`;

const feL20 = feL15 + `

    job_escrow: TreeMap[str, u256]
    job_deliveries: TreeMap[str, str]
    freelancer_claimed: TreeMap[str, bool]

    @gl.public.write.payable
    def fund_job(self, job_id: str) -> None:
        assert job_id in self.job_titles, "Job not found"
        assert gl.message.sender_address == self.job_clients[job_id], "Only client can fund"
        assert self.job_statuses[job_id] == "open", "Job must be open"
        assert gl.message.value >= self.job_budgets[job_id], "Insufficient funds"
        self.job_escrow[job_id] = gl.message.value
        self.job_statuses[job_id] = "funded"

    @gl.public.write
    def accept_job(self, job_id: str) -> None:
        assert job_id in self.job_titles, "Job not found"
        assert self.job_statuses[job_id] == "funded", "Job must be funded"
        self.job_freelancers[job_id] = gl.message.sender_address
        self.job_statuses[job_id] = "accepted"

    @gl.public.write
    def submit_delivery(self, job_id: str, delivery_ref: str) -> None:
        assert job_id in self.job_titles, "Job not found"
        assert gl.message.sender_address == self.job_freelancers[job_id], "Only freelancer can submit"
        assert self.job_statuses[job_id] == "accepted", "Job must be accepted"
        self.job_deliveries[job_id] = delivery_ref
        self.job_statuses[job_id] = "delivered"

    @gl.public.write
    def confirm_delivery(self, job_id: str) -> None:
        assert job_id in self.job_titles, "Job not found"
        assert gl.message.sender_address == self.job_clients[job_id], "Only client can confirm"
        assert self.job_statuses[job_id] == "delivered", "Delivery must be submitted first"
        assert not self.freelancer_claimed.get(job_id, False), "Already paid"
        self.freelancer_claimed[job_id] = True
        self.job_statuses[job_id] = "completed"
        gl.message.recipient_address.transfer(self.job_escrow[job_id])`;

const feL25 = feL20 + `

    @gl.public.write
    def review_dispute_with_ai(self, job_id: str, reason: str) -> str:
        assert job_id in self.job_titles, "Job not found"
        assert self.job_statuses[job_id] == "delivered", "Job must be in delivered state"
        delivery = self.job_deliveries.get(job_id, "no delivery ref")
        description = self.job_descriptions[job_id]
        prompt = (
            f"A freelance job dispute:\\n"
            f"Job Description: {description}\\n"
            f"Delivery Reference: {delivery}\\n"
            f"Dispute Reason: {reason}\\n\\n"
            f"Respond with JSON: {{\\\"verdict\\\": \\\"release\\\" or \\\"refund\\\", "
            f"\\\"confidence\\\": 0-100, \\\"reason\\\": \\\"explanation\\\"}}"
        )
        def run(prompt):
            result = gl.nondet.exec_prompt(prompt)
            import re
            m = re.search(r'\\{.*\\}', result, re.DOTALL)
            return m.group(0) if m else result
        result = gl.eq_principle_strict_eq(run, prompt)
        return result`;

const feFinal = feL25 + `

    @gl.public.view
    def get_frontend_actions_json(self) -> str:
        return json.dumps({
            "create": "create_job(title, description, budget)",
            "list": "get_open_jobs_json()",
            "detail": "get_job_json(job_id)",
            "fund": "fund_job(job_id)",
            "accept": "accept_job(job_id)",
            "deliver": "submit_delivery(job_id, delivery_ref)",
            "confirm": "confirm_delivery(job_id)",
            "dispute": "review_dispute_with_ai(job_id, reason)",
        }, sort_keys=True)

    @gl.public.view
    def get_test_checklist_json(self) -> str:
        return json.dumps([
            "Create a job with valid title and budget",
            "Reject job with empty title",
            "Fund the job with correct amount",
            "Accept job as freelancer",
            "Submit delivery reference",
            "Confirm delivery as client — freelancer gets paid",
            "Dispute unaccepted delivery with AI review",
            "Reject duplicate payment",
        ], sort_keys=True)`;

const feHeader = `# { "Depends": "${HASH}" }

import json
from genlayer import *`;

// Lessons 1-5
write(1, FE, `## Lesson 1 — What You Are Building: Freelance Escrow

### What You'll Learn
Freelance work is high-trust: clients pay, freelancers deliver. TrustLance uses GenLayer Intelligent Contracts to hold funds in escrow, release them on confirmed delivery, and resolve disputes via AI — no middleman needed.

### How It Works
Every GenLayer contract is a Python class extending \`gl.Contract\`:

\`\`\`python
class TrustLance(gl.Contract):
    project_name: str

    def __init__(self) -> None:
        self.project_name = "TrustLance"
\`\`\`

State variables declared at class level are persisted automatically.`,
feHeader + `


class TrustLance(gl.Contract):
    project_name: str

    def __init__(self) -> None:
        self.project_name = "TrustLance"

    @gl.public.view
    def get_project_name(self) -> str:
        return self.project_name
`,
`Change the project name from "TrustLance" to "TrustLance: Freelance Escrow Platform" inside the constructor.`,
"The only change needed is in __init__ — find the line where self.project_name is assigned.",
"Replace the string value with the full name including the subtitle.",
'Key line: `self.project_name = "TrustLance: Freelance Escrow Platform"`');

write(2, FE, `## Lesson 2 — TrustLance Contract Skeleton

### What You'll Learn
Add persistent owner tracking and a platform name field. The owner will have admin rights for the platform.

### How It Works
\`gl.message.sender_address\` captures the deployer:
\`\`\`python
self.owner = gl.message.sender_address
\`\`\`
Declare \`owner: Address\` at class level to persist it across calls.`,
feHeader + `


class TrustLance(gl.Contract):
    owner: Address
    platform_name: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "TrustLance"
`,
`Add a \`platform_description: str\` field and initialize it in the constructor with "A GenLayer freelance escrow platform."`,
"Add the field at class level and assign it in __init__.",
"Use the exact string: A GenLayer freelance escrow platform.",
'Key line: `self.platform_description = "A GenLayer freelance escrow platform."`');

write(3, FE, `## Lesson 3 — Reading Platform Info

### What You'll Learn
Expose platform data using \`@gl.public.view\`. View methods are free to call and return state without modifying it.

### How It Works
\`\`\`python
@gl.public.view
def get_platform_name(self) -> str:
    return self.platform_name
\`\`\`
Add similar methods for description and owner.`,
feBase + `

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "TrustLance"
        self.platform_description = "A GenLayer freelance escrow platform."

    @gl.public.view
    def get_platform_name(self) -> str:
        return self.platform_name
`,
`Add two more \`@gl.public.view\` methods: \`get_platform_description()\` and \`get_owner()\` (return \`self.owner.as_hex\`).`,
"Add @gl.public.view before each method definition.",
"get_owner() should return self.owner.as_hex — a string, not an Address object.",
"Key line: `return self.owner.as_hex`");

write(4, FE, `## Lesson 4 — Updating Platform Info

### What You'll Learn
Use \`@gl.public.write\` to modify state. Only the owner should be able to update the description.

### How It Works
\`\`\`python
@gl.public.write
def update_platform_description(self, new_description: str) -> None:
    assert gl.message.sender_address == self.owner, "Only owner can update"
\`\`\`
The \`assert\` guard rejects unauthorized callers.`,
feBase + `

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "TrustLance"
        self.platform_description = "A GenLayer freelance escrow platform."

    @gl.public.view
    def get_platform_name(self) -> str:
        return self.platform_name

    @gl.public.view
    def get_platform_description(self) -> str:
        return self.platform_description

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner.as_hex
`,
`Add \`update_platform_description(self, new_description: str)\` decorated with \`@gl.public.write\`. Validate that only the owner can call it, and that the description is not empty.`,
"Use @gl.public.write and check gl.message.sender_address == self.owner.",
"Add a second assert to reject empty descriptions.",
'Key line: `assert len(new_description) > 0, "Description cannot be empty"`');

write(5, FE, `## Lesson 5 — Major Upgrade: Freelance Platform Identity Contract

### What You'll Learn
Combine everything from lessons 1-4 into a complete identity contract: owner, platform metadata, view methods, write methods, and a summary getter.

### How It Works
A capstone lesson assembles all concepts learned so far. Add \`get_contract_summary()\` to combine name and description in one call.`,
feBase + `

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "TrustLance"
        self.platform_description = "A GenLayer freelance escrow platform."

    @gl.public.view
    def get_platform_name(self) -> str:
        return self.platform_name

    @gl.public.view
    def get_platform_description(self) -> str:
        return self.platform_description

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner.as_hex

    @gl.public.write
    def update_platform_description(self, new_description: str) -> None:
        assert gl.message.sender_address == self.owner, "Only owner can update"
        assert len(new_description) > 0, "Description cannot be empty"
        self.platform_description = new_description
`,
`Add \`get_contract_summary(self) -> str\` that returns the platform name and description joined with ": ".`,
"Concatenate platform_name and platform_description with a separator.",
"Use the + operator to join strings.",
'Key line: `return self.platform_name + ": " + self.platform_description`');

// Lessons 6-10
write(6, FE, `## Lesson 6 — Job Storage Fields

### What You'll Learn
Add \`job_count: u256\` — a persistent counter for job IDs. Every new job gets a unique ID derived from this counter.`,
feL5 + `

    job_count: u256

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "TrustLance"
        self.platform_description = "A GenLayer freelance escrow platform."
        self.job_count = u256(0)
`,
`Initialize \`job_count\` to \`u256(0)\` in the constructor. Add a \`@gl.public.view\` method \`get_job_count()\` that returns it as a string.`,
"Declare job_count: u256 at class level and initialize with u256(0).",
"Return str(self.job_count) so the JSON frontend can read it.",
"Key line: `return str(self.job_count)`");

write(7, FE, `## Lesson 7 — Client Address Tracking

### What You'll Learn
Store the address of each job's creator (client) in a \`TreeMap[str, Address]\`. The key is the job ID string.`,
feL5 + `

    job_count: u256
    job_clients: TreeMap[str, Address]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "TrustLance"
        self.platform_description = "A GenLayer freelance escrow platform."
        self.job_count = u256(0)
`,
`Add a method \`create_job_stub(self, title: str) -> str\` decorated with \`@gl.public.write\` that stores the caller's address in \`job_clients\` at key \`str(self.job_count)\` and increments the counter.`,
"Use gl.message.sender_address to capture the caller.",
"Increment job_count: self.job_count = self.job_count + u256(1).",
"Key line: `self.job_clients[job_id] = gl.message.sender_address`");

write(8, FE, `## Lesson 8 — Job Budgets with u256

### What You'll Learn
Store job budgets as \`u256\` — the correct type for all on-chain monetary amounts.`,
feL5 + `

    job_count: u256
    job_clients: TreeMap[str, Address]
    job_budgets: TreeMap[str, u256]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "TrustLance"
        self.platform_description = "A GenLayer freelance escrow platform."
        self.job_count = u256(0)
`,
`Add \`job_budgets: TreeMap[str, u256]\` as a class-level field. In \`create_job_stub\`, also accept a \`budget: u256\` parameter and store it in \`job_budgets[job_id]\`.`,
"Declare job_budgets: TreeMap[str, u256] at class level.",
"Store the budget using: self.job_budgets[job_id] = budget.",
"Key line: `self.job_budgets[job_id] = budget`");

write(9, FE, `## Lesson 9 — Job Records with TreeMap

### What You'll Learn
Add title, description, and status fields as \`TreeMap[str, str]\` to store complete job records per ID.`,
feL5 + `

    job_count: u256
    job_titles: TreeMap[str, str]
    job_descriptions: TreeMap[str, str]
    job_clients: TreeMap[str, Address]
    job_budgets: TreeMap[str, u256]
    job_statuses: TreeMap[str, str]
    job_freelancers: TreeMap[str, Address]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "TrustLance"
        self.platform_description = "A GenLayer freelance escrow platform."
        self.job_count = u256(0)
`,
`Add \`job_titles\`, \`job_descriptions\`, and \`job_statuses\` as \`TreeMap[str, str]\` fields. Update \`create_job_stub\` to store all three, setting status to \`"open"\`.`,
"Add three TreeMap[str, str] fields at class level.",
'Set job_statuses[job_id] = "open" in the creation method.',
'Key line: `self.job_statuses[job_id] = "open"`');

write(10, FE, `## Lesson 10 — Major Upgrade: Create a Job

### What You'll Learn
Build the complete \`create_job()\` method with full validation, address capture, TreeMap storage, and counter increment.

### How It Works
A properly validated create method checks all inputs before writing any state.`,
feL5 + `

    job_count: u256
    job_titles: TreeMap[str, str]
    job_descriptions: TreeMap[str, str]
    job_clients: TreeMap[str, Address]
    job_budgets: TreeMap[str, u256]
    job_statuses: TreeMap[str, str]
    job_freelancers: TreeMap[str, Address]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "TrustLance"
        self.platform_description = "A GenLayer freelance escrow platform."
        self.job_count = u256(0)
`,
`Complete \`create_job(self, title: str, description: str, budget: u256) -> str\` with: 3 input validations (non-empty title, non-empty description, budget > 0), all field assignments, counter increment, return the job ID.`,
"Validate all 3 inputs with assert statements before writing state.",
"Increment: self.job_count = self.job_count + u256(1).",
'Key line: `assert budget > u256(0), "Budget must be greater than zero"`');

// Lessons 11-15
write(11, FE, `## Lesson 11 — Job Indexing with DynArray

### What You'll Learn
Add \`job_ids: DynArray[str]\` so the frontend can enumerate all jobs in order.`,
feL10 + `

    job_ids: DynArray[str]
`,
`Add \`job_ids: DynArray[str]\` at class level. In \`create_job\`, call \`self.job_ids.append(job_id)\` after assigning all other fields.`,
"Declare job_ids: DynArray[str] at class level.",
"Append the new job ID after all TreeMap assignments.",
"Key line: `self.job_ids.append(job_id)`");

write(12, FE, `## Lesson 12 — Job JSON View

### What You'll Learn
Build \`get_job_json(job_id)\` returning a JSON string — the standard way frontends read contract state.`,
feL10 + `

    job_ids: DynArray[str]

    @gl.public.view
    def get_job_json(self, job_id: str) -> str:
        assert job_id in self.job_titles, "Job not found"
        return json.dumps({
            "id": job_id,
            "title": self.job_titles[job_id],
`,
`Complete \`get_job_json\` to include all fields: id, title, description, client (as hex), budget (as str), status.`,
"Use json.dumps({...}) with sort_keys=True.",
"Convert budget to string: str(self.job_budgets[job_id]).",
'Key line: `"budget": str(self.job_budgets[job_id])`');

write(13, FE, `## Lesson 13 — Listing Open Jobs

### What You'll Learn
Build \`get_open_jobs_json()\` by looping \`job_ids\` and filtering for \`"open"\` status.`,
feL15.split("    @gl.public.view\n    def get_open_jobs_json")[0] + `

    job_ids: DynArray[str]

    @gl.public.view
    def get_job_json(self, job_id: str) -> str:
        assert job_id in self.job_titles, "Job not found"
        return json.dumps({"id": job_id, "title": self.job_titles[job_id], "budget": str(self.job_budgets[job_id]), "status": self.job_statuses[job_id]}, sort_keys=True)
`,
`Add \`get_open_jobs_json(self) -> str\` that loops \`job_ids\`, filters by \`job_statuses[job_id] == "open"\`, and returns a JSON array.`,
'Loop: for job_id in self.job_ids: check if status == "open".',
"Build a list and return json.dumps(result, sort_keys=True).",
'Key line: `if self.job_statuses[job_id] == "open":`');

write(14, FE, `## Lesson 14 — Job Status Flow

### What You'll Learn
Model the job lifecycle: \`open → funded → accepted → delivered → completed/closed\`. Add a \`close_job()\` method.`,
feL15.split("    @gl.public.view\n    def get_all_jobs_json")[0] + `
    @gl.public.view
    def get_open_jobs_json(self) -> str:
        result = []
        for job_id in self.job_ids:
            if self.job_statuses[job_id] == "open":
                result.append({"id": job_id, "title": self.job_titles[job_id]})
        return json.dumps(result, sort_keys=True)
`,
`Add \`close_job(self, job_id: str)\` decorated with \`@gl.public.write\`. Only the client can close a job, and only if it's "open".`,
"Check job existence, then caller == job_clients[job_id], then status == open.",
'Set status to "closed" after all checks pass.',
'Key line: `self.job_statuses[job_id] = "closed"`');

write(15, FE, `## Lesson 15 — Major Upgrade: Browseable Freelance Marketplace

### What You'll Learn
Combine job indexing, JSON views, status filtering, and status transitions into a full dashboard-ready contract.`,
feL15 + `
`,
`Add \`get_all_jobs_json()\` that returns all jobs (any status) as a JSON array. Include: id, title, status fields.`,
"Loop all job_ids without status filtering.",
"Include at minimum: id, title, status in each entry.",
'Key line: `result.append({"id": job_id, "title": self.job_titles[job_id], "status": self.job_statuses[job_id]})`');

// Lessons 16-20
write(16, FE, `## Lesson 16 — Funding a Job

### What You'll Learn
Add \`fund_job()\` with \`@gl.public.write.payable\` so clients can lock GEN into escrow.`,
feL15 + `

    job_escrow: TreeMap[str, u256]
`,
`Add \`fund_job(self, job_id: str)\` with \`@gl.public.write.payable\`. Verify: job exists, caller is client, status is "open", value >= budget. Store \`gl.message.value\` in \`job_escrow[job_id]\` and set status to "funded".`,
"Use @gl.public.write.payable — the caller sends GEN with the transaction.",
"Check: gl.message.value >= self.job_budgets[job_id].",
"Key line: `self.job_escrow[job_id] = gl.message.value`");

write(17, FE, `## Lesson 17 — Accepting a Job

### What You'll Learn
Any freelancer can accept a funded job. Add \`accept_job()\` to register the worker.`,
feL15 + `

    job_escrow: TreeMap[str, u256]

    @gl.public.write.payable
    def fund_job(self, job_id: str) -> None:
        assert job_id in self.job_titles, "Job not found"
        assert gl.message.sender_address == self.job_clients[job_id], "Only client can fund"
        assert self.job_statuses[job_id] == "open", "Job must be open"
        assert gl.message.value >= self.job_budgets[job_id], "Insufficient funds"
        self.job_escrow[job_id] = gl.message.value
        self.job_statuses[job_id] = "funded"
`,
`Add \`accept_job(self, job_id: str)\` with \`@gl.public.write\`. Verify job is "funded", record \`gl.message.sender_address\` in \`job_freelancers[job_id]\`, set status to "accepted".`,
"Check status == funded before accepting.",
"Store the accepting address as the freelancer.",
'Key line: `self.job_freelancers[job_id] = gl.message.sender_address`');

write(18, FE, `## Lesson 18 — Delivery Submission

### What You'll Learn
Add \`submit_delivery()\` so the freelancer can record a delivery reference (URL, hash, or description) for the client to review.`,
feL20.split("    @gl.public.write\n    def confirm_delivery")[0] + `
`,
`Add \`submit_delivery(self, job_id: str, delivery_ref: str)\` with \`@gl.public.write\`. Only the registered freelancer can submit. Store \`delivery_ref\` in \`job_deliveries[job_id]\` and set status to "delivered".`,
"Check sender == job_freelancers[job_id] and status == accepted.",
"Store delivery_ref in a TreeMap[str, str] called job_deliveries.",
"Key line: `self.job_deliveries[job_id] = delivery_ref`");

write(19, FE, `## Lesson 19 — Release and Refund Patterns

### What You'll Learn
Add \`confirm_delivery()\` to release escrowed funds to the freelancer, and ensure duplicate payments are blocked.`,
feL20 + `
`,
`Add the \`confirm_delivery(self, job_id: str)\` method that: checks caller is client, status is "delivered", not already claimed; marks claimed, sets status "completed", and calls \`gl.message.recipient_address.transfer(self.job_escrow[job_id])\`.`,
"Check freelancer_claimed[job_id] is False before paying.",
"Set freelancer_claimed[job_id] = True before transferring.",
"Key line: `gl.message.recipient_address.transfer(self.job_escrow[job_id])`");

write(20, FE, `## Lesson 20 — Major Upgrade: Complete Freelance Escrow Flow

### What You'll Learn
Ship the complete fund → accept → deliver → confirm/refund TrustLance escrow system.`,
feL20 + `
`,
`The contract is mostly complete. Add a simple \`get_escrow_balance(self, job_id: str) -> str\` view method that returns the locked escrow as a string.`,
"Return str(self.job_escrow.get(job_id, u256(0))).",
"Use .get() with a default to avoid KeyError on jobs without escrow.",
'Key line: `return str(self.job_escrow.get(job_id, u256(0)))`');

// Lessons 21-25
write(21, FE, `## Lesson 21 — AI Dispute Review Basics

### What You'll Learn
When a client disputes a delivery, AI can compare the job description against the delivery reference and recommend whether to release or refund.

### How It Works
The AI prompt includes the job description, delivery reference, and dispute reason. The AI responds with a structured verdict.`,
feL20 + `
`,
`Add \`get_dispute_prompt(self, job_id: str, reason: str) -> str\` as a \`@gl.public.view\` method. Return a prompt string that includes the job description, delivery reference, and reason.`,
"Build a multi-line f-string prompt combining the job fields.",
"Include description, delivery_ref, and the reason parameter.",
"Key line: `return f'Job: {self.job_descriptions[job_id]}\\nDelivery: {delivery}\\nReason: {reason}'`");

write(22, FE, `## Lesson 22 — Dispute Review with gl.nondet.exec_prompt

### What You'll Learn
Call \`gl.nondet.exec_prompt()\` to send the dispute to the AI and get a verdict. Wrap the call in \`gl.eq_principle_strict_eq\` for validator consensus.`,
feL20 + `
`,
`Add \`review_dispute_with_ai(self, job_id: str, reason: str) -> str\`. Build a prompt, define an inner function that calls \`gl.nondet.exec_prompt(prompt)\`, then call \`gl.eq_principle_strict_eq(run, prompt)\`.`,
"Define a nested def run(prompt): inside the method.",
"Call gl.eq_principle_strict_eq(run, prompt) — not exec_prompt directly.",
"Key line: `result = gl.eq_principle_strict_eq(run, prompt)`");

write(23, FE, `## Lesson 23 — Comparative AI Validation

### What You'll Learn
Use a comparative validation pattern to ensure AI dispute output is consistent across all validators.`,
feL25 + `
`,
`Refine \`review_dispute_with_ai\` to extract JSON from the AI response using a regex. If extraction fails, return the raw text. The result must be identical across validators.`,
"Use import re and re.search(r'{.*}', result, re.DOTALL).",
"Return m.group(0) if match found, else return result.",
"Key line: `m = re.search(r'{.*}', result, re.DOTALL)`");

write(24, FE, `## Lesson 24 — Structured Dispute Output

### What You'll Learn
Ask the AI for structured JSON: \`{"verdict": "release"/"refund", "confidence": 0-100, "reason": "..."}\`. Parse and store the outcome.`,
feL25 + `
`,
`Update the AI prompt in \`review_dispute_with_ai\` to explicitly request JSON output with \`verdict\`, \`confidence\`, and \`reason\` fields. Add a \`dispute_outcomes: TreeMap[str, str]\` field to store results.`,
"Include the JSON schema in the prompt: {verdict, confidence, reason}.",
"Add dispute_outcomes: TreeMap[str, str] at class level.",
"Key line: `self.dispute_outcomes[job_id] = result`");

write(25, FE, `## Lesson 25 — Major Upgrade: AI-Assisted Dispute Engine

### What You'll Learn
Ship \`review_dispute_with_ai()\` — TrustLance can now resolve disputes without a human arbitrator.`,
feL25 + `
`,
`Add \`get_dispute_outcome(self, job_id: str) -> str\` as a \`@gl.public.view\` method that returns the stored AI dispute result for a job, or "no ruling yet" if none exists.`,
"Return self.dispute_outcomes.get(job_id, 'no ruling yet').",
"Use .get() with a default string to handle unresolved jobs.",
'Key line: `return self.dispute_outcomes.get(job_id, "no ruling yet")`');

// Lessons 26-30
write(26, FE, `## Lesson 26 — Escrow Safety Mistakes

### What You'll Learn
Guard against: paying before delivery, duplicate payments, unauthorized fund release, and early dispute filing.`,
feFinal + `
`,
`Add a guard inside \`review_dispute_with_ai\`: assert job has been delivered before allowing AI review. Add message: "Job must be delivered first".`,
"Check self.job_statuses[job_id] == 'delivered' before the AI call.",
"Place the assert at the top of the method.",
'Key line: `assert self.job_statuses[job_id] == "delivered", "Job must be delivered first"`');

write(27, FE, `## Lesson 27 — Frontend Integration for Jobs

### What You'll Learn
Which methods a frontend should call at each stage. Add a JSON method that maps actions to contract methods.`,
feFinal + `
`,
`Add \`get_frontend_actions_json()\` that returns a JSON object mapping action names to method signatures for create, list, detail, fund, accept, deliver, confirm, and dispute.`,
"Return json.dumps({...}, sort_keys=True) with all action keys.",
"Include at minimum: create, fund, deliver, confirm, dispute.",
'Key line: `"dispute": "review_dispute_with_ai(job_id, reason)"`');

write(28, FE, `## Lesson 28 — Testing TrustLance

### What You'll Learn
Think like a tester before shipping. Add a checklist of test scenarios as a JSON array.`,
feFinal + `
`,
`Add \`get_test_checklist_json()\` returning a JSON array of test steps covering: job creation, funding, accepting, delivering, confirming, and rejecting duplicate payment.`,
"Return json.dumps([...], sort_keys=True) with at least 6 test steps.",
"Cover both happy paths and rejection cases.",
'Key line: `"Reject duplicate payment"`');

write(29, FE, `## Lesson 29 — Capstone Assembly

### What You'll Learn
Assemble the complete TrustLance contract. Verify all required methods are present.`,
feFinal + `
`,
`Review your contract and ensure it includes all required methods: get_platform_name, get_owner, create_job, get_job_json, get_open_jobs_json, fund_job, accept_job, submit_delivery, confirm_delivery, review_dispute_with_ai, get_frontend_actions_json, get_test_checklist_json.`,
"Check each required method is defined in your contract.",
"Each group's capstone method must be present.",
"Key line: `def review_dispute_with_ai(self, job_id: str, reason: str) -> str:`");

write(30, FE, `## Lesson 30 — Final Capstone: Ship TrustLance

### What You'll Learn
Finalize, review, and deploy the complete TrustLance contract. This is the production-ready version.`,
feFinal + `
`,
`Deploy the final contract. Confirm it passes all checks: identity, job creation, job listing, escrow funding, delivery, confirmation, AI dispute review, frontend mapping, and test checklist.`,
"All 30 lessons culminate in this contract — review each section.",
"Make sure the dependency header uses the real hash (not :test).",
"Deploy on Studionet and call get_platform_name() to verify.");

// ─────────────────────────────────────────────────────────────────────────────
//  DAO  (GovMind)
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n── Generating DAO ──────────────────");

const DA = "DAO";
const daoBase = `# { "Depends": "${HASH}" }

import json
from genlayer import *


class GovMind(gl.Contract):
    owner: Address
    dao_name: str
    dao_description: str`;

const daoL5 = daoBase + `

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.dao_name = "GovMind"
        self.dao_description = "An AI-governed decentralised autonomous organisation."

    @gl.public.view
    def get_dao_name(self) -> str:
        return self.dao_name

    @gl.public.view
    def get_dao_description(self) -> str:
        return self.dao_description

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner.as_hex

    @gl.public.view
    def get_contract_summary(self) -> str:
        return self.dao_name + ": " + self.dao_description

    @gl.public.write
    def update_dao_description(self, new_description: str) -> None:
        assert gl.message.sender_address == self.owner, "Only owner can update"
        assert len(new_description) > 0, "Description cannot be empty"
        self.dao_description = new_description`;

const daoL10 = daoL5 + `

    proposal_count: u256
    proposal_titles: TreeMap[str, str]
    proposal_descriptions: TreeMap[str, str]
    proposal_proposers: TreeMap[str, Address]
    proposal_statuses: TreeMap[str, str]
    members: TreeMap[str, bool]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.dao_name = "GovMind"
        self.dao_description = "An AI-governed decentralised autonomous organisation."
        self.proposal_count = u256(0)
        self.members[self.owner.as_hex] = True

    @gl.public.write
    def create_proposal(self, title: str, description: str) -> str:
        assert self.members.get(gl.message.sender_address.as_hex, False), "Only members can propose"
        assert len(title) > 0, "Title cannot be empty"
        assert len(description) > 0, "Description cannot be empty"
        proposal_id = str(self.proposal_count)
        self.proposal_titles[proposal_id] = title
        self.proposal_descriptions[proposal_id] = description
        self.proposal_proposers[proposal_id] = gl.message.sender_address
        self.proposal_statuses[proposal_id] = "open"
        self.proposal_count = self.proposal_count + u256(1)
        return proposal_id`;

const daoL15 = daoL10 + `

    proposal_ids: DynArray[str]

    @gl.public.view
    def get_proposal_json(self, proposal_id: str) -> str:
        assert proposal_id in self.proposal_titles, "Proposal not found"
        return json.dumps({
            "id": proposal_id,
            "title": self.proposal_titles[proposal_id],
            "description": self.proposal_descriptions[proposal_id],
            "proposer": self.proposal_proposers[proposal_id].as_hex,
            "status": self.proposal_statuses[proposal_id],
        }, sort_keys=True)

    @gl.public.view
    def get_open_proposals_json(self) -> str:
        result = []
        for pid in self.proposal_ids:
            if self.proposal_statuses[pid] == "open":
                result.append({"id": pid, "title": self.proposal_titles[pid]})
        return json.dumps(result, sort_keys=True)

    @gl.public.view
    def get_all_proposals_json(self) -> str:
        result = []
        for pid in self.proposal_ids:
            result.append({"id": pid, "title": self.proposal_titles[pid], "status": self.proposal_statuses[pid]})
        return json.dumps(result, sort_keys=True)

    @gl.public.write
    def close_proposal(self, proposal_id: str) -> None:
        assert proposal_id in self.proposal_titles, "Proposal not found"
        assert gl.message.sender_address == self.owner, "Only owner can close"
        assert self.proposal_statuses[proposal_id] == "open", "Only open proposals can be closed"
        self.proposal_statuses[proposal_id] = "closed"`;

const daoL20 = daoL15 + `

    for_votes: TreeMap[str, u256]
    against_votes: TreeMap[str, u256]
    has_voted: TreeMap[str, bool]

    @gl.public.write
    def vote(self, proposal_id: str, support: bool) -> None:
        assert proposal_id in self.proposal_titles, "Proposal not found"
        voter_key = proposal_id + "_" + gl.message.sender_address.as_hex
        assert not self.has_voted.get(voter_key, False), "Already voted"
        assert self.members.get(gl.message.sender_address.as_hex, False), "Only members can vote"
        assert self.proposal_statuses[proposal_id] == "open", "Proposal must be open"
        self.has_voted[voter_key] = True
        if support:
            self.for_votes[proposal_id] = self.for_votes.get(proposal_id, u256(0)) + u256(1)
        else:
            self.against_votes[proposal_id] = self.against_votes.get(proposal_id, u256(0)) + u256(1)

    @gl.public.write
    def execute_proposal(self, proposal_id: str) -> None:
        assert proposal_id in self.proposal_titles, "Proposal not found"
        assert self.proposal_statuses[proposal_id] == "open", "Proposal must be open"
        assert gl.message.sender_address == self.owner, "Only owner can execute"
        fv = self.for_votes.get(proposal_id, u256(0))
        av = self.against_votes.get(proposal_id, u256(0))
        if fv > av:
            self.proposal_statuses[proposal_id] = "passed"
        else:
            self.proposal_statuses[proposal_id] = "rejected"`;

const daoL25 = daoL20 + `

    proposal_ai_summaries: TreeMap[str, str]

    @gl.public.write
    def analyze_proposal_with_ai(self, proposal_id: str) -> str:
        assert proposal_id in self.proposal_titles, "Proposal not found"
        title = self.proposal_titles[proposal_id]
        description = self.proposal_descriptions[proposal_id]
        fv = str(self.for_votes.get(proposal_id, u256(0)))
        av = str(self.against_votes.get(proposal_id, u256(0)))
        prompt = (
            f"DAO Proposal Analysis:\\n"
            f"Title: {title}\\n"
            f"Description: {description}\\n"
            f"For votes: {fv}, Against votes: {av}\\n\\n"
            f"Respond with JSON: {{\\\"summary\\\": \\\"one sentence\\\", "
            f"\\\"risk_score\\\": 0-100, \\\"recommendation\\\": \\\"approve\\\" or \\\"reject\\\"}}"
        )
        def run(prompt):
            result = gl.nondet.exec_prompt(prompt)
            import re
            m = re.search(r'\\{.*\\}', result, re.DOTALL)
            return m.group(0) if m else result
        result = gl.eq_principle_strict_eq(run, prompt)
        self.proposal_ai_summaries[proposal_id] = result
        return result`;

const daoFinal = daoL25 + `

    @gl.public.view
    def get_frontend_actions_json(self) -> str:
        return json.dumps({
            "propose": "create_proposal(title, description)",
            "vote_yes": "vote(proposal_id, True)",
            "vote_no": "vote(proposal_id, False)",
            "list": "get_open_proposals_json()",
            "detail": "get_proposal_json(proposal_id)",
            "analyze": "analyze_proposal_with_ai(proposal_id)",
            "execute": "execute_proposal(proposal_id)",
        }, sort_keys=True)

    @gl.public.view
    def get_test_checklist_json(self) -> str:
        return json.dumps([
            "Create a proposal as a member",
            "Reject proposal from non-member",
            "Vote yes as member",
            "Reject duplicate vote",
            "Vote no as another member",
            "Execute proposal — passes if for > against",
            "Analyze proposal with AI",
            "Reject execution of closed proposal",
        ], sort_keys=True)`;

const daoHeader = `# { "Depends": "${HASH}" }

import json
from genlayer import *`;

write(1, DA, `## Lesson 1 — What You Are Building: AI-Governed DAO

### What You'll Learn
GovMind is a DAO governance contract on GenLayer. Members create proposals, vote, and the AI can summarize and analyze proposals to assist decision-making.

### How It Works
\`\`\`python
class GovMind(gl.Contract):
    project_name: str

    def __init__(self) -> None:
        self.project_name = "GovMind"
\`\`\``,
daoHeader + `


class GovMind(gl.Contract):
    project_name: str

    def __init__(self) -> None:
        self.project_name = "GovMind"

    @gl.public.view
    def get_project_name(self) -> str:
        return self.project_name
`,
`Change the project name to "GovMind: AI-Governed DAO" inside the constructor.`,
"The only change is in __init__ — the self.project_name assignment.",
"Use the full name including the colon and subtitle.",
'Key line: `self.project_name = "GovMind: AI-Governed DAO"`');

write(2, DA, `## Lesson 2 — GovMind Contract Skeleton

### What You'll Learn
Add owner and DAO metadata fields. The owner acts as the admin who can add members and execute proposals.`,
daoHeader + `


class GovMind(gl.Contract):
    owner: Address
    dao_name: str
    dao_description: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.dao_name = "GovMind"
        self.dao_description = "An AI-governed decentralised autonomous organisation."
`,
`Add a persistent \`dao_description: str\` field and initialize it with "An AI-governed decentralised autonomous organisation."`,
"Declare dao_description: str at class level.",
"Initialize it in __init__ after dao_name.",
'Key line: `self.dao_description = "An AI-governed decentralised autonomous organisation."`');

write(3, DA, `## Lesson 3 — DAO Info View

### What You'll Learn
Expose DAO metadata with \`@gl.public.view\` — gas-free reads for the governance UI.`,
daoBase + `

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.dao_name = "GovMind"
        self.dao_description = "An AI-governed decentralised autonomous organisation."

    @gl.public.view
    def get_dao_name(self) -> str:
        return self.dao_name
`,
`Add \`get_dao_description()\` and \`get_owner()\` as \`@gl.public.view\` methods. get_owner() returns \`self.owner.as_hex\`.`,
"Both methods need the @gl.public.view decorator.",
"get_owner should return a string not an Address object.",
"Key line: `return self.owner.as_hex`");

write(4, DA, `## Lesson 4 — Updating DAO Description

### What You'll Learn
Use \`@gl.public.write\` to let the owner update the DAO description. Non-owners get an assertion error.`,
daoBase + `

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.dao_name = "GovMind"
        self.dao_description = "An AI-governed decentralised autonomous organisation."

    @gl.public.view
    def get_dao_name(self) -> str: return self.dao_name

    @gl.public.view
    def get_dao_description(self) -> str: return self.dao_description

    @gl.public.view
    def get_owner(self) -> str: return self.owner.as_hex
`,
`Add \`update_dao_description(self, new_description: str)\` with \`@gl.public.write\`. Validate caller is owner and description is non-empty.`,
"Check sender == self.owner first.",
'Add a second assert: len(new_description) > 0, "Description cannot be empty".',
'Key line: `assert gl.message.sender_address == self.owner, "Only owner can update"`');

write(5, DA, `## Lesson 5 — Major Upgrade: DAO Identity Contract

### What You'll Learn
Combine owner, dao_name, dao_description, view methods, write methods, and a summary getter into a complete identity contract.`,
daoL5 + `
`,
`Add \`get_contract_summary(self) -> str\` that returns \`self.dao_name + ": " + self.dao_description\`.`,
"Concatenate the two fields with ': ' in between.",
"No line break or extra formatting needed.",
'Key line: `return self.dao_name + ": " + self.dao_description`');

write(6, DA, `## Lesson 6 — Member Storage

### What You'll Learn
Add \`members: TreeMap[str, bool]\` to track DAO membership. Only members can create proposals and vote.`,
daoL5 + `

    proposal_count: u256
    members: TreeMap[str, bool]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.dao_name = "GovMind"
        self.dao_description = "An AI-governed decentralised autonomous organisation."
        self.proposal_count = u256(0)
        self.members[self.owner.as_hex] = True
`,
`Automatically add the deployer as the first member in \`__init__\` using \`self.members[self.owner.as_hex] = True\`. Add \`is_member(self, address: str) -> bool\` as a view.`,
"Set self.members[self.owner.as_hex] = True in __init__.",
"Return self.members.get(address, False) in is_member.",
"Key line: `self.members[self.owner.as_hex] = True`");

write(7, DA, `## Lesson 7 — Adding Members

### What You'll Learn
Let the owner add new members with \`add_member(address_hex: str)\`. Members are stored by hex address.`,
daoL5 + `

    proposal_count: u256
    members: TreeMap[str, bool]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.dao_name = "GovMind"
        self.dao_description = "An AI-governed decentralised autonomous organisation."
        self.proposal_count = u256(0)
        self.members[self.owner.as_hex] = True

    @gl.public.view
    def is_member(self, address: str) -> bool:
        return self.members.get(address, False)
`,
`Add \`add_member(self, address_hex: str)\` with \`@gl.public.write\`. Only owner can add. Set \`self.members[address_hex] = True\`.`,
"Check sender == self.owner before adding.",
"Use the passed address_hex string as the key.",
"Key line: `self.members[address_hex] = True`");

write(8, DA, `## Lesson 8 — Voting Power with u256

### What You'll Learn
Track per-member voting power as \`u256\`. Default power is 1; the owner can grant more weight to key members.`,
daoL5 + `

    proposal_count: u256
    members: TreeMap[str, bool]
    voting_power: TreeMap[str, u256]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.dao_name = "GovMind"
        self.dao_description = "An AI-governed decentralised autonomous organisation."
        self.proposal_count = u256(0)
        self.members[self.owner.as_hex] = True
        self.voting_power[self.owner.as_hex] = u256(1)
`,
`Add \`voting_power: TreeMap[str, u256]\` at class level. Give the owner \`u256(1)\` in \`__init__\`. Add \`set_voting_power(self, address_hex: str, power: u256)\` (owner only).`,
"Initialize owner's voting power in __init__.",
"Only owner can call set_voting_power.",
"Key line: `self.voting_power[address_hex] = power`");

write(9, DA, `## Lesson 9 — Proposal Storage with TreeMap

### What You'll Learn
Add all proposal record fields: title, description, proposer address, and status — each as a \`TreeMap[str, T]\`.`,
daoL5 + `

    proposal_count: u256
    proposal_titles: TreeMap[str, str]
    proposal_descriptions: TreeMap[str, str]
    proposal_proposers: TreeMap[str, Address]
    proposal_statuses: TreeMap[str, str]
    members: TreeMap[str, bool]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.dao_name = "GovMind"
        self.dao_description = "An AI-governed decentralised autonomous organisation."
        self.proposal_count = u256(0)
        self.members[self.owner.as_hex] = True
`,
`Add all four proposal fields at class level. Add a stub \`create_proposal(self, title: str, description: str) -> str\` that stores the title, description, proposer, and status (set to "open"), then increments the counter.`,
"Declare 4 TreeMap fields at class level.",
'Set proposal_statuses[proposal_id] = "open" in the creation method.',
'Key line: `self.proposal_statuses[proposal_id] = "open"`');

write(10, DA, `## Lesson 10 — Major Upgrade: Create Proposals

### What You'll Learn
Build the complete \`create_proposal()\` method with member-only access, full validation, and TreeMap record creation.`,
daoL5 + `

    proposal_count: u256
    proposal_titles: TreeMap[str, str]
    proposal_descriptions: TreeMap[str, str]
    proposal_proposers: TreeMap[str, Address]
    proposal_statuses: TreeMap[str, str]
    members: TreeMap[str, bool]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.dao_name = "GovMind"
        self.dao_description = "An AI-governed decentralised autonomous organisation."
        self.proposal_count = u256(0)
        self.members[self.owner.as_hex] = True
`,
`Complete \`create_proposal\` with: member check, non-empty title check, non-empty description check, all field assignments, counter increment, return proposal_id.`,
"Members are stored by address hex — check self.members.get(sender.as_hex, False).",
"Return the proposal_id string after incrementing the counter.",
'Key line: `assert self.members.get(gl.message.sender_address.as_hex, False), "Only members can propose"`');

write(11, DA, `## Lesson 11 — Proposal Indexing

### What You'll Learn
Add \`proposal_ids: DynArray[str]\` to track all proposals in insertion order for frontend enumeration.`,
daoL10 + `

    proposal_ids: DynArray[str]
`,
`Add \`proposal_ids: DynArray[str]\` at class level. In \`create_proposal\`, call \`self.proposal_ids.append(proposal_id)\` after all TreeMap assignments.`,
"Declare proposal_ids: DynArray[str] at class level.",
"Append after writing all TreeMap fields.",
"Key line: `self.proposal_ids.append(proposal_id)`");

write(12, DA, `## Lesson 12 — Proposal JSON View

### What You'll Learn
Build \`get_proposal_json(proposal_id)\` so the frontend can read proposal details as a JSON string.`,
daoL10 + `

    proposal_ids: DynArray[str]
`,
`Add \`get_proposal_json(self, proposal_id: str) -> str\` with \`@gl.public.view\`. Assert proposal exists, return \`json.dumps({...}, sort_keys=True)\` with id, title, description, proposer (as hex), status.`,
"Assert proposal_id in self.proposal_titles first.",
"Use json.dumps and sort_keys=True.",
'Key line: `"proposer": self.proposal_proposers[proposal_id].as_hex`');

write(13, DA, `## Lesson 13 — Listing Open Proposals

### What You'll Learn
Build \`get_open_proposals_json()\` to show only proposals in "open" status.`,
daoL15.split("    @gl.public.view\n    def get_all_proposals_json")[0] + `
`,
`Add \`get_open_proposals_json(self) -> str\` that loops \`proposal_ids\` and includes only those with status "open".`,
'Filter: if self.proposal_statuses[pid] == "open":',
"Return json.dumps(result, sort_keys=True).",
'Key line: if self.proposal_statuses[pid] == "open":');

write(14, DA, `## Lesson 14 — Proposal Status Flow

### What You'll Learn
Model proposal states: open → passed/rejected/closed. Add \`close_proposal()\` for the owner.`,
daoL15.split("    @gl.public.write\n    def close_proposal")[0] + `
`,
`Add \`close_proposal(self, proposal_id: str)\` with \`@gl.public.write\`. Owner only, proposal must be "open".`,
"Check sender == self.owner and status == open.",
'Set status to "closed".',
'Key line: `self.proposal_statuses[proposal_id] = "closed"`');

write(15, DA, `## Lesson 15 — Major Upgrade: Browseable DAO Governance Board

### What You'll Learn
Combine proposal indexing, JSON views, status filtering, and status transitions into a full dashboard contract.`,
daoL15 + `
`,
`Add \`get_all_proposals_json()\` that returns all proposals (any status) with id, title, status.`,
"Loop proposal_ids without any status filter.",
'Include "status" in each entry.',
'Key line: `result.append({"id": pid, "title": ..., "status": ...})`');

write(16, DA, `## Lesson 16 — Voting Method

### What You'll Learn
Add \`vote(proposal_id, support)\` — members cast yes/no votes. Track votes with counters and a "has voted" guard.`,
daoL15 + `

    for_votes: TreeMap[str, u256]
    against_votes: TreeMap[str, u256]
    has_voted: TreeMap[str, bool]
`,
`Add \`vote(self, proposal_id: str, support: bool)\` with \`@gl.public.write\`. Check: proposal exists, member, not already voted, status is open. Increment for_votes or against_votes based on support.`,
"Composite key for has_voted: proposal_id + '_' + sender.as_hex.",
"Increment the appropriate counter based on support bool.",
"Key line: `voter_key = proposal_id + '_' + gl.message.sender_address.as_hex`");

write(17, DA, `## Lesson 17 — Preventing Duplicate Votes

### What You'll Learn
The composite key \`proposal_id + "_" + voter_address\` prevents one address from voting twice on the same proposal.`,
daoL20.split("    @gl.public.write\n    def execute_proposal")[0] + `
`,
`Add an assert at the top of \`vote()\`: \`assert not self.has_voted.get(voter_key, False), "Already voted"\`. Set \`self.has_voted[voter_key] = True\` before incrementing.`,
"Build voter_key first, then check has_voted.",
"Set has_voted[voter_key] = True before updating counts.",
'Key line: `assert not self.has_voted.get(voter_key, False), "Already voted"`');

write(18, DA, `## Lesson 18 — Counting Votes

### What You'll Learn
Track \`for_votes\` and \`against_votes\` per proposal as \`u256\` counters. Add a view to read the tally.`,
daoL20.split("    @gl.public.write\n    def execute_proposal")[0] + `
`,
`Add \`get_vote_tally(self, proposal_id: str) -> str\` as a \`@gl.public.view\` returning a JSON object with \`for_votes\` and \`against_votes\` as strings.`,
"Return json.dumps({'for_votes': str(fv), 'against_votes': str(av)}).",
"Use .get(proposal_id, u256(0)) to handle proposals with no votes yet.",
'Key line: `"for_votes": str(self.for_votes.get(proposal_id, u256(0)))`');

write(19, DA, `## Lesson 19 — Proposal Execution

### What You'll Learn
Add \`execute_proposal()\` — the owner finalizes a proposal as "passed" or "rejected" based on the vote tally.`,
daoL20 + `
`,
`Add \`execute_proposal(self, proposal_id: str)\` with \`@gl.public.write\`. Owner only, proposal must be open. Compare for_votes > against_votes to set status "passed" or "rejected".`,
"Check sender == self.owner and status == open.",
'Use if/else: set "passed" if for > against, else "rejected".',
'Key line: `self.proposal_statuses[proposal_id] = "passed"`');

write(20, DA, `## Lesson 20 — Major Upgrade: Full Governance Voting Flow

### What You'll Learn
Ship the complete propose → vote → execute GovMind governance system.`,
daoL20 + `
`,
`Add \`get_member_count(self) -> str\` as a \`@gl.public.view\`. Since TreeMap doesn't have .len(), keep a \`member_count: u256\` counter and increment it in \`add_member()\`.`,
"Add member_count: u256 at class level, initialize to u256(1) for the owner.",
"Increment on add_member, return str(self.member_count).",
"Key line: `self.member_count = self.member_count + u256(1)`");

write(21, DA, `## Lesson 21 — AI Proposal Summary

### What You'll Learn
AI can summarize a proposal's description and vote tally to help members make informed decisions.`,
daoL20 + `
`,
`Add \`get_proposal_ai_prompt(self, proposal_id: str) -> str\` as a \`@gl.public.view\`. Return a string that includes the proposal title, description, and current vote counts.`,
"Build a multi-line f-string including all relevant proposal data.",
"Include title, description, for_votes, and against_votes.",
"Key line: `return f'Title: {title}\\nDescription: {description}\\nFor: {fv}, Against: {av}'`");

write(22, DA, `## Lesson 22 — Using gl.nondet.exec_prompt for Proposals

### What You'll Learn
Call \`gl.nondet.exec_prompt()\` wrapped in \`gl.eq_principle_strict_eq\` to analyze a proposal with AI.`,
daoL20 + `
`,
`Add \`analyze_proposal_with_ai(self, proposal_id: str) -> str\`. Build the prompt, define an inner \`run(prompt)\` calling \`gl.nondet.exec_prompt(prompt)\`, call \`gl.eq_principle_strict_eq(run, prompt)\`.`,
"Define def run(prompt): inside the method.",
"Call gl.eq_principle_strict_eq(run, prompt) — not exec_prompt directly.",
"Key line: `return gl.eq_principle_strict_eq(run, prompt)`");

write(23, DA, `## Lesson 23 — Comparative Validation for AI Governance

### What You'll Learn
Use regex to extract JSON from the AI response and ensure the output is consistent across validators.`,
daoL25 + `
`,
`Inside \`analyze_proposal_with_ai\`'s inner \`run\` function, use \`import re; m = re.search(r'{.*}', result, re.DOTALL)\` and return \`m.group(0)\` if found.`,
"Import re inside the nested function.",
"Return raw result if no JSON match found.",
"Key line: `m = re.search(r'{.*}', result, re.DOTALL)`");

write(24, DA, `## Lesson 24 — Structured AI Governance Output

### What You'll Learn
Ask the AI for structured JSON: \`{"summary": "...", "risk_score": 0-100, "recommendation": "approve"/"reject"}\`.`,
daoL25 + `
`,
`Update the prompt in \`analyze_proposal_with_ai\` to explicitly request JSON with \`summary\`, \`risk_score\`, and \`recommendation\`. Store the result in \`proposal_ai_summaries[proposal_id]\`.`,
"Include the JSON schema in the prompt string.",
"Add proposal_ai_summaries: TreeMap[str, str] at class level.",
"Key line: `self.proposal_ai_summaries[proposal_id] = result`");

write(25, DA, `## Lesson 25 — Major Upgrade: AI Proposal Analyst

### What You'll Learn
Ship \`analyze_proposal_with_ai()\` — GovMind provides AI-assisted governance review for every proposal.`,
daoL25 + `
`,
`Add \`get_ai_summary(self, proposal_id: str) -> str\` as a \`@gl.public.view\` returning the stored AI summary or "not analyzed yet".`,
"Use self.proposal_ai_summaries.get(proposal_id, 'not analyzed yet').",
"Return the default string if no analysis exists.",
'Key line: `return self.proposal_ai_summaries.get(proposal_id, "not analyzed yet")`');

write(26, DA, `## Lesson 26 — DAO Safety Mistakes

### What You'll Learn
Guard against: non-member proposals, duplicate votes, early execution (no votes yet), and re-execution.`,
daoFinal + `
`,
`Add a guard inside \`execute_proposal\`: assert the proposal has at least one vote before execution. Add message: "No votes cast yet".`,
"Sum for_votes and against_votes and check > u256(0).",
"Place the assert after the status check.",
'Key line: `assert fv + av > u256(0), "No votes cast yet"`');

write(27, DA, `## Lesson 27 — Frontend Integration for Governance

### What You'll Learn
Which methods a governance UI should call. Add a JSON method mapping actions to contract methods.`,
daoFinal + `
`,
`Add \`get_frontend_actions_json()\` mapping: propose, vote_yes, vote_no, list, detail, analyze, execute.`,
"Use json.dumps({...}, sort_keys=True).",
"Include at least 5 action keys.",
'Key line: `"analyze": "analyze_proposal_with_ai(proposal_id)"`');

write(28, DA, `## Lesson 28 — Testing GovMind

### What You'll Learn
Add a test checklist covering: proposal creation, membership checks, voting, duplicate vote rejection, execution.`,
daoFinal + `
`,
`Add \`get_test_checklist_json()\` returning a JSON array of 8 test steps.`,
"Include both happy paths and rejection cases.",
"Cover: member check, vote, duplicate vote rejection, execution.",
'Key line: `"Reject duplicate vote"`');

write(29, DA, `## Lesson 29 — Capstone Assembly

### What You'll Learn
Assemble the complete GovMind contract and verify all required methods are present.`,
daoFinal + `
`,
`Ensure your contract includes: get_dao_name, get_owner, create_proposal, get_proposal_json, get_open_proposals_json, vote, execute_proposal, analyze_proposal_with_ai, get_frontend_actions_json, get_test_checklist_json.`,
"Check each required method is defined.",
"Both vote and execute_proposal must be present for Group 4.",
"Key line: `def analyze_proposal_with_ai(self, proposal_id: str) -> str:`");

write(30, DA, `## Lesson 30 — Final Capstone: Ship GovMind

### What You'll Learn
Finalize and deploy the complete GovMind DAO governance contract.`,
daoFinal + `
`,
`Deploy the final contract. Confirm: identity, proposal creation, indexing, JSON views, voting, vote tallying, execution, AI analysis, and test checklist all work.`,
"All 30 lessons culminate here — review each method group.",
"Make sure the dependency header uses the real hash.",
"Call get_dao_name() after deployment to verify.");

// ─────────────────────────────────────────────────────────────────────────────
//  DEVELOPER_REPUTATION  (CodeVault)
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n── Generating DEVELOPER_REPUTATION ──────────────────");

const DR = "DEVELOPER_REPUTATION";
const cvBase = `# { "Depends": "${HASH}" }

import json
from genlayer import *


class CodeVault(gl.Contract):
    owner: Address
    platform_name: str
    platform_description: str`;

const cvL5 = cvBase + `

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "CodeVault"
        self.platform_description = "A GenLayer private code marketplace."

    @gl.public.view
    def get_platform_name(self) -> str:
        return self.platform_name

    @gl.public.view
    def get_platform_description(self) -> str:
        return self.platform_description

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner.as_hex

    @gl.public.view
    def get_contract_summary(self) -> str:
        return self.platform_name + ": " + self.platform_description

    @gl.public.write
    def update_platform_description(self, new_description: str) -> None:
        assert gl.message.sender_address == self.owner, "Only owner can update"
        assert len(new_description) > 0, "Description cannot be empty"
        self.platform_description = new_description`;

const cvL10 = cvL5 + `

    listing_count: u256
    listing_titles: TreeMap[str, str]
    listing_descriptions: TreeMap[str, str]
    listing_sellers: TreeMap[str, Address]
    listing_prices: TreeMap[str, u256]
    listing_statuses: TreeMap[str, str]
    listing_source_hashes: TreeMap[str, str]
    listing_previews: TreeMap[str, str]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "CodeVault"
        self.platform_description = "A GenLayer private code marketplace."
        self.listing_count = u256(0)

    @gl.public.write
    def create_listing(self, title: str, description: str, price: u256, source_hash: str, preview: str) -> str:
        assert len(title) > 0, "Title cannot be empty"
        assert len(description) > 0, "Description cannot be empty"
        assert price > u256(0), "Price must be greater than zero"
        assert len(source_hash) > 0, "Source hash cannot be empty"
        listing_id = str(self.listing_count)
        self.listing_titles[listing_id] = title
        self.listing_descriptions[listing_id] = description
        self.listing_sellers[listing_id] = gl.message.sender_address
        self.listing_prices[listing_id] = price
        self.listing_statuses[listing_id] = "active"
        self.listing_source_hashes[listing_id] = source_hash
        self.listing_previews[listing_id] = preview
        self.listing_count = self.listing_count + u256(1)
        return listing_id`;

const cvL15 = cvL10 + `

    listing_ids: DynArray[str]

    @gl.public.view
    def get_listing_json(self, listing_id: str) -> str:
        assert listing_id in self.listing_titles, "Listing not found"
        return json.dumps({
            "id": listing_id,
            "title": self.listing_titles[listing_id],
            "description": self.listing_descriptions[listing_id],
            "seller": self.listing_sellers[listing_id].as_hex,
            "price": str(self.listing_prices[listing_id]),
            "status": self.listing_statuses[listing_id],
            "preview": self.listing_previews[listing_id],
        }, sort_keys=True)

    @gl.public.view
    def get_active_listings_json(self) -> str:
        result = []
        for lid in self.listing_ids:
            if self.listing_statuses[lid] == "active":
                result.append({"id": lid, "title": self.listing_titles[lid], "price": str(self.listing_prices[lid])})
        return json.dumps(result, sort_keys=True)

    @gl.public.view
    def get_all_listings_json(self) -> str:
        result = []
        for lid in self.listing_ids:
            result.append({"id": lid, "title": self.listing_titles[lid], "status": self.listing_statuses[lid]})
        return json.dumps(result, sort_keys=True)

    @gl.public.write
    def remove_listing(self, listing_id: str) -> None:
        assert listing_id in self.listing_titles, "Listing not found"
        assert gl.message.sender_address == self.listing_sellers[listing_id] or gl.message.sender_address == self.owner, "Not authorized"
        assert self.listing_statuses[listing_id] == "active", "Only active listings can be removed"
        self.listing_statuses[listing_id] = "removed"`;

const cvL20 = cvL15 + `

    purchase_buyers: TreeMap[str, Address]
    purchase_escrow: TreeMap[str, u256]
    purchase_statuses: TreeMap[str, str]
    seller_claimed: TreeMap[str, bool]

    @gl.public.write.payable
    def buy_listing(self, listing_id: str) -> None:
        assert listing_id in self.listing_titles, "Listing not found"
        assert self.listing_statuses[listing_id] == "active", "Listing must be active"
        seller = self.listing_sellers[listing_id]
        assert gl.message.sender_address != seller, "Seller cannot buy own listing"
        assert gl.message.value >= self.listing_prices[listing_id], "Insufficient payment"
        self.purchase_buyers[listing_id] = gl.message.sender_address
        self.purchase_escrow[listing_id] = gl.message.value
        self.purchase_statuses[listing_id] = "pending"
        self.listing_statuses[listing_id] = "pending"

    @gl.public.write
    def confirm_purchase(self, listing_id: str) -> None:
        assert listing_id in self.listing_titles, "Listing not found"
        assert gl.message.sender_address == self.purchase_buyers[listing_id], "Only buyer can confirm"
        assert self.purchase_statuses[listing_id] == "pending", "Purchase must be pending"
        assert not self.seller_claimed.get(listing_id, False), "Already paid"
        self.seller_claimed[listing_id] = True
        self.purchase_statuses[listing_id] = "completed"
        self.listing_statuses[listing_id] = "sold"
        seller = self.listing_sellers[listing_id]
        seller.transfer(self.purchase_escrow[listing_id])

    @gl.public.view
    def get_source_hash(self, listing_id: str) -> str:
        assert self.purchase_statuses.get(listing_id, "") == "completed", "Purchase must be completed to access source"
        return self.listing_source_hashes[listing_id]`;

const cvL25 = cvL20 + `

    listing_ai_verdicts: TreeMap[str, str]

    @gl.public.write
    def evaluate_listing_with_ai(self, listing_id: str) -> str:
        assert listing_id in self.listing_titles, "Listing not found"
        title = self.listing_titles[listing_id]
        description = self.listing_descriptions[listing_id]
        preview = self.listing_previews[listing_id]
        prompt = (
            f"Code Listing Evaluation:\\n"
            f"Title: {title}\\n"
            f"Description: {description}\\n"
            f"Preview snippet: {preview}\\n\\n"
            f"Respond with JSON: {{\\\"verdict\\\": \\\"approve\\\" or \\\"reject\\\", "
            f"\\\"quality_score\\\": 0-100, \\\"explanation\\\": \\\"reason\\\"}}"
        )
        def run(prompt):
            result = gl.nondet.exec_prompt(prompt)
            import re
            m = re.search(r'\\{.*\\}', result, re.DOTALL)
            return m.group(0) if m else result
        result = gl.eq_principle_strict_eq(run, prompt)
        self.listing_ai_verdicts[listing_id] = result
        return result`;

const cvFinal = cvL25 + `

    @gl.public.view
    def get_frontend_actions_json(self) -> str:
        return json.dumps({
            "create": "create_listing(title, description, price, source_hash, preview)",
            "list": "get_active_listings_json()",
            "detail": "get_listing_json(listing_id)",
            "buy": "buy_listing(listing_id)",
            "confirm": "confirm_purchase(listing_id)",
            "source": "get_source_hash(listing_id)",
            "evaluate": "evaluate_listing_with_ai(listing_id)",
            "remove": "remove_listing(listing_id)",
        }, sort_keys=True)

    @gl.public.view
    def get_test_checklist_json(self) -> str:
        return json.dumps([
            "Create a listing with valid data",
            "Reject listing with zero price",
            "Buy a listing with correct amount",
            "Reject seller buying own listing",
            "Confirm purchase — seller gets paid",
            "Access source hash only after confirmed purchase",
            "Evaluate listing quality with AI",
            "Reject duplicate seller payment",
        ], sort_keys=True)`;

const cvHeader = `# { "Depends": "${HASH}" }

import json
from genlayer import *`;

write(1, DR, `## Lesson 1 — What You Are Building: Private Code Marketplace

### What You'll Learn
CodeVault is a private code marketplace on GenLayer. Developers list code with an off-chain source hash, buyers pay in escrow, and AI evaluates listing quality — all without revealing the source until payment is confirmed.

### How It Works
\`\`\`python
class CodeVault(gl.Contract):
    project_name: str

    def __init__(self) -> None:
        self.project_name = "CodeVault"
\`\`\``,
cvHeader + `


class CodeVault(gl.Contract):
    project_name: str

    def __init__(self) -> None:
        self.project_name = "CodeVault"

    @gl.public.view
    def get_project_name(self) -> str:
        return self.project_name
`,
`Change the project name to "CodeVault: Private Code Marketplace" inside the constructor.`,
"Find the self.project_name assignment in __init__.",
"Use the full name with subtitle.",
'Key line: `self.project_name = "CodeVault: Private Code Marketplace"`');

write(2, DR, `## Lesson 2 — CodeVault Contract Skeleton

### What You'll Learn
Add owner tracking and platform metadata fields for CodeVault.`,
cvHeader + `


class CodeVault(gl.Contract):
    owner: Address
    platform_name: str
    platform_description: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "CodeVault"
        self.platform_description = "A GenLayer private code marketplace."
`,
`Add \`platform_description: str\` and initialize it with "A GenLayer private code marketplace."`,
"Declare platform_description: str at class level.",
"Initialize it in __init__ after platform_name.",
'Key line: `self.platform_description = "A GenLayer private code marketplace."`');

write(3, DR, `## Lesson 3 — Marketplace Info View

### What You'll Learn
Expose marketplace metadata with \`@gl.public.view\` methods for the frontend to consume.`,
cvBase + `

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "CodeVault"
        self.platform_description = "A GenLayer private code marketplace."

    @gl.public.view
    def get_platform_name(self) -> str:
        return self.platform_name
`,
`Add \`get_platform_description()\` and \`get_owner()\` as \`@gl.public.view\` methods. get_owner() returns \`self.owner.as_hex\`.`,
"Both methods need @gl.public.view.",
"get_owner returns self.owner.as_hex.",
"Key line: `return self.owner.as_hex`");

write(4, DR, `## Lesson 4 — Updating Marketplace Settings

### What You'll Learn
Add an owner-only \`update_platform_description()\` method using \`@gl.public.write\`.`,
cvBase + `

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "CodeVault"
        self.platform_description = "A GenLayer private code marketplace."

    @gl.public.view
    def get_platform_name(self) -> str: return self.platform_name

    @gl.public.view
    def get_platform_description(self) -> str: return self.platform_description

    @gl.public.view
    def get_owner(self) -> str: return self.owner.as_hex
`,
`Add \`update_platform_description(self, new_description: str)\` with \`@gl.public.write\`. Validate owner access and non-empty description.`,
"Assert sender == self.owner first.",
"Then assert len(new_description) > 0.",
'Key line: `assert gl.message.sender_address == self.owner, "Only owner can update"`');

write(5, DR, `## Lesson 5 — Major Upgrade: Marketplace Identity Contract

### What You'll Learn
Combine all Group 1 concepts: owner, metadata, views, write, summary.`,
cvL5 + `
`,
`Add \`get_contract_summary(self) -> str\` returning the platform name and description joined with ": ".`,
"Concatenate platform_name and platform_description.",
"No extra formatting needed.",
'Key line: `return self.platform_name + ": " + self.platform_description`');

write(6, DR, `## Lesson 6 — Listing Storage Fields

### What You'll Learn
Add \`listing_count: u256\` — a persistent counter for listing IDs.`,
cvL5 + `

    listing_count: u256

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "CodeVault"
        self.platform_description = "A GenLayer private code marketplace."
        self.listing_count = u256(0)
`,
`Add \`listing_count: u256\` and initialize to \`u256(0)\`. Add \`get_listing_count()\` as a view returning \`str(self.listing_count)\`.`,
"Declare listing_count: u256 at class level.",
"Initialize with u256(0) in __init__.",
"Key line: `return str(self.listing_count)`");

write(7, DR, `## Lesson 7 — Seller Address Tracking

### What You'll Learn
Store the seller's wallet address in a \`TreeMap[str, Address]\` keyed by listing ID.`,
cvL5 + `

    listing_count: u256
    listing_sellers: TreeMap[str, Address]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "CodeVault"
        self.platform_description = "A GenLayer private code marketplace."
        self.listing_count = u256(0)
`,
`Add a stub \`create_listing_stub(self, title: str) -> str\` that stores the caller in \`listing_sellers[str(self.listing_count)]\` and increments.`,
"Use gl.message.sender_address to capture the seller.",
"Increment: self.listing_count = self.listing_count + u256(1).",
"Key line: `self.listing_sellers[listing_id] = gl.message.sender_address`");

write(8, DR, `## Lesson 8 — Listing Price with u256

### What You'll Learn
Store listing price as \`u256\`. All on-chain monetary amounts must use fixed-width integers.`,
cvL5 + `

    listing_count: u256
    listing_sellers: TreeMap[str, Address]
    listing_prices: TreeMap[str, u256]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "CodeVault"
        self.platform_description = "A GenLayer private code marketplace."
        self.listing_count = u256(0)
`,
`Add \`listing_prices: TreeMap[str, u256]\`. Update the stub to also accept \`price: u256\` and store it.`,
"Declare listing_prices: TreeMap[str, u256] at class level.",
"Store price: self.listing_prices[listing_id] = price.",
"Key line: `self.listing_prices[listing_id] = price`");

write(9, DR, `## Lesson 9 — Private Source Metadata

### What You'll Learn
Store source code hash (off-chain reference) and a public preview separately. The hash stays private until purchase is confirmed.`,
cvL5 + `

    listing_count: u256
    listing_titles: TreeMap[str, str]
    listing_descriptions: TreeMap[str, str]
    listing_sellers: TreeMap[str, Address]
    listing_prices: TreeMap[str, u256]
    listing_statuses: TreeMap[str, str]
    listing_source_hashes: TreeMap[str, str]
    listing_previews: TreeMap[str, str]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "CodeVault"
        self.platform_description = "A GenLayer private code marketplace."
        self.listing_count = u256(0)
`,
`Add all 8 listing fields at class level. Update the stub to store title, description, source_hash, preview, and status ("active").`,
"Declare all 8 fields at class level.",
'Set listing_statuses[listing_id] = "active".',
'Key line: `self.listing_source_hashes[listing_id] = source_hash`');

write(10, DR, `## Lesson 10 — Major Upgrade: Create Code Listings

### What You'll Learn
Build the complete \`create_listing()\` method with 4 input validations, all field assignments, counter increment, and return the listing ID.`,
cvL5 + `

    listing_count: u256
    listing_titles: TreeMap[str, str]
    listing_descriptions: TreeMap[str, str]
    listing_sellers: TreeMap[str, Address]
    listing_prices: TreeMap[str, u256]
    listing_statuses: TreeMap[str, str]
    listing_source_hashes: TreeMap[str, str]
    listing_previews: TreeMap[str, str]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "CodeVault"
        self.platform_description = "A GenLayer private code marketplace."
        self.listing_count = u256(0)
`,
`Complete \`create_listing(self, title, description, price, source_hash, preview)\` with validations for: non-empty title, non-empty description, price > 0, non-empty source_hash.`,
"Add 4 assert statements before writing any state.",
"Return the listing_id string after incrementing.",
'Key line: `assert len(source_hash) > 0, "Source hash cannot be empty"`');

write(11, DR, `## Lesson 11 — Listing Indexing with DynArray

### What You'll Learn
Add \`listing_ids: DynArray[str]\` for ordered enumeration of all listings.`,
cvL10 + `

    listing_ids: DynArray[str]
`,
`Add \`listing_ids: DynArray[str]\` and in \`create_listing\` call \`self.listing_ids.append(listing_id)\` after all field assignments.`,
"Declare listing_ids: DynArray[str] at class level.",
"Append after all TreeMap writes.",
"Key line: `self.listing_ids.append(listing_id)`");

write(12, DR, `## Lesson 12 — Listing JSON View

### What You'll Learn
Build \`get_listing_json()\` returning safe public listing data — no source hash revealed.`,
cvL10 + `

    listing_ids: DynArray[str]
`,
`Add \`get_listing_json(self, listing_id: str) -> str\` returning a JSON object with: id, title, description, seller (hex), price (str), status, preview. Do NOT include source_hash.`,
"Include preview in the public JSON — it's the safe teaser.",
"Never include source_hash in this view.",
'Key line: `"preview": self.listing_previews[listing_id]`');

write(13, DR, `## Lesson 13 — Active Listings View

### What You'll Learn
Build \`get_active_listings_json()\` filtering by status "active" using a DynArray loop.`,
cvL15.split("    @gl.public.view\n    def get_all_listings_json")[0] + `
`,
`Add \`get_active_listings_json(self) -> str\` looping \`listing_ids\` and filtering for status "active". Include id, title, price.`,
'Filter: if self.listing_statuses[lid] == "active":',
'Include "price": str(self.listing_prices[lid]).',
'Key line: `if self.listing_statuses[lid] == "active":`');

write(14, DR, `## Lesson 14 — Listing Status Flow

### What You'll Learn
Model listing states: active → pending → sold/removed. Add \`remove_listing()\`.`,
cvL15.split("    @gl.public.write\n    def remove_listing")[0] + `
`,
`Add \`remove_listing(self, listing_id: str)\` — seller or owner can remove, only if "active". Set status to "removed".`,
"Check sender is seller OR owner.",
'Status must be "active" to remove.',
'Key line: `self.listing_statuses[listing_id] = "removed"`');

write(15, DR, `## Lesson 15 — Major Upgrade: Browseable Code Marketplace

### What You'll Learn
Combine listing indexing, JSON views, status filtering into a full marketplace dashboard.`,
cvL15 + `
`,
`Add \`get_all_listings_json()\` returning all listings (any status) with id, title, status.`,
"Loop listing_ids without any filter.",
'Include "status" in each entry.',
'Key line: `result.append({"id": lid, "title": ..., "status": ...})`');

write(16, DR, `## Lesson 16 — Buying a Listing

### What You'll Learn
Add \`buy_listing()\` with \`@gl.public.write.payable\` to lock GEN in escrow when a buyer purchases a listing.`,
cvL15 + `

    purchase_buyers: TreeMap[str, Address]
    purchase_escrow: TreeMap[str, u256]
    purchase_statuses: TreeMap[str, str]
`,
`Add \`buy_listing(self, listing_id: str)\` with \`@gl.public.write.payable\`. Validate: listing exists, active, buyer != seller, value >= price. Store buyer and escrow, set statuses to "pending".`,
"Use @gl.public.write.payable and check gl.message.value.",
"Store buyer address and escrow amount in TreeMaps.",
'Key line: `assert gl.message.sender_address != seller, "Seller cannot buy own listing"`');

write(17, DR, `## Lesson 17 — Buyer and Seller Rules

### What You'll Learn
Enforce role-based access: only the buyer can confirm, and sellers cannot buy their own listings.`,
cvL20.split("    @gl.public.write\n    def confirm_purchase")[0] + `
`,
`Add \`confirm_purchase(self, listing_id: str)\` that only the original buyer can call, marks seller as claimed, pays the seller, and sets statuses to completed/sold.`,
"Assert sender == purchase_buyers[listing_id].",
"Check seller_claimed[listing_id] is False before paying.",
"Key line: `seller.transfer(self.purchase_escrow[listing_id])`");

write(18, DR, `## Lesson 18 — Escrow Storage

### What You'll Learn
Add \`seller_claimed: TreeMap[str, bool]\` to prevent double-payment when a buyer confirms delivery.`,
cvL20 + `
`,
`Add \`get_purchase_status(self, listing_id: str) -> str\` as a \`@gl.public.view\` returning the purchase status or "not purchased" if none.`,
"Return self.purchase_statuses.get(listing_id, 'not purchased').",
"Use .get() with a default to handle unlisted IDs.",
'Key line: `return self.purchase_statuses.get(listing_id, "not purchased")`');

write(19, DR, `## Lesson 19 — Confirm and Refund Purchase

### What You'll Learn
Add refund logic: if a buyer requests a refund before confirming, escrowed funds return to them.`,
cvL20 + `
`,
`Add \`refund_purchase(self, listing_id: str)\` — buyer only, purchase must be pending, not already claimed. Transfer escrow back to sender and set status to "refunded".`,
"Check sender == purchase_buyers[listing_id].",
"Check purchase_statuses == pending.",
"Key line: `gl.message.sender_address.transfer(self.purchase_escrow[listing_id])`");

write(20, DR, `## Lesson 20 — Major Upgrade: Full Code Purchase Escrow

### What You'll Learn
Ship the complete buy → confirm/refund CodeVault escrow system. Source is only revealed after confirmed purchase.`,
cvL20 + `
`,
`Add \`get_source_hash(self, listing_id: str) -> str\` as a \`@gl.public.view\`. Assert purchase is "completed" before returning the hash.`,
'Assert self.purchase_statuses.get(listing_id, "") == "completed".',
"Only reveal source_hash after confirmed purchase.",
'Key line: `assert self.purchase_statuses.get(listing_id, "") == "completed", "Purchase must be completed to access source"`');

write(21, DR, `## Lesson 21 — AI Code Preview Review

### What You'll Learn
AI can evaluate a listing's public preview and description to suggest whether it's quality code worth purchasing.`,
cvL20 + `
`,
`Add \`get_listing_ai_prompt(self, listing_id: str) -> str\` as a \`@gl.public.view\`. Build a prompt with the listing title, description, and preview.`,
"Build an f-string combining title, description, and preview.",
"Include clear instructions for what the AI should assess.",
"Key line: `return f'Title: {title}\\nDescription: {description}\\nPreview: {preview}'`");

write(22, DR, `## Lesson 22 — Using gl.nondet.exec_prompt for Code Review

### What You'll Learn
Call \`gl.nondet.exec_prompt()\` wrapped in \`gl.eq_principle_strict_eq\` to evaluate a listing.`,
cvL20 + `
`,
`Add \`evaluate_listing_with_ai(self, listing_id: str) -> str\`. Build the prompt, define inner \`run(prompt)\`, call \`gl.eq_principle_strict_eq(run, prompt)\`.`,
"Define a nested def run(prompt): inside the method.",
"Call gl.eq_principle_strict_eq(run, prompt).",
"Key line: `return gl.eq_principle_strict_eq(run, prompt)`");

write(23, DR, `## Lesson 23 — Comparative AI Validation

### What You'll Learn
Extract JSON from AI response using regex for consistent output across validators.`,
cvL25 + `
`,
`Inside \`evaluate_listing_with_ai\`'s \`run\` function, add \`import re\` and extract the JSON object from the AI response.`,
"Use re.search(r'{.*}', result, re.DOTALL).",
"Return m.group(0) if found, else raw result.",
"Key line: `m = re.search(r'{.*}', result, re.DOTALL)`");

write(24, DR, `## Lesson 24 — Structured AI Listing Verdict

### What You'll Learn
Request structured JSON from AI: \`{"verdict": "approve"/"reject", "quality_score": 0-100, "explanation": "..."}\`.`,
cvL25 + `
`,
`Update the AI prompt to explicitly request JSON with \`verdict\`, \`quality_score\`, \`explanation\`. Store the result in \`listing_ai_verdicts[listing_id]\`.`,
"Include the JSON schema in the prompt.",
"Add listing_ai_verdicts: TreeMap[str, str] at class level.",
"Key line: `self.listing_ai_verdicts[listing_id] = result`");

write(25, DR, `## Lesson 25 — Major Upgrade: AI Listing Judge

### What You'll Learn
Ship \`evaluate_listing_with_ai()\` — CodeVault can intelligently assess listing quality.`,
cvL25 + `
`,
`Add \`get_ai_verdict(self, listing_id: str) -> str\` as a \`@gl.public.view\` returning the stored verdict or "not evaluated yet".`,
"Use self.listing_ai_verdicts.get(listing_id, 'not evaluated yet').",
"Handle the case where no evaluation exists.",
'Key line: `return self.listing_ai_verdicts.get(listing_id, "not evaluated yet")`');

write(26, DR, `## Lesson 26 — Source Reveal Security

### What You'll Learn
Guard against: revealing source before purchase confirmation, early fund release, and seller self-purchase.`,
cvFinal + `
`,
`Add a guard in \`buy_listing\`: assert the listing hasn't already been purchased (status must be "active"). Add message: "Listing is no longer available".`,
'Assert listing_statuses[listing_id] == "active" before processing payment.',
"This prevents double-purchasing.",
'Key line: `assert self.listing_statuses[listing_id] == "active", "Listing is no longer available"`');

write(27, DR, `## Lesson 27 — Frontend Integration for Marketplace

### What You'll Learn
Map all CodeVault actions to contract methods for frontend integration.`,
cvFinal + `
`,
`Add \`get_frontend_actions_json()\` mapping: create, list, detail, buy, confirm, source, evaluate, remove.`,
"Use json.dumps({...}, sort_keys=True).",
"Include at least 6 action keys.",
'Key line: `"source": "get_source_hash(listing_id)"`');

write(28, DR, `## Lesson 28 — Testing CodeVault

### What You'll Learn
Add a test checklist covering the full marketplace flow.`,
cvFinal + `
`,
`Add \`get_test_checklist_json()\` returning a JSON array of 8 test steps.`,
"Cover creation, purchasing, confirmation, refund, AI evaluation.",
"Include rejection cases like seller self-purchase.",
'Key line: `"Access source hash only after confirmed purchase"`');

write(29, DR, `## Lesson 29 — Capstone Assembly

### What You'll Learn
Assemble the complete CodeVault contract and verify all required methods.`,
cvFinal + `
`,
`Ensure your contract includes: get_platform_name, get_owner, create_listing, get_listing_json, get_active_listings_json, buy_listing, confirm_purchase, get_source_hash, evaluate_listing_with_ai, get_frontend_actions_json, get_test_checklist_json.`,
"Check each required method is defined.",
"get_source_hash is the key privacy gate — verify it requires completed purchase.",
"Key line: `def evaluate_listing_with_ai(self, listing_id: str) -> str:`");

write(30, DR, `## Lesson 30 — Final Capstone: Ship CodeVault

### What You'll Learn
Finalize and deploy the complete CodeVault private code marketplace.`,
cvFinal + `
`,
`Deploy the final contract. Confirm: identity, listing creation, indexing, JSON views, escrow purchase, source reveal gate, AI evaluation, and test checklist all work.`,
"All 30 lessons culminate here — review each method group.",
"Make sure the dependency header uses the real hash.",
"Call get_platform_name() after deployment to verify.");

console.log("\n✅ All 90 files generated (FREELANCE_ESCROW, DAO, DEVELOPER_REPUTATION).");
