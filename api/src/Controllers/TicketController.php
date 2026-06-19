<?php

declare(strict_types=1);

namespace TicketSpace\Controllers;

use TicketSpace\Models\Ticket;
use TicketSpace\Middleware\AuthMiddleware;
use TicketSpace\Utils\Response;

class TicketController
{
    private Ticket $ticketModel;

    public function __construct()
    {
        $this->ticketModel = new Ticket();
    }

    /**
     * Get active tickets for the authenticated user.
     */
    public function getMyTickets(array $params): void
    {
        $userId = AuthMiddleware::userId();
        
        try {
            $tickets = $this->ticketModel->getUserTickets($userId, true);
            Response::success(['tickets' => $tickets], 'Active tickets retrieved');
        } catch (\Exception $e) {
            \TicketSpace\Utils\Logger::error('Failed to get active tickets', ['error' => $e->getMessage()]);
            Response::serverError('Could not retrieve tickets');
        }
    }

    /**
     * Get past tickets for the authenticated user.
     */
    public function getPastTickets(array $params): void
    {
        $userId = AuthMiddleware::userId();
        
        try {
            $tickets = $this->ticketModel->getUserTickets($userId, false);
            Response::success(['tickets' => $tickets], 'Past tickets retrieved');
        } catch (\Exception $e) {
            \TicketSpace\Utils\Logger::error('Failed to get past tickets', ['error' => $e->getMessage()]);
            Response::serverError('Could not retrieve past tickets');
        }
    }

    /**
     * Get a specific ticket by its token.
     * Accessible by the ticket owner OR an authorized scanner.
     */
    public function getTicketByToken(array $params): void
    {
        $token = $params['token'] ?? null;
        
        if (!$token) {
            Response::validationError(['token' => 'Ticket token is required']);
            return;
        }

        try {
            $ticket = $this->ticketModel->findByToken($token);
            
            if (!$ticket) {
                Response::notFound('Ticket not found');
                return;
            }

            $userId = AuthMiddleware::userId();
            $userRoles = AuthMiddleware::user()['roles'] ?? [];

            // Only allow the owner OR staff/host/admin to view this ticket
            $isStaff = !empty(array_intersect(['staff', 'host', 'admin', 'super_admin'], $userRoles));
            
            if ($ticket['user_id'] !== $userId && !$isStaff) {
                Response::forbidden('You do not have permission to view this ticket');
                return;
            }

            Response::success(['ticket' => $ticket], 'Ticket retrieved');
        } catch (\Exception $e) {
            \TicketSpace\Utils\Logger::error('Failed to get ticket by token', ['error' => $e->getMessage()]);
            Response::serverError('Could not retrieve ticket details');
        }
    }
}
