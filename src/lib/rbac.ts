import { NextRequest } from "next/server";
import { getSessionFromRequest, SessionUser } from "./auth";
import { apiUnauthorized, apiForbidden } from "./api-response";

export type Role = "ADMIN" | "FACULTY" | "STUDENT";

export async function authorizeRoles(
  req: NextRequest,
  allowedRoles: Role[]
): Promise<{ authorized: boolean; user: SessionUser | null; response?: ReturnType<typeof apiUnauthorized> }> {
  const user = await getSessionFromRequest(req);

  if (!user) {
    return {
      authorized: false,
      user: null,
      response: apiUnauthorized("Authentication required to access this resource"),
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      authorized: false,
      user,
      response: apiForbidden(`Access denied. Role ${user.role} is not permitted.`),
    };
  }

  return { authorized: true, user };
}

export function isAuthorizedRole(userRole: Role | undefined, allowedRoles: Role[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}
