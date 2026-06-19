<?php

declare(strict_types=1);

namespace TicketSpace\Utils;

use TicketSpace\Config\App;

/**
 * File-Based Logger
 * 
 * Writes log entries to daily log files in the storage/logs directory.
 * Follows PSR-3 log levels: emergency, alert, critical, error, warning, notice, info, debug.
 */
class Logger
{
    private static ?string $logDir = null;

    /**
     * Get the log directory path, creating it if it doesn't exist.
     */
    private static function getLogDir(): string
    {
        if (self::$logDir === null) {
            self::$logDir = dirname(__DIR__, 2) . '/storage/logs';
            if (!is_dir(self::$logDir)) {
                mkdir(self::$logDir, 0755, true);
            }
        }
        return self::$logDir;
    }

    /**
     * Log an emergency message — system is unusable.
     */
    public static function emergency(string $message, array $context = []): void
    {
        self::log('EMERGENCY', $message, $context);
    }

    /**
     * Log an alert message — action must be taken immediately.
     */
    public static function alert(string $message, array $context = []): void
    {
        self::log('ALERT', $message, $context);
    }

    /**
     * Log a critical message — critical conditions.
     */
    public static function critical(string $message, array $context = []): void
    {
        self::log('CRITICAL', $message, $context);
    }

    /**
     * Log an error message — runtime errors.
     */
    public static function error(string $message, array $context = []): void
    {
        self::log('ERROR', $message, $context);
    }

    /**
     * Log a warning message — exceptional occurrences that are not errors.
     */
    public static function warning(string $message, array $context = []): void
    {
        self::log('WARNING', $message, $context);
    }

    /**
     * Log a notice message — normal but significant events.
     */
    public static function notice(string $message, array $context = []): void
    {
        self::log('NOTICE', $message, $context);
    }

    /**
     * Log an info message — interesting events.
     */
    public static function info(string $message, array $context = []): void
    {
        self::log('INFO', $message, $context);
    }

    /**
     * Log a debug message — detailed debug information.
     */
    public static function debug(string $message, array $context = []): void
    {
        if (App::isDebug()) {
            self::log('DEBUG', $message, $context);
        }
    }

    /**
     * Write a log entry to the daily log file.
     */
    private static function log(string $level, string $message, array $context = []): void
    {
        $date = date('Y-m-d');
        $time = date('Y-m-d H:i:s');
        $file = self::getLogDir() . "/{$date}.log";

        $entry = "[{$time}] [{$level}] {$message}";

        if (!empty($context)) {
            // Scrub sensitive data from context before logging
            $safeContext = self::scrubSensitiveData($context);
            $entry .= ' ' . json_encode($safeContext, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        $entry .= PHP_EOL;

        file_put_contents($file, $entry, FILE_APPEND | LOCK_EX);
    }

    /**
     * Remove sensitive fields from log context to prevent credential leaks.
     */
    private static function scrubSensitiveData(array $data): array
    {
        $sensitiveKeys = [
            'password', 'pass', 'secret', 'token', 'authorization',
            'credit_card', 'card_number', 'cvv', 'ssn', 'api_key',
            'stripe_secret', 'paypal_secret', 'jwt_secret',
        ];

        $result = [];
        foreach ($data as $key => $value) {
            $lowerKey = strtolower((string) $key);
            if (in_array($lowerKey, $sensitiveKeys, true)) {
                $result[$key] = '***REDACTED***';
            } elseif (is_array($value)) {
                $result[$key] = self::scrubSensitiveData($value);
            } else {
                $result[$key] = $value;
            }
        }

        return $result;
    }
}
