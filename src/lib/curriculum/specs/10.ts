import type { LessonSpecs } from "./index";

export const specs: LessonSpecs = {
  PREDICTION_MARKET: {
    method: "get_question",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "PredictionMarket",
      requiredConcepts: ["exec_prompt", "web.get"],
    },
  },
  FREELANCE_ESCROW: {
    method: "get_title",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "FreelanceEscrow",
      requiredConcepts: ["exec_prompt", "web.get"],
    },
  },
  DAO: {
    method: "get_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "GovernanceDAO",
      requiredConcepts: ["exec_prompt", "web.get"],
    },
  },
  DEVELOPER_REPUTATION: {
    method: "get_registry_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "DeveloperReputation",
      requiredConcepts: ["exec_prompt", "web.get"],
    },
  },
  INSURANCE: {
    method: "get_pool_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "InsurancePool",
      requiredConcepts: ["exec_prompt", "web.get"],
    },
  },
};
