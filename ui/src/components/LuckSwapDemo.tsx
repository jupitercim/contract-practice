import { useState, useCallback, useRef, useEffect } from 'react'
import { REMOTE_CONTRACT_HTTP_URL, REMOTE_CONTRACT_ADDRESS, LUCKY_ADDRESS, MIKI_ADDRESS  } from '@/common/constants'
import { PRIVATE_KEY } from '@/../private-key'
import { Web3, Contract } from 'web3'
import * as LiqABI from '@/../../contract/artifacts/contracts/LiquidityPool.sol/LiquidityPool.json'
import * as MikiABI from '@/../../contract/artifacts/contracts/MikiToken.sol/MikiToken.json'
import * as LukABI from '@/../../contract/artifacts/contracts/LuckyToken.sol/LuckyToken.json'

export default function Demo() {
  const [connectedAccount, setConnectedAccount] = useState('null');
  const [swapLuckyInAmount, setSwapLuckyInAmount] = useState('')
  const [swapMikiInAmount, setSwapMikiInAmount] = useState('')
  const [swapLuckyOutAmount, setSwapLuckyOutAmount] = useState('')
  const [swapMikiOutAmount, setSwapMikiOutAmount] = useState('')
  const [luckyAmount, setLuckyAmount] = useState('')
  const [mikiAmount, setMikiAmount] = useState('')
  const [poolData, setPoolData] = useState({
    luckyAmount: 0,
    mikiAmount: 0,
    totalAmount: 0
  })

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

  const updatePoolData = useCallback( async (contract: Contract<any>) => {
    const [luckyAmount, mikiAmount, totalAmount] = await Promise.all([
      contract.methods.tokenAmount().call(),
      contract.methods.tokenBmount().call(),
      contract.methods.totalSupply().call()
    ])
    setPoolData({
      luckyAmount: Number(luckyAmount),
      mikiAmount: Number(mikiAmount),
      totalAmount: Number(totalAmount)
    })
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
      nonce: web3.utils.toHex(Number(nonce) +2),
      gasLimit: web3.utils.toHex(gasLimit),
      gasPrice,
      to: REMOTE_CONTRACT_ADDRESS,
      data: data,
    };
    const signedTransaction = await web3.eth.accounts.signTransaction(rawTransaction, PRIVATE_KEY);
    const transactionReceipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
    console.log('Transaction hash:', transactionReceipt.transactionHash);
    updatePoolData(contract)

  }, [connectedAccount, contractApprove, liqABI, luckyAmount, mikiAmount, updatePoolData])

  const swap = useCallback( async(type: 'lucky' | 'miki') => {
    if (!swapMikiInAmount && !swapLuckyInAmount) return 
    const swapParam = {
      lucky: {
        from: LUCKY_ADDRESS,
        to: MIKI_ADDRESS,
        amount: swapLuckyInAmount
      },
      miki: {
        from: MIKI_ADDRESS,
        to: LUCKY_ADDRESS,
        amount: swapMikiInAmount
      }
    }
    const web3 = new Web3(REMOTE_CONTRACT_HTTP_URL)
    const contract = new Contract(liqABI, REMOTE_CONTRACT_ADDRESS, web3)
    
    const data = contract.methods.swap(connectedAccount, swapParam[type].from, swapParam[type].to, swapParam[type].amount).encodeABI()
    await contractApprove()
    // const gasLimit = await contract.methods.swap(connectedAccount, swapParam[type].from, swapParam[type].to, swapParam[type].amount).estimateGas({ from: connectedAccount })
    const gasLimit = '500'

    const gasPrice = await web3.eth.getGasPrice()
    const nonce = await web3.eth.getTransactionCount(connectedAccount);
    const rawTransaction = {
      nonce: web3.utils.toHex(Number(nonce) + 2),
      gasLimit: web3.utils.toHex(gasLimit),
      gasPrice,
      to: REMOTE_CONTRACT_ADDRESS,
      data: data,
    };
    console.log(rawTransaction, swapParam[type].from, swapParam[type].to, swapParam[type].amount, 'rawTransaction')
    const signedTransaction = await web3.eth.accounts.signTransaction(rawTransaction, PRIVATE_KEY);
    const transactionReceipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
    console.log('Transaction hash:', transactionReceipt.transactionHash);
    updatePoolData(contract)

  }, [connectedAccount, contractApprove, liqABI, swapLuckyInAmount, swapMikiInAmount, updatePoolData])

  useEffect(() => {
    clearTimeout(swapOutTimer.current)
    swapOutTimer.current = setTimeout( async() => {
      if (!swapLuckyInAmount) {
        setSwapLuckyOutAmount('')
        return
      }
      const web3 = new Web3(REMOTE_CONTRACT_HTTP_URL)
      const contract = new Contract(liqABI, REMOTE_CONTRACT_ADDRESS, web3)
      const outAmount = await contract.methods.calculateSwapAmount(LUCKY_ADDRESS, swapLuckyInAmount).call()
      setSwapLuckyOutAmount(Number(outAmount as any).toString())
    }, 1000)
  }, [liqABI, swapLuckyInAmount])

  useEffect(() => {
    clearTimeout(swapOutTimer.current)
    swapOutTimer.current = setTimeout( async() => {
      if (!swapMikiInAmount) {
        setSwapMikiOutAmount('')
        return
      }
      const web3 = new Web3(REMOTE_CONTRACT_HTTP_URL)
      const contract = new Contract(liqABI, REMOTE_CONTRACT_ADDRESS, web3)
      const outAmount = await contract.methods.calculateSwapAmount(MIKI_ADDRESS, swapMikiInAmount).call()
      setSwapMikiOutAmount(Number(outAmount as any).toString())
    }, 1000)
  }, [liqABI, swapMikiInAmount])

  useEffect(() => {
    const web3 = new Web3(REMOTE_CONTRACT_HTTP_URL)
    const contract = new Contract(liqABI, REMOTE_CONTRACT_ADDRESS, web3)
    updatePoolData(contract)
  }, [liqABI, updatePoolData])

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
          <p>Lucky Amount: {poolData.luckyAmount}</p>
          <p>Miki Amount: {poolData.mikiAmount}</p>
          <p>Total Amount: {poolData.totalAmount}</p>
        </div>
     </div>
     <div style={{ display: 'flex', justifyContent: 'space-between'}}>
      <div className="card">
          {/* Button to trigger Metamask connection */}
          <div>
            <p>input Lucky amount</p>
            <input type="text" value={swapLuckyInAmount} onChange={ev => setSwapLuckyInAmount(ev.target.value)} />
            <p>you will get Miki amount: {swapLuckyOutAmount}</p>
          </div>
          <button onClick={() => swap('lucky')}>Swap Lucky to Miki</button>
        </div>
        <div className="card">
          {/* Button to trigger Metamask connection */}
          <div>
            <p>input Miki amount</p>
            <input type="text" value={swapMikiInAmount} onChange={ev => setSwapMikiInAmount(ev.target.value)} />
            <p>you will get Lucky amount: {swapMikiOutAmount}</p>
          </div>
          <button onClick={() => swap('miki')}>Swap Lucky to Miki</button>
        </div>
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

