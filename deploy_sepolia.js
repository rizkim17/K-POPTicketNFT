require('dotenv').config();
const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("=== K-Pop NFT Sepolia Deployment ===\n");

    // Load environment variables
    const sepoliaUrl = process.env.SEPOLIA_URL;
    const privateKey = process.env.PRIVATE_KEY;

    if (!sepoliaUrl) {
        throw new Error("SEPOLIA_URL not found in .env file!");
    }
    if (!privateKey) {
        throw new Error("PRIVATE_KEY not found in .env file!");
    }

    console.log("✓ Environment variables loaded");
    console.log("  RPC URL:", sepoliaUrl.substring(0, 40) + "...");

    // Connect to Sepolia
    const provider = new ethers.JsonRpcProvider(sepoliaUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log("✓ Connected to Sepolia");
    console.log("  Deployer:", wallet.address);

    // Check balance
    const balance = await provider.getBalance(wallet.address);
    const balanceEth = ethers.formatEther(balance);
    console.log("  Balance:", balanceEth, "ETH");

    if (parseFloat(balanceEth) < 0.001) {
        throw new Error("Insufficient balance! Please get Sepolia ETH from faucet.");
    }

    // Read Artifact
    const artifactPath = path.resolve(__dirname, 'frontend', 'src', 'artifacts', 'KPopNFT.json');
    if (!fs.existsSync(artifactPath)) {
        throw new Error("Artifact not found at: " + artifactPath + "\nRun 'npx hardhat compile' first.");
    }
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    console.log("✓ Contract artifact loaded");

    // Deploy
    console.log("\n🚀 Deploying KPopNFT to Sepolia...");
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    const contract = await factory.deploy();

    console.log("  Transaction sent:", contract.deploymentTransaction().hash);
    console.log("  Waiting for confirmation...");

    await contract.waitForDeployment();
    const address = await contract.getAddress();

    console.log("\n✅ SUCCESS!");
    console.log("  Contract Address:", address);
    console.log("  Etherscan: https://sepolia.etherscan.io/address/" + address);

    // Save Address
    const addressDir = path.resolve(__dirname, 'frontend', 'src', 'contracts');
    if (!fs.existsSync(addressDir)) fs.mkdirSync(addressDir, { recursive: true });

    fs.writeFileSync(
        path.resolve(addressDir, 'contract-address.json'),
        JSON.stringify({ KPopNFT: address }, null, 2)
    );
    console.log("\n✓ Contract address saved to frontend/src/contracts/contract-address.json");
    console.log("\n🎉 Deployment Complete! Refresh your frontend.");
}

main().catch((error) => {
    console.error("\n❌ ERROR:", error.message || error);
    process.exit(1);
});
