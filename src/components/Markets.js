import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import config from '../config.json';
import { loadTokens } from '../store/interactions';

const Markets = () => {
  const [loading, setLoading] = useState(false);
  const chainId = useSelector((state) => state.provider.chainId);
  const provider = useSelector((state) => state.provider.connection);
  const dispatch = useDispatch();

  const marketHandler = async (e) => {
    setLoading(true);

    // Simulate a delay (e.g., 1 second) to show the loading animation
    setTimeout(async () => {
      try {
        await loadTokens(provider, e.target.value.split(','), dispatch);
      } catch (error) {
        console.error('Error loading tokens:', error);
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  useEffect(() => {
    // Check Web3 provider connectivity
    const checkProviderConnection = async () => {
      try {
        // Perform a simple Web3 provider connectivity check
        const accounts = await provider.listAccounts();

        // If accounts are retrieved successfully, the provider is connected
        console.log('Web3 provider is connected:', accounts);
      } catch (error) {
        // Handle the error if the provider is not connected
        console.error('Web3 provider is not connected:', error);
      }
    };

    // Call the function to check Web3 provider connectivity
    checkProviderConnection();

    // Additional setup or side effects can be added here
    // This empty dependency array means this effect runs once on mount
  }, [provider]); // Include provider in the dependency array

  return (
    <div className='component exchange__markets'>
      <div className='component__header'>
        <h2>Select Market</h2>
      </div>

      {loading && <div>Loading...</div>}

      {config[chainId] && (
        <select name='markets' id='markets' onChange={(e) => marketHandler(e)}>
          <option value={`${config[chainId].RH.address},${config[chainId].mETH.address}`}>RH / mETH</option>
          <option value={`${config[chainId].RH.address},${config[chainId].mDAI.address}`}>RH / mDAI</option>
        </select>
      )}

      <hr />
    </div>
  );
};

export default Markets;
