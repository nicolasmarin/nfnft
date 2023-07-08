import { Meta } from '@/layouts/Meta';
import { Main } from '@/templates/Main';

import { AppConfig } from '@/utils/AppConfig';
import Image from 'next/image';
import { ChangeEvent, useState } from 'react';
import { useAccount } from 'wagmi';

import { ConnectButton } from '@rainbow-me/rainbowkit';

const Index = () => {
  const [tabActive, setTabActive] = useState<string>("Stake");
  const [stakeAmount, setStakeAmount] = useState<number>(0);
  const [unstakeAmount, setUnstakeAmount] = useState<number>(0);

  const { isConnected } = useAccount();

  return (
    <Main
      meta={
        <Meta
          title={AppConfig.title}
          description={AppConfig.description}
        />
      }
    >
      <div className="min-h-screen text-4xl pt-10">
        <div className="relative rounded-lg border px-2 md:px-10 border-gray-300 bg-white shadow-sm md:space-x-3 hover:shadow-lg transition duration-150">
          <div className="flex items-center justify-center text-3xl font-bold py-5 text-black">
            <div className="w-10 h-10 inline-flex flex-shrink-0 text-current mr-2">
              <Image src={"/assets/images/XDC.png"} width={40} height={40} alt="XDC" />
            </div>
            <div>
              <div className="text-xl font-bold">XDC</div>
              <div className="text-sm font-normal">Stake XDC and use XDCX while earning staking rewards.</div>
            </div>
          </div>
        </div>

        <div className="relative rounded-lg border mt-10 px-2 md:px-10 border-gray-300 bg-white shadow-sm md:space-x-3 hover:shadow-lg transition duration-150">
          <div className="flex gap-3 flex-wrap md:flex-nowrap items-center justify-center py-5 text-black text-center">
            <div className="w-full md:w-1/3 text-gray-800">
              <div className="font-bold text-xl">
                TLV
              </div>
              <div className="text-sm">
                1,839,657 XDC
              </div>
            </div>
            <div className="w-full md:w-1/3 text-gray-800 md:border-r md:border-l md:border-gray-500">
              <div className="font-bold text-xl">
                APY
              </div>
              <div className="text-sm">
                7%
              </div>
            </div>
            <div className="w-full md:w-1/3 text-gray-800">
              <div className="font-bold text-xl">
                XDC/XDCX Exchange Rate
              </div>
              <div className="text-sm">
                1.05040
              </div>
            </div>
          </div>
        </div>

        <div className="relative rounded-lg border mt-10 px-2 md:px-10 border-gray-300 bg-white shadow-sm md:space-x-3">
          <div className="flex gap-3 flex-wrap md:flex-nowrap items-center justify-center py-5 text-black text-center border-b border-gray-500 mb-10">
            <div className="w-full md:w-1/2 text-gray-800">
              <div
                className={`${tabActive === "Stake" ? 'font-bold' : 'cursor-pointer'} text-xl`}
                onClick={() => { setTabActive("Stake"); }}
              >
                Stake
              </div>
            </div>
            <div className="w-full md:w-1/2 text-gray-800 md:border-l md:border-gray-500">
              <div
                className={`${tabActive === "Stake" ? 'cursor-pointer' : 'font-bold'} text-xl`}
                onClick={() => { setTabActive("Unstake"); }}
              >
                Unstake
              </div>
            </div>
          </div>
          {tabActive === "Stake" ? (
            <div className="pb-10">
              <div className="flex justify-between text-sm font-normal pb-10">
                <div className="">
                  My XDC : -
                </div>
                <div className="text-right">
                  My XDCX : -
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 inset-y-0 flex items-center pl-3 opacity-8">
                  <Image src={"/assets/images/XDC.png"} width={40} height={40} alt="XDC" />
                </div>
                <input 
                  type="number" step="any" name="minting-fee" placeholder="0.1" min="0" max="999999999999999999999999999999" className="w-full p-2 pl-16 bg-white border border-slate-300 rounded-md shadow-md placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500     disabled:text-gray-500"
                  value={stakeAmount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setStakeAmount(parseFloat(e?.target?.value));
                  }}
                />
              </div>

              <div className="flex justify-between text-base font-normal pt-10">
                <div className="flex gap-3">
                  You will get: <svg viewBox="0 0 24 24" width="24px" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 16H13V18H11V16ZM12.61 6.04C10.55 5.74 8.73 7.01 8.18 8.83C8 9.41 8.44 10 9.05 10H9.25C9.66 10 9.99 9.71 10.13 9.33C10.45 8.44 11.4 7.83 12.43 8.05C13.38 8.25 14.08 9.18 14 10.15C13.9 11.49 12.38 11.78 11.55 13.03C11.55 13.04 11.54 13.04 11.54 13.05C11.53 13.07 11.52 13.08 11.51 13.1C11.42 13.25 11.33 13.42 11.26 13.6C11.25 13.63 11.23 13.65 11.22 13.68C11.21 13.7 11.21 13.72 11.2 13.75C11.08 14.09 11 14.5 11 15H13C13 14.58 13.11 14.23 13.28 13.93C13.3 13.9 13.31 13.87 13.33 13.84C13.41 13.7 13.51 13.57 13.61 13.45C13.62 13.44 13.63 13.42 13.64 13.41C13.74 13.29 13.85 13.18 13.97 13.07C14.93 12.16 16.23 11.42 15.96 9.51C15.72 7.77 14.35 6.3 12.61 6.04Z"></path>
                  </svg>
                  0 XDCX
                </div>
              </div>
                
              <div className="w-full pt-10">
                {isConnected ? (
                  <div className="w-full cursor-pointer text-center text-3xl bg-blue-600 p-2 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.1)] font-bold text-white px-4 flex items-center justify-center">
                    Stake
                  </div>
                ) : (
                  <ConnectButton.Custom>
                          {({
                            account,
                            chain,
                            openChainModal,
                            openConnectModal,
                            authenticationStatus,
                            mounted,
                          }) => {
                            // Note: If your app doesn't use authentication, you
                            // can remove all 'authenticationStatus' checks
                            const ready = mounted && authenticationStatus !== 'loading';
                            const connected =
                              ready &&
                              account &&
                              chain &&
                              (!authenticationStatus ||
                                authenticationStatus === 'authenticated');

                            return (
                              <div
                                {...(!ready && {
                                  'aria-hidden': true,
                                  'style': {
                                    opacity: 0,
                                    pointerEvents: 'none',
                                    userSelect: 'none',
                                  },
                                })}
                              >
                                {(() => {
                                  if (!connected) {
                                    return (
                                      <button onClick={openConnectModal} type="button" className="w-full text-center text-3xl bg-blue-600 p-2 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.1)] font-bold text-white px-4 flex items-center justify-center">
                                        Connect Wallet
                                      </button>
                                    );
                                  }

                                  if (chain.unsupported) {
                                    return (
                                      <button onClick={openChainModal} type="button" className="bg-red-500 p-2 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.1)] text-base font-bold text-white px-4 flex items-center">
                                        Wrong network
                                        <svg className="ml-1.5" fill="none" height="7" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M12.75 1.54001L8.51647 5.0038C7.77974 5.60658 6.72026 5.60658 5.98352 5.0038L1.75 1.54001" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path></svg>
                                      </button>
                                    );
                                  }

                                  return (
                                    <div style={{ display: 'flex', gap: 12 }}>
                                      <button
                                        onClick={openChainModal}
                                        style={{ display: 'flex', alignItems: 'center' }}
                                        type="button"
                                        className="p-2 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.1)] text-base font-bold text-gray-800 px-4 flex items-center"
                                      >
                                        {chain.hasIcon && (
                                          <div
                                            style={{
                                              background: chain.iconBackground,
                                              width: 12,
                                              height: 12,
                                              borderRadius: 999,
                                              overflow: 'hidden',
                                              marginRight: 4,
                                            }}
                                          >
                                            {chain.iconUrl && (
                                              <Image
                                                alt={chain.name ?? 'Chain icon'}
                                                src={chain.iconUrl}
                                                width={12}
                                                height={12}
                                                style={{ width: 12, height: 12 }}
                                              />
                                            )}
                                          </div>
                                        )}
                                        {chain.name}
                                        <svg className="ml-1.5" fill="none" height="7" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M12.75 1.54001L8.51647 5.0038C7.77974 5.60658 6.72026 5.60658 5.98352 5.0038L1.75 1.54001" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path></svg>
                                      </button>
                                    </div>
                                  );
                                })()}
                              </div>
                            );
                          }}
                        </ConnectButton.Custom>
                )}
                </div>
            </div>
          ) : (
            <div className="pb-10">
              <div className="flex justify-between text-sm font-normal pb-10">
                <div className="">
                Available Balance: - XDCX
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 inset-y-0 flex items-center pl-3 opacity-8">
                  <svg viewBox="0 0 24 24" width="40px" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 16H13V18H11V16ZM12.61 6.04C10.55 5.74 8.73 7.01 8.18 8.83C8 9.41 8.44 10 9.05 10H9.25C9.66 10 9.99 9.71 10.13 9.33C10.45 8.44 11.4 7.83 12.43 8.05C13.38 8.25 14.08 9.18 14 10.15C13.9 11.49 12.38 11.78 11.55 13.03C11.55 13.04 11.54 13.04 11.54 13.05C11.53 13.07 11.52 13.08 11.51 13.1C11.42 13.25 11.33 13.42 11.26 13.6C11.25 13.63 11.23 13.65 11.22 13.68C11.21 13.7 11.21 13.72 11.2 13.75C11.08 14.09 11 14.5 11 15H13C13 14.58 13.11 14.23 13.28 13.93C13.3 13.9 13.31 13.87 13.33 13.84C13.41 13.7 13.51 13.57 13.61 13.45C13.62 13.44 13.63 13.42 13.64 13.41C13.74 13.29 13.85 13.18 13.97 13.07C14.93 12.16 16.23 11.42 15.96 9.51C15.72 7.77 14.35 6.3 12.61 6.04Z"></path>
                  </svg>
                </div>
                <input 
                  type="number" step="any" name="minting-fee" placeholder="0.1" min="0" max="999999999999999999999999999999" className="w-full p-2 pl-16 bg-white border border-slate-300 rounded-md shadow-md placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500     disabled:text-gray-500"
                  value={unstakeAmount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setUnstakeAmount(parseFloat(e?.target?.value));
                  }}
                />
              </div>
              <div className="flex justify-between text-base font-normal pt-10">
                <div className="flex gap-3">
                  You will get: <Image src={"/assets/images/XDC.png"} width={24} height={24} alt="XDC" /> -
                </div>
                <div className="text-right">
                  Penalty : -
                </div>
              </div>

              <div className="w-full pt-10">
                {isConnected ? (
                  <div className="w-full cursor-pointer text-center text-3xl bg-blue-600 p-2 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.1)] font-bold text-white px-4 flex items-center justify-center">
                    Unstake
                  </div>
                ) : (
                  <ConnectButton.Custom>
                          {({
                            account,
                            chain,
                            openChainModal,
                            openConnectModal,
                            authenticationStatus,
                            mounted,
                          }) => {
                            // Note: If your app doesn't use authentication, you
                            // can remove all 'authenticationStatus' checks
                            const ready = mounted && authenticationStatus !== 'loading';
                            const connected =
                              ready &&
                              account &&
                              chain &&
                              (!authenticationStatus ||
                                authenticationStatus === 'authenticated');

                            return (
                              <div
                                {...(!ready && {
                                  'aria-hidden': true,
                                  'style': {
                                    opacity: 0,
                                    pointerEvents: 'none',
                                    userSelect: 'none',
                                  },
                                })}
                              >
                                {(() => {
                                  if (!connected) {
                                    return (
                                      <button onClick={openConnectModal} type="button" className="w-full text-center text-3xl bg-blue-600 p-2 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.1)] font-bold text-white px-4 flex items-center justify-center">
                                        Connect Wallet
                                      </button>
                                    );
                                  }

                                  if (chain.unsupported) {
                                    return (
                                      <button onClick={openChainModal} type="button" className="bg-red-500 p-2 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.1)] text-base font-bold text-white px-4 flex items-center">
                                        Wrong network
                                        <svg className="ml-1.5" fill="none" height="7" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M12.75 1.54001L8.51647 5.0038C7.77974 5.60658 6.72026 5.60658 5.98352 5.0038L1.75 1.54001" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path></svg>
                                      </button>
                                    );
                                  }

                                  return (
                                    <div style={{ display: 'flex', gap: 12 }}>
                                      <button
                                        onClick={openChainModal}
                                        style={{ display: 'flex', alignItems: 'center' }}
                                        type="button"
                                        className="p-2 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.1)] text-base font-bold text-gray-800 px-4 flex items-center"
                                      >
                                        {chain.hasIcon && (
                                          <div
                                            style={{
                                              background: chain.iconBackground,
                                              width: 12,
                                              height: 12,
                                              borderRadius: 999,
                                              overflow: 'hidden',
                                              marginRight: 4,
                                            }}
                                          >
                                            {chain.iconUrl && (
                                              <Image
                                                alt={chain.name ?? 'Chain icon'}
                                                src={chain.iconUrl}
                                                width={12}
                                                height={12}
                                                style={{ width: 12, height: 12 }}
                                              />
                                            )}
                                          </div>
                                        )}
                                        {chain.name}
                                        <svg className="ml-1.5" fill="none" height="7" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M12.75 1.54001L8.51647 5.0038C7.77974 5.60658 6.72026 5.60658 5.98352 5.0038L1.75 1.54001" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path></svg>
                                      </button>
                                    </div>
                                  );
                                })()}
                              </div>
                            );
                          }}
                        </ConnectButton.Custom>
                )}
                </div>
            </div>
          )}
          
        </div>
      </div>
    </Main>
  );
};

export default Index;
