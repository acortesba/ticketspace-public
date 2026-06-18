<?php

declare(strict_types=1);

namespace TicketSpace\Routes;

use TicketSpace\Controllers\AuthController;
use TicketSpace\Middleware\AuthMiddleware;
use TicketSpace\Middleware\CORSMiddleware;
use TicketSpace\Middleware\RateLimitMiddleware;
use TicketSpace\Middleware\RBACMiddleware;
use TicketSpace\Utils\Response;

$router = new Router();

// Apply global middleware
$router->group('/api/v1', function (Router $router) {
    
    // Health check
    $router->get('/health', function () {
        Response::success(['status' => 'ok', 'time' => time()], 'API is running');
    });

    // ----- Authentication Endpoints -----
    $router->group('/auth', function (Router $router) {
        $strictRateLimit = RateLimitMiddleware::strict();
        
        $router->post('/register', [AuthController::class, 'register'], [$strictRateLimit]);
        $router->post('/login', [AuthController::class, 'login'], [$strictRateLimit]);
        $router->post('/refresh', [AuthController::class, 'refresh']);
        
        // Protected auth routes
        $router->post('/logout', [AuthController::class, 'logout'], [AuthMiddleware::class]);
    });

    // ----- User Endpoints -----
    $router->group('/users', function (Router $router) {
        $router->get('/me', [AuthController::class, 'me'], [AuthMiddleware::class]);
    });

    // Add placeholder routes for future implementation
    $router->group('/events', function(Router $router) {
        $router->get('', function() { Response::success([], 'Events list placeholder'); });
    });
    
}, [CORSMiddleware::class]);

return $router;
