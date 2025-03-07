const WEBHOOK_TYPES = {
    CHAT_MESSAGE: 'chat.message.sent',
    CHANNEL_FOLLOWED: 'channel.followed',
    SUBSCRIPTION_RENEWAL: 'channel.subscription.renewal',
    SUBSCRIPTION_GIFTS: 'channel.subscription.gifts',
    SUBSCRIPTION_NEW: 'channel.subscription.new'
};

function parseWebhookPayload(type, payload) {
    switch (type) {
        case WEBHOOK_TYPES.CHAT_MESSAGE:
            return {
                messageId: payload.message_id,
                broadcaster: {
                    isAnonymous: payload.broadcaster.is_anonymous,
                    userId: payload.broadcaster.user_id,
                    username: payload.broadcaster.username,
                    isVerified: payload.broadcaster.is_verified,
                    profilePicture: payload.broadcaster.profile_picture,
                    channelSlug: payload.broadcaster.channel_slug
                },
                sender: {
                    isAnonymous: payload.sender.is_anonymous,
                    userId: payload.sender.user_id,
                    username: payload.sender.username,
                    isVerified: payload.sender.is_verified,
                    profilePicture: payload.sender.profile_picture,
                    channelSlug: payload.sender.channel_slug
                },
                content: payload.content,
                emotes: Array.isArray(payload.emotes) ? payload.emotes.map(emote => ({
                    emoteId: emote.emote_id,
                    positions: emote.positions
                })) : null
            };

        case WEBHOOK_TYPES.CHANNEL_FOLLOWED:
            return {
                broadcaster: {
                    isAnonymous: payload.broadcaster.is_anonymous,
                    userId: payload.broadcaster.user_id,
                    username: payload.broadcaster.username,
                    isVerified: payload.broadcaster.is_verified,
                    profilePicture: payload.broadcaster.profile_picture,
                    channelSlug: payload.broadcaster.channel_slug
                },
                follower: {
                    isAnonymous: payload.follower.is_anonymous,
                    userId: payload.follower.user_id,
                    username: payload.follower.username,
                    isVerified: payload.follower.is_verified,
                    profilePicture: payload.follower.profile_picture,
                    channelSlug: payload.follower.channel_slug
                }
            };

        case WEBHOOK_TYPES.SUBSCRIPTION_RENEWAL:
        case WEBHOOK_TYPES.SUBSCRIPTION_NEW:
            return {
                broadcaster: {
                    isAnonymous: payload.broadcaster.is_anonymous,
                    userId: payload.broadcaster.user_id,
                    username: payload.broadcaster.username,
                    isVerified: payload.broadcaster.is_verified,
                    profilePicture: payload.broadcaster.profile_picture,
                    channelSlug: payload.broadcaster.channel_slug
                },
                subscriber: {
                    isAnonymous: payload.subscriber.is_anonymous,
                    userId: payload.subscriber.user_id,
                    username: payload.subscriber.username,
                    isVerified: payload.subscriber.is_verified,
                    profilePicture: payload.subscriber.profile_picture,
                    channelSlug: payload.subscriber.channel_slug
                },
                duration: payload.duration,
                createdAt: new Date(payload.created_at)
            };

        case WEBHOOK_TYPES.SUBSCRIPTION_GIFTS:
            return {
                broadcaster: {
                    isAnonymous: payload.broadcaster.is_anonymous,
                    userId: payload.broadcaster.user_id,
                    username: payload.broadcaster.username,
                    isVerified: payload.broadcaster.is_verified,
                    profilePicture: payload.broadcaster.profile_picture,
                    channelSlug: payload.broadcaster.channel_slug
                },
                gifter: payload.gifter.is_anonymous ? {
                    isAnonymous: true
                } : {
                    isAnonymous: false,
                    userId: payload.gifter.user_id,
                    username: payload.gifter.username,
                    isVerified: payload.gifter.is_verified,
                    profilePicture: payload.gifter.profile_picture,
                    channelSlug: payload.gifter.channel_slug
                },
                giftees: payload.giftees.map(giftee => ({
                    isAnonymous: giftee.is_anonymous,
                    userId: giftee.user_id,
                    username: giftee.username,
                    isVerified: giftee.is_verified,
                    profilePicture: giftee.profile_picture,
                    channelSlug: giftee.channel_slug
                })),
                createdAt: new Date(payload.created_at)
            };

        default:
            return payload;
    }
}

module.exports = {
    WEBHOOK_TYPES,
    parseWebhookPayload
};
