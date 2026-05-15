import type { LessonSpecs } from "./index";

export const specs: LessonSpecs = {
  PREDICTION_MARKET: {
    method: "get_resolution_prompt",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "PredictX",
      requiredDecorators: ["@gl.public.write.payable"],
      requiredConcepts: ["gl.message.value"],
    },
  },
  FREELANCE_ESCROW: {
    method: "get_title",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "FreelanceEscrow",
      requiredDecorators: ["@gl.public.write.payable"],
      requiredConcepts: ["gl.message.value"],
    },
  },
  DAO: {
    method: "get_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "GovernanceDAO",
      requiredDecorators: ["@gl.public.write.payable"],
      requiredConcepts: ["gl.message.value"],
    },
  },
  DEVELOPER_REPUTATION: {
    method: "get_registry_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "DeveloperReputation",
      requiredDecorators: ["@gl.public.write.payable"],
      requiredConcepts: ["gl.message.value"],
    },
  },
  INSURANCE: {
    method: "get_case_review_prompt",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "CaseWise",
      requiredDecorators: ["@gl.public.write.payable"],
      requiredConcepts: ["gl.message.value"],
    },
  },
};
