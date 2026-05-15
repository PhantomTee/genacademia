import type { LessonSpecs } from "./index";

export const specs: LessonSpecs = {
  PREDICTION_MARKET: {
    method: "get_question",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "PredictionMarket",
      requiredConcepts: ["gl.send"],
    },
  },
  FREELANCE_ESCROW: {
    method: "get_title",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "FreelanceEscrow",
      requiredConcepts: ["gl.send"],
    },
  },
  DAO: {
    method: "get_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "GovernanceDAO",
      requiredConcepts: ["gl.send"],
    },
  },
  DEVELOPER_REPUTATION: {
    method: "get_registry_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "DeveloperReputation",
      requiredConcepts: ["gl.send"],
    },
  },
  INSURANCE: {
    method: "get_pool_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "InsurancePool",
      requiredConcepts: ["gl.send"],
    },
  },
};
