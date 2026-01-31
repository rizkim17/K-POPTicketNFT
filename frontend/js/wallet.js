// Basic Wallet Integration for Sepolia / Localhost

const SEPOLIA_ID = '0xaa36a7'; // Sepolia Chain ID
const LOCALHOST_ID = '0x539'; // 1337 in hex (Ganache default)
const TARGET_CHAIN_ID = LOCALHOST_ID; // Change to SEPOLIA_ID for testnet

async function loadContractData() {
    try {
        const responseAddress = await fetch('../src/contracts/contract-address.json');
        const addressData = await responseAddress.json();

        const responseArtifact = await fetch('../src/artifacts/KPopNFT.json');
        const artifactData = await responseArtifact.json();

        return { address: addressData.KPopNFT, abi: artifactData.abi };
    } catch (error) {
        console.error("Could not load contract data:", error);
        return null;
    }
}

async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            console.log("Connected:", account);

            // Allow access to other pages or update UI
            localStorage.setItem('connectedAccount', account);

            // Redirect to Marketplace after login if on index page
            if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
                window.location.href = 'marketplace.html';
            } else {
                updateUI(account);
            }

            return account;
        } catch (error) {
            console.error("User denied account access", error);
            alert("Connection Failed: " + error.message);
        }
    } else {
        alert("MetaMask is not installed!");
        window.open('https://metamask.io/download.html', '_blank');
    }
}

function updateUI(account) {
    const btn = document.getElementById('connectWalletBtn');
    if (btn) {
        btn.innerHTML = `<span class="material-symbols-outlined">account_balance_wallet</span> <span>${account.substring(0, 6)}...${account.substring(38)}</span>`;
        btn.classList.replace('bg-primary', 'bg-green-500');
    }
}

// Check if already connected
window.addEventListener('load', async () => {
    if (localStorage.getItem('connectedAccount')) {
        const account = localStorage.getItem('connectedAccount');
        updateUI(account);
    }

    // Add Event Listener
    const btn = document.getElementById('connectWalletBtn');
    if (btn) {
        btn.addEventListener('click', connectWallet);
    }
});
