# xdcX

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat run scripts/deploy.ts
TS_NODE_FILES=true npx ts-node scripts/deploy.ts
npx eslint '**/*.{js,ts}'
npx eslint '**/*.{js,ts}' --fix
npx prettier '**/*.{json,sol,md}' --check
npx prettier '**/*.{json,sol,md}' --write
npx solhint 'contracts/**/*.sol'
npx solhint 'contracts/**/*.sol' --fix
```

## Deploying

To deploy contracts, run:

```bash
npx hardhat deployXdcXProxy <admin> --network <network>
npx hardhat upgradeXdcXProxy <proxyAddress> --network <network>
npx hardhat deployXdcXImpl --network <network>

npx hardhat deployStakeManagerProxy <xdcX> <admin> <manager> <tokenHub> <bcDepositWallet> <bot> --network <network>
npx hardhat upgradeStakeManagerProxy <proxyAddress> --network <network>
npx hardhat deployStakeManagerImpl --network <network>

npx hardhat deployReferralContract <admin> <trustedForwarder> --network <network>
npx hardhat upgradeReferralContract <proxyAddress> --network <network>
```

## Verifying on scan

```bash
npx hardhat verify <address> <...args> --network <network>
```

## Integration

Smart contract integration guide is at [link](INTEGRATION.md)
