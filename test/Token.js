const { ethers } = require('hardhat')
const { expect } = require('chai')

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Token', () => {

  let Token, token, accounts, deployer, receiver

  beforeEach(async() => {
    Token = await ethers.getContractFactory('Token')
    token = await Token.deploy('RH Token', 'RH', 1000000)
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    receiver = accounts[1]
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
    
    let amountTransfered = tokens(100)
    let amountRemaining = tokens(1000000 - 100)
    let amountInvalid = tokens(100000000)
    let receiverInvalid = '0x0000000000000000000000000000000000000000'
    let transaction, result

    describe('Success', () => {
      beforeEach(async() => {
        transaction = await token.connect(deployer).transfer(receiver.address, amountTransfered)
        result = await transaction.wait()
      })
  
      it('transfers token balances', async() => {      
        expect(await token.balanceOf(deployer.address)).to.equal(amountRemaining)
        expect(await token.balanceOf(receiver.address)).to.equal(amountTransfered)
      })
  
      it('emits a Transfer event', async() => {
        expect(result.events[0].event).to.equal('Transfer')
        expect(result.events[0].args.from).to.equal(deployer.address)
        expect(result.events[0].args.to).to.equal(receiver.address)
        expect(result.events[0].args.value).to.equal(amountTransfered)
      })
    })

    describe('Failure', () => {
      it('rejects insufficient balances', async() => {
        await expect(token.connect(deployer).transfer(receiver.address, amountInvalid)).to.be.reverted
      })

      it('rejects invalid recipients', async() => {
        await expect(token.connect(deployer).transfer(receiverInvalid, amountTransfered)).to.be.reverted
      })
    })
  })
})
