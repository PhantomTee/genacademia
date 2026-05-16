import type { LessonSpecs } from "./index";

const platformMethods = [
  "get_platform_name",
  "get_platform_description",
  "get_owner",
  "update_platform_description",
];

const platformDecorators = [
  { method: "get_platform_name", decorator: "@gl.public.view" },
  { method: "get_platform_description", decorator: "@gl.public.view" },
  { method: "get_owner", decorator: "@gl.public.view" },
  { method: "update_platform_description", decorator: "@gl.public.write" },
];

const platformRules = [
  "gl.message.sender_address == self.owner",
  "len(new_description) > 0",
  "self.platform_description = new_description",
];

export const specs: LessonSpecs = {
  PREDICTION_MARKET: {
    method: "get_platform_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "PredictX",
      requiredMethods: platformMethods,
      requiredMethodDecorators: platformDecorators,
      requiredConcepts: platformRules,
    },
  },
  FREELANCE_ESCROW: {
    method: "get_platform_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "TrustLance",
      requiredMethods: platformMethods,
      requiredMethodDecorators: platformDecorators,
      requiredConcepts: platformRules,
    },
  },
  DAO: {
    method: "get_dao_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "GovMind",
      requiredMethods: [
        "get_dao_name",
        "get_dao_description",
        "get_owner",
        "update_dao_description",
      ],
      requiredMethodDecorators: [
        { method: "get_dao_name", decorator: "@gl.public.view" },
        { method: "get_dao_description", decorator: "@gl.public.view" },
        { method: "get_owner", decorator: "@gl.public.view" },
        { method: "update_dao_description", decorator: "@gl.public.write" },
      ],
      requiredConcepts: [
        "gl.message.sender_address == self.owner",
        "len(new_description) > 0",
        "self.dao_description = new_description",
      ],
    },
  },
  DEVELOPER_REPUTATION: {
    method: "get_platform_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "CodeVault",
      requiredMethods: platformMethods,
      requiredMethodDecorators: platformDecorators,
      requiredConcepts: platformRules,
    },
  },
  INSURANCE: {
    method: "get_court_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "CaseWise",
      requiredMethods: [
        "get_court_name",
        "get_court_rules",
        "get_owner",
        "update_court_rules",
      ],
      requiredMethodDecorators: [
        { method: "get_court_name", decorator: "@gl.public.view" },
        { method: "get_court_rules", decorator: "@gl.public.view" },
        { method: "get_owner", decorator: "@gl.public.view" },
        { method: "update_court_rules", decorator: "@gl.public.write" },
      ],
      requiredConcepts: [
        "gl.message.sender_address == self.owner",
        "len(new_rules) > 0",
        "self.court_rules = new_rules",
      ],
    },
  },
};
