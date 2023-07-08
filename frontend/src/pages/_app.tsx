import '../styles/global.css';

import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import {
  xdc,
  gnosis,
  scrollTestnet,
} from 'wagmi/chains';
import { AppConfig } from '@/utils/AppConfig';

import { publicProvider } from 'wagmi/providers/public';

const xdcCustom = {
                    ...xdc,
                    rpcUrls: {
                      public: { http: ['https://erpc.xinfin.network'] },
                      default: { http: ['https://erpc.xinfin.network'] },
                    },
                    blockExplorers: {
                      etherscan: { name: 'XDC BlocksScan', url: 'https://explorer.xinfin.network' },
                      default: { name: 'XDC BlocksScan', url: 'https://explorer.xinfin.network' },
                    },
                  };

export const chains = [xdcCustom, gnosis, scrollTestnet];

const { connectors } = getDefaultWallets({
  appName: AppConfig.title,
  chains
});


const { provider, webSocketProvider } =
configureChains(
  chains,
  [
    publicProvider(),
  ]
)

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

import type { AppProps } from 'next/app';

const MyApp = ({ Component, pageProps }: AppProps) => (
  <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider chains={chains}>
      <Component {...pageProps} />
    </RainbowKitProvider>
  </WagmiConfig>
);

export default MyApp;
