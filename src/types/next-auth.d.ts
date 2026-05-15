import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      walletAddress: string;
      experienceLevel: string | null;
      projectPath: string | null;
      networkTarget: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    walletAddress: string;
    experienceLevel: string | null;
    projectPath: string | null;
    networkTarget: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    walletAddress?: string;
    experienceLevel?: string | null;
    projectPath?: string | null;
    networkTarget?: string;
  }
}
