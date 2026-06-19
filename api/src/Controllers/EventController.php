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
            'eventType'    => 'required|string',
            'allocationType' => 'required|string',
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
                    'event_type' => Sanitizer::sanitizeString($data['eventType']),
                    'allocation_type' => Sanitizer::sanitizeString($data['allocationType']),
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
                        if (empty($promoter['commissionValue'])) {
                            continue; // Skip invalid promoters
                        }

                        $userId = null;
                        $uid = null;

                        if (!empty($promoter['uid'])) {
                            // Look up the user by UUID to get their internal ID
                            $stmt = $pdo->prepare("SELECT id, uuid FROM users WHERE uuid = :uuid LIMIT 1");
                            $stmt->execute([':uuid' => $promoter['uid']]);
                            $userRow = $stmt->fetch();

                            if (!$userRow) {
                                throw new \Exception("User not found with UID: {$promoter['uid']}");
                            }
                            $userId = $userRow['id'];
                            $uid = $userRow['uuid'];
                        } elseif (!empty($promoter['email'])) {
                            // New Promoter: check if email exists
                            $email = strtolower(trim($promoter['email']));
                            $stmt = $pdo->prepare("SELECT id, uuid FROM users WHERE email = :email LIMIT 1");
                            $stmt->execute([':email' => $email]);
                            $userRow = $stmt->fetch();

                            if ($userRow) {
                                $userId = $userRow['id'];
                                $uid = $userRow['uuid'];
                            } else {
                                // Create provisional user
                                $uid = Sanitizer::generateUuid();
                                $verificationToken = Sanitizer::generateToken(32);
                                
                                $stmt = $pdo->prepare("INSERT INTO users (uuid, email, first_name, last_name, verification_token, email_verified) VALUES (:uuid, :email, :first_name, :last_name, :token, 0)");
                                $stmt->execute([
                                    ':uuid' => $uid,
                                    ':email' => $email,
                                    ':first_name' => Sanitizer::sanitizeString($promoter['firstName'] ?? 'Promoter'),
                                    ':last_name' => Sanitizer::sanitizeString($promoter['lastName'] ?? ''),
                                    ':token' => $verificationToken
                                ]);
                                $userId = (int)$pdo->lastInsertId();
                            }
                        } else {
                            continue; // Neither UID nor Email provided
                        }

                        $promoCode = !empty($promoter['promoCode']) ? strtoupper(trim($promoter['promoCode'])) : null;
                        
                        $this->eventPromoterModel->create([
                            'event_id' => $eventId,
                            'user_id' => $userId,
                            'promo_code' => $promoCode,
                            'commission_type' => $promoter['commissionType'] === 'fixed' ? 'fixed' : 'percentage',
                            'commission_value' => (float)$promoter['commissionValue']
                        ]);

                        // Generate quick share link
                        $shareUrl = $frontendHostUrl;
                        if ($promoCode) {
                            $shareUrl .= "?promo=" . urlencode($promoCode);
                        } else {
                            $shareUrl .= "?ref=" . urlencode($uid);
                        }

                        $promoterLinks[] = [
                            'uid' => $uid,
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
    /**
     * Get all unique promoters that the host has used in their past events
     */
    public function getMyPromoters(): void
    {
        $hostId = $_SESSION['user']['id'];
        
        try {
            $stmt = Database::getInstance()->prepare("
                SELECT DISTINCT u.uuid as uid, u.first_name, u.last_name, u.email
                FROM event_promoters ep
                JOIN events e ON ep.event_id = e.id
                JOIN users u ON ep.user_id = u.id
                WHERE e.host_id = :host_id
            ");
            $stmt->execute([':host_id' => $hostId]);
            $promoters = $stmt->fetchAll();

            Response::success($promoters);
        } catch (\Exception $e) {
            Logger::error('Failed to fetch my promoters', ['error' => $e->getMessage()]);
            Response::serverError('Failed to fetch past promoters');
        }
    }
}
