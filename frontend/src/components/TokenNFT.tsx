import NFERC721 from "@/constants/NFERC721";
import { BigNumber, ethers } from "ethers";
import { useState } from "react";
import { useContractReads, useContractWrite, useNetwork, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import Modal from 'react-modal';
import Image from "next/image";

export default function TokenNFT(
  {
    projectName,
    tokenId, 
    chainId,
    contractAddress,
    artworkURL,
    isOwner=true,
    erc20=undefined,
    allowanceERC20=undefined,
  }: 
  {
    projectName:string;
    tokenId: string;
    chainId: number | undefined;
    contractAddress: `0x${string}`;
    artworkURL: string;
    isOwner: boolean;
    erc20?: any;
    allowanceERC20?: any;
  }) {
  const [modalInfoTokenIsOpen, setModalInfoTokenIsOpen] = useState<boolean>(false);
  const [modalUnstakeIsOpen, setModalUnstakeIsOpen] = useState<boolean>(false);
  const [modalAddFundsIsOpen, setModalAddFundsIsOpen] = useState<boolean>(false);

  const contractCommon = {
    address: contractAddress,
    abi: NFERC721,
    chainId: chainId,
  };

  const tokenIdBN = BigNumber.from(tokenId);

  let coinSymbol = process.env.NEXT_PUBLIC_PLATFORM_TOKEN;
  if (erc20?.symbol) {
    coinSymbol = erc20?.symbol;
  }

  const { data: contractReadsWatchData } = useContractReads({
    contracts: [
      {
        ...contractCommon,
        functionName: 'amountOfStakes', // 
        args: [tokenIdBN],
      },
      {
        ...contractCommon,
        functionName: 'getBurnableAmount', // Devuelve uint256
        args: [tokenIdBN],
      },
      {
        ...contractCommon,
        functionName: 'mintingDate', // Devuelve uint256
        args: [tokenIdBN],
      },
      {
        ...contractCommon,
        functionName: 'stakedRaw', // Devuelve uint256
        args: [tokenIdBN],
      },
      {
        ...contractCommon,
        functionName: 'totalAmountOfStakes', // 
      },
      {
        ...contractCommon,
        functionName: 'unstakeableAmount', // Devuelve uint256
        args: [tokenIdBN],
      },
    ],
    watch: false,
    enabled: true,
    allowFailure: process.env.NODE_ENV !== "development",
  });

  const amountOfStakes:ethers.BigNumber | undefined = contractReadsWatchData?contractReadsWatchData?.[0]?contractReadsWatchData?.[0]:undefined:undefined;
  const getBurnableAmount:ethers.BigNumber | undefined = contractReadsWatchData?contractReadsWatchData?.[1]?contractReadsWatchData?.[1]:undefined:undefined;
  const mintingDate:ethers.BigNumber | undefined = contractReadsWatchData?contractReadsWatchData?.[2]?contractReadsWatchData[2]:undefined:undefined;
  const stakedRaw:ethers.BigNumber | undefined = contractReadsWatchData?contractReadsWatchData?.[3]?contractReadsWatchData[3]:undefined:undefined;
  const totalAmountOfStakes:ethers.BigNumber | undefined = contractReadsWatchData?contractReadsWatchData?.[4]?contractReadsWatchData[4]:undefined:undefined;
  const unstakeableAmount:ethers.BigNumber | undefined = contractReadsWatchData?contractReadsWatchData?.[5]?contractReadsWatchData[5]:undefined:undefined;

  // console.log("contractReadsWatchData", contractReadsWatchData);

  // Convert mintingDate to Date with format dd/mm/yyyy and hh:mm
  let mintingDateFormatted = '';
  if (mintingDate) {
    try {
      const mintingDateDate = new Date(mintingDate.toNumber() * 1000);
      mintingDateFormatted = `${mintingDateDate.getDate()}/${mintingDateDate.getMonth() + 1}/${mintingDateDate.getFullYear()} ${mintingDateDate.getHours()}:${(mintingDateDate.getMinutes()<10?'0':'') + mintingDateDate.getMinutes()}`;
    } catch (error) {
      console.error(error);
    }
  }
  

  let stakePercentageOwned = '0'; 
  // console.log("amountOfStakes", amountOfStakes?.toString());
  // console.log(tokenId + " - totalAmountOfStakes", totalAmountOfStakes?.toString());
  if (amountOfStakes && totalAmountOfStakes) {
    try {
      stakePercentageOwned = (amountOfStakes?.mul?.(100_00).div(totalAmountOfStakes).toNumber() / 100).toFixed(2);
    } catch (error) {
      console.error(error);
    }
  }


  const prepareWriteInfo = {
    address: isOwner?contractCommon.address:undefined,
    abi: contractCommon.abi,
    chainId: contractCommon.chainId,
    functionName: 'burnToWithdraw',
    args: [tokenIdBN],
    enabled: isOwner
  };

  const { config: burnConfig } = usePrepareContractWrite(prepareWriteInfo);
  
  const { data: burnData, write: burnWrite } = useContractWrite(burnConfig);

  const { isLoading: burnIsLoading, isSuccess: burnIsSuccess } = useWaitForTransaction({
    hash: burnData?.hash,
    onError(error: any) {
      console.error("Error useWaitForTransaction: ", error);
    },
    onSpeedUp(transaction) {
      console.log("onSpeedUp burnWrite?.hash antiguo", burnWrite?.hash);
      console.log("onSpeedUp transaction", transaction);
    },
    async onSuccess(data: ethers.providers.TransactionReceipt) {
      console.log("onSuccess data", data);
    }, // End onSuccess
  });


  let unstakeableAmountPrice;
  try {
    unstakeableAmountPrice = unstakeableAmount?ethers.utils.formatEther(unstakeableAmount?.toString()):undefined;
  } catch {}

  if (unstakeableAmountPrice === undefined) {
    unstakeableAmountPrice = 'loading...';
  }

  

  return (
          <>
            <div
              className="text-center border hover:border-black p-2 rounded-xl cursor-pointer"
              onClick={() => setModalInfoTokenIsOpen(true)}
            >
              <Image width={300} height={300} alt={projectName} className="rounded-xl mt-10 mx-auto" src={artworkURL} />
              {projectName} #{tokenId.toString()}
            </div>
            <Modal
              isOpen={modalInfoTokenIsOpen}
              onRequestClose={() => {
                setModalInfoTokenIsOpen(!modalInfoTokenIsOpen);
              }}
              ariaHideApp={false}
              className="z-50"
            >
              <div className="bg-white overflow-hidden">
                <div>
                  <div className="my-1 p-0 border rounded-lg">
                    <div className="p-4">
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 justify-center">
                            <div className="w-full">
                              <div className="p-3 rounded-lg bg-slate-800 flex flex-col justify-center h-full relative">
                                <span className="text-[11px] text-uppercase letter-spacing-3 text-truncate text-gray-200 mr-2">
                                  SHARE %
                                </span>
                                <span className="text-white text-[14px] text-truncate attribute-value py-1.5">
                                  {stakePercentageOwned?.toString()}%
                                </span>
                              </div>
                            </div>
                            <div className="w-full">
                              <div className="p-3 rounded-lg bg-slate-800 flex flex-col justify-center h-full relative">
                                <span className="text-[11px] text-uppercase letter-spacing-3 text-truncate text-gray-200 mr-2">
                                  MONEY INITIALLY STAKED
                                </span>
                                <span className="text-white text-[14px] text-truncate attribute-value py-1.5">
                                  {stakedRaw?ethers.utils.formatEther(stakedRaw?.toString()):undefined}
                                </span>
                              </div>
                            </div>
                            <div className="w-full">
                              <div className="p-3 rounded-lg bg-slate-800 flex flex-col justify-center h-full relative">
                                <span className="text-[11px] text-uppercase letter-spacing-3 text-truncate text-gray-200 mr-2">
                                  DATE OF ENTRY
                                </span>
                                <span className="text-white text-[14px] text-truncate attribute-value py-1.5">
                                  {mintingDateFormatted}
                                </span>
                              </div>
                            </div>
                            <div className="w-full">
                              <div className="p-3 rounded-lg bg-slate-800 flex flex-col justify-center h-full relative">
                                <span className="text-[11px] text-uppercase letter-spacing-3 text-truncate text-gray-200 mr-2">
                                  CURRENT BURN-TO-WITHDRAW AMOUNT
                                </span>
                                <span className="text-white text-[14px] text-truncate attribute-value py-1.5">
                                  {getBurnableAmount?ethers.utils.formatEther(getBurnableAmount?.toString()):undefined} {coinSymbol}
                                </span>
                              </div>
                            </div>
                            <div className="w-full">
                              <div className="p-3 rounded-lg bg-slate-800 flex flex-col justify-center h-full relative">
                                <span className="text-[11px] text-uppercase letter-spacing-3 text-truncate text-gray-200 mr-2">
                                  UNSTAKEABLE AMOUNT
                                </span>
                                <span className="text-white text-[14px] text-truncate attribute-value py-1.5">
                                  Maximum unstakeable: 
                                  {" " + unstakeableAmountPrice} {coinSymbol}
                                </span>
                                <button
                                  disabled={!unstakeableAmount?.gt?.(0)}
                                  className="w-full cursor-pointer text-center text-xl bg-blue-600 p-2 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.1)] font-bold text-white px-4 flex items-center justify-center"
                                  onClick={() => {
                                    setModalUnstakeIsOpen(true);
                                  }}
                                >
                                  UNSTAKE
                                </button>
                              </div>
                            </div>
                            <div className="w-full">
                              <div className="p-3 rounded-lg bg-slate-800 flex flex-col justify-center h-full relative">
                                <span className="text-[11px] text-uppercase letter-spacing-3 text-truncate text-gray-200 mr-2">
                                  INCREASE STAKING
                                </span>
                                <span className="text-white text-[14px] text-truncate attribute-value py-1.5">
                                  Press the button to add more funds to your stake
                                </span>
                                <button
                                  className="w-full cursor-pointer text-center text-xl bg-blue-600 p-2 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.1)] font-bold text-white px-4 flex items-center justify-center"
                                  onClick={() => {
                                    setModalAddFundsIsOpen(true);
                                  }}
                                >
                                  ADD FUNDS
                                </button>

                              </div>
                            </div>
                        </div>
                      </div>

                      <div className="w-full mt-6 text-center">

                        <div className="w-full cursor-pointer text-center text-3xl bg-blue-600 p-2 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.1)] font-bold text-white px-4 flex items-center justify-center"
                          onClick={() => {
                            if (burnWrite) burnWrite?.();
                          }}
                        >
                          {
                            (() => {
                              if (burnIsLoading) return "BURNING...";
                              if (burnIsSuccess) return "BURNED NFT";
                              if (burnWrite) return "BURN-TO-WITHDRAW";
                              return "Loading...";
                            })()
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Modal>

            <Modal
              isOpen={modalUnstakeIsOpen}
              onRequestClose={() => {
                setModalUnstakeIsOpen(!modalUnstakeIsOpen);
              }}
              ariaHideApp={false}
              className="z-50"
            >
              <div className="bg-white p-10">
                <div className="h-96 py-20 md:max-w-[500px] mx-auto">
                  <h2 className="text-sm font-medium text-gray-900 ml-1">
                      How much to unstake?
                  </h2>
                  <input
                  type="range"
                  className="form-range
                      w-full
                      h-6
                      p-0
                      bg-transparent
                      focus:outline-none focus:ring-0 focus:shadow-none"
                  min="0"
                  defaultValue={1}
                  />
                  <div className="w-full mt-6 text-center">
                    <button
                      className="w-full cursor-pointer text-center text-xl bg-blue-600 p-2 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.1)] font-bold text-white px-4 flex items-center justify-center"
                    >
                      UNSTAKE
                    </button>
                  </div>
                </div>
              </div>
            </Modal>



            <Modal
              isOpen={modalAddFundsIsOpen}
              onRequestClose={() => {
                setModalAddFundsIsOpen(!modalAddFundsIsOpen);
              }}
              ariaHideApp={false}
              className="z-50"
            >
              <div className="bg-white p-10">
                <div className="h-96 py-20 md:max-w-[500px] mx-auto">
                  <h2 className="text-sm font-medium text-gray-900 ml-1">
                    How much to invest?
                  </h2>
                  <input
                      type="number"
                      required
                      step="0.01"
                      lang="en"
                      min={0}
                      defaultValue={1}
                      className="appearance-none min-w-0 w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-75"
                  />
                  <div className="w-full mt-6 text-center">
                    <button
                      className="w-full cursor-pointer text-center text-xl bg-blue-600 p-2 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.1)] font-bold text-white px-4 flex items-center justify-center"
                    >
                      ADD FUNDS
                    </button>
                  </div>
                </div>
              </div>
            </Modal>
          </>
  );

}