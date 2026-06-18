<?php

declare(strict_types=1);

namespace TicketSpace\Models;

use TicketSpace\Utils\Database;
use PDO;

class Ticket extends BaseModel
{
    protected string $table = 'tickets';

    /**
     * Get tickets for a specific user, categorized by active or past events.
     * 
     * @param int $userId
     * @param bool $active If true, returns tickets for upcoming events. If false, returns past.
     * @return array
     */
    public function getUserTickets(int $userId, bool $active = true): array
    {
        $operator = $active ? '>=' : '<';
        
        $sql = "
            SELECT 
                t.id, t.token, t.status, t.seat_section, t.seat_row, t.seat_number,
                e.title as event_name, e.event_start, e.event_end, e.venue_name, e.venue_address,
                tt.name as ticket_type
            FROM tickets t
            JOIN events e ON t.event_id = e.id
            JOIN ticket_types tt ON t.ticket_type_id = tt.id
            WHERE t.user_id = :user_id 
              AND e.event_start {$operator} NOW()
            ORDER BY e.event_start " . ($active ? "ASC" : "DESC");

        $stmt = Database::getInstance()->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    /**
     * Find a ticket by its token, securely including event info.
     */
    public function findByToken(string $token): ?array
    {
        $sql = "
            SELECT 
                t.*,
                e.title as event_name, e.event_start, e.venue_name,
                tt.name as ticket_type,
                u.first_name, u.last_name
            FROM tickets t
            JOIN events e ON t.event_id = e.id
            JOIN ticket_types tt ON t.ticket_type_id = tt.id
            JOIN users u ON t.user_id = u.id
            WHERE t.token = :token
            LIMIT 1
        ";

        $stmt = Database::getInstance()->prepare($sql);
        $stmt->execute(['token' => $token]);
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }
}
