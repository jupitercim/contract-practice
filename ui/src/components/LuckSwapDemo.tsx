import { useState, useCallback, useRef, useEffect } from 'react'
import { REMOTE_CONTRACT_HTTP_URL, REMOTE_CONTRACT_ADDRESS, LUCKY_ADDRESS, MIKI_ADDRESS  } from '@/common/constants'
import { PRIVATE_KEY } from '@/../private-key'
import { Web3, Contract } from 'web3'
import * as LiqABI from '@/../../contract/artifacts/contracts/LiquidityPool.sol/LiquidityPool.json'
import * as MikiABI from '@/../../contract/artifacts/contracts/MikiToken.sol/MikiToken.json'
import * as LukABI from '@/../../contract/artifacts/contracts/LuckyToken.sol/LuckyToken.json'

export default function Demo() {
  const [connectedAccount, setConnectedAccount] = useState('null');
  const [swapInAmount, setSwapInAmount] = useState('')
  const [swapOutAmount, setSwapOutAmount] = useState('')
  const [luckyAmount, setLuckyAmount] = useState('')
  const [mikiAmount, setMikiAmount] = useState('')

  const swapOutTimer = useRef<any>(null)
  const liqABI = (LiqABI as any).abi
  const connectMetamask = useCallback(async() => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      setConnectedAccount(accounts[0]);
    } else {
      alert('Please download metamask');
    }
  }, [])

  const contractApprove = useCallback(async() => {
    const web3 = new Web3(REMOTE_CONTRACT_HTTP_URL)
    const contractA = new Contract(LukABI.abi, LUCKY_ADDRESS, web3)
    const contractB = new Contract(MikiABI.abi, MIKI_ADDRESS, web3)
    const account = connectedAccount;
    const spender = REMOTE_CONTRACT_ADDRESS
    contractA.methods.approve(spender, web3.utils.toWei(luckyAmount, 'ether')).send({ from: account })
    .then(function(receipt){
        console.log('Transaction receipt: ', receipt);
    });

    contractB.methods.approve(spender, web3.utils.toWei(mikiAmount, 'ether')).send({ from: account })
    .then(function(receipt){
        console.log('Transaction receipt: ', receipt);
    });

  }, [connectedAccount, luckyAmount, mikiAmount])

  const addLiquidity = useCallback(async() => {
    if (!luckyAmount || !mikiAmount) return 
    const web3 = new Web3(REMOTE_CONTRACT_HTTP_URL)
    const contract = new Contract(liqABI, REMOTE_CONTRACT_ADDRESS, web3)
    const data = contract.methods.addLiquidity(luckyAmount, mikiAmount).encodeABI()
    await contractApprove()
    const gasLimit = await contract.methods.addLiquidity(luckyAmount, mikiAmount).estimateGas({ from: connectedAccount })

    const gasPrice = await web3.eth.getGasPrice()
    const nonce = await web3.eth.getTransactionCount(connectedAccount);
    const rawTransaction = {
      nonce: web3.utils.toHex(nonce),
      gasLimit: web3.utils.toHex(gasLimit),
      gasPrice,
      to: REMOTE_CONTRACT_ADDRESS,
      data: data,
    };
    const signedTransaction = await web3.eth.accounts.signTransaction(rawTransaction, PRIVATE_KEY);
    const transactionReceipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
    console.log('Transaction hash:', transactionReceipt.transactionHash);

  }, [connectedAccount, contractApprove, liqABI, luckyAmount, mikiAmount])

  const onSwapInChange = useCallback((ev: any) => {
    setSwapInAmount(ev.target.value)
    
  }, [])

  const swap = useCallback( async() => {
    if (!swapInAmount) return 
    const web3 = new Web3(REMOTE_CONTRACT_HTTP_URL)
    const contract = new Contract(liqABI, REMOTE_CONTRACT_ADDRESS, web3)
    
    const data = contract.methods.swap(connectedAccount, LUCKY_ADDRESS, MIKI_ADDRESS, swapInAmount).encodeABI()
    await contractApprove()
    const gasLimit = await contract.methods.swap(connectedAccount, LUCKY_ADDRESS, MIKI_ADDRESS, swapInAmount).estimateGas({ from: connectedAccount })

    const gasPrice = await web3.eth.getGasPrice()
    const nonce = await web3.eth.getTransactionCount(connectedAccount);
    const rawTransaction = {
      nonce: web3.utils.toHex(nonce),
      gasLimit: web3.utils.toHex(gasLimit),
      gasPrice,
      to: REMOTE_CONTRACT_ADDRESS,
      data: data,
    };
    const signedTransaction = await web3.eth.accounts.signTransaction(rawTransaction, PRIVATE_KEY);
    const transactionReceipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
    console.log('Transaction hash:', transactionReceipt.transactionHash);

  }, [connectedAccount, contractApprove, liqABI, swapInAmount])

  useEffect(() => {
    clearTimeout(swapOutTimer.current)
    swapOutTimer.current = setTimeout( async() => {
      if (!swapInAmount) {
        setSwapOutAmount('')
        return
      }
      const web3 = new Web3(REMOTE_CONTRACT_HTTP_URL)
      const contract = new Contract(liqABI, REMOTE_CONTRACT_ADDRESS, web3)
      const outAmount = await contract.methods.calculateSwapAmount(LUCKY_ADDRESS, swapInAmount).call()
      setSwapOutAmount(Number(outAmount as any).toString())
    }, 1000)
  }, [liqABI, swapInAmount])

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
     <div>
      <h1>Start Swap</h1>
      <div className="card">
        {/* Button to trigger Metamask connection */}
        <div>
          <p>input lucky amount</p>
          <input type="text" value={swapInAmount} onChange={onSwapInChange} />
          <p>you will get: {swapOutAmount}</p>
        </div>
        <button onClick={() => swap()}>Swap Lucky to Miki</button>
        </div>
     </div>
     <div>
      <h1>Add Liq</h1>
      <div className="card">
        {/* Button to trigger Metamask connection */}
        <div>
          <p>lucky</p>
          <input type="text" value={luckyAmount} onChange={(ev) => setLuckyAmount(ev.target.value)} />
        </div>
        <div>
          <p>miki</p>
          <input type="text" value={mikiAmount} onChange={(ev) => setMikiAmount(ev.target.value)} />
        </div>
        <button onClick={() => addLiquidity()}>Add</button>
        </div>
     </div>
    </>
  )
}

