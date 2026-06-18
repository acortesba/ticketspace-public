<?php

declare(strict_types=1);

namespace TicketSpace\Utils;

/**
 * Input Validator
 * 
 * Validates request data against a set of rules.
 * Rules are defined as associative arrays: ['field' => 'rule1|rule2:param'].
 * 
 * Supported rules:
 * - required          : Field must be present and non-empty
 * - string            : Must be a string
 * - integer           : Must be an integer
 * - numeric           : Must be numeric
 * - boolean           : Must be a boolean
 * - email             : Must be a valid email address
 * - min:n             : Minimum length (string) or value (numeric)
 * - max:n             : Maximum length (string) or value (numeric)
 * - between:min,max   : Value must be between min and max
 * - in:val1,val2,...  : Must be one of the listed values
 * - uuid              : Must be a valid UUID v4
 * - date              : Must be a valid date (Y-m-d)
 * - datetime          : Must be a valid datetime (Y-m-d H:i:s)
 * - url               : Must be a valid URL
 * - regex:pattern     : Must match the regex pattern
 * - confirmed         : Field must have a matching {field}_confirmation
 * - nullable          : Field can be null (skips other validations if null)
 * - array             : Must be an array
 * - alpha             : Must contain only alphabetic characters
 * - alpha_num         : Must contain only alphanumeric characters
 * - phone             : Must be a valid phone number format
 */
class Validator
{
    private array $errors = [];
    private array $data;
    private array $rules;
    private bool $hasNullable = false;

    public function __construct(array $data, array $rules)
    {
        $this->data  = $data;
        $this->rules = $rules;
    }

    /**
     * Run validation and return whether it passed.
     */
    public function validate(): bool
    {
        $this->errors = [];

        foreach ($this->rules as $field => $ruleString) {
            $rules = explode('|', $ruleString);
            $this->hasNullable = in_array('nullable', $rules, true);

            $value = $this->data[$field] ?? null;

            // If nullable and value is null, skip all other rules
            if ($this->hasNullable && $value === null) {
                continue;
            }

            foreach ($rules as $rule) {
                if ($rule === 'nullable') {
                    continue;
                }

                $params = [];
                if (str_contains($rule, ':')) {
                    [$rule, $paramString] = explode(':', $rule, 2);
                    $params = explode(',', $paramString);
                }

                $method = 'validate' . str_replace('_', '', ucwords($rule, '_'));

                if (method_exists($this, $method)) {
                    $this->$method($field, $value, $params);
                }
            }
        }

        return empty($this->errors);
    }

    /**
     * Get validation errors.
     */
    public function getErrors(): array
    {
        return $this->errors;
    }

    /**
     * Add an error for a field.
     */
    private function addError(string $field, string $message): void
    {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = [];
        }
        $this->errors[$field][] = $message;
    }

    // ---- Validation Rules ----

    private function validateRequired(string $field, mixed $value, array $params): void
    {
        if ($value === null || $value === '' || (is_array($value) && empty($value))) {
            $this->addError($field, "The {$field} field is required.");
        }
    }

    private function validateString(string $field, mixed $value, array $params): void
    {
        if ($value !== null && !is_string($value)) {
            $this->addError($field, "The {$field} field must be a string.");
        }
    }

    private function validateInteger(string $field, mixed $value, array $params): void
    {
        if ($value !== null && filter_var($value, FILTER_VALIDATE_INT) === false) {
            $this->addError($field, "The {$field} field must be an integer.");
        }
    }

    private function validateNumeric(string $field, mixed $value, array $params): void
    {
        if ($value !== null && !is_numeric($value)) {
            $this->addError($field, "The {$field} field must be numeric.");
        }
    }

    private function validateBoolean(string $field, mixed $value, array $params): void
    {
        if ($value !== null && !in_array($value, [true, false, 0, 1, '0', '1', 'true', 'false'], true)) {
            $this->addError($field, "The {$field} field must be a boolean.");
        }
    }

    private function validateEmail(string $field, mixed $value, array $params): void
    {
        if ($value !== null && $value !== '' && filter_var($value, FILTER_VALIDATE_EMAIL) === false) {
            $this->addError($field, "The {$field} field must be a valid email address.");
        }
    }

    private function validateMin(string $field, mixed $value, array $params): void
    {
        $min = (int) ($params[0] ?? 0);
        if (is_string($value)) {
            if (mb_strlen($value) < $min) {
                $this->addError($field, "The {$field} field must be at least {$min} characters.");
            }
        } elseif (is_numeric($value)) {
            if ((float) $value < $min) {
                $this->addError($field, "The {$field} field must be at least {$min}.");
            }
        }
    }

    private function validateMax(string $field, mixed $value, array $params): void
    {
        $max = (int) ($params[0] ?? PHP_INT_MAX);
        if (is_string($value)) {
            if (mb_strlen($value) > $max) {
                $this->addError($field, "The {$field} field must not exceed {$max} characters.");
            }
        } elseif (is_numeric($value)) {
            if ((float) $value > $max) {
                $this->addError($field, "The {$field} field must not exceed {$max}.");
            }
        }
    }

    private function validateBetween(string $field, mixed $value, array $params): void
    {
        $min = (float) ($params[0] ?? 0);
        $max = (float) ($params[1] ?? PHP_INT_MAX);
        
        if (is_string($value)) {
            $len = mb_strlen($value);
            if ($len < $min || $len > $max) {
                $this->addError($field, "The {$field} field must be between {$min} and {$max} characters.");
            }
        } elseif (is_numeric($value)) {
            if ((float) $value < $min || (float) $value > $max) {
                $this->addError($field, "The {$field} field must be between {$min} and {$max}.");
            }
        }
    }

    private function validateIn(string $field, mixed $value, array $params): void
    {
        if ($value !== null && !in_array((string) $value, $params, true)) {
            $allowed = implode(', ', $params);
            $this->addError($field, "The {$field} field must be one of: {$allowed}.");
        }
    }

    private function validateUuid(string $field, mixed $value, array $params): void
    {
        $pattern = '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i';
        if ($value !== null && $value !== '' && !preg_match($pattern, (string) $value)) {
            $this->addError($field, "The {$field} field must be a valid UUID.");
        }
    }

    private function validateDate(string $field, mixed $value, array $params): void
    {
        if ($value !== null && $value !== '') {
            $date = \DateTime::createFromFormat('Y-m-d', (string) $value);
            if (!$date || $date->format('Y-m-d') !== (string) $value) {
                $this->addError($field, "The {$field} field must be a valid date (YYYY-MM-DD).");
            }
        }
    }

    private function validateDatetime(string $field, mixed $value, array $params): void
    {
        if ($value !== null && $value !== '') {
            $date = \DateTime::createFromFormat('Y-m-d H:i:s', (string) $value);
            if (!$date || $date->format('Y-m-d H:i:s') !== (string) $value) {
                $this->addError($field, "The {$field} field must be a valid datetime (YYYY-MM-DD HH:MM:SS).");
            }
        }
    }

    private function validateUrl(string $field, mixed $value, array $params): void
    {
        if ($value !== null && $value !== '' && filter_var($value, FILTER_VALIDATE_URL) === false) {
            $this->addError($field, "The {$field} field must be a valid URL.");
        }
    }

    private function validateRegex(string $field, mixed $value, array $params): void
    {
        $pattern = $params[0] ?? '';
        if ($value !== null && $value !== '' && !preg_match($pattern, (string) $value)) {
            $this->addError($field, "The {$field} field format is invalid.");
        }
    }

    private function validateConfirmed(string $field, mixed $value, array $params): void
    {
        $confirmField = $field . '_confirmation';
        $confirmValue = $this->data[$confirmField] ?? null;
        if ($value !== $confirmValue) {
            $this->addError($field, "The {$field} confirmation does not match.");
        }
    }

    private function validateArray(string $field, mixed $value, array $params): void
    {
        if ($value !== null && !is_array($value)) {
            $this->addError($field, "The {$field} field must be an array.");
        }
    }

    private function validateAlpha(string $field, mixed $value, array $params): void
    {
        if ($value !== null && $value !== '' && !ctype_alpha(str_replace(' ', '', (string) $value))) {
            $this->addError($field, "The {$field} field must contain only alphabetic characters.");
        }
    }

    private function validateAlphaNum(string $field, mixed $value, array $params): void
    {
        if ($value !== null && $value !== '' && !ctype_alnum(str_replace(' ', '', (string) $value))) {
            $this->addError($field, "The {$field} field must contain only alphanumeric characters.");
        }
    }

    private function validatePhone(string $field, mixed $value, array $params): void
    {
        $pattern = '/^\+?[1-9]\d{1,14}$/';
        if ($value !== null && $value !== '' && !preg_match($pattern, (string) $value)) {
            $this->addError($field, "The {$field} field must be a valid phone number.");
        }
    }

    /**
     * Static factory for quick validation.
     * Returns [bool $valid, array $errors].
     */
    public static function make(array $data, array $rules): array
    {
        $validator = new self($data, $rules);
        $valid = $validator->validate();
        return [$valid, $validator->getErrors()];
    }
}
