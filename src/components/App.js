import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { loadAccount, loadProvider, loadNetwork, loadTokens, loadExchange } from '../store/interactions'
import config from '../config.json'

function App() {

  const dispatch = useDispatch()

  const loadBlockchainData = async() => {

    const provider = loadProvider(dispatch)
    await loadAccount(provider, dispatch)
    const chainId = await loadNetwork(provider, dispatch)
    await loadTokens(provider, [config[chainId].RH.address, config[chainId].mETH.address], dispatch)
    loadExchange(provider, config[chainId].exchange.address, dispatch)
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
