async function getPublicKey() {
    try {
        const response = await fetch('https://api.kick.com/public/v1/public-key', {
            headers: {
                'Authorization': `Bearer ${defaultToken}`
            },
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Public Key:', data.data.public_key);
    } catch (error) {
        console.error('Error al obtener la clave pública:', error);
    }
}

getPublicKey();