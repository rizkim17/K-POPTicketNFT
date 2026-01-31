const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
    // Connect to Ganache
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Deterministic Private Key (Account 0 from ganache -d)
    // 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
    const privateKey = "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d";
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log("Deploying with account:", wallet.address);

    // Read Artifact
    const artifactPath = path.resolve(__dirname, 'frontend', 'src', 'artifacts', 'KPopNFT.json');
    if (!fs.existsSync(artifactPath)) {
        throw new Error("Artifact not found. Run compile_manual.js first.");
    }
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

    // Deploy
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    const contract = await factory.deploy();

    console.log("Deploy transaction sent. Waiting for confirmation...");
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log("KPopNFT deployed to:", address);

    // Save Address
    const addressDir = path.resolve(__dirname, 'frontend', 'src', 'contracts');
    if (!fs.existsSync(addressDir)) fs.mkdirSync(addressDir, { recursive: true });

    fs.writeFileSync(
        path.resolve(addressDir, 'contract-address.json'),
        JSON.stringify({ KPopNFT: address }, null, 2)
    );
}

main().catch(console.error);
