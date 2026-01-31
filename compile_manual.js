const fs = require('fs');
const path = require('path');
const solc = require('solc');

const contractPath = path.resolve(__dirname, 'contracts', 'KPopNFT.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
    language: 'Solidity',
    sources: {
        'KPopNFT.sol': {
            content: source,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*'],
            },
        },
    },
};

function findImports(importPath) {
    try {
        const nodeModulesPath = path.resolve(__dirname, 'node_modules', importPath);
        if (fs.existsSync(nodeModulesPath)) {
            return { contents: fs.readFileSync(nodeModulesPath, 'utf8') };
        }
        return { error: 'File not found' };
    } catch (e) {
        return { error: e.message };
    }
}

console.log('Compiling KPopNFT.sol...');
const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

if (output.errors) {
    output.errors.forEach((err) => {
        console.error(err.formattedMessage);
    });
    // Check if errors are fatal
    const hasError = output.errors.some(err => err.severity === 'error');
    if (hasError) process.exit(1);
}

const contract = output.contracts['KPopNFT.sol']['KPopNFT'];
const artifact = {
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object,
};

const artifactDir = path.resolve(__dirname, 'frontend', 'src', 'artifacts');
if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

fs.writeFileSync(
    path.resolve(artifactDir, 'KPopNFT.json'),
    JSON.stringify(artifact, null, 2)
);

console.log('Compilation successful! Artifact saved to frontend/src/artifacts/KPopNFT.json');
