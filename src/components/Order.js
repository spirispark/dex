import { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { makeBuyOrder, makeSellOrder } from '../store/interactions'

const Order = () => {

    const provider = useSelector(state => state.provider.connection)
    const exchange = useSelector(state => state.exchange.contract)
    const tokens = useSelector(state => state.tokens.contracts)

    const dispatch = useDispatch()
    
    const [isBuy, setIsBuy] = useState(true)
    const [amount, setAmount] = useState(0)
    const [price, setPrice] = useState(0)
    
    const buyRef = useRef(null)
    const sellRef = useRef(null)

    const tabHandler = (e) => {

        if (e.target.className === buyRef.current.className) {
            buyRef.current.className = 'tab tab--active'
            sellRef.current.className = 'tab'
            setIsBuy(true)
        }

        else {
            buyRef.current.className = 'tab'
            sellRef.current.className = 'tab tab--active'
            setIsBuy(false)
        }
    }

    const buyHandler = (e) => {
        e.preventDefault()
        makeBuyOrder(provider, exchange, tokens, { amount, price }, dispatch)
        setAmount(0)
        setPrice(0)
    }

    const sellHandler = (e) => {
        e.preventDefault()
        makeSellOrder(provider, exchange, tokens, { amount, price }, dispatch)
        setAmount(0)
        setPrice(0)
    }

    return (
    
    <div className="component exchange__orders">
        
        <div className='component__header flex-between'>
            
            <h2>New Order</h2>
            
            <div className='tabs'>
                
                <button onClick={tabHandler} ref={buyRef} className='tab tab--active'>Buy</button>
                <button onClick={tabHandler} ref={sellRef} className='tab'>Sell</button>

            </div>

        </div>
        
        <form onSubmit={isBuy ? (e) => buyHandler(e) : (e) => sellHandler(e)}>
            
            <label htmlFor='amount'>{isBuy ? 'Buy Amount' : 'Sell Amount'}</label>

            <input 
             type="text"
             id='amount'
             placeholder='0.0000'
             onChange={(e) => setAmount(e.target.value)}
             value={amount === 0 ? '' : amount}
            />

            <label htmlFor='price'>{isBuy ? 'Buy Price' : 'Sell Price'}</label>
            
            <input 
             type="text"
             id='price'
             placeholder='0.0000'
             onChange={(e) => setPrice(e.target.value)}
             value={price === 0 ? '' : price}
            />
            
            <button className='button button--filled' type='submit'>
                
                <span>{isBuy? 'Buy Order' : 'Sell Order'}</span>
                
            </button>

        </form>

    </div>
    );
}

export default Order;
