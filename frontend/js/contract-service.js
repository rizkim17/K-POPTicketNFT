const ContractService = {
    // Configuration
    contractAddressUrl: 'src/contracts/contract-address.json',
    contractArtifactUrl: 'src/artifacts/KPopNFT.json',
    // Alchemy RPC for consistent read operations
    alchemyRpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/_V_VFOECqXR6D2sy7p2_H',
    // Sepolia Chain ID
    SEPOLIA_CHAIN_ID: '0xaa36a7', // 11155111 in hex

    // State
    contract: null,
    readOnlyContract: null, // For read operations (uses Alchemy directly)
    provider: null,
    readOnlyProvider: null,
    signer: null,

    // Switch to Sepolia Network
    async switchToSepolia() {
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

        if (currentChainId !== this.SEPOLIA_CHAIN_ID) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: this.SEPOLIA_CHAIN_ID }],
                });
            } catch (switchError) {
                // If Sepolia is not added to MetaMask, add it
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: this.SEPOLIA_CHAIN_ID,
                            chainName: 'Sepolia Testnet',
                            nativeCurrency: {
                                name: 'Sepolia ETH',
                                symbol: 'ETH',
                                decimals: 18
                            },
                            rpcUrls: ['https://eth-sepolia.g.alchemy.com/v2/demo'],
                            blockExplorerUrls: ['https://sepolia.etherscan.io']
                        }],
                    });
                } else {
                    throw new Error("Gagal switch ke Sepolia network. Silakan switch manual di MetaMask.");
                }
            }
            return true; // Switched
        }
        return false; // Already on Sepolia
    },

    // Initialize Connection
    async init() {
        if (!window.ethereum) {
            alert("Please install MetaMask!");
            return false;
        }

        try {
            // Check and switch to Sepolia first
            await this.switchToSepolia();

            // 1. Get Contract Address & ABI
            const [addressRes, artifactRes] = await Promise.all([
                fetch(this.contractAddressUrl),
                fetch(this.contractArtifactUrl)
            ]);

            const addressData = await addressRes.json();
            const artifactData = await artifactRes.json();

            this.contractAddress = addressData.KPopNFT;
            this.contractABI = artifactData.abi;

            // 2. Setup Read-Only Provider (Alchemy - always works)
            this.readOnlyProvider = new ethers.JsonRpcProvider(this.alchemyRpcUrl);
            this.readOnlyContract = new ethers.Contract(
                this.contractAddress,
                this.contractABI,
                this.readOnlyProvider
            );

            // 3. Setup MetaMask Provider (for write operations)
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.signer = await this.provider.getSigner();

            // 4. Create Contract Instance with Signer (for write operations)
            this.contract = new ethers.Contract(
                this.contractAddress,
                this.contractABI,
                this.signer
            );

            console.log("Contract Service Initialized on Sepolia", this.contractAddress);
            return true;

        } catch (error) {
            console.error("Contract Service Init Error:", error);
            return false;
        }
    },

    // --- Admin Functions ---

    async createConcert(name, artist, venue, date, imageUrl, priceEth, supply) {
        if (!this.contract) await this.init();

        try {
            const priceWei = ethers.parseEther(priceEth.toString());

            const tx = await this.contract.createConcert(
                name,
                artist,
                venue,
                date,
                imageUrl,
                priceWei,
                supply
            );

            console.log("Transaction Sent:", tx.hash);
            const receipt = await tx.wait();
            console.log("Transaction Confirmed:", receipt);
            return receipt;

        } catch (error) {
            console.error("Create Concert Error:", error);
            throw error;
        }
    },

    // --- Public Functions ---

    async getAllConcerts() {
        if (!this.readOnlyContract) await this.init();

        try {
            // Use readOnlyContract for reading (uses Alchemy RPC)
            const concerts = await this.readOnlyContract.getAllConcerts();
            // Format data for easier use
            return concerts.map(c => ({
                id: c.id.toString(),
                name: c.name,
                artist: c.artist,
                venue: c.venue,
                date: c.date,
                imageUrl: c.imageUrl,
                price: ethers.formatEther(c.ticketPrice),
                maxSupply: c.maxSupply.toString(),
                currentMinted: c.currentMinted.toString(),
                isActive: c.isActive
            }));
        } catch (error) {
            console.error("Get All Concerts Error:", error);
            return [];
        }
    },

    async mintTicket(concertId, priceEth, seatNumber = "General") {
        if (!this.contract) await this.init();

        try {
            const priceWei = ethers.parseEther(priceEth.toString());
            // Using a placeholder Metadata URI for now
            const tokenURI = "https://example.com/metadata.json";

            const tx = await this.contract.mintTicket(
                await this.signer.getAddress(),
                tokenURI,
                concertId,
                seatNumber,
                { value: priceWei }
            );

            console.log("Mint Transaction Sent:", tx.hash);
            const receipt = await tx.wait();
            return receipt;
        } catch (error) {
            console.error("Minting Error:", error);
            throw error;
        }
    },

    async getMyTickets() {
        if (!this.contract) await this.init();

        try {
            const userAddress = await this.signer.getAddress();
            console.log("🔍 Fetching tickets for:", userAddress);

            const tickets = [];

            // Direct token enumeration approach
            // Since we can't reliably query events on Alchemy free tier,
            // we check ownership of tokens directly (tokens start at 1)
            console.log("📋 Checking token ownership directly...");

            let consecutiveNotFound = 0;
            const MAX_TOKENS_TO_CHECK = 200; // Reasonable limit
            const MAX_CONSECUTIVE_NOT_FOUND = 20; // Stop after 20 non-existent tokens

            for (let tokenId = 1; tokenId <= MAX_TOKENS_TO_CHECK; tokenId++) {
                try {
                    // Check if this token exists and who owns it
                    const owner = await this.readOnlyContract.ownerOf(tokenId);
                    consecutiveNotFound = 0; // Reset counter since token exists

                    // Check if user owns this token
                    if (owner.toLowerCase() === userAddress.toLowerCase()) {
                        console.log(`✅ Token #${tokenId} owned by user`);

                        // Get ticket details
                        const ticketDetail = await this.readOnlyContract.ticketDetails(tokenId);
                        const concertId = ticketDetail.concertId;

                        // Get concert info
                        const concert = await this.readOnlyContract.getConcert(concertId);

                        tickets.push({
                            tokenId: tokenId.toString(),
                            concertName: concert.name,
                            concertDate: concert.date,
                            concertVenue: concert.venue,
                            concertImage: concert.imageUrl,
                            seatNumber: ticketDetail.seatNumber
                        });
                    }
                } catch (e) {
                    // Token doesn't exist (ownerOf reverts for non-existent tokens)
                    consecutiveNotFound++;

                    // If we've found some tokens but now hit many non-existent ones, stop
                    if (consecutiveNotFound >= MAX_CONSECUTIVE_NOT_FOUND) {
                        console.log(`⏹️ Stopping search after ${MAX_CONSECUTIVE_NOT_FOUND} consecutive non-existent tokens`);
                        break;
                    }
                }
            }

            console.log("✅ Total tickets for user:", tickets.length);
            return tickets;
        } catch (error) {
            console.error("Get My Tickets Error:", error);
            return [];
        }
    }
};

// Export to window
window.ContractService = ContractService;
