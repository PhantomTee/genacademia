import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.message || !credentials?.signature) return null;

        try {
          const siweMessage = new SiweMessage(
            JSON.parse(credentials.message)
          );

          const result = await siweMessage.verify({
            signature: credentials.signature,
          });

          if (!result.success) return null;

          const address = siweMessage.address;
          const nonce = siweMessage.nonce;

          const authNonce = await prisma.authNonce.findUnique({
            where: { nonce },
          });

          if (!authNonce) return null;
          if (authNonce.usedAt) return null;
          if (new Date() > authNonce.expiresAt) return null;
          if (authNonce.address.toLowerCase() !== address.toLowerCase())
            return null;

          await prisma.authNonce.update({
            where: { nonce },
            data: { usedAt: new Date() },
          });

          const user = await prisma.user.upsert({
            where: { walletAddress: address },
            create: { walletAddress: address },
            update: {},
          });

          return {
            id: user.id,
            walletAddress: user.walletAddress,
            experienceLevel: user.experienceLevel,
            projectPath: user.projectPath,
            networkTarget: user.networkTarget,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.walletAddress = user.walletAddress;
        token.experienceLevel = user.experienceLevel;
        token.projectPath = user.projectPath;
        token.networkTarget = user.networkTarget;
      }
      // Called when useSession().update() is invoked — re-read DB so the
      // cookie reflects onboarding changes made since sign-in.
      if (trigger === "update" && token.walletAddress) {
        const dbUser = await prisma.user.findUnique({
          where: { walletAddress: token.walletAddress as string },
          select: { experienceLevel: true, projectPath: true, networkTarget: true },
        });
        if (dbUser) {
          token.experienceLevel = dbUser.experienceLevel;
          token.projectPath = dbUser.projectPath;
          token.networkTarget = dbUser.networkTarget;
        }
      }
      return token;
    },
    session({ session, token }) {
      session.user.walletAddress = token.walletAddress ?? "";
      session.user.experienceLevel = token.experienceLevel ?? null;
      session.user.projectPath = token.projectPath ?? null;
      session.user.networkTarget = token.networkTarget ?? "studionet";
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};
