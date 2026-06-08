import { useAuth } from "../../features/auth/context/AuthContext";
import { useNavigate } from "react-router";
import { useEffect } from "react";

type AuthRole = "USER" | "ADMIN" | ("USER" | "ADMIN")[];

interface WithAuthProps {
  component: React.ComponentType<any>;
  requiredRole?: AuthRole;
}

/**
 * Higher-Order Component to protect routes with role-based access control
 * Usage: const ProtectedComponent = withAuth(Component, "ADMIN");
 *        const AuthenticatedComponent = withAuth(Component); // any role
 */
export function withAuth(
  Component: React.ComponentType<any>,
  requiredRole?: AuthRole,
) {
  return function ProtectedComponent(props: any) {
    const { role, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      // Skip redirect while loading
      if (loading) {
        return;
      }

      // Redirect unauthenticated users to login
      if (!isAuthenticated) {
        navigate("/login", { replace: true });
        return;
      }

      // Check role if required
      if (requiredRole && role) {
        const requiredRoles = Array.isArray(requiredRole)
          ? requiredRole
          : [requiredRole];

        if (!requiredRoles.includes(role)) {
          // Redirect to dashboard/home page if user doesn't have the required role
          navigate("/", { replace: true });
        }
      }
    }, [isAuthenticated, role, requiredRole, navigate, loading]);

    // Show nothing while loading
    if (loading) {
      return null;
    }

    // Not authenticated - will redirect in useEffect
    if (!isAuthenticated) {
      return null;
    }

    // Check role authorization - render nothing and let useEffect handle redirect
    if (requiredRole && role) {
      const requiredRoles = Array.isArray(requiredRole)
        ? requiredRole
        : [requiredRole];

      if (!requiredRoles.includes(role)) {
        return null;
      }
    }

    return <Component {...props} />;
  };
}
