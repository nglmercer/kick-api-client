const { UnauthorizedError, ForbiddenError } = require('../errors');

class UsersService {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.baseUrl = 'https://api.kick.com/public/v1';
    }

    async introspectToken(token) {
        const response = await fetch(`${this.baseUrl}/token/introspect`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 401) throw new UnauthorizedError();
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        return await response.json();
    }

    async getUsers(userIds = [], token) {
        const url = new URL(`${this.baseUrl}/users`);
        
        if (userIds.length > 0) {
            userIds.forEach(id => url.searchParams.append('id[]', id));
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 401) throw new UnauthorizedError();
        if (response.status === 403) throw new ForbiddenError();
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        return await response.json();
    }
}

module.exports = { UsersService };
