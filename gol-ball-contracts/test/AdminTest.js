const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("GolBall Admin Test", accounts => {
  let transaction, tx;
  let owner, admin;
  async function deployOneYearLockFixture() {

    [owner, admin] = await ethers.getSigners();


    const MyForwarder = await ethers.getContractFactory('MyForwarder');
    myForwarder = await MyForwarder.deploy();
    const GolBallAdmin = await ethers.getContractFactory('GolBallAdmin');
    golBallAdmin = await GolBallAdmin.deploy(myForwarder.address, admin.address);

    const GolNft = await ethers.getContractFactory('GolNft');
    golNft = await GolNft.deploy(golBallAdmin.address);

    return {owner, admin, golNft, myForwarder, golBallAdmin}
  };

  it("should swap token", async () => {
    const {owner, admin, golNft, myForwarder, golBallAdmin} = await loadFixture(deployOneYearLockFixture);
    const tokenId = []
    transaction = await golNft.safeMint(owner.address);
    tx = await transaction.wait()
    if (tx && tx.events && tx.events.length > 0) {
      const event = tx.events[0];
      const value = event.args[2];
      tokenId.push(value.toNumber());
    }
    await expect(tokenId[0]).equal(0);

    const tokenIdList = await golNft.getTokenIdListForAddress("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
    console.log(tokenIdList)
    transaction = await golNft.approve(golBallAdmin.address, tokenId[0]);
    tx = await transaction.wait()
    if (tx && tx.events && tx.events.length > 0) {
      const event = tx.events[0];
      const owner = event.args[0];
      const approved = event.args[1];
      const tokenId = event.args[2];
    }

    await golBallAdmin.connect(admin).addCollection(golNft.address);
    const isCollectionChecked = await golBallAdmin.connect(admin).checkCollection(golNft.address);
    let balanceBefore, balanceAfter;
    if(isCollectionChecked) {
      balanceBefore = await golNft.balanceOf(golBallAdmin.address);
      await golBallAdmin.connect(owner).swap(golNft.address, tokenId[0]);
      balanceAfter = await golNft.balanceOf(golBallAdmin.address);
    }
    expect(balanceAfter.toNumber()).to.equal(Number(balanceBefore)+1);
  });
  it("swap token should fail after removing the collection", async () => {
    const {owner, admin, golNft, myForwarder, golBallAdmin} = await loadFixture(deployOneYearLockFixture);
    const tokenId = []
    transaction = await golNft.safeMint(owner.address);
    tx = await transaction.wait()
    if (tx && tx.events && tx.events.length > 0) {
      const event = tx.events[0];
      const value = event.args[2];
      tokenId.push(value.toNumber());
    }
    await expect(tokenId[0]).equal(0);


    transaction = await golNft.approve(golBallAdmin.address, tokenId[0]);
    tx = await transaction.wait()
    if (tx && tx.events && tx.events.length > 0) {
      const event = tx.events[0];
      const owner = event.args[0];
      const approved = event.args[1];
      const tokenId = event.args[2];
    }

    await golBallAdmin.connect(admin).addCollection(golNft.address);
    let isCollectionChecked = await golBallAdmin.connect(admin).checkCollection(golNft.address);
    expect(isCollectionChecked).to.equal(true);
    await golBallAdmin.connect(admin).removeCollection(golNft.address);
    
    await expect(golBallAdmin.connect(owner).swap(golNft.address, tokenId[0]))
    .to.be.revertedWith("Collection not found")
  });
  it("swap token should fail after trying to swap 2 times", async () => {
    const {owner, admin, golNft, myForwarder, golBallAdmin} = await loadFixture(deployOneYearLockFixture);
    const tokenId = []
    transaction = await golNft.safeMint(owner.address);
    tx = await transaction.wait()
    if (tx && tx.events && tx.events.length > 0) {
      const event = tx.events[0];
      const value = event.args[2];
      tokenId.push(value.toNumber());
    }
    await expect(tokenId[0]).equal(0);


    transaction = await golNft.approve(golBallAdmin.address, tokenId[0]);
    tx = await transaction.wait()
    if (tx && tx.events && tx.events.length > 0) {
      const event = tx.events[0];
      const owner = event.args[0];
      const approved = event.args[1];
      const tokenId = event.args[2];
    }

    await golBallAdmin.connect(admin).addCollection(golNft.address);
    let isCollectionChecked = await golBallAdmin.connect(admin).checkCollection(golNft.address);
    expect(isCollectionChecked).to.equal(true);
    await golBallAdmin.connect(owner).swap(golNft.address, tokenId[0]);
    await expect(golBallAdmin.connect(owner).swap(golNft.address, tokenId[0]))
    .to.be.revertedWith("incorrect owner")
  });
  it("burn an nft after swap", async () => {

    const {owner, admin, golNft, golBallAdmin} = await loadFixture(deployOneYearLockFixture);
    const tokenId = []
    transaction = await golNft.safeMint(owner.address);
    tx = await transaction.wait()
    if (tx && tx.events && tx.events.length > 0) {
      const event = tx.events[0];
      const value = event.args[2];
      tokenId.push(value.toNumber());
    }

    transaction = await golNft.approve(golBallAdmin.address, tokenId[0]);
    tx = await transaction.wait()
    await golBallAdmin.connect(admin).addCollection(golNft.address);

    let isCollectionChecked = await golBallAdmin.connect(admin).checkCollection(golNft.address);

    expect(isCollectionChecked).to.equal(true);

    await golBallAdmin.connect(owner).swap(golNft.address, tokenId[0]);

    await expect(golBallAdmin.connect(admin).burnItem(golNft.address, tokenId[0]))
    .to.emit(golBallAdmin, "ItemBurned")
    .withArgs(admin.address, 0, golNft.address);
  })
});