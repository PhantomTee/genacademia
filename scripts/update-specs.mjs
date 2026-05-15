#!/usr/bin/env node
// scripts/update-specs.mjs
// Updates specs/01.ts through specs/30.ts with correct class names and primary
// methods for PREDICTION_MARKET and INSURANCE, derived from the gist curriculum.

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SPECS_DIR = resolve(ROOT, "src", "lib", "curriculum", "specs");

// Data derived from the gist spec report:
// { lessonId: { PM: { method, class, methods[] }, INS: { method, class, methods[] } } }
const GIST_SPEC_DATA = {
  1:  { PM: { method: "get_project_name",        klass: "PredictX",  methods: ["get_project_name"] },
        INS: { method: "get_project_name",        klass: "CaseWise",  methods: ["get_project_name"] } },
  2:  { PM: { method: "get_platform_name",        klass: "PredictX",  methods: ["get_platform_name"] },
        INS: { method: "get_court_name",          klass: "CaseWise",  methods: ["get_court_name"] } },
  3:  { PM: { method: "get_platform_name",        klass: "PredictX",  methods: ["get_platform_name", "get_platform_description", "get_owner"] },
        INS: { method: "get_court_name",          klass: "CaseWise",  methods: ["get_court_name", "get_court_rules", "get_owner"] } },
  4:  { PM: { method: "get_platform_name",        klass: "PredictX",  methods: ["update_platform_description"] },
        INS: { method: "get_court_name",          klass: "CaseWise",  methods: ["update_court_rules"] } },
  5:  { PM: { method: "get_contract_summary",     klass: "PredictX",  methods: ["get_platform_name", "get_platform_description", "get_owner", "get_contract_summary", "update_platform_description"] },
        INS: { method: "get_contract_summary",    klass: "CaseWise",  methods: ["get_court_name", "get_court_rules", "get_owner", "get_contract_summary", "update_court_rules"] } },
  6:  { PM: { method: "get_platform_name",        klass: "PredictX",  methods: [] },
        INS: { method: "get_court_name",          klass: "CaseWise",  methods: [] } },
  7:  { PM: { method: "get_platform_name",        klass: "PredictX",  methods: ["create_market"] },
        INS: { method: "get_court_name",          klass: "CaseWise",  methods: ["submit_case"] } },
  8:  { PM: { method: "get_platform_name",        klass: "PredictX",  methods: [] },
        INS: { method: "get_court_name",          klass: "CaseWise",  methods: [] } },
  9:  { PM: { method: "get_platform_name",        klass: "PredictX",  methods: [] },
        INS: { method: "get_court_name",          klass: "CaseWise",  methods: [] } },
  10: { PM: { method: "get_platform_name",        klass: "PredictX",  methods: ["create_market"] },
        INS: { method: "get_court_name",          klass: "CaseWise",  methods: ["submit_case"] } },
  11: { PM: { method: "get_platform_name",        klass: "PredictX",  methods: [] },
        INS: { method: "get_court_name",          klass: "CaseWise",  methods: [] } },
  12: { PM: { method: "get_market_json",          klass: "PredictX",  methods: ["get_market_json"] },
        INS: { method: "get_case_json",           klass: "CaseWise",  methods: ["get_case_json"] } },
  13: { PM: { method: "get_active_markets_json",  klass: "PredictX",  methods: ["get_active_markets_json"] },
        INS: { method: "get_open_cases_json",     klass: "CaseWise",  methods: ["get_open_cases_json"] } },
  14: { PM: { method: "get_platform_name",        klass: "PredictX",  methods: ["close_market"] },
        INS: { method: "get_court_name",          klass: "CaseWise",  methods: ["cancel_case"] } },
  15: { PM: { method: "get_all_markets_json",     klass: "PredictX",  methods: ["get_market_json", "get_active_markets_json", "get_all_markets_json", "close_market"] },
        INS: { method: "get_all_cases_json",      klass: "CaseWise",  methods: ["submit_case", "get_case_json", "get_open_cases_json", "get_all_cases_json", "cancel_case"] } },
  16: { PM: { method: "get_platform_name",        klass: "PredictX",  methods: ["stake_on_outcome"] },
        INS: { method: "get_court_name",          klass: "CaseWise",  methods: ["pay_case_fee"] } },
  17: { PM: { method: "get_platform_name",        klass: "PredictX",  methods: [] },
        INS: { method: "get_court_name",          klass: "CaseWise",  methods: ["add_evidence"] } },
  18: { PM: { method: "get_platform_name",        klass: "PredictX",  methods: [] },
        INS: { method: "get_court_name",          klass: "CaseWise",  methods: [] } },
  19: { PM: { method: "get_platform_name",        klass: "PredictX",  methods: ["resolve_market_manually"] },
        INS: { method: "get_court_name",          klass: "CaseWise",  methods: ["rule_case_manually"] } },
  20: { PM: { method: "get_all_markets_json",     klass: "PredictX",  methods: ["claim_winnings"] },
        INS: { method: "get_case_json",           klass: "CaseWise",  methods: ["pay_case_fee", "add_evidence", "rule_case_manually", "get_case_json"] } },
  21: { PM: { method: "get_resolution_prompt",    klass: "PredictX",  methods: ["get_resolution_prompt"] },
        INS: { method: "get_case_review_prompt",  klass: "CaseWise",  methods: ["get_case_review_prompt"] } },
  22: { PM: { method: "get_platform_name",        klass: "PredictX",  methods: ["resolve_with_ai"] },
        INS: { method: "get_court_name",          klass: "CaseWise",  methods: ["review_case_with_ai"] } },
  23: { PM: { method: "get_platform_name",        klass: "PredictX",  methods: [] },
        INS: { method: "get_court_name",          klass: "CaseWise",  methods: [] } },
  24: { PM: { method: "get_platform_name",        klass: "PredictX",  methods: [] },
        INS: { method: "get_court_name",          klass: "CaseWise",  methods: [] } },
  25: { PM: { method: "get_all_markets_json",     klass: "PredictX",  methods: ["resolve_with_ai"] },
        INS: { method: "get_all_cases_json",      klass: "CaseWise",  methods: ["review_case_with_ai"] } },
  26: { PM: { method: "get_platform_name",        klass: "PredictX",  methods: [] },
        INS: { method: "get_court_name",          klass: "CaseWise",  methods: ["get_dispute_rules_json"] } },
  27: { PM: { method: "get_frontend_actions_json", klass: "PredictX", methods: ["get_frontend_actions_json"] },
        INS: { method: "get_court_name",           klass: "CaseWise", methods: ["appeal_case"] } },
  28: { PM: { method: "get_test_checklist_json",  klass: "PredictX",  methods: ["get_test_checklist_json"] },
        INS: { method: "get_test_checklist_json", klass: "CaseWise",  methods: ["get_test_checklist_json"] } },
  29: { PM: { method: "get_all_markets_json",     klass: "PredictX",  methods: ["get_platform_name", "get_platform_description", "get_owner", "create_market", "get_market_json", "get_active_markets_json", "get_all_markets_json", "close_market", "stake_on_outcome", "resolve_market_manually", "resolve_with_ai", "claim_winnings", "get_frontend_actions_json", "get_test_checklist_json"] },
        INS: { method: "get_all_cases_json",      klass: "CaseWise",  methods: ["get_court_name", "get_court_rules", "get_owner", "get_contract_summary", "update_court_rules", "submit_case", "get_case_json", "get_open_cases_json", "get_all_cases_json", "cancel_case", "pay_case_fee", "add_evidence", "rule_case_manually", "get_case_review_prompt", "review_case_with_ai", "get_dispute_rules_json", "appeal_case", "get_test_checklist_json"] } },
  30: { PM: { method: "get_contract_summary",     klass: "PredictX",  methods: ["get_platform_name", "get_platform_description", "get_owner", "get_contract_summary", "create_market", "get_market_json", "get_active_markets_json", "get_all_markets_json", "close_market", "stake_on_outcome", "resolve_market_manually", "resolve_with_ai", "claim_winnings", "get_frontend_actions_json", "get_test_checklist_json"] },
        INS: { method: "get_contract_summary",    klass: "CaseWise",  methods: ["get_court_name", "get_court_rules", "get_owner", "get_contract_summary", "update_court_rules", "submit_case", "get_case_json", "get_open_cases_json", "get_all_cases_json", "cancel_case", "pay_case_fee", "add_evidence", "rule_case_manually", "get_case_review_prompt", "review_case_with_ai", "get_dispute_rules_json", "appeal_case", "get_test_checklist_json"] } },
};

// Map short key → ProjectPath and spec entry key
const TRACK_MAP = {
  PM:  "PREDICTION_MARKET",
  INS: "INSURANCE",
};

function buildSpecEntry(track, lessonData) {
  const trackData = lessonData[track];
  if (!trackData) return null;
  const methodsList = trackData.methods.length > 0
    ? `["${trackData.methods.join('", "')}"]`
    : "[]";
  return `  {
    method: "${trackData.method}",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "${trackData.klass}",
      requiredDecorators: ["@gl.public.view"],${trackData.methods.length > 0 ? `
      requiredMethods: ${methodsList},` : ""}
    },
  }`;
}

for (let lessonId = 1; lessonId <= 30; lessonId++) {
  const nn = String(lessonId).padStart(2, "0");
  const specPath = resolve(SPECS_DIR, `${nn}.ts`);
  let content;
  try {
    content = readFileSync(specPath, "utf8");
  } catch {
    console.log(`  ⚠  ${nn}.ts not found, skipping`);
    continue;
  }

  const lessonData = GIST_SPEC_DATA[lessonId];
  if (!lessonData) continue;

  let updated = content;

  for (const [trackKey, projectPath] of Object.entries(TRACK_MAP)) {
    const trackData = lessonData[trackKey];
    if (!trackData) continue;

    // Update requiredClass in staticChecks for this path
    const classRegex = new RegExp(
      `(${projectPath}:[\\s\\S]*?staticChecks:\\s*\\{[\\s\\S]*?requiredClass:\\s*)"[^"]*"`,
      "g"
    );
    updated = updated.replace(classRegex, `$1"${trackData.klass}"`);

    // Update method field for this path
    const methodRegex = new RegExp(
      `(${projectPath}:[\\s\\S]*?method:\\s*)"[^"]*"`,
      "g"
    );
    updated = updated.replace(methodRegex, `$1"${trackData.method}"`);
  }

  writeFileSync(specPath, updated, "utf8");
  console.log(`  ✓ specs/${nn}.ts`);
}

console.log("\n✅ Spec files updated for PREDICTION_MARKET and INSURANCE.");
