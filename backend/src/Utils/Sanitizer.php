<?php

declare(strict_types=1);

namespace TicketSpace\Utils;

/**
 * Input Sanitizer
 * 
 * Cleans and sanitizes user input to prevent XSS and injection attacks.
 * Should be used on all user input before processing.
 */
class Sanitizer
{
    /**
     * Sanitize a string — strips HTML tags and encodes special characters.
     */
    public static function string(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }
        return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    /**
     * Sanitize an email address.
     */
    public static function email(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }
        return filter_var(trim(strtolower($value)), FILTER_SANITIZE_EMAIL) ?: null;
    }

    /**
     * Sanitize an integer value.
     */
    public static function int(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }
        $filtered = filter_var($value, FILTER_VALIDATE_INT);
        return $filtered !== false ? $filtered : null;
    }

    /**
     * Sanitize a float value.
     */
    public static function float(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }
        $filtered = filter_var($value, FILTER_VALIDATE_FLOAT);
        return $filtered !== false ? $filtered : null;
    }

    /**
     * Sanitize a boolean value.
     */
    public static function bool(mixed $value): ?bool
    {
        if ($value === null) {
            return null;
        }
        return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
    }

    /**
     * Sanitize a URL.
     */
    public static function url(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }
        return filter_var(trim($value), FILTER_SANITIZE_URL) ?: null;
    }

    /**
     * Sanitize rich text — allows basic HTML tags for description fields.
     * Allows: <p>, <br>, <strong>, <em>, <ul>, <ol>, <li>, <a>, <h2-h6>
     */
    public static function richText(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }
        $allowed = '<p><br><strong><em><ul><ol><li><a><h2><h3><h4><h5><h6>';
        return strip_tags(trim($value), $allowed);
    }

    /**
     * Sanitize a filename — remove dangerous characters.
     */
    public static function filename(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }
        // Remove path traversal attempts and dangerous characters
        $value = basename($value);
        $value = preg_replace('/[^a-zA-Z0-9._-]/', '_', $value);
        return $value ?: null;
    }

    /**
     * Sanitize a UUID.
     */
    public static function uuid(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }
        $value = trim($value);
        if (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', $value)) {
            return strtolower($value);
        }
        return null;
    }

    /**
     * Sanitize an array of data using a field map.
     * 
     * @param array $data      Input data
     * @param array $fieldMap  Field-to-type map: ['name' => 'string', 'email' => 'email', ...]
     * @return array Sanitized data
     */
    public static function sanitize(array $data, array $fieldMap): array
    {
        $result = [];
        foreach ($fieldMap as $field => $type) {
            if (!array_key_exists($field, $data)) {
                continue;
            }
            $result[$field] = match ($type) {
                'string'   => self::string($data[$field]),
                'email'    => self::email($data[$field]),
                'int'      => self::int($data[$field]),
                'float'    => self::float($data[$field]),
                'bool'     => self::bool($data[$field]),
                'url'      => self::url($data[$field]),
                'richtext' => self::richText($data[$field]),
                'filename' => self::filename($data[$field]),
                'uuid'     => self::uuid($data[$field]),
                default    => self::string((string) $data[$field]),
            };
        }
        return $result;
    }

    /**
     * Generate a cryptographically secure random token.
     */
    public static function generateToken(int $length = 32): string
    {
        return bin2hex(random_bytes($length));
    }

    /**
     * Generate a UUID v4.
     */
    public static function generateUuid(): string
    {
        $data = random_bytes(16);
        // Set version to 0100 (UUID v4)
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
        // Set variant to 10xx
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);

        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}
