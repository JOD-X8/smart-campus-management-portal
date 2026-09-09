import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { announcementSchema } from "@/schemas/announcement";
import { apiSuccess, apiError } from "@/lib/api-response";
import { NotificationType, TargetAudience } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await authorizeRoles(req, ["ADMIN", "FACULTY", "STUDENT"]);
  if (!auth.authorized) return auth.response!;

  try {
    const { searchParams } = new URL(req.url);
    const audience = searchParams.get("targetAudience");

    const where: any = {};
    if (audience && audience !== "ALL") {
      where.targetAudience = audience;
    }

    // Role-based visibility
    if (auth.user!.role === "STUDENT") {
      where.OR = [
        { targetAudience: TargetAudience.ALL },
        { targetAudience: TargetAudience.STUDENT },
      ];
    } else if (auth.user!.role === "FACULTY") {
      where.OR = [
        { targetAudience: TargetAudience.ALL },
        { targetAudience: TargetAudience.FACULTY },
      ];
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { firstName: true, lastName: true, role: true } },
        department: true,
      },
      take: 50,
    });

    return apiSuccess(announcements);
  } catch (error) {
    console.error("Fetch announcements error:", error);
    return apiError("Failed to fetch announcements", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await authorizeRoles(req, ["ADMIN", "FACULTY"]);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const result = announcementSchema.safeParse(body);

    if (!result.success) {
      return apiError(result.error.errors[0]?.message || "Validation failed", 400);
    }

    const data = result.data;

    const newAnnouncement = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        authorId: auth.user!.id,
        targetAudience: data.targetAudience,
        departmentId: data.departmentId ? data.departmentId : null,
        priority: data.priority,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
      include: {
        author: { select: { firstName: true, lastName: true } },
      },
    });

    // Broadcast alert to users matching target audience
    let targetUsers: { id: string }[] = [];
    if (data.targetAudience === TargetAudience.ALL) {
      targetUsers = await prisma.user.findMany({ select: { id: true }, take: 100 });
    } else if (data.targetAudience === TargetAudience.STUDENT) {
      targetUsers = await prisma.user.findMany({ where: { role: "STUDENT" }, select: { id: true }, take: 100 });
    } else if (data.targetAudience === TargetAudience.FACULTY) {
      targetUsers = await prisma.user.findMany({ where: { role: "FACULTY" }, select: { id: true }, take: 100 });
    }

    for (const u of targetUsers) {
      if (u.id !== auth.user!.id) {
        await prisma.notification.create({
          data: {
            userId: u.id,
            title: `New Announcement: ${data.title}`,
            message: data.content.substring(0, 120) + (data.content.length > 120 ? "..." : ""),
            type: data.priority === "URGENT" ? NotificationType.ALERT : NotificationType.INFO,
            link: "/announcements",
          },
        });
      }
    }

    return apiSuccess(newAnnouncement, "Announcement published successfully", 201);
  } catch (error) {
    console.error("Create announcement error:", error);
    return apiError("Failed to create announcement", 500);
  }
}
