<?php

declare(strict_types=1);

namespace TicketSpace\Config;

/**
 * Application Configuration
 * 
 * Loads all configuration from environment variables.
 * No hardcoded values — everything is configurable via .env file.
 */
class App
{
    private static ?array $config = null;

    /**
     * Load environment variables from .env file.
     * Must be called once at application bootstrap.
     */
    public static function load(): void
    {
        $envPath = dirname(__DIR__, 2);
        
        if (file_exists($envPath . '/.env')) {
            $dotenv = \Dotenv\Dotenv::createImmutable($envPath);
            $dotenv->load();
        }

        self::$config = [
            'app' => [
                'name'     => self::env('APP_NAME', 'TicketSpace'),
                'url'      => self::env('APP_URL', 'http://localhost'),
                'env'      => self::env('APP_ENV', 'production'),
                'debug'    => self::envBool('APP_DEBUG', false),
                'locale'   => self::env('APP_LOCALE', 'es'),
                'timezone' => self::env('APP_TIMEZONE', 'Europe/Madrid'),
            ],
            'db' => [
                'host'    => self::env('DB_HOST', 'localhost'),
                'port'    => self::envInt('DB_PORT', 3306),
                'name'    => self::env('DB_NAME', 'ticketspace'),
                'user'    => self::env('DB_USER', ''),
                'pass'    => self::env('DB_PASS', ''),
                'charset' => self::env('DB_CHARSET', 'utf8mb4'),
            ],
            'jwt' => [
                'secret'         => self::env('JWT_SECRET', ''),
                'expiry'         => self::envInt('JWT_EXPIRY', 3600),
                'refresh_expiry' => self::envInt('JWT_REFRESH_EXPIRY', 604800),
            ],
            'stripe' => [
                'public_key'     => self::env('STRIPE_PUBLIC_KEY', ''),
                'secret_key'     => self::env('STRIPE_SECRET_KEY', ''),
                'webhook_secret' => self::env('STRIPE_WEBHOOK_SECRET', ''),
            ],
            'paypal' => [
                'client_id'     => self::env('PAYPAL_CLIENT_ID', ''),
                'client_secret' => self::env('PAYPAL_CLIENT_SECRET', ''),
                'mode'          => self::env('PAYPAL_MODE', 'sandbox'),
            ],
            'sepa' => [
                'enabled' => self::envBool('SEPA_ENABLED', true),
            ],
            'smtp' => [
                'host'       => self::env('SMTP_HOST', 'smtp.hostinger.com'),
                'port'       => self::envInt('SMTP_PORT', 465),
                'encryption' => self::env('SMTP_ENCRYPTION', 'ssl'),
                'user'       => self::env('SMTP_USER', ''),
                'pass'       => self::env('SMTP_PASS', ''),
                'from_email' => self::env('SMTP_FROM_EMAIL', 'noreply@ticketspace.es'),
                'from_name'  => self::env('SMTP_FROM_NAME', 'TicketSpace'),
            ],
            'apple_wallet' => [
                'pass_type_id'  => self::env('APPLE_PASS_TYPE_ID', ''),
                'team_id'       => self::env('APPLE_TEAM_ID', ''),
                'cert_path'     => self::env('APPLE_CERT_PATH', ''),
                'cert_pass'     => self::env('APPLE_CERT_PASS', ''),
                'wwdr_cert_path'=> self::env('APPLE_WWDR_CERT_PATH', ''),
            ],
            'google_wallet' => [
                'issuer_id'           => self::env('GOOGLE_WALLET_ISSUER_ID', ''),
                'service_account_key' => self::env('GOOGLE_WALLET_SERVICE_ACCOUNT_KEY', ''),
            ],
            'platform' => [
                'fee_fixed'   => self::envFloat('PLATFORM_FEE_FIXED', 0.50),
                'fee_percent' => self::envFloat('PLATFORM_FEE_PERCENT', 2.0),
                'currency'    => self::env('PLATFORM_CURRENCY', 'EUR'),
            ],
            'security' => [
                'rate_limit_requests' => self::envInt('RATE_LIMIT_REQUESTS', 100),
                'rate_limit_window'   => self::envInt('RATE_LIMIT_WINDOW', 60),
                'cors_origins'        => self::env('CORS_ALLOWED_ORIGINS', '*'),
                'reservation_ttl'     => self::envInt('TICKET_RESERVATION_TTL', 900),
            ],
            'upload' => [
                'max_size'      => self::envInt('UPLOAD_MAX_SIZE', 5242880),
                'allowed_types' => explode(',', self::env('UPLOAD_ALLOWED_TYPES', 'image/jpeg,image/png,image/webp')),
                'path'          => self::env('UPLOAD_PATH', 'uploads'),
            ],
        ];

        date_default_timezone_set(self::$config['app']['timezone']);
    }

    /**
     * Get a configuration value using dot notation.
     * Example: App::get('db.host') returns the database host.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        if (self::$config === null) {
            self::load();
        }

        $keys = explode('.', $key);
        $value = self::$config;

        foreach ($keys as $segment) {
            if (!is_array($value) || !array_key_exists($segment, $value)) {
                return $default;
            }
            $value = $value[$segment];
        }

        return $value;
    }

    /**
     * Check if the application is in debug mode.
     */
    public static function isDebug(): bool
    {
        return (bool) self::get('app.debug', false);
    }

    /**
     * Check if the application is in production.
     */
    public static function isProduction(): bool
    {
        return self::get('app.env') === 'production';
    }

    /**
     * Get an environment variable with a default value.
     */
    private static function env(string $key, string $default = ''): string
    {
        return $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key) ?: $default;
    }

    /**
     * Get an environment variable as boolean.
     */
    private static function envBool(string $key, bool $default = false): bool
    {
        $value = self::env($key, '');
        if ($value === '') {
            return $default;
        }
        return in_array(strtolower($value), ['true', '1', 'yes', 'on'], true);
    }

    /**
     * Get an environment variable as integer.
     */
    private static function envInt(string $key, int $default = 0): int
    {
        $value = self::env($key, '');
        return $value !== '' ? (int) $value : $default;
    }

    /**
     * Get an environment variable as float.
     */
    private static function envFloat(string $key, float $default = 0.0): float
    {
        $value = self::env($key, '');
        return $value !== '' ? (float) $value : $default;
    }
}
