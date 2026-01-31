const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const KPopNFT = await hre.ethers.getContractFactory("KPopNFT");
    const kPopNFT = await KPopNFT.deploy();

    await kPopNFT.waitForDeployment();

    const address = await kPopNFT.getAddress();

    console.log("KPopNFT deployed to:", address);

    // Save the contract address to a file for the frontend to use
    const addressDir = path.join(__dirname, "..", "frontend", "src", "contracts");
    if (!fs.existsSync(addressDir)) {
        fs.mkdirSync(addressDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(addressDir, "contract-address.json"),
        JSON.stringify({ KPopNFT: address }, undefined, 2)
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
