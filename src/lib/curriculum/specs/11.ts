import type { LessonSpecs } from "./index";

export const specs: LessonSpecs = {
  PREDICTION_MARKET: {
    method: "get_platform_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "PredictX",
      requiredConcepts: ["TreeMap"],
    },
  },
  FREELANCE_ESCROW: {
    method: "get_title",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "FreelanceEscrow",
      requiredConcepts: ["TreeMap"],
    },
  },
  DAO: {
    method: "get_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "GovernanceDAO",
      requiredConcepts: ["TreeMap"],
    },
  },
  DEVELOPER_REPUTATION: {
    method: "get_registry_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "DeveloperReputation",
      requiredConcepts: ["TreeMap"],
    },
  },
  INSURANCE: {
    method: "get_court_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "CaseWise",
      requiredConcepts: ["TreeMap"],
    },
  },
};
