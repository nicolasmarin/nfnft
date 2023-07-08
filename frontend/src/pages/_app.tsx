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


const gnosisChiadoCustom = {
  ...gnosisChiado,
  iconUrl: 'https://avatars.githubusercontent.com/u/92709226?s=280&v=4',
  iconBackground: '#fff',
};

const scrollTestnetCustom = {
  ...scrollTestnet,
  iconUrl: 'https://camo.githubusercontent.com/280fe40be879abe061985bf1add4c68f536e451b53d0db68d5f31d716edd74c3/687474703a2f2f692e696d6775722e636f6d2f486179674179502e706e67',
  iconBackground: '#fff',
};

export const chains = [xdcCustom, xdcTestnetCustom, gnosisChiadoCustom, scrollTestnetCustom];

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
