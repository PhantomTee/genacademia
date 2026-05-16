import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 30,
  projectPath: "INSURANCE",
  explanation: `## Lesson 30 — Final Capstone: Ship CaseWise

### What You'll Learn

Students finalize the AI-assisted dispute resolution contract.

They should be able to explain:

how cases are submitted
how parties are tracked
how review fees work
how evidence references are stored
how AI review works
why AI review does not automatically close the case
how manual rulings work
how appeals work
how frontend reads case state`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from genlayer import *


class CaseWise(gl.Contract):
    owner: Address
    court_name: str
    court_rules: str

    case_titles: TreeMap[str, str]
    case_claims: TreeMap[str, str]
    case_claimants: TreeMap[str, Address]
    case_respondents: TreeMap[str, Address]
    case_fees: TreeMap[str, u256]
    case_statuses: TreeMap[str, str]
    case_ids: DynArray[str]
    case_count: u256

    case_paid_amounts: TreeMap[str, u256]
    case_claimant_evidence: TreeMap[str, str]
    case_respondent_evidence: TreeMap[str, str]

    case_rulings: TreeMap[str, str]
    case_ruling_reasons: TreeMap[str, str]

    case_ai_rulings: TreeMap[str, str]
    case_ai_confidences: TreeMap[str, str]
    case_ai_reasons: TreeMap[str, str]

    case_appeal_reasons: TreeMap[str, str]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.court_name = "CaseWise"
        self.court_rules = "Parties submit cases and evidence for AI-assisted review."
        self.case_count = u256(0)

    @gl.public.view
    def get_court_name(self) -> str:
        return self.court_name

    @gl.public.view
    def get_court_rules(self) -> str:
        return self.court_rules

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner.as_hex

    @gl.public.view
    def get_contract_summary(self) -> str:
        return self.court_name + ": " + self.court_rules

    @gl.public.write
    def update_court_rules(self, new_rules: str) -> None:
        assert gl.message.sender_address == self.owner, "Only owner can update rules"
        assert len(new_rules) > 0, "Rules cannot be empty"

        self.court_rules = new_rules

    @gl.public.write
    def submit_case(self, title: str, claim: str, respondent: Address, case_fee: u256) -> str:
        claimant = gl.message.sender_address

        assert len(title) > 0, "Title cannot be empty"
        assert len(claim) > 0, "Claim cannot be empty"
        assert claimant != respondent, "Claimant and respondent must be different"
        assert case_fee > u256(0), "Case fee must be greater than zero"

        case_id = str(self.case_count)

        self.case_titles[case_id] = title
        self.case_claims[case_id] = claim
        self.case_claimants[case_id] = claimant
        self.case_respondents[case_id] = respondent
        self.case_fees[case_id] = case_fee
        self.case_statuses[case_id] = "submitted"

        self.case_ids.append(case_id)
        self.case_count += u256(1)

        return case_id

    @gl.public.view
    def get_case_json(self, case_id: str) -> str:
        assert case_id in self.case_titles, "Case not found"

        return json.dumps({
            "id": case_id,
            "title": self.case_titles[case_id],
            "claim": self.case_claims[case_id],
            "claimant": self.case_claimants[case_id].as_hex,
            "respondent": self.case_respondents[case_id].as_hex,
            "case_fee": str(self.case_fees[case_id]),
            "paid_amount": str(self.case_paid_amounts[case_id]) if case_id in self.case_paid_amounts else "0",
            "claimant_evidence": self.case_claimant_evidence[case_id] if case_id in self.case_claimant_evidence else "",
            "respondent_evidence": self.case_respondent_evidence[case_id] if case_id in self.case_respondent_evidence else "",
            "ruling": self.case_rulings[case_id] if case_id in self.case_rulings else "",
            "ruling_reason": self.case_ruling_reasons[case_id] if case_id in self.case_ruling_reasons else "",
            "ai_ruling": self.case_ai_rulings[case_id] if case_id in self.case_ai_rulings else "",
            "ai_confidence": self.case_ai_confidences[case_id] if case_id in self.case_ai_confidences else "",
            "ai_reason": self.case_ai_reasons[case_id] if case_id in self.case_ai_reasons else "",
            "has_ai_review": case_id in self.case_ai_rulings,
            "appeal_reason": self.case_appeal_reasons[case_id] if case_id in self.case_appeal_reasons else "",
            "status": self.case_statuses[case_id],
        }, sort_keys=True)

    @gl.public.view
    def get_open_cases_json(self) -> str:
        result = []

        for case_id in self.case_ids:
            status = self.case_statuses[case_id]

            if status != "closed" and status != "cancelled":
                result.append({
                    "id": case_id,
                    "title": self.case_titles[case_id],
                    "claim": self.case_claims[case_id],
                    "claimant": self.case_claimants[case_id].as_hex,
                    "respondent": self.case_respondents[case_id].as_hex,
                    "case_fee": str(self.case_fees[case_id]),
                    "status": status,
                })

        return json.dumps(result, sort_keys=True)

    @gl.public.view
    def get_all_cases_json(self) -> str:
        result = []

        for case_id in self.case_ids:
            result.append({
                "id": case_id,
                "title": self.case_titles[case_id],
                "claim": self.case_claims[case_id],
                "claimant": self.case_claimants[case_id].as_hex,
                "respondent": self.case_respondents[case_id].as_hex,
                "case_fee": str(self.case_fees[case_id]),
                "status": self.case_statuses[case_id],
            })

        return json.dumps(result, sort_keys=True)

    @gl.public.write
    def cancel_case(self, case_id: str) -> None:
        assert case_id in self.case_titles, "Case not found"

        caller = gl.message.sender_address
        claimant = self.case_claimants[case_id]

        assert caller == claimant, "Only claimant can cancel case"
        assert self.case_statuses[case_id] == "submitted", "Only submitted cases can be cancelled"

        self.case_statuses[case_id] = "cancelled"

    @gl.public.write.payable
    def pay_case_fee(self, case_id: str) -> None:
        assert case_id in self.case_titles, "Case not found"

        caller = gl.message.sender_address
        claimant = self.case_claimants[case_id]

        assert caller == claimant, "Only claimant can pay case fee"
        assert self.case_statuses[case_id] == "submitted", "Only submitted cases can be paid"
        assert gl.message.value >= self.case_fees[case_id], "Payment is below case fee"

        self.case_paid_amounts[case_id] = gl.message.value
        self.case_statuses[case_id] = "reviewing"

    @gl.public.write
    def add_evidence(self, case_id: str, evidence_ref: str) -> None:
        assert case_id in self.case_titles, "Case not found"
        assert len(evidence_ref) > 0, "Evidence reference cannot be empty"
        assert self.case_statuses[case_id] == "reviewing", "Case must be reviewing to add evidence"

        caller = gl.message.sender_address
        claimant = self.case_claimants[case_id]
        respondent = self.case_respondents[case_id]

        assert caller == claimant or caller == respondent, "Only case parties can add evidence"

        if caller == claimant:
            self.case_claimant_evidence[case_id] = evidence_ref
        else:
            self.case_respondent_evidence[case_id] = evidence_ref

    @gl.public.write
    def rule_case_manually(self, case_id: str, ruling: str, reason: str) -> None:
        assert case_id in self.case_titles, "Case not found"
        assert gl.message.sender_address == self.owner, "Only owner can rule cases"
        assert self.case_statuses[case_id] == "reviewing", "Case must be reviewing before ruling"
        assert (
            ruling == "CLAIMANT_WINS"
            or ruling == "RESPONDENT_WINS"
            or ruling == "SPLIT"
        ), "Invalid ruling"
        assert len(reason) > 0, "Ruling reason cannot be empty"

        self.case_rulings[case_id] = ruling
        self.case_ruling_reasons[case_id] = reason
        self.case_statuses[case_id] = "ruled"

    @gl.public.view
    def get_case_review_prompt(self, case_id: str) -> str:
        assert case_id in self.case_titles, "Case not found"

        return (
            "Review this dispute case. "
            + "Title: "
            + self.case_titles[case_id]
            + ". Claim: "
            + self.case_claims[case_id]
            + ". Claimant evidence: "
            + (self.case_claimant_evidence[case_id] if case_id in self.case_claimant_evidence else "")
            + ". Respondent evidence: "
            + (self.case_respondent_evidence[case_id] if case_id in self.case_respondent_evidence else "")
            + ". Recommend a ruling and explain why."
        )

    @gl.public.write
    def review_case_with_ai(self, case_id: str) -> str:
        assert case_id in self.case_titles, "Case not found"
        assert self.case_statuses[case_id] == "reviewing", "Case must be reviewing before AI review"
        assert case_id not in self.case_ai_rulings, "Case already reviewed by AI"

        prompt = (
            "You are reviewing a dispute case. "
            + "Title: "
            + self.case_titles[case_id]
            + ". Claim: "
            + self.case_claims[case_id]
            + ". Claimant evidence: "
            + (self.case_claimant_evidence[case_id] if case_id in self.case_claimant_evidence else "")
            + ". Respondent evidence: "
            + (self.case_respondent_evidence[case_id] if case_id in self.case_respondent_evidence else "")
            + ". Return exactly one line in this format: "
            + "CLAIMANT_WINS|LOW|reason, CLAIMANT_WINS|MEDIUM|reason, CLAIMANT_WINS|HIGH|reason, "
            + "RESPONDENT_WINS|LOW|reason, RESPONDENT_WINS|MEDIUM|reason, RESPONDENT_WINS|HIGH|reason, "
            + "SPLIT|LOW|reason, SPLIT|MEDIUM|reason, SPLIT|HIGH|reason, "
            + "or NEEDS_MORE_INFO|LOW|reason, NEEDS_MORE_INFO|MEDIUM|reason, NEEDS_MORE_INFO|HIGH|reason."
        )

        def run():
            return gl.nondet.exec_prompt(prompt)

        def validate_result(leader_result) -> bool:
            return isinstance(leader_result, gl.vm.Return) and len(str(leader_result.calldata).strip()) > 0

        result = gl.vm.run_nondet_unsafe(run, validate_result).strip()
        parts = result.split("|")

        assert len(parts) == 3, "AI result must contain ruling, confidence, and reason"

        ruling = parts[0]
        confidence = parts[1]
        reason = parts[2]

        assert (
            ruling == "CLAIMANT_WINS"
            or ruling == "RESPONDENT_WINS"
            or ruling == "SPLIT"
            or ruling == "NEEDS_MORE_INFO"
        ), "Invalid AI ruling"

        assert confidence == "LOW" or confidence == "MEDIUM" or confidence == "HIGH", "Invalid AI confidence"
        assert len(reason) > 0, "AI reason cannot be empty"

        self.case_ai_rulings[case_id] = ruling
        self.case_ai_confidences[case_id] = confidence
        self.case_ai_reasons[case_id] = reason

        return ruling

    @gl.public.view
    def get_dispute_rules_json(self) -> str:
        return json.dumps([
            "Only the claimant can pay the case fee",
            "Only case parties can add evidence",
            "Cases must be reviewing before AI review",
            "AI review does not automatically close the case",
            "Only the owner/arbitrator can finalize a ruling",
            "Appeals can only happen after a ruling"
        ], sort_keys=True)

    @gl.public.write
    def appeal_case(self, case_id: str, appeal_reason: str) -> None:
        assert case_id in self.case_titles, "Case not found"
        assert self.case_statuses[case_id] == "ruled", "Only ruled cases can be appealed"
        assert len(appeal_reason) > 0, "Appeal reason cannot be empty"

        caller = gl.message.sender_address
        claimant = self.case_claimants[case_id]
        respondent = self.case_respondents[case_id]

        assert caller == claimant or caller == respondent, "Only case parties can appeal"

        self.case_appeal_reasons[case_id] = appeal_reason
        self.case_statuses[case_id] = "appealed"

    @gl.public.view
    def get_test_checklist_json(self) -> str:
        return json.dumps([
            "Submit a case with title, claim, respondent, and fee",
            "Reject a case with an empty claim",
            "Reject a case where claimant and respondent are the same",
            "Pay the case fee as claimant",
            "Reject fee payment from non-claimant",
            "Add claimant evidence",
            "Add respondent evidence",
            "Reject evidence from a non-party",
            "Run AI case review",
            "Verify AI ruling, confidence, and reason are stored",
            "Manually rule the case as owner",
            "Appeal the ruled case as a party",
            "Reject appeal from non-party"
        ], sort_keys=True)
Final expected platform verification
{
  capstone: "CaseWise",
  lesson: 30,
  finalCapstone: true,
  requiredClass: "CaseWise",
  requiredImports: ["import json", "from genlayer import *"],
  requiredDecorators: [
    "@gl.public.view",
    "@gl.public.write",
    "@gl.public.write.payable"
  ],
  requiredMethods: [
    "get_court_name",
    "get_court_rules",
    "get_owner",
    "get_contract_summary",
    "update_court_rules",
    "submit_case",
    "get_case_json",
    "get_open_cases_json",
    "get_all_cases_json",
    "cancel_case",
    "pay_case_fee",
    "add_evidence",
    "rule_case_manually",
    "get_case_review_prompt",
    "review_case_with_ai",
    "get_dispute_rules_json",
    "appeal_case",
    "get_test_checklist_json"
  ],
  requiredState: [
    "owner: Address",
    "court_name: str",
    "court_rules: str",
    "case_titles: TreeMap[str, str]",
    "case_claims: TreeMap[str, str]",
    "case_claimants: TreeMap[str, Address]",
    "case_respondents: TreeMap[str, Address]",
    "case_fees: TreeMap[str, u256]",
    "case_statuses: TreeMap[str, str]",
    "case_ids: DynArray[str]",
    "case_count: u256",
    "case_paid_amounts: TreeMap[str, u256]",
    "case_claimant_evidence: TreeMap[str, str]",
    "case_respondent_evidence: TreeMap[str, str]",
    "case_rulings: TreeMap[str, str]",
    "case_ruling_reasons: TreeMap[str, str]",
    "case_ai_rulings: TreeMap[str, str]",
    "case_ai_confidences: TreeMap[str, str]",
    "case_ai_reasons: TreeMap[str, str]",
    "case_appeal_reasons: TreeMap[str, str]"
  ],
  requiredStrings: [
    "gl.message.sender_address",
    "gl.message.value",
    "json.dumps",
    "gl.nondet.exec_prompt",
    "Only case parties can add evidence",
    "AI review does not automatically close the case",
    "Only owner can rule cases",
    "Only ruled cases can be appealed",
    "Case already reviewed by AI"
  ],
  expectedFlow: [
    "submit_case returns 0",
    "get_case_json('0') includes status submitted",
    "pay_case_fee changes status to reviewing",
    "add_evidence stores claimant or respondent evidence",
    "review_case_with_ai stores ruling, confidence, and reason",
    "rule_case_manually changes status to ruled",
    "appeal_case changes status to appealed"
  ]
}
That completes all 5 tracks:

1. PredictX — AI-Resolved Prediction Market
2. TrustLance — Freelance Escrow Platform
3. GovMind — AI-Governed DAO
4. CodeVault — Private Code Marketplace
5. CaseWise — AI-Assisted Dispute Resolution System

So how does the platform determine that you have fone the right thing, for every lesson, then i think i need a page, that lists out all the functions in the documentation, then a quick snippet code, so the page bame will be glossary, with a  little explanation on how to use that code

Thought for 35s
Yes, you need two things:

A lesson verification system that checks whether the student did the right thing.

A Glossary page that lists GenLayer functions/concepts with quick snippets, so students can quickly copy patterns while learning.

GenLayer contracts are Python classes that extend gl.Contract, and public methods use decorators like @gl.public.view, @gl.public.write, and @gl.public.write.payable. The docs also show typed state variables, constructor logic, and the difference between read and write methods. 

How the platform should verify each lesson
For now, your platform should not rely only on GenLayer localhost RPC, because many users will use the cloud version and it cannot reach their local localhost:61999.

So use 3 levels of checking:

Level 1: Static code checks
Level 2: Simulated expected behavior checks
Level 3: Optional local GenLayer RPC checks
Level 1: Static code checks
This checks the student's code text.

Example things to check:

Does the code contain the required class?
Does it include the required import?
Does it declare the required state variables?
Does it include the required method?
Does it use the correct decorator?
Does it include the correct assertion?
Does it avoid forbidden bad patterns?
Example verification spec:

{
  lessonId: 16,
  path: "CodeVault",
  requiredClass: "CodeVault",
  requiredImports: ["from genlayer import *"],
  requiredDecorators: ["@gl.public.write.payable"],
  requiredMethods: ["buy"],
  requiredState: [
    "escrow_buyers: TreeMap[str, Address]",
    "escrow_amounts: TreeMap[str, u256]",
    "escrow_statuses: TreeMap[str, str]"
  ],
  requiredStrings: [
    "gl.message.value",
    "escrow_id = listing_id",
    "Seller cannot buy own listing",
    "self.escrow_statuses[escrow_id] = \\"locked\\""
  ],
  forbiddenStrings: [
    "escrow_id = listing_id + \\"_\\"",
    "gl.transfer"
  ]
}
This is the first and easiest check.

Level 2: Simulated expected behavior checks
This does not actually deploy to GenLayer. It checks whether the code contains the expected logic for a behavior.

Example:

Lesson: buy listing
Expected behavior:
- buy("0") returns "0"
- listing status becomes "pending"
- escrow status becomes "locked"
The platform can check this by looking for code patterns like:

expectedBehavior: [
  {
    label: "Escrow ID equals listing ID",
    mustContain: "escrow_id = listing_id"
  },
  {
    label: "Listing becomes pending after buy",
    mustContain: "self.listing_statuses[listing_id] = \\"pending\\""
  },
  {
    label: "Escrow becomes locked after buy",
    mustContain: "self.escrow_statuses[escrow_id] = \\"locked\\""
  }
]
This is not perfect, but it is good enough for beginner lessons.

Level 3: Optional local RPC verification
This checks the code against a real local GenLayer node/studio when the app is running locally.

Flow:

1. Static checks run first
2. If static checks fail, show what is missing
3. If static checks pass, try local RPC
4. If localhost is unreachable, show a friendly message
Message:

Static checks passed. Local GenLayer Studio was not reachable. Run this app locally beside the GenLayer CLI to complete live verification.
Do not show raw network errors.

Writing to GenLayer contracts modifies state and must be processed by the network, so the platform should treat write checks differently from simple read checks. 

Tell Claude this for verification
Add a real lesson verification system to GenAcademia.

Current issue:
The lesson verification is too simple. It should not just check check() == "Success".

Implement a structured verification system with three layers:

1. Static code checks
2. Simulated behavior checks
3. Optional local GenLayer RPC checks

Static verification should support:
- requiredClass
- requiredImports
- requiredDecorators
- requiredMethods
- requiredState
- requiredStrings
- forbiddenStrings
- expectedJsonKeys
- expectedStatusTransitions
- expectedBehavior
- majorUpgrade flag

For every lesson, verification should inspect the Monaco editor code and return:
- passed: boolean
- score: number
- missing: string[]
- warnings: string[]
- suggestions: string[]
- nextStep: string

Example output:
{
  passed: false,
  score: 72,
  missing: [
    "Missing @gl.public.write.payable decorator",
    "Missing gl.message.value",
    "Missing escrow_statuses TreeMap"
  ],
  warnings: [
    "Do not unlock source when escrow is locked"
  ],
  suggestions: [
    "Add escrow_statuses: TreeMap[str, str]",
    "Set self.escrow_statuses[escrow_id] = \\"locked\\" inside buy()"
  ],
  nextStep: "Fix the missing escrow fields and run verification again."
}

Static checks:
- Normalize whitespace before checking.
- Allow small formatting differences.
- Do not require exact full-code matching.
- Check concepts and required logic patterns instead of exact line numbers.
- Support forbidden patterns like gl.transfer or allowing locked escrow to unlock source.

Simulated behavior checks:
Add a system where a lesson can define expected behavior as text/pattern rules:
- create_listing returns 0
- buy returns escrow id equal to listing id
- status becomes pending
- escrow becomes locked
- confirm changes escrow to released
- vote requires released escrow

This can still be pattern-based for now.

Local RPC verification:
Keep optional local GenLayer verification using http://localhost:61999.
Do not make it mandatory in cloud preview.
If localhost is unreachable, show:
"Static checks passed. Local GenLayer Studio was not reachable. Run this app locally beside the GenLayer CLI to complete live verification."

Update the Verify button:
- Run static verification first
- Show missing items clearly
- Show warning items separately
- If static passes, optionally try local RPC
- Mark lesson complete if static passes
- Show local RPC as "optional advanced check"

Do not break Firebase progress tracking.
When a lesson passes, mark it completed in Firestore.
Glossary page idea
Yes, add a page called:

Glossary
Route:

/glossary
Purpose:

A quick reference page for GenLayer syntax, functions, decorators, storage types, AI helpers, escrow patterns, and common snippets.
It should have:

Search bar
Category filters
Copy button for each snippet
Short explanation
Code snippet
Lessons where this concept appears
Locked/unlocked state based on lesson progress
Suggested categories:

Contract Basics
Public Methods
Storage Types
Message Context
Payments
JSON Views
AI / Non-determinism
Transfers
Security Patterns
Frontend Integration
Glossary entries to include
1. Dependency header
Use when: starting every GenLayer contract.

# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
Explanation: Tells GenLayer which dependency package the contract needs.

2. Import GenLayer
from genlayer import *
Explanation: Imports the GenLayer contract API, types, decorators, and helpers.

3. Contract class
class MyContract(gl.Contract):
    pass
Explanation: Every Intelligent Contract should extend gl.Contract.

4. Persistent state variable
owner: Address
name: str
count: u256
Explanation: Declare persistent state at class level with type annotations.

5. Constructor
def __init__(self) -> None:
    self.owner = gl.message.sender_address
Explanation: Initializes contract state when deployed. Do not decorate the constructor.

6. Public view method
@gl.public.view
def get_name(self) -> str:
    return self.name
Explanation: Read-only method. Use for frontend display.

7. Public write method
@gl.public.write
def update_name(self, new_name: str) -> None:
    self.name = new_name
Explanation: Changes contract state.

8. Public payable write method
@gl.public.write.payable
def deposit(self) -> None:
    amount = gl.message.value
Explanation: Changes state and receives GEN/native value.

9. Sender address
caller = gl.message.sender_address
Explanation: The wallet/account calling the method.

10. Message value
amount = gl.message.value
Explanation: Amount of value sent with a payable method.

11. Address type
owner: Address
seller: Address
Explanation: Stores GenLayer addresses.

12. Address as hex
seller_hex = self.seller.as_hex
Explanation: Converts address to string for JSON or map keys.

13. u256 amount
price: u256
assert price > u256(0), "Price must be greater than zero"
Explanation: Use fixed integer types for amounts and counters.

14. TreeMap
listing_titles: TreeMap[str, str]
listing_prices: TreeMap[str, u256]
Explanation: Persistent key-value storage.

15. DynArray
listing_ids: DynArray[str]
self.listing_ids.append(listing_id)
Explanation: Persistent array-like storage for indexes.

16. JSON response
import json

@gl.public.view
def get_listing_json(self, listing_id: str) -> str:
    return json.dumps({
        "id": listing_id,
        "title": self.listing_titles[listing_id],
    }, sort_keys=True)
Explanation: Makes contract data easy for frontend to read.

17. Assertion validation
assert len(title) > 0, "Title cannot be empty"
Explanation: Stops invalid transactions with a readable error.

18. Owner-only check
assert gl.message.sender_address == self.owner, "Only owner can update"
Explanation: Restricts method to the contract owner.

19. Status machine
self.listing_statuses[listing_id] = "active"
self.listing_statuses[listing_id] = "pending"
self.listing_statuses[listing_id] = "sold"
Explanation: Tracks lifecycle of a record.

20. Payable escrow pattern
@gl.public.write.payable
def buy(self, listing_id: str) -> str:
    assert gl.message.value >= self.listing_prices[listing_id], "Insufficient payment"

    escrow_id = listing_id
    self.escrow_buyers[escrow_id] = gl.message.sender_address
    self.escrow_amounts[escrow_id] = gl.message.value
    self.escrow_statuses[escrow_id] = "locked"

    return escrow_id
Explanation: Locks payment until another action releases or refunds it.

21. Contract transfer interface
@gl.evm.contract_interface
class _Recipient:
    class View:
        pass

    class Write:
        pass
Explanation: Interface used to emit value transfers to an address/recipient.

22. Emit transfer
_Recipient(seller).emit_transfer(value=amount)
Explanation: Sends value from the contract to a recipient.

23. Confirm purchase
@gl.public.write
def confirm_purchase(self, escrow_id: str) -> None:
    assert self.escrow_statuses[escrow_id] == "locked", "Escrow is not locked"

    seller = self.listing_sellers[self.escrow_listing_ids[escrow_id]]
    amount = self.escrow_amounts[escrow_id]

    _Recipient(seller).emit_transfer(value=amount)

    self.escrow_statuses[escrow_id] = "released"
Explanation: Releases locked payment to seller.

24. Source unlock rule
@gl.public.view
def can_unlock_source(self, escrow_id: str) -> bool:
    if escrow_id not in self.escrow_buyers:
        return False

    return self.escrow_statuses[escrow_id] == "released"
Explanation: Never unlock private source while escrow is only locked.

25. AI prompt execution
result = gl.vm.run_nondet_unsafe(run, validate_result)
Explanation: Asks AI to evaluate text or evidence.

GenLayer is designed around AI-powered Intelligent Contracts that can reason about subjective decisions and real-world context. 

26. Structured AI output
result = gl.vm.run_nondet_unsafe(run, validate_result)
parts = result.split("|")

assert len(parts) == 3, "AI result must contain verdict, confidence, and reason"

verdict = parts[0]
confidence = parts[1]
reason = parts[2]
Explanation: Makes AI output easier to validate and display.

27. AI verdict pattern
assert verdict == "MATCH" or verdict == "PARTIAL" or verdict == "MISMATCH", "Invalid AI verdict"
Explanation: Restricts AI response to expected values.

28. Reputation vote
@gl.public.write
def vote_seller(self, escrow_id: str, is_upvote: bool) -> None:
    assert self.escrow_statuses[escrow_id] == "released", "Purchase must be released before voting"
Explanation: Buyers can only vote after a completed purchase.

29. Frontend actions JSON
@gl.public.view
def get_frontend_actions_json(self) -> str:
    return json.dumps({
        "create": "create_listing(...)",
        "buy": "buy(listing_id)",
        "confirm": "confirm_purchase(escrow_id)",
    }, sort_keys=True)
Explanation: Helps students understand how contract methods map to frontend actions.

30. Test checklist JSON
@gl.public.view
def get_test_checklist_json(self) -> str:
    return json.dumps([
        "Create a listing",
        "Buy as a different wallet",
        "Confirm purchase",
        "Verify escrow is released"
    ], sort_keys=True)
Explanation: Documents how to manually test the capstone.

Tell Claude this for the Glossary page
Add a new Glossary page to GenAcademia.

Route:
 /glossary

Purpose:
A quick reference page for GenLayer concepts, functions, decorators, storage types, AI helpers, payment patterns, transfer patterns, and common snippets used across the 5 capstone tracks.

Do not rebuild the frontend from scratch. Add this page into the existing app navigation.

Glossary page requirements:
1. Page title: "GenLayer Glossary"
2. Subtitle: "Quick snippets and explanations for building Intelligent Contracts."
3. Search bar
4. Category filter chips:
   - Contract Basics
   - Public Methods
   - Storage
   - Message Context
   - Payments
   - JSON Views
   - AI
   - Security Patterns
   - Frontend Integration
5. Each glossary item should show:
   - Concept name
   - Category
   - Short explanation
   - Code snippet
   - Copy button
   - Related lesson IDs
   - Difficulty level
6. Glossary entries should be stored in a reusable file:
   src/lib/glossary.ts
7. Create TypeScript types:
   GlossaryCategory
   GlossaryItem
8. Add at least these concepts:
   - Dependency header
   - from genlayer import *
   - gl.Contract
   - Persistent state variable
   - Constructor
   - @gl.public.view
   - @gl.public.write
   - @gl.public.write.payable
   - gl.message.sender_address
   - gl.message.value
   - Address
   - Address.as_hex
   - u256
   - TreeMap
   - DynArray
   - json.dumps
   - assert validation
   - owner-only check
   - status machine
   - payable escrow pattern
   - @gl.evm.contract_interface
   - emit_transfer
   - confirm purchase
   - source unlock rule
   - gl.nondet.exec_prompt
   - structured AI output
   - AI verdict validation
   - reputation voting
   - frontend actions JSON
   - test checklist JSON
9. Add "unlockedFromLesson" so concepts can progressively unlock as users complete lessons.
10. Locked glossary items should still be visible but blurred/disabled with text:
   "Unlock by completing Lesson X"
11. Include a "Copy snippet" button for every unlocked item.
12. Make the page responsive and match the current GenAcademia design.
13. Do not remove or break existing dashboard, onboarding, lesson pages, Monaco editor, Firebase auth, or cheatsheet.
How glossary data should look
Tell Claude to use this kind of structure:

export type GlossaryCategory =
  | "Contract Basics"
  | "Public Methods"
  | "Storage"
  | "Message Context"
  | "Payments"
  | "JSON Views"
  | "AI"
  | "Security Patterns"
  | "Frontend Integration";

export type GlossaryItem = {
  id: string;
  title: string;
  category: GlossaryCategory;
  explanation: string;
  snippet: string;
  relatedLessons: number[];
  unlockedFromLesson: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
};
Example item:

{
  id: "public-view",
  title: "@gl.public.view",
  category: "Public Methods",
  explanation: "Marks a method as read-only. Use it when the frontend needs to read contract state without changing it.",
  snippet: \`@gl.public.view
def get_name(self) -> str:
    return self.name\`,
  relatedLessons: [3, 12, 13, 15],
  unlockedFromLesson: 3,
  difficulty: "Beginner"
}
Final recommendation
Add both pages/features:

Verify System = tells student if their code is correct
Glossary Page = helps student remember syntax and patterns
The platform should feel like:

Learn → Code → Verify → Fix missing parts → Complete lesson → Unlock glossary snippets
That will make GenAcademia feel like a real developer education platform, not just a page with lessons.


Ou jnow how natlab chrcks if youbdid the right thing, how do they do it and how can we implement it here in GenAcademia

Thought for 5s
Yes, exactly. MATLAB-style checking is usually based on tests behind the scenes, not just "does the code contain this word?"

In MATLAB Grader/Cody-style platforms, the student writes code, then the platform runs hidden checks like:

1. Does the function exist?
2. Does it accept the right inputs?
3. Does it return the expected output?
4. Does it fail correctly for bad input?
5. Does it use or avoid certain required functions?
6. Does it pass hidden test cases the student cannot see?
So for GenAcademia, you should copy that idea, but adapt it to GenLayer contracts.

Your verification should not only check:

Does the code contain @gl.public.view?
It should also check:

If I call create_listing(...), does it return "0"?
If I call buy("0"), does escrow become locked?
If I call confirm_purchase("0"), does escrow become released?
If I try seller buying own listing, does it fail?
That is how the platform can know the student actually did the right thing.

How to implement MATLAB-style checks in GenAcademia
Use three layers:

Layer 1: Static checks
Layer 2: Behavioral tests
Layer 3: Optional real GenLayer RPC tests
For your platform, the most important one is Layer 2: Behavioral tests.

Layer 1 — Static checks
This checks the code text.

Example:

{
  requiredClass: "CodeVault",
  requiredMethods: ["create_listing", "buy", "confirm_purchase"],
  requiredDecorators: ["@gl.public.write.payable"],
  requiredStrings: [
    "gl.message.value",
    "self.escrow_statuses[escrow_id] = \\"locked\\""
  ],
  forbiddenStrings: [
    "gl.transfer",
    "escrow_id = listing_id + \\"_\\""
  ]
}
This is useful, but not enough. A student can include the right words and still write broken logic.

Layer 2 — Behavioral tests, the MATLAB-style part
This is where the platform tests the student's code like a real assignment.

For example, for CodeVault Lesson 16: Buying a Listing, the platform should run hidden tests like:

Test 1:
Create listing → should return "0"

Test 2:
Buy listing with enough payment → should return escrow_id "0"

Test 3:
After buy, listing status should be "pending"

Test 4:
After buy, escrow status should be "locked"

Test 5:
Seller trying to buy own listing should fail with "Seller cannot buy own listing"

Test 6:
Buyer paying below price should fail with "Payment is below listing price"
That is the real "you did the right thing" checker.

Layer 3 — Optional real GenLayer RPC check
This is for advanced/local users.

Since cloud deployment cannot reach a user's local GenLayer Studio at:

http://localhost:61999
do not make this required.

Use it only as an optional bonus check:

Static + simulated checks passed.
Local GenLayer Studio was not reachable. Run this app locally beside the GenLayer CLI to complete live verification.
The best architecture for GenAcademia verification
You need a file like:

src/lib/verification/lessonTests.ts
Each lesson should have a test spec.

Example:

export type LessonVerificationSpec = {
  lessonId: number;
  path: "PredictX" | "TrustLance" | "GovMind" | "CodeVault" | "CaseWise";
  staticChecks: StaticCheckSpec;
  behaviorTests: BehaviorTestSpec[];
};
Then:

export type StaticCheckSpec = {
  requiredClass?: string;
  requiredImports?: string[];
  requiredMethods?: string[];
  requiredDecorators?: string[];
  requiredState?: string[];
  requiredStrings?: string[];
  forbiddenStrings?: string[];
};
And:

export type BehaviorTestSpec = {
  id: string;
  title: string;
  setup?: string;
  action: string;
  expected: string;
  expectedError?: string;
};
Example: CodeVault Lesson 16 checker
export const codeVaultLesson16Spec = {
  lessonId: 16,
  path: "CodeVault",

  staticChecks: {
    requiredClass: "CodeVault",
    requiredMethods: ["buy"],
    requiredDecorators: ["@gl.public.write.payable"],
    requiredState: [
      "escrow_buyers: TreeMap[str, Address]",
      "escrow_listing_ids: TreeMap[str, str]",
      "escrow_amounts: TreeMap[str, u256]",
      "escrow_statuses: TreeMap[str, str]"
    ],
    requiredStrings: [
      "gl.message.value",
      "escrow_id = listing_id",
      "self.escrow_statuses[escrow_id] = \\"locked\\"",
      "self.listing_statuses[listing_id] = \\"pending\\""
    ],
    forbiddenStrings: [
      "gl.transfer",
      "escrow_id = listing_id + \\"_\\""
    ]
  },

  behaviorTests: [
    {
      id: "buy-returns-listing-id",
      title: "Buying listing 0 returns escrow id 0",
      action: "buy('0')",
      expected: "0"
    },
    {
      id: "escrow-becomes-locked",
      title: "Escrow becomes locked after purchase",
      action: "get_escrow_json('0')",
      expected: "\\"status\\": \\"locked\\""
    },
    {
      id: "listing-becomes-pending",
      title: "Listing becomes pending after purchase",
      action: "get_listing_json('0')",
      expected: "\\"status\\": \\"pending\\""
    },
    {
      id: "seller-cannot-buy",
      title: "Seller cannot buy own listing",
      action: "buy('0') as seller",
      expectedError: "Seller cannot buy own listing"
    }
  ]
};
But how do we actually run the student code?
You have two options.

Option A — Easier for now: pattern-based behavioral checks
This does not execute the Python code. It checks the expected logic patterns.

For example:

{
  title: "Escrow becomes locked",
  mustContain: "self.escrow_statuses[escrow_id] = \\"locked\\""
}
This is easier, safer, and good for the first version.

But it is not perfect.

A student can fake patterns.

Option B — Better: sandboxed execution
This is closer to MATLAB.

You run the student's code in a safe backend sandbox with mocked GenLayer objects.

Instead of deploying to GenLayer, you simulate:

gl.message.sender_address
gl.message.value
Address
u256
TreeMap
DynArray
Then the platform can actually instantiate the contract and call methods.

Example flow:

1. Student clicks Verify
2. Frontend sends code + lessonId + path to backend
3. Backend runs code inside a sandbox
4. Backend injects fake GenLayer environment
5. Backend runs hidden tests
6. Backend returns pass/fail/missing/errors
This is the closest to MATLAB.

Recommended version for GenAcademia
Start with this:

Version 1:
Static checks + pattern-based behavior checks

Version 2:
Backend sandbox with mocked GenLayer runtime

Version 3:
Optional real GenLayer localhost/RPC verification
Do not try to build full real execution first. It may slow you down.

What the verify result should show
When a student clicks Verify, show something like:

Score: 78%

Passed:
✓ Contract class CodeVault found
✓ buy() method found
✓ Payable decorator found
✓ Escrow status is set to locked

Missing:
✗ Missing buyer cannot be seller check
✗ Missing payment below price validation

Suggestion:
Add this inside buy():

assert caller != seller, "Seller cannot buy own listing"
assert gl.message.value >= price, "Payment is below listing price"
This feels like MATLAB because the student knows exactly what failed.

Tell Claude this
Implement MATLAB-style lesson verification for GenAcademia.

The goal:
When a student writes code in the Monaco editor and clicks Verify, the platform should check whether they completed the lesson correctly, similar to MATLAB Grader.

Do not only check for check() == "Success".
Do not only check one string.
Build a structured verification engine.

Verification should have 3 layers:

1. Static checks
2. Pattern-based behavioral checks
3. Optional local GenLayer RPC check

For now, implement layers 1 and 2 fully. Keep layer 3 optional and graceful.

Create these files:
- src/lib/verification/types.ts
- src/lib/verification/staticVerifier.ts
- src/lib/verification/behaviorVerifier.ts
- src/lib/verification/lessonSpecs.ts
- src/lib/verification/verifyLesson.ts

Types needed:
- StaticCheckSpec
- BehaviorCheckSpec
- LessonVerificationSpec
- VerificationResult
- VerificationIssue

StaticCheckSpec should support:
- requiredClass
- requiredImports
- requiredMethods
- requiredDecorators
- requiredState
- requiredStrings
- forbiddenStrings

BehaviorCheckSpec should support:
- id
- title
- description
- mustContain
- mustNotContain
- expectedStatusChange
- expectedError
- suggestion

VerificationResult should return:
- passed: boolean
- score: number
- passedChecks: string[]
- missing: string[]
- warnings: string[]
- suggestions: string[]
- nextStep: string

Important:
Normalize whitespace before checks.
Allow formatting differences.
Do not require exact full-code matching.
Check concepts and logic patterns.

Example:
For CodeVault Lesson 16, the verifier should check:
- class CodeVault exists
- buy method exists
- @gl.public.write.payable exists
- gl.message.value is used
- escrow_id = listing_id exists
- escrow_statuses is declared
- escrow status becomes "locked"
- listing status becomes "pending"
- seller cannot buy own listing
- payment below price is rejected
- gl.transfer is not used

When verification fails, show clear feedback:
"Missing seller self-buy protection"
Suggestion:
Add:
assert caller != seller, "Seller cannot buy own listing"

Add lessonSpecs for at least:
- lessons 1–5 for all 5 paths
- CodeVault lessons 16, 19, 20, 26, 27
Then structure it so we can add the remaining lesson specs later.

Update the Verify button:
- It should call verifyLesson(code, path, lessonId)
- Display score
- Display passed checks
- Display missing checks
- Display warnings
- Display suggestions
- Mark lesson completed in Firebase only if passed is true

Optional local RPC:
If static + behavior checks pass, optionally try localhost:61999.
If localhost fails, show:
"Static checks passed. Local GenLayer Studio was not reachable. Run this app locally beside the GenLayer CLI to complete live verification."
Do not show raw network errors.

Do not break:
- onboarding
- Firebase auth
- Firebase progress tracking
- dashboard
- lesson page
- Monaco editor
- cheatsheet
- glossary
Later, for a stronger MATLAB-like version
After the first version works, tell Claude:

Upgrade GenAcademia verification to include sandboxed execution.

Add a backend verification endpoint:
POST /api/verify

Input:
{
  code: string,
  path: string,
  lessonId: number
}

The backend should:
1. Run student code in a restricted sandbox
2. Inject a mocked GenLayer runtime:
   - gl.Contract
   - gl.public.view
   - gl.public.write
   - gl.public.write.payable
   - gl.message.sender_address
   - gl.message.value
   - Address
   - u256
   - TreeMap
   - DynArray
   - gl.nondet.exec_prompt mock
3. Instantiate the submitted contract
4. Run hidden lesson tests
5. Return structured pass/fail results

Example hidden test for CodeVault Lesson 16:
- Deploy CodeVault as seller
- Create listing with price 100
- Switch caller to buyer
- Set gl.message.value to 100
- Call buy("0")
- Expect return "0"
- Expect escrow_statuses["0"] == "locked"
- Expect listing_statuses["0"] == "pending"
- Switch caller to seller
- Try buy("0")
- Expect error "Listing is not active" or "Seller cannot buy own listing"

Never execute untrusted code directly in the main server process.
Use isolation or a restricted child process.
Add timeout protection.
Return friendly errors.
That second version is the real MATLAB-style version. But start with the structured static + behavioral checker first so your app works quickly.

next
`,
  task: ``,
  hints: [
    "Read the task description carefully — the change is small.",
    "Look at the expected code section for the exact pattern to follow.",
    "Check the expected code — the solution is there.",
  ],
};

export default content;
