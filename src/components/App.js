import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { loadProvider, loadAccount, loadNetwork, loadTokens, loadExchange, loadAllOrders, subscribeToEvents } from '../store/interactions'
import config from '../config.json'
import Navbar from './Navbar'
import Markets from './Markets'
import Balance from './Balance'
import Order from './Order'
import PriceChart from './PriceChart'
import MyTransactions from './MyTransactions'
import Trades from './Trades'
import OrderBook from './OrderBook'
import Alert from './Alert'

function App() {

  const dispatch = useDispatch()

  const loadBlockchainData = async() => {

    const provider = loadProvider(dispatch)
    const chainId = await loadNetwork(provider, dispatch)
    
    window.ethereum.on('chainChanged', () => {window.location.reload()})
    window.ethereum.on('accountsChanged', async() => {await loadAccount(provider, dispatch)})
    
    await loadTokens(provider, [config[chainId].RH.address, config[chainId].mETH.address], dispatch)
    
    const exchange = loadExchange(provider, config[chainId].exchange.address, dispatch)

    await loadAllOrders(provider, exchange, dispatch)

    subscribeToEvents(exchange, dispatch)
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      <Navbar />

      <main className='exchange grid'>

        <section className='exchange__section--left grid'>

          <Markets />

          <Balance />

          <Order />

        </section>

        <section className='exchange__section--right grid'>

          <PriceChart />

          <MyTransactions />

          <Trades />

          <OrderBook />

        </section>
        
      </main>

      <Alert />

    </div>
  );
}

export default App;
