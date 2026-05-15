import type { LessonSpecs } from "./index";

export const specs: LessonSpecs = {
  PREDICTION_MARKET: {
    method: "get_all_markets_json",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "PredictX",
      requiredConcepts: ["exec_prompt", "run_nondet_unsafe"],
    },
  },
  FREELANCE_ESCROW: {
    method: "get_title",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "FreelanceEscrow",
      requiredConcepts: ["exec_prompt", "run_nondet_unsafe"],
    },
  },
  DAO: {
    method: "get_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "GovernanceDAO",
      requiredConcepts: ["exec_prompt", "run_nondet_unsafe"],
    },
  },
  DEVELOPER_REPUTATION: {
    method: "get_registry_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "DeveloperReputation",
      requiredConcepts: ["exec_prompt", "run_nondet_unsafe"],
    },
  },
  INSURANCE: {
    method: "get_case_json",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "CaseWise",
      requiredConcepts: ["exec_prompt", "run_nondet_unsafe"],
    },
  },
};
