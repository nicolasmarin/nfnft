import { Meta } from '@/layouts/Meta';
import { MintingPage } from '@/templates/MintingPage';


import { AppConfig } from '@/utils/AppConfig';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import Link from 'next/link';
import { erc721ABI, useAccount, useContractEvent, useContractReads, useContractWrite, useNetwork, usePrepareContractWrite, useProvider, useWaitForTransaction } from 'wagmi';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { BigNumber, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import EarningCalculator from '@/components/EarningCalculator';
import Modal from 'react-modal';
import NFERC721 from '@/constants/NFERC721';

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

export type TokensOwned = {
  owner: `0x${string}` | undefined;
  tokens: {
    id: BigNumber;
    // block: bigint;
  }[];
};


const Index = ({
  project,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [modalEarningCalculatorIsOpen, setModalEarningCalculatorIsOpen] = useState<boolean>(false);
  const [mintInvest, setMintInvest] = useState<number>(0);
  const [tokensOwned, setTokensOwned] = useState<TokensOwned>();

  console.log("tokensOwned", tokensOwned)

  const { chain: activeChain } = useNetwork();
  const { address: wallet, isConnected } = useAccount();
  const provider = useProvider();

  const contractCommon = {
    address: project.contractaddress,
    abi: NFERC721,
    chainId: activeChain?.id,
  }

  const { data: contractReadsData, refetch: contractReadsRefetch } = useContractReads({
    contracts: [
      {
        ...contractCommon,
        functionName: 'mintPrice', // Devuelve uint256
      },
      {
        ...contractCommon,
        functionName: 'totalPendingToWithdraw', // Devuelve uint256
        args: [wallet??ethers.constants.AddressZero],
      },
      {
        ...contractCommon,
        functionName: 'collectionSize', // Devuelve uint256
      },
      {
        ...contractCommon,
        functionName: 'totalAmountOfStakes', // Devuelve xxxx
      },
      {
        ...contractCommon,
        functionName: 'withdrawPenaltyTime', // Devuelve xxxx
      },
      {
        ...contractCommon,
        functionName: 'totalStakedRaw', // Devuelve xxxx
      },
      {
        ...contractCommon,
        functionName: 'burnedTokens', // Devuelve xxxx
      },
      {
        ...contractCommon,
        functionName: 'withdrawPenaltyPercentage', // Devuelve xxxx
      },
      {
        ...contractCommon,
        functionName: 'royaltyFee', // Devuelve xxxx
      },
      {
        ...contractCommon,
        functionName: 'mintRoyaltyFee', // Devuelve xxxx
      },
      {
        ...contractCommon,
        functionName: 'rewardsRoyaltyFee', // Devuelve xxxx
      },
      {
        ...contractCommon,
        functionName: 'getTotalAmountWithRewards', // Devuelve xxxx
      },
      {
        ...contractCommon,
        functionName: 'totalSupply', // Devuelve xxxx
      },
      {
        ...contractCommon,
        functionName: 'erc20PaymentAddress', // Devuelve address
      },
    ],
    watch: false,
    enabled: isConnected && activeChain?.id?.toString?.() === process.env.NEXT_PUBLIC_PLATFORM_CHAINID?.toString?.(),    
  });

  const mintPrice:ethers.BigNumber | undefined = contractReadsData?contractReadsData?.[0]?contractReadsData?.[0]:undefined:undefined;
  const totalPendingToWithdrawArray = contractReadsData?contractReadsData?.[1]?contractReadsData?.[1]:undefined:undefined;
  const totalSupply:ethers.BigNumber | undefined = contractReadsData?contractReadsData?.[2]?contractReadsData?.[2]:undefined:undefined;
  const totalAmountOfStakes:ethers.BigNumber | undefined = contractReadsData?contractReadsData?.[3]?contractReadsData?.[3]:undefined:undefined;
  const withdrawPenaltyTime:number | undefined = contractReadsData?contractReadsData?.[4]?contractReadsData?.[4]:undefined:undefined;
  const totalStakedRaw:ethers.BigNumber | undefined = contractReadsData?contractReadsData?.[5]?contractReadsData?.[5]:undefined:undefined;
  const burnedTokens:number | undefined = contractReadsData?contractReadsData?.[6]?contractReadsData?.[6]:undefined:undefined;
  const withdrawPenaltyPercentage:number | undefined = contractReadsData?contractReadsData?.[7]?contractReadsData?.[7]:undefined:undefined;
  const royaltyFee:ethers.BigNumber | undefined = contractReadsData?contractReadsData?.[8]?contractReadsData?.[8]:undefined:undefined;
  const mintRoyaltyFee:ethers.BigNumber | undefined = contractReadsData?contractReadsData?.[9]?contractReadsData?.[9]:undefined:undefined;
  const rewardsRoyaltyFee:ethers.BigNumber | undefined = contractReadsData?contractReadsData?.[10]?contractReadsData?.[10]:undefined:undefined;
  const totalAmountWithRewards:ethers.BigNumber | undefined = contractReadsData?contractReadsData?.[11]?contractReadsData?.[11]:undefined:undefined;
  const soldTokens:ethers.BigNumber | undefined = contractReadsData?contractReadsData?.[12]?contractReadsData?.[12]:undefined:undefined;
  const erc20PaymentAddress:`0x${string}` | undefined = contractReadsData?contractReadsData?.[13]?contractReadsData?.[13]:undefined:undefined;
  

  const withdrawPenaltyTimeDays = withdrawPenaltyTime ? parseFloat((withdrawPenaltyTime / 86400).toFixed(2)) : 0;

  function updateTokens(tokens: { id: BigNumber; }[], from: `0x${string}`, to: `0x${string}`, tokenId: BigNumber, minterAddress: `0x${string}`) {
    // Recibo un NFT
    if (to === minterAddress && from !== minterAddress) {
      const tokenIndex = tokens.findIndex((token) => token.id.toString() === tokenId.toString());
      if (tokenIndex === -1) {
        tokens.push({
          id: tokenId
        });
      } else {
        // Aquí no tiene sentido, porque recibo un NFT que ya tenía.
        console.error("ERROR: Unexpected token transfer, already owned");
      }      
    } 

    // Envío un NFT
    if (from === minterAddress && to !== minterAddress) {
      const tokenIndex = tokens.findIndex((token) => token.id.toString() === tokenId.toString());
      if (tokenIndex !== -1) {
        // Lo quito de la lista.
        tokens.splice(tokenIndex, 1);
      } else {
        // Aquí no tiene sentido, porque envío un NFT que no tenía.
        console.error("ERROR: Unexpected token transfer, not owned", tokenId);
      }
    } 

    // Si no envío o recibo yo, no actualizo nada.
  }

  function handleNFTEvent(from: `0x${string}`, to: `0x${string}`, tokenId: BigNumber) {
    try {
      if (wallet === from || wallet === to) {
        // console.log("New event Transfer", from, to, tokenId);
        setTokensOwned((prev) => {
          const newTokens = prev?.tokens?[...prev.tokens]:[];
          updateTokens(newTokens, from, to, tokenId, wallet);
          // console.log("New tokens", newTokens);

          contractReadsRefetch();
          return {
            owner: prev.owner,
            tokens: newTokens,
          };
        });
      }
    } catch (error) {
      console.log("Error in handleNFTEvent", error);
    }
  }

  useContractEvent({
    once: false,
    address: (wallet)?project.contractaddress:undefined, // Si no estoy conectado, no me suscribo a eventos.
    chainId: activeChain?.id,
    abi: erc721ABI,
    eventName: 'Transfer', // event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    listener(from, to, tokenId) {
      console.log("New event Transfer", from, to, tokenId);
      handleNFTEvent(from, to, tokenId);
    },
  });


  useEffect(() => {

    async function manageEvents() {
      // https://docs.ethers.org/v5/api/contract/contract/#Contract--events
      let allEvents;
      // console.log("manageEvents: before");
      let creationBlockNumber = undefined;
      if (activeChain?.id?.toString?.() === process.env.NEXT_PUBLIC_PLATFORM_CHAINID?.toString?.()) {
        await provider?.getBlockNumber().then((blockNumber) => {
          // console.log("manageEvents: blockNumber ", blockNumber );
          // Este RPC sólo soporta los últimos 10.000 bloques.
          creationBlockNumber = blockNumber - 2000;
        });
      }

      // 721
      const contract = new ethers.Contract(project.contractaddress, erc721ABI, provider);
      const fromFilter = contract.filters.Transfer(wallet);
      const toFilter = contract.filters.Transfer(null, wallet);
      // console.log("manageEvents: fromEvents");
      const fromEvents = await contract.queryFilter(fromFilter, creationBlockNumber);
      // console.log("manageEvents: toEvents");
      const toEvents = await contract.queryFilter(toFilter, creationBlockNumber);
      // console.log("manageEvents: toEvents ends");
      allEvents = [...fromEvents, ...toEvents] // concatenate arrays using spread operator

      // Cojo los evento to, los eventos from y luego los junto y ordeno todos.
      allEvents.sort((a, b) => parseFloat(`${a.blockNumber}.${a.transactionIndex}`) - parseFloat(`${b.blockNumber}.${b.transactionIndex}`))
      // console.log("manageEvents: allEvents", allEvents);

      // Aquí ya tengo todos los eventos ordenados.
      // Creo una estructura nueva.
      const newTokens: { id: BigNumber; }[] = [];
      allEvents.forEach((event) => {
        if (event.event === 'Transfer') {
          // console.log("manageEvents: Transfer, gestionar", event);
          updateTokens(newTokens, event.args.from, event.args.to, event.args.tokenId, wallet);
        } else if (event.event === 'TransferSingle') {
          // console.log("manageEvents: TransferSingle, gestionar", event);
          updateTokens(newTokens, event.args.from, event.args.to, event.args.id, wallet);
        } else if (event.event === 'TransferBatch') {
          // console.log("manageEvents: TransferBatch, gestionar", event);
          event.args.ids.forEach((id) => {
            updateTokens(newTokens, event.args.from, event.args.to, id, wallet);
          });
        } else {
          // console.error("manageEvents: Unexpected event", event.event, event);
        }
      });
      setTokensOwned({
        owner: wallet,
        tokens: newTokens,
      });

      // console.log("manageEvents: newTokens", newTokens);
    }


    if (tokensOwned?.owner !== wallet && provider && provider._isProvider && project.contractaddress) {
      // console.log("DENTRO: Se llama al hook de provider", project.contractaddress, wallet, tokensOwned?.owner);
      setTokensOwned({
        owner: wallet,
        tokens: [],
      });

      try {
        manageEvents().catch((e) => {
          console.error("manageEvents: Error managing events", e);
        });
      } catch (e) {
        console.error("manageEvents: Error managing events outside", e);
      }
    }

  }, [project.contractaddress, provider, wallet, tokensOwned]);


  const coinSymbol = "XDCX";

  const priceInvest = mintInvest?ethers.utils.parseEther(mintInvest?.toString?.()):undefined;

  const argsMint = [priceInvest];

  const {
    config: mintConfig,
  } = usePrepareContractWrite({
    ...contractCommon,
    functionName: 'mint',
    args: argsMint
  });

  const { data: mintData, write: mintWrite } = useContractWrite(mintConfig);
 
  const { isLoading: mintIsLoading, isSuccess: mintIsSuccess } = useWaitForTransaction({
    hash: mintData?.hash,
    onSuccess: () => {
      console.log("Success");
    }
  });

  useEffect(() => {
    setMintInvest(mintPrice && ethers.utils.formatEther(mintPrice?.toString?.()));
  }, [mintPrice]);

  
  return (
    <MintingPage
      meta={
        <Meta
          title={`${project.projectname} - ${AppConfig.site_name}`}
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
                      {totalStakedRaw && ethers.utils.formatEther(totalStakedRaw?.toString?.())} {coinSymbol}
                    </span>
                  </div>
                </div>
                <div className="w-full">
                  <div className="p-3 rounded-lg bg-slate-200 flex flex-col justify-center h-full relative">
                    <span className="text-[11px] text-uppercase letter-spacing-3 text-truncate text-gray-900 mr-2">
                      BALANCE (INC. REWARDS)
                    </span>
                    <span className="text-black text-[14px] text-truncate attribute-value py-1.5">
                    {totalAmountWithRewards && ethers.utils.formatEther(totalAmountWithRewards?.toString?.())} {coinSymbol}
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
                {(isConnected && activeChain?.id?.toString?.() === process.env.NEXT_PUBLIC_PLATFORM_CHAINID?.toString?.()) ? (
                    <div className="w-full">
                      <h2 className="text-lg ml-1 text-center mx-auto text-white font-bold pb-2 pt-4">
                        How much to invest?
                      </h2>
                      <div className="w-full flex relative pb-4">
                        <input
                          type="number"
                          required
                          step="0.01"
                          lang="en"
                          min={parseFloat(mintPrice && ethers.utils.formatEther(mintPrice?.toString?.()))}
                          max={Infinity}
                          value={mintInvest?.toString?.() === "" ? mintPrice?.toString?.() : mintInvest?.toString?.()}
                          onChange={(e) => {
                            let value = parseFloat(e?.target?.value);
                            if (value >= parseFloat(mintPrice && ethers.utils.formatEther(mintPrice?.toString?.()))) {
                              setMintInvest(value);
                            }
                          }}
                          className="appearance-none min-w-0 w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-75"
                          disabled={false}
                        />
                        <div className="absolute right-8 pt-0 text-xs md:top-3 md:text-sm"><label>{coinSymbol}</label></div>
                      </div>
                      <div className="w-full cursor-pointer text-center text-3xl bg-blue-600 p-2 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.1)] font-bold text-white px-4 flex items-center justify-center"
                        onClick={() => {
                          if (mintWrite) mintWrite?.();
                        }}
                      >
                        {
                          (() => {
                            if (mintIsLoading) return "Minting...";
                            if (mintIsSuccess) return "Minted!";
                            if (mintWrite) return "Mint";
                            return "Loading...";
                          })()
                        }
                      </div>
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
                                  <button onClick={openChainModal} type="button" className="bg-red-500 w-full text-center text-3xl p-2 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.1)] justify-center font-bold text-white px-4 flex items-center">
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

      <Modal
        isOpen={modalEarningCalculatorIsOpen}
        onRequestClose={() => {
          setModalEarningCalculatorIsOpen(!modalEarningCalculatorIsOpen);
        }}
        ariaHideApp={false}
        className="z-50"
      >
        <EarningCalculator
          withdrawPenaltyTime={withdrawPenaltyTime}
          withdrawPenaltyPercentage={withdrawPenaltyPercentage}
          mintRoyaltyFee={mintRoyaltyFee}
          rewardsRoyaltyFee={withdrawPenaltyPercentage}
          totalSupply={totalSupply}
          coinSymbol={coinSymbol}
        />
      </Modal>
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
