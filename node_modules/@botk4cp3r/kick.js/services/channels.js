const { UnauthorizedError, ForbiddenError } = require('../errors');

class ChannelsService {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.baseUrl = 'https://api.kick.com/public/v1/channels';
    }

    async getChannels(broadcasterIds = [], token) {
        const url = new URL(this.baseUrl);
        
        if (broadcasterIds.length > 0) {
            broadcasterIds.forEach(id => 
                url.searchParams.append('broadcaster_user_id[]', id)
            );
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

    async updateChannel(options, token) {
        const response = await fetch(this.baseUrl, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                category_id: options.categoryId,
                stream_title: options.streamTitle
            })
        });

        if (response.status === 401) throw new UnauthorizedError();
        if (response.status === 403) throw new ForbiddenError();
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        return response.status === 204;
    }
}

module.exports = { ChannelsService };
