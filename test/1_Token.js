const { expect } = require('chai')

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Token', () => {

  let Token, token, accounts, deployer, receiver, exchange, transaction, result

  beforeEach(async() => {

    Token = await ethers.getContractFactory('Token')
    token = await Token.deploy('RH Token', 'RH', 1000000)
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    receiver = accounts[1]
    exchange = accounts[2]
  })
  
  describe('Deployment', () => {

    const name = 'RH Token'
    const symbol = 'RH'
    const decimals = '18'
    const totalSupply = tokens(1000000)
    
    it('has correct name', async() => {
      expect(await token.name()).to.equal(name)
    })

    it('has correct symbol', async() => {    
      expect(await token.symbol()).to.equal(symbol)
    })

    it('has correct decimals', async() => {    
      expect(await token.decimals()).to.equal(decimals)
    })

    it('has correct total supply', async() => {
      expect(await token.totalSupply()).to.equal(totalSupply)
    })

    it('assigns total supply to deployer', async() => {
      expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
    })
  })

  describe('Sending Tokens', () => {

    describe('Success', () => {

      beforeEach(async() => {
        transaction = await token.connect(deployer).transfer(receiver.address, tokens(100))
        result = await transaction.wait()
      })
  
      it('transfers token balances', async() => {      
        expect(await token.balanceOf(deployer.address)).to.equal(tokens(1000000 - 100))
        expect(await token.balanceOf(receiver.address)).to.equal(tokens(100))
      })
  
      it('emits a Transfer event', async() => {
        expect(result.events[0].event).to.equal('Transfer')
        expect(result.events[0].args.from).to.equal(deployer.address)
        expect(result.events[0].args.to).to.equal(receiver.address)
        expect(result.events[0].args.value).to.equal(tokens(100))
      })
    })

    describe('Failure', () => {
      
      it('rejects insufficient balances', async() => {
        await expect(token.connect(deployer).transfer(receiver.address, tokens(100000000))).to.be.reverted
      })

      it('rejects invalid recipients', async() => {
        await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', tokens(100))).to.be.reverted
      })
    })
  })

  describe('Approving Tokens', () => {

    beforeEach(async() => {
      transaction = await token.connect(deployer).approve(exchange.address, tokens(100))
      result = await transaction.wait()
    })

    describe('Success', () => {
      
      it('allocates allowance for delegated token transfer', async() => {
        expect(await token.allowance(deployer.address, exchange.address)).to.equal(tokens(100))
      })

      it('emits an Approval event', async() => {
        expect(result.events[0].event).to.equal('Approval')
        expect(result.events[0].args.owner).to.equal(deployer.address)
        expect(result.events[0].args.spender).to.equal(exchange.address)
        expect(result.events[0].args.value).to.equal(tokens(100))
      })
    })

    describe( 'Failure', () => {

      it('rejects invalid spenders', async() => {
        await expect(token.connect(deployer).approve('0x0000000000000000000000000000000000000000', tokens(100))).to.be.reverted
      })
    })
  })

  describe('Delegated Token Transfers', () => {

    describe('Success', () => {
      
      beforeEach(async() => {
        transaction = await token.connect(deployer).approve(exchange.address, tokens(100))
        transaction = await token.connect(exchange).transferFrom(deployer.address, receiver.address, tokens(100))
        result = await transaction.wait()
      })

      it('updates the allowance', async() => {
        expect(await token.allowance(deployer.address, exchange.address)).to.equal(0)
      })

      it('transfers token balances', async() => {      
        expect(await token.balanceOf(deployer.address)).to.equal(tokens(1000000 - 100))
        expect(await token.balanceOf(receiver.address)).to.equal(tokens(100))
      })

      it('emits a Transfer event', async() => {
        expect(result.events[0].event).to.equal('Transfer')
        expect(result.events[0].args.from).to.equal(deployer.address)
        expect(result.events[0].args.to).to.equal(receiver.address)
        expect(result.events[0].args.value).to.equal(tokens(100))
      })
    })

    describe('Failure', () => {
      
      it('rejects insufficient balances', async() => {
        await expect(token.connect(exchange).transferFrom(deployer.address, receiver.address, tokens(100000000))).to.be.reverted
      })

      it('rejects insufficient allowance', async() => {
        expect(await token.allowance(deployer.address, exchange.address)).to.be.reverted
      })
    })
  })
})
