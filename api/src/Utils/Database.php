<?php

declare(strict_types=1);

namespace TicketSpace\Utils;

use TicketSpace\Config\App;
use PDO;
use PDOException;

/**
 * Database Connection Singleton
 * 
 * Provides a single PDO connection instance across the application.
 * Uses prepared statements exclusively to prevent SQL injection.
 */
class Database
{
    private static ?PDO $instance = null;

    /**
     * Get the database connection instance.
     * Creates a new connection if one doesn't exist.
     */
    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            self::connect();
        }

        return self::$instance;
    }

    /**
     * Establish the database connection.
     */
    private static function connect(): void
    {
        $host    = App::get('db.host');
        $port    = App::get('db.port');
        $dbName  = App::get('db.name');
        $charset = App::get('db.charset');
        $user    = App::get('db.user');
        $pass    = App::get('db.pass');

        $dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset={$charset}";

        try {
            self::$instance = new PDO($dsn, $user, $pass, [
                // Throw exceptions on errors instead of silent failures
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                // Return associative arrays by default
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                // Use real prepared statements (not emulated)
                PDO::ATTR_EMULATE_PREPARES   => false,
                // Stringify fetches disabled for proper type handling
                PDO::ATTR_STRINGIFY_FETCHES  => false,
                // Set MySQL session variables for security and consistency
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES '{$charset}' COLLATE '{$charset}_unicode_ci', SESSION sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'",
            ]);
        } catch (PDOException $e) {
            Logger::error('Database connection failed', [
                'message' => $e->getMessage(),
                'host'    => $host,
                'port'    => $port,
                'dbname'  => $dbName,
            ]);

            // Don't expose database credentials in error messages
            throw new \RuntimeException('Database connection failed. Check your configuration.');
        }
    }

    /**
     * Close the database connection.
     */
    public static function close(): void
    {
        self::$instance = null;
    }

    /**
     * Begin a database transaction.
     */
    public static function beginTransaction(): bool
    {
        return self::getInstance()->beginTransaction();
    }

    /**
     * Commit the current transaction.
     */
    public static function commit(): bool
    {
        return self::getInstance()->commit();
    }

    /**
     * Rollback the current transaction.
     */
    public static function rollback(): bool
    {
        return self::getInstance()->rollBack();
    }

    /**
     * Execute a callback within a transaction.
     * Automatically commits on success or rolls back on exception.
     */
    public static function transaction(callable $callback): mixed
    {
        self::beginTransaction();

        try {
            $result = $callback(self::getInstance());
            self::commit();
            return $result;
        } catch (\Throwable $e) {
            self::rollback();
            throw $e;
        }
    }

    // Prevent instantiation, cloning, and unserialization
    private function __construct() {}
    private function __clone() {}
    public function __wakeup()
    {
        throw new \RuntimeException('Cannot unserialize singleton');
    }
}
