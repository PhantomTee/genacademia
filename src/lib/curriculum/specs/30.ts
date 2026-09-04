import type { LessonSpecs } from "./index";

/**
 * Capstone verification.
 *
 * Earlier revisions checked only the class name and that an identity getter
 * returned a non-empty string, which every path passed while its state, value
 * and AI workflows were broken or missing entirely. These specs instead assert
 * the workflows each capstone task claims are complete:
 *
 * - state: the id index is appended to, and the JSON view over it is callable
 * - value: payable entry points and payouts use the taught transfer interface
 * - AI: non-deterministic review runs through gl.vm.run_nondet_unsafe
 *
 * The deployed check reads the "all items" view and requires a JSON array, so
 * a contract whose index view is missing or returns the wrong type fails even
 * though its name still reads correctly.
 */
function hasIndexedItems(actual: unknown): boolean {
  const raw = typeof actual === "string" ? actual : JSON.stringify(actual);
  try {
    const parsed = JSON.parse(raw);
    // Non-empty is the point: an id index that was never appended to reads as
    // [], so requiring at least one entry proves the write path really ran.
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

export const specs: LessonSpecs = {
  PREDICTION_MARKET: {
    customMessage:
      "The deployed contract returned an empty index. Call the create method to create at least one market, then verify again so the index view proves stored state.",
    method: "get_all_markets_json",
    args: [],
    expectedShape: "custom",
    customCheck: hasIndexedItems,
    staticChecks: {
      requiredClass: "PredictX",
      requiredMethods: [
        "create_market",
        "get_all_markets_json",
        "get_active_markets_json",
        "stake_on_outcome",
        "close_market",
        "resolve_with_ai",
        "claim_winnings",
      ],
      requiredMethodDecorators: [
        {
          method: "stake_on_outcome",
          decorator: "@gl.public.write.payable",
          hint: "Staking receives GEN, so it must be declared @gl.public.write.payable.",
        },
        {
          method: "get_all_markets_json",
          decorator: "@gl.public.view",
          hint: "Read-only JSON views must be declared @gl.public.view.",
        },
      ],
      requiredConcepts: [
        "self.market_ids.append(market_id)",
        "gl.message.value",
        ".emit_transfer(value=",
        "gl.vm.run_nondet_unsafe(",
      ],
    },
  },
  FREELANCE_ESCROW: {
    customMessage:
      "The deployed contract returned an empty index. Call the create method to create at least one job, then verify again so the index view proves stored state.",
    method: "get_all_jobs_json",
    args: [],
    expectedShape: "custom",
    customCheck: hasIndexedItems,
    staticChecks: {
      requiredClass: "TrustLance",
      requiredMethods: [
        "create_job",
        "get_all_jobs_json",
        "get_open_jobs_json",
        "fund_job",
        "accept_job",
        "submit_delivery",
        "confirm_delivery",
        "review_dispute_with_ai",
      ],
      requiredMethodDecorators: [
        {
          method: "fund_job",
          decorator: "@gl.public.write.payable",
          hint: "Escrow funding receives GEN, so it must be declared @gl.public.write.payable.",
        },
        {
          method: "get_all_jobs_json",
          decorator: "@gl.public.view",
          hint: "Read-only JSON views must be declared @gl.public.view.",
        },
      ],
      requiredConcepts: [
        "self.job_ids.append(job_id)",
        "gl.message.value",
        ".emit_transfer(value=",
        "gl.vm.run_nondet_unsafe(",
      ],
    },
  },
  DAO: {
    customMessage:
      "The deployed contract returned an empty index. Call the create method to create at least one proposal, then verify again so the index view proves stored state.",
    method: "get_all_proposals_json",
    args: [],
    expectedShape: "custom",
    customCheck: hasIndexedItems,
    staticChecks: {
      requiredClass: "GovMind",
      requiredMethods: [
        "create_proposal",
        "get_all_proposals_json",
        "get_open_proposals_json",
        "vote",
        "execute_proposal",
        "analyze_proposal_with_ai",
      ],
      requiredMethodDecorators: [
        {
          method: "get_all_proposals_json",
          decorator: "@gl.public.view",
          hint: "Read-only JSON views must be declared @gl.public.view.",
        },
      ],
      requiredConcepts: [
        "self.proposal_ids.append(proposal_id)",
        "gl.vm.run_nondet_unsafe(",
      ],
    },
  },
  DEVELOPER_REPUTATION: {
    customMessage:
      "The deployed contract returned an empty index. Call the create method to create at least one listing, then verify again so the index view proves stored state.",
    method: "get_all_listings_json",
    args: [],
    expectedShape: "custom",
    customCheck: hasIndexedItems,
    staticChecks: {
      requiredClass: "CodeVault",
      requiredMethods: [
        "create_listing",
        "get_all_listings_json",
        "get_active_listings_json",
        "buy_listing",
        "confirm_purchase",
        "evaluate_listing_with_ai",
      ],
      requiredMethodDecorators: [
        {
          method: "buy_listing",
          decorator: "@gl.public.write.payable",
          hint: "Buying escrows GEN, so it must be declared @gl.public.write.payable.",
        },
        {
          method: "get_all_listings_json",
          decorator: "@gl.public.view",
          hint: "Read-only JSON views must be declared @gl.public.view.",
        },
      ],
      requiredConcepts: [
        "self.listing_ids.append(listing_id)",
        "gl.message.value",
        ".emit_transfer(value=",
        "gl.vm.run_nondet_unsafe(",
      ],
    },
  },
  INSURANCE: {
    customMessage:
      "The deployed contract returned an empty index. Call the create method to submit at least one case, then verify again so the index view proves stored state.",
    method: "get_all_cases_json",
    args: [],
    expectedShape: "custom",
    customCheck: hasIndexedItems,
    staticChecks: {
      requiredClass: "CaseWise",
      requiredMethods: [
        "submit_case",
        "get_all_cases_json",
        "get_open_cases_json",
        "pay_case_fee",
        "add_evidence",
        "review_case_with_ai",
        "rule_case_manually",
        "appeal_case",
      ],
      requiredMethodDecorators: [
        {
          method: "pay_case_fee",
          decorator: "@gl.public.write.payable",
          hint: "The case fee receives GEN, so it must be declared @gl.public.write.payable.",
        },
        {
          method: "get_all_cases_json",
          decorator: "@gl.public.view",
          hint: "Read-only JSON views must be declared @gl.public.view.",
        },
      ],
      requiredConcepts: [
        "self.case_ids.append(case_id)",
        "gl.message.value",
        "gl.vm.run_nondet_unsafe(",
      ],
    },
  },
};
