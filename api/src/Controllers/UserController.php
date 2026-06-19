<?php

declare(strict_types=1);

namespace TicketSpace\Controllers;

use TicketSpace\Models\User;
use TicketSpace\Middleware\AuthMiddleware;
use TicketSpace\Utils\Response;
use TicketSpace\Utils\Validator;
use TicketSpace\Utils\Sanitizer;

/**
 * User Controller
 * 
 * Handles user profile management (reading and updating own profile).
 */
class UserController
{
    private User $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    /**
     * Update the authenticated user's profile.
     */
    public function updateProfile(array $params): void
    {
        $userId = AuthMiddleware::userId();
        $data = \TicketSpace\Routes\Router::getBody();

        [$valid, $errors] = Validator::make($data, [
            'first_name' => 'nullable|string|max:100',
            'last_name'  => 'nullable|string|max:100',
            'phone'      => 'nullable|string|max:20',
            'locale'     => 'nullable|string|in:en,es',
        ]);

        if (!$valid) {
            Response::validationError($errors);
            return;
        }

        $sanitized = Sanitizer::sanitize($data, [
            'first_name' => 'string',
            'last_name'  => 'string',
            'phone'      => 'string',
            'locale'     => 'string',
        ]);

        // Remove null values so we only update provided fields
        $updateData = array_filter($sanitized, fn($value) => $value !== null);

        if (empty($updateData)) {
            Response::success(null, 'No changes provided');
            return;
        }

        $user = $this->userModel->update($userId, $updateData);

        if (!$user) {
            Response::serverError('Failed to update profile');
            return;
        }

        Response::success([
            'id'         => $user['id'],
            'uuid'       => $user['uuid'],
            'first_name' => $user['first_name'],
            'last_name'  => $user['last_name'],
            'phone'      => $user['phone'],
            'locale'     => $user['locale'],
        ], 'Profile updated successfully');
    }

    /**
     * Update the authenticated user's password.
     */
    public function updatePassword(array $params): void
    {
        $userId = AuthMiddleware::userId();
        $data = \TicketSpace\Routes\Router::getBody();

        [$valid, $errors] = Validator::make($data, [
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:8|max:100|confirmed',
        ]);

        if (!$valid) {
            Response::validationError($errors);
            return;
        }

        $user = $this->userModel->find($userId);

        if (!$user || !$this->userModel->verifyPassword($user, $data['current_password'])) {
            Response::error('Incorrect current password', 400);
            return;
        }

        if ($this->userModel->updatePassword($userId, $data['new_password'])) {
            // Optional: destroy all other sessions on password change
            // $this->userModel->destroyAllSessions($userId);
            
            Response::success(null, 'Password updated successfully');
        } else {
            Response::serverError('Failed to update password');
        }
    }
}
