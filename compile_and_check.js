const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log("=== Manual Solidity Compile ===\n");

try {
    // Run Hardhat compile and capture output
    console.log("Running Hardhat compile...");

    // Set NODE_OPTIONS to avoid ESM issues
    process.env.NODE_OPTIONS = '--no-warnings';

    const result = execSync('npx hardhat compile', {
        cwd: __dirname,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 120000
    });

    console.log(result);

} catch (error) {
    console.log("Hardhat output:", error.stdout || "");
    console.log("Hardhat stderr:", error.stderr || "");
}

// Check if artifact exists
const artifactPath = path.join(__dirname, 'frontend', 'src', 'artifacts', 'KPopNFT.json');

if (fs.existsSync(artifactPath)) {
    console.log("\n✓ Artifact found at:", artifactPath);

    // Check for new functions
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf-8'));
    const functions = artifact.abi
        .filter(x => x.type === 'function')
        .map(x => x.name);

    console.log("Functions:", functions.join(', '));

    if (functions.includes('updateConcert')) {
        console.log("\n✓ Edit functions found in ABI!");
    } else {
        console.log("\n✗ Edit functions NOT in ABI - need recompile");
    }
} else {
    console.log("\n✗ Artifact not found!");

    // Try to copy from hardhat default artifacts location
    const defaultArtifact = path.join(__dirname, 'artifacts', 'contracts', 'KPopNFT.sol', 'KPopNFT.json');

    if (fs.existsSync(defaultArtifact)) {
        console.log("Found artifact at default location, copying...");

        const destDir = path.dirname(artifactPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        fs.copyFileSync(defaultArtifact, artifactPath);
        console.log("✓ Copied to frontend/src/artifacts/");
    }
}
