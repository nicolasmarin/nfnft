# nfNFT contracts

Refer to the **README** on the parent folder for general information about the project.

`ContractsFactory` requires `NFERC721` to be compiled, while `NFERC721` can be compiled independently.

To compile, you can use hardhat, or just C&P into Remix and press compile. Despite the pragma being set to ^0.8.20, the target of the compiler must be set depending on the target EVM.

At the time of writing this README, except for Ethereum, which allows evmVersion being "shanghai", most should choose "paris" to avoid issues with op-codes not being recognized.

