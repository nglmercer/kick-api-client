class WebhookHandler {
    constructor(client) {
        this.client = client;
    }

    async handleWebhook(headers, rawBody) {

        const body = rawBody instanceof Buffer ? rawBody.toString('utf8') : rawBody;
        const payload = typeof body === 'string' ? JSON.parse(body) : body;

        const eventType = headers['kick-event-type'];
        const eventVersion = headers['kick-event-version'];
        switch (eventType) {
            case 'chat.message.sent':
                this.client.emit('chatMessage', {
                    messageId: payload.message_id,
                    broadcaster: payload.broadcaster,
                    sender: payload.sender,
                    content: payload.content,
                    emotes: payload.emotes || []
                });
                break;

            case 'channel.followed':
                this.client.emit('channelFollowed', {
                    broadcaster: payload.broadcaster,
                    follower: payload.follower
                });
                break;

            case 'channel.subscription.renewal':
                this.client.emit('subscriptionRenewal', {
                    broadcaster: payload.broadcaster,
                    subscriber: payload.subscriber,
                    duration: payload.duration,
                    createdAt: payload.created_at
                });
                break;

            case 'channel.subscription.gifts':
                this.client.emit('subscriptionGifts', {
                    broadcaster: payload.broadcaster,
                    gifter: payload.gifter,
                    giftees: payload.giftees,
                    createdAt: payload.created_at
                });
                break;

            case 'channel.subscription.new':
                this.client.emit('subscriptionNew', {
                    broadcaster: payload.broadcaster,
                    subscriber: payload.subscriber,
                    duration: payload.duration,
                    createdAt: payload.created_at
                });
                break;

            default:
                this.client.emit('unknownEvent', { eventType, payload });
        }

        return {
            eventType,
            eventVersion,
            payload
        };
    }
}

module.exports = { WebhookHandler };
