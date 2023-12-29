import { useSelector } from "react-redux"
import { useRef, useEffect } from "react"
import { myEventsSelector } from "../store/selectors"
import config from "../config.json"

const Alert = () => {
    
  const alertRef = useRef(null)
  const account = useSelector(state => state.provider.account)
  const network = useSelector(state => state.provider.chainId)
  const isPending = useSelector(state => state.exchange.transaction.isPending)
  const isSuccessful = useSelector(state => state.exchange.transaction.isSuccessful)
  const events = useSelector(myEventsSelector)

  const removeHandler = async (e) => {
    
    alertRef.current.className = 'alert--remove'
  }

  useEffect(() => {

    if(isPending && account) {
      alertRef.current.className = 'alert'
    }
  }, [isPending, account])
    
  return (
    
    <div>
        
      {isPending ?
        
       (
        <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
          
          <h1>Transaction Pending...</h1>
        
        </div>
       )
        
       :

       isSuccessful && events[0]?
        
       (
        <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
          
          <h1>Transaction Successful</h1>
          
          <a href={config[network].explorerURL ? `${config[network].explorerURL}/tx/${events[0].transactionHash}` : '#'}
          target='_blank'
          rel='noreferrer'
          >
          {events[0].transactionHash.slice(0, 6)+'...'+events[0].transactionHash.slice(60, 66)}
          </a>
        
        </div>
       )

       :

       (
        <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
          
          <h1>Transaction will Fail</h1>
        
        </div>
       )
      
      }
    
    </div>
  )
}

export default Alert
