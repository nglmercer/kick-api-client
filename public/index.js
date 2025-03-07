// Supongamos que tu backend tiene un endpoint que devuelve el token
const backendUrl = 'https://id.kick.com/oauth/token';

fetch(backendUrl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: '01JNCXQG2JYCC8B7JW09QWE8BC',
        client_secret: '445e7a6136aea58ebe258660eabce8848104d0f2ec26873c19013b0e0bdc8a71',
        redirect_uri: 'http://localhost:3002/webhook',
    }),
})
.then(response => response.json())
.then(data => {
    console.log('Access Token:', data.access_token);
})
.catch(error => {
    console.error('Error fetching access token:', error);
});