import { Meta } from '@/layouts/Meta';
import { Main } from '@/templates/Main';

import { AppConfig } from '@/utils/AppConfig';
import Image from 'next/image';
import { useState } from 'react';

const Index = () => {
  const [tabActive, setTabActive] = useState<string>("Stake");

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
            <div className="flex justify-between text-sm font-normal pb-10">
              <div className="">
                My XDC : -
              </div>
              <div className="text-right">
                My XDCX : -
              </div>
            </div>
          ) : (
            <div className="flex justify-between text-sm font-normal pb-10">
              <div className="">
              Available Balance: - XDCX
              </div>
            </div>
          )}
          
        </div>
      </div>
    </Main>
  );
};

export default Index;
