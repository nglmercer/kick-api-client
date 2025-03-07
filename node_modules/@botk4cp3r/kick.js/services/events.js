const { SignatureVerifier } = require('../utils/signature');
const { UnauthorizedError, ForbiddenError } = require('../errors');
const { parseWebhookPayload } = require('../types/webhooks');

class EventsService {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.verifier = null;
        this.baseUrl = 'https://api.kick.com/public/v1/events';
    }

    async initializeVerifier() {
        if (!this.verifier) {
            const publicKeyResponse = await this.apiClient.getPublicKey();
            this.verifier = new SignatureVerifier(publicKeyResponse.data.public_key);
        }
    }

    validateWebhook(headers, body) {
        if (!this.verifier) {
            throw new Error('Signature verifier not initialized');
        }

        const messageId = headers['kick-event-message-id'];
        const timestamp = headers['kick-event-message-timestamp'];
        const signature = headers['kick-event-signature'];
        const eventType = headers['kick-event-type'];
        const version = headers['kick-event-version'];

        if (!messageId || !timestamp || !signature) {
            throw new Error('Missing required webhook headers');
        }

        const isValid = this.verifier.verify(messageId, timestamp, body, signature);
        const parsedPayload = parseWebhookPayload(eventType, body);

        return {
            isValid,
            eventType,
            version,
            messageId,
            timestamp,
            payload: parsedPayload
        };
    }

    async getSubscriptions(token) {
        const response = await fetch(`${this.baseUrl}/subscriptions`, {
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

    async subscribe(events, method = 'webhook', token) {
        const webhookUrl = `${this.apiClient.options.webhookBaseUrl}:${this.apiClient.options.webhookPort}${this.apiClient.options.webhookPath}`;
        
        const response = await fetch(`${this.baseUrl}/subscriptions`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                method: method,
                url: webhookUrl,
                types: events.map(eventName => ({
                    name: eventName,
                    version: 1
                }))
            })
        });

        if (response.status === 401) throw new UnauthorizedError();
        if (response.status === 403) throw new ForbiddenError();
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(error)}`);
        }

        return await response.json();
    }

    async unsubscribe(subscriptionIds, token) {
        const url = new URL(`${this.baseUrl}/subscriptions`);
        subscriptionIds.forEach(id => url.searchParams.append('id[]', id));

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 401) throw new UnauthorizedError();
        if (response.status === 403) throw new ForbiddenError();
        if (!response.ok && response.status !== 204) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.status === 204;
    }
}

module.exports = { EventsService };
