import { useState } from 'react'
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
// import * as ABIJson from '@/../../contract/artifacts/contracts/LuckyToken.sol/LuckyToken.json'
import Box from '@mui/material/Box';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, useAccount } from 'wagmi'
import { config } from './config'
import { Account } from './components/Account'
import { WalletOptions } from './components/WalletOption'
import './App.css'
import { Web3 } from 'web3';

export const REMOTE_CONTRACT_HTTP_URL = import.meta.env.VITE_REMOTE_CONTRACT_HTTP_URL as string
export const REMOTE_CONTRACT_ADDRESS = import.meta.env.VITE_REMOTE_CONTRACT_ADDRESS as string

async function sendTransaction(walletAddress: string, amount: number = 0) {
  console.log(walletAddress, amount)
  // 1st - initialize the provider
  const web3 = new Web3(REMOTE_CONTRACT_HTTP_URL);
  // try {
  //   // 3rd step: instantiate the contract with the ABI and contract address
  //   const myContract = new web3.eth.Contract(ABIJson.abi, REMOTE_CONTRACT_ADDRESS);

  //   // 4th step: call contract method and send the tx
  //   await myContract.methods.doSomething().send({
  //     from: walletAddress,
  //     gas: '1000000',
  //     // other transaction's params
  //   });
  // } catch (error) {
  //   // catch transaction error
  //   console.error(error);
  // }
}
function ConnectWallet() {
  const { isConnected } = useAccount()
  if (isConnected) return <Account />
  return <WalletOptions />
}
function App() {
  const [value, setValue] = useState(0);
  const { address } = useAccount()
  const swap = () => {
    if (address) {
      sendTransaction(address)
    }
  }
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  return (
    <Stack spacing={2}>
      <ConnectWallet />
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Swap" />
          <Tab label="Add liquidity" />
        </Tabs>
      </Box>
      <Stack spacing={2}>
        {value === 0 && <Stack spacing={2}>
          <OutlinedInput
            id="outlined-basic" label="支付" endAdornment={<InputAdornment position="end">BNB</InputAdornment>}
          />
          <OutlinedInput
            id="outlined-basic" label="收入" endAdornment={<InputAdornment position="end">Lucky</InputAdornment>}
          />
          <Button variant="contained" onClick={swap}>Swap</Button>

        </Stack>
        }
        {value === 1 && <Stack spacing={2}>

          <OutlinedInput
            id="outlined-basic" label="支付" endAdornment={<InputAdornment position="end">BNB</InputAdornment>}
          />
          <OutlinedInput
            id="outlined-basic" label="收入" endAdornment={<InputAdornment position="end">Lucky</InputAdornment>}
          />
          <Button variant="contained">Add liquidity</Button>

        </Stack>
        }
      </Stack>
    </Stack>

  )
}

export default App
