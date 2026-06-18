<?php

declare(strict_types=1);

namespace TicketSpace\Controllers;

use TicketSpace\Config\App;
use TicketSpace\Models\Event;
use TicketSpace\Models\TicketType;
use TicketSpace\Models\EventPromoter;
use TicketSpace\Models\User;
use TicketSpace\Routes\Router;
use TicketSpace\Utils\Database;
use TicketSpace\Utils\Logger;
use TicketSpace\Utils\Response;
use TicketSpace\Utils\Sanitizer;
use TicketSpace\Utils\Validator;

class EventController
{
    private Event $eventModel;
    private TicketType $ticketTypeModel;
    private EventPromoter $eventPromoterModel;
    private User $userModel;

    public function __construct()
    {
        $this->eventModel = new Event();
        $this->ticketTypeModel = new TicketType();
        $this->eventPromoterModel = new EventPromoter();
        $this->userModel = new User();
    }

    /**
     * Create a new event with all its ticket phases and promoters in a single transaction
     */
    public function create(array $params): void
    {
        $data = Router::getBody();
        $hostId = $_SESSION['user']['id'];

        // 1. Basic Event Validation
        [$valid, $errors] = Validator::make($data, [
            'title'        => 'required|string|max:255',
            'description'  => 'nullable|string',
            'startDate'    => 'required|string',
            'venueName'    => 'required|string|max:255',
            'venueAddress' => 'nullable|string',
        ]);

        if (!$valid) {
            Response::validationError($errors);
            return;
        }

        // Validate tickets
        if (empty($data['tickets']) || !is_array($data['tickets'])) {
            Response::validationError(['tickets' => 'At least one ticket phase is required.']);
            return;
        }

        // Generate Event UUID
        $eventUuid = Sanitizer::generateUuid();
        $frontendHostUrl = App::get('app.url') . '/event/' . $eventUuid;

        try {
            $result = Database::transaction(function ($pdo) use ($data, $hostId, $eventUuid, $frontendHostUrl) {
                
                // 1. Insert Event
                // Ensure dates are correctly formatted for MySQL (YYYY-MM-DD HH:MM:SS)
                $eventStart = date('Y-m-d H:i:s', strtotime($data['startDate']));
                $eventEnd = !empty($data['endDate']) ? date('Y-m-d H:i:s', strtotime($data['endDate'])) : null;
                $doorsOpen = !empty($data['doorsOpen']) ? date('Y-m-d H:i:s', strtotime($data['doorsOpen'])) : null;
                
                // Default sale dates based on event start if not provided
                $saleStart = date('Y-m-d H:i:s');
                $saleEnd = $eventStart;

                $eventData = [
                    'uuid' => $eventUuid,
                    'host_id' => $hostId,
                    'title' => Sanitizer::sanitizeString($data['title']),
                    'description' => Sanitizer::sanitizeString($data['description'] ?? ''),
                    'venue_name' => Sanitizer::sanitizeString($data['venueName']),
                    'venue_address' => Sanitizer::sanitizeString($data['venueAddress'] ?? ''),
                    'latitude' => isset($data['latitude']) && is_numeric($data['latitude']) ? (float)$data['latitude'] : null,
                    'longitude' => isset($data['longitude']) && is_numeric($data['longitude']) ? (float)$data['longitude'] : null,
                    'event_start' => $eventStart,
                    'event_end' => $eventEnd,
                    'doors_open' => $doorsOpen,
                    'sale_start' => $saleStart,
                    'sale_end' => $saleEnd,
                    'status' => 'published' // Immediately publish for now
                ];

                $event = $this->eventModel->createEvent($eventData);
                if (!$event) {
                    throw new \Exception("Failed to create event record");
                }

                $eventId = $event['id'];

                // 2. Insert Ticket Phases
                foreach ($data['tickets'] as $index => $ticket) {
                    // Validate basic ticket fields
                    if (empty($ticket['name']) || !isset($ticket['price']) || empty($ticket['quantity'])) {
                        throw new \Exception("Invalid ticket data at index {$index}");
                    }

                    $tSaleStart = !empty($ticket['saleStart']) ? date('Y-m-d H:i:s', strtotime($ticket['saleStart'])) : $saleStart;
                    $tSaleEnd = !empty($ticket['saleEnd']) ? date('Y-m-d H:i:s', strtotime($ticket['saleEnd'])) : $saleEnd;

                    $this->ticketTypeModel->create([
                        'event_id' => $eventId,
                        'name' => Sanitizer::sanitizeString($ticket['name']),
                        'price' => (float)$ticket['price'],
                        'quantity_total' => (int)$ticket['quantity'],
                        'quantity_sold' => 0,
                        'sale_start' => $tSaleStart,
                        'sale_end' => $tSaleEnd,
                        'sort_order' => $index
                    ]);
                }

                // 3. Insert Promoters
                $promoterLinks = [];
                if (!empty($data['promoters']) && is_array($data['promoters'])) {
                    foreach ($data['promoters'] as $promoter) {
                        if (empty($promoter['uid']) || empty($promoter['commissionValue'])) {
                            continue; // Skip invalid promoters
                        }

                        // Look up the user by UUID to get their internal ID
                        $stmt = $pdo->prepare("SELECT id FROM users WHERE uuid = :uuid LIMIT 1");
                        $stmt->execute([':uuid' => $promoter['uid']]);
                        $userRow = $stmt->fetch();

                        if (!$userRow) {
                            throw new \Exception("User not found with UID: {$promoter['uid']}");
                        }

                        $promoCode = !empty($promoter['promoCode']) ? strtoupper(trim($promoter['promoCode'])) : null;
                        
                        $this->eventPromoterModel->create([
                            'event_id' => $eventId,
                            'user_id' => $userRow['id'],
                            'promo_code' => $promoCode,
                            'commission_type' => $promoter['commissionType'] === 'fixed' ? 'fixed' : 'percentage',
                            'commission_value' => (float)$promoter['commissionValue']
                        ]);

                        // Generate quick share link
                        $shareUrl = $frontendHostUrl;
                        if ($promoCode) {
                            $shareUrl .= "?promo=" . urlencode($promoCode);
                        } else {
                            $shareUrl .= "?ref=" . urlencode($promoter['uid']);
                        }

                        $promoterLinks[] = [
                            'uid' => $promoter['uid'],
                            'promoCode' => $promoCode,
                            'shareUrl' => $shareUrl
                        ];
                    }
                }

                return [
                    'event' => $event,
                    'promoterLinks' => $promoterLinks
                ];
            });

            Response::success([
                'message' => 'Event created successfully',
                'event_uuid' => $eventUuid,
                'promoters' => $result['promoterLinks']
            ], 201);

        } catch (\Exception $e) {
            Logger::error('Event creation failed', ['error' => $e->getMessage()]);
            Response::serverError($e->getMessage());
        }
    }
}
