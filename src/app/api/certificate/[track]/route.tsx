import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CAPSTONE_NAMES, CAPSTONE_TAGLINES } from "@/lib/curriculum/metadata";
import type { ProjectPath } from "@/lib/curriculum/metadata";
import React from "react";
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#0d0d0d",
    padding: 60,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  border: {
    borderWidth: 1,
    borderColor: "#ffffff22",
    padding: 48,
    width: "100%",
    alignItems: "center",
  },
  label: {
    fontSize: 9,
    color: "#ffffff55",
    letterSpacing: 4,
    marginBottom: 20,
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: "#ffffff33",
    marginBottom: 36,
    marginTop: 4,
  },
  certText: {
    fontSize: 11,
    color: "#ffffff99",
    textAlign: "center",
    marginBottom: 12,
  },
  wallet: {
    fontSize: 9,
    color: "#ffffff44",
    textAlign: "center",
    marginBottom: 32,
    fontFamily: "Courier",
  },
  trackName: {
    fontSize: 22,
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: 3,
    marginBottom: 6,
  },
  trackTagline: {
    fontSize: 11,
    color: "#ffffff66",
    textAlign: "center",
    marginBottom: 32,
  },
  date: {
    fontSize: 9,
    color: "#ffffff33",
    letterSpacing: 2,
    marginTop: 8,
  },
  brand: {
    position: "absolute",
    bottom: 28,
    fontSize: 8,
    color: "#ffffff1a",
    letterSpacing: 4,
  },
});

const VALID_PATHS: ProjectPath[] = [
  "PREDICTION_MARKET",
  "FREELANCE_ESCROW",
  "DAO",
  "DEVELOPER_REPUTATION",
  "INSURANCE",
];

export async function GET(
  _req: NextRequest,
  { params }: { params: { track: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const track = params.track as ProjectPath;
  if (!VALID_PATHS.includes(track)) {
    return NextResponse.json({ error: "Invalid track" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { walletAddress: session.user.walletAddress },
    include: { progress: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const completedInTrack = user.progress.filter(
    (p) => p.projectPath === track && p.completed
  ).length;

  if (completedInTrack < 30) {
    return NextResponse.json(
      { error: "Complete all 30 lessons to earn a certificate" },
      { status: 403 }
    );
  }

  const latestCompletion = user.progress
    .filter((p) => p.projectPath === track && p.completed && p.completedAt)
    .map((p) => p.completedAt!)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const completedDate = (latestCompletion ?? new Date()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const wallet = session.user.walletAddress;
  const shortWallet = `${wallet.slice(0, 10)}...${wallet.slice(-8)}`;
  const trackName = CAPSTONE_NAMES[track];
  const tagline = CAPSTONE_TAGLINES[track];

  const pdf = await renderToBuffer(
    <Document title={`${trackName} — GenAcademia Certificate`}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <Text style={styles.label}>CERTIFICATE OF COMPLETION</Text>
          <View style={styles.divider} />
          <Text style={styles.certText}>This certifies that</Text>
          <Text style={styles.wallet}>{shortWallet}</Text>
          <Text style={styles.certText}>has successfully completed all 30 lessons of</Text>
          <Text style={styles.trackName}>{trackName}</Text>
          <Text style={styles.trackTagline}>{tagline}</Text>
          <Text style={styles.certText}>earning 6 milestone badges on the GenLayer Network</Text>
          <View style={styles.divider} />
          <Text style={styles.date}>{completedDate.toUpperCase()}</Text>
        </View>
        <Text style={styles.brand}>GENACADEMIA</Text>
      </Page>
    </Document>
  );

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="genacademia-${trackName.toLowerCase().replace(/\s/g, "-")}-certificate.pdf"`,
    },
  });
}
