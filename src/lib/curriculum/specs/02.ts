import type { LessonSpecs } from "./index";

export const specs: LessonSpecs = {
  PREDICTION_MARKET: {
    method: "get_platform_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "PredictX",
      requiredDecorators: ["@gl.public.write"],
      requiredConcepts: ["gl.message.sender_address"],
    },
  },
  FREELANCE_ESCROW: {
    method: "get_title",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "FreelanceEscrow",
      requiredDecorators: ["@gl.public.write"],
      requiredConcepts: ["gl.message.sender_address"],
    },
  },
  DAO: {
    method: "get_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "GovernanceDAO",
      requiredDecorators: ["@gl.public.write"],
      requiredConcepts: ["gl.message.sender_address"],
    },
  },
  DEVELOPER_REPUTATION: {
    method: "get_registry_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "DeveloperReputation",
      requiredDecorators: ["@gl.public.write"],
      requiredConcepts: ["gl.message.sender_address"],
    },
  },
  INSURANCE: {
    method: "get_court_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "CaseWise",
      requiredDecorators: ["@gl.public.write"],
      requiredConcepts: ["gl.message.sender_address"],
    },
  },
};
