import type { LessonSpecs } from "./index";

export const specs: LessonSpecs = {
  PREDICTION_MARKET: {
    method: "get_all_markets_json",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "PredictX",
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
    method: "get_all_cases_json",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "CaseWise",
      requiredConcepts: ["__receive_"],
    },
  },
};
