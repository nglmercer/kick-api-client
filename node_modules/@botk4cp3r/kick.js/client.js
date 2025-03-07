const { EventEmitter } = require('events');
const { CategoriesService } = require('./services/categories');
const { UsersService } = require('./services/users');
const { ChannelsService } = require('./services/channels');
const { ChatService } = require('./services/chat');
const { PublicKeyService } = require('./services/publicKey');
const { EventsService } = require('./services/events');
const { WebhookHandler } = require('./webhooks/handler');
const { WebhookServer } = require('./webhooks/server');

class KickClient extends EventEmitter {
    constructor(options = {}) {
        super();
        this.options = {
            webhookPort: options.webhookPort || 3000,
            webhookPath: options.webhookPath || '/webhook',
            webhookBaseUrl: options.webhookBaseUrl || 'http://localhost',
            ...options
        };
        this.categories = new CategoriesService(this);
        this.users = new UsersService(this);
        this.channels = new ChannelsService(this);
        this.chat = new ChatService(this);
        this.publicKey = new PublicKeyService(this);
        this.events = new EventsService(this);
        this.webhookHandler = new WebhookHandler(this);
        this.webhookServer = new WebhookServer(this, {
            port: this.options.webhookPort,
            path: this.options.webhookPath
        });
        this.token = options.token || '';
    }

    async searchCategories(query = '') {
        return await this.categories.getCategories(query, this.token);
    }

    async getCategory(categoryId) {
        return await this.categories.getCategory(categoryId, this.token);
    }

    async introspectToken() {
        if (!this.token) throw new Error('No token provided');
        return await this.users.introspectToken(this.token);
    }

    async getUsers(userIds = []) {
        return await this.users.getUsers(userIds, this.token);
    }

    async getChannels(broadcasterIds = []) {
        return await this.channels.getChannels(broadcasterIds, this.token);
    }

    async updateChannel(options) {
        if (!this.token) throw new Error('No token provided');
        return await this.channels.updateChannel(options, this.token);
    }

    async sendChatMessage(options) {
        if (!this.token) throw new Error('No token provided');
        return await this.chat.sendMessage({
            ...options,
            token: this.token
        });
    }

    async getPublicKey() {
        return await this.publicKey.getPublicKey();
    }

    async validateWebhook(headers, body) {
        await this.events.initializeVerifier();
        return this.events.validateWebhook(headers, body);
    }

    async getEventSubscriptions() {
        if (!this.token) throw new Error('No token provided');
        return await this.events.getSubscriptions(this.token);
    }

    async subscribeToEvents(events, method = 'webhook') {
        if (!this.token) throw new Error('No token provided');
        return await this.events.subscribe(events, method, this.token);
    }

    async unsubscribeFromEvents(subscriptionIds) {
        if (!this.token) throw new Error('No token provided');
        return await this.events.unsubscribe(subscriptionIds, this.token);
    }

    async startWebhookServer() {
        return await this.webhookServer.start();
    }

    async stopWebhookServer() {
        return await this.webhookServer.stop();
    }

    async handleWebhookRequest(headers, rawBody) {
        return await this.webhookHandler.handleWebhook(headers, rawBody);
    }
}

module.exports = { KickClient };
