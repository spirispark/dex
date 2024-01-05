import { useSelector, useDispatch } from 'react-redux'
import Blockies from 'react-blockies'
import logo from '../assets/logo.png'
import eth from '../assets/eth.svg'
import { loadAccount } from '../store/interactions'
import config from '../config.json'

const Navbar = () => {

    const balance = useSelector(state => state.provider.balance)
    const account = useSelector(state => state.provider.account)
    const provider = useSelector(state => state.provider.connection)
    const chainId = useSelector(state => state.provider.chainId)
    const dispatch = useDispatch()

    const networkHandler = async(e) => {
        
        await window.ethereum.request({
            
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: e.target.value }]

        })
    }

    const connectHandler = async() => {
        
        await loadAccount(provider, dispatch)
    }
    
    return(
    
    <div className='exchange__header grid'>
        
        <div className='exchange__header--brand flex'>
            
            <img src={logo} className='logo' alt='RH logo'></img>
            <h1>RH Token Exchange</h1>
        
        </div>

        <div className='exchange__header--networks flex'>
            
            <img src={eth} className='eth' alt='ETH logo'></img>

            {
                chainId && 
                (
                <select name='networks' id='networks' value={config[chainId]? `0x${chainId.toString(16)}` : `0`} onChange={(e) => networkHandler(e)}>
                    
                    <option value='0' disabled>Select Network</option>
                    {/* <option value='0x7a69'>Localhost</option> */}
                    <option value='0xaa36a7'>Ethereum Sepolia</option>
                    <option value='0x13881'>Polygon Mumbai</option>

                </select>
                )
            }

        </div>

        <div className='exchange__header--account flex'>
            
            {
                balance?
                (<p><small>My Balance</small>{Number(balance).toFixed(4)}</p>)
                :
                (<p><small>My Balance</small>0 ETH</p>)
            }
            
            {
                account?
                (
                    <a 
                    href={config[chainId]? `${config[chainId].explorerURL}/address/${account}` : `#`}
                    target='_blank' 
                    rel='noreferrer'
                    >
                     {account.slice(0,5) + '...' + account.slice(38,42)}
                     <Blockies 
                        seed={account}
                        size={10}
                        scale={3}
                        color='#2187D0'
                        bgColor='#F1F2F0'
                        spotColor='#767F92'
                        className='identicon'
                     />
                    </a>
                )
                :
                (<button className='button' onClick={() => connectHandler()}>Connect</button>)
            }

        </div>

    </div>

    )
}

export default Navbar
