require('dotenv').config();
const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

async function createEvent() {
    console.log("=== Create Event on Sepolia ===\n");

    // Load config
    const sepoliaUrl = process.env.SEPOLIA_URL;
    const privateKey = process.env.PRIVATE_KEY;

    // Connect
    const provider = new ethers.JsonRpcProvider(sepoliaUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log("✓ Connected with wallet:", wallet.address);

    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log("✓ Balance:", ethers.formatEther(balance), "ETH");

    // Load contract
    const addressPath = path.resolve(__dirname, 'frontend', 'src', 'contracts', 'contract-address.json');
    const artifactPath = path.resolve(__dirname, 'frontend', 'src', 'artifacts', 'KPopNFT.json');

    const { KPopNFT: contractAddress } = JSON.parse(fs.readFileSync(addressPath));
    const { abi } = JSON.parse(fs.readFileSync(artifactPath));

    const contract = new ethers.Contract(contractAddress, abi, wallet);

    console.log("✓ Contract loaded:", contractAddress);

    // Check owner
    const owner = await contract.owner();
    console.log("✓ Contract owner:", owner);

    // Event details
    const eventData = {
        name: "2026 BABYMONSTER 1ST WORLD TOUR HELLO MONSTERS",
        artist: "BABYMONSTER",
        venue: "SEOUL",
        date: "2026-02-28",
        imageUrl: "https://lh3.googleusercontent.com/a/example",
        priceEth: "0.005",
        supply: 500
    };

    console.log("\n📋 Event Details:");
    console.log("   Name:", eventData.name);
    console.log("   Artist:", eventData.artist);
    console.log("   Venue:", eventData.venue);
    console.log("   Date:", eventData.date);
    console.log("   Price:", eventData.priceEth, "ETH");
    console.log("   Supply:", eventData.supply, "tickets");

    console.log("\n🚀 Creating event on blockchain...");

    try {
        const priceWei = ethers.parseEther(eventData.priceEth);

        const tx = await contract.createConcert(
            eventData.name,
            eventData.artist,
            eventData.venue,
            eventData.date,
            eventData.imageUrl,
            priceWei,
            eventData.supply
        );

        console.log("   Transaction sent:", tx.hash);
        console.log("   Waiting for confirmation...");

        const receipt = await tx.wait();

        console.log("\n✅ SUCCESS! Event created on blockchain!");
        console.log("   Block:", receipt.blockNumber);
        console.log("   Gas used:", receipt.gasUsed.toString());
        console.log("   Etherscan: https://sepolia.etherscan.io/tx/" + tx.hash);

        // Get concert count
        const concertCount = await contract.concertCount();
        console.log("\n📊 Total concerts now:", concertCount.toString());

    } catch (error) {
        console.error("\n❌ ERROR:", error.message);
        if (error.reason) console.error("   Reason:", error.reason);
    }
}

createEvent().catch(console.error);
