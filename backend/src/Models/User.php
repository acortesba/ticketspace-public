<?php

declare(strict_types=1);

namespace TicketSpace\Models;

use TicketSpace\Utils\Database;
use TicketSpace\Utils\Sanitizer;

/**
 * User Model
 * 
 * Handles user data, authentication, role management,
 * and session tracking.
 */
class User extends BaseModel
{
    protected string $table = 'users';

    protected array $fillable = [
        'uuid', 'email', 'password_hash', 'first_name', 'last_name',
        'phone', 'locale', 'email_verified', 'verification_token',
        'reset_token', 'reset_token_expires',
    ];

    protected array $hidden = [
        'password_hash', 'verification_token', 'reset_token',
        'reset_token_expires', 'deleted_at',
    ];

    protected bool $softDeletes = true;

    /**
     * Find a user by email address.
     */
    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db()->prepare(
            'SELECT * FROM users WHERE email = :email AND deleted_at IS NULL LIMIT 1'
        );
        $stmt->execute([':email' => strtolower(trim($email))]);
        $result = $stmt->fetch();

        return $result !== false ? $result : null; // Don't hide password for auth checks
    }

    /**
     * Register a new user.
     * Hashes the password and assigns default role (buyer) or specified role.
     */
    public function register(array $data, string $role = 'buyer'): ?array
    {
        $uuid = Sanitizer::generateUuid();
        $verificationToken = Sanitizer::generateToken(32);

        $user = $this->create([
            'uuid'               => $uuid,
            'email'              => strtolower(trim($data['email'])),
            'password_hash'      => password_hash($data['password'], PASSWORD_ARGON2ID, [
                'memory_cost' => 65536,
                'time_cost'   => 4,
                'threads'     => 3,
            ]),
            'first_name'         => $data['first_name'],
            'last_name'          => $data['last_name'],
            'phone'              => $data['phone'] ?? null,
            'locale'             => $data['locale'] ?? 'es',
            'email_verified'     => 0,
            'verification_token' => $verificationToken,
        ]);

        if ($user === null) {
            return null;
        }

        // Assign specified role (must be valid in roles table)
        // Default is 'buyer', but allow 'host' for organizers
        $validRoles = ['buyer', 'host'];
        $roleToAssign = in_array($role, $validRoles) ? $role : 'buyer';
        
        $this->assignRole($user['id'], $roleToAssign);

        // Reload with roles
        return $this->findWithRoles($user['id']);
    }

    /**
     * Verify a user's password against the stored hash.
     */
    public function verifyPassword(array $user, string $password): bool
    {
        return password_verify($password, $user['password_hash'] ?? '');
    }

    /**
     * Find a user with their role slugs attached.
     */
    public function findWithRoles(int $userId): ?array
    {
        $user = $this->find($userId);
        if ($user === null) {
            return null;
        }

        $user['roles'] = $this->getUserRoles($userId);
        return $user;
    }

    /**
     * Get all role slugs for a user.
     */
    public function getUserRoles(int $userId): array
    {
        $stmt = $this->db()->prepare('
            SELECT r.slug
            FROM roles r
            INNER JOIN user_roles ur ON ur.role_id = r.id
            WHERE ur.user_id = :user_id
        ');
        $stmt->execute([':user_id' => $userId]);
        return $stmt->fetchAll(\PDO::FETCH_COLUMN);
    }

    /**
     * Assign a role to a user by role slug.
     */
    public function assignRole(int $userId, string $roleSlug, ?int $grantedBy = null): bool
    {
        $stmt = $this->db()->prepare('SELECT id FROM roles WHERE slug = :slug LIMIT 1');
        $stmt->execute([':slug' => $roleSlug]);
        $role = $stmt->fetch();

        if (!$role) {
            return false;
        }

        // Check if already assigned
        $check = $this->db()->prepare(
            'SELECT 1 FROM user_roles WHERE user_id = :uid AND role_id = :rid LIMIT 1'
        );
        $check->execute([':uid' => $userId, ':rid' => $role['id']]);
        if ($check->fetch()) {
            return true; // Already has this role
        }

        $stmt = $this->db()->prepare('
            INSERT INTO user_roles (user_id, role_id, granted_by, created_at)
            VALUES (:user_id, :role_id, :granted_by, NOW())
        ');
        return $stmt->execute([
            ':user_id'    => $userId,
            ':role_id'    => $role['id'],
            ':granted_by' => $grantedBy,
        ]);
    }

    /**
     * Remove a role from a user.
     */
    public function removeRole(int $userId, string $roleSlug): bool
    {
        $stmt = $this->db()->prepare('
            DELETE ur FROM user_roles ur
            INNER JOIN roles r ON r.id = ur.role_id
            WHERE ur.user_id = :user_id AND r.slug = :slug
        ');
        return $stmt->execute([':user_id' => $userId, ':slug' => $roleSlug]);
    }

    /**
     * Create a session record for JWT tracking.
     * Returns the session ID (used as JWT jti claim).
     */
    public function createSession(int $userId, string $refreshToken, int $expiresIn): string
    {
        $sessionId = Sanitizer::generateUuid();
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        $userAgent = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);

        $stmt = $this->db()->prepare('
            INSERT INTO sessions (id, user_id, ip_address, user_agent, refresh_token, expires_at, created_at)
            VALUES (:id, :user_id, :ip, :ua, :refresh_token, DATE_ADD(NOW(), INTERVAL :expires SECOND), NOW())
        ');
        $stmt->execute([
            ':id'            => $sessionId,
            ':user_id'       => $userId,
            ':ip'            => $ip,
            ':ua'            => $userAgent,
            ':refresh_token' => hash('sha256', $refreshToken),
            ':expires'       => $expiresIn,
        ]);

        return $sessionId;
    }

    /**
     * Validate a refresh token and return the session.
     */
    public function validateRefreshToken(string $refreshToken): ?array
    {
        $hashedToken = hash('sha256', $refreshToken);

        $stmt = $this->db()->prepare('
            SELECT s.*, u.email, u.uuid
            FROM sessions s
            INNER JOIN users u ON u.id = s.user_id
            WHERE s.refresh_token = :token AND s.expires_at > NOW()
            LIMIT 1
        ');
        $stmt->execute([':token' => $hashedToken]);
        $session = $stmt->fetch();

        return $session !== false ? $session : null;
    }

    /**
     * Invalidate a session (logout).
     */
    public function destroySession(string $sessionId): bool
    {
        $stmt = $this->db()->prepare('DELETE FROM sessions WHERE id = :id');
        return $stmt->execute([':id' => $sessionId]);
    }

    /**
     * Invalidate all sessions for a user (force logout everywhere).
     */
    public function destroyAllSessions(int $userId): bool
    {
        $stmt = $this->db()->prepare('DELETE FROM sessions WHERE user_id = :uid');
        return $stmt->execute([':uid' => $userId]);
    }

    /**
     * Mark user email as verified.
     */
    public function verifyEmail(string $token): ?array
    {
        $stmt = $this->db()->prepare('
            SELECT id FROM users 
            WHERE verification_token = :token AND email_verified = 0 AND deleted_at IS NULL
            LIMIT 1
        ');
        $stmt->execute([':token' => $token]);
        $user = $stmt->fetch();

        if (!$user) {
            return null;
        }

        $this->db()->prepare('
            UPDATE users SET email_verified = 1, verification_token = NULL, updated_at = NOW()
            WHERE id = :id
        ')->execute([':id' => $user['id']]);

        return $this->findWithRoles($user['id']);
    }

    /**
     * Set a password reset token for a user.
     */
    public function setResetToken(int $userId): string
    {
        $token = Sanitizer::generateToken(32);

        $this->db()->prepare('
            UPDATE users SET reset_token = :token, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR), updated_at = NOW()
            WHERE id = :id
        ')->execute([':token' => $token, ':id' => $userId]);

        return $token;
    }

    /**
     * Reset password using a valid token.
     */
    public function resetPassword(string $token, string $newPassword): bool
    {
        $stmt = $this->db()->prepare('
            SELECT id FROM users
            WHERE reset_token = :token AND reset_token_expires > NOW() AND deleted_at IS NULL
            LIMIT 1
        ');
        $stmt->execute([':token' => $token]);
        $user = $stmt->fetch();

        if (!$user) {
            return false;
        }

        $hash = password_hash($newPassword, PASSWORD_ARGON2ID, [
            'memory_cost' => 65536,
            'time_cost'   => 4,
            'threads'     => 3,
        ]);

        $this->db()->prepare('
            UPDATE users SET password_hash = :hash, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW()
            WHERE id = :id
        ')->execute([':hash' => $hash, ':id' => $user['id']]);

        // Invalidate all sessions after password reset
        $this->destroyAllSessions($user['id']);

        return true;
    }

    /**
     * Update user password (when authenticated).
     */
    public function updatePassword(int $userId, string $newPassword): bool
    {
        $hash = password_hash($newPassword, PASSWORD_ARGON2ID, [
            'memory_cost' => 65536,
            'time_cost'   => 4,
            'threads'     => 3,
        ]);

        $stmt = $this->db()->prepare(
            'UPDATE users SET password_hash = :hash, updated_at = NOW() WHERE id = :id'
        );
        return $stmt->execute([':hash' => $hash, ':id' => $userId]);
    }
}
