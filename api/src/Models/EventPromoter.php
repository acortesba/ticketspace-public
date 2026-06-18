<?php

declare(strict_types=1);

namespace TicketSpace\Models;

class EventPromoter extends BaseModel
{
    protected string $table = 'event_promoters';

    protected array $fillable = [
        'event_id',
        'user_id',
        'promo_code',
        'commission_type',
        'commission_value'
    ];

    /**
     * Find a promoter by event and user ID
     */
    public function findByEventAndUser(int $eventId, int $userId): ?array
    {
        $stmt = $this->db()->prepare(
            "SELECT * FROM {$this->table} WHERE event_id = :event_id AND user_id = :user_id LIMIT 1"
        );
        $stmt->execute([':event_id' => $eventId, ':user_id' => $userId]);
        $result = $stmt->fetch();
        return $result ?: null;
    }
}
