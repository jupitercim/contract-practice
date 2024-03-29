import { useState, useCallback, useEffect } from 'react'
import { REMOTE_CONTRACT_HTTP_URL } from '@/common/constants'
import { Web3, HttpProvider } from 'web3'
import * as ABIJson from '@/../../contract/artifacts/contracts/LuckyToken.sol/LuckyToken.json'

export default function Demo() {
  const [connectedAccount, setConnectedAccount] = useState('null');
  const abiJson = (ABIJson as any).abi
  const connectMetamask = useCallback( async() => {
    //check metamask is installed
    if (window.ethereum) {
      // instantiate Web3 with the injected provider
      const web3 = new Web3(window.ethereum);

      //request user to connect accounts (Metamask will prompt)
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      //get the connected accounts
      const accounts = await web3.eth.getAccounts();

      //show the first connected account in the react page
      setConnectedAccount(accounts[0]);
    } else {
      alert('Please download metamask');
    }
  }, [])

  const getBalance = useCallback( async() => {
    const web3 = new Web3(REMOTE_CONTRACT_HTTP_URL);
    const blockNum = await web3.eth.getBlockNumber()
    console.log(blockNum)
  }, [])

  useEffect(() => {
    connectedAccount && getBalance()
  }, [connectedAccount, getBalance])

  return (
    <>
     <div>
      <h1>Connect metaMask</h1>
        <div className="card">
        {/* Button to trigger Metamask connection */}
        <button onClick={() => connectMetamask()}>Connect to Metamask</button>

        {/* Display the connected account */}
        <h2>{connectedAccount}</h2>
        </div>
     </div>
    </>
  )
}

