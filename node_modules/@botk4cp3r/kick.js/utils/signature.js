const crypto = require('crypto');

class SignatureVerifier {
    constructor(publicKey) {
        this.publicKey = publicKey;
    }

    createSignaturePayload(messageId, timestamp, body) {
        return `${messageId}.${timestamp}.${body}`;
    }

    verify(messageId, timestamp, body, signature) {
        const payload = this.createSignaturePayload(messageId, timestamp, body);
        const verifier = crypto.createVerify('RSA-SHA256');
        verifier.update(payload);
        
        try {
            const signatureBuffer = Buffer.from(signature, 'base64');
            return verifier.verify(this.publicKey, signatureBuffer);
        } catch (error) {
            return false;
        }
    }
}

module.exports = { SignatureVerifier };
