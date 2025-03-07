const express = require('express');

class WebhookServer {
    constructor(client, options = {}) {
        this.client = client;
        this.port = options.port || 3000;
        this.path = options.path || '/webhook';
        this.app = express();
        this.server = null;
    }

    setup() {
        this.app.use(express.raw({ type: 'application/json' }));
        
        this.app.post(this.path, async (req, res) => {
            try {
                const result = await this.client.handleWebhookRequest(req.headers, req.body);
                res.json({ success: true, event: result.eventType });
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }

    start() {
        return new Promise((resolve, reject) => {
            try {
                this.setup();
                this.server = this.app.listen(this.port, () => {
                    this.client.emit('webhookServerStarted', {
                        port: this.port,
                        path: this.path
                    });
                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    stop() {
        return new Promise((resolve, reject) => {
            if (this.server) {
                this.server.close((err) => {
                    if (err) reject(err);
                    else {
                        this.client.emit('webhookServerStopped');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }
}

module.exports = { WebhookServer };
