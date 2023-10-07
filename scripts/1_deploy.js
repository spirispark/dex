async function deployment() {
  console.log('Preparing deployment..\n')
  
  const accounts = await ethers.getSigners()
  console.log(`Accounts fetched:\n${accounts[0].address}\n${accounts[1].address}\n`)

  const Token = await ethers.getContractFactory('Token')
  const Exchange = await ethers.getContractFactory('Exchange')

  const RH = await Token.deploy('RH Token', 'RH', 1000000)
  const mETH = await Token.deploy('Mock Ether', 'mETH', 1000000)
  const mDAI = await Token.deploy('Mock Dai', 'mDAI', 1000000)
  const exchange = await Exchange.deploy(accounts[1].address, 10)

  console.log(`RH deployed to: ${RH.address}`)
  console.log(`mETH deployed to: ${mETH.address}`)
  console.log(`mDAI deployed to: ${mDAI.address}`)
  console.log(`Exchange deployed to: ${exchange.address}`)
}

deployment().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
