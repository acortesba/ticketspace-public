<?php

declare(strict_types=1);

namespace TicketSpace\Models;

class Event extends BaseModel
{
    protected string $table = 'events';

    protected array $fillable = [
        'uuid',
        'host_id',
        'title',
        'description',
        'venue_name',
        'venue_address',
        'latitude',
        'longitude',
        'event_start',
        'event_end',
        'doors_open',
        'event_type',
        'allocation_type',
        'sale_start',
        'sale_end',
        'timezone',
        'currency',
        'status',
        'image_path',
        'seating_config_json',
        'max_capacity'
    ];

    /**
     * Create a new event and return the complete record
     */
    public function createEvent(array $data): ?array
    {
        $event = $this->create($data);
        return $event;
    }

    /**
     * Get all events for a specific host
     */
    public function getByHost(int $hostId): array
    {
        $stmt = $this->db()->prepare(
            "SELECT * FROM {$this->table} 
             WHERE host_id = :host_id AND deleted_at IS NULL 
             ORDER BY event_start DESC"
        );
        
        $stmt->execute([':host_id' => $hostId]);
        return $stmt->fetchAll();
    }
}
