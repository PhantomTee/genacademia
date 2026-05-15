import type { LessonSpecs } from "./index";

export const specs: LessonSpecs = {
  PREDICTION_MARKET: {
    method: "get_question",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "PredictionMarket",
      requiredConcepts: ["__receive_"],
    },
  },
  FREELANCE_ESCROW: {
    method: "get_title",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "FreelanceEscrow",
      requiredConcepts: ["__receive_"],
    },
  },
  DAO: {
    method: "get_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "GovernanceDAO",
      requiredConcepts: ["__receive_"],
    },
  },
  DEVELOPER_REPUTATION: {
    method: "get_registry_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "DeveloperReputation",
      requiredConcepts: ["__receive_"],
    },
  },
  INSURANCE: {
    method: "get_pool_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "InsurancePool",
      requiredConcepts: ["__receive_"],
    },
  },
};
