This is big enough to become a full course book, so I’ll do it properly in batches. I’ll start with Track 1: PredictX, lessons 1–30, with code, explanation, student task, and verification checks. After this, we can continue with TrustLance, then GovMind, CodeVault, and CaseWise in the same format.

GenLayer Intelligent Contracts are Python classes that extend gl.Contract; they use decorators like @gl.public.view, @gl.public.write, and @gl.public.write.payable, plus typed state like Address, u256, TreeMap, and DynArray. GenLayer also supports non-deterministic AI/web-powered logic through its equivalence-principle model, which is why a prediction market is a strong first capstone. 

Track 1: PredictX — AI-Resolved Prediction Market
Final project goal
Students are building PredictX, an AI-resolved prediction market where users can:

1. Create prediction markets
2. List all active markets
3. Stake GEN on an outcome
4. Track user stakes
5. Close a market
6. Ask AI to resolve the outcome
7. Claim winnings
8. Prevent duplicate claims
9. Expose JSON views for frontend use
10. Understand how GenLayer contracts combine normal state logic with AI-assisted decisions
The final contract will not be perfect production finance code, but it will teach the correct architecture patterns.

Lesson 1 — What You Are Building: AI-Resolved Markets
What students learn
Students learn what a prediction market is, why normal smart contracts struggle with real-world outcomes, and why GenLayer is useful for contracts that need to reason about language, evidence, and real-world events.

What they do
They do not write a full contract yet. They inspect the final direction and complete a tiny starter check so the platform knows they understand the project.

Starter code
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class PredictX(gl.Contract):
    project_name: str

    def __init__(self) -> None:
        self.project_name = "PredictX"

    @gl.public.view
    def get_project_name(self) -> str:
        return self.project_name
Explanation
The contract begins with the dependency header:

# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
Then it imports GenLayer:

from genlayer import *
The contract class extends:

gl.Contract
The first state variable is:

project_name: str
The constructor initializes it, and get_project_name() exposes it as a read-only method.

Student task
Change the project name from "PredictX" to:

PredictX: AI-Resolved Prediction Market
Expected output
Calling:

get_project_name()
should return:

PredictX: AI-Resolved Prediction Market
Platform verification
Static checks:

{
  requiredClass: "PredictX",
  requiredDecorators: ["@gl.public.view"],
  requiredMethods: ["get_project_name"],
  requiredStrings: ["PredictX: AI-Resolved Prediction Market"],
  forbiddenStrings: ["TODO", "Success"]
}
Lesson 2 — PredictX Contract Skeleton
What students learn
Students learn the basic structure of a GenLayer Intelligent Contract: dependency header, imports, class declaration, typed state variables, and constructor.

What they do
They create the first real contract skeleton with an owner and a platform name.

Starter code
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class PredictX(gl.Contract):
    owner: Address
    platform_name: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "PredictX"
Explanation
This line stores the deployer:

self.owner = gl.message.sender_address
gl.message.sender_address is the address that called the constructor during deployment.

The variable:

owner: Address
must be declared at class level so it is persistent contract state.

Student task
Add a second persistent field:

platform_description: str
Then initialize it in the constructor with:

A GenLayer prediction market that uses AI-assisted resolution.
Expected final code
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class PredictX(gl.Contract):
    owner: Address
    platform_name: str
    platform_description: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "PredictX"
        self.platform_description = "A GenLayer prediction market that uses AI-assisted resolution."
Expected output
No method is called yet. The platform checks that state fields exist.

Platform verification
{
  requiredClass: "PredictX",
  requiredState: ["owner: Address", "platform_name: str", "platform_description: str"],
  requiredStrings: [
    "gl.message.sender_address",
    "A GenLayer prediction market that uses AI-assisted resolution."
  ]
}
Lesson 3 — Reading Market Metadata
What students learn
Students learn how to expose read-only contract state using @gl.public.view.

Starter code
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class PredictX(gl.Contract):
    owner: Address
    platform_name: str
    platform_description: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "PredictX"
        self.platform_description = "A GenLayer prediction market that uses AI-assisted resolution."

    @gl.public.view
    def get_platform_name(self) -> str:
        return self.platform_name
Explanation
A view method reads state without changing it:

@gl.public.view
This is the method a frontend would call to display public information.

Student task
Add two new view methods:

get_platform_description()
get_owner()
get_owner() should return the owner as hex:

return self.owner.as_hex
Expected final code
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class PredictX(gl.Contract):
    owner: Address
    platform_name: str
    platform_description: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "PredictX"
        self.platform_description = "A GenLayer prediction market that uses AI-assisted resolution."

    @gl.public.view
    def get_platform_name(self) -> str:
        return self.platform_name

    @gl.public.view
    def get_platform_description(self) -> str:
        return self.platform_description

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner.as_hex
Expected output
get_platform_name() returns:

PredictX
get_platform_description() returns:

A GenLayer prediction market that uses AI-assisted resolution.
get_owner() returns a wallet address string.

Platform verification
{
  requiredDecorators: ["@gl.public.view"],
  requiredMethods: [
    "get_platform_name",
    "get_platform_description",
    "get_owner"
  ],
  requiredStrings: ["self.owner.as_hex"]
}
Lesson 4 — Updating Market Metadata
What students learn
Students learn how to modify state using @gl.public.write, and why write methods need permission checks.

Writing to Intelligent Contracts modifies state and needs network processing, unlike read calls. 

Starter code
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class PredictX(gl.Contract):
    owner: Address
    platform_name: str
    platform_description: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "PredictX"
        self.platform_description = "A GenLayer prediction market that uses AI-assisted resolution."

    @gl.public.view
    def get_platform_name(self) -> str:
        return self.platform_name

    @gl.public.view
    def get_platform_description(self) -> str:
        return self.platform_description

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner.as_hex
Student task
Add a write method:

update_platform_description(new_description: str)
Rules:

Only owner can update it.
Description cannot be empty.
Expected final code
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class PredictX(gl.Contract):
    owner: Address
    platform_name: str
    platform_description: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "PredictX"
        self.platform_description = "A GenLayer prediction market that uses AI-assisted resolution."

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
        assert gl.message.sender_address == self.owner, "Only owner can update description"
        assert len(new_description) > 0, "Description cannot be empty"

        self.platform_description = new_description
Expected output
After calling:

update_platform_description("Markets resolved with AI-assisted evidence review.")
then:

get_platform_description()
returns:

Markets resolved with AI-assisted evidence review.
Platform verification
{
  requiredDecorators: ["@gl.public.write"],
  requiredMethods: ["update_platform_description"],
  requiredStrings: [
    "assert gl.message.sender_address == self.owner",
    "Description cannot be empty",
    "self.platform_description = new_description"
  ]
}
Lesson 5 — Major Upgrade: Prediction Market Identity Contract
What students learn
Students combine everything from lessons 1–4 into the first complete PredictX identity contract.

Student task
Add one more view method:

get_contract_summary()
It should return a readable string containing the name and description.

Expected final code
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class PredictX(gl.Contract):
    owner: Address
    platform_name: str
    platform_description: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "PredictX"
        self.platform_description = "A GenLayer prediction market that uses AI-assisted resolution."

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
        assert gl.message.sender_address == self.owner, "Only owner can update description"
        assert len(new_description) > 0, "Description cannot be empty"

        self.platform_description = new_description
Expected output
get_contract_summary() returns:

PredictX: A GenLayer prediction market that uses AI-assisted resolution.
Platform verification
{
  majorUpgrade: true,
  requiredClass: "PredictX",
  requiredState: [
    "owner: Address",
    "platform_name: str",
    "platform_description: str"
  ],
  requiredMethods: [
    "get_platform_name",
    "get_platform_description",
    "get_owner",
    "get_contract_summary",
    "update_platform_description"
  ],
  requiredDecorators: [
    "@gl.public.view",
    "@gl.public.write"
  ],
  requiredStrings: [
    "self.owner = gl.message.sender_address",
    "self.owner.as_hex",
    "assert gl.message.sender_address == self.owner"
  ],
  expectedViewOutputs: {
    get_platform_name: "PredictX",
    get_contract_summaryIncludes: ["PredictX", "AI-assisted resolution"]
  }
}
Lesson 6 — Market Storage Fields
What students learn
Students learn how to define persistent storage for multiple prediction markets.

New concept
Class-level storage fields:

market_questions: TreeMap[str, str]
market_creators: TreeMap[str, Address]
market_statuses: TreeMap[str, str]
Starter code
Use the Lesson 5 code.

Student task
Add these persistent fields:

market_questions: TreeMap[str, str]
market_outcome_a: TreeMap[str, str]
market_outcome_b: TreeMap[str, str]
market_creators: TreeMap[str, Address]
market_statuses: TreeMap[str, str]
Expected code additions
market_questions: TreeMap[str, str]
market_outcome_a: TreeMap[str, str]
market_outcome_b: TreeMap[str, str]
market_creators: TreeMap[str, Address]
market_statuses: TreeMap[str, str]
Explanation
A TreeMap stores many records by key. In PredictX, every market gets an ID like "0", "1", or "2", and each map stores one part of the market.

Expected output
No public output yet. The platform checks storage declarations.

Platform verification
{
  requiredState: [
    "market_questions: TreeMap[str, str]",
    "market_outcome_a: TreeMap[str, str]",
    "market_outcome_b: TreeMap[str, str]",
    "market_creators: TreeMap[str, Address]",
    "market_statuses: TreeMap[str, str]"
  ]
}
Lesson 7 — Tracking Market Creators
What students learn
Students learn how to connect market records to the address that created them.

Starter code
Use Lesson 6 code.

Student task
Add a method stub for creating markets:

@gl.public.write
def create_market(self, question: str, outcome_a: str, outcome_b: str) -> str:
Inside it, create a temporary market ID:

market_id = "0"
Then store:

self.market_creators[market_id] = gl.message.sender_address
Expected code addition
@gl.public.write
def create_market(self, question: str, outcome_a: str, outcome_b: str) -> str:
    market_id = "0"
    self.market_creators[market_id] = gl.message.sender_address
    self.market_questions[market_id] = question
    self.market_outcome_a[market_id] = outcome_a
    self.market_outcome_b[market_id] = outcome_b
    self.market_statuses[market_id] = "active"
    return market_id
Explanation
This is not final yet because every market currently uses ID "0". That is intentional for the lesson. The next lessons will replace this with a real counter and index.

Expected output
Calling:

create_market("Will GenLayer grow in 2026?", "Yes", "No")
returns:

0
Platform verification
{
  requiredMethods: ["create_market"],
  requiredDecorators: ["@gl.public.write"],
  requiredStrings: [
    "gl.message.sender_address",
    "self.market_creators[market_id]",
    "self.market_statuses[market_id] = \"active\"",
    "return market_id"
  ]
}
Lesson 8 — Market Fees and Stakes with u256
What students learn
Students learn how to store numeric values using u256.

Student task
Add:

market_min_stakes: TreeMap[str, u256]
Update create_market so it accepts:

min_stake: u256
Validate:

assert min_stake > u256(0), "Minimum stake must be greater than zero"
Expected code additions
market_min_stakes: TreeMap[str, u256]
Updated method:

@gl.public.write
def create_market(self, question: str, outcome_a: str, outcome_b: str, min_stake: u256) -> str:
    assert min_stake > u256(0), "Minimum stake must be greater than zero"

    market_id = "0"
    self.market_creators[market_id] = gl.message.sender_address
    self.market_questions[market_id] = question
    self.market_outcome_a[market_id] = outcome_a
    self.market_outcome_b[market_id] = outcome_b
    self.market_min_stakes[market_id] = min_stake
    self.market_statuses[market_id] = "active"

    return market_id
Expected output
Calling with u256(100) returns:

0
Calling with u256(0) fails with:

Minimum stake must be greater than zero
Platform verification
{
  requiredState: ["market_min_stakes: TreeMap[str, u256]"],
  requiredStrings: [
    "min_stake: u256",
    "assert min_stake > u256(0)",
    "self.market_min_stakes[market_id] = min_stake"
  ]
}
Lesson 9 — Market Records with TreeMap
What students learn
Students learn how one logical record can be split across multiple TreeMap fields.

Student task
Add validation for market creation:

Question cannot be empty.
Outcome A cannot be empty.
Outcome B cannot be empty.
Outcome A and B cannot be the same.
Expected code for create_market
@gl.public.write
def create_market(self, question: str, outcome_a: str, outcome_b: str, min_stake: u256) -> str:
    assert len(question) > 0, "Question cannot be empty"
    assert len(outcome_a) > 0, "Outcome A cannot be empty"
    assert len(outcome_b) > 0, "Outcome B cannot be empty"
    assert outcome_a != outcome_b, "Outcomes must be different"
    assert min_stake > u256(0), "Minimum stake must be greater than zero"

    market_id = "0"
    self.market_creators[market_id] = gl.message.sender_address
    self.market_questions[market_id] = question
    self.market_outcome_a[market_id] = outcome_a
    self.market_outcome_b[market_id] = outcome_b
    self.market_min_stakes[market_id] = min_stake
    self.market_statuses[market_id] = "active"

    return market_id
Expected output
Invalid call:

create_market("", "Yes", "No", u256(100))
fails with:

Question cannot be empty
Invalid call:

create_market("Will it rain?", "Yes", "Yes", u256(100))
fails with:

Outcomes must be different
Platform verification
{
  requiredStrings: [
    "Question cannot be empty",
    "Outcome A cannot be empty",
    "Outcome B cannot be empty",
    "Outcomes must be different"
  ]
}
Lesson 10 — Major Upgrade: Create a Prediction Market
What students learn
Students build the first real market creation system using a persistent counter.

Student task
Add:

market_count: u256
Initialize:

self.market_count = u256(0)
Use it to generate IDs:

market_id = str(self.market_count)
self.market_count += u256(1)
Expected final code after Lesson 10
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class PredictX(gl.Contract):
    owner: Address
    platform_name: str
    platform_description: str

    market_questions: TreeMap[str, str]
    market_outcome_a: TreeMap[str, str]
    market_outcome_b: TreeMap[str, str]
    market_creators: TreeMap[str, Address]
    market_min_stakes: TreeMap[str, u256]
    market_statuses: TreeMap[str, str]
    market_count: u256

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "PredictX"
        self.platform_description = "A GenLayer prediction market that uses AI-assisted resolution."
        self.market_count = u256(0)

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
        assert gl.message.sender_address == self.owner, "Only owner can update description"
        assert len(new_description) > 0, "Description cannot be empty"
        self.platform_description = new_description

    @gl.public.write
    def create_market(self, question: str, outcome_a: str, outcome_b: str, min_stake: u256) -> str:
        assert len(question) > 0, "Question cannot be empty"
        assert len(outcome_a) > 0, "Outcome A cannot be empty"
        assert len(outcome_b) > 0, "Outcome B cannot be empty"
        assert outcome_a != outcome_b, "Outcomes must be different"
        assert min_stake > u256(0), "Minimum stake must be greater than zero"

        market_id = str(self.market_count)

        self.market_creators[market_id] = gl.message.sender_address
        self.market_questions[market_id] = question
        self.market_outcome_a[market_id] = outcome_a
        self.market_outcome_b[market_id] = outcome_b
        self.market_min_stakes[market_id] = min_stake
        self.market_statuses[market_id] = "active"

        self.market_count += u256(1)

        return market_id
Expected output
First call returns:

0
Second call returns:

1
Platform verification
{
  majorUpgrade: true,
  requiredState: ["market_count: u256"],
  requiredStrings: [
    "self.market_count = u256(0)",
    "market_id = str(self.market_count)",
    "self.market_count += u256(1)"
  ],
  expectedBehavior: [
    "first create_market returns 0",
    "second create_market returns 1"
  ]
}
Lesson 11 — Indexing Markets with DynArray
What students learn
Students learn that a counter alone is not enough for frontend listing. The contract needs an index of market IDs.

Student task
Add:

market_ids: DynArray[str]
Then inside create_market:

self.market_ids.append(market_id)
Code additions
market_ids: DynArray[str]
Inside create_market:

self.market_ids.append(market_id)
Expected output
After creating two markets, market_ids contains:

["0", "1"]
The contract does not expose this yet. That comes in Lesson 13.

Platform verification
{
  requiredState: ["market_ids: DynArray[str]"],
  requiredStrings: ["self.market_ids.append(market_id)"]
}
Lesson 12 — Market JSON View
What students learn
Students learn how to return frontend-friendly JSON using json.dumps.

Student task
Add:

import json
Then create:

get_market_json(market_id: str) -> str
Expected code
import json
from genlayer import *
Method:

@gl.public.view
def get_market_json(self, market_id: str) -> str:
    assert market_id in self.market_questions, "Market not found"

    return json.dumps({
        "id": market_id,
        "creator": self.market_creators[market_id].as_hex,
        "question": self.market_questions[market_id],
        "outcome_a": self.market_outcome_a[market_id],
        "outcome_b": self.market_outcome_b[market_id],
        "min_stake": str(self.market_min_stakes[market_id]),
        "status": self.market_statuses[market_id],
    }, sort_keys=True)
Expected output
Calling:

get_market_json("0")
returns a JSON string like:

{
  "id": "0",
  "creator": "0x...",
  "question": "Will GenLayer grow in 2026?",
  "outcome_a": "Yes",
  "outcome_b": "No",
  "min_stake": "100",
  "status": "active"
}
Platform verification
{
  requiredImports: ["import json"],
  requiredMethods: ["get_market_json"],
  requiredStrings: [
    "json.dumps",
    "Market not found",
    "\"question\"",
    "\"outcome_a\"",
    "\"outcome_b\"",
    "\"min_stake\"",
    "\"status\""
  ]
}
Lesson 13 — Listing Active Markets
What students learn
Students learn how to loop through indexed IDs and return all active records.

Student task
Add:

get_active_markets_json()
Expected code
@gl.public.view
def get_active_markets_json(self) -> str:
    result = []

    for market_id in self.market_ids:
        if self.market_statuses[market_id] == "active":
            result.append({
                "id": market_id,
                "creator": self.market_creators[market_id].as_hex,
                "question": self.market_questions[market_id],
                "outcome_a": self.market_outcome_a[market_id],
                "outcome_b": self.market_outcome_b[market_id],
                "min_stake": str(self.market_min_stakes[market_id]),
                "status": self.market_statuses[market_id],
            })

    return json.dumps(result, sort_keys=True)
Expected output
If two active markets exist, returns:

[
  {
    "id": "0",
    "question": "Will GenLayer grow in 2026?",
    "status": "active"
  },
  {
    "id": "1",
    "question": "Will AI agents use GenLayer?",
    "status": "active"
  }
]
Platform verification
{
  requiredMethods: ["get_active_markets_json"],
  requiredStrings: [
    "for market_id in self.market_ids",
    "if self.market_statuses[market_id] == \"active\"",
    "result.append",
    "json.dumps(result"
  ]
}
Lesson 14 — Market Status Flow
What students learn
Students learn how to model a lifecycle using status strings.

Student task
Add:

close_market(market_id: str)
Only the creator or owner can close a market.

Expected code
@gl.public.write
def close_market(self, market_id: str) -> None:
    assert market_id in self.market_questions, "Market not found"

    caller = gl.message.sender_address
    creator = self.market_creators[market_id]

    assert caller == creator or caller == self.owner, "Only creator or owner can close market"
    assert self.market_statuses[market_id] == "active", "Only active markets can be closed"

    self.market_statuses[market_id] = "closed"
Expected output
Before close:

"status": "active"
After close:

"status": "closed"
Platform verification
{
  requiredMethods: ["close_market"],
  requiredStrings: [
    "Only creator or owner can close market",
    "Only active markets can be closed",
    "self.market_statuses[market_id] = \"closed\""
  ]
}
Lesson 15 — Major Upgrade: Browseable Market Dashboard Contract
What students learn
Students combine indexing, JSON views, filtering, and status transitions.

Student task
Add a method:

get_all_markets_json()
Unlike get_active_markets_json, this should return all markets.

Expected code
@gl.public.view
def get_all_markets_json(self) -> str:
    result = []

    for market_id in self.market_ids:
        result.append({
            "id": market_id,
            "creator": self.market_creators[market_id].as_hex,
            "question": self.market_questions[market_id],
            "outcome_a": self.market_outcome_a[market_id],
            "outcome_b": self.market_outcome_b[market_id],
            "min_stake": str(self.market_min_stakes[market_id]),
            "status": self.market_statuses[market_id],
        })

    return json.dumps(result, sort_keys=True)
Expected output
Returns all markets whether active or closed.

Platform verification
{
  majorUpgrade: true,
  requiredMethods: [
    "get_market_json",
    "get_active_markets_json",
    "get_all_markets_json",
    "close_market"
  ],
  requiredStrings: [
    "market_ids: DynArray[str]",
    "json.dumps",
    "\"active\"",
    "\"closed\""
  ]
}
Lesson 16 — Payable Staking
What students learn
Students learn how to receive GEN in a write method.

Student task
Add stake storage:

market_total_a: TreeMap[str, u256]
market_total_b: TreeMap[str, u256]
Then add a payable method:

stake_on_outcome(market_id: str, outcome: str)
Expected code
market_total_a: TreeMap[str, u256]
market_total_b: TreeMap[str, u256]
Method:

@gl.public.write.payable
def stake_on_outcome(self, market_id: str, outcome: str) -> None:
    assert market_id in self.market_questions, "Market not found"
    assert self.market_statuses[market_id] == "active", "Market is not active"
    assert gl.message.value >= self.market_min_stakes[market_id], "Stake is below minimum"

    if market_id not in self.market_total_a:
        self.market_total_a[market_id] = u256(0)

    if market_id not in self.market_total_b:
        self.market_total_b[market_id] = u256(0)

    if outcome == "A":
        self.market_total_a[market_id] += gl.message.value
    elif outcome == "B":
        self.market_total_b[market_id] += gl.message.value
    else:
        assert False, "Invalid outcome"
Expected output
If user stakes on "A" with enough GEN:

market_total_a increases
Invalid outcome "C" fails:

Invalid outcome
Platform verification
{
  requiredDecorators: ["@gl.public.write.payable"],
  requiredMethods: ["stake_on_outcome"],
  requiredStrings: [
    "gl.message.value",
    "Stake is below minimum",
    "Invalid outcome",
    "self.market_total_a[market_id] += gl.message.value"
  ]
}
Lesson 17 — Preventing Bad Stakes
What students learn
Students learn stricter validation and safer user flows.

Student task
Prevent the market creator from staking in their own market.

Add inside stake_on_outcome:

assert gl.message.sender_address != self.market_creators[market_id], "Creator cannot stake on own market"
Expected code addition
assert gl.message.sender_address != self.market_creators[market_id], "Creator cannot stake on own market"
Expected output
If creator tries to stake:

Creator cannot stake on own market
Platform verification
{
  requiredStrings: [
    "Creator cannot stake on own market",
    "gl.message.sender_address != self.market_creators[market_id]"
  ]
}
Lesson 18 — Tracking User Stakes
What students learn
Students learn how to track user-specific staking.

Student task
Add:

user_stakes_a: TreeMap[str, u256]
user_stakes_b: TreeMap[str, u256]
Use a composite key:

stake_key = market_id + "_" + gl.message.sender_address.as_hex
Expected code additions
user_stakes_a: TreeMap[str, u256]
user_stakes_b: TreeMap[str, u256]
Inside stake_on_outcome:

stake_key = market_id + "_" + gl.message.sender_address.as_hex

if outcome == "A":
    if stake_key not in self.user_stakes_a:
        self.user_stakes_a[stake_key] = u256(0)
    self.user_stakes_a[stake_key] += gl.message.value
    self.market_total_a[market_id] += gl.message.value
elif outcome == "B":
    if stake_key not in self.user_stakes_b:
        self.user_stakes_b[stake_key] = u256(0)
    self.user_stakes_b[stake_key] += gl.message.value
    self.market_total_b[market_id] += gl.message.value
else:
    assert False, "Invalid outcome"
Expected output
If user stakes 100 on A, their stake key stores:

100
Platform verification
{
  requiredState: [
    "user_stakes_a: TreeMap[str, u256]",
    "user_stakes_b: TreeMap[str, u256]"
  ],
  requiredStrings: [
    "stake_key = market_id + \"_\" + gl.message.sender_address.as_hex",
    "self.user_stakes_a[stake_key]",
    "self.user_stakes_b[stake_key]"
  ]
}
Lesson 19 — Claim and Refund Patterns
What students learn
Students learn that claims should only happen after a market is resolved.

Student task
Add storage:

market_winning_outcome: TreeMap[str, str]
user_claimed: TreeMap[str, bool]
Add a temporary owner-only resolver:

resolve_market_manually(market_id: str, winning_outcome: str)
Expected code
market_winning_outcome: TreeMap[str, str]
user_claimed: TreeMap[str, bool]
Method:

@gl.public.write
def resolve_market_manually(self, market_id: str, winning_outcome: str) -> None:
    assert market_id in self.market_questions, "Market not found"
    assert gl.message.sender_address == self.owner, "Only owner can resolve manually"
    assert self.market_statuses[market_id] == "closed", "Market must be closed before resolution"
    assert winning_outcome == "A" or winning_outcome == "B", "Invalid winning outcome"

    self.market_winning_outcome[market_id] = winning_outcome
    self.market_statuses[market_id] = "resolved"
Expected output
If market is closed and owner calls:

resolve_market_manually("0", "A")
then:

"status": "resolved"
Platform verification
{
  requiredState: [
    "market_winning_outcome: TreeMap[str, str]",
    "user_claimed: TreeMap[str, bool]"
  ],
  requiredMethods: ["resolve_market_manually"],
  requiredStrings: [
    "Only owner can resolve manually",
    "Market must be closed before resolution",
    "self.market_statuses[market_id] = \"resolved\""
  ]
}
Lesson 20 — Major Upgrade: Full Prediction Value Flow
What students learn
Students implement a simple claim method. This lesson focuses on state checks, not perfect payout math.

Student task
Add:

claim_winnings(market_id: str)
For now, it should mark the user as claimed if they backed the winning side. The actual transfer/payout lesson can be advanced content later.

Expected code
@gl.public.write
def claim_winnings(self, market_id: str) -> None:
    assert market_id in self.market_questions, "Market not found"
    assert self.market_statuses[market_id] == "resolved", "Market is not resolved"

    caller_hex = gl.message.sender_address.as_hex
    claim_key = market_id + "_" + caller_hex

    if claim_key in self.user_claimed:
        assert self.user_claimed[claim_key] == False, "Already claimed"

    winning_outcome = self.market_winning_outcome[market_id]

    if winning_outcome == "A":
        assert claim_key in self.user_stakes_a, "No winning stake found"
    elif winning_outcome == "B":
        assert claim_key in self.user_stakes_b, "No winning stake found"
    else:
        assert False, "Invalid resolved outcome"

    self.user_claimed[claim_key] = True
Expected output
A winning user can claim once.

Second claim fails with:

Already claimed
A losing user fails with:

No winning stake found
Platform verification
{
  majorUpgrade: true,
  requiredMethods: ["claim_winnings"],
  requiredStrings: [
    "Market is not resolved",
    "Already claimed",
    "No winning stake found",
    "self.user_claimed[claim_key] = True"
  ]
}
Lesson 21 — AI Resolution Basics
What students learn
Students learn when to use AI in a GenLayer contract and why AI logic must be treated differently from normal deterministic logic.

GenLayer is designed for contracts that can reason over language and external context, but non-deterministic outputs need validation through GenLayer’s consensus model. 

Student task
Add a method that prepares a resolution prompt.

For now, it returns a prompt string only.

Expected code
@gl.public.view
def get_resolution_prompt(self, market_id: str, evidence: str) -> str:
    assert market_id in self.market_questions, "Market not found"

    return (
        "Resolve this prediction market using the evidence provided. "
        + "Question: "
        + self.market_questions[market_id]
        + " Outcome A: "
        + self.market_outcome_a[market_id]
        + " Outcome B: "
        + self.market_outcome_b[market_id]
        + " Evidence: "
        + evidence
    )
Expected output
Calling with evidence returns a full AI prompt string.

Platform verification
{
  requiredMethods: ["get_resolution_prompt"],
  requiredStrings: [
    "Resolve this prediction market",
    "Evidence:",
    "self.market_questions[market_id]"
  ]
}
Lesson 22 — Using gl.nondet.exec_prompt
What students learn
Students learn how to request AI analysis.

Student task
Add:

resolve_with_ai(market_id: str, evidence: str)
The method should call:

gl.nondet.exec_prompt(prompt)
Expected code
@gl.public.write
def resolve_with_ai(self, market_id: str, evidence: str) -> str:
    assert market_id in self.market_questions, "Market not found"
    assert self.market_statuses[market_id] == "closed", "Market must be closed before AI resolution"
    assert len(evidence) > 0, "Evidence cannot be empty"

    prompt = (
        "You are resolving a prediction market. "
        + "Question: "
        + self.market_questions[market_id]
        + ". Outcome A: "
        + self.market_outcome_a[market_id]
        + ". Outcome B: "
        + self.market_outcome_b[market_id]
        + ". Evidence: "
        + evidence
        + ". Return only A or B."
    )

    def run():

        return gl.nondet.exec_prompt(prompt)


    def validate_result(leader_result) -> bool:

        return isinstance(leader_result, gl.vm.Return) and len(str(leader_result.calldata).strip()) > 0


    result = gl.vm.run_nondet_unsafe(run, validate_result)

    assert result == "A" or result == "B", "AI must return A or B"

    self.market_winning_outcome[market_id] = result
    self.market_statuses[market_id] = "resolved"

    return result
Expected output
AI returns:

A
or:

B
Market status becomes:

resolved
Platform verification
{
  requiredMethods: ["resolve_with_ai"],
  requiredStrings: [
    "gl.nondet.exec_prompt",
    "Return only A or B",
    "AI must return A or B",
    "self.market_statuses[market_id] = \"resolved\""
  ]
}
Lesson 23 — Comparative Validation
What students learn
Students learn that AI output should not be blindly trusted. Validators need a way to compare whether answers are equivalent.

Student task
Update the prompt so it asks for a stricter format.

Instead of returning only A or B, the AI should return:

A|short reason
or:

B|short reason
Expected code change
prompt = (
    "You are resolving a prediction market. "
    + "Question: "
    + self.market_questions[market_id]
    + ". Outcome A: "
    + self.market_outcome_a[market_id]
    + ". Outcome B: "
    + self.market_outcome_b[market_id]
    + ". Evidence: "
    + evidence
    + ". Return exactly one line in this format: A|reason or B|reason."
)
Then:

def run():

    return gl.nondet.exec_prompt(prompt)


def validate_result(leader_result) -> bool:

    return isinstance(leader_result, gl.vm.Return) and len(str(leader_result.calldata).strip()) > 0


result = gl.vm.run_nondet_unsafe(run, validate_result)
parts = result.split("|")

assert len(parts) == 2, "AI result must contain outcome and reason"

winning_outcome = parts[0]
reason = parts[1]

assert winning_outcome == "A" or winning_outcome == "B", "AI must choose A or B"
Expected output
A|Evidence indicates outcome A happened.
Platform verification
{
  requiredStrings: [
    "A|reason or B|reason",
    "result.split(\"|\")",
    "AI result must contain outcome and reason",
    "AI must choose A or B"
  ]
}
Lesson 24 — Structured Resolution Output
What students learn
Students learn how to store and expose AI reasoning.

Student task
Add:

market_resolution_reason: TreeMap[str, str]
Store the AI reason.

Update get_market_json to include:

"winning_outcome"
"resolution_reason"
Expected code additions
market_resolution_reason: TreeMap[str, str]
Inside resolve_with_ai:

self.market_winning_outcome[market_id] = winning_outcome
self.market_resolution_reason[market_id] = reason
self.market_statuses[market_id] = "resolved"
Inside get_market_json:

"winning_outcome": self.market_winning_outcome[market_id] if market_id in self.market_winning_outcome else "",
"resolution_reason": self.market_resolution_reason[market_id] if market_id in self.market_resolution_reason else "",
Expected output
After AI resolution:

{
  "winning_outcome": "A",
  "resolution_reason": "Evidence indicates outcome A happened."
}
Platform verification
{
  requiredState: ["market_resolution_reason: TreeMap[str, str]"],
  requiredStrings: [
    "\"winning_outcome\"",
    "\"resolution_reason\"",
    "self.market_resolution_reason[market_id] = reason"
  ]
}
Lesson 25 — Major Upgrade: AI Market Resolver
What students learn
Students combine closed-market state, AI prompt execution, structured output, and resolution state.

Student task
Create a cleaner final version of resolve_with_ai.

Expected code
@gl.public.write
def resolve_with_ai(self, market_id: str, evidence: str) -> str:
    assert market_id in self.market_questions, "Market not found"
    assert self.market_statuses[market_id] == "closed", "Market must be closed before AI resolution"
    assert len(evidence) > 0, "Evidence cannot be empty"

    prompt = (
        "You are resolving a prediction market. "
        + "Question: "
        + self.market_questions[market_id]
        + ". Outcome A: "
        + self.market_outcome_a[market_id]
        + ". Outcome B: "
        + self.market_outcome_b[market_id]
        + ". Evidence: "
        + evidence
        + ". Return exactly one line in this format: A|reason or B|reason."
    )

    def run():

        return gl.nondet.exec_prompt(prompt)


    def validate_result(leader_result) -> bool:

        return isinstance(leader_result, gl.vm.Return) and len(str(leader_result.calldata).strip()) > 0


    result = gl.vm.run_nondet_unsafe(run, validate_result)
    parts = result.split("|")

    assert len(parts) == 2, "AI result must contain outcome and reason"

    winning_outcome = parts[0]
    reason = parts[1]

    assert winning_outcome == "A" or winning_outcome == "B", "AI must choose A or B"
    assert len(reason) > 0, "AI reason cannot be empty"

    self.market_winning_outcome[market_id] = winning_outcome
    self.market_resolution_reason[market_id] = reason
    self.market_statuses[market_id] = "resolved"

    return winning_outcome
Expected output
Market becomes:

resolved
AI result stored:

{
  "winning_outcome": "A",
  "resolution_reason": "..."
}
Platform verification
{
  majorUpgrade: true,
  requiredMethods: ["resolve_with_ai"],
  requiredStrings: [
    "gl.nondet.exec_prompt",
    "AI result must contain outcome and reason",
    "AI reason cannot be empty",
    "self.market_statuses[market_id] = \"resolved\""
  ]
}
Lesson 26 — Prediction Market Security Mistakes
What students learn
Students learn to prevent common errors: resolving twice, staking after close, claiming twice, and using empty evidence.

Student task
Add guard inside resolve_with_ai:

assert market_id not in self.market_winning_outcome, "Market already resolved"
Expected code addition
assert market_id not in self.market_winning_outcome, "Market already resolved"
Expected output
Trying to resolve again fails:

Market already resolved
Platform verification
{
  requiredStrings: ["Market already resolved"]
}
Lesson 27 — Frontend Integration for Markets
What students learn
Students learn which methods a frontend should call.

Student task
Add a method that exposes frontend actions as JSON.

Expected code
@gl.public.view
def get_frontend_actions_json(self) -> str:
    return json.dumps({
        "create": "create_market(question, outcome_a, outcome_b, min_stake)",
        "list": "get_active_markets_json()",
        "detail": "get_market_json(market_id)",
        "stake": "stake_on_outcome(market_id, outcome)",
        "close": "close_market(market_id)",
        "resolve": "resolve_with_ai(market_id, evidence)",
        "claim": "claim_winnings(market_id)",
    }, sort_keys=True)
Expected output
Returns JSON explaining frontend method mappings.

Platform verification
{
  requiredMethods: ["get_frontend_actions_json"],
  requiredStrings: [
    "\"create\"",
    "\"stake\"",
    "\"resolve\"",
    "\"claim\""
  ]
}
Lesson 28 — Testing the Market Flow
What students learn
Students learn to think like testers before shipping a contract.

Student task
Add a testing checklist method.

Expected code
@gl.public.view
def get_test_checklist_json(self) -> str:
    return json.dumps([
        "Create a market with valid outcomes",
        "Reject a market with duplicate outcomes",
        "Stake on outcome A",
        "Stake on outcome B",
        "Reject staking below minimum",
        "Close the market",
        "Resolve the market with AI evidence",
        "Allow winning users to claim",
        "Reject duplicate claims"
    ], sort_keys=True)
Expected output
Returns a JSON list of test steps.

Platform verification
{
  requiredMethods: ["get_test_checklist_json"],
  requiredStrings: [
    "Reject staking below minimum",
    "Resolve the market with AI evidence",
    "Reject duplicate claims"
  ]
}
Lesson 29 — Capstone Assembly
What students learn
Students assemble the final PredictX contract.

Student task
Make sure the contract includes all required components:

Identity
Market creation
Market listing
JSON views
Status transitions
Staking
User stake tracking
Manual resolution
AI resolution
Claim tracking
Frontend action mapping
Test checklist
Expected output
The platform does not need one specific method output. It checks that the final contract contains all expected modules.

Platform verification
{
  requiredMethods: [
    "get_platform_name",
    "get_platform_description",
    "get_owner",
    "create_market",
    "get_market_json",
    "get_active_markets_json",
    "get_all_markets_json",
    "close_market",
    "stake_on_outcome",
    "resolve_market_manually",
    "resolve_with_ai",
    "claim_winnings",
    "get_frontend_actions_json",
    "get_test_checklist_json"
  ],
  requiredState: [
    "market_questions: TreeMap[str, str]",
    "market_ids: DynArray[str]",
    "market_count: u256",
    "market_total_a: TreeMap[str, u256]",
    "market_total_b: TreeMap[str, u256]",
    "user_stakes_a: TreeMap[str, u256]",
    "user_stakes_b: TreeMap[str, u256]",
    "user_claimed: TreeMap[str, bool]"
  ]
}
Lesson 30 — Final Capstone: Ship PredictX
What students learn
Students finalize, explain, and prepare their contract for deployment.

Final PredictX contract
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from genlayer import *


class PredictX(gl.Contract):
    owner: Address
    platform_name: str
    platform_description: str

    market_questions: TreeMap[str, str]
    market_outcome_a: TreeMap[str, str]
    market_outcome_b: TreeMap[str, str]
    market_creators: TreeMap[str, Address]
    market_min_stakes: TreeMap[str, u256]
    market_statuses: TreeMap[str, str]
    market_ids: DynArray[str]
    market_count: u256

    market_total_a: TreeMap[str, u256]
    market_total_b: TreeMap[str, u256]
    user_stakes_a: TreeMap[str, u256]
    user_stakes_b: TreeMap[str, u256]

    market_winning_outcome: TreeMap[str, str]
    market_resolution_reason: TreeMap[str, str]
    user_claimed: TreeMap[str, bool]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "PredictX"
        self.platform_description = "A GenLayer prediction market that uses AI-assisted resolution."
        self.market_count = u256(0)

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
        assert gl.message.sender_address == self.owner, "Only owner can update description"
        assert len(new_description) > 0, "Description cannot be empty"
        self.platform_description = new_description

    @gl.public.write
    def create_market(self, question: str, outcome_a: str, outcome_b: str, min_stake: u256) -> str:
        assert len(question) > 0, "Question cannot be empty"
        assert len(outcome_a) > 0, "Outcome A cannot be empty"
        assert len(outcome_b) > 0, "Outcome B cannot be empty"
        assert outcome_a != outcome_b, "Outcomes must be different"
        assert min_stake > u256(0), "Minimum stake must be greater than zero"

        market_id = str(self.market_count)

        self.market_creators[market_id] = gl.message.sender_address
        self.market_questions[market_id] = question
        self.market_outcome_a[market_id] = outcome_a
        self.market_outcome_b[market_id] = outcome_b
        self.market_min_stakes[market_id] = min_stake
        self.market_statuses[market_id] = "active"

        self.market_ids.append(market_id)
        self.market_count += u256(1)

        return market_id

    @gl.public.view
    def get_market_json(self, market_id: str) -> str:
        assert market_id in self.market_questions, "Market not found"

        return json.dumps({
            "id": market_id,
            "creator": self.market_creators[market_id].as_hex,
            "question": self.market_questions[market_id],
            "outcome_a": self.market_outcome_a[market_id],
            "outcome_b": self.market_outcome_b[market_id],
            "min_stake": str(self.market_min_stakes[market_id]),
            "status": self.market_statuses[market_id],
            "winning_outcome": self.market_winning_outcome[market_id] if market_id in self.market_winning_outcome else "",
            "resolution_reason": self.market_resolution_reason[market_id] if market_id in self.market_resolution_reason else "",
        }, sort_keys=True)

    @gl.public.view
    def get_active_markets_json(self) -> str:
        result = []

        for market_id in self.market_ids:
            if self.market_statuses[market_id] == "active":
                result.append({
                    "id": market_id,
                    "creator": self.market_creators[market_id].as_hex,
                    "question": self.market_questions[market_id],
                    "outcome_a": self.market_outcome_a[market_id],
                    "outcome_b": self.market_outcome_b[market_id],
                    "min_stake": str(self.market_min_stakes[market_id]),
                    "status": self.market_statuses[market_id],
                })

        return json.dumps(result, sort_keys=True)

    @gl.public.view
    def get_all_markets_json(self) -> str:
        result = []

        for market_id in self.market_ids:
            result.append({
                "id": market_id,
                "creator": self.market_creators[market_id].as_hex,
                "question": self.market_questions[market_id],
                "outcome_a": self.market_outcome_a[market_id],
                "outcome_b": self.market_outcome_b[market_id],
                "min_stake": str(self.market_min_stakes[market_id]),
                "status": self.market_statuses[market_id],
            })

        return json.dumps(result, sort_keys=True)

    @gl.public.write
    def close_market(self, market_id: str) -> None:
        assert market_id in self.market_questions, "Market not found"

        caller = gl.message.sender_address
        creator = self.market_creators[market_id]

        assert caller == creator or caller == self.owner, "Only creator or owner can close market"
        assert self.market_statuses[market_id] == "active", "Only active markets can be closed"

        self.market_statuses[market_id] = "closed"

    @gl.public.write.payable
    def stake_on_outcome(self, market_id: str, outcome: str) -> None:
        assert market_id in self.market_questions, "Market not found"
        assert self.market_statuses[market_id] == "active", "Market is not active"
        assert gl.message.sender_address != self.market_creators[market_id], "Creator cannot stake on own market"
        assert gl.message.value >= self.market_min_stakes[market_id], "Stake is below minimum"

        if market_id not in self.market_total_a:
            self.market_total_a[market_id] = u256(0)

        if market_id not in self.market_total_b:
            self.market_total_b[market_id] = u256(0)

        stake_key = market_id + "_" + gl.message.sender_address.as_hex

        if outcome == "A":
            if stake_key not in self.user_stakes_a:
                self.user_stakes_a[stake_key] = u256(0)
            self.user_stakes_a[stake_key] += gl.message.value
            self.market_total_a[market_id] += gl.message.value
        elif outcome == "B":
            if stake_key not in self.user_stakes_b:
                self.user_stakes_b[stake_key] = u256(0)
            self.user_stakes_b[stake_key] += gl.message.value
            self.market_total_b[market_id] += gl.message.value
        else:
            assert False, "Invalid outcome"

    @gl.public.write
    def resolve_market_manually(self, market_id: str, winning_outcome: str) -> None:
        assert market_id in self.market_questions, "Market not found"
        assert gl.message.sender_address == self.owner, "Only owner can resolve manually"
        assert self.market_statuses[market_id] == "closed", "Market must be closed before resolution"
        assert winning_outcome == "A" or winning_outcome == "B", "Invalid winning outcome"

        self.market_winning_outcome[market_id] = winning_outcome
        self.market_resolution_reason[market_id] = "Resolved manually by owner."
        self.market_statuses[market_id] = "resolved"

    @gl.public.write
    def resolve_with_ai(self, market_id: str, evidence: str) -> str:
        assert market_id in self.market_questions, "Market not found"
        assert self.market_statuses[market_id] == "closed", "Market must be closed before AI resolution"
        assert market_id not in self.market_winning_outcome, "Market already resolved"
        assert len(evidence) > 0, "Evidence cannot be empty"

        prompt = (
            "You are resolving a prediction market. "
            + "Question: "
            + self.market_questions[market_id]
            + ". Outcome A: "
            + self.market_outcome_a[market_id]
            + ". Outcome B: "
            + self.market_outcome_b[market_id]
            + ". Evidence: "
            + evidence
            + ". Return exactly one line in this format: A|reason or B|reason."
        )

        def run():

            return gl.nondet.exec_prompt(prompt)


        def validate_result(leader_result) -> bool:

            return isinstance(leader_result, gl.vm.Return) and len(str(leader_result.calldata).strip()) > 0


        result = gl.vm.run_nondet_unsafe(run, validate_result)
        parts = result.split("|")

        assert len(parts) == 2, "AI result must contain outcome and reason"

        winning_outcome = parts[0]
        reason = parts[1]

        assert winning_outcome == "A" or winning_outcome == "B", "AI must choose A or B"
        assert len(reason) > 0, "AI reason cannot be empty"

        self.market_winning_outcome[market_id] = winning_outcome
        self.market_resolution_reason[market_id] = reason
        self.market_statuses[market_id] = "resolved"

        return winning_outcome

    @gl.public.write
    def claim_winnings(self, market_id: str) -> None:
        assert market_id in self.market_questions, "Market not found"
        assert self.market_statuses[market_id] == "resolved", "Market is not resolved"

        caller_hex = gl.message.sender_address.as_hex
        claim_key = market_id + "_" + caller_hex

        if claim_key in self.user_claimed:
            assert self.user_claimed[claim_key] == False, "Already claimed"

        winning_outcome = self.market_winning_outcome[market_id]

        if winning_outcome == "A":
            assert claim_key in self.user_stakes_a, "No winning stake found"
        elif winning_outcome == "B":
            assert claim_key in self.user_stakes_b, "No winning stake found"
        else:
            assert False, "Invalid resolved outcome"

        self.user_claimed[claim_key] = True

    @gl.public.view
    def get_frontend_actions_json(self) -> str:
        return json.dumps({
            "create": "create_market(question, outcome_a, outcome_b, min_stake)",
            "list": "get_active_markets_json()",
            "detail": "get_market_json(market_id)",
            "stake": "stake_on_outcome(market_id, outcome)",
            "close": "close_market(market_id)",
            "resolve": "resolve_with_ai(market_id, evidence)",
            "claim": "claim_winnings(market_id)",
        }, sort_keys=True)

    @gl.public.view
    def get_test_checklist_json(self) -> str:
        return json.dumps([
            "Create a market with valid outcomes",
            "Reject a market with duplicate outcomes",
            "Stake on outcome A",
            "Stake on outcome B",
            "Reject staking below minimum",
            "Close the market",
            "Resolve the market with AI evidence",
            "Allow winning users to claim",
            "Reject duplicate claims"
        ], sort_keys=True)
Final expected platform verification
{
  capstone: "PredictX",
  lesson: 30,
  finalCapstone: true,
  requiredClass: "PredictX",
  requiredImports: ["import json", "from genlayer import *"],
  requiredDecorators: [
    "@gl.public.view",
    "@gl.public.write",
    "@gl.public.write.payable"
  ],
  requiredMethods: [
    "get_platform_name",
    "get_platform_description",
    "get_owner",
    "get_contract_summary",
    "update_platform_description",
    "create_market",
    "get_market_json",
    "get_active_markets_json",
    "get_all_markets_json",
    "close_market",
    "stake_on_outcome",
    "resolve_market_manually",
    "resolve_with_ai",
    "claim_winnings",
    "get_frontend_actions_json",
    "get_test_checklist_json"
  ],
  requiredState: [
    "owner: Address",
    "market_questions: TreeMap[str, str]",
    "market_outcome_a: TreeMap[str, str]",
    "market_outcome_b: TreeMap[str, str]",
    "market_creators: TreeMap[str, Address]",
    "market_min_stakes: TreeMap[str, u256]",
    "market_statuses: TreeMap[str, str]",
    "market_ids: DynArray[str]",
    "market_count: u256",
    "market_total_a: TreeMap[str, u256]",
    "market_total_b: TreeMap[str, u256]",
    "user_stakes_a: TreeMap[str, u256]",
    "user_stakes_b: TreeMap[str, u256]",
    "market_winning_outcome: TreeMap[str, str]",
    "market_resolution_reason: TreeMap[str, str]",
    "user_claimed: TreeMap[str, bool]"
  ],
  requiredStrings: [
    "gl.message.sender_address",
    "gl.message.value",
    "json.dumps",
    "gl.nondet.exec_prompt",
    "Market already resolved",
    "Already claimed",
    "No winning stake found"
  ],
  expectedFlow: [
    "create_market returns 0",
    "get_market_json('0') includes status active",
    "stake_on_outcome rejects creator staking",
    "close_market changes status to closed",
    "resolve_with_ai changes status to resolved",
    "claim_winnings marks user_claimed true"
  ]
}
This is Track 1 fully broken down. The next batch should be Track 2: TrustLance, with the same 30-lesson depth: code, explanation, expected task, expected output, and platform checks.


Thought for 15s
Track 5: CaseWise — AI-Assisted Dispute Resolution System
Final project goal
Students are building CaseWise, a GenLayer dispute-resolution contract where:

1. A claimant submits a dispute case
2. The respondent is recorded
3. Parties can add evidence references
4. Cases have review fees
5. The contract tracks case status
6. AI can review claims and evidence
7. AI returns a structured ruling recommendation
8. The owner/arbitrator can finalize a ruling
9. Parties can appeal a ruling
10. Students understand cases, parties, evidence, fees, AI review, rulings, appeals, and safe dispute state machines
This track teaches a very strong GenLayer use case: subjective decision-making. Normal smart contracts are good at strict rules, but disputes often involve language, evidence, claims, explanations, and judgment. CaseWise teaches how GenLayer-style Intelligent Contracts can structure that process.

Lesson 1 — What You Are Building: AI Dispute Court
What students learn
Students learn what an AI-assisted dispute-resolution system is.

A dispute system needs:

claimant
respondent
case title
case description
evidence
review fee
case status
ruling
appeal flow
The AI does not magically replace the court or arbitrator. It helps review the claims and evidence, then produces a structured recommendation.

Starter code
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class CaseWise(gl.Contract):
    project_name: str

    def __init__(self) -> None:
        self.project_name = "CaseWise"

    @gl.public.view
    def get_project_name(self) -> str:
        return self.project_name
Student task
Change the project name to:

CaseWise: AI-Assisted Dispute Resolution
Expected final code
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class CaseWise(gl.Contract):
    project_name: str

    def __init__(self) -> None:
        self.project_name = "CaseWise: AI-Assisted Dispute Resolution"

    @gl.public.view
    def get_project_name(self) -> str:
        return self.project_name
Expected output
Calling:

get_project_name()
returns:

CaseWise: AI-Assisted Dispute Resolution
Platform verification
{
  capstone: "CaseWise",
  lesson: 1,
  requiredClass: "CaseWise",
  requiredDecorators: ["@gl.public.view"],
  requiredMethods: ["get_project_name"],
  requiredState: ["project_name: str"],
  requiredStrings: ["CaseWise: AI-Assisted Dispute Resolution"],
  forbiddenStrings: ["TODO", "Success", "Lesson X"]
}
Lesson 2 — CaseWise Contract Skeleton
What students learn
Students learn the basic contract skeleton for CaseWise:

dependency header
GenLayer import
contract class
persistent owner
constructor
court name
Starter code
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class CaseWise(gl.Contract):
    owner: Address
    court_name: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.court_name = "CaseWise"
Explanation
The owner is the deployer:

self.owner = gl.message.sender_address
In this track, the owner represents the first arbitrator/admin. Later, the owner can finalize rulings after AI review.

Student task
Add a persistent field:

court_rules: str
Initialize it with:

Parties submit cases and evidence for AI-assisted review.
Expected final code
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class CaseWise(gl.Contract):
    owner: Address
    court_name: str
    court_rules: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.court_name = "CaseWise"
        self.court_rules = "Parties submit cases and evidence for AI-assisted review."
Expected output
No callable output yet. The platform checks the state fields and constructor.

Platform verification
{
  capstone: "CaseWise",
  lesson: 2,
  requiredClass: "CaseWise",
  requiredState: [
    "owner: Address",
    "court_name: str",
    "court_rules: str"
  ],
  requiredStrings: [
    "self.owner = gl.message.sender_address",
    "Parties submit cases and evidence for AI-assisted review."
  ]
}
Lesson 3 — Court Info View
What students learn
Students learn how to expose court metadata with @gl.public.view.

The frontend needs to show:

court name
court rules
owner/arbitrator address
Starter code
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class CaseWise(gl.Contract):
    owner: Address
    court_name: str
    court_rules: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.court_name = "CaseWise"
        self.court_rules = "Parties submit cases and evidence for AI-assisted review."

    @gl.public.view
    def get_court_name(self) -> str:
        return self.court_name
Student task
Add two view methods:

get_court_rules()
get_owner()
get_owner() should return:

self.owner.as_hex
Expected final code
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class CaseWise(gl.Contract):
    owner: Address
    court_name: str
    court_rules: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.court_name = "CaseWise"
        self.court_rules = "Parties submit cases and evidence for AI-assisted review."

    @gl.public.view
    def get_court_name(self) -> str:
        return self.court_name

    @gl.public.view
    def get_court_rules(self) -> str:
        return self.court_rules

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner.as_hex
Expected output
get_court_name() → CaseWise
get_court_rules() → Parties submit cases and evidence for AI-assisted review.
get_owner() → 0x...
Platform verification
{
  capstone: "CaseWise",
  lesson: 3,
  requiredMethods: [
    "get_court_name",
    "get_court_rules",
    "get_owner"
  ],
  requiredDecorators: ["@gl.public.view"],
  requiredStrings: [
    "return self.court_name",
    "return self.court_rules",
    "return self.owner.as_hex"
  ]
}
Lesson 4 — Updating Court Rules
What students learn
Students learn how to update contract state using @gl.public.write.

They also learn that only the owner should be able to update the dispute court rules.

Starter code
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class CaseWise(gl.Contract):
    owner: Address
    court_name: str
    court_rules: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.court_name = "CaseWise"
        self.court_rules = "Parties submit cases and evidence for AI-assisted review."

    @gl.public.view
    def get_court_name(self) -> str:
        return self.court_name

    @gl.public.view
    def get_court_rules(self) -> str:
        return self.court_rules

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner.as_hex
Student task
Add:

update_court_rules(new_rules: str)
Rules:

Only owner can update rules.
Rules cannot be empty.
Expected final code
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class CaseWise(gl.Contract):
    owner: Address
    court_name: str
    court_rules: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.court_name = "CaseWise"
        self.court_rules = "Parties submit cases and evidence for AI-assisted review."

    @gl.public.view
    def get_court_name(self) -> str:
        return self.court_name

    @gl.public.view
    def get_court_rules(self) -> str:
        return self.court_rules

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner.as_hex

    @gl.public.write
    def update_court_rules(self, new_rules: str) -> None:
        assert gl.message.sender_address == self.owner, "Only owner can update rules"
        assert len(new_rules) > 0, "Rules cannot be empty"

        self.court_rules = new_rules
Expected output
After calling:

update_court_rules("Cases must include clear claims and evidence references.")
then:

get_court_rules()
returns:

Cases must include clear claims and evidence references.
Non-owner call fails with:

Only owner can update rules
Empty rules fail with:

Rules cannot be empty
Platform verification
{
  capstone: "CaseWise",
  lesson: 4,
  requiredMethods: ["update_court_rules"],
  requiredDecorators: ["@gl.public.write"],
  requiredStrings: [
    "assert gl.message.sender_address == self.owner",
    "Only owner can update rules",
    "Rules cannot be empty",
    "self.court_rules = new_rules"
  ]
}
Lesson 5 — Major Upgrade: Arbitration Platform Identity
What students learn
Students combine the first four lessons into a complete CaseWise identity contract.

They now know:

contract class
persistent owner
constructor
view methods
write methods
owner-only permissions
basic validation
Student task
Add:

get_contract_summary()
It should return the court name and rules together.

Expected final code
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class CaseWise(gl.Contract):
    owner: Address
    court_name: str
    court_rules: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.court_name = "CaseWise"
        self.court_rules = "Parties submit cases and evidence for AI-assisted review."

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
Expected output
get_contract_summary() → CaseWise: Parties submit cases and evidence for AI-assisted review.
Platform verification
{
  capstone: "CaseWise",
  lesson: 5,
  majorUpgrade: true,
  requiredClass: "CaseWise",
  requiredState: [
    "owner: Address",
    "court_name: str",
    "court_rules: str"
  ],
  requiredMethods: [
    "get_court_name",
    "get_court_rules",
    "get_owner",
    "get_contract_summary",
    "update_court_rules"
  ],
  requiredDecorators: [
    "@gl.public.view",
    "@gl.public.write"
  ],
  requiredStrings: [
    "self.owner = gl.message.sender_address",
    "self.owner.as_hex",
    "assert gl.message.sender_address == self.owner",
    "self.court_name + \": \" + self.court_rules"
  ],
  expectedViewOutputs: {
    get_court_name: "CaseWise",
    get_contract_summaryIncludes: ["CaseWise", "AI-assisted review"]
  }
}
Lesson 6 — Case Storage Fields
What students learn
Students learn how to model dispute cases using persistent maps.

A case needs:

title
claim description
claimant
respondent
status
Student task
Add:

case_titles: TreeMap[str, str]
case_claims: TreeMap[str, str]
case_claimants: TreeMap[str, Address]
case_respondents: TreeMap[str, Address]
case_statuses: TreeMap[str, str]
Expected code additions
case_titles: TreeMap[str, str]
case_claims: TreeMap[str, str]
case_claimants: TreeMap[str, Address]
case_respondents: TreeMap[str, Address]
case_statuses: TreeMap[str, str]
Expected output
No callable output yet. The platform checks persistent storage.

Platform verification
{
  capstone: "CaseWise",
  lesson: 6,
  requiredState: [
    "case_titles: TreeMap[str, str]",
    "case_claims: TreeMap[str, str]",
    "case_claimants: TreeMap[str, Address]",
    "case_respondents: TreeMap[str, Address]",
    "case_statuses: TreeMap[str, str]"
  ]
}
Lesson 7 — Party Address Tracking
What students learn
Students learn how to track the parties in a dispute.

The claimant is the caller who submits the case:

gl.message.sender_address
The respondent is passed as an Address.

Student task
Add a first version of:

submit_case(title: str, claim: str, respondent: Address) -> str
For now, use:

case_id = "0"
Store:

self.case_claimants[case_id] = gl.message.sender_address
self.case_respondents[case_id] = respondent
Expected code addition
@gl.public.write
def submit_case(self, title: str, claim: str, respondent: Address) -> str:
    case_id = "0"

    self.case_titles[case_id] = title
    self.case_claims[case_id] = claim
    self.case_claimants[case_id] = gl.message.sender_address
    self.case_respondents[case_id] = respondent
    self.case_statuses[case_id] = "submitted"

    return case_id
Expected output
Calling:

submit_case("Payment dispute", "The freelancer did not deliver the agreed work.", respondent)
returns:

0
Case status becomes:

submitted
Platform verification
{
  capstone: "CaseWise",
  lesson: 7,
  requiredMethods: ["submit_case"],
  requiredDecorators: ["@gl.public.write"],
  requiredStrings: [
    "case_id = \"0\"",
    "self.case_claimants[case_id] = gl.message.sender_address",
    "self.case_respondents[case_id] = respondent",
    "self.case_statuses[case_id] = \"submitted\"",
    "return case_id"
  ]
}
Lesson 8 — Case Fees with u256
What students learn
Students learn how to add dispute review fees.

A real dispute system may require a review fee or bond to reduce spam.

Student task
Add:

case_fees: TreeMap[str, u256]
Update submit_case to accept:

case_fee: u256
Validate:

assert case_fee > u256(0), "Case fee must be greater than zero"
Expected code additions
case_fees: TreeMap[str, u256]
Updated method:

@gl.public.write
def submit_case(self, title: str, claim: str, respondent: Address, case_fee: u256) -> str:
    assert case_fee > u256(0), "Case fee must be greater than zero"

    case_id = "0"

    self.case_titles[case_id] = title
    self.case_claims[case_id] = claim
    self.case_claimants[case_id] = gl.message.sender_address
    self.case_respondents[case_id] = respondent
    self.case_fees[case_id] = case_fee
    self.case_statuses[case_id] = "submitted"

    return case_id
Expected output
Valid case fee returns:

0
Zero fee fails with:

Case fee must be greater than zero
Platform verification
{
  capstone: "CaseWise",
  lesson: 8,
  requiredState: ["case_fees: TreeMap[str, u256]"],
  requiredStrings: [
    "case_fee: u256",
    "assert case_fee > u256(0)",
    "Case fee must be greater than zero",
    "self.case_fees[case_id] = case_fee"
  ]
}
Lesson 9 — Case Records with TreeMap
What students learn
Students learn validation for dispute case creation.

A case should not have:

empty title
empty claim
same claimant and respondent
zero fee
Student task
Add validation to submit_case.

Expected method
@gl.public.write
def submit_case(self, title: str, claim: str, respondent: Address, case_fee: u256) -> str:
    claimant = gl.message.sender_address

    assert len(title) > 0, "Title cannot be empty"
    assert len(claim) > 0, "Claim cannot be empty"
    assert claimant != respondent, "Claimant and respondent must be different"
    assert case_fee > u256(0), "Case fee must be greater than zero"

    case_id = "0"

    self.case_titles[case_id] = title
    self.case_claims[case_id] = claim
    self.case_claimants[case_id] = claimant
    self.case_respondents[case_id] = respondent
    self.case_fees[case_id] = case_fee
    self.case_statuses[case_id] = "submitted"

    return case_id
Expected output
Empty title fails with:

Title cannot be empty
Empty claim fails with:

Claim cannot be empty
Same claimant/respondent fails with:

Claimant and respondent must be different
Platform verification
{
  capstone: "CaseWise",
  lesson: 9,
  requiredStrings: [
    "Title cannot be empty",
    "Claim cannot be empty",
    "Claimant and respondent must be different",
    "Case fee must be greater than zero"
  ]
}
Lesson 10 — Major Upgrade: Submit Cases
What students learn
Students replace temporary case ID "0" with a real counter.

Student task
Add:

case_count: u256
Initialize:

self.case_count = u256(0)
Use:

case_id = str(self.case_count)
self.case_count += u256(1)
Expected final code after Lesson 10
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

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
    case_count: u256

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

        self.case_count += u256(1)

        return case_id
Expected output
First case returns:

0
Second case returns:

1
Platform verification
{
  capstone: "CaseWise",
  lesson: 10,
  majorUpgrade: true,
  requiredState: ["case_count: u256"],
  requiredMethods: ["submit_case"],
  requiredStrings: [
    "self.case_count = u256(0)",
    "case_id = str(self.case_count)",
    "self.case_count += u256(1)"
  ],
  expectedBehavior: [
    "first submit_case returns 0",
    "second submit_case returns 1"
  ]
}
Lesson 11 — Case Indexing with DynArray
What students learn
Students learn that the frontend needs an index of all case IDs.

Student task
Add:

case_ids: DynArray[str]
Inside submit_case, add:

self.case_ids.append(case_id)
Expected code additions
case_ids: DynArray[str]
Inside submit_case:

self.case_ids.append(case_id)
Expected output
After two cases, internal index holds:

["0", "1"]
Platform verification
{
  capstone: "CaseWise",
  lesson: 11,
  requiredState: ["case_ids: DynArray[str]"],
  requiredStrings: ["self.case_ids.append(case_id)"]
}
Lesson 12 — Case JSON View
What students learn
Students learn how to expose one dispute case as JSON.

Student task
Add:

import json
Create:

get_case_json(case_id: str) -> str
Expected code
import json
from genlayer import *
Method:

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
        "status": self.case_statuses[case_id],
    }, sort_keys=True)
Expected output
{
  "id": "0",
  "title": "Payment dispute",
  "claim": "The freelancer did not deliver.",
  "claimant": "0x...",
  "respondent": "0x...",
  "case_fee": "100",
  "status": "submitted"
}
Platform verification
{
  capstone: "CaseWise",
  lesson: 12,
  requiredImports: ["import json"],
  requiredMethods: ["get_case_json"],
  requiredStrings: [
    "json.dumps",
    "Case not found",
    "\"claimant\"",
    "\"respondent\"",
    "\"case_fee\"",
    "\"status\""
  ]
}
Lesson 13 — Listing Open Cases
What students learn
Students learn how to loop through case IDs and return cases that are not closed.

Student task
Add:

get_open_cases_json()
Return cases with status:

submitted
reviewing
ruled
appealed
Do not include:

closed
cancelled
Expected code
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
Expected output
Returns a JSON array of active/open cases.

Platform verification
{
  capstone: "CaseWise",
  lesson: 13,
  requiredMethods: ["get_open_cases_json"],
  requiredStrings: [
    "for case_id in self.case_ids",
    "status != \"closed\"",
    "status != \"cancelled\"",
    "result.append",
    "json.dumps(result"
  ]
}
Lesson 14 — Case Status Flow
What students learn
Students learn the CaseWise status machine:

submitted → reviewing → ruled → closed
submitted → cancelled
ruled → appealed
appealed → closed
This lesson adds cancellation.

Student task
Add:

cancel_case(case_id: str)
Rules:

Case must exist.
Only claimant can cancel.
Only submitted cases can be cancelled.
Status becomes cancelled.
Expected code
@gl.public.write
def cancel_case(self, case_id: str) -> None:
    assert case_id in self.case_titles, "Case not found"

    caller = gl.message.sender_address
    claimant = self.case_claimants[case_id]

    assert caller == claimant, "Only claimant can cancel case"
    assert self.case_statuses[case_id] == "submitted", "Only submitted cases can be cancelled"

    self.case_statuses[case_id] = "cancelled"
Expected output
Before:

submitted
After:

cancelled
Wrong caller fails with:

Only claimant can cancel case
Platform verification
{
  capstone: "CaseWise",
  lesson: 14,
  requiredMethods: ["cancel_case"],
  requiredStrings: [
    "Only claimant can cancel case",
    "Only submitted cases can be cancelled",
    "self.case_statuses[case_id] = \"cancelled\""
  ]
}
Lesson 15 — Major Upgrade: Browseable Case Dashboard
What students learn
Students combine:

case submission
case indexing
case JSON view
open case list
case cancellation
status filtering
Student task
Add:

get_all_cases_json()
It returns all cases regardless of status.

Expected code
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
Expected output
Returns cases with statuses like:

submitted
cancelled
reviewing
ruled
appealed
closed
Platform verification
{
  capstone: "CaseWise",
  lesson: 15,
  majorUpgrade: true,
  requiredMethods: [
    "submit_case",
    "get_case_json",
    "get_open_cases_json",
    "get_all_cases_json",
    "cancel_case"
  ],
  requiredState: [
    "case_ids: DynArray[str]",
    "case_count: u256"
  ],
  requiredStrings: [
    "json.dumps",
    "\"submitted\"",
    "\"cancelled\""
  ]
}
Lesson 16 — Paying Review Fees
What students learn
Students learn how to accept a payable review fee.

A submitted case becomes reviewing only after the claimant pays the fee.

Student task
Add:

case_paid_amounts: TreeMap[str, u256]
Add:

pay_case_fee(case_id: str)
Rules:

Case must exist.
Only claimant can pay.
Case must be submitted.
Payment must be at least required case fee.
Status becomes reviewing.
Expected code additions
case_paid_amounts: TreeMap[str, u256]
Method:

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
Expected output
After payment:

status = reviewing
Low payment fails with:

Payment is below case fee
Platform verification
{
  capstone: "CaseWise",
  lesson: 16,
  requiredDecorators: ["@gl.public.write.payable"],
  requiredMethods: ["pay_case_fee"],
  requiredState: ["case_paid_amounts: TreeMap[str, u256]"],
  requiredStrings: [
    "gl.message.value",
    "Only claimant can pay case fee",
    "Only submitted cases can be paid",
    "Payment is below case fee",
    "self.case_statuses[case_id] = \"reviewing\""
  ]
}
Lesson 17 — Adding Evidence
What students learn
Students learn that a dispute contract should not store large files directly.

It should store evidence references such as:

IPFS CID
document hash
URL reference
encrypted file pointer
transaction hash
Student task
Add:

case_claimant_evidence: TreeMap[str, str]
case_respondent_evidence: TreeMap[str, str]
Add:

add_evidence(case_id: str, evidence_ref: str)
Rules:

Case must exist.
Evidence reference cannot be empty.
Only claimant or respondent can add evidence.
Case must be reviewing.
Store evidence under claimant or respondent depending on caller.
Expected code additions
case_claimant_evidence: TreeMap[str, str]
case_respondent_evidence: TreeMap[str, str]
Method:

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
Expected output
Claimant evidence is stored when claimant calls.

Respondent evidence is stored when respondent calls.

Wrong caller fails with:

Only case parties can add evidence
Platform verification
{
  capstone: "CaseWise",
  lesson: 17,
  requiredState: [
    "case_claimant_evidence: TreeMap[str, str]",
    "case_respondent_evidence: TreeMap[str, str]"
  ],
  requiredMethods: ["add_evidence"],
  requiredStrings: [
    "Evidence reference cannot be empty",
    "Case must be reviewing to add evidence",
    "Only case parties can add evidence",
    "self.case_claimant_evidence[case_id] = evidence_ref",
    "self.case_respondent_evidence[case_id] = evidence_ref"
  ]
}
Lesson 18 — Evidence and Party Rules
What students learn
Students learn to expose evidence safely in JSON and make sure the frontend can show both sides.

Student task
Update get_case_json to include:

paid_amount
claimant_evidence
respondent_evidence
Expected updated get_case_json
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
        "status": self.case_statuses[case_id],
    }, sort_keys=True)
Expected output
After evidence is added:

{
  "paid_amount": "100",
  "claimant_evidence": "ipfs://claimant-evidence",
  "respondent_evidence": "ipfs://respondent-evidence",
  "status": "reviewing"
}
Platform verification
{
  capstone: "CaseWise",
  lesson: 18,
  requiredStrings: [
    "\"paid_amount\"",
    "\"claimant_evidence\"",
    "\"respondent_evidence\"",
    "case_id in self.case_paid_amounts",
    "case_id in self.case_claimant_evidence",
    "case_id in self.case_respondent_evidence"
  ]
}
Lesson 19 — Ruling and Refund Patterns
What students learn
Students learn how to record a manual ruling and close a case.

This lesson does not use AI yet. It teaches deterministic ruling logic first.

Student task
Add:

case_rulings: TreeMap[str, str]
case_ruling_reasons: TreeMap[str, str]
Add:

rule_case_manually(case_id: str, ruling: str, reason: str)
Rules:

Only owner can rule manually.
Case must be reviewing.
Ruling must be CLAIMANT_WINS or RESPONDENT_WINS or SPLIT.
Reason cannot be empty.
Status becomes ruled.
Expected code additions
case_rulings: TreeMap[str, str]
case_ruling_reasons: TreeMap[str, str]
Method:

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
Expected output
After manual ruling:

{
  "status": "ruled",
  "ruling": "CLAIMANT_WINS",
  "ruling_reason": "Evidence supports the claimant."
}
Platform verification
{
  capstone: "CaseWise",
  lesson: 19,
  requiredState: [
    "case_rulings: TreeMap[str, str]",
    "case_ruling_reasons: TreeMap[str, str]"
  ],
  requiredMethods: ["rule_case_manually"],
  requiredStrings: [
    "Only owner can rule cases",
    "Case must be reviewing before ruling",
    "CLAIMANT_WINS",
    "RESPONDENT_WINS",
    "SPLIT",
    "Invalid ruling",
    "Ruling reason cannot be empty",
    "self.case_statuses[case_id] = \"ruled\""
  ]
}
Lesson 20 — Major Upgrade: Paid Dispute Flow
What students learn
Students combine:

case submission
case fee payment
evidence submission
manual ruling
case JSON
status flow
Student task
Update get_case_json to include:

ruling
ruling_reason
Expected updated JSON fields
Add inside get_case_json:

"ruling": self.case_rulings[case_id] if case_id in self.case_rulings else "",
"ruling_reason": self.case_ruling_reasons[case_id] if case_id in self.case_ruling_reasons else "",
Expected output
After manual ruling:

{
  "status": "ruled",
  "ruling": "CLAIMANT_WINS",
  "ruling_reason": "Evidence supports the claimant."
}
Platform verification
{
  capstone: "CaseWise",
  lesson: 20,
  majorUpgrade: true,
  requiredMethods: [
    "pay_case_fee",
    "add_evidence",
    "rule_case_manually",
    "get_case_json"
  ],
  requiredStrings: [
    "\"paid_amount\"",
    "\"claimant_evidence\"",
    "\"respondent_evidence\"",
    "\"ruling\"",
    "\"ruling_reason\"",
    "\"reviewing\"",
    "\"ruled\""
  ],
  expectedFlow: [
    "submit_case returns 0",
    "pay_case_fee changes status to reviewing",
    "add_evidence stores claimant or respondent evidence",
    "rule_case_manually changes status to ruled",
    "get_case_json includes ruling and ruling_reason"
  ]
}
Lesson 21 — AI Evidence Review Basics
What students learn
Students learn how AI can assist case review.

The AI will receive:

case title
claim
claimant evidence
respondent evidence
It should produce a structured ruling recommendation.

This lesson only builds the prompt.

Student task
Add:

get_case_review_prompt(case_id: str) -> str
Expected code
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
Expected output
Returns a prompt string containing:

title
claim
claimant evidence
respondent evidence
ruling instruction
Platform verification
{
  capstone: "CaseWise",
  lesson: 21,
  requiredMethods: ["get_case_review_prompt"],
  requiredStrings: [
    "Review this dispute case",
    "Claimant evidence:",
    "Respondent evidence:",
    "Recommend a ruling"
  ]
}
Lesson 22 — AI Case Review
What students learn
Students learn how to call AI with:

gl.nondet.exec_prompt(prompt)
Student task
Add:

review_case_with_ai(case_id: str) -> str
The AI should return one of:

CLAIMANT_WINS
RESPONDENT_WINS
SPLIT
NEEDS_MORE_INFO
Expected code
@gl.public.write
def review_case_with_ai(self, case_id: str) -> str:
    assert case_id in self.case_titles, "Case not found"
    assert self.case_statuses[case_id] == "reviewing", "Case must be reviewing before AI review"

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
        + ". Return only CLAIMANT_WINS, RESPONDENT_WINS, SPLIT, or NEEDS_MORE_INFO."
    )

    def run():

        return gl.nondet.exec_prompt(prompt)


    def validate_result(leader_result) -> bool:

        return isinstance(leader_result, gl.vm.Return) and len(str(leader_result.calldata).strip()) > 0


    result = gl.vm.run_nondet_unsafe(run, validate_result)

    assert (
        result == "CLAIMANT_WINS"
        or result == "RESPONDENT_WINS"
        or result == "SPLIT"
        or result == "NEEDS_MORE_INFO"
    ), "Invalid AI case result"

    return result
Expected output
AI returns:

CLAIMANT_WINS
or one of the allowed values.

Invalid output fails with:

Invalid AI case result
Platform verification
{
  capstone: "CaseWise",
  lesson: 22,
  requiredMethods: ["review_case_with_ai"],
  requiredStrings: [
    "gl.nondet.exec_prompt",
    "CLAIMANT_WINS",
    "RESPONDENT_WINS",
    "SPLIT",
    "NEEDS_MORE_INFO",
    "Invalid AI case result"
  ]
}
Lesson 23 — Comparative Validation for Rulings
What students learn
Students learn structured AI output.

Instead of one word, AI should return:

RULING|confidence|reason
Example:

CLAIMANT_WINS|HIGH|The claimant evidence strongly supports the claim.
Student task
Update AI review to split output with:

parts = result.split("|")
Expected code pattern
def run():
    return gl.nondet.exec_prompt(prompt)

def validate_result(leader_result) -> bool:
    return isinstance(leader_result, gl.vm.Return) and len(str(leader_result.calldata).strip()) > 0

result = gl.vm.run_nondet_unsafe(run, validate_result)
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
Expected output
CLAIMANT_WINS|HIGH|The claimant evidence supports the claim.
Platform verification
{
  capstone: "CaseWise",
  lesson: 23,
  requiredStrings: [
    "result.split(\"|\")",
    "AI result must contain ruling, confidence, and reason",
    "Invalid AI ruling",
    "Invalid AI confidence",
    "AI reason cannot be empty"
  ]
}
Lesson 24 — Structured Ruling Output
What students learn
Students learn how to store AI review results.

Student task
Add:

case_ai_rulings: TreeMap[str, str]
case_ai_confidences: TreeMap[str, str]
case_ai_reasons: TreeMap[str, str]
Store AI result inside review_case_with_ai.

Update get_case_json to include:

ai_ruling
ai_confidence
ai_reason
has_ai_review
Expected code additions
case_ai_rulings: TreeMap[str, str]
case_ai_confidences: TreeMap[str, str]
case_ai_reasons: TreeMap[str, str]
Inside AI review:

self.case_ai_rulings[case_id] = ruling
self.case_ai_confidences[case_id] = confidence
self.case_ai_reasons[case_id] = reason
Inside get_case_json:

"ai_ruling": self.case_ai_rulings[case_id] if case_id in self.case_ai_rulings else "",
"ai_confidence": self.case_ai_confidences[case_id] if case_id in self.case_ai_confidences else "",
"ai_reason": self.case_ai_reasons[case_id] if case_id in self.case_ai_reasons else "",
"has_ai_review": case_id in self.case_ai_rulings,
Expected output
After AI review:

{
  "ai_ruling": "CLAIMANT_WINS",
  "ai_confidence": "HIGH",
  "ai_reason": "The claimant evidence supports the claim.",
  "has_ai_review": true
}
Platform verification
{
  capstone: "CaseWise",
  lesson: 24,
  requiredState: [
    "case_ai_rulings: TreeMap[str, str]",
    "case_ai_confidences: TreeMap[str, str]",
    "case_ai_reasons: TreeMap[str, str]"
  ],
  requiredStrings: [
    "self.case_ai_rulings[case_id] = ruling",
    "self.case_ai_confidences[case_id] = confidence",
    "self.case_ai_reasons[case_id] = reason",
    "\"ai_ruling\"",
    "\"ai_confidence\"",
    "\"ai_reason\"",
    "\"has_ai_review\""
  ]
}
Lesson 25 — Major Upgrade: AI Arbitration Engine
What students learn
Students combine:

case state
party evidence
AI review
structured ruling
confidence
reason storage
This makes CaseWise a true Intelligent Contract.

Student task
Create the final version of:

review_case_with_ai(case_id: str) -> str
Expected code
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


    result = gl.vm.run_nondet_unsafe(run, validate_result)
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
Expected output
Stores:

{
  "ai_ruling": "CLAIMANT_WINS",
  "ai_confidence": "HIGH",
  "ai_reason": "..."
}
Trying again fails with:

Case already reviewed by AI
Platform verification
{
  capstone: "CaseWise",
  lesson: 25,
  majorUpgrade: true,
  requiredMethods: ["review_case_with_ai"],
  requiredStrings: [
    "gl.nondet.exec_prompt",
    "Case already reviewed by AI",
    "AI result must contain ruling, confidence, and reason",
    "Invalid AI ruling",
    "Invalid AI confidence",
    "AI reason cannot be empty"
  ]
}
Lesson 26 — Dispute System Safety Mistakes
What students learn
Students learn the biggest dispute-system mistakes:

ruling before fees are paid
letting non-parties add evidence
allowing empty evidence
letting AI review the same case repeatedly
finalizing a case without reviewing evidence
treating AI recommendation as automatic enforcement
AI should assist the arbitrator, not silently finalize the case.

Student task
Add:

get_dispute_rules_json()
Expected code
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
Expected output
Returns JSON array of dispute safety rules.

Platform verification
{
  capstone: "CaseWise",
  lesson: 26,
  requiredMethods: ["get_dispute_rules_json"],
  requiredStrings: [
    "Only case parties can add evidence",
    "AI review does not automatically close the case",
    "Only the owner/arbitrator can finalize a ruling",
    "Appeals can only happen after a ruling"
  ]
}
Lesson 27 — Appeal Logic
What students learn
Students learn how appeals extend a dispute system.

Appeals should only happen after a case is ruled.

Student task
Add:

case_appeal_reasons: TreeMap[str, str]
Add:

appeal_case(case_id: str, appeal_reason: str)
Rules:

Case must exist.
Only claimant or respondent can appeal.
Case must be ruled.
Appeal reason cannot be empty.
Status becomes appealed.
Expected code additions
case_appeal_reasons: TreeMap[str, str]
Method:

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
Expected output
After appeal:

{
  "status": "appealed",
  "appeal_reason": "The ruling ignored my submitted evidence."
}
Wrong caller fails with:

Only case parties can appeal
Platform verification
{
  capstone: "CaseWise",
  lesson: 27,
  requiredState: ["case_appeal_reasons: TreeMap[str, str]"],
  requiredMethods: ["appeal_case"],
  requiredStrings: [
    "Only ruled cases can be appealed",
    "Appeal reason cannot be empty",
    "Only case parties can appeal",
    "self.case_statuses[case_id] = \"appealed\""
  ]
}
Lesson 28 — Testing CaseWise
What students learn
Students learn how to test the full dispute lifecycle.

Student task
Add:

get_test_checklist_json()
Expected code
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
Expected output
Returns a JSON checklist of test steps.

Platform verification
{
  capstone: "CaseWise",
  lesson: 28,
  requiredMethods: ["get_test_checklist_json"],
  requiredStrings: [
    "Reject a case with an empty claim",
    "Reject fee payment from non-claimant",
    "Reject evidence from a non-party",
    "Verify AI ruling, confidence, and reason are stored",
    "Reject appeal from non-party"
  ]
}
Lesson 29 — Capstone Assembly
What students learn
Students assemble the full CaseWise contract.

They verify that all modules exist:

identity
case submission
case indexing
case JSON
open/all case views
case fee payment
evidence submission
manual ruling
AI review
appeal logic
dispute rules
test checklist
Platform verification
{
  capstone: "CaseWise",
  lesson: 29,
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
  ]
}
Lesson 30 — Final Capstone: Ship CaseWise
What students learn
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
how frontend reads case state
Final CaseWise contract
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

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


        result = gl.vm.run_nondet_unsafe(run, validate_result)
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
This checks the student’s code text.

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
    "self.escrow_statuses[escrow_id] = \"locked\""
  ],
  forbiddenStrings: [
    "escrow_id = listing_id + \"_\"",
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
    mustContain: "self.listing_statuses[listing_id] = \"pending\""
  },
  {
    label: "Escrow becomes locked after buy",
    mustContain: "self.escrow_statuses[escrow_id] = \"locked\""
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
    "Set self.escrow_statuses[escrow_id] = \"locked\" inside buy()"
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
def run():
    return gl.nondet.exec_prompt(prompt)

def validate_result(leader_result) -> bool:
    return isinstance(leader_result, gl.vm.Return) and len(str(leader_result.calldata).strip()) > 0

result = gl.vm.run_nondet_unsafe(run, validate_result)
Explanation: Asks AI to evaluate text or evidence.

GenLayer is designed around AI-powered Intelligent Contracts that can reason about subjective decisions and real-world context. 

26. Structured AI output
def run():
    return gl.nondet.exec_prompt(prompt)

def validate_result(leader_result) -> bool:
    return isinstance(leader_result, gl.vm.Return) and len(str(leader_result.calldata).strip()) > 0

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
  snippet: `@gl.public.view
def get_name(self) -> str:
    return self.name`,
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
Yes, exactly. MATLAB-style checking is usually based on tests behind the scenes, not just “does the code contain this word?”

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
    "self.escrow_statuses[escrow_id] = \"locked\""
  ],
  forbiddenStrings: [
    "gl.transfer",
    "escrow_id = listing_id + \"_\""
  ]
}
This is useful, but not enough. A student can include the right words and still write broken logic.

Layer 2 — Behavioral tests, the MATLAB-style part
This is where the platform tests the student’s code like a real assignment.

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
That is the real “you did the right thing” checker.

Layer 3 — Optional real GenLayer RPC check
This is for advanced/local users.

Since cloud deployment cannot reach a user’s local GenLayer Studio at:

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
      "self.escrow_statuses[escrow_id] = \"locked\"",
      "self.listing_statuses[listing_id] = \"pending\""
    ],
    forbiddenStrings: [
      "gl.transfer",
      "escrow_id = listing_id + \"_\""
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
      expected: "\"status\": \"locked\""
    },
    {
      id: "listing-becomes-pending",
      title: "Listing becomes pending after purchase",
      action: "get_listing_json('0')",
      expected: "\"status\": \"pending\""
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
  mustContain: "self.escrow_statuses[escrow_id] = \"locked\""
}
This is easier, safer, and good for the first version.

But it is not perfect.

A student can fake patterns.

Option B — Better: sandboxed execution
This is closer to MATLAB.

You run the student’s code in a safe backend sandbox with mocked GenLayer objects.

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

