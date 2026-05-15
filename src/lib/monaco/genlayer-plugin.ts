import type { Monaco } from "@monaco-editor/react";

// ─── Lint rules ──────────────────────────────────────────────────────────────

const DEPRECATED_APIS = [
  { re: /gl\.get_webpage\s*\(/, name: "gl.get_webpage()", fix: "gl.nondet.web.render(url, mode='text')" },
  { re: /gl\.exec_prompt\s*\(/, name: "gl.exec_prompt()", fix: "gl.nondet.exec_prompt(prompt)" },
  { re: /gl\.ContractAt\s*\(/, name: "gl.ContractAt()", fix: "gl.get_contract_at(address)" },
  { re: /gl\.eq_principle_strict_eq\s*\(/, name: "gl.eq_principle_strict_eq()", fix: "gl.eq_principle.strict_eq(fn)" },
  { re: /gl\.eq_principle_prompt_comparative\s*\(/, name: "gl.eq_principle_prompt_comparative()", fix: "gl.eq_principle.prompt_comparative(fn, principle)" },
] as const;

const UNSAFE_IMPORTS = ["requests", "random", "datetime", "time", "urllib", "httpx", "aiohttp"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lint(code: string, monaco: Monaco): any[] {
  const lines = code.split("\n");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markers: any[] = [];

  // File-level: missing genlayer import
  if (!code.includes("from genlayer import")) {
    markers.push({
      severity: monaco.MarkerSeverity.Error,
      message: 'Missing required import: from genlayer import *',
      startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1,
    });
  }

  // File-level: no gl.Contract subclass
  if (code.includes("from genlayer import") && !/class\s+\w+\s*\(\s*gl\.Contract\s*\)/.test(code)) {
    markers.push({
      severity: monaco.MarkerSeverity.Warning,
      message: "No contract class found. Define a class extending gl.Contract: class MyContract(gl.Contract):",
      startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1,
    });
  }

  // Line 1: SDK pragma
  const first = lines[0] ?? "";
  if (!/^#\s*\{.*"Depends".*"py-genlayer:/.test(first)) {
    markers.push({
      severity: monaco.MarkerSeverity.Warning,
      message: 'Missing SDK pragma on line 1. Should be: # { "Depends": "py-genlayer:HASH" }',
      startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: Math.max(first.length, 1),
    });
  } else if (first.includes("py-genlayer:test")) {
    markers.push({
      severity: monaco.MarkerSeverity.Information,
      message: "Using :test hash — replace with the real SDK dependency hash for production",
      startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: first.length,
    });
  }

  lines.forEach((line, i) => {
    const n = i + 1;
    const trimmed = line.trimStart();
    if (trimmed.startsWith("#")) return;

    // Deprecated APIs
    for (const d of DEPRECATED_APIS) {
      if (d.re.test(line)) {
        const col = line.search(d.re) + 1;
        markers.push({
          severity: monaco.MarkerSeverity.Error,
          message: `Deprecated: ${d.name} → use ${d.fix}`,
          startLineNumber: n, startColumn: col, endLineNumber: n, endColumn: col + d.name.length,
        });
      }
    }

    // Forbidden Python types in type annotations
    if (/:\s*int\b/.test(line) && !trimmed.startsWith("#")) {
      const col = line.search(/:\s*int\b/) + 1;
      markers.push({
        severity: monaco.MarkerSeverity.Warning,
        message: "Bare 'int' not allowed — use a sized integer: u256, u64, u32, i256, i64, i32",
        startLineNumber: n, startColumn: col, endLineNumber: n, endColumn: col + 4,
      });
    }
    if (/:\s*float\b/.test(line)) {
      const col = line.search(/:\s*float\b/) + 1;
      markers.push({
        severity: monaco.MarkerSeverity.Error,
        message: "Float types are not supported in GenLayer contracts — use integer types",
        startLineNumber: n, startColumn: col, endLineNumber: n, endColumn: col + 6,
      });
    }
    if (/:\s*list\[/.test(line)) {
      const col = line.search(/:\s*list\[/) + 1;
      markers.push({
        severity: monaco.MarkerSeverity.Warning,
        message: "Use DynArray[T] instead of list[T] for contract storage",
        startLineNumber: n, startColumn: col, endLineNumber: n, endColumn: col + 6,
      });
    }
    if (/:\s*dict\[/.test(line)) {
      const col = line.search(/:\s*dict\[/) + 1;
      markers.push({
        severity: monaco.MarkerSeverity.Warning,
        message: "Use TreeMap[K, V] instead of dict[K, V] for contract storage",
        startLineNumber: n, startColumn: col, endLineNumber: n, endColumn: col + 6,
      });
    }

    // Unsafe imports
    for (const lib of UNSAFE_IMPORTS) {
      if (new RegExp(`^(import|from)\\s+${lib}\\b`).test(trimmed)) {
        markers.push({
          severity: monaco.MarkerSeverity.Warning,
          message: `'${lib}' introduces non-determinism — use gl.nondet.web.* for HTTP requests and gl.nondet.exec_prompt() for LLM calls`,
          startLineNumber: n, startColumn: 1, endLineNumber: n, endColumn: line.length,
        });
      }
    }

    // gl.nondet.* called directly without being inside a nested def (heuristic)
    if (/gl\.nondet\.(exec_prompt|web\.render|web\.request)\s*\(/.test(line)) {
      // Look backwards for the nearest function definition
      const methodIndent = line.length - trimmed.length;
      let insideNestedDef = false;
      for (let j = i - 1; j >= Math.max(0, i - 30); j--) {
        const prev = lines[j];
        const prevTrimmed = prev.trimStart();
        const prevIndent = prev.length - prevTrimmed.length;
        if (prevTrimmed.startsWith("def ") && prevIndent > 4) {
          // There's a nested def above with deeper indent than top-level method
          insideNestedDef = prevIndent < methodIndent || prevIndent === methodIndent - 4;
          break;
        }
        if (prevTrimmed.startsWith("def ") && prevIndent <= 4) break;
      }
      if (!insideNestedDef) {
        const col = line.search(/gl\.nondet/) + 1;
        markers.push({
          severity: monaco.MarkerSeverity.Warning,
          message: "gl.nondet.* calls should be inside a function passed to gl.eq_principle.strict_eq() or gl.eq_principle.prompt_comparative()",
          startLineNumber: n, startColumn: col, endLineNumber: n, endColumn: col + 10,
        });
      }
    }
  });

  return markers;
}

// ─── Completions ─────────────────────────────────────────────────────────────

const COMPLETIONS = [
  // Decorators
  { label: "@gl.public.view", insert: "@gl.public.view", detail: "decorator", doc: "Read-only method. No state changes, no consensus overhead." },
  { label: "@gl.public.write", insert: "@gl.public.write", detail: "decorator", doc: "State-modifying method. Requires validator consensus." },
  { label: "@gl.public.write.payable", insert: "@gl.public.write.payable", detail: "decorator", doc: "State-modifying + accepts native token. Access gl.message.value for amount." },
  { label: "@allow_storage", insert: "@allow_storage", detail: "decorator", doc: "Required on custom dataclasses used inside TreeMap or DynArray contract storage." },
  // Non-deterministic
  { label: "gl.nondet.exec_prompt", insert: "gl.nondet.exec_prompt(${1:prompt})", detail: "gl.nondet", doc: "Run an LLM prompt. Must be inside a function passed to gl.eq_principle.*. Returns str, or dict when response_format='json'." },
  { label: "gl.nondet.web.render", insert: "gl.nondet.web.render(${1:url}, mode='${2|text,html,screenshot|}')", detail: "gl.nondet.web", doc: "Fetch a webpage. mode='text'→plain text, 'html'→HTML body, 'screenshot'→Image. Must be inside gl.eq_principle.*." },
  { label: "gl.nondet.web.request", insert: "gl.nondet.web.request(${1:url})", detail: "gl.nondet.web", doc: "HTTP request to an external API. Supports GET and POST. Must be inside gl.eq_principle.*." },
  // Equivalence principle
  { label: "gl.eq_principle.strict_eq", insert: "gl.eq_principle.strict_eq(${1:fn})", detail: "gl.eq_principle", doc: "All validators must get identical results (==). Best for deterministic outputs like bool, int, string." },
  { label: "gl.eq_principle.prompt_comparative", insert: "gl.eq_principle.prompt_comparative(${1:fn}, ${2:principle})", detail: "gl.eq_principle", doc: "NLP-based equivalence: validators check if results mean the same thing. Use when wording varies." },
  { label: "gl.eq_principle.prompt_non_comparative", insert: "gl.eq_principle.prompt_non_comparative(${1:fn}, task=${2:''}, criteria=${3:''})", detail: "gl.eq_principle", doc: "Leader-only execution; validators verify integrity. Fastest option. Requires task= and criteria= kwargs." },
  // Message context
  { label: "gl.message.sender", insert: "gl.message.sender", detail: "Address", doc: "Address of the transaction sender." },
  { label: "gl.message.value", insert: "gl.message.value", detail: "u256", doc: "Native token amount sent. Only accessible in @gl.public.write.payable methods." },
  // Contract interaction
  { label: "gl.get_contract_at", insert: "gl.get_contract_at(${1:address})", detail: "gl", doc: "Get a proxy to another deployed contract.\nRead: contract.view().method(args)\nWrite: contract.emit(value=u256(0)).method(args)" },
  // Storage utils
  { label: "gl.storage.copy_to_memory", insert: "gl.storage.copy_to_memory(${1:self.field})", detail: "gl.storage", doc: "Copy storage to memory before using inside a non-deterministic block." },
  { label: "gl.storage.inmem_allocate", insert: "gl.storage.inmem_allocate(${1:TreeMap[str, str]})", detail: "gl.storage", doc: "Allocate generic storage types in memory. Required for TreeMap/DynArray in @allow_storage classes." },
  // Types
  { label: "u256", insert: "u256", detail: "type", doc: "Unsigned 256-bit integer. Standard for token amounts." },
  { label: "u128", insert: "u128", detail: "type", doc: "Unsigned 128-bit integer." },
  { label: "u64", insert: "u64", detail: "type", doc: "Unsigned 64-bit integer." },
  { label: "u32", insert: "u32", detail: "type", doc: "Unsigned 32-bit integer." },
  { label: "i256", insert: "i256", detail: "type", doc: "Signed 256-bit integer." },
  { label: "i64", insert: "i64", detail: "type", doc: "Signed 64-bit integer." },
  { label: "i32", insert: "i32", detail: "type", doc: "Signed 32-bit integer." },
  { label: "Address", insert: "Address", detail: "type", doc: "Blockchain address type." },
  { label: "DynArray[T]", insert: "DynArray[${1:str}]", detail: "type", doc: "Dynamic array for contract storage. Replaces list[T]." },
  { label: "TreeMap[K, V]", insert: "TreeMap[${1:str}, ${2:u256}]", detail: "type", doc: "Key-value map for contract storage. Replaces dict[K, V]." },
] as const;

// ─── Hover docs ───────────────────────────────────────────────────────────────

const HOVER: Record<string, string> = {
  "gl.nondet.exec_prompt": "**`gl.nondet.exec_prompt(prompt, *, response_format?, images?)`**\n\nRun an LLM prompt. Must be inside a function passed to `gl.eq_principle.*`.\n\nReturns `str` by default, `dict` when `response_format='json'`.",
  "gl.nondet.web.render": "**`gl.nondet.web.render(url, mode='text')`**\n\nFetch a webpage. `'text'`→plain text · `'html'`→HTML body · `'screenshot'`→Image.\n\nMust be inside `gl.eq_principle.*`.",
  "gl.nondet.web.request": "**`gl.nondet.web.request(url, method='GET', headers?, body?)`**\n\nHTTP request to an external API. Must be inside `gl.eq_principle.*`.",
  "gl.eq_principle.strict_eq": "**`gl.eq_principle.strict_eq(fn)`**\n\nAll validators must produce identical results (`==`). Best for deterministic outputs.",
  "gl.eq_principle.prompt_comparative": "**`gl.eq_principle.prompt_comparative(fn, principle)`**\n\nNLP equivalence check. Validators may get slightly different results but must agree they're equivalent.",
  "gl.eq_principle.prompt_non_comparative": "**`gl.eq_principle.prompt_non_comparative(fn, *, task, criteria)`**\n\nOnly the leader executes the task; validators check integrity. Fastest and cheapest option.",
  "gl.message.sender": "**`gl.message.sender`** → `Address`\n\nAddress of the transaction sender.",
  "gl.message.value": "**`gl.message.value`** → `u256`\n\nNative token amount sent. Only accessible in `@gl.public.write.payable` methods.",
  "gl.get_contract_at": "**`gl.get_contract_at(address)`** → `ContractProxy`\n\nProxy to another deployed contract.\n\n```python\nc = gl.get_contract_at(addr)\nc.view().read_method()                  # read\nc.emit(value=u256(0)).write_method()    # write\n```",
  "gl.storage.copy_to_memory": "**`gl.storage.copy_to_memory(storage_obj)`**\n\nCopy storage to in-memory format before using inside a non-deterministic block.",
  "gl.storage.inmem_allocate": "**`gl.storage.inmem_allocate(type)`**\n\nAllocate generic storage in memory. Required for `TreeMap`/`DynArray` inside `@allow_storage` classes.",
  "gl.public.view": "**`@gl.public.view`**\n\nRead-only method. No state mutations, no consensus overhead.",
  "gl.public.write": "**`@gl.public.write`**\n\nState-modifying method. Requires validator consensus.",
  "gl.public.write.payable": "**`@gl.public.write.payable`**\n\nAccepts native token transfers. Access `gl.message.value` for the amount.",
  "allow_storage": "**`@allow_storage`**\n\nRequired decorator for custom dataclasses used in contract storage (`TreeMap` / `DynArray` values).",
  "DynArray": "**`DynArray[T]`**\n\nDynamic array for contract storage. Replaces `list[T]`.",
  "TreeMap": "**`TreeMap[K, V]`**\n\nKey-value map for contract storage. Replaces `dict[K, V]`.",
  "u256": "**`u256`** — unsigned 256-bit integer. Standard type for token amounts.",
  "Address": "**`Address`** — blockchain address type.",
};

// ─── Registration (once per Monaco instance) ─────────────────────────────────

const registered = new WeakSet<Monaco>();

function ensureRegistered(monaco: Monaco) {
  if (registered.has(monaco)) return;
  registered.add(monaco);

  // Completions
  monaco.languages.registerCompletionItemProvider("python", {
    triggerCharacters: [".", "@"],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provideCompletionItems(model: any, position: any) {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      return {
        suggestions: COMPLETIONS.map((c) => ({
          label: c.label,
          kind: c.detail === "decorator"
            ? monaco.languages.CompletionItemKind.Event
            : c.detail === "type"
            ? monaco.languages.CompletionItemKind.TypeParameter
            : monaco.languages.CompletionItemKind.Function,
          insertText: c.insert,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: { value: c.doc },
          detail: c.detail,
          range,
        })),
      };
    },
  });

  // Hover
  monaco.languages.registerHoverProvider("python", {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provideHover(model: any, position: any) {
      const line = model.getLineContent(position.lineNumber);
      for (const [key, value] of Object.entries(HOVER)) {
        if (line.includes(key)) {
          const col = line.indexOf(key);
          return {
            range: new monaco.Range(
              position.lineNumber, col + 1,
              position.lineNumber, col + key.length + 1
            ),
            contents: [{ value }],
          };
        }
      }
      return null;
    },
  });
}

// ─── Public API ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerGenLayerPlugin(monaco: Monaco, editor: any) {
  ensureRegistered(monaco);

  const OWNER = "genlayer";

  function runLint() {
    const model = editor.getModel();
    if (!model) return;
    monaco.editor.setModelMarkers(model, OWNER, lint(model.getValue(), monaco));
  }

  runLint();
  const sub = editor.onDidChangeModelContent(() => runLint());
  return () => sub.dispose();
}
