export type BasicLessonType = "faucet" | "deploy-read" | "deploy-write" | "read";

export interface BasicLesson {
  id: number;
  title: string;
  subtitle: string;
  type: BasicLessonType;
  explanation: string;
  codeExample?: string;
}

export const HELLO_CONTRACT = `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *


class HelloGenLayer(gl.Contract):
    greeting: str

    def __init__(self) -> None:
        self.greeting = "Hello, GenLayer!"

    @gl.public.view
    def get_greeting(self) -> str:
        return self.greeting`;

export const WRITE_CONTRACT = `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *


class HelloGenLayer(gl.Contract):
    greeting: str

    def __init__(self) -> None:
        self.greeting = "Hello, GenLayer!"

    @gl.public.view
    def get_greeting(self) -> str:
        return self.greeting

    @gl.public.write
    def set_greeting(self, new_greeting: str) -> None:
        self.greeting = new_greeting`;

export const BASICS_LESSONS: BasicLesson[] = [
  {
    id: 1,
    title: "Fund Your Wallet",
    subtitle: "Get testnet GEN tokens to pay for transactions",
    type: "faucet",
    explanation: `## Why You Need GEN

Every transaction on GenLayer — deploying a contract, calling a write method — requires a small amount of **GEN** tokens to cover network fees.

You are on **Studionet**, GenLayer's hosted test network. GEN tokens here are free and have no real-world value. Use the faucet to get as many as you need.

Your wallet balance is shown below. Click **Get GEN** to receive tokens instantly. Once you receive them, your task is complete.`,
  },
  {
    id: 2,
    title: "What is GenLayer?",
    subtitle: "The blockchain where smart contracts can think",
    type: "read",
    explanation: `## GenLayer in One Sentence

GenLayer is a blockchain where smart contracts can call AI models as part of their on-chain logic — natively, in a trustless way.

## Traditional vs. Intelligent Contracts

Traditional smart contracts are purely deterministic. They can only work with exact numeric inputs and produce exact outputs. They cannot reason about text, evaluate open-ended questions, or access the web.

**GenLayer Intelligent Contracts** remove that limitation. A contract can:

- Ask an AI: *"Does this delivery description count as completed?"*
- Resolve a prediction market: *"Did the stated event occur based on news sources?"*
- Evaluate code quality: *"Is this submission production-ready?"*

The AI result is verified by GenLayer's validator network before any state change occurs, making AI calls as trustless as any other on-chain operation.

## Written in Python

GenLayer contracts are Python classes using a library called \`genlayer\` that provides storage types, AI calls, and the validator protocol. If you know Python, you can write intelligent contracts.`,
  },
  {
    id: 3,
    title: "Your First Read Contract",
    subtitle: "Deploy a contract and call a view method",
    type: "deploy-read",
    explanation: `## Every Contract Is a Python Class

GenLayer contracts extend \`gl.Contract\`. Fields declared at class level become **persistent on-chain storage** — they survive across transactions and can be read by anyone.

\`\`\`python
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *


class HelloGenLayer(gl.Contract):
    greeting: str

    def __init__(self) -> None:
        self.greeting = "Hello, GenLayer!"

    @gl.public.view
    def get_greeting(self) -> str:
        return self.greeting
\`\`\`

**Line by line:**

- **Line 1** — The dependency header. Pins the exact GenLayer runtime version this contract needs.
- **Line 2** — Imports the \`genlayer\` library, bringing \`gl\` and all GenVM types into scope.
- **Line 5** — Your contract class. \`gl.Contract\` provides the on-chain storage engine.
- **Line 6** — \`greeting: str\` declares a string stored on the blockchain permanently.
- **Line 8–9** — \`__init__\` runs once at deploy time. Sets the initial value.
- **Line 11–13** — \`@gl.public.view\` marks a read-only method. No gas, no state change.

**Your task:** Deploy this contract, then call \`get_greeting()\` to see your greeting returned from the chain.`,
  },
  {
    id: 4,
    title: "Your First Write Contract",
    subtitle: "Modify on-chain state with a write method",
    type: "deploy-write",
    explanation: `## Write Methods Change State

A \`@gl.public.write\` method is the opposite of a view method:

- It **costs gas** (a small transaction fee in GEN)
- It **changes on-chain state** permanently
- It requires a **wallet signature** to authorize

\`\`\`python
    @gl.public.write
    def set_greeting(self, new_greeting: str) -> None:
        self.greeting = new_greeting
\`\`\`

This method takes a string, assigns it to \`self.greeting\`, and the new value is committed to the blockchain. Any subsequent call to \`get_greeting()\` returns the updated value.

## The Write → Wait → Read Pattern

Because writes are asynchronous transactions, the typical flow is:

1. Call the write method → get a transaction hash
2. Wait for the transaction receipt (GenLayer handles validator consensus)
3. Call a view method to confirm the state changed

**Your task:** Deploy the contract, call \`set_greeting\` with your own message, then verify with \`get_greeting\`.`,
    codeExample: WRITE_CONTRACT,
  },
  {
    id: 5,
    title: "@gl.public.view",
    subtitle: "Read-only methods: free to call, cannot change state",
    type: "read",
    explanation: `## What @gl.public.view Does

The \`@gl.public.view\` decorator does three things:

1. **Makes the method callable** by anyone without sending a transaction
2. **Forbids state mutation** — writing to \`self.anything\` inside a view method raises an error at runtime
3. **Costs no gas** — reading is free

\`\`\`python
@gl.public.view
def get_count(self) -> u256:
    return self.count

@gl.public.view
def is_resolved(self) -> bool:
    return self.resolved

@gl.public.view
def get_winner(self) -> str:
    return self.winner
\`\`\`

## Return Types

View methods can return any GenVM-compatible type: \`str\`, \`bool\`, \`u256\`, \`i64\`, \`u32\`, and more. Complex types like \`TreeMap\` and \`DynArray\` are serialized automatically.

## When to Use It

Use \`@gl.public.view\` for any method that only **reads** data — getters, status checks, balance queries, summary functions. Good view methods have clear names: \`get_\`, \`is_\`, \`has_\`, \`total_\`.

If the method does not need to change anything, make it a view. Writing unnecessary transactions wastes gas.`,
  },
  {
    id: 6,
    title: "@gl.public.write",
    subtitle: "Methods that change state require a transaction",
    type: "read",
    explanation: `## What @gl.public.write Does

The \`@gl.public.write\` decorator marks a method that **changes on-chain state**. Unlike view methods, write methods:

- Require a **wallet signature** (the caller pays gas)
- Return a **transaction hash**, not the method's Python return value directly
- Only take effect after the transaction is **finalized** by validators

\`\`\`python
@gl.public.write
def place_bet(self, prediction: str) -> None:
    self.bets.append(prediction)

@gl.public.write
def resolve(self, outcome: str) -> None:
    self.outcome = outcome
    self.resolved = True
\`\`\`

## The Write → Wait → Read Pattern

Because writes are asynchronous, you always:

1. Call the write method → receive a transaction hash
2. Wait for the receipt (GenLayer validator consensus)
3. Call a view method to confirm the state changed

Every write transaction in your project will follow this pattern.

## Return Values from Write Methods

Write methods can return values in Python, but you cannot read them synchronously from outside the contract. If you need to expose computed results, store them in a state variable and read with a view method.`,
  },
  {
    id: 7,
    title: "State Variables",
    subtitle: "Persistent storage types built into GenLayer",
    type: "read",
    explanation: `## On-Chain Storage

Any field declared at class level in a \`gl.Contract\` is stored on the blockchain permanently. It persists across every transaction.

\`\`\`python
class MyContract(gl.Contract):
    name: str       # text
    total: u256     # unsigned integer, 0 to 2^256-1
    balance: i64    # signed integer
    active: bool    # true / false
    score: u32      # 32-bit unsigned integer
\`\`\`

## Choosing the Right Type

| Type | Range | Use for |
|------|-------|---------|
| \`str\` | any text | names, descriptions, outcomes |
| \`u256\` | 0 to 2²⁵⁶−1 | token amounts, large IDs |
| \`u32\` / \`u64\` | smaller unsigned ints | counts, indices |
| \`i64\` | signed range | signed values |
| \`bool\` | true / false | flags, resolved status |

## Do Not Use Bare Python int

Always use GenVM type annotations for stored fields. A bare Python \`int\` is fine inside a function body for intermediate calculations, but class-level fields need GenVM types.

\`\`\`python
# Correct
amount: u256

# Wrong — do not use bare Python int as a class-level field annotation
amount: int
\`\`\``,
  },
  {
    id: 8,
    title: "The Constructor",
    subtitle: "Setting initial state when the contract is deployed",
    type: "read",
    explanation: `## __init__ Runs Once

The \`__init__\` method runs exactly once — at the moment the contract is deployed. It sets the initial values of all state variables.

\`\`\`python
class PredictionMarket(gl.Contract):
    question: str
    resolved: bool
    winner: str

    def __init__(self, question: str) -> None:
        self.question = question
        self.resolved = False
        self.winner = ""
\`\`\`

## Passing Arguments at Deploy Time

\`__init__\` can accept arguments. These are passed in the \`args\` array when deploying:

\`\`\`python
client.deployContract({
    code: contractCode,
    args: ["Will ETH exceed $10k by end of 2025?"]
})
\`\`\`

The argument maps to \`question: str\` in \`__init__\`. Every deployed instance of this contract can have a different question.

## Always Initialize Every Field

Everything assigned to \`self\` in \`__init__\` becomes on-chain storage. If you forget to initialize a variable, it will have an undefined default. Always initialize every field declared at class level — even if the initial value is \`""\`, \`False\`, or \`0\`.`,
  },
  {
    id: 9,
    title: "The Dependency Header",
    subtitle: "Pinning your contract to a specific GenLayer runtime",
    type: "read",
    explanation: `## What Is the Dependency Header?

Every GenLayer contract starts with a special comment on the first line:

\`\`\`python
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
\`\`\`

This is not a regular comment. The GenLayer runtime reads it before executing the contract. It specifies exactly which version of the GenLayer Python library your contract was written against.

## Why It Matters

GenLayer evolves. APIs change, new types are added, behaviors are refined. Without version pinning, a contract written today might break when the runtime updates.

The hash in the dependency string identifies a specific, immutable snapshot of the \`genlayer\` library. Validators use this hash to run your contract in the exact environment it was written for — guaranteed, forever.

## Do Not Modify It

The dependency header is fixed for this course. All starter code already includes the correct hash. Do not modify it unless you are intentionally upgrading to a newer runtime.

If you omit the header entirely, the GenLayer network will reject your contract before it can be deployed.`,
  },
  {
    id: 10,
    title: "Knowing Who Called",
    subtitle: "gl.message.sender_address: the caller's wallet address",
    type: "read",
    explanation: `## The Message Object

Every call into a GenLayer contract comes with a **message object** that describes the call. You access it via \`gl.message\`.

The most important field is \`sender_address\` — the wallet address of whoever triggered the call.

\`\`\`python
@gl.public.view
def get_caller(self) -> str:
    return gl.message.sender_address
\`\`\`

## Storing the Owner

A common pattern is to record the deployer's address as the contract owner in \`__init__\`:

\`\`\`python
class MyContract(gl.Contract):
    owner: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
\`\`\`

Because \`__init__\` runs at deploy time, \`gl.message.sender_address\` inside it is the address of whoever deployed the contract. This is stored permanently as \`self.owner\`.

## Other Message Fields

| Field | Type | Description |
|-------|------|-------------|
| \`gl.message.sender_address\` | \`str\` | Caller's wallet address |
| \`gl.message.value\` | \`u256\` | Amount of GEN sent with the call |

You will use \`sender_address\` in nearly every contract you build to track ownership and authorize privileged actions.`,
  },
  {
    id: 11,
    title: "Access Control",
    subtitle: "Restricting write methods to authorized callers",
    type: "read",
    explanation: `## The Owner Pattern

Most contracts have privileged actions that only the owner should be able to perform — resolving a market, closing a dispute, updating parameters. Access control enforces this.

\`\`\`python
class PredictionMarket(gl.Contract):
    owner: str
    resolved: bool
    outcome: str

    def __init__(self, question: str) -> None:
        self.owner = gl.message.sender_address
        self.resolved = False
        self.outcome = ""

    @gl.public.write
    def resolve(self, outcome: str) -> None:
        assert gl.message.sender_address == self.owner, "Only owner can resolve"
        assert not self.resolved, "Already resolved"
        self.outcome = outcome
        self.resolved = True
\`\`\`

## Using assert for Guards

Use Python's \`assert\` statement to enforce conditions. If the assertion fails, the transaction is reverted and no state changes. The second argument is the revert reason.

\`\`\`python
assert condition, "Revert reason if false"
\`\`\`

Guards should appear at the **top** of the method, before any state changes. Check all conditions first, then make changes.

## Beyond Simple Owner Checks

Access control can be as flexible as needed. You might check against a whitelist stored in a \`TreeMap\`, verify a specific role, or check that a time window has passed. The \`assert\` pattern works for all of these cases.`,
  },
  {
    id: 12,
    title: "Key-Value Storage",
    subtitle: "TreeMap: persistent mappings in GenLayer",
    type: "read",
    explanation: `## TreeMap[K, V]

\`TreeMap\` is GenLayer's persistent key-value store. It maps keys to values on-chain, equivalent to Solidity's \`mapping\` or Python's \`dict\` — but designed for GenVM storage.

\`\`\`python
from genlayer import *


class PredictionMarket(gl.Contract):
    bets: TreeMap[str, u256]    # address → amount
    voted: TreeMap[str, bool]   # address → has voted?

    def __init__(self) -> None:
        self.bets = TreeMap[str, u256]()
        self.voted = TreeMap[str, bool]()

    @gl.public.write
    def place_bet(self, amount: u256) -> None:
        caller = gl.message.sender_address
        assert not self.voted.get(caller, False), "Already voted"
        self.bets[caller] = amount
        self.voted[caller] = True

    @gl.public.view
    def get_bet(self, address: str) -> u256:
        return self.bets.get(address, u256(0))
\`\`\`

## Key Operations

| Operation | Syntax |
|-----------|--------|
| Set a value | \`self.map[key] = value\` |
| Get a value | \`self.map[key]\` |
| Get with default | \`self.map.get(key, default)\` |
| Check existence | \`key in self.map\` |
| Delete | \`del self.map[key]\` |

## Always Initialize in __init__

\`\`\`python
self.bets = TreeMap[str, u256]()   # Must be initialized
\`\`\`

Forgetting to initialize a TreeMap in \`__init__\` causes runtime errors. Do **not** use Python's \`dict\` for on-chain storage — it will not persist.`,
  },
  {
    id: 13,
    title: "Dynamic Arrays",
    subtitle: "DynArray: ordered on-chain lists",
    type: "read",
    explanation: `## DynArray[T]

\`DynArray\` is GenLayer's persistent list type. It stores an ordered sequence of values on-chain and grows as you append to it.

\`\`\`python
from genlayer import *


class DAO(gl.Contract):
    proposals: DynArray[str]
    submitters: DynArray[str]

    def __init__(self) -> None:
        self.proposals = DynArray[str]()
        self.submitters = DynArray[str]()

    @gl.public.write
    def submit(self, description: str) -> None:
        self.proposals.append(description)
        self.submitters.append(gl.message.sender_address)

    @gl.public.view
    def get_proposal(self, index: u32) -> str:
        return self.proposals[index]

    @gl.public.view
    def count(self) -> u32:
        return u32(len(self.proposals))
\`\`\`

## Key Operations

| Operation | Syntax |
|-----------|--------|
| Append | \`self.arr.append(value)\` |
| Access by index | \`self.arr[i]\` |
| Length | \`len(self.arr)\` |
| Iterate | \`for item in self.arr:\` |

## TreeMap vs DynArray

- **TreeMap** — look up by key (address → amount, id → status)
- **DynArray** — ordered list, access by position (list of proposals, history)

They can be combined: a \`TreeMap[str, DynArray[str]]\` stores a list per address.

Do **not** use Python's \`list\` for on-chain storage — use \`DynArray[T]\` instead.`,
  },
  {
    id: 14,
    title: "Receiving Payments",
    subtitle: "gl.message.value: handling GEN sent with a transaction",
    type: "read",
    explanation: `## Sending Value with a Call

Write methods can receive GEN tokens along with the call. The amount sent is available as \`gl.message.value\`, a \`u256\` in **wei** (10¹⁸ wei = 1 GEN).

\`\`\`python
from genlayer import *


class Escrow(gl.Contract):
    deposits: TreeMap[str, u256]

    def __init__(self) -> None:
        self.deposits = TreeMap[str, u256]()

    @gl.public.write
    def deposit(self) -> None:
        caller = gl.message.sender_address
        amount = gl.message.value
        assert amount > u256(0), "Must send GEN"
        existing = self.deposits.get(caller, u256(0))
        self.deposits[caller] = existing + amount

    @gl.public.view
    def get_deposit(self, address: str) -> u256:
        return self.deposits.get(address, u256(0))
\`\`\`

## Value is in Wei

1 GEN = 1,000,000,000,000,000,000 wei (10¹⁸). When comparing values:

\`\`\`python
ONE_GEN = u256(1_000_000_000_000_000_000)
assert gl.message.value >= ONE_GEN, "Must send at least 1 GEN"
\`\`\`

## Tracking Balances

The contract sees \`gl.message.value\` but you must track deposits yourself in a \`TreeMap\` and implement any withdrawal logic. This is the escrow pattern your final project will use.`,
  },
  {
    id: 15,
    title: "Your First AI Call",
    subtitle: "gl.nondet.exec_prompt: querying an AI model on-chain",
    type: "read",
    explanation: `## What Makes GenLayer Unique

Every lesson so far covered deterministic contract features. Now: the feature that separates GenLayer from every other blockchain — **on-chain AI calls**.

\`\`\`python
from genlayer import *


class PredictionMarket(gl.Contract):
    question: str
    resolved: bool
    outcome: str

    def __init__(self, question: str) -> None:
        self.question = question
        self.resolved = False
        self.outcome = ""

    @gl.public.write
    def resolve(self) -> None:
        assert not self.resolved, "Already resolved"

        prompt = f"""
        The prediction market question is: {self.question}

        Based on publicly available information, has this event occurred?
        Answer with exactly one word: YES or NO.
        """

        result = gl.nondet.exec_prompt(prompt)

        self.outcome = result.strip().upper()
        self.resolved = True
\`\`\`

## How Validator Consensus Works

\`gl.nondet.exec_prompt(prompt)\` sends the prompt to an AI model and returns the response as a string. The call is **non-deterministic** — the AI might return slightly different answers each time.

GenLayer handles this through its validator protocol: multiple validators each run the AI call independently, then reach consensus on the result. Only after consensus does the state change get committed on-chain.

## The nondet Namespace

The \`nondet\` in \`gl.nondet.exec_prompt\` stands for **non-deterministic**. Any operation that might return different results across validators — AI calls, web access — lives in this namespace. It signals to the GenVM that validator consensus is required.

## What Comes Next

Every final project track in this course is built around \`gl.nondet.exec_prompt\`. Lesson by lesson you will refine the prompt, handle edge cases, and build the full intelligent contract. You are ready.`,
  },
];

export function getBasicsLesson(id: number): BasicLesson | undefined {
  return BASICS_LESSONS.find((l) => l.id === id);
}
