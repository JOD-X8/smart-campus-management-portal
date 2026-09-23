import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role === "ADMIN") redirect("/admin");
  if (session.role === "FACULTY") redirect("/faculty");
  redirect("/student");
}
