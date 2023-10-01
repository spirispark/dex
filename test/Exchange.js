const { ethers } = require('hardhat')
const { expect } = require('chai')

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Exchange', () => {
  let accounts, deployer, feeAccount, user1, Token, token1, Exchange, exchange, transaction, result
  const feePercent = 10
  let amount = tokens(100)

  beforeEach(async() => {
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    feeAccount = accounts[1]
    user1 = accounts[2]

    Token = await ethers.getContractFactory('Token')
    token1 = await Token.deploy('RH Token', 'RH', 1000000)

    Exchange = await ethers.getContractFactory('Exchange')
    exchange = await Exchange.deploy(feeAccount.address, feePercent)

    transaction = await token1.connect(deployer).transfer(user1.address, amount)
    result = await transaction.wait()
  })
  
  describe('Deployment', () => {
    it('tracks the fee account', async() => {
      expect(await exchange.feeAccount()).to.equal(feeAccount.address)
    })

    it('tracks the fee percent', async() => {
      expect(await exchange.feePercent()).to.equal(feePercent)
    })
  })

  describe('Depositing Tokens', () => {    
    describe('Success', () => {
      beforeEach(async() => {
        transaction = await token1.connect(user1).approve(exchange.address, amount)
        result = await transaction.wait()
        
        transaction = await exchange.connect(user1).depositToken(token1.address, amount)
        result = await transaction.wait()
      })

      it('tracks the token deposit', async() => {
        expect(await token1.balanceOf(exchange.address)).to.equal(amount)
        expect(await token1.balanceOf(user1.address)).to.equal(0)

        expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount)
        expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
      })

      it('emits a Deposit event', () => {
        expect(result.events[1].event).to.equal('Deposit')
        expect(result.events[1].args.token).to.equal(token1.address)
        expect(result.events[1].args.user).to.equal(user1.address)
        expect(result.events[1].args.value).to.equal(amount)
        expect(result.events[1].args.balance).to.equal(amount)
      })
    })

    describe('Failure', () => {
      it('fails when no Token is approved', async() => {
        await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted
      })
    })
  })

  describe('Withdrawing Tokens', () => {
    describe('Success', () => {
      beforeEach(async() => {
        transaction = await token1.connect(user1).approve(exchange.address, amount)
        result = await transaction.wait()
        
        transaction = await exchange.connect(user1).depositToken(token1.address, amount)
        result = await transaction.wait()

        transaction = await exchange.connect(user1).withdrawToken(token1.address, amount)
        result = await transaction.wait()
      })

      it('tracks the token withdrawal', async() => {
        expect(await token1.balanceOf(exchange.address)).to.equal(0)
        expect(await token1.balanceOf(user1.address)).to.equal(amount)

        expect(await exchange.tokens(token1.address, user1.address)).to.equal(0)
        expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(0)
      })

      it('emits a Withdraw event', () => {
        expect(result.events[1].event).to.equal('Withdraw')
        expect(result.events[1].args.token).to.equal(token1.address)
        expect(result.events[1].args.user).to.equal(user1.address)
        expect(result.events[1].args.value).to.equal(amount)
        expect(result.events[1].args.balance).to.equal(0)
      })
    })

    describe('Failure', () => {
      it('fails when user has insufficient balance', async() => {
        await expect(exchange.connect(user1).withdrawToken(token1.address, amount)).to.be.reverted
      })
    })
  })

  describe('Checking Balances', () => {
    beforeEach(async() => {
      transaction = await token1.connect(user1).approve(exchange.address, amount)
      result = await transaction.wait()
      
      transaction = await exchange.connect(user1).depositToken(token1.address, amount)
      result = await transaction.wait()
    })

    it('tracks user balances', async() => {
      expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
    })
  })
})
