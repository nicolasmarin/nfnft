/* eslint-disable react/no-unescaped-entities */

import { useMemo, useState } from 'react';

type EarningCalculatorProps = {
  withdrawPenaltyTime: any;
  withdrawPenaltyPercentage: any;
  mintRoyaltyFee: any;
  rewardsRoyaltyFee: any;
  totalSupply: any;
  coinSymbol?: string;
};

export default function EarningCalculator({withdrawPenaltyTime, withdrawPenaltyPercentage, mintRoyaltyFee, totalSupply, coinSymbol}: EarningCalculatorProps) {
  const [toInvest, setToInvest] = useState(1);
  const [exitOrder, setExitOrder] = useState(1);
  const [daysPastExit, setDaysPastExit] = useState(0);

  let namePlan = "APY";
  let APY = parseFloat(process.env.NEXT_PUBLIC_PLATFORM_APY) / 100;

  // calculate earnings APY using toInvest, exitOrder, daysPastExit, withdrawPenaltyTime, withdrawPenaltyPercentage, mintRoyaltyFee, totalSupply
  const withdrawPenaltyTimeDays = withdrawPenaltyTime ? parseFloat((withdrawPenaltyTime / 86400).toFixed(2)) : 0;
  const penaltyTime = (withdrawPenaltyTimeDays - daysPastExit)/withdrawPenaltyTimeDays > 0 ? (withdrawPenaltyTimeDays - daysPastExit)/withdrawPenaltyTimeDays : 0;
  const halfPenalyTime = penaltyTime + ((1-penaltyTime)/2);

  // Log these variables
  // console.log("toInvest", toInvest); // SLIDE. To Invest en EVMOS, de 1 a 1.000.
  // console.log("exitOrder", exitOrder); // SLIDE. Empieza en 1 y acaba en totalSupply
  // console.log("daysPastExit", daysPastExit); // SLIDE. Días seleccionados. Empieza en 0 y acaba en 366
  // console.log("withdrawPenaltyTime", withdrawPenaltyTime); // 1 año. Nos lo pasan de la colección.
  // console.log("penaltyTime", penaltyTime); // 1 el 100%, y 0 el 0%. Se va calculando
  // console.log("withdrawPenaltyPercentage", withdrawPenaltyPercentage); // 5_01 --> 5.01%. Nos lo pasan de la colección.
  // console.log("mintRoyaltyFee", mintRoyaltyFee); // 5_01 --> 5%. Como BigNumber.
  // console.log("totalSupply", totalSupply); // 100. Como BigNumber. 

  const earnings = useMemo(() => {
    let remainingInvestment = (toInvest * totalSupply) + (toInvest * totalSupply * daysPastExit / 365 * APY);
    let remainingSupply = Number(totalSupply);

    for (let i = 1; i <= exitOrder; i++) {
      const investmentPart = remainingInvestment / remainingSupply;
      // console.log(i, "---- investmentPart", investmentPart, remainingInvestment, remainingSupply);

      const penaltyExitOrder = ((totalSupply-i)/totalSupply);

      if (i === exitOrder) {
        // console.log(i, "---- last one");
        const currentPenalty = ((penaltyTime + penaltyExitOrder) * withdrawPenaltyPercentage) / 100_00;
        const amountToWithdraw = investmentPart * (1 - currentPenalty);
        return amountToWithdraw;
      } else {
        const currentPenalty = ((halfPenalyTime + penaltyExitOrder) * withdrawPenaltyPercentage) / 100_00;
  
        const amountToWithdraw = investmentPart * (1 - currentPenalty);
        // console.log(i, "---- amountToWithdraw", amountToWithdraw);
  
        remainingInvestment -= amountToWithdraw;
        remainingSupply--;
      }
    }

    return 0;
  }, [toInvest, exitOrder, daysPastExit, withdrawPenaltyTime, withdrawPenaltyPercentage, mintRoyaltyFee, totalSupply]);

  const nth = function(d) {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  }

  function getThOrder(exitOrder: number, totalSupply: number): import("react").ReactNode {
    if (exitOrder === 1) return "First";
    if (exitOrder >= totalSupply) return "Last";
    if (exitOrder === 2) return "Second";
    if (exitOrder === 3) return "Third";
    return String(exitOrder) + nth(exitOrder);
  }

  let coinSymbolCalc = "XDC";
  if (coinSymbol) {
    coinSymbolCalc = coinSymbol;
  }

  return (
  <div className="antialiased text-gray-600 w-full">
      <span className="fixed z-0 blur-[200px] w-[600px] h-[600px] rounded-full top-1/2 -translate-x-1/2 left-1/2 -translate-y-1/2 bg-gradient-to-tl from-red-600/20 to-violet-600/20 dark:from-red-600/40 dark:to-violet-600/40"></span>

      <div className="h-full z-20">
        <div className="h-full bg-gray-900 pb-[5rem] md:pb-6 no-scrollbar">
          <div className="bg-gray-900">
            <div id="propass" className="container mx-auto pt-2">
              <div>
                <div className="flex flex-col justify-center text-center">
                  <div className="flex flex-col justify-start break-words text-center sm:text-start sm:justify-center sm:items-center sm:pb-2">
                    <div className="text-gray-100 font-bold text-4xl md:text-5xl lg:text-6xl">
                      <h1><span className="block md:inline bg-gradient-to-l from-red-600 to-violet-600 text-transparent bg-clip-text">{namePlan}</span> Earnings Calculator</h1>
                    </div>

                    <div className="overflow-hidden after:content-[''] after:absolute after:h-10 after:w-10 after:bg-violet-600/10 dark:after:bg-violet-600/30 after:top-28 after:left-[30%] after:-z-1 after:rounded-lg after:animate-[spin_10s_linear_infinite]"></div>
                    <div className="overflow-hidden after:content-[''] after:absolute after:h-10 after:w-10 after:bg-violet-600/20 dark:after:bg-violet-600/40 after:bottom-56 after:right-[25%] after:-z-1 after:rounded-full after:animate-ping"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pb-10 text-white text-center">
              <p>
                <b>APY: {process.env.NEXT_PUBLIC_PLATFORM_APY}%</b>
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 md:grid-cols-4 max-w-4xl mx-auto pb-6">
              <div 
                  className={`w-auto md:px-5 pt-5 pb-5 border border-white rounded-lg bg-gray-900 z-20 cursor-pointer`}
              >
                <div className="text-lg font-bold my-3 text-center">
                  PENALTY TIME
                </div>
                <div className="text-base text-white font-bold my-2 justify-center items-center flex gap-2">
                  {withdrawPenaltyTimeDays} days
                </div>
              </div>

              <div 
                  className={`w-auto md:px-5 pt-5 pb-5 border border-white rounded-lg bg-gray-900 z-20 cursor-pointer`}
              >
                <div className="text-lg font-bold my-3 text-center">
                  PENALTY %
                </div>
                <div className="text-base text-white font-bold my-2 justify-center items-center flex gap-2">
                  {(parseFloat(withdrawPenaltyPercentage?.toString?.()) / 100).toFixed(2)} %
                </div>
              </div>

              <div 
                  className={`w-auto md:px-5 pt-5 pb-5 border border-white rounded-lg bg-gray-900 z-20 cursor-pointer`}
              >
                <div className="text-lg font-bold my-3 text-center">
                MINT ROYALTY
                </div>
                <div className="text-base text-white font-bold my-2 justify-center items-center flex gap-2">
                  {(parseFloat(mintRoyaltyFee?.toString?.()) / 100).toFixed(2)} %
                </div>
              </div>

              <div 
                  className={`w-auto md:px-5 pt-5 pb-5 border border-white rounded-lg bg-gray-900 z-20 cursor-pointer`}
              >
                <div className="text-lg font-bold my-3 text-center">
                  TOTAL SUPPLY
                </div>
                <div className="text-base text-white font-bold my-2 justify-center items-center flex gap-2">
                  {totalSupply?.toString?.()}
                </div>
              </div>
            </div>

            <div className="mt-6 mx-auto text-center relative max-w-4xl">
              <input
                type="range"
                className="
                  form-range
                  w-full
                  h-6
                  p-0
                  bg-transparent
                  focus:outline-none focus:ring-0 focus:shadow-none
                "
                min="1"
                max="1000"
                step={0.1}
                onChange={e => { setToInvest(parseFloat(e.target.value)); }}
                value={toInvest}
              />
              <div className="mt-2 text-white text-center">
                <p>
                  <b>Investment (mint fee): {toInvest} {coinSymbolCalc}</b>
                </p>
              </div>
            </div>

            <div className="mt-4 mx-auto text-center relative max-w-4xl">
              <input
                type="range"
                className="
                  form-range
                  w-full
                  h-6
                  p-0
                  bg-transparent
                  focus:outline-none focus:ring-0 focus:shadow-none
                "
                min="0"
                max="366"
                step={1}
                onChange={e => { setDaysPastExit(parseInt(e.target.value)); }}
                value={daysPastExit}
              />
              <div className="mt-2 text-white text-center">
                <p>
                  <b>When will you burn-to-withdraw (in days)? After {daysPastExit > 365 ? '+365' : daysPastExit} days from minting.</b>
                </p>
              </div>
            </div>

            <div className="mt-4 mx-auto text-center relative max-w-4xl">
              <input
                type="range"
                className="
                  form-range
                  w-full
                  h-6
                  p-0
                  bg-transparent
                  focus:outline-none focus:ring-0 focus:shadow-none
                "
                min="1"
                max={totalSupply}
                step={1}
                onChange={e => { setExitOrder(parseInt(e.target.value)); }}
                value={exitOrder}
              />
              <div className="mt-2 text-white text-center">
                <p>
                  <b>Exit order: {getThOrder(exitOrder, totalSupply)} to exit</b>
                </p>
              </div>
            </div>




            <div className="flex mt-10 px-2 md:px-6 justify-center">
              <div 
                className={`w-auto md:px-5 pt-5 pb-5 mx-1 md:mx-5 border border-white rounded-lg bg-gray-900 z-20 cursor-pointer`}
              >
                <div className="text-2xl font-bold my-3 text-center">
                  EARNINGS ({coinSymbolCalc})
                </div>
                <div className="text-4xl text-white font-bold my-2 justify-center items-center flex gap-2">
                  ~ {earnings.toFixed(2)} 
                  <span className={`text-xl ${parseFloat(earnings.toFixed(2)) >= toInvest ? 'text-green-400' : 'text-red-500'}`}>
                    (
                      {parseFloat(earnings.toFixed(2)) >= toInvest ? '+' : '-'}
                      {Math.abs((1-(earnings/toInvest))*100).toFixed(2)}%
                    )
                  </span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
  </div>
  );
}
