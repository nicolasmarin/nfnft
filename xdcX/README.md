# xdcX

```shell
npx hardhat compile
npx hardhat clean
```

## Deploying

To deploy contracts, run:

```bash
npx hardhat deployTokenHubMock --network <network>

npx hardhat deployXdcXProxy <admin> --network <network>
npx hardhat upgradeXdcXProxy <proxyAddress> --network <network>
npx hardhat deployXdcXImpl --network <network>

npx hardhat deployStakeManagerProxy <xdcX> <admin> <manager> <tokenHub> <bcDepositWallet> <bot> --network <network>
npx hardhat upgradeStakeManagerProxy <proxyAddress> --network <network>
npx hardhat deployStakeManagerImpl --network <network>
```

## Integration

Smart contract integration guide is at [link](INTEGRATION.md)
