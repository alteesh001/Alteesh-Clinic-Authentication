import { Router, type IRouter, type Request, type Response } from "express";
import { getAuth } from "@clerk/express";
import { and, count, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  clinicUsersTable,
  type ClinicUser,
} from "@workspace/db/schema";
import {
  BootstrapAdminBody,
  type AuthProfile,
} from "@workspace/api-zod";

const router: IRouter = Router();

function currentUserId(req: Request): string | null {
  return getAuth(req).userId ?? null;
}

function emailFromClaims(req: Request): string | null {
  const claims = getAuth(req).sessionClaims as Record<string, unknown> | null;
  return typeof claims?.email === "string" ? claims.email : null;
}

function toAuthProfile(user: ClinicUser): AuthProfile {
  return {
    id: user.clerkUserId,
    email: user.email ?? "",
    fullName: user.fullName,
    role: user.role as AuthProfile["role"],
    clinicName: user.clinicName,
    isOnboarded: true,
  };
}

function requireUser(req: Request, res: Response): string | null {
  const userId = currentUserId(req);
  if (!userId) {
    res.status(401).json({ error: "You must be signed in." });
    return null;
  }
  return userId;
}

router.get("/auth/status", async (_req, res) => {
  const [{ value }] = await db
    .select({ value: count() })
    .from(clinicUsersTable)
    .where(eq(clinicUsersTable.role, "super_admin"));

  const owner = await db
    .select({ clinicName: clinicUsersTable.clinicName })
    .from(clinicUsersTable)
    .where(eq(clinicUsersTable.role, "super_admin"))
    .limit(1);

  res.json({
    configured: Number(value) > 0,
    clinicName: owner[0]?.clinicName ?? null,
  });
});

router.get("/auth/me", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  const rows = await db
    .select()
    .from(clinicUsersTable)
    .where(eq(clinicUsersTable.clerkUserId, userId))
    .limit(1);

  const user = rows[0];
  if (!user) {
    res.status(404).json({ error: "Your clinic profile has not been created yet." });
    return;
  }

  res.json(toAuthProfile(user));
});

router.post("/auth/bootstrap-admin", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  const parsed = BootstrapAdminBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Enter your full name and clinic name." });
    return;
  }

  const [{ value }] = await db
    .select({ value: count() })
    .from(clinicUsersTable)
    .where(eq(clinicUsersTable.role, "super_admin"));

  if (Number(value) > 0) {
    res.status(409).json({ error: "Clinic onboarding is already complete." });
    return;
  }

  const [user] = await db
    .insert(clinicUsersTable)
    .values({
      clerkUserId: userId,
      email: emailFromClaims(req),
      fullName: parsed.data.fullName,
      role: "super_admin",
      clinicName: parsed.data.clinicName,
    })
    .returning();

  res.status(201).json(toAuthProfile(user));
});

export default router;