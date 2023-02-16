// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const [deployer, admin] = await hre.ethers.getSigners();

  const GolNft = await hre.ethers.getContractFactory('GolNft');
  golNft = await GolNft.deploy();

  const MyForwarder = await hre.ethers.getContractFactory('MyForwarder');
  myForwarder = await MyForwarder.deploy();
  const GolBallAdmin = await ethers.getContractFactory('GolBallAdmin');
  golBallAdmin = await GolBallAdmin.deploy(myForwarder.address, admin.address);

  const balance = await deployer.getBalance();

  const tokenId = []
  for (let index = 0; index < 10; index++) {
    transaction = await golNft.connect(deployer).safeMint(deployer.address);
    tx = await transaction.wait()
    
  }
  if (tx && tx.events && tx.events.length > 0) {
    const event = tx.events[0];
    const value = event.args[2];
    tokenId.push(value.toNumber());
  }

  const nftBalance = await golNft.balanceOf('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');

  transaction = await golBallAdmin.connect(admin).addCollection(golNft.address);
  tx = await transaction.wait();
  let event = '';
  if (tx && tx.events && tx.events.length > 0) {
    event = tx.events[0].event
  }

  const isTrusted = await golBallAdmin.isTrustedForwarder(myForwarder.address);

  console.log(`
    Deploying contracts with account: ${deployer.address}
    Account balance: ${balance}

    golNft address:   ${golNft.address}  (first address given by hardhat for contracts)
    myForwarder address:   ${myForwarder.address}  (second address given by hardhat for contracts)
    golBallAdmin address:   ${golBallAdmin.address}  (third address given by hardhat for contracts)

    isTrustedForwarder: ${isTrusted}

    Evnet: ${event}
    nftBalance for 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266: ${nftBalance}
  `)

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
