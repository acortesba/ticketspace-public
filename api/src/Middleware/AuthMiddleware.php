<?php

declare(strict_types=1);

namespace TicketSpace\Middleware;

use TicketSpace\Config\App;
use TicketSpace\Utils\Response;
use TicketSpace\Utils\Logger;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;

/**
 * Authentication Middleware
 * 
 * Validates JWT tokens from the Authorization header.
 * On success, attaches user data to $_REQUEST['_user'].
 * On failure, returns 401 Unauthorized.
 */
class AuthMiddleware
{
    /**
     * Authenticate the request via JWT.
     */
    public function handle(callable $next, array $params): mixed
    {
        $token = $this->extractToken();

        if ($token === null) {
            Response::unauthorized('Authentication required. Please provide a valid token.');
            return null;
        }

        try {
            $secret = App::get('jwt.secret');
            if (empty($secret)) {
                Logger::error('JWT secret is not configured');
                Response::serverError('Authentication configuration error');
                return null;
            }

            $decoded = JWT::decode($token, new Key($secret, 'HS256'));
            $payload = (array) $decoded;

            // Verify required claims
            if (empty($payload['sub']) || empty($payload['email'])) {
                Response::unauthorized('Invalid token payload');
                return null;
            }

            // Verify token hasn't been revoked (check session exists)
            if (!$this->isSessionValid($payload['jti'] ?? '')) {
                Response::unauthorized('Token has been revoked');
                return null;
            }

            // Attach user info to the request
            $_REQUEST['_user'] = [
                'id'    => (int) $payload['sub'],
                'uuid'  => $payload['uuid'] ?? '',
                'email' => $payload['email'],
                'roles' => $payload['roles'] ?? [],
                'jti'   => $payload['jti'] ?? '',
            ];

            return $next($params);

        } catch (ExpiredException $e) {
            Response::unauthorized('Token has expired. Please refresh your token.');
            return null;
        } catch (\Exception $e) {
            Logger::warning('JWT validation failed', ['error' => $e->getMessage()]);
            Response::unauthorized('Invalid authentication token');
            return null;
        }
    }

    /**
     * Extract the Bearer token from the Authorization header.
     */
    private function extractToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] 
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] 
            ?? '';

        if (empty($header)) {
            // Try Apache-specific approach
            if (function_exists('apache_request_headers')) {
                $headers = apache_request_headers();
                $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            }
        }

        if (preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Check if the JWT session (jti) is still valid in the database.
     * This allows token revocation on logout.
     */
    private function isSessionValid(string $jti): bool
    {
        if (empty($jti)) {
            return true; // If no jti, skip session check (backward compatible)
        }

        try {
            $db = \TicketSpace\Utils\Database::getInstance();
            $stmt = $db->prepare(
                'SELECT id FROM sessions WHERE id = :jti AND expires_at > NOW() LIMIT 1'
            );
            $stmt->execute([':jti' => $jti]);
            return $stmt->fetch() !== false;
        } catch (\Exception $e) {
            Logger::error('Session validation error', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Generate a new JWT access token for a user.
     */
    public static function generateAccessToken(array $user, string $sessionId): string
    {
        $now = time();
        $expiry = App::get('jwt.expiry', 3600);

        $payload = [
            'iss'   => App::get('app.url'),
            'iat'   => $now,
            'exp'   => $now + $expiry,
            'sub'   => $user['id'],
            'uuid'  => $user['uuid'],
            'email' => $user['email'],
            'roles' => $user['roles'] ?? [],
            'jti'   => $sessionId,
        ];

        return JWT::encode($payload, App::get('jwt.secret'), 'HS256');
    }

    /**
     * Generate a refresh token.
     */
    public static function generateRefreshToken(): string
    {
        return bin2hex(random_bytes(32));
    }

    /**
     * Get the authenticated user from the current request.
     * Returns null if not authenticated.
     */
    public static function user(): ?array
    {
        return $_REQUEST['_user'] ?? null;
    }

    /**
     * Get the authenticated user's ID.
     */
    public static function userId(): ?int
    {
        return $_REQUEST['_user']['id'] ?? null;
    }
}
