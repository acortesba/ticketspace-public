<?php

declare(strict_types=1);

/**
 * TicketSpace API Entry Point
 * 
 * Handles all incoming HTTP requests, bootstraps the application,
 * and passes the request to the router.
 */

// Define application root
define('ROOT_PATH', dirname(__DIR__));

// Register Composer Autoloader
require_once ROOT_PATH . '/vendor/autoload.php';

use TicketSpace\Config\App;
use TicketSpace\Utils\Logger;
use TicketSpace\Utils\Response;

try {
    // 1. Load configuration from .env
    App::load();

    // 2. Set error reporting based on environment
    if (App::isDebug()) {
        ini_set('display_errors', '1');
        ini_set('display_startup_errors', '1');
        error_reporting(E_ALL);
    } else {
        ini_set('display_errors', '0');
        ini_set('display_startup_errors', '0');
        error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);
    }

    // 3. Load routes
    $router = require ROOT_PATH . '/src/Routes/api.php';

    // 4. Resolve the request
    $router->resolve();

} catch (\Throwable $e) {
    // Failsafe error handler
    Logger::critical('Uncaught Exception', [
        'message' => $e->getMessage(),
        'file'    => $e->getFile(),
        'line'    => $e->getLine(),
        'trace'   => $e->getTraceAsString(),
    ]);

    if (class_exists(App::class) && App::isDebug()) {
        Response::error($e->getMessage(), 500);
    } else {
        Response::serverError('A critical system error occurred');
    }
}
