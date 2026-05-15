import type { LessonSpecs } from "./index";

export const specs: LessonSpecs = {
  PREDICTION_MARKET: {
    method: "get_contract_summary",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "PredictX",
      requiredDecorators: ["@gl.public.view", "@gl.public.write"],
      requiredConcepts: ["gl.vm.UserError", "Address"],
    },
  },
  FREELANCE_ESCROW: {
    method: "get_title",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "FreelanceEscrow",
      requiredDecorators: ["@gl.public.view", "@gl.public.write"],
      requiredConcepts: ["gl.vm.UserError", "Address"],
    },
  },
  DAO: {
    method: "get_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "GovernanceDAO",
      requiredDecorators: ["@gl.public.view", "@gl.public.write"],
      requiredConcepts: ["gl.vm.UserError", "Address"],
    },
  },
  DEVELOPER_REPUTATION: {
    method: "get_registry_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "DeveloperReputation",
      requiredDecorators: ["@gl.public.view", "@gl.public.write"],
      requiredConcepts: ["gl.vm.UserError", "Address"],
    },
  },
  INSURANCE: {
    method: "get_contract_summary",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "CaseWise",
      requiredDecorators: ["@gl.public.view", "@gl.public.write"],
      requiredConcepts: ["gl.vm.UserError", "Address"],
    },
  },
};
