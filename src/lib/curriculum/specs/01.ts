import type { LessonSpecs } from "./index";

export const specs: LessonSpecs = {
  PREDICTION_MARKET: {
    method: "get_project_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "PredictX",
      requiredMethods: ["get_project_name"],
      requiredMethodDecorators: [
        { method: "get_project_name", decorator: "@gl.public.view" },
      ],
      requiredConcepts: ["project_name: str", "return self.project_name"],
      requiredStrings: ["PredictX: AI-Resolved Prediction Market"],
    },
  },
  FREELANCE_ESCROW: {
    method: "get_project_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "TrustLance",
      requiredMethods: ["get_project_name"],
      requiredMethodDecorators: [
        { method: "get_project_name", decorator: "@gl.public.view" },
      ],
      requiredConcepts: ["project_name: str", "return self.project_name"],
      requiredStrings: ["TrustLance: Freelance Escrow Platform"],
    },
  },
  DAO: {
    method: "get_project_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "GovMind",
      requiredMethods: ["get_project_name"],
      requiredMethodDecorators: [
        { method: "get_project_name", decorator: "@gl.public.view" },
      ],
      requiredConcepts: ["project_name: str", "return self.project_name"],
      requiredStrings: ["GovMind: AI-Governed DAO"],
    },
  },
  DEVELOPER_REPUTATION: {
    method: "get_project_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "CodeVault",
      requiredMethods: ["get_project_name"],
      requiredMethodDecorators: [
        { method: "get_project_name", decorator: "@gl.public.view" },
      ],
      requiredConcepts: ["project_name: str", "return self.project_name"],
      requiredStrings: ["CodeVault: Private Code Marketplace"],
    },
  },
  INSURANCE: {
    method: "get_project_name",
    args: [],
    expectedShape: "nonEmpty",
    staticChecks: {
      requiredClass: "CaseWise",
      requiredMethods: ["get_project_name"],
      requiredMethodDecorators: [
        { method: "get_project_name", decorator: "@gl.public.view" },
      ],
      requiredConcepts: ["project_name: str", "return self.project_name"],
      requiredStrings: ["CaseWise: AI-Assisted Dispute Resolution"],
    },
  },
};
