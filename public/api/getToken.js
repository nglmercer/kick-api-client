async function getToken() {
    try {
        const response = await fetch('/api/token', {
            headers: {
                'Authorization': `Bearer ${defaultToken}`
            },
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Token:', data.data.token);
    } catch (error) {
        console.error('Error al obtener el token:', error);
    }
}
getToken();