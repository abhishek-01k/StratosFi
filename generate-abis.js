#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Contract files to extract ABIs from
const contracts = [
  'TWAPEngine',
  'OptionsProtocol', 
  'ConcentratedLiquidityHook',
  'VolatilityOracle',
  'AdvancedStrategyRouter'
];

// Source and destination directories
const outDir = './out';
const frontendAbiDir = './frontend/lib/contracts/abis';

console.log('🔄 Regenerating ABIs from compiled contracts...\n');

// Check if out directory exists
if (!fs.existsSync(outDir)) {
  console.error('❌ Error: ./out directory not found. Run "forge build" first.');
  process.exit(1);
}

// Create the destination directory if it doesn't exist
if (!fs.existsSync(frontendAbiDir)) {
  fs.mkdirSync(frontendAbiDir, { recursive: true });
}

let successCount = 0;

// Process each contract
contracts.forEach(contractName => {
  try {
    // Read the compiled contract JSON
    const jsonFilePath = path.join(outDir, `${contractName}.sol`, `${contractName}.json`);
    
    if (!fs.existsSync(jsonFilePath)) {
      console.log(`⚠️  Compiled contract not found: ${jsonFilePath}`);
      return;
    }
    
    const contractJson = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    
    // Extract the ABI
    const abi = contractJson.abi;
    
    if (!abi || abi.length === 0) {
      console.log(`⚠️  No ABI found for ${contractName}`);
      return;
    }
    
    // Create TypeScript ABI file
    const tsContent = `// Auto-generated ABI for ${contractName}
// Generated on: ${new Date().toISOString()}
// DO NOT EDIT MANUALLY - Use "npm run generate-abis" to regenerate

export const ${contractName}ABI = ${JSON.stringify(abi, null, 2)} as const;
`;
    
    // Write the TypeScript file
    const outputPath = path.join(frontendAbiDir, `${contractName}.ts`);
    fs.writeFileSync(outputPath, tsContent);
    
    console.log(`✅ ${contractName}`);
    console.log(`   Functions: ${abi.filter(item => item.type === 'function').length}`);
    console.log(`   Events: ${abi.filter(item => item.type === 'event').length}`);
    console.log('');
    
    successCount++;
    
  } catch (error) {
    console.error(`❌ Error processing ${contractName}:`, error.message);
  }
});

// Create an index file that exports all ABIs
const indexContent = `// Auto-generated ABI index file
// Generated on: ${new Date().toISOString()}
// DO NOT EDIT MANUALLY - Use "npm run generate-abis" to regenerate

${contracts.map(name => `import { ${name}ABI } from './${name}';`).join('\n')}

// Export individual ABIs
export { ${contracts.map(name => `${name}ABI`).join(', ')} };

// Re-export all ABIs as a single object for convenience
export const ABIS = {
${contracts.map(name => `  ${name}: ${name}ABI,`).join('\n')}
} as const;

// Type helper for getting ABI types
export type ContractName = keyof typeof ABIS;
`;

fs.writeFileSync(path.join(frontendAbiDir, 'index.ts'), indexContent);

console.log(`🎉 ABI generation complete!`);
console.log(`✅ Generated ${successCount}/${contracts.length} contract ABIs`);
console.log(`📁 Files saved to: ${frontendAbiDir}\n`);

if (successCount < contracts.length) {
  console.log('⚠️  Some contracts were not processed. Make sure all contracts are compiled with "forge build"');
  process.exit(1);
} 