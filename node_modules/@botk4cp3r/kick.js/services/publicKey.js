const { UnauthorizedError } = require('../errors');

class PublicKeyService {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.baseUrl = 'https://api.kick.com/public/v1/public-key';
    }

    async getPublicKey() {
        const response = await fetch(this.baseUrl, {
            method: 'GET'
        });

        if (response.status === 401) throw new UnauthorizedError();
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        return await response.json();
    }
}

module.exports = { PublicKeyService };
