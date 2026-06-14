<?php

declare(strict_types=1);

namespace TicketSpace\Middleware;

use TicketSpace\Config\App;
use TicketSpace\Utils\Response;

/**
 * CORS Middleware
 * 
 * Sets Cross-Origin Resource Sharing headers.
 * In production, only allows requests from the configured origin.
 * In development, allows all origins for easier local testing.
 */
class CORSMiddleware
{
    /**
     * Handle the CORS headers and pass to next middleware.
     */
    public function handle(callable $next, array $params): mixed
    {
        $allowedOrigins = App::get('security.cors_origins', '*');
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        // Determine if origin is allowed
        if ($allowedOrigins === '*' || App::get('app.env') === 'development') {
            $responseOrigin = $origin ?: '*';
        } else {
            $allowedList = array_map('trim', explode(',', $allowedOrigins));
            if (in_array($origin, $allowedList, true)) {
                $responseOrigin = $origin;
            } else {
                $responseOrigin = $allowedList[0] ?? '*';
            }
        }

        header("Access-Control-Allow-Origin: {$responseOrigin}");
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Accept-Language');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');

        // Security headers
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header("Strict-Transport-Security: max-age=31536000; includeSubDomains");

        // Handle preflight
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }

        return $next($params);
    }
}
