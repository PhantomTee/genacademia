import type { LessonSpecs } from "./index";

export const specs: LessonSpecs = {
  PREDICTION_MARKET: {
    method: "get_all_markets_json",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "PredictX",
      requiredDecorators: ["@gl.public.write.payable"],
      requiredConcepts: ["gl.send"],
    },
  },
  FREELANCE_ESCROW: {
    method: "get_title",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "FreelanceEscrow",
      requiredDecorators: ["@gl.public.write.payable"],
      requiredConcepts: ["gl.send"],
    },
  },
  DAO: {
    method: "get_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "GovernanceDAO",
      requiredDecorators: ["@gl.public.write.payable"],
      requiredConcepts: ["gl.send"],
    },
  },
  DEVELOPER_REPUTATION: {
    method: "get_registry_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "DeveloperReputation",
      requiredDecorators: ["@gl.public.write.payable"],
      requiredConcepts: ["gl.send"],
    },
  },
  INSURANCE: {
    method: "get_all_cases_json",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "CaseWise",
      requiredDecorators: ["@gl.public.write.payable"],
      requiredConcepts: ["gl.send"],
    },
  },
};
