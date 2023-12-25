import { ethers } from "ethers"
import TOKEN_ABI from '../abis/Token.json'
import EXCHANGE_ABI from '../abis/Exchange.json'

export const subscribeToEvents = (exchange, dispatch) => {
    
    exchange.on('Deposit', (token, user, value, balance, event) => {
        dispatch({ type: 'TRANSFER_SUCCESS', event })
    })

    exchange.on('Withdraw', (token, user, value, balance, event) => {
        dispatch({ type: 'TRANSFER_SUCCESS', event })
    })

    exchange.on('Order', (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {
        const order = event.args
        dispatch({ type: 'ORDER_SUCCESS', order, event })
    })

    exchange.on('Cancel', (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {
        const order = event.args
        dispatch({ type: 'ORDER_CANCEL_SUCCESS', order, event })
    })

    exchange.on('Trade', (id, user, tokenGet, amountGet, tokenGive, amountGive, creator, timestamp, event) => {
        const order = event.args
        dispatch({ type: 'ORDER_FILL_SUCCESS', order, event })
    })
}

export const loadAccount = async(provider, dispatch) => {
    
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    dispatch({ type: 'ACCOUNT_LOADED', account })

    let balance = await provider.getBalance(account)
    balance = ethers.utils.formatEther(balance)
    dispatch({ type: 'ETHER_BALANCE_LOADED', balance})

    return account
}

export const loadProvider = (dispatch) => {
    
    const connection = new ethers.providers.Web3Provider(window.ethereum)
    dispatch({ type: 'PROVIDER_LOADED', connection })
    
    return connection
}

export const loadNetwork = async(provider, dispatch) => {
    
    const { chainId } = await provider.getNetwork()
    dispatch({ type: 'NETWORK_LOADED', chainId })
    
    return chainId
}

export const loadTokens = async(provider, addresses, dispatch) => {

    let token, symbol
    
    token = new ethers.Contract(addresses[0], TOKEN_ABI, provider )
    symbol = await token.symbol()
    dispatch({ type: 'TOKEN_1_LOADED', token, symbol })

    token = new ethers.Contract(addresses[1], TOKEN_ABI, provider )
    symbol = await token.symbol()
    dispatch({ type: 'TOKEN_2_LOADED', token, symbol })

    return token
}

export const loadExchange = (provider, address, dispatch) => {
    
    const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider )
    dispatch({ type: 'EXCHANGE_LOADED', exchange })

    return exchange
}

export const loadBalances = async(exchange, tokens, account, dispatch) => {
    
    let balance
    
    balance = await tokens[0].balanceOf(account)
    balance = ethers.utils.formatUnits(balance.toString(), 'ether')
    dispatch({ type: 'TOKEN_1_WALLET_BALANCE_LOADED', balance })

    balance = await tokens[1].balanceOf(account)
    balance = ethers.utils.formatUnits(balance.toString(), 'ether')
    dispatch({ type: 'TOKEN_2_WALLET_BALANCE_LOADED', balance })

    balance = await exchange.balanceOf(tokens[0].address, account)
    balance = ethers.utils.formatUnits(balance.toString(), 'ether')
    dispatch({ type: 'TOKEN_1_EXCHANGE_BALANCE_LOADED', balance })

    balance = await exchange.balanceOf(tokens[1].address, account)
    balance = ethers.utils.formatUnits(balance.toString(), 'ether')
    dispatch({ type: 'TOKEN_2_EXCHANGE_BALANCE_LOADED', balance })
}

export const loadAllOrders = async(provider, exchange, dispatch) => {

    const block = await provider.getBlockNumber()

    const cancelStream = await exchange.queryFilter('Cancel', 0, block)
    const cancelledOrders = cancelStream.map(event => event.args)
    
    dispatch({ type: 'CANCELLED_ORDERS_LOADED', cancelledOrders })

    const tradeStream = await exchange.queryFilter('Trade', 0, block)
    const filledOrders = tradeStream.map(event => event.args)
    
    dispatch({ type: 'FILLED_ORDERS_LOADED', filledOrders })

    const orderStream = await exchange.queryFilter('Order', 0, block)
    const allOrders = orderStream.map(event => event.args)
    
    dispatch({ type: 'ALL_ORDERS_LOADED', allOrders })
}

export const transferTokens = async(provider, exchange, transferType, token, amount, dispatch) => {
    
    dispatch({ type: 'TRANSFER_REQUEST' })

    let transaction

    const signer = await provider.getSigner()
    const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 'ether')

    try {
    
        if (transferType === 'Deposit') {
            
            transaction = await token.connect(signer).approve(exchange.address, amountToTransfer)
            await transaction.wait()
            
            transaction = await exchange.connect(signer).depositToken(token.address, amountToTransfer)
        }

        else {

            transaction = await exchange.connect(signer).withdrawToken(token.address, amountToTransfer)
        }
        
        await transaction.wait()
    } 
    
    catch(error) {

        dispatch({ type: 'TRANSFER_FAIL' })
    }
}

export const makeBuyOrder = async(provider, exchange, tokens, order, dispatch) => {

    dispatch({ type: 'ORDER_REQUEST' })

    const tokenGet = tokens[0].address
    const amountGet = ethers.utils.parseUnits(order.amount.toString(), 'ether')
    const tokenGive = tokens[1].address
    const amountGive = ethers.utils.parseUnits((order.amount * order.price).toString(), 'ether')
    
    const signer = await provider.getSigner()

    try {
        const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive)
        await transaction.wait()
    }

    catch(error) {
        dispatch({ type: 'ORDER_FAIL' })
    }
}

export const makeSellOrder = async(provider, exchange, tokens, order, dispatch) => {

    dispatch({ type: 'ORDER_REQUEST' })

    const tokenGet = tokens[1].address
    const amountGet = ethers.utils.parseUnits((order.amount * order.price).toString(), 'ether')
    const tokenGive = tokens[0].address
    const amountGive = ethers.utils.parseUnits(order.amount.toString(), 'ether')
    
    const signer = await provider.getSigner()

    try {
        const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive)
        await transaction.wait()
    }

    catch(error) {
        dispatch({ type: 'ORDER_FAIL' })
    }
}

export const cancelOrder = async(provider, exchange, order, dispatch) => {

    dispatch({ type: 'ORDER_CANCEL_REQUEST' })

    const signer = await provider.getSigner()

    try {
        const transaction = await exchange.connect(signer).cancelOrder(order.id)
        await transaction.wait()
    }

    catch(error) {
        dispatch({ type: 'ORDER_CANCEL_FAIL' })
    }
}

export const fillOrder = async(provider, exchange, order, dispatch) => {

    dispatch({ type: 'ORDER_FILL_REQUEST' })

    const signer = await provider.getSigner()

    try {
        const transaction = await exchange.connect(signer).fillOrder(order.id)
        await transaction.wait()
    }

    catch(error) {
        dispatch({ type: 'ORDER_FILL_FAIL' })
    }
}
