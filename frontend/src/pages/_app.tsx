import '../styles/global.css';

import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import {
  xdc,
  scrollTestnet,
  xdcTestnet,
  gnosisChiado,
} from 'wagmi/chains';
import { AppConfig } from '@/utils/AppConfig';

import { publicProvider } from 'wagmi/providers/public';

const xdcCustom = {
  ...xdc,
  name: 'XDC chain',
  iconUrl: 'https://xdcx-zeta.vercel.app/assets/images/XDC.png',
  iconBackground: '#fff',
  rpcUrls: {
    public: { http: ['https://erpc.xinfin.network'] },
    default: { http: ['https://erpc.xinfin.network'] },
  },
  blockExplorers: {
    etherscan: { name: 'XDC BlocksScan', url: 'https://explorer.xinfin.network' },
    default: { name: 'XDC BlocksScan', url: 'https://explorer.xinfin.network' },
  },
  contracts: {
    multicall3: {
        address: "0xA564A3afac61dAde6E860E532e1Ca8924b1be87E",
    },
  },
};


const xdcTestnetCustom = {
  ...xdcTestnet,
  name: 'XDC Apothem testnet',
  iconUrl: 'https://raw.githubusercontent.com/pro100skm/xdc-token-list/master/xdc-logo-test.png',
  iconBackground: '#fff',
  rpcUrls: {
    public: { http: ['https://erpc.apothem.network'] },
    default: { http: ['https://erpc.apothem.network'] },
  },
  blockExplorers: {
    etherscan: { name: 'XDC BlocksScan', url: 'https://explorer.xinfin.network' },
    default: { name: 'XDC BlocksScan', url: 'https://explorer.xinfin.network' },
  },
  contracts: {
    multicall3: {
        address: "0xeDf2b192b92982A86f8F6612ef2CEf4277a4Ba72",
    },
  },
};

const chainId: Number = process.env.NEXT_PUBLIC_PLATFORM_CHAINID ? parseInt(process.env.NEXT_PUBLIC_PLATFORM_CHAINID) : 1;

export const chains = [];

if (chainId === 50 || chainId === 51) {
  chains.push(xdcCustom);
  chains.push(xdcTestnetCustom);
} else if (chainId === gnosisChiado.id) {
  chains.push(gnosisChiado);
} else if (chainId === scrollTestnet.id) {
  chains.push(scrollTestnet);
}

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
