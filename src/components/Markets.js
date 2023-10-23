import { useSelector, useDispatch } from 'react-redux'
import config from '../config.json'
import { loadTokens } from '../store/interactions'

const Markets = () => {
    
    const chainId = useSelector(state => state.provider.chainId)
    const provider = useSelector(state => state.provider.connection)
    const dispatch = useDispatch()

    const marketHandler = async(e) => {
        
        loadTokens(provider, e.target.value.split(','), dispatch)
    }

    return(
    
    <div className='component exchange__markets'>
        
        <div className='component__header'>
            <h2>Select Market</h2>
        </div>

        {
            config[chainId] &&
            (
                <select name='markets' id='markets' onChange={(e) => marketHandler(e)}>
                    <option value={`${config[chainId].RH.address},${config[chainId].mETH.address}`}>RH / mETH</option>
                    <option value={`${config[chainId].RH.address},${config[chainId].mDAI.address}`}>RH / mDAI</option>
                </select>
            )
        }

        <hr />

    </div>
    )
}

export default Markets
