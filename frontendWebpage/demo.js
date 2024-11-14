// Get form and message elements
const form = document.getElementById('crypto-form');
const messageDiv = document.getElementById('message');

// Add event listener to the form
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get input values
    const cryptoId = document.getElementById('cryptoId').value.trim();
    const userEmail = document.getElementById('userEmail').value.trim();

    // Clear previous message
    messageDiv.textContent = '';

    // Create request payload
    const data = {
        cryptoId: cryptoId,
        userEmail: userEmail
    };

    try {
        // Send POST request to the API
        const response = await fetch('https://m1hg6wz0n4.execute-api.ap-southeast-2.amazonaws.com/demo_prod/send-price-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (response.ok) {
            messageDiv.style.color = 'green';
            messageDiv.textContent = 'Jun has sent you a email successfully!';
        } else {
            messageDiv.style.color = 'red';
            messageDiv.textContent = result.message || 'An error occurred. I am soooorry!';
        }
    } catch (error) {
        console.error('Error:', error);
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Failed to send request.';
    }
});

const historyForm = document.getElementById('history-form');
const historyDiv = document.getElementById('history');

historyForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const historyEmail = document.getElementById('historyEmail').value.trim();

    historyDiv.innerHTML = '';

    try {
        const response = await fetch(`https://m1hg6wz0n4.execute-api.ap-southeast-2.amazonaws.com/demo_prod/get-search-history?userEmail=${encodeURIComponent(historyEmail)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();

        if (response.ok) {
            // Check if search history existed
            if (result.searchHistory && result.searchHistory.length > 0) {
                const list = document.createElement('ul');
                result.searchHistory.forEach(item => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `Crypto: ${item.cryptoId}, Time: ${new Date(item.timestamp).toLocaleString()}`;
                    list.appendChild(listItem);
                });
                historyDiv.appendChild(list);
            } else {
                historyDiv.textContent = 'No search history found.';
            }
        } else {
            historyDiv.textContent = result.message || 'An error occurred while fetching history.';
        }
    } catch (error) {
        console.error('Error:', error);
        historyDiv.textContent = 'Failed to fetch search history.';
    }
});
