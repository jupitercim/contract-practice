import { useState } from 'react'
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import * as ABIJson from '@/../../contract/artifacts/contracts/LuckyToken.sol/LuckyToken.json'
import Box from '@mui/material/Box';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, useAccount } from 'wagmi'
import { config } from './config'
import { Account } from './components/Account'
import { WalletOptions } from './components/WalletOption'
import './App.css'
const queryClient = new QueryClient()

function ConnectWallet() {
  const { isConnected } = useAccount()
  if (isConnected) return <Account />
  return <WalletOptions />
}
function App() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
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
              <Button variant="contained">Swap</Button>

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
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
