<?php

declare(strict_types=1);

namespace TicketSpace\Models;

class TicketType extends BaseModel
{
    protected string $table = 'ticket_types';

    protected array $fillable = [
        'event_id',
        'name',
        'description',
        'price',
        'original_price',
        'quantity_total',
        'quantity_sold',
        'max_per_user',
        'section',
        'row_label',
        'seat_start',
        'seat_end',
        'sale_start',
        'sale_end',
        'is_active',
        'sort_order'
    ];
}
