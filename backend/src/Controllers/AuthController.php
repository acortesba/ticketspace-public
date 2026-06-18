<?php

declare(strict_types=1);

namespace TicketSpace\Controllers;

use TicketSpace\Models\User;
use TicketSpace\Middleware\AuthMiddleware;
use TicketSpace\Utils\Response;
use TicketSpace\Utils\Validator;
use TicketSpace\Utils\Sanitizer;
use TicketSpace\Config\App;
use TicketSpace\Services\EmailService;

/**
 * Authentication Controller
 * 
 * Handles user registration, login, token refresh, and password reset.
 */
class AuthController
{
    private User $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    /**
     * Register a new user.
     */
    public function register(array $params): void
    {
        $data = \TicketSpace\Routes\Router::getBody();

        [$valid, $errors] = Validator::make($data, [
            'email'        => 'required|email|max:255',
            'password'     => 'required|min:8|max:100',
            'first_name'   => 'required|string|max:100',
            'last_name'    => 'required|string|max:100',
            'phone'        => 'nullable|string|max:20',
            'account_type' => 'nullable|string|max:20',
        ]);

        if (!$valid) {
            Response::validationError($errors);
            return;
        }

        // Check if email already exists
        if ($this->userModel->exists('email', strtolower($data['email']))) {
            Response::error('Email is already registered', 409);
            return;
        }

        $sanitized = Sanitizer::sanitize($data, [
            'email'      => 'email',
            'first_name' => 'string',
            'last_name'  => 'string',
            'phone'      => 'string',
        ]);

        // Keep raw password for hashing in model
        $sanitized['password'] = $data['password'];

        $roleToAssign = isset($data['account_type']) && $data['account_type'] === 'host' ? 'host' : 'buyer';

        try {
            \TicketSpace\Utils\Database::beginTransaction();

            $user = $this->userModel->register($sanitized, $roleToAssign);
            
            if (!$user) {
                \TicketSpace\Utils\Database::rollback();
                Response::serverError('Failed to create user account');
                return;
            }

            // TODO: Send verification email
            // EmailService::sendVerification($user['email'], $user['verification_token']);

            \TicketSpace\Utils\Database::commit();

            Response::created([
                'user' => [
                    'id'         => $user['id'],
                    'uuid'       => $user['uuid'],
                    'email'      => $user['email'],
                    'first_name' => $user['first_name'],
                    'last_name'  => $user['last_name'],
                    'roles'      => $user['roles'],
                ]
            ], 'Registration successful. Please verify your email.');
            
        } catch (\Exception $e) {
            \TicketSpace\Utils\Database::rollback();
            \TicketSpace\Utils\Logger::error('Registration error', ['error' => $e->getMessage()]);
            Response::serverError('Registration failed');
        }
    }

    /**
     * Login user and issue JWT.
     */
    public function login(array $params): void
    {
        $data = \TicketSpace\Routes\Router::getBody();

        [$valid, $errors] = Validator::make($data, [
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (!$valid) {
            Response::validationError($errors);
            return;
        }

        $user = $this->userModel->findByEmail($data['email']);

        if (!$user || !$this->userModel->verifyPassword($user, $data['password'])) {
            Response::unauthorized('Invalid email or password');
            return;
        }

        $userWithRoles = $this->userModel->findWithRoles($user['id']);

        // Create refresh token session
        $refreshToken = AuthMiddleware::generateRefreshToken();
        $sessionId = $this->userModel->createSession(
            $user['id'],
            $refreshToken,
            App::get('jwt.refresh_expiry', 604800)
        );

        // Create access token
        $accessToken = AuthMiddleware::generateAccessToken($userWithRoles, $sessionId);

        Response::success([
            'access_token'  => $accessToken,
            'refresh_token' => $refreshToken,
            'expires_in'    => App::get('jwt.expiry', 3600),
            'user'          => [
                'id'         => $userWithRoles['id'],
                'uuid'       => $userWithRoles['uuid'],
                'email'      => $userWithRoles['email'],
                'first_name' => $userWithRoles['first_name'],
                'last_name'  => $userWithRoles['last_name'],
                'roles'      => $userWithRoles['roles'],
            ]
        ], 'Login successful');
    }

    /**
     * Refresh access token using a valid refresh token.
     */
    public function refresh(array $params): void
    {
        $data = \TicketSpace\Routes\Router::getBody();

        if (empty($data['refresh_token'])) {
            Response::error('Refresh token is required');
            return;
        }

        $session = $this->userModel->validateRefreshToken($data['refresh_token']);

        if (!$session) {
            Response::unauthorized('Invalid or expired refresh token. Please login again.');
            return;
        }

        $user = $this->userModel->findWithRoles($session['user_id']);
        
        if (!$user) {
            Response::unauthorized('User not found');
            return;
        }

        // Issue new access token using the same session ID (jti)
        $accessToken = AuthMiddleware::generateAccessToken($user, $session['id']);

        Response::success([
            'access_token' => $accessToken,
            'expires_in'   => App::get('jwt.expiry', 3600),
        ], 'Token refreshed successfully');
    }

    /**
     * Logout user by invalidating the current session.
     */
    public function logout(array $params): void
    {
        $user = AuthMiddleware::user();
        
        if ($user && !empty($user['jti'])) {
            $this->userModel->destroySession($user['jti']);
        }

        Response::success(null, 'Logged out successfully');
    }

    /**
     * Get the authenticated user's profile.
     */
    public function me(array $params): void
    {
        $userId = AuthMiddleware::userId();
        $user = $this->userModel->findWithRoles($userId);

        if (!$user) {
            Response::notFound('User not found');
            return;
        }

        Response::success([
            'id'             => $user['id'],
            'uuid'           => $user['uuid'],
            'email'          => $user['email'],
            'first_name'     => $user['first_name'],
            'last_name'      => $user['last_name'],
            'phone'          => $user['phone'],
            'locale'         => $user['locale'],
            'email_verified' => (bool) $user['email_verified'],
            'roles'          => $user['roles'],
            'created_at'     => $user['created_at'],
        ]);
    }
}
