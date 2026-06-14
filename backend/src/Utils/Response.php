<?php

declare(strict_types=1);

namespace TicketSpace\Utils;

/**
 * JSON Response Helper
 * 
 * Standardizes all API responses into a consistent format:
 * { "success": bool, "data": mixed, "message": string, "errors": array }
 */
class Response
{
    /**
     * Send a success response.
     *
     * @param mixed  $data    Response payload
     * @param string $message Human-readable message
     * @param int    $code    HTTP status code (default: 200)
     */
    public static function success(mixed $data = null, string $message = '', int $code = 200): void
    {
        self::send($code, [
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ]);
    }

    /**
     * Send a created response (201).
     */
    public static function created(mixed $data = null, string $message = 'Resource created successfully'): void
    {
        self::success($data, $message, 201);
    }

    /**
     * Send a no content response (204).
     */
    public static function noContent(): void
    {
        http_response_code(204);
        exit;
    }

    /**
     * Send an error response.
     *
     * @param string $message Human-readable error message
     * @param int    $code    HTTP status code (default: 400)
     * @param array  $errors  Detailed error information
     */
    public static function error(string $message = 'An error occurred', int $code = 400, array $errors = []): void
    {
        self::send($code, [
            'success' => false,
            'message' => $message,
            'errors'  => $errors,
        ]);
    }

    /**
     * Send a 401 Unauthorized response.
     */
    public static function unauthorized(string $message = 'Unauthorized'): void
    {
        self::error($message, 401);
    }

    /**
     * Send a 403 Forbidden response.
     */
    public static function forbidden(string $message = 'Forbidden'): void
    {
        self::error($message, 403);
    }

    /**
     * Send a 404 Not Found response.
     */
    public static function notFound(string $message = 'Resource not found'): void
    {
        self::error($message, 404);
    }

    /**
     * Send a 422 Validation Error response.
     */
    public static function validationError(array $errors, string $message = 'Validation failed'): void
    {
        self::error($message, 422, $errors);
    }

    /**
     * Send a 429 Too Many Requests response.
     */
    public static function tooManyRequests(string $message = 'Too many requests. Please try again later.'): void
    {
        self::error($message, 429);
    }

    /**
     * Send a 500 Internal Server Error response.
     */
    public static function serverError(string $message = 'Internal server error'): void
    {
        self::error($message, 500);
    }

    /**
     * Send a paginated response.
     *
     * @param array $items      The data items for the current page
     * @param int   $total      Total number of items
     * @param int   $page       Current page number
     * @param int   $perPage    Items per page
     * @param string $message   Optional message
     */
    public static function paginated(array $items, int $total, int $page, int $perPage, string $message = ''): void
    {
        self::send(200, [
            'success'    => true,
            'message'    => $message,
            'data'       => $items,
            'pagination' => [
                'total'        => $total,
                'per_page'     => $perPage,
                'current_page' => $page,
                'last_page'    => (int) ceil($total / max($perPage, 1)),
                'has_more'     => ($page * $perPage) < $total,
            ],
        ]);
    }

    /**
     * Send the actual HTTP response.
     */
    private static function send(int $statusCode, array $body): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');

        echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
}
