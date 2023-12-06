import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  loadProvider,
  loadAccount,
  loadNetwork,
  loadTokens,
  loadExchange,
  loadAllOrders,
  subscribeToEvents,
} from '../store/interactions';
import config from '../config.json';
import Navbar from './Navbar';
import Markets from './Markets';
import Balance from './Balance';
import Order from './Order';
import PriceChart from './PriceChart';
import OrderBook from './OrderBook';

function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  const loadBlockchainData = async () => {
    try {
      const provider = loadProvider(dispatch);
      const chainId = await loadNetwork(provider, dispatch);

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
      window.ethereum.on('accountsChanged', async () => {
        await loadAccount(provider, dispatch);
      });

      await loadTokens(provider, [config[chainId].RH.address, config[chainId].mETH.address], dispatch);

      const exchange = loadExchange(provider, config[chainId].exchange.address, dispatch);

      await loadAllOrders(provider, exchange, dispatch);

      subscribeToEvents(exchange, dispatch);

      // Set loading to false once all data is loaded
      setLoading(false);
    } catch (error) {
      console.error('Error loading blockchain data:', error);
      // Handle error loading blockchain data
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlockchainData();
  }, [loadBlockchainData]); // Include loadBlockchainData in the dependency array

  return (
    <div>
      <Navbar />

      {loading ? (
        // Display a loading animation while the data is being loaded
        <div>Loading...</div>
      ) : (
        <main className='exchange grid'>
          <section className='exchange__section--left grid'>
            <Markets />
            <Balance />
            <Order />
          </section>

          <section className='exchange__section--right grid'>
            <PriceChart />
            {/* Transactions */}
            {/* Trades */}
            <OrderBook />
          </section>
        </main>
      )}

      {/* Alert */}
    </div>
  );
}

export default App;
