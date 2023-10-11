import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { loadAccount, loadProvider, loadNetwork, loadToken } from '../store/interactions'
import config from '../config.json'

function App() {

  const dispatch = useDispatch()

  const loadBlockchainData = async() => {

    await loadAccount(dispatch)
    const provider = loadProvider(dispatch)
    const chainId = await loadNetwork(provider, dispatch)
    await loadToken(provider, config[chainId].RH.address, dispatch)
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
