export interface CheatsheetEntry {
  category: string;
  title: string;
  code: string;
  description: string;
  docUrl: string;
  unlockedByLesson: number;
}

export const CHEATSHEET: CheatsheetEntry[] = [
  {
    category: "Contract Structure",
    title: "Dependency header",
    code: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }`,
    description:
      "Required first line. Content-addressed hash pinning the GenVM SDK version. Never use :test in production.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/introduction",
    unlockedByLesson: 1,
  },
  {
    category: "Contract Structure",
    title: "Minimal contract skeleton",
    code: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl

class MyContract(gl.Contract):
    value: str

    def __init__(self, initial: str) -> None:
        self.value = initial

    @gl.public.view
    def get_value(self) -> str:
        return self.value`,
    description: "The minimal structure for a GenLayer intelligent contract.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/introduction",
    unlockedByLesson: 1,
  },
  {
    category: "Methods",
    title: "@gl.public.view",
    code: `@gl.public.view
def get_balance(self) -> int:
    return self.balance`,
    description:
      "Read-only method. Cannot modify state. Called for free with gen_call.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features",
    unlockedByLesson: 1,
  },
  {
    category: "Methods",
    title: "@gl.public.write",
    code: `@gl.public.write
def set_value(self, new_value: str) -> None:
    self.value = new_value`,
    description:
      "State-mutating method. Requires a signed transaction. Goes through validator consensus.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features",
    unlockedByLesson: 2,
  },
  {
    category: "Methods",
    title: "@gl.public.write.payable",
    code: `@gl.public.write.payable
def deposit(self) -> None:
    amount = gl.message.value
    self.balance += amount`,
    description:
      "Write method that accepts GEN tokens. Use gl.message.value to read the sent amount.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/balances",
    unlockedByLesson: 21,
  },
  {
    category: "Transaction Context",
    title: "gl.message.sender_address",
    code: `sender: Address = gl.message.sender_address`,
    description: "Address of the account that sent the current transaction.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/transaction-context",
    unlockedByLesson: 2,
  },
  {
    category: "Transaction Context",
    title: "gl.message.value",
    code: `amount_sent: int = gl.message.value`,
    description: "Amount of GEN tokens (in smallest unit) sent with the transaction.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/balances",
    unlockedByLesson: 21,
  },
  {
    category: "Error Handling",
    title: "gl.vm.UserError",
    code: `raise gl.vm.UserError("Amount must be positive")`,
    description:
      "Raise a user-facing error. Reverts the transaction and shows the message to the caller.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/error-handling",
    unlockedByLesson: 3,
  },
  {
    category: "Types",
    title: "Address type",
    code: `from genlayer.types import Address

owner: Address = gl.message.sender_address
is_owner = owner == gl.message.sender_address`,
    description:
      "On-chain address type. Case-insensitive comparison. Use for wallet and contract addresses.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/types/address",
    unlockedByLesson: 4,
  },
  {
    category: "Types",
    title: "u8, u32, u64, u256",
    code: `from genlayer.types import u8, u32, u64, u256

count: u32 = 0
balance: u256 = 0`,
    description:
      "Unsigned integer types with fixed bit widths. Use u256 for token amounts.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/types",
    unlockedByLesson: 4,
  },
  {
    category: "Collections",
    title: "TreeMap",
    code: `from genlayer.types import TreeMap, Address

balances: TreeMap[Address, int]

# In __init__:
self.balances = TreeMap[Address, int]()

# Usage:
self.balances[addr] = 100
val = self.balances.get(addr, 0)`,
    description:
      "Ordered key-value map stored on-chain. Keys must be comparable. Supports .get(key, default).",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/types/collections",
    unlockedByLesson: 11,
  },
  {
    category: "Collections",
    title: "DynArray",
    code: `from genlayer.types import DynArray

items: DynArray[str]

# In __init__:
self.items = DynArray[str]()

# Usage:
self.items.append("hello")
first = self.items[0]
length = len(self.items)`,
    description:
      "Dynamic array stored on-chain. Append-only growth. Index access. No deletion.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/types/collections",
    unlockedByLesson: 11,
  },
  {
    category: "Collections",
    title: "@dataclass",
    code: `from dataclasses import dataclass

@dataclass
class Job:
    title: str
    budget: int
    employer: Address
    completed: bool = False

jobs: TreeMap[int, Job]`,
    description:
      "Structured on-chain data. Annotate with @dataclass and store in TreeMap or DynArray.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/types/dataclasses",
    unlockedByLesson: 12,
  },
  {
    category: "AI & Web",
    title: "exec_prompt — plain text",
    code: `result: str = gl.nondet.exec_prompt(
    "Is the market condition met? Answer YES or NO."
)`,
    description:
      "Call the LLM within contract execution. Returns a string. Goes through validator equivalence.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/calling-llms",
    unlockedByLesson: 6,
  },
  {
    category: "AI & Web",
    title: "exec_prompt — JSON response",
    code: `result: dict = gl.nondet.exec_prompt(
    'Return JSON: {"approved": bool, "reason": str}',
    response_format="json"
)
approved = result["approved"]`,
    description:
      "Get structured JSON output from the LLM. Define the schema clearly in your prompt.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/calling-llms",
    unlockedByLesson: 7,
  },
  {
    category: "AI & Web",
    title: "web.get — fetch URL",
    code: `content: str = gl.nondet.web.get("https://api.example.com/data")`,
    description:
      "Fetch a URL and return the response body as a string. Used for live data oracles.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/web-access",
    unlockedByLesson: 9,
  },
  {
    category: "AI & Web",
    title: "web.render — screenshot",
    code: `image: bytes = gl.nondet.web.render("https://example.com")`,
    description:
      "Capture a full-page screenshot of a URL. Returns raw image bytes for use with exec_prompt.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/web-access",
    unlockedByLesson: 18,
  },
  {
    category: "AI & Web",
    title: "exec_prompt with images",
    code: `screenshot = gl.nondet.web.render(url)
result = gl.nondet.exec_prompt(
    "What value does the chart show?",
    images=[screenshot]
)`,
    description:
      "Pass image bytes to the LLM for visual analysis. Supports multiple images.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/image-processing",
    unlockedByLesson: 19,
  },
  {
    category: "Non-Determinism",
    title: "run_nondet_unsafe",
    code: `def leader() -> str:
    return gl.nondet.exec_prompt("What is the outcome?")

def validator(result: str) -> bool:
    return result in ("YES", "NO")

outcome = gl.vm.run_nondet_unsafe(leader, validator)`,
    description:
      "Run custom non-deterministic logic with your own equivalence function.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/non-determinism",
    unlockedByLesson: 16,
  },
  {
    category: "Value & Payments",
    title: "Send GEN from contract",
    code: `gl.send(recipient_address, amount)`,
    description:
      "Transfer GEN from the contract's balance to a recipient address.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/value-transfers",
    unlockedByLesson: 22,
  },
  {
    category: "Storage",
    title: "VectorStorage",
    code: `search_index: gl.VectorStorage

# In __init__:
self.search_index = gl.VectorStorage()

# Add items:
self.search_index.add(text, {"id": item_id})

# Search:
results = self.search_index.search(query, top_k=5)`,
    description:
      "On-chain semantic vector storage. Embed text and search by meaning.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/vector-storage",
    unlockedByLesson: 23,
  },
  {
    category: "Contract Interaction",
    title: "Call another contract",
    code: `result = gl.call_contract(
    contract_address,
    "method_name",
    [arg1, arg2]
)`,
    description:
      "Call a method on another deployed contract. Returns the method's return value.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/interacting-with-intelligent-contracts",
    unlockedByLesson: 24,
  },
  {
    category: "Utilities",
    title: "gl.get_random_u8",
    code: `random_byte: int = gl.get_random_u8()  # 0-255`,
    description:
      "Generate a consensus-safe random u8. All validators agree on the same value.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/random",
    unlockedByLesson: 26,
  },
  {
    category: "Utilities",
    title: "gl.emit_debug",
    code: `gl.emit_debug(f"Status: {self.status}, balance: {self.balance}")`,
    description:
      "Write a debug message to GenLayer Studio logs. Stripped in production. No gas cost.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/debugging",
    unlockedByLesson: 28,
  },
  {
    category: "Special Methods",
    title: "__receive_message__",
    code: `def __receive_message__(self, message: str) -> None:
    # Handle inter-contract message
    pass`,
    description:
      "Called when another contract sends a message to this contract.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/special-methods",
    unlockedByLesson: 29,
  },
  {
    category: "Special Methods",
    title: "__receive_value__",
    code: `def __receive_value__(self, amount: int) -> None:
    self.balance += amount`,
    description:
      "Called when GEN is sent directly to the contract address without a method call.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/special-methods",
    unlockedByLesson: 29,
  },
];
