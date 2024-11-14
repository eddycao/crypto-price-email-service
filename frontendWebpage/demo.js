// Existing code for sending email
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
            messageDiv.textContent = 'Jun has sent you an email successfully!';
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

// Existing code for viewing search history
// Get elements for the history form and display area
const historyForm = document.getElementById('history-form');
const historyDiv = document.getElementById('history');


// Add event listener to the history form
historyForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get the email input value
    const historyEmail = document.getElementById('historyEmail').value.trim();

    // Clear previous history
    historyDiv.innerHTML = '';

    try {
        // Send GET request to the API
        const response = await fetch(`https://m1hg6wz0n4.execute-api.ap-southeast-2.amazonaws.com/demo_prod/get-search-history?userEmail=${encodeURIComponent(historyEmail)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();

        if (response.ok) {
            // Check if search history exists
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

const coinListDiv = document.getElementById('coin-list');
const coinSearchInput = document.getElementById('coin-search');
const prompt = document.getElementById('prompt-message');
let coins = [];

// Function to fetch coins list from CoinGecko API
async function fetchCoins() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/list');
        coins = await response.json();
        displayCoins(coins);
    } catch (error) {
        console.error('Error fetching coins:', error);
        coinListDiv.textContent = 'Failed to load coins list.';
    }
}

function displayCoins(coinArray) {
    coinListDiv.innerHTML = '';
    const list = document.createElement('ul');
    coinArray.forEach(coin => {
        const listItem = document.createElement('li');
        listItem.textContent = `${coin.name} (${coin.symbol})`;
        listItem.dataset.id = coin.id;
        listItem.addEventListener('click', () => {
            document.getElementById('cryptoId').value = listItem.dataset.id;
            prompt.innerHTML = `Populated the <strong>${coin.name}</strong> to serching field!`
        });
        list.appendChild(listItem);
    });
    coinListDiv.appendChild(list);
}

coinSearchInput.addEventListener('input', () => {
    const searchTerm = coinSearchInput.value.trim().toLowerCase();
    const filteredCoins = coins.filter(coin =>
        coin.name.toLowerCase().includes(searchTerm) ||
        coin.symbol.toLowerCase().includes(searchTerm)
    );
    displayCoins(filteredCoins);
});

fetchCoins();
