// Function to send data to webhook server
async function fetchserver() {
    try {
        fetch('https://webhook-js.onrender.com/webhook',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event: alleventsArray.map(event => ({
                        name: event,
                        version: 1
                    }))
                })
            }
        )
    } catch (error) {
        console.error('Error al enviar datos al servidor:', error);
    }
}

// Uncomment to enable periodic calls to the server
// setInterval(fetchserver, 4000);
// setTimeout(fetchserver, 1000);