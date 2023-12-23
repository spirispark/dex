import { useSelector, useDispatch } from 'react-redux'
import { useRef, useState } from 'react'
import { myOpenOrdersSelector, myFilledOrdersSelector } from '../store/selectors'
import { cancelOrder } from '../store/interactions'
import sort from '../assets/sort.svg'
import Banner from './Banner'

const MyTransactions = () => {

  const [showMyOrders, setShowMyOrders] = useState(true)
  const provider = useSelector(state => state.provider.connection)
  const exchange = useSelector(state => state.exchange.contract)
  const symbols = useSelector(state => state.tokens.symbols)
  const myOpenOrders = useSelector(myOpenOrdersSelector)
  const myFilledOrders = useSelector(myFilledOrdersSelector)

  const dispatch = useDispatch()

  const tradeRef = useRef(null)
  const orderRef = useRef(null)

  const tabHandler = (e) => {

    if(e.target.className === orderRef.current.className) {
      e.target.className = 'tab tab--active'
      tradeRef.current.className = 'tab'
      setShowMyOrders(true)
    } 
    
    else {
      e.target.className = 'tab tab--active'
      orderRef.current.className = 'tab'
      setShowMyOrders(false)
    }
  }

  const cancelHandler = async(order) => {
    
    await cancelOrder(provider, exchange, order, dispatch)
  }

  return (
    
    <div className="component exchange__transactions">
      
      {showMyOrders ? 
       
       (
        <div>
        
        <div className='component__header flex-between'>
          
          <h2>My Orders</h2>

          <div className='tabs'>
            <button onClick={tabHandler} ref={orderRef} className='tab tab--active'>Orders</button>
            <button onClick={tabHandler} ref={tradeRef} className='tab'>Trades</button>
          </div>

        </div>

        {!myOpenOrders || myOpenOrders.length === 0 ? 
        
        (
          <Banner text='No Open Orders'/>
        ) 
        
        : 
        
        (
          <table>
            
            <thead>
              
              <tr>
                <th>{symbols && symbols[0]}<img src={sort} alt="Sort" /></th>
                <th>{symbols && symbols[0]}/{symbols && symbols[1]}<img src={sort} alt="Sort" /></th>
                <th></th>
              </tr>

            </thead>
            
            <tbody>
              
             {myOpenOrders && myOpenOrders.map((order, index) => {
               
              return(
                
                <tr key={index}>
                 <td style={{ color: `${order.orderTypeClass}` }}>{order.token0Amount}</td>
                 <td>{order.tokenPrice}</td>
                 <td><button className='button--sm' onClick={() => cancelHandler(order)}>Cancel</button></td>
                </tr>
              )

             })}

            </tbody>
          
          </table>
        )}

        </div>
       )
      
       :
      
       (
        <div>
        
        <div className='component__header flex-between'>
          
          <h2>My Transactions</h2>

          <div className='tabs'>
            <button onClick={tabHandler} ref={orderRef} className='tab tab--active'>Orders</button>
            <button onClick={tabHandler} ref={tradeRef} className='tab'>Trades</button>
          </div>

        </div>

        {!myFilledOrders || myFilledOrders.length === 0 ?
        
        (
          <Banner text='No Transactions'/>
        ) 
        
        : 
        
        (
          <table>
          
           <thead>
              
              <tr>
                <th>Time<img src={sort} alt="Sort" /></th>
                <th>{symbols && symbols[0]}<img src={sort} alt="Sort" /></th>
                <th>{symbols && symbols[0]}/{symbols && symbols[1]}<img src={sort} alt="Sort" /></th>
              </tr>

           </thead>
          
            <tbody>
              
              {myFilledOrders && myFilledOrders.map((order, index) => {
               
               return(
                
                 <tr key={index}>
                  <td>{order.formattedTimestamp}</td>
                  <td style={{ color: `${order.orderTypeClass}` }}>{order.orderTypeSign}{order.token0Amount}</td>
                  <td>{order.tokenPrice}</td>
                 </tr>
               )

             })}
           </tbody>
           
         </table>
        )
        }

        </div>
       )

      }

    </div>
  )
}

export default MyTransactions
