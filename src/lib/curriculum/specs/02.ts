import type { LessonSpecs } from "./index";

export const specs: LessonSpecs = {
  PREDICTION_MARKET: {
    staticChecks: {
      requiredClass: "PredictX",
      requiredConcepts: [
        "owner: Address",
        "platform_name: str",
        "platform_description: str",
        "self.owner = gl.message.sender_address",
        "self.platform_description =",
      ],
      requiredStrings: [
        "A GenLayer prediction market that uses AI-assisted resolution.",
      ],
    },
  },
  FREELANCE_ESCROW: {
    staticChecks: {
      requiredClass: "TrustLance",
      requiredConcepts: [
        "owner: Address",
        "platform_name: str",
        "platform_description: str",
        "self.owner = gl.message.sender_address",
        "self.platform_description =",
      ],
      requiredStrings: ["A GenLayer freelance escrow platform."],
    },
  },
  DAO: {
    staticChecks: {
      requiredClass: "GovMind",
      requiredConcepts: [
        "owner: Address",
        "dao_name: str",
        "dao_description: str",
        "self.owner = gl.message.sender_address",
        "self.dao_description =",
      ],
      requiredStrings: [
        "An AI-governed decentralised autonomous organisation.",
      ],
    },
  },
  DEVELOPER_REPUTATION: {
    staticChecks: {
      requiredClass: "CodeVault",
      requiredConcepts: [
        "owner: Address",
        "platform_name: str",
        "platform_description: str",
        "self.owner = gl.message.sender_address",
        "self.platform_description =",
      ],
      requiredStrings: ["A GenLayer private code marketplace."],
    },
  },
  INSURANCE: {
    staticChecks: {
      requiredClass: "CaseWise",
      requiredConcepts: [
        "owner: Address",
        "court_name: str",
        "court_rules: str",
        "self.owner = gl.message.sender_address",
        "self.court_rules =",
      ],
      requiredStrings: [
        "Parties submit cases and evidence for AI-assisted review.",
      ],
    },
  },
};
