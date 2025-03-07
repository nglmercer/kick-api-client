class KickApiError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'KickApiError';
        this.status = status;
    }
}

class UnauthorizedError extends KickApiError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}

class ForbiddenError extends KickApiError {
    constructor(message = 'Forbidden') {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}

module.exports = {
    KickApiError,
    UnauthorizedError,
    ForbiddenError
};
