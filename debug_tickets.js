// Debug script untuk memeriksa tiket user
const ethers = require('ethers');
const fs = require('fs');

async function debugTickets() {
    const alchemyRpcUrl = 'https://eth-sepolia.g.alchemy.com/v2/_V_VFOECqXR6D2sy7p2_H';
    const contractAddress = '0xbd218175D47FF5426cEec4F559894837590B5646';

    // Load ABI
    const artifact = JSON.parse(fs.readFileSync('./frontend/src/artifacts/KPopNFT.json', 'utf8'));
    const abi = artifact.abi;

    // Connect
    const provider = new ethers.JsonRpcProvider(alchemyRpcUrl);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    console.log("🔍 Debugging K-Pop NFT Tickets\n");
    console.log("Contract Address:", contractAddress);

    // Get TicketMinted event signature
    const ticketMintedEvent = contract.interface.getEvent('TicketMinted');
    const ticketMintedTopic = ethers.id('TicketMinted(uint256,address,uint256)');
    console.log("\n📋 TicketMinted Event Topic:", ticketMintedTopic);

    // Query all TicketMinted events
    console.log("\n🎫 Querying all TicketMinted events...");
    const filter = contract.filters.TicketMinted();
    const events = await contract.queryFilter(filter, 0, 'latest');

    console.log(`\n✅ Found ${events.length} TicketMinted events:\n`);

    for (const event of events) {
        const tokenId = event.args[0];
        const buyer = event.args[1];
        const concertId = event.args[2];

        console.log("---");
        console.log("  Token ID:", tokenId.toString());
        console.log("  Buyer:", buyer);
        console.log("  Concert ID:", concertId.toString());
        console.log("  Transaction:", event.transactionHash);
        console.log("  Block:", event.blockNumber);

        // Get ticket details
        try {
            const ticketDetail = await contract.ticketDetails(tokenId);
            console.log("  Seat Number:", ticketDetail.seatNumber);

            // Get current owner
            const owner = await contract.ownerOf(tokenId);
            console.log("  Current Owner:", owner);
        } catch (e) {
            console.log("  Error getting details:", e.message);
        }
    }

    // Also check specific transaction
    console.log("\n\n📄 Checking specific transaction: 0xe354a71fb52e7a7392c92b2db5dbbcf7c5016d30a56f8503d7fab64c490c7852");
    const receipt = await provider.getTransactionReceipt("0xe354a71fb52e7a7392c92b2db5dbbcf7c5016d30a56f8503d7fab64c490c7852");

    if (receipt) {
        console.log("  Status:", receipt.status === 1 ? "SUCCESS ✅" : "FAILED ❌");
        console.log("  Block:", receipt.blockNumber);
        console.log("  From:", receipt.from);
        console.log("  To:", receipt.to);
        console.log("  Logs:", receipt.logs.length);

        // Parse logs
        for (const log of receipt.logs) {
            try {
                const parsed = contract.interface.parseLog({
                    topics: log.topics,
                    data: log.data
                });
                console.log("\n  📢 Event:", parsed.name);
                console.log("     Args:", parsed.args.toString());
            } catch (e) {
                // Not a contract event
            }
        }
    } else {
        console.log("  Transaction not found or pending");
    }
}

debugTickets().catch(console.error);
