import { Meta } from '@/layouts/Meta';
import { MintingPage } from '@/templates/MintingPage';


import { AppConfig } from '@/utils/AppConfig';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import Link from 'next/link';
import { useAccount, useNetwork } from 'wagmi';
import Tooltip from '@/components/Tooltip';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { ethers } from 'ethers';
import { useState } from 'react';

type Project = {
  wallet: string
  contractAddress: string
  projectName: string
  projectSlug: string
  projectSymbol: string
  projectDescription: string
  projectFee: string
  projectSize: string
  projectSettingPrimarySale: string
  projectSettingSecondarySale: string
  projectSettingStakingRewards: string
  projectSettingPenalty: string
  projectSettingDaysPenalty: string
  artworkURL: string
}


const Index = ({
  project,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [modalEarningCalculatorIsOpen, setModalEarningCalculatorIsOpen] = useState<boolean>(false);
  const { chain: activeChain } = useNetwork();
  const { address: wallet, isConnected } = useAccount();

  const totalStakedRaw = 0;
  const totalAmountWithRewards = 0;
  const burnedTokens = 0;
  const withdrawPenaltyPercentage = 5_00;
  const withdrawPenaltyTimeDays = 365;
  const mintRoyaltyFee = 7_00;
  const coinSymbol = "XDCX";

  
  return (
    <MintingPage
      meta={
        <Meta
          title={`${project.projectname} - NFNFT`}
          description={project.projectdescription}
        />
      }
    >
      <div>
        <div className="w-full overflow-hidden flex justify-center relative z-30 min-h-screen bg-gray-800">
          
          <div className="flex flex-col justify-center items-center relative">
            
          <div className="w-full max-w-3xl mx-10 my-6">
            <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-2 justify-center mt-6 pr-2">
                <div className="w-full">
                  <div className="p-3 rounded-lg bg-slate-200 flex flex-col justify-center h-full relative">
                    <span className="text-[11px] text-uppercase letter-spacing-3 text-truncate text-gray-900 mr-2">
                      MONEY STAKED GLOBAL
                    </span>
                    <span className="text-black text-[14px] text-truncate attribute-value py-1.5">
                      {ethers.utils.formatEther(totalStakedRaw?.toString?.())} {coinSymbol}
                    </span>
                  </div>
                </div>
                <div className="w-full">
                  <div className="p-3 rounded-lg bg-slate-200 flex flex-col justify-center h-full relative">
                    <span className="text-[11px] text-uppercase letter-spacing-3 text-truncate text-gray-900 mr-2">
                      BALANCE (INC. REWARDS)
                    </span>
                    <span className="text-black text-[14px] text-truncate attribute-value py-1.5">
                    {ethers.utils.formatEther(totalAmountWithRewards?.toString?.())} {coinSymbol}
                    </span>
                  </div>
                </div>
                <div className="w-full">
                  <div className="p-3 rounded-lg bg-slate-200 flex flex-col justify-center h-full relative">
                    <span className="text-[11px] text-uppercase letter-spacing-3 text-truncate text-gray-900 mr-2">
                      TOKENS BURNED
                    </span>
                    <span className="text-black text-[14px] text-truncate attribute-value py-1.5">
                    {burnedTokens??0} NFTs Burned
                    </span>
                  </div>
                </div>
                <div className="w-full">
                  <div className="p-3 rounded-lg bg-slate-200 flex flex-col justify-center h-full relative">
                    <span className="text-[11px] text-uppercase letter-spacing-3 text-truncate text-gray-900 mr-2">
                      PENALTY PERCENTAGE %
                    </span>
                    <span className="text-black text-[14px] text-truncate attribute-value py-1.5">
                      {withdrawPenaltyPercentage?(withdrawPenaltyPercentage/100):0} %
                    </span>
                  </div>
                </div>
                <div className="w-full">
                  <div className="p-3 rounded-lg bg-slate-200 flex flex-col justify-center h-full relative">
                    <span className="text-[11px] text-uppercase letter-spacing-3 text-truncate text-gray-900 mr-2">
                      WITHDRAW PENALTY TIME
                    </span>
                    <span className="text-black text-[14px] text-truncate attribute-value py-1.5">
                      {withdrawPenaltyTimeDays} Days
                    </span>
                  </div>
                </div>
                <div className="w-full">
                  <div className="p-3 rounded-lg bg-slate-200 flex flex-col justify-center h-full relative">
                    <span className="text-[11px] text-uppercase letter-spacing-3 text-truncate text-gray-900 mr-2">
                      MINT ROYALTY %
                    </span>
                    <span className="text-black text-[14px] text-truncate attribute-value py-1.5">
                    {mintRoyaltyFee?Number(mintRoyaltyFee)/100:0} %
                    </span>
                  </div>
                </div>


              </div>
              <div className="flex w-full mt-4 justify-center text-left font-base text-sm">
                <button
                  onClick={() => setModalEarningCalculatorIsOpen(true)}
                  className="gap-2 text-xl flex bg-black text-white p-2 rounded-xl items-center">
                    <svg fill="#FFFFFF" className="h-6 w-6" height="800px" width="800px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 460 460">
                      <g id="XMLID_241_">
                        <g>
                          <path d="M369.635,0H90.365C73.595,0,60,13.595,60,30.365v399.27C60,446.405,73.595,460,90.365,460h279.27
                            c16.77,0,30.365-13.595,30.365-30.365V30.365C400,13.595,386.405,0,369.635,0z M108.204,343.61v-43.196
                            c0-3.451,2.797-6.248,6.248-6.248h43.196c3.451,0,6.248,2.797,6.248,6.248v43.196c0,3.451-2.797,6.248-6.248,6.248h-43.196
                            C111.001,349.858,108.204,347.06,108.204,343.61z M108.204,256.61v-43.196c0-3.451,2.797-6.248,6.248-6.248h43.196
                            c3.451,0,6.248,2.797,6.248,6.248v43.196c0,3.451-2.797,6.248-6.248,6.248h-43.196C111.001,262.858,108.204,260.06,108.204,256.61
                            z M308.891,421H151.109c-11.046,0-20-8.954-20-20c0-11.046,8.954-20,20-20h157.782c11.046,0,20,8.954,20,20
                            C328.891,412.046,319.937,421,308.891,421z M208.402,294.165h43.196c3.451,0,6.248,2.797,6.248,6.248v43.196
                            c0,3.451-2.797,6.248-6.248,6.248h-43.196c-3.451,0-6.248-2.797-6.248-6.248v-43.196
                            C202.154,296.963,204.951,294.165,208.402,294.165z M202.154,256.61v-43.196c0-3.451,2.797-6.248,6.248-6.248h43.196
                            c3.451,0,6.248,2.797,6.248,6.248v43.196c0,3.451-2.797,6.248-6.248,6.248h-43.196C204.951,262.858,202.154,260.06,202.154,256.61
                            z M345.548,349.858h-43.196c-3.451,0-6.248-2.797-6.248-6.248v-43.196c0-3.451,2.797-6.248,6.248-6.248h43.196
                            c3.451,0,6.248,2.797,6.248,6.248v43.196h0C351.796,347.061,348.999,349.858,345.548,349.858z M345.548,262.858h-43.196
                            c-3.451,0-6.248-2.797-6.248-6.248v-43.196c0-3.451,2.797-6.248,6.248-6.248h43.196c3.451,0,6.248,2.797,6.248,6.248v43.196h0
                            C351.796,260.061,348.999,262.858,345.548,262.858z M354,149.637c0,11.799-9.565,21.363-21.363,21.363H127.364
                            C115.565,171,106,161.435,106,149.637V62.363C106,50.565,115.565,41,127.364,41h205.273C344.435,41,354,50.565,354,62.363V149.637
                            z"/>
                        </g>
                      </g>
                    </svg>
                    APY Calculator
                </button>
              </div>
            </div>
            
            
            <div className="w-full h-full flex flex-col justify-center items-center z-15">
              <span className="square-image">
                <Image width={300} height={300} alt={project.projectname} className="rounded-xl mt-10" src={project.artworkurl} />
              </span>

              <span className="text-white text-center mt-6 text-6xl font-bold uppercase flex-grow">
                {project.projectname}
              </span>

              <div className="flex flex-col justify-center items-center my-12 w-full">
                {isConnected ? (
                    <div className="w-full cursor-pointer text-center text-3xl bg-blue-600 p-2 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.1)] font-bold text-white px-4 flex items-center justify-center"
                      onClick={() => {
                        
                      }}
                    >
                      Mint
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
                                width: '100%',
                                pointerEvents: 'none',
                                userSelect: 'none',
                              },
                            })}
                            className="w-full"
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
          </div>
          
          
        </div>
        
        
        
      </div>
    </MintingPage>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { slug } = context.params;
  console.log("slug", slug)
  const res = await fetch(
    `http://localhost:3000/api/get-project-by-slug/`,
    {
      body: JSON.stringify({slug: slug}),
      method: 'POST'
    }
  );
  const project = await res.json()
  console.log("project", project)

  return {
    props: {
      project: project?.project?.rows?.[0],
    },
  }
}

export async function getStaticPaths() {
  return {
    paths: [
    ],
    fallback: "blocking"
  };
}

export default Index;
