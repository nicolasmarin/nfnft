import { Meta } from '@/layouts/Meta';
import { Main } from '@/templates/Main';

import { AppConfig } from '@/utils/AppConfig';
import Image from 'next/image';
import { ChangeEvent, useState } from 'react';
import { erc20ABI, useAccount, useBalance, useContractRead, useContractReads, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import StakeManagerABI from '../constants/StakeManager';
import { ethers } from 'ethers';
import config from 'next/config';

const Index = () => {
  const [tabActive, setTabActive] = useState<string>("Stake");
  const [stakeAmount, setStakeAmount] = useState<number>(0);
  const [unstakeAmount, setUnstakeAmount] = useState<number>(0);

  const { isConnected, address } = useAccount();

  const stakeManagerAddress = '0x3D095075299308E14FAbA70D4A8f4542d3a23A62';

  const stakeManagerContract = {
    address: stakeManagerAddress,
    abi: StakeManagerABI,
  }; 

  const xdcxContractAddress = '0x69c32592AFF808A59ABcB8DD1add825b8a035FAC';

  const xdcxContract = {
    address: xdcxContractAddress,
    abi: erc20ABI,
  }; 

  const { data: balanceData } = useBalance({
    address: address
  });


  const { data: pooledData, isSuccess: isBalanceOfSuccess } = useContractReads({
    contracts: [
       {
        ...stakeManagerContract,
        functionName: 'getTotalPooledXdc', // Devuelve uint256
       },
       {
        ...stakeManagerContract,
        functionName: 'convertXdcToXdcX', // Devuelve uint256
        args: [ethers.utils.parseEther("1")],
       },
       {
        ...xdcxContract,
        functionName: 'balanceOf', // Devuelve uint256
        args: [address],
       },
       {
        ...stakeManagerContract,
        functionName: 'convertXdcToXdcX', // Devuelve uint256
        args: [ethers.utils.parseEther(stakeAmount?stakeAmount.toString?.():'0')],
       },
       {
        ...stakeManagerContract,
        functionName: 'convertXdcXToXdc', // Devuelve uint256
        args: [ethers.utils.parseEther(unstakeAmount?unstakeAmount.toString?.():'0')],
       },
    ],
      // args,
      watch: true,
      enabled: true,
    });


  const valueToStake = ethers.utils.parseEther(stakeAmount?stakeAmount.toString?.():'0');

  const {
    config: depositConfig,
    error: depositPrepareError,
    isError: depositIsPrepareError,
  } = usePrepareContractWrite({
    ...stakeManagerContract,
    functionName: 'deposit',
    overrides: {
      value: valueToStake,
    },
  });

  const { data: depositData, error: depositWriteError, isError: depositIsError, write: depositWrite } = useContractWrite(depositConfig);
 
  const { depositIsLoading, depositIsSuccess } = useWaitForTransaction({
    hash: depositData?.hash,
    onSuccess: () => {
      console.log("Success");
      setStakeAmount(0);
    }
  })


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
                TVL
              </div>
              <div className="text-sm">
                {pooledData?.[0]?ethers.utils.formatEther(pooledData[0]) + " XDC":"loading... "}
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
                {pooledData && pooledData[1] ? ethers.utils.formatEther(pooledData[1]) + " XDCX":"loading... "}
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
                  My XDC : {balanceData ? balanceData.formatted + " XDC" : "loading... "}
                </div>
                <div className="text-right">
                  My XDCX : {pooledData && pooledData[2] ? ethers.utils.formatEther(pooledData[2]) : "loading... "}
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
                  You will get: <Image src={"/assets/images/XDCX.png"} width={24} height={24} alt="XDCX" />
                  {pooledData && pooledData[3] ? ethers.utils.formatEther(pooledData[3]) + " XDCX" : "loading... "}
                </div>
              </div>
                
              <div className="w-full pt-10">
                {isConnected ? (
                  <div className="w-full cursor-pointer text-center text-3xl bg-blue-600 p-2 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.1)] font-bold text-white px-4 flex items-center justify-center"
                    onClick={() => {
                      if (depositWrite) depositWrite?.();
                    }}
                  >
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
                Available Balance: {pooledData && pooledData[2] ? ethers.utils.formatEther(pooledData[2]) : "loading... "}
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 inset-y-0 flex items-center pl-3 opacity-8">
                  <Image src={"/assets/images/XDCX.png"} width={40} height={40} alt="XDCX" />
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
                  You will get: <Image src={"/assets/images/XDC.png"} width={24} height={24} alt="XDC" />
                  {pooledData && pooledData[4] ? ethers.utils.formatEther(pooledData[4]) + " XDC" : "loading... "}

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
