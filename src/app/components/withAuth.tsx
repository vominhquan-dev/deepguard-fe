import { useAuth } from "../../features/auth/context/AuthContext";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { Unauthorized } from "../../features/marketing/pages/Unauthorized";

type AuthRole = "USER" | "ADMIN" | ("USER" | "ADMIN")[];

interface WithAuthProps {
  component: React.ComponentType<any>;
  requiredRole?: AuthRole;
}

/**
 * Higher-Order Component to protect routes with role-based access control
 * Usage: const ProtectedComponent = withAuth(Component, "ADMIN");
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
      // If role is not available yet, we'll skip the check and let it render
      // Role will be available from login response or fetched from API
      if (requiredRole && role) {
        const requiredRoles = Array.isArray(requiredRole)
          ? requiredRole
          : [requiredRole];

        if (!requiredRoles.includes(role)) {
          navigate("/unauthorized", {
            replace: true,
            state: { required: requiredRole },
          });
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

    // Check role authorization
    if (requiredRole && role) {
      const requiredRoles = Array.isArray(requiredRole)
        ? requiredRole
        : [requiredRole];

      if (!requiredRoles.includes(role)) {
        return <Unauthorized requiredRole={requiredRole} />;
      }
    }

    return <Component {...props} />;
  };
}
