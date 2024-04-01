import * as React from 'react'
import { Connector, useConnect } from 'wagmi'
import Button from '@mui/material/Button';

export function WalletOptions() {
  const { connectors, connect } = useConnect()

  return connectors.map((connector) => (
    <WalletOption
      key={connector.uid}
      connector={connector}
      onClick={() => connect({ connector })}
    />
  ))
}

function WalletOption({
  connector,
  onClick,
}: {
  connector: Connector
  onClick: () => void
}) {
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    ;(async () => {
      const provider = await connector.getProvider()
      setReady(!!provider)
    })()
  }, [connector])

  return (
    <Button className="fixed top-0 right-0" variant="contained" disabled={!ready} onClick={onClick}>
      Connect to {connector.name}
    </Button>
  )
}