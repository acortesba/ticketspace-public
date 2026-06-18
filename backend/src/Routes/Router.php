<?php

declare(strict_types=1);

namespace TicketSpace\Routes;

use TicketSpace\Utils\Response;
use TicketSpace\Utils\Logger;

/**
 * Lightweight HTTP Router
 * 
 * Supports:
 * - GET, POST, PUT, PATCH, DELETE methods
 * - URL parameters (e.g., /events/{uuid})
 * - Middleware pipeline (array of callables executed before the handler)
 * - Route grouping with shared prefix and middleware
 * - Automatic OPTIONS response for CORS preflight
 */
class Router
{
    /** @var array Registered routes grouped by HTTP method */
    private array $routes = [];

    /** @var string Current group prefix */
    private string $groupPrefix = '';

    /** @var array Current group middleware stack */
    private array $groupMiddleware = [];

    /**
     * Register a GET route.
     */
    public function get(string $path, callable|array $handler, array $middleware = []): self
    {
        return $this->addRoute('GET', $path, $handler, $middleware);
    }

    /**
     * Register a POST route.
     */
    public function post(string $path, callable|array $handler, array $middleware = []): self
    {
        return $this->addRoute('POST', $path, $handler, $middleware);
    }

    /**
     * Register a PUT route.
     */
    public function put(string $path, callable|array $handler, array $middleware = []): self
    {
        return $this->addRoute('PUT', $path, $handler, $middleware);
    }

    /**
     * Register a PATCH route.
     */
    public function patch(string $path, callable|array $handler, array $middleware = []): self
    {
        return $this->addRoute('PATCH', $path, $handler, $middleware);
    }

    /**
     * Register a DELETE route.
     */
    public function delete(string $path, callable|array $handler, array $middleware = []): self
    {
        return $this->addRoute('DELETE', $path, $handler, $middleware);
    }

    /**
     * Create a route group with a shared prefix and/or middleware.
     *
     * @param string   $prefix     URL prefix for all routes in the group
     * @param callable $callback   Closure that receives this Router instance
     * @param array    $middleware Middleware applied to all routes in the group
     */
    public function group(string $prefix, callable $callback, array $middleware = []): self
    {
        $previousPrefix = $this->groupPrefix;
        $previousMiddleware = $this->groupMiddleware;

        $this->groupPrefix = $previousPrefix . $prefix;
        $this->groupMiddleware = array_merge($previousMiddleware, $middleware);

        $callback($this);

        $this->groupPrefix = $previousPrefix;
        $this->groupMiddleware = $previousMiddleware;

        return $this;
    }

    /**
     * Register a route.
     */
    private function addRoute(string $method, string $path, callable|array $handler, array $middleware): self
    {
        $fullPath = $this->groupPrefix . $path;
        $allMiddleware = array_merge($this->groupMiddleware, $middleware);

        $routeDef = [
            'path'       => $fullPath,
            'pattern'    => $this->buildPattern($fullPath),
            'handler'    => $handler,
            'middleware' => $allMiddleware,
            'paramNames' => $this->extractParamNames($fullPath),
        ];

        $this->routes[$method][] = $routeDef;

        // Auto-register OPTIONS route for CORS preflight
        if ($method !== 'OPTIONS') {
            $optionsDef = $routeDef;
            $optionsDef['handler'] = function() { http_response_code(204); exit; };
            $this->routes['OPTIONS'][] = $optionsDef;
        }

        return $this;
    }

    /**
     * Resolve the current request to a registered route and execute it.
     */
    public function resolve(): void
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $uri = $this->getRequestUri();

        // Handle CORS preflight by allowing it to fall through to matching routes
        // The CORSMiddleware will intercept OPTIONS requests and set the headers.
        
        // Find matching route
        $routes = $this->routes[$method] ?? [];

        foreach ($routes as $route) {
            if (preg_match($route['pattern'], $uri, $matches)) {
                // Extract named parameters
                $params = [];
                foreach ($route['paramNames'] as $index => $name) {
                    $params[$name] = $matches[$index + 1] ?? null;
                }

                // Store params in the request context
                $_REQUEST['_params'] = $params;

                // Execute middleware pipeline, then the handler
                $this->executePipeline($route['middleware'], $route['handler'], $params);
                return;
            }
        }

        // No route found — check if the path exists for other methods (405 vs 404)
        $allowedMethods = $this->getAllowedMethods($uri);
        if (!empty($allowedMethods)) {
            header('Allow: ' . implode(', ', $allowedMethods));
            Response::error('Method not allowed', 405);
        }

        Response::notFound('Endpoint not found');
    }

    /**
     * Execute the middleware pipeline then the handler.
     * Each middleware receives: handler (next), params.
     * Middleware must call $next($params) to continue the pipeline.
     */
    private function executePipeline(array $middleware, callable|array $handler, array $params): void
    {
        // Build the pipeline from inside out
        $pipeline = function (array $params) use ($handler) {
            if (is_array($handler)) {
                [$class, $method] = $handler;
                $controller = new $class();
                return $controller->$method($params);
            }
            return $handler($params);
        };

        // Wrap middleware in reverse order (outermost middleware runs first)
        foreach (array_reverse($middleware) as $mw) {
            $next = $pipeline;
            $pipeline = function (array $params) use ($mw, $next) {
                if (is_string($mw) && class_exists($mw)) {
                    $instance = new $mw();
                    return $instance->handle($next, $params);
                }
                if (is_object($mw) && method_exists($mw, 'handle')) {
                    return $mw->handle($next, $params);
                }
                if (is_array($mw) && count($mw) === 2) {
                    [$classOrObj, $method] = $mw;
                    if (is_string($classOrObj) && class_exists($classOrObj)) {
                        $instance = new $classOrObj();
                        return $instance->$method($next, $params);
                    }
                    if (is_object($classOrObj) && method_exists($classOrObj, $method)) {
                        return $classOrObj->$method($next, $params);
                    }
                }
                if (is_callable($mw)) {
                    return $mw($next, $params);
                }
                
                throw new \RuntimeException('Invalid middleware type: ' . (is_object($mw) ? get_class($mw) : gettype($mw)));
            };
        }

        try {
            $pipeline($params);
        } catch (\Throwable $e) {
            Logger::error('Route handler error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
                'trace'   => $e->getTraceAsString(),
            ]);

            if (\TicketSpace\Config\App::isDebug()) {
                Response::error($e->getMessage(), 500);
            } else {
                Response::serverError();
            }
        }
    }

    /**
     * Build a regex pattern from a route path.
     * Converts {param} segments to named capture groups.
     */
    private function buildPattern(string $path): string
    {
        // Escape forward slashes
        $pattern = preg_replace('/\//', '\\/', $path);
        // Convert {param} to capture groups
        $pattern = preg_replace('/\{([a-zA-Z_]+)\}/', '([a-zA-Z0-9_-]+)', $pattern);
        return '/^' . $pattern . '$/';
    }

    /**
     * Extract parameter names from a route path.
     */
    private function extractParamNames(string $path): array
    {
        preg_match_all('/\{([a-zA-Z_]+)\}/', $path, $matches);
        return $matches[1] ?? [];
    }

    /**
     * Get the clean request URI (without query string and base path).
     */
    private function getRequestUri(): string
    {
        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        
        // Ensure leading slash, remove trailing slash
        $uri = '/' . trim($uri, '/');
        
        return $uri === '/' ? '/' : $uri;
    }

    /**
     * Check which HTTP methods are allowed for a given URI.
     */
    private function getAllowedMethods(string $uri): array
    {
        $allowed = [];
        foreach ($this->routes as $method => $routes) {
            foreach ($routes as $route) {
                if (preg_match($route['pattern'], $uri)) {
                    $allowed[] = $method;
                    break;
                }
            }
        }
        return $allowed;
    }

    /**
     * Get the parsed JSON body of the current request.
     */
    public static function getBody(): array
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        
        if (str_contains($contentType, 'application/json')) {
            $body = file_get_contents('php://input');
            return json_decode($body, true) ?? [];
        }

        // Fall back to POST data for form submissions
        return $_POST;
    }

    /**
     * Get query parameters from the URL.
     */
    public static function getQuery(): array
    {
        return $_GET;
    }

    /**
     * Get a specific route parameter.
     */
    public static function getParam(string $name, mixed $default = null): mixed
    {
        return $_REQUEST['_params'][$name] ?? $default;
    }
}
