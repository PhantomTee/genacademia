import type { LessonSpecs } from "./index";

export const specs: LessonSpecs = {
  PREDICTION_MARKET: {
    method: "get_market_json",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "PredictX",
      requiredConcepts: ["@dataclass"],
    },
  },
  FREELANCE_ESCROW: {
    method: "get_title",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "FreelanceEscrow",
      requiredConcepts: ["@dataclass"],
    },
  },
  DAO: {
    method: "get_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "GovernanceDAO",
      requiredConcepts: ["@dataclass"],
    },
  },
  DEVELOPER_REPUTATION: {
    method: "get_registry_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "DeveloperReputation",
      requiredConcepts: ["@dataclass"],
    },
  },
  INSURANCE: {
    method: "get_case_json",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "CaseWise",
      requiredConcepts: ["@dataclass"],
    },
  },
};
