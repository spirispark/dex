const config = require('../src/config.json')

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(),'ether')
}

const wait = (seconds) => {
    const milliseconds = seconds * 1000
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function seeding() {
    let accounts, sender, receiver, transaction, result, user1, user2

    console.log(`Seeding exchange..\n`)
    
    // Fetch accounts from wallet - these are unlocked
    accounts = await ethers.getSigners()

    // Fetch network
    const { chainId } = await ethers.provider.getNetwork()
    console.log(`Using chainId: ${chainId}\n`)

    // Fetch the deployed tokens
    const RH = await ethers.getContractAt('Token', config[chainId].RH.address)
    console.log(`RH Token fetched at ${RH.address}`)

    const mETH = await ethers.getContractAt('Token', config[chainId].mETH.address)
    console.log(`mETH Token fetched at ${mETH.address}`)

    const mDAI = await ethers.getContractAt('Token', config[chainId].mDAI.address)
    console.log(`mDAI Token fetched at ${mDAI.address}`)

    // Fetch the deployed exchange
    const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address)
    console.log(`Exchange fetched at ${exchange.address}\n`)

    // Give tokens to account 1
    sender = accounts[0]
    receiver = accounts[1]

    // Sender transfers 10,000 mETH
    transaction = await mETH.connect(sender).transfer(receiver.address, tokens(10000))
    await transaction.wait()
    console.log(`Transferred ${tokens(10000)} mETH tokens from ${sender.address} to ${receiver.address}\n`)

    // Setup exchange users
    user1 = accounts[0]
    user2 = accounts[1]

    // User 1 approves 10,000 RH
    transaction = await RH.connect(user1).approve(exchange.address, tokens(10000))
    await transaction.wait()
    console.log(`Approved ${tokens(10000)} RH tokens from ${user1.address}`)

    // User 1 deposits 10,000 RH
    transaction = await exchange.connect(user1).depositToken(RH.address, tokens(10000))
    await transaction.wait()
    console.log(`Deposited ${tokens(10000)} RH tokens from ${user1.address}\n`)

    // User 2 approves 10,000 mETH
    transaction = await mETH.connect(user2).approve(exchange.address, tokens(10000))
    await transaction.wait()
    console.log(`Approved ${tokens(10000)} mETH tokens from ${user2.address}`)

    // User 2 deposits 10,000 mETH
    transaction = await exchange.connect(user2).depositToken(mETH.address, tokens(10000))
    await transaction.wait()
    console.log(`Deposited ${tokens(10000)} mETH tokens from ${user2.address}\n`)

    
    //// SEED CANCELLED ORDERS

    // User 1 makes order to get tokens
    let orderId
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), RH.address, tokens(5))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)

    // User 1 cancels order
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user1).cancelOrder(orderId)
    result = await transaction.wait()
    console.log(`Cancelled order from ${user1.address}\n`)

    // Wait 1 second
    await wait(1)


    //// SEED FILLED ORDERS

    // User 1 makes an order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), RH.address, tokens(10))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)

    // User 2 fills order
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user2.address}\n`)

    // Wait 1 second
    await wait(1)

    // User 1 makes another order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(50), RH.address, tokens(15))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)

    // User 2 fills another order
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user2.address}\n`)

    // Wait 1 second
    await wait(1)

    // User 1 makes final order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(200), RH.address, tokens(20))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)

    // User 2 fills final order
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user2.address}\n`)

    // Wait 1 second
    await wait(1)


    //// SEED OPEN ORDERS

    // User 1 makes 10 orders
    for (let i = 1; i <= 10; i++) {
        transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(10 * i), RH.address, tokens(10))
        await transaction.wait()
        console.log(`Made order from ${user1.address}`)
        
        // Wait 1 second
        await wait(1)
    }

    // User 2 makes 10 orders
    for (let i = 1; i <= 10; i++) {
        transaction = await exchange.connect(user2).makeOrder(RH.address, tokens(10), mETH.address, tokens(10 * i))
        await transaction.wait()
        console.log(`Made order from ${user2.address}`)
        
        // Wait 1 second
        await wait(1)
    }
}
    
seeding()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
