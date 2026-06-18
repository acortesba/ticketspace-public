<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

define('ROOT_PATH', dirname(__DIR__));
require_once ROOT_PATH . '/vendor/autoload.php';

use TicketSpace\Config\App;
use TicketSpace\Utils\Database;

App::load();

$response = [
    'php_version' => PHP_VERSION,
    'argon2id_supported' => defined('PASSWORD_ARGON2ID'),
    'database_connection' => 'not tested',
    'jwt_secret' => 'not tested'
];

// Test DB
try {
    $host = App::get('db.host');
    $port = App::get('db.port');
    $dbName = App::get('db.name');
    $user = App::get('db.user');
    $pass = App::get('db.pass');
    
    $dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    
    $response['database_connection'] = 'SUCCESS (' . $host . ')';
} catch (\PDOException $e) {
    $response['database_connection'] = 'FAILED: ' . $e->getMessage() . ' [Trying to connect as ' . App::get('db.user') . '@' . App::get('db.host') . ']';
} catch (\Throwable $e) {
    $response['database_connection'] = 'FAILED: ' . $e->getMessage();
}

// Test JWT
try {
    $jwtSecret = App::get('jwt.secret');
    $response['jwt_secret'] = empty($jwtSecret) ? 'EMPTY' : 'SET (Length: ' . strlen($jwtSecret) . ')';
} catch (\Throwable $e) {
    $response['jwt_secret'] = 'FAILED: ' . $e->getMessage();
}

header('Content-Type: application/json');
echo json_encode($response, JSON_PRETTY_PRINT);
