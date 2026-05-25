import { ReactNode } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../features/auth/context/AuthContext";
import { Unauthorized } from "../../features/marketing/pages/Unauthorized";

export interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "USER" | "ADMIN" | ("USER" | "ADMIN")[];
  fallback?: ReactNode;
}

/**
 * Route protection component that enforces role-based access control
 * Redirects to Unauthorized page if user doesn't have required role
 */
export function ProtectedRoute({
  children,
  requiredRole,
  fallback,
}: ProtectedRouteProps) {
  const { role, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    navigate("/login", { replace: true });
    return null;
  }

  // No role requirement - allow access
  if (!requiredRole) {
    return <>{children}</>;
  }

  // Check if user has required role(s)
  const requiredRoles = Array.isArray(requiredRole)
    ? requiredRole
    : [requiredRole];

  if (!role || !requiredRoles.includes(role)) {
    return fallback || <Unauthorized requiredRole={requiredRole} />;
  }

  return <>{children}</>;
}
