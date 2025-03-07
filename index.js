//const { KickClient } = require('@botk4cp3r/kick.js');
import { KickClient } from '@botk4cp3r/kick.js';
// Create client instance
const defaultToken = "MWIZNJBHY2MTNMQ0ZS0ZOGE1LTHMNZYTYZU2N2EWZJRHMJZI";
function createclient(TOKEN="MWIZNJBHY2MTNMQ0ZS0ZOGE1LTHMNZYTYZU2N2EWZJRHMJZI") {

}
const client = new KickClient({
    token: defaultToken,
    webhookPort: 3002,
    webhookPath: '/webhook',
    webhookBaseUrl: 'http://localhost:3002'
});
const commands = {
    '!help': 'Available commands: !help, !ping',
    '!ping': 'Pong! 🏓',
    "!streamtitle": "!streamtitle <title>",
};
// Start webhook server and subscribe to events
async function init() {
    let result = null;
    try {
    const startwebhook = await client.startWebhookServer();
    
    // Subscribe to all available events
    const subscription = await client.subscribeToEvents([
        'chat.message.sent',
        'channel.followed',
        'channel.subscription.new',
        'channel.subscription.renewal',
        'channel.subscription.gifts'
    ]);
    
    result = { startwebhook, subscription };
    initializeEvents(client);
    console.log('Bot is ready!', result);
    }   catch (error) {
        console.error('Error starting webhook server:', error);
        result = error;
    }
    return result;
}

// Listen for events

async function modifytittle(title="dev in stream test!"){
    try {
        await client.updateChannel({
            streamTitle: title
        });
        console.log('Channel title updated successfully!');
        const channel = await client.getChannels(['123', '456', '789']);
        // Search all categories
        const allCategories = await client.searchCategories();

        console.log("channel", channel);
        console.log("allCategories", allCategories);
    } catch (error) {
        console.error('Error updating channel title:', error);
    }
}
init();
//works categoryId
function initializeEvents(client) {
    client.on('chatMessage', async (message) => {
        const command = message.content.toLowerCase();
        console.log("raw message", message);
        if (commands[command]) {
            await client.sendChatMessage({
                content: commands[command],
                type: 'bot'
            });
        }
    });
    
    
    client.on('channelFollowed', data => {
        console.log(`New follower: ${data.follower.username}!`);
    });
    
    client.on('subscriptionNew', data => {
        console.log(`New sub: ${data.subscriber.username}!`);
    });
    client.on('subscriptionRenewal', async (data) => {
        await client.sendChatMessage({
            content: `Thanks for resubbing, ${data.subscriber.username}! 💜`,
            type: 'bot'
        });
    });
    
    client.on('subscriptionGifts', async (data) => {
        await client.sendChatMessage({
            content: `Thanks ${data.gifter.username} for gifting ${data.giftees.length} subs! 🎁`,
            type: 'bot'
        });
    });
    client.on('error', error => {
        console.error('Subscription error:', error);
    });
}
async function sendMessage(message) {
    try {
        await client.sendChatMessage({
            content: message,
        });
    } catch (error) {
            console.error('Unknown error:', error.message);
    }
}
// crear un string corto aleatorio
const randomString = () => {
    return Math.random().toString(36).substring(2, 15);
};
setTimeout( async () => {
    modifytittle(randomString());
}, 1000);
setTimeout( async () => {
    await sendMessage("!streamtitle");
}, 2000);
//export { createclient}