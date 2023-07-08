import StakeManagerABI from '../constants/StakeManager';
import { BigNumber } from 'ethers';
import error from 'next/error';
import * as React from 'react'
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useAccount,
  useConnect,
} from 'wagmi'
 
export function MintNFT() {
  const { connector: activeConnector, isConnected, isConnecting, isDisconnected } = useAccount();
  const { connect, connectors, error: connectError, isLoading: connectIsLoading, pendingConnector } = useConnect();

  const valueToStake: BigNumber | undefined = BigNumber.from('1000000000000000000');

  const {
    config,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareContractWrite({
    address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
    abi: StakeManagerABI,
    functionName: 'deposit',
    overrides: {
      value: valueToStake,
    },
  })
  const { data, error: writeError, isError, write } = useContractWrite(config)
 
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })
 
  if (isConnecting) return <div>Connecting…</div>
  if (isDisconnected) return (
    <>
      {connectors.map((connector) => (
        <button
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect({ connector })}
        >
          Connect Wallet
          {connectIsLoading &&
            pendingConnector?.id === connector.id &&
            ' (connecting)'}
        </button>
      ))}
 
      {connectError && <div>{connectError.message}</div>}
    </>
  )  

  return (
    <div>
      <button disabled={!write || isLoading} onClick={() => write?.()}>
        {isLoading ? 'Staking...' : 'Stake XDC'}
      </button>
      {isSuccess && (
        <div>
          XDC Staked! You've got your xdcX.
          <div>
            <a href={`https://etherscan.io/tx/${data?.hash}`}>Etherscan</a>
          </div>
        </div>
      )}
      {(isPrepareError || isError) && (
        <div>Error: {(prepareError || error)?.message}</div>
      )}
    </div>
  )
}