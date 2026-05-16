import type { LessonSpecs } from "./index";

const platformViewMethods = ["get_platform_name", "get_platform_description", "get_owner"];

export const specs: LessonSpecs = {
  PREDICTION_MARKET: {
    method: "get_platform_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "PredictX",
      requiredMethods: platformViewMethods,
      requiredMethodDecorators: platformViewMethods.map((method) => ({
        method,
        decorator: "@gl.public.view",
      })),
      requiredConcepts: [
        "return self.platform_name",
        "return self.platform_description",
        "return self.owner.as_hex",
      ],
    },
  },
  FREELANCE_ESCROW: {
    method: "get_platform_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "TrustLance",
      requiredMethods: platformViewMethods,
      requiredMethodDecorators: platformViewMethods.map((method) => ({
        method,
        decorator: "@gl.public.view",
      })),
      requiredConcepts: [
        "return self.platform_name",
        "return self.platform_description",
        "return self.owner.as_hex",
      ],
    },
  },
  DAO: {
    method: "get_dao_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "GovMind",
      requiredMethods: ["get_dao_name", "get_dao_description", "get_owner"],
      requiredMethodDecorators: [
        "get_dao_name",
        "get_dao_description",
        "get_owner",
      ].map((method) => ({ method, decorator: "@gl.public.view" })),
      requiredConcepts: [
        "return self.dao_name",
        "return self.dao_description",
        "return self.owner.as_hex",
      ],
    },
  },
  DEVELOPER_REPUTATION: {
    method: "get_platform_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "CodeVault",
      requiredMethods: platformViewMethods,
      requiredMethodDecorators: platformViewMethods.map((method) => ({
        method,
        decorator: "@gl.public.view",
      })),
      requiredConcepts: [
        "return self.platform_name",
        "return self.platform_description",
        "return self.owner.as_hex",
      ],
    },
  },
  INSURANCE: {
    method: "get_court_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "CaseWise",
      requiredMethods: ["get_court_name", "get_court_rules", "get_owner"],
      requiredMethodDecorators: [
        "get_court_name",
        "get_court_rules",
        "get_owner",
      ].map((method) => ({ method, decorator: "@gl.public.view" })),
      requiredConcepts: [
        "return self.court_name",
        "return self.court_rules",
        "return self.owner.as_hex",
      ],
    },
  },
};
