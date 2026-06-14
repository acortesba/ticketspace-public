<?php

declare(strict_types=1);

namespace TicketSpace\Models;

use TicketSpace\Utils\Database;
use PDO;

/**
 * Base Model
 * 
 * Provides common CRUD operations for all models.
 * Each child model defines its table name and fillable fields.
 * All queries use prepared statements to prevent SQL injection.
 */
abstract class BaseModel
{
    /** The database table name */
    protected string $table;

    /** Fields that can be mass-assigned */
    protected array $fillable = [];

    /** Fields to hide from JSON/array output */
    protected array $hidden = [];

    /** The primary key column name */
    protected string $primaryKey = 'id';

    /** Whether the model uses soft deletes */
    protected bool $softDeletes = false;

    /**
     * Get the PDO database instance.
     */
    protected function db(): PDO
    {
        return Database::getInstance();
    }

    /**
     * Find a record by its primary key.
     */
    public function find(int $id): ?array
    {
        $query = "SELECT * FROM {$this->table} WHERE {$this->primaryKey} = :id";
        if ($this->softDeletes) {
            $query .= ' AND deleted_at IS NULL';
        }
        $query .= ' LIMIT 1';

        $stmt = $this->db()->prepare($query);
        $stmt->execute([':id' => $id]);
        $result = $stmt->fetch();

        return $result !== false ? $this->hideFields($result) : null;
    }

    /**
     * Find a record by UUID.
     */
    public function findByUuid(string $uuid): ?array
    {
        $query = "SELECT * FROM {$this->table} WHERE uuid = :uuid";
        if ($this->softDeletes) {
            $query .= ' AND deleted_at IS NULL';
        }
        $query .= ' LIMIT 1';

        $stmt = $this->db()->prepare($query);
        $stmt->execute([':uuid' => $uuid]);
        $result = $stmt->fetch();

        return $result !== false ? $this->hideFields($result) : null;
    }

    /**
     * Find a record by a specific column value.
     */
    public function findBy(string $column, mixed $value): ?array
    {
        $this->validateColumn($column);

        $query = "SELECT * FROM {$this->table} WHERE {$column} = :value";
        if ($this->softDeletes) {
            $query .= ' AND deleted_at IS NULL';
        }
        $query .= ' LIMIT 1';

        $stmt = $this->db()->prepare($query);
        $stmt->execute([':value' => $value]);
        $result = $stmt->fetch();

        return $result !== false ? $this->hideFields($result) : null;
    }

    /**
     * Find multiple records matching a condition.
     */
    public function where(string $column, mixed $value, string $operator = '='): array
    {
        $this->validateColumn($column);
        $this->validateOperator($operator);

        $query = "SELECT * FROM {$this->table} WHERE {$column} {$operator} :value";
        if ($this->softDeletes) {
            $query .= ' AND deleted_at IS NULL';
        }

        $stmt = $this->db()->prepare($query);
        $stmt->execute([':value' => $value]);
        $results = $stmt->fetchAll();

        return array_map(fn($row) => $this->hideFields($row), $results);
    }

    /**
     * Get all records, optionally paginated.
     */
    public function all(int $page = 1, int $perPage = 25, string $orderBy = 'id', string $direction = 'DESC'): array
    {
        $this->validateColumn($orderBy);
        $direction = strtoupper($direction) === 'ASC' ? 'ASC' : 'DESC';
        $offset = ($page - 1) * $perPage;

        $query = "SELECT * FROM {$this->table}";
        if ($this->softDeletes) {
            $query .= ' WHERE deleted_at IS NULL';
        }
        $query .= " ORDER BY {$orderBy} {$direction} LIMIT :limit OFFSET :offset";

        $stmt = $this->db()->prepare($query);
        $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $results = $stmt->fetchAll();

        return array_map(fn($row) => $this->hideFields($row), $results);
    }

    /**
     * Count total records (optionally with conditions).
     */
    public function count(string $column = null, mixed $value = null): int
    {
        $query = "SELECT COUNT(*) as total FROM {$this->table}";
        $params = [];

        if ($column !== null) {
            $this->validateColumn($column);
            $query .= " WHERE {$column} = :value";
            $params[':value'] = $value;
        }

        if ($this->softDeletes) {
            $query .= ($column !== null ? ' AND' : ' WHERE') . ' deleted_at IS NULL';
        }

        $stmt = $this->db()->prepare($query);
        $stmt->execute($params);
        return (int) $stmt->fetchColumn();
    }

    /**
     * Insert a new record.
     * Returns the inserted record with its ID.
     */
    public function create(array $data): ?array
    {
        // Filter to only fillable fields
        $data = array_intersect_key($data, array_flip($this->fillable));

        if (empty($data)) {
            return null;
        }

        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_map(fn($k) => ":{$k}", array_keys($data)));

        $query = "INSERT INTO {$this->table} ({$columns}) VALUES ({$placeholders})";

        $stmt = $this->db()->prepare($query);
        $stmt->execute($data);

        $id = (int) $this->db()->lastInsertId();
        return $this->find($id);
    }

    /**
     * Update an existing record by ID.
     * Returns the updated record.
     */
    public function update(int $id, array $data): ?array
    {
        // Filter to only fillable fields
        $data = array_intersect_key($data, array_flip($this->fillable));

        if (empty($data)) {
            return $this->find($id);
        }

        $setParts = array_map(fn($k) => "{$k} = :{$k}", array_keys($data));
        $setClause = implode(', ', $setParts);

        $query = "UPDATE {$this->table} SET {$setClause}, updated_at = NOW() WHERE {$this->primaryKey} = :_id";

        $data['_id'] = $id;
        $stmt = $this->db()->prepare($query);
        $stmt->execute($data);

        return $this->find($id);
    }

    /**
     * Delete a record by ID.
     * Uses soft delete if enabled, otherwise hard delete.
     */
    public function delete(int $id): bool
    {
        if ($this->softDeletes) {
            $query = "UPDATE {$this->table} SET deleted_at = NOW() WHERE {$this->primaryKey} = :id AND deleted_at IS NULL";
        } else {
            $query = "DELETE FROM {$this->table} WHERE {$this->primaryKey} = :id";
        }

        $stmt = $this->db()->prepare($query);
        $stmt->execute([':id' => $id]);

        return $stmt->rowCount() > 0;
    }

    /**
     * Check if a record exists by column value.
     */
    public function exists(string $column, mixed $value, ?int $excludeId = null): bool
    {
        $this->validateColumn($column);

        $query = "SELECT 1 FROM {$this->table} WHERE {$column} = :value";
        $params = [':value' => $value];

        if ($excludeId !== null) {
            $query .= " AND {$this->primaryKey} != :exclude_id";
            $params[':exclude_id'] = $excludeId;
        }

        if ($this->softDeletes) {
            $query .= ' AND deleted_at IS NULL';
        }

        $query .= ' LIMIT 1';

        $stmt = $this->db()->prepare($query);
        $stmt->execute($params);
        return $stmt->fetch() !== false;
    }

    /**
     * Remove hidden fields from the result.
     */
    protected function hideFields(array $data): array
    {
        foreach ($this->hidden as $field) {
            unset($data[$field]);
        }
        return $data;
    }

    /**
     * Validate that a column name is safe (prevent SQL injection via column names).
     */
    protected function validateColumn(string $column): void
    {
        if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $column)) {
            throw new \InvalidArgumentException("Invalid column name: {$column}");
        }
    }

    /**
     * Validate that an operator is safe.
     */
    protected function validateOperator(string $operator): void
    {
        $allowed = ['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'NOT LIKE', 'IN', 'NOT IN', 'IS', 'IS NOT'];
        if (!in_array(strtoupper($operator), $allowed, true)) {
            throw new \InvalidArgumentException("Invalid operator: {$operator}");
        }
    }
}
