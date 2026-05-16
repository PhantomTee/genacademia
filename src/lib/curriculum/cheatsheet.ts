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
    code: `def leader() -> str:
    return gl.nondet.exec_prompt(
        "Is the market condition met? Answer YES or NO."
    )

def validator(leader_result) -> bool:
    return isinstance(leader_result, gl.vm.Return)

result: str = gl.vm.run_nondet_unsafe(leader, validator)`,
    description:
      "Call the LLM within contract execution. Returns a string. Goes through validator equivalence.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/calling-llms",
    unlockedByLesson: 6,
  },
  {
    category: "AI & Web",
    title: "exec_prompt — JSON response",
    code: `def leader() -> dict:
    return gl.nondet.exec_prompt(
        'Return JSON: {"approved": bool, "reason": str}',
        response_format="json"
    )

def validator(leader_result) -> bool:
    return isinstance(leader_result, gl.vm.Return) and isinstance(leader_result.calldata, dict)

result: dict = gl.vm.run_nondet_unsafe(leader, validator)
approved = result["approved"]`,
    description:
      "Get structured JSON output from the LLM. Define the schema clearly in your prompt.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/calling-llms",
    unlockedByLesson: 7,
  },
  {
    category: "AI & Web",
    title: "web.get — fetch URL",
    code: `def leader() -> str:
    return gl.nondet.web.get("https://api.example.com/data")

def validator(leader_result) -> bool:
    return isinstance(leader_result, gl.vm.Return)

content: str = gl.vm.run_nondet_unsafe(leader, validator)`,
    description:
      "Fetch a URL and return the response body as a string. Used for live data oracles.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/web-access",
    unlockedByLesson: 9,
  },
  {
    category: "AI & Web",
    title: "web.render — screenshot",
    code: `def leader() -> bytes:
    return gl.nondet.web.render("https://example.com")

def validator(leader_result) -> bool:
    return isinstance(leader_result, gl.vm.Return)

image: bytes = gl.vm.run_nondet_unsafe(leader, validator)`,
    description:
      "Capture a full-page screenshot of a URL. Returns raw image bytes for use with exec_prompt.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/web-access",
    unlockedByLesson: 18,
  },
  {
    category: "AI & Web",
    title: "exec_prompt with images",
    code: `def leader() -> str:
    screenshot = gl.nondet.web.render(url)
    return gl.nondet.exec_prompt(
        "What value does the chart show?",
        images=[screenshot]
    )

def validator(leader_result) -> bool:
    return isinstance(leader_result, gl.vm.Return)

result = gl.vm.run_nondet_unsafe(leader, validator)`,
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

def validator(leader_result) -> bool:
    if not isinstance(leader_result, gl.vm.Return):
        return False
    return str(leader_result.calldata).strip().upper() in ("YES", "NO")

outcome = gl.vm.run_nondet_unsafe(leader, validator)`,
    description:
      "Run custom non-deterministic logic with your own equivalence function.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/non-determinism",
    unlockedByLesson: 16,
  },
  {
    category: "Value & Payments",
    title: "Send GEN from contract",
    code: `@gl.evm.contract_interface
class Recipient:
    class View:
        pass
    class Write:
        pass

Recipient(recipient_address).emit_transfer(value=amount)`,
    description:
      "Transfer GEN from the contract's balance to a recipient address.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/value-transfers",
    unlockedByLesson: 22,
  },
  {
    category: "Storage",
    title: "VecDB Vector Store",
    code: `from dataclasses import dataclass
import typing
import numpy as np

@allow_storage
@dataclass
class StoreValue:
    item_id: u256
    text: str

vector_store: VecDB[np.float32, typing.Literal[384], StoreValue]`,
    description:
      "Declare vector storage with the current VecDB-based API before inserting embeddings.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/vector-storage",
    unlockedByLesson: 23,
  },
  {
    category: "Contract Interaction",
    title: "Call another contract",
    code: `other = gl.get_contract_at(contract_address)
result = other.view().read_method(arg1)

# Writes are asynchronous messages.
other.emit(on="finalized").write_method(arg1, arg2)`,
    description:
      "Use view() for synchronous reads and emit() for asynchronous writes.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/interacting-with-intelligent-contracts",
    unlockedByLesson: 24,
  },
  {
    category: "Utilities",
    title: "Seeded Random",
    code: `import hashlib

seed = gl.message.sender_address.as_hex + str(gl.message.chain_id)
random_byte = hashlib.sha256(seed.encode()).digest()[0]`,
    description:
      "Use a deterministic seed source so every validator derives the same value.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/random",
    unlockedByLesson: 26,
  },
  {
    category: "Utilities",
    title: "Debug Trace",
    code: `print(f"Status: {self.status}")
gl.trace("checkpoint")`,
    description:
      "Use print for basic logs and gl.trace for GenVM debug output.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/debugging",
    unlockedByLesson: 28,
  },
  {
    category: "Special Methods",
    title: "__handle_undefined_method__",
    code: `@gl.public.write
def __handle_undefined_method__(self, method_name: str, args: list, kwargs: dict):
    # Handle calls to undefined methods
    pass`,
    description:
      "Handle calls that do not match a declared method.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/special-methods",
    unlockedByLesson: 29,
  },
  {
    category: "Special Methods",
    title: "__receive__",
    code: `@gl.public.write.payable
def __receive__(self) -> None:
    amount = gl.message.value`,
    description:
      "Called when value is sent directly to the contract without a method call.",
    docUrl: "https://docs.genlayer.com/developers/intelligent-contracts/features/special-methods",
    unlockedByLesson: 29,
  },
];
