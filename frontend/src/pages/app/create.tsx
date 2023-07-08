import { Meta } from '@/layouts/Meta';
import { Main } from '@/templates/Main';

import { AppConfig } from '@/utils/AppConfig';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import Link from 'next/link';
import { useNetwork } from 'wagmi';
import UploadImage from '../components/UploadImage';

const Index = () => {
  const { chain: activeChain } = useNetwork();

  

  return (
    <Main
      meta={
        <Meta
          title={AppConfig.title}
          description={AppConfig.description}
        />
      }
    >
      <div className="bg-white w-full py-10 text-black px-2 min-h-screen">
        <Link className="p-2 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.1)] text-base font-bold text-black w-40 mx-auto px-4 flex justify-center items-center" href="/app/">
          <span className="flex items-center justify-center w-full opacity-100">
            <div className="w-7 h-7 inline-flex flex-shrink-0 text-current mr-2">
              <svg version="1.1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 512.009 512.009">
                <g>
                  <path d="M256.009,42.671c-0.002,0-0.005,0-0.007,0c-0.001,0-0.001,0-0.002,0c-0.001,0-0.002,0-0.003,0 c-70.671,0.003-134.648,28.637-180.967,74.935c-0.016,0.016-0.034,0.029-0.05,0.045c-0.017,0.017-0.03,0.035-0.047,0.052 C28.688,163.976,0.072,227.867,0.011,298.445C0.011,298.521,0,298.595,0,298.671c0,0.073,0.01,0.143,0.011,0.215 c0.05,60.201,20.962,117.239,58.515,162.704c4.053,4.907,10.084,7.748,16.448,7.748h95.693h170.667h95.688 c6.364,0,12.395-2.841,16.448-7.748c37.607-45.53,58.539-102.65,58.539-162.919C512.009,157.289,397.391,42.671,256.009,42.671z M197.707,426.671c7.376-12.754,21.165-21.333,36.96-21.333h42.667c15.795,0,29.584,8.579,36.96,21.333H197.707z M426.68,426.671 h-66.702c-9.472-36.807-42.88-64-82.645-64h-42.667c-39.765,0-73.173,27.193-82.645,64H85.316 c-23.281-30.977-37.712-67.661-41.583-106.667h62.934c11.782,0,21.333-9.551,21.333-21.333c0-11.782-9.551-21.333-21.333-21.333 H43.734c4.259-42.905,21.23-82.066,47.091-113.671l14.32,14.32c8.331,8.331,21.839,8.331,30.17,0 c8.331-8.331,8.331-21.839,0-30.17l-14.321-14.321c31.605-25.864,70.765-42.837,113.672-47.098v62.941 c0,11.782,9.551,21.333,21.333,21.333c11.782,0,21.333-9.551,21.333-21.333V86.396c42.906,4.259,82.068,21.232,113.676,47.096 l-14.325,14.325c-8.331,8.331-8.331,21.839,0,30.17c8.331,8.331,21.839,8.331,30.17,0l14.326-14.326 c25.867,31.607,42.842,70.771,47.103,113.677h-62.95c-11.782,0-21.333,9.551-21.333,21.333c0,11.782,9.551,21.333,21.333,21.333 h62.95C464.409,359.001,449.97,395.686,426.68,426.671z"></path>
                  <polygon points="259.659,341.338 319.989,220.655 199.328,281.007"></polygon>
                </g>
              </svg>
            </div>Dashboard
          </span>
        </Link>
        <h2 className="max-w-5xl mx-auto text-2xl mt-4 font-bold text-center md:text-left">Create NFT Project</h2>
        <form>
          <div className="flex flex-wrap flex-col md:flex-row md:flex-nowrap max-w-5xl mx-auto mb-6">
            <div className="w-full md:w-2/3">
              <div>
                <div className="field mt-4 flex items-center">
                  <div className="font-bold">Network</div>
                  <div className="ml-6">
                    <div className="mr-2">
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
                                    <button onClick={openConnectModal} type="button">
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
                                    </button>
                                  </div>
                                );
                              })()}
                            </div>
                          );
                        }}
                      </ConnectButton.Custom>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap">
                  <div className="field mt-4 w-full md:w-2/3">
                    <label className="font-bold">Project Name <button className="w-4 h-4 ml-2 opacity-20 hover:opacity-50" data-tip="true" data-for="contractNameTip">
                        <svg viewBox="0 0 24 24">
                          <path fill="currentColor" d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z"></path>
                        </svg>
                      </button>
                    </label>
                    <input type="text" name="contract-name" placeholder="Project Name" className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-md placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 disabled:text-gray-500 " value="" />
                  </div>
                  <div className="field mt-4 w-full md:w-1/3 md:pl-4">
                    <label className="font-bold">Token Symbol <button className="w-4 h-4 ml-2 opacity-20 hover:opacity-50" data-tip="true" data-for="tokenSymbolTip">
                        <svg viewBox="0 0 24 24">
                          <path fill="currentColor" d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z"></path>
                        </svg>
                      </button>
                    </label>
                    <input type="text" name="token-symbol" placeholder="Token Symbol" className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-md placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 disabled:text-gray-500 " value="" />
                  </div>
                </div>
                <div className="field mt-4">
                  <label className="font-bold">Project Description</label>
                  <button className="w-4 h-4 ml-2 opacity-20 hover:opacity-50" data-tip="true" data-for="descriptionTip">
                    <svg viewBox="0 0 24 24">
                      <path fill="currentColor" d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z"></path>
                    </svg>
                  </button>
                  <textarea name="project" placeholder="This description will be visible to the public on platforms such as marketplaces and third-party applications, among others." className="w-full p-2 mt-2 bg-white border border-slate-300 rounded-md shadow-md placeholder-slate-400"></textarea>
                </div>
              </div>
              <div>
                <div className="flex flex-wrap md:flex-nowrap w-full">
                  <div className="text-lg font-bold text-black w-full md:w-2/3 md:mr-2">
                    <div className="field mt-4">
                      <label>Minting Fee <button className="w-4 h-4 ml-2 opacity-20 hover:opacity-50" data-tip="true" data-for="revenueTip">
                          <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z"></path>
                          </svg>
                        </button>
                      </label>
                      <div className="relative">
                        <div className="absolute left-0 inset-y-0 flex items-center pl-3 opacity-8">
                          <svg viewBox="0 0 24 24" width="16px" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 16H13V18H11V16ZM12.61 6.04C10.55 5.74 8.73 7.01 8.18 8.83C8 9.41 8.44 10 9.05 10H9.25C9.66 10 9.99 9.71 10.13 9.33C10.45 8.44 11.4 7.83 12.43 8.05C13.38 8.25 14.08 9.18 14 10.15C13.9 11.49 12.38 11.78 11.55 13.03C11.55 13.04 11.54 13.04 11.54 13.05C11.53 13.07 11.52 13.08 11.51 13.1C11.42 13.25 11.33 13.42 11.26 13.6C11.25 13.63 11.23 13.65 11.22 13.68C11.21 13.7 11.21 13.72 11.2 13.75C11.08 14.09 11 14.5 11 15H13C13 14.58 13.11 14.23 13.28 13.93C13.3 13.9 13.31 13.87 13.33 13.84C13.41 13.7 13.51 13.57 13.61 13.45C13.62 13.44 13.63 13.42 13.64 13.41C13.74 13.29 13.85 13.18 13.97 13.07C14.93 12.16 16.23 11.42 15.96 9.51C15.72 7.77 14.35 6.3 12.61 6.04Z"></path>
                          </svg>
                        </div>
                        <input type="number" step="any" name="minting-fee" placeholder="0.1" min="0" max="999999999999999999999999999999" className="w-full p-2 pl-9 bg-white border border-slate-300 rounded-md shadow-md placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500     disabled:text-gray-500" value="0.1" />
                        <div className="absolute min-w-[100px] h-8 mt-[6.5px] justify-center right-1.5 inset-y-0 flex items-center px-2 rounded-3xl opacity-8 text-black bg-slate-200
                        cursor-pointer">
                          <div className="mr-2">
                            <svg viewBox="0 0 24 24" width="16px" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 16H13V18H11V16ZM12.61 6.04C10.55 5.74 8.73 7.01 8.18 8.83C8 9.41 8.44 10 9.05 10H9.25C9.66 10 9.99 9.71 10.13 9.33C10.45 8.44 11.4 7.83 12.43 8.05C13.38 8.25 14.08 9.18 14 10.15C13.9 11.49 12.38 11.78 11.55 13.03C11.55 13.04 11.54 13.04 11.54 13.05C11.53 13.07 11.52 13.08 11.51 13.1C11.42 13.25 11.33 13.42 11.26 13.6C11.25 13.63 11.23 13.65 11.22 13.68C11.21 13.7 11.21 13.72 11.2 13.75C11.08 14.09 11 14.5 11 15H13C13 14.58 13.11 14.23 13.28 13.93C13.3 13.9 13.31 13.87 13.33 13.84C13.41 13.7 13.51 13.57 13.61 13.45C13.62 13.44 13.63 13.42 13.64 13.41C13.74 13.29 13.85 13.18 13.97 13.07C14.93 12.16 16.23 11.42 15.96 9.51C15.72 7.77 14.35 6.3 12.61 6.04Z"></path>
                            </svg>
                          </div>INVALID CUSTOM <svg className="ml-1" fill="none" height="7" width="14" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.75 1.54001L8.51647 5.0038C7.77974 5.60658 6.72026 5.60658 5.98352 5.0038L1.75 1.54001" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-black w-full md:w-1/3">
                    <div className="field mt-4">
                      <label>Edition Size <button className="w-4 h-4 ml-2 opacity-20 hover:opacity-50" data-tip="true" data-for="revenueTip">
                          <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z"></path>
                          </svg>
                        </button>
                      </label>
                      <input type="number" min="1" max="50000" name="total-supply" className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-md placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500       disabled:text-gray-500" value="100" />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-3 gap-y-5 border p-2 border-gray-600 rounded-md">
                  <div className="text-lg field w-full">
                    <label className="font-bold flex items-center">Primary Sales (Percentage) <button className="w-4 h-4 ml-2 opacity-20 hover:opacity-50" data-tip="true" data-for="descriptionTip">
                        <svg viewBox="0 0 24 24">
                          <path fill="currentColor" d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z"></path>
                        </svg>
                      </button>
                    </label>
                    <div className="text-lg font-bold text-black">
                      <div className="field">
                        <div className="relative">
                          <input type="number" step="any" max="10" min="0" name="percentage" placeholder="5%" className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-md placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 disabled:text-gray-500" value="0" />
                          <div className="absolute right-5 top-3.5 text-xs md:top-3 md:text-sm">
                            <label>Mint Percentage (max 10%)</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-lg field w-full">
                    <label className="font-bold flex items-center">Secondary Sales (Royalties) <button className="w-4 h-4 ml-2 opacity-20 hover:opacity-50" data-tip="true" data-for="descriptionTip">
                        <svg viewBox="0 0 24 24">
                          <path fill="currentColor" d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z"></path>
                        </svg>
                      </button>
                    </label>
                    <div className="text-lg font-bold text-black">
                      <div className="field">
                        <div className="relative">
                          <input type="number" step="any" max="10" min="0" name="percentage" placeholder="5%" className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-md placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500    disabled:text-gray-500" value="7.5" />
                          <div className="absolute right-5 top-3.5 text-xs md:top-3 md:text-sm">
                            <label>Royalties Percentage (max 10%)</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-lg field w-full">
                    <label className="font-bold flex items-center">Staking rewards (Percentage) <button className="w-4 h-4 ml-2 opacity-20 hover:opacity-50" data-tip="true" data-for="descriptionTip">
                        <svg viewBox="0 0 24 24">
                          <path fill="currentColor" d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z"></path>
                        </svg>
                      </button>
                    </label>
                    <div className="text-lg font-bold text-black">
                      <div className="field">
                        <div className="relative">
                          <input type="number" step="any" max="10" min="0" name="percentage" placeholder="5%" className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-md placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500    disabled:text-gray-500" value="0" />
                          <div className="absolute right-5 top-3.5 text-xs md:top-3 md:text-sm">
                            <label>Rewards Percentage (max 10%)</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-lg field w-full">
                    <label className="font-bold flex items-center">Penalty (Percentage) <button className="w-4 h-4 ml-2 opacity-20 hover:opacity-50" data-tip="true" data-for="descriptionTip">
                        <svg viewBox="0 0 24 24">
                          <path fill="currentColor" d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z"></path>
                        </svg>
                      </button>
                    </label>
                    <div className="text-lg font-bold text-black">
                      <div className="field">
                        <div className="relative">
                          <input type="number" step="any" max="10" min="0" name="percentage" placeholder="5%" className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-md placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500    disabled:text-gray-500" value="5" />
                          <div className="absolute right-5 top-3.5 text-xs md:top-3 md:text-sm">
                            <label>Penalty Percentage (max 10%)</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-lg field w-full">
                    <label className="font-bold flex items-center">Days with Penalty <button className="w-4 h-4 ml-2 opacity-20 hover:opacity-50" data-tip="true" data-for="descriptionTip">
                        <svg viewBox="0 0 24 24">
                          <path fill="currentColor" d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z"></path>
                        </svg>
                      </button>
                    </label>
                    <div className="text-lg font-bold text-black">
                      <div className="field">
                        <div className="relative">
                          <input type="number" step="any" max="365" min="0" className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-md placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500    disabled:text-gray-500" value="365" />
                          <div className="absolute right-5 top-3.5 text-xs md:top-3 md:text-sm">
                            <label>(max 365 days)</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full md:ml-4 md:w-1/3">
              <UploadImage />
            </div>
          </div>
          {activeChain?.unsupported ? '' : (
            <div className="flex flex-wrap flex-col md:flex-row md:flex-nowrap max-w-5xl mx-auto">
              <div className="w-full md:w-2/3 text-center mt-10 mb-20">
                <div className="mt-10"></div>
                <button type="submit" class="mx-auto text-2xl font-bold border-2 border-gray-600 bg-white rounded-lg p-4 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500 disabled:border-gray-500 " disabled="">Deploy to {activeChain?.name}</button>
                <div className="field mt-2">
                  <p className="text-sm font-normal text-pink-600">Add a valid project name</p>
                </div>
              </div>
            </div>
          )}
    
        </form>
      </div>
    </Main>
  );
};

export default Index;
