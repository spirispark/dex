const { expect } = require('chai')

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Exchange', () => {
  let accounts, deployer, feeAccount, user1, user2, Token, token1, token2, Exchange, exchange, transaction, result
  const feePercent = 10

  beforeEach(async() => {
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    feeAccount = accounts[1]
    user1 = accounts[2]
    user2 = accounts[3]

    Token = await ethers.getContractFactory('Token')
    token1 = await Token.deploy('RH Token', 'RH', 1000000)
    token2 = await Token.deploy('Mock Dai', 'mDAI', 1000000)

    Exchange = await ethers.getContractFactory('Exchange')
    exchange = await Exchange.deploy(feeAccount.address, feePercent)

    transaction = await token1.connect(deployer).transfer(user1.address, tokens(100))
    result = await transaction.wait()

    transaction = await token2.connect(deployer).transfer(user2.address, tokens(100))
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
        transaction = await token1.connect(user1).approve(exchange.address, tokens(100))
        result = await transaction.wait()
        
        transaction = await exchange.connect(user1).depositToken(token1.address, tokens(100))
        result = await transaction.wait()
      })

      it('tracks the token deposit', async() => {
        expect(await token1.balanceOf(exchange.address)).to.equal(tokens(100))
        expect(await token1.balanceOf(user1.address)).to.equal(0)

        expect(await exchange.tokens(token1.address, user1.address)).to.equal(tokens(100))
        expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(tokens(100))
      })

      it('emits a Deposit event', () => {
        expect(result.events[1].event).to.equal('Deposit')
        expect(result.events[1].args.token).to.equal(token1.address)
        expect(result.events[1].args.user).to.equal(user1.address)
        expect(result.events[1].args.value).to.equal(tokens(100))
        expect(result.events[1].args.balance).to.equal(tokens(100))
      })
    })

    describe('Failure', () => {
      it('fails when no Token is approved', async() => {
        await expect(exchange.connect(user1).depositToken(token1.address, tokens(100))).to.be.reverted
      })
    })
  })

  describe('Withdrawing Tokens', () => {
    describe('Success', () => {
      beforeEach(async() => {
        transaction = await token1.connect(user1).approve(exchange.address, tokens(100))
        result = await transaction.wait()
        
        transaction = await exchange.connect(user1).depositToken(token1.address, tokens(100))
        result = await transaction.wait()

        transaction = await exchange.connect(user1).withdrawToken(token1.address, tokens(100))
        result = await transaction.wait()
      })

      it('tracks the token withdrawal', async() => {
        expect(await token1.balanceOf(exchange.address)).to.equal(0)
        expect(await token1.balanceOf(user1.address)).to.equal(tokens(100))

        expect(await exchange.tokens(token1.address, user1.address)).to.equal(0)
        expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(0)
      })

      it('emits a Withdraw event', () => {
        expect(result.events[1].event).to.equal('Withdraw')
        expect(result.events[1].args.token).to.equal(token1.address)
        expect(result.events[1].args.user).to.equal(user1.address)
        expect(result.events[1].args.value).to.equal(tokens(100))
        expect(result.events[1].args.balance).to.equal(0)
      })
    })

    describe('Failure', () => {
      it('rejects insufficient balances', async() => {
        await expect(exchange.connect(user1).withdrawToken(token1.address, tokens(100))).to.be.reverted
      })
    })
  })

  describe('Checking Balances', () => {
    beforeEach(async() => {
      transaction = await token1.connect(user1).approve(exchange.address, tokens(100))
      result = await transaction.wait()
      
      transaction = await exchange.connect(user1).depositToken(token1.address, tokens(100))
      result = await transaction.wait()
    })

    it('tracks user balances', async() => {
      expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(tokens(100))
    })
  })

  describe('Making Orders', () => {
    describe('Success', () => {
      beforeEach(async() => {
        transaction = await token1.connect(user1).approve(exchange.address, tokens(100))
        result = await transaction.wait()
        
        transaction = await exchange.connect(user1).depositToken(token1.address, tokens(100))
        result = await transaction.wait()
        
        transaction = await exchange.connect(user1).makeOrder(token2.address, tokens(1), token1.address, tokens(1))
        result = await transaction.wait()
      })

      it('tracks newly created orders', async() => {
        expect(await exchange.orderCount()).to.equal(1)
      })

      it('emits an Order event', () => {
        expect(result.events[0].event).to.equal('Order')
        expect(result.events[0].args.id).to.equal(1)
        expect(result.events[0].args.user).to.equal(user1.address)
        expect(result.events[0].args.tokenGet).to.equal(token2.address)
        expect(result.events[0].args.amountGet).to.equal(tokens(1))
        expect(result.events[0].args.tokenGive).to.equal(token1.address)
        expect(result.events[0].args.amountGive).to.equal(tokens(1))
        expect(result.events[0].args.timestamp).to.at.least(1)
      })
    })

    describe('Failure', () => {
      it('rejects insufficient balances', async() => {
        await expect(exchange.connect(user1).makeOrder(token2.address, tokens(1), token1.address, tokens(1))).to.be.reverted
      })
    })
  })

  describe('Cancelling Orders', () => {

    beforeEach(async() => {
      transaction = await token1.connect(user1).approve(exchange.address, tokens(100))
      result = await transaction.wait()
      
      transaction = await exchange.connect(user1).depositToken(token1.address, tokens(100))
      result = await transaction.wait()

      transaction = await exchange.connect(user1).makeOrder(token2.address, tokens(1), token1.address, tokens(1))
      result = await transaction.wait()
    })

    describe('Success', () => {
      beforeEach(async() => {
        transaction = await exchange.connect(user1).cancelOrder(1)
        result = await transaction.wait()
      })

      it('updates canceled orders', async() => {
        expect(await exchange.orderCancelled(1)).to.equal(true)
      })

      it('emits a Cancel event', () => {
        expect(result.events[0].event).to.equal('Cancel')
        expect(result.events[0].args.id).to.equal(1)
        expect(result.events[0].args.user).to.equal(user1.address)
        expect(result.events[0].args.tokenGet).to.equal(token2.address)
        expect(result.events[0].args.amountGet).to.equal(tokens(1))
        expect(result.events[0].args.tokenGive).to.equal(token1.address)
        expect(result.events[0].args.amountGive).to.equal(tokens(1))
        expect(result.events[0].args.timestamp).to.at.least(1)
      })
    })

    describe('Failure', () => {
      it('rejects invalid order ids', async() => {
        await expect(exchange.connect(user1).cancelOrder(0)).to.be.reverted
        await expect(exchange.connect(user1).cancelOrder(2)).to.be.reverted
      })

      it('rejects unauthorized cancelations', async() => {
        await expect(exchange.connect(user2).cancelOrder(1)).to.be.reverted
      })
    })
  })

  describe('Filling Orders', () => {

    beforeEach(async() => {
      transaction = await token1.connect(user1).approve(exchange.address, tokens(100))
      result = await transaction.wait()
      
      transaction = await exchange.connect(user1).depositToken(token1.address, tokens(100))
      result = await transaction.wait()

      transaction = await exchange.connect(user1).makeOrder(token2.address, tokens(2), token1.address, tokens(1))
      result = await transaction.wait()

      transaction = await token2.connect(user2).approve(exchange.address, tokens(100))
      result = await transaction.wait()
      
      transaction = await exchange.connect(user2).depositToken(token2.address, tokens(100))
      result = await transaction.wait()
    })

    describe('Success', () => {
      beforeEach(async() => {
        transaction = await exchange.connect(user2).fillOrder(1)
        result = await transaction.wait()
      })

      it('executes the trade & charges fees', async() => {
        expect(await exchange.tokens(token2.address, user1.address)).to.equal(tokens(2))
        expect(await exchange.tokens(token2.address, user2.address)).to.equal(tokens(100 - (2 + (2 * 10) / 100)))
        expect(await exchange.tokens(token2.address, feeAccount.address)).to.equal(tokens((2 * 10) / 100))

        expect(await exchange.tokens(token1.address, user1.address)).to.equal(tokens(100 - 1))
        expect(await exchange.tokens(token1.address, user2.address)).to.equal(tokens(1))
        expect(await exchange.tokens(token1.address, feeAccount.address)).to.equal(tokens(0))
      })

      it('updates filled orders', async() => {
        expect(await exchange.orderFilled(1)).to.equal(true)
      })

      it('emits a Trade event', () => {
        expect(result.events[0].event).to.equal('Trade')
        expect(result.events[0].args.id).to.equal(1)
        expect(result.events[0].args.user).to.equal(user2.address)
        expect(result.events[0].args.tokenGet).to.equal(token2.address)
        expect(result.events[0].args.amountGet).to.equal(tokens(2))
        expect(result.events[0].args.tokenGive).to.equal(token1.address)
        expect(result.events[0].args.amountGive).to.equal(tokens(1))
        expect(result.events[0].args.creator).to.equal(user1.address)
        expect(result.events[0].args.timestamp).to.at.least(1)
      })
    })

    describe('Failure', () => {
      it('rejects invalid order ids', async() => {
        await expect(exchange.connect(user2).fillOrder(0)).to.be.reverted
        await expect(exchange.connect(user2).fillOrder(2)).to.be.reverted
      })

      it('rejects already canceled orders', async() => {
        transaction = await exchange.connect(user1).cancelOrder(1)
        result = await transaction.wait()

        await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted
      })

      it('rejects already filled orders', async() => {
        transaction = await exchange.connect(user2).fillOrder(1)
        result = await transaction.wait()

        await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted
      })

      it('rejects insufficient balances', async() => {
        transaction = await exchange.connect(user2).withdrawToken(token2.address, tokens(100))
        result = await transaction.wait()

        await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted
      })
    })
  })
})
