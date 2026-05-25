import { useAuth } from "../context/AuthContext";

/**
 * Hook to check authorization at component level
 * Useful for conditional rendering, hiding menu items, etc.
 *
 * @example
 * const { canAccess, isAdmin } = useAuthorizationCheck("ADMIN");
 * if (!canAccess) return null; // Hide component
 *
 * @example
 * const { isAdmin, isUser } = useAuthorizationCheck();
 * return <AdminPanel hidden={!isAdmin} />
 */
export function useAuthorizationCheck(
  requiredRole?: "USER" | "ADMIN" | ("USER" | "ADMIN")[],
) {
  const { role, isAuthenticated } = useAuth();

  const requiredRoles = requiredRole
    ? Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole]
    : null;

  const canAccess =
    isAuthenticated &&
    (!requiredRoles || (role && requiredRoles.includes(role)));
  const isAdmin = role === "ADMIN";
  const isUser = role === "USER";

  return {
    canAccess,
    isAdmin,
    isUser,
    role,
    isAuthenticated,
  };
}
