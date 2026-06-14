<?php

declare(strict_types=1);

namespace TicketSpace\Middleware;

use TicketSpace\Utils\Response;

/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * Checks if the authenticated user has the required role(s) or permission(s)
 * to access a specific route. Must be placed AFTER AuthMiddleware in the pipeline.
 */
class RBACMiddleware
{
    private array $requiredRoles;
    private array $requiredPermissions;
    private bool $requireAll;

    /**
     * @param array $roles       Required role slugs (e.g., ['host', 'admin'])
     * @param array $permissions Required permission slugs (e.g., ['events.create'])
     * @param bool  $requireAll  If true, user must have ALL roles/permissions. If false, ANY.
     */
    public function __construct(
        array $roles = [],
        array $permissions = [],
        bool $requireAll = false
    ) {
        $this->requiredRoles = $roles;
        $this->requiredPermissions = $permissions;
        $this->requireAll = $requireAll;
    }

    /**
     * Check access and pass to next middleware if authorized.
     */
    public function handle(callable $next, array $params): mixed
    {
        $user = $_REQUEST['_user'] ?? null;

        if ($user === null) {
            Response::unauthorized('Authentication required');
            return null;
        }

        $userRoles = $user['roles'] ?? [];

        // Super admin bypasses all checks
        if (in_array('super_admin', $userRoles, true)) {
            return $next($params);
        }

        // Check roles
        if (!empty($this->requiredRoles)) {
            if ($this->requireAll) {
                // User must have ALL required roles
                $hasAll = empty(array_diff($this->requiredRoles, $userRoles));
                if (!$hasAll) {
                    Response::forbidden('Insufficient role. Required: ' . implode(', ', $this->requiredRoles));
                    return null;
                }
            } else {
                // User must have ANY of the required roles
                $hasAny = !empty(array_intersect($this->requiredRoles, $userRoles));
                if (!$hasAny) {
                    Response::forbidden('Insufficient role. Requires one of: ' . implode(', ', $this->requiredRoles));
                    return null;
                }
            }
        }

        // Check permissions (if we need granular permission checking)
        if (!empty($this->requiredPermissions)) {
            $userPermissions = $this->getUserPermissions($user['id']);

            if ($this->requireAll) {
                $hasAll = empty(array_diff($this->requiredPermissions, $userPermissions));
                if (!$hasAll) {
                    Response::forbidden('Insufficient permissions');
                    return null;
                }
            } else {
                $hasAny = !empty(array_intersect($this->requiredPermissions, $userPermissions));
                if (!$hasAny) {
                    Response::forbidden('Insufficient permissions');
                    return null;
                }
            }
        }

        return $next($params);
    }

    /**
     * Get all permissions for a user by querying the database.
     * Permissions are derived from the user's roles.
     */
    private function getUserPermissions(int $userId): array
    {
        try {
            $db = \TicketSpace\Utils\Database::getInstance();
            $stmt = $db->prepare('
                SELECT DISTINCT p.slug
                FROM permissions p
                INNER JOIN role_permissions rp ON rp.permission_id = p.id
                INNER JOIN user_roles ur ON ur.role_id = rp.role_id
                WHERE ur.user_id = :user_id
            ');
            $stmt->execute([':user_id' => $userId]);
            return $stmt->fetchAll(\PDO::FETCH_COLUMN);
        } catch (\Exception $e) {
            \TicketSpace\Utils\Logger::error('Failed to fetch user permissions', [
                'user_id' => $userId,
                'error'   => $e->getMessage(),
            ]);
            return [];
        }
    }

    // ---- Static factories for common role checks ----

    /**
     * Require the user to be a Super Admin.
     */
    public static function superAdmin(): self
    {
        return new self(['super_admin']);
    }

    /**
     * Require the user to be an Admin (or Super Admin).
     */
    public static function admin(): self
    {
        return new self(['admin', 'super_admin']);
    }

    /**
     * Require the user to be a Host (or Admin/Super Admin).
     */
    public static function host(): self
    {
        return new self(['host', 'admin', 'super_admin']);
    }

    /**
     * Require the user to be Staff (or Host/Admin/Super Admin).
     */
    public static function staff(): self
    {
        return new self(['staff', 'host', 'admin', 'super_admin']);
    }

    /**
     * Require the user to be at least a Buyer (any authenticated user).
     */
    public static function buyer(): self
    {
        return new self(['buyer', 'staff', 'host', 'admin', 'super_admin']);
    }
}
