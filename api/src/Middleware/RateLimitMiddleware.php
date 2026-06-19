<?php

declare(strict_types=1);

namespace TicketSpace\Middleware;

use TicketSpace\Config\App;
use TicketSpace\Utils\Response;

/**
 * Rate Limit Middleware
 * 
 * File-based rate limiting (no Redis required — works on shared hosting).
 * Tracks requests per IP address and per user within a time window.
 * Rate limit info is returned in response headers.
 */
class RateLimitMiddleware
{
    private int $maxRequests;
    private int $windowSeconds;
    private string $storageDir;

    /**
     * Create a rate limiter with custom limits.
     * Use the static factory methods for common presets.
     */
    public function __construct(int $maxRequests = 0, int $windowSeconds = 0)
    {
        $this->maxRequests = $maxRequests ?: App::get('security.rate_limit_requests', 100);
        $this->windowSeconds = $windowSeconds ?: App::get('security.rate_limit_window', 60);
        $this->storageDir = dirname(__DIR__, 2) . '/storage/rate_limits';

        if (!is_dir($this->storageDir)) {
            mkdir($this->storageDir, 0755, true);
        }
    }

    /**
     * Handle the rate limit check.
     */
    public function handle(callable $next, array $params): mixed
    {
        $identifier = $this->getIdentifier();
        $key = md5($identifier);
        $file = $this->storageDir . '/' . $key . '.json';

        $data = $this->loadData($file);
        $now = time();

        // Clean up expired entries
        $data = array_filter($data, fn($timestamp) => $timestamp > ($now - $this->windowSeconds));

        // Check if limit exceeded
        if (count($data) >= $this->maxRequests) {
            $retryAfter = min($data) + $this->windowSeconds - $now;
            header("Retry-After: {$retryAfter}");
            header("X-RateLimit-Limit: {$this->maxRequests}");
            header("X-RateLimit-Remaining: 0");
            header("X-RateLimit-Reset: " . ($now + $retryAfter));
            Response::tooManyRequests();
            return null;
        }

        // Record this request
        $data[] = $now;
        $this->saveData($file, $data);

        // Set rate limit headers
        $remaining = $this->maxRequests - count($data);
        header("X-RateLimit-Limit: {$this->maxRequests}");
        header("X-RateLimit-Remaining: {$remaining}");
        header("X-RateLimit-Reset: " . ($now + $this->windowSeconds));

        return $next($params);
    }

    /**
     * Create a strict rate limiter for auth endpoints (5 requests per minute).
     */
    public static function strict(): self
    {
        return new self(5, 60);
    }

    /**
     * Create a moderate rate limiter (30 requests per minute).
     */
    public static function moderate(): self
    {
        return new self(30, 60);
    }

    /**
     * Create a relaxed rate limiter (uses default config values).
     */
    public static function relaxed(): self
    {
        return new self();
    }

    /**
     * Get the identifier for rate limiting (IP + optional user ID).
     */
    private function getIdentifier(): string
    {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] 
            ?? $_SERVER['HTTP_X_REAL_IP'] 
            ?? $_SERVER['REMOTE_ADDR'] 
            ?? '0.0.0.0';

        // Take only the first IP if forwarded through proxies
        if (str_contains($ip, ',')) {
            $ip = trim(explode(',', $ip)[0]);
        }

        $userId = $_REQUEST['_user']['id'] ?? 'anon';
        $route = $_SERVER['REQUEST_URI'] ?? '/';

        return "{$ip}:{$userId}:{$route}";
    }

    /**
     * Load rate limit data from file.
     */
    private function loadData(string $file): array
    {
        if (!file_exists($file)) {
            return [];
        }

        $content = file_get_contents($file);
        $data = json_decode($content, true);
        return is_array($data) ? $data : [];
    }

    /**
     * Save rate limit data to file.
     */
    private function saveData(string $file, array $data): void
    {
        file_put_contents($file, json_encode(array_values($data)), LOCK_EX);
    }

    /**
     * Clean up old rate limit files (call periodically).
     */
    public static function cleanup(): void
    {
        $storageDir = dirname(__DIR__, 2) . '/storage/rate_limits';
        if (!is_dir($storageDir)) {
            return;
        }

        $expiry = time() - 300; // Remove files older than 5 minutes
        foreach (glob($storageDir . '/*.json') as $file) {
            if (filemtime($file) < $expiry) {
                unlink($file);
            }
        }
    }
}
