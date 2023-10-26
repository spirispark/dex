import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState, useRef } from 'react'
import { loadBalances, transferTokens } from '../store/interactions'
import rh from '../assets/rh.svg'
import eth from '../assets/eth.svg'

const Balance = () => {

    const exchange = useSelector(state => state.exchange.contract)
    const exchangeBalances = useSelector(state => state.exchange.balances)
    const transferInProgress = useSelector(state => state.exchange.transferInProgress)
    
    const tokens = useSelector(state => state.tokens.contracts)
    const symbols = useSelector(state => state.tokens.symbols)
    const tokenBalances = useSelector(state => state.tokens.balances)
    
    const provider = useSelector(state => state.provider.connection)
    const account = useSelector(state => state.provider.account)
    
    const dispatch = useDispatch()

    const [token1TransferAmount, setToken1TransferAmount] = useState(0)
    const [token2TransferAmount, setToken2TransferAmount] = useState(0)
    const [isDeposit, setIsDeposit] = useState(true)

    const depositRef = useRef(null)
    const withdrawRef = useRef(null)

    useEffect(() => {
        if(exchange && tokens[0] && tokens[1] && account) {
            loadBalances(exchange, tokens, account, dispatch)
        }
    }, [exchange, tokens, account, dispatch, transferInProgress])

    const tabHandler = (e) => {

        if (e.target.className === depositRef.current.className) {
            depositRef.current.className = 'tab tab--active'
            withdrawRef.current.className = 'tab'
            setIsDeposit(true)
        }

        else {
            depositRef.current.className = 'tab'
            withdrawRef.current.className = 'tab tab--active'
            setIsDeposit(false)
        }
    }

    const amountHandler = (e, token) => {
        
        if(token.address === tokens[0].address) {
            setToken1TransferAmount(e.target.value)
        }

        else {
            setToken2TransferAmount(e.target.value)
        }
    }

    const depositHandler = async(e, token) => {
        
        e.preventDefault()

        if(token.address === tokens[0].address) {
            transferTokens(provider, exchange, 'Deposit', token, token1TransferAmount, dispatch)
            setToken1TransferAmount(0)
        }

        else {
            transferTokens(provider, exchange, 'Deposit', token, token2TransferAmount, dispatch)
            setToken2TransferAmount(0)
        }
    }

    const withdrawHandler = async(e, token) => {
        
        e.preventDefault()

        if(token.address === tokens[0].address) {
            transferTokens(provider, exchange, 'Withdraw', token, token1TransferAmount, dispatch)
            setToken1TransferAmount(0)
        }

        else {
            transferTokens(provider, exchange, 'Withdraw', token, token2TransferAmount, dispatch)
            setToken2TransferAmount(0)
        }
    }

    return (
    
    <div className='component exchange__transfers'>
        
        <div className='component__header flex-between'>
            
            <h2>Balance</h2>
            
            <div className='tabs'>
                
                <button onClick={tabHandler} ref={depositRef} className='tab tab--active'>Deposit</button>
                <button onClick={tabHandler} ref={withdrawRef} className='tab'>Withdraw</button>

            </div>

        </div>
  
        {/* Deposit/Withdraw Component 1 (RH) */}
  
        <div className='exchange__transfers--form'>
            
            <div className='flex-between'>

                <p><small>Token</small><br /><img src={rh} alt='Token logo' />{symbols && symbols[0]}</p>
                <p><small>Wallet</small><br />{tokenBalances && tokenBalances[0]}</p>
                <p><small>Exchange</small><br />{exchangeBalances && exchangeBalances[0]}</p>

            </div>

            <form onSubmit={isDeposit ? (e) => depositHandler(e, tokens[0]) : (e) => withdrawHandler(e, tokens[0])}>
                
                <label htmlFor='token0'><br />{symbols && symbols[0]} Amount</label>

                <input 
                 type='text'
                 id='token0'
                 placeholder='0.0000'
                 onChange={(e) => amountHandler(e, tokens[0])}
                 value={token1TransferAmount === 0 ? '' : token1TransferAmount}
                />

                <button className='button' type='submit'>

                    <span>{isDeposit? 'Deposit' : 'Withdraw'}</span>

                </button>

            </form>

        </div>

        <hr />

        {/* Deposit/Withdraw Component 2 (mETH) */}
  
        <div className='exchange__transfers--form'>
            
            <div className='flex-between'>

                <p><small>Token</small><br /><img src={eth} alt='Token logo' />{symbols && symbols[1]}</p>
                <p><small>Wallet</small><br />{tokenBalances && tokenBalances[1]}</p>
                <p><small>Exchange</small><br />{exchangeBalances && exchangeBalances[1]}</p>

            </div>

            <form onSubmit={isDeposit ? (e) => depositHandler(e, tokens[1]) : (e) => withdrawHandler(e, tokens[1])}>
                
                <label htmlFor='token1'><br />{symbols && symbols[1]} Amount</label>

                <input 
                 type='text'
                 id='token1'
                 placeholder='0.0000'
                 onChange={(e) => amountHandler(e, tokens[1])}
                 value={token2TransferAmount === 0 ? '' : token2TransferAmount}
                />

                <button className='button' type='submit'>

                    <span>{isDeposit? 'Deposit' : 'Withdraw'}</span>

                </button>

            </form>

        </div>

        <hr />

    </div>
    
    )
  
}

export default Balance
