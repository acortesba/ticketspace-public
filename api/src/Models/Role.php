<?php

declare(strict_types=1);

namespace TicketSpace\Models;

/**
 * Role Model
 * 
 * Manages roles and their permissions.
 * Default roles: super_admin, admin, host, staff, buyer.
 */
class Role extends BaseModel
{
    protected string $table = 'roles';

    protected array $fillable = ['slug', 'name', 'description'];

    /**
     * Find a role by its slug.
     */
    public function findBySlug(string $slug): ?array
    {
        return $this->findBy('slug', $slug);
    }

    /**
     * Get a role with its permissions.
     */
    public function findWithPermissions(int $roleId): ?array
    {
        $role = $this->find($roleId);
        if ($role === null) {
            return null;
        }

        $stmt = $this->db()->prepare('
            SELECT p.slug, p.name, p.module
            FROM permissions p
            INNER JOIN role_permissions rp ON rp.permission_id = p.id
            WHERE rp.role_id = :role_id
            ORDER BY p.module, p.slug
        ');
        $stmt->execute([':role_id' => $roleId]);
        $role['permissions'] = $stmt->fetchAll();

        return $role;
    }

    /**
     * Get all roles with their permissions.
     */
    public function allWithPermissions(): array
    {
        $roles = $this->all(1, 100, 'id', 'ASC');
        
        foreach ($roles as &$role) {
            $stmt = $this->db()->prepare('
                SELECT p.slug, p.name, p.module
                FROM permissions p
                INNER JOIN role_permissions rp ON rp.permission_id = p.id
                WHERE rp.role_id = :role_id
                ORDER BY p.module, p.slug
            ');
            $stmt->execute([':role_id' => $role['id']]);
            $role['permissions'] = $stmt->fetchAll();
        }

        return $roles;
    }

    /**
     * Assign a permission to a role.
     */
    public function assignPermission(int $roleId, string $permissionSlug): bool
    {
        $stmt = $this->db()->prepare('SELECT id FROM permissions WHERE slug = :slug LIMIT 1');
        $stmt->execute([':slug' => $permissionSlug]);
        $permission = $stmt->fetch();

        if (!$permission) {
            return false;
        }

        $stmt = $this->db()->prepare('
            INSERT IGNORE INTO role_permissions (role_id, permission_id)
            VALUES (:role_id, :permission_id)
        ');
        return $stmt->execute([
            ':role_id'       => $roleId,
            ':permission_id' => $permission['id'],
        ]);
    }
}
