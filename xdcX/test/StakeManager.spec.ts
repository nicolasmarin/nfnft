import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect, use } from "chai";
import { BigNumber, BigNumberish } from "ethers";
import { ethers, upgrades } from "hardhat";
import { XdcX, TokenHubMock, StakeManager, IXdcX } from "../typechain";

describe("Stake Manager Contract", () => {
  let deployer: SignerWithAddress;
  let admin: SignerWithAddress;
  let manager: SignerWithAddress;
  let users: SignerWithAddress[];
  let bcDepositWallet: SignerWithAddress;
  let bot: SignerWithAddress;
  let user: SignerWithAddress;

  let xdcX: XdcX;
  let dStakeManager: StakeManager;
  let tokenHub: TokenHubMock;

  let relayFee: BigNumber;

  let uStakeManager: StakeManager;
  let bStakeManager: StakeManager;
  let mStakeManager: StakeManager;

  let xdcXApprove: (
    signer: SignerWithAddress,
    amount: BigNumberish
  ) => Promise<void>;

  before(() => {
    xdcXApprove = async (signer, amount) => {
      const signerXdcX = xdcX.connect(signer);
      await signerXdcX.approve(dStakeManager.address, amount);
    };
  });

  beforeEach(async () => {
    [deployer, ...users] = await ethers.getSigners();
    admin = deployer;
    manager = users[0];
    user = users[1];
    bcDepositWallet = users[2];
    bot = users[3];

    xdcX = (await upgrades.deployProxy(
      await ethers.getContractFactory("XdcX"),
      [admin.address]
    )) as XdcX;
    await xdcX.deployed();

    tokenHub = (await (
      await ethers.getContractFactory("TokenHubMock")
    ).deploy()) as TokenHubMock;
    await tokenHub.deployed();

    dStakeManager = (await upgrades.deployProxy(
      await ethers.getContractFactory("StakeManager"),
      [
        xdcX.address,
        admin.address,
        manager.address,
        tokenHub.address,
        bcDepositWallet.address,
        bot.address,
      ]
    )) as StakeManager;
    await dStakeManager.deployed();

    await xdcX.setStakeManager(dStakeManager.address);

    uStakeManager = dStakeManager.connect(user);
    bStakeManager = dStakeManager.connect(bot);
    mStakeManager = dStakeManager.connect(manager);
  });
  describe("Deposit, Rewards and Exchange Rate", () => {
    it("Should convert Xdc to XdcX properly", async () => {
      const amount = BigNumber.from("700");
      const amountInXdcX = await uStakeManager.convertXdcToXdcX(amount);
      expect(amountInXdcX).to.be.eq(amount);
    });

    it("Should deposit Xdc and get XdcX back", async () => {
      const amount = BigNumber.from("300");
      const zeroBalance = BigNumber.from("0");

      // deployer
      expect(await xdcX.balanceOf(deployer.address)).to.be.eq(zeroBalance);
      await dStakeManager.deposit({ value: amount });
      expect(await dStakeManager.depositsInContract()).to.be.eq(amount);
      // deployer xdcX balance should increase
      expect(await xdcX.balanceOf(deployer.address)).to.be.eq(amount);

      // normal user deposits xdc
      expect(await xdcX.balanceOf(user.address)).to.be.eq(zeroBalance);
      await uStakeManager.deposit({ value: amount });
      expect(await uStakeManager.depositsInContract()).to.be.eq(
        amount.add(amount)
      );
      // user xdcX balance should increase
      expect(await xdcX.balanceOf(user.address)).to.be.eq(amount);

      // ER should remain 1
      expect(await uStakeManager.convertXdcToXdcX(amount)).to.be.eq(amount);
    });

    it("ER should remain 1, unless rewards are added", async () => {
      const amount = BigNumber.from("700");
      let amountInXdcX = await uStakeManager.convertXdcToXdcX(amount);
      expect(amountInXdcX).to.be.eq(amount);

      await uStakeManager.deposit({ value: amount });
      amountInXdcX = await uStakeManager.convertXdcToXdcX(amount);
      expect(amountInXdcX).to.be.eq(amount);

      await uStakeManager.deposit({ value: amount });
      amountInXdcX = await uStakeManager.convertXdcToXdcX(amount);
      expect(amountInXdcX).to.be.eq(amount);
    });
  });

  describe("Rewards", () => {
    it("adding rewards not possible before funds are delegated", async () => {
      const amount = ethers.utils.parseEther("1.1");

      await uStakeManager.deposit({ value: amount });
      await expect(
        bStakeManager.addRestakingRewards(0, amount)
      ).to.be.revertedWith("No funds delegated");

      await bStakeManager.startDelegation({ value: relayFee });
      await expect(
        bStakeManager.addRestakingRewards(0, amount)
      ).to.be.revertedWith("No funds delegated");
    });

    it("rewardsId should be unique", async () => {
      const amount = ethers.utils.parseEther("1.1");
      await uStakeManager.deposit({ value: amount });
      await bStakeManager.startDelegation({ value: relayFee });
      await bStakeManager.completeDelegation(0);

      await bStakeManager.addRestakingRewards(0, amount);
      await expect(
        bStakeManager.addRestakingRewards(0, amount)
      ).to.be.revertedWith("Rewards ID already Used");

      await bStakeManager.addRestakingRewards(512, amount);
      await bStakeManager.addRestakingRewards(78374, amount);
    });

    it("successful adding of rewards", async () => {
      const amount = ethers.utils.parseEther("1.1");
      await uStakeManager.deposit({ value: amount });
      await bStakeManager.startDelegation({ value: relayFee });
      await bStakeManager.completeDelegation(0);

      expect(bStakeManager.addRestakingRewards(0, amount))
        .emit(dStakeManager, "Redelegate")
        .withArgs(0, amount);

      // depositsDelegated increases
      expect((await uStakeManager.depositsDelegated()).gt(amount)).to.be.eq(
        true
      );

      // ER increases
      expect(
        (await uStakeManager.convertXdcXToXdc(amount)).gt(amount)
      ).to.be.eq(true);
    });
  });

  describe("startDelegation", () => {
    it("Fails when invoked by anyone except bot", async () => {
      // deployer
      await expect(dStakeManager.startDelegation()).to.be.revertedWith(
        "is missing role"
      );

      // user
      await expect(uStakeManager.startDelegation()).to.be.revertedWith(
        "is missing role"
      );

      // manager
      await expect(mStakeManager.startDelegation()).to.be.revertedWith(
        "is missing role"
      );

      // admin
      const aStakeManager = dStakeManager.connect(admin);
      await expect(aStakeManager.startDelegation()).to.be.revertedWith(
        "is missing role"
      );

      // bot
      await expect(bStakeManager.startDelegation()).to.be.revertedWith(
        "Insufficient RelayFee"
      );
    });

    it("Fails if less or no relayFee is provided", async () => {
      // provided 0 relayFee
      await expect(bStakeManager.startDelegation()).to.be.revertedWith(
        "Insufficient RelayFee"
      );

      // provided less relay Fee
      await expect(
        bStakeManager.startDelegation({
          value: ethers.utils.parseEther("0.001"),
        })
      ).to.be.revertedWith("Insufficient RelayFee");

      // provided exact relay Fee
      await expect(
        bStakeManager.startDelegation({ value: relayFee })
      ).to.be.revertedWith("Insufficient Deposit Amount");

      // provided more than relay Fee
      await expect(
        bStakeManager.startDelegation({ value: relayFee.add(relayFee) })
      ).to.be.revertedWith("Insufficient Deposit Amount");
    });

    it("Fails when depositsInContract funds is less than 1 XDC", async () => {
      const amount = BigNumber.from("300");
      const zeroBalance = BigNumber.from("0");

      expect(await dStakeManager.depositsInContract()).to.be.eq(zeroBalance);
      await expect(
        bStakeManager.startDelegation({ value: relayFee })
      ).to.be.revertedWith("Insufficient Deposit Amount");

      await uStakeManager.deposit({ value: amount });
      expect(await dStakeManager.depositsInContract()).to.be.eq(amount);
      await expect(
        bStakeManager.startDelegation({ value: relayFee })
      ).to.be.revertedWith("Insufficient Deposit Amount");

      await uStakeManager.deposit({ value: ethers.utils.parseEther("0.9") });
      await expect(
        bStakeManager.startDelegation({ value: relayFee })
      ).to.be.revertedWith("Insufficient Deposit Amount");
    });

    it("Should leave the small dust amount(< 1e10) in contract, if any", async () => {
      const smallAmount = BigNumber.from("300");
      let amount = ethers.utils.parseEther("1");
      amount = amount.add(smallAmount);

      await uStakeManager.deposit({ value: amount });
      expect(await dStakeManager.depositsInContract()).to.be.eq(amount);

      expect(await bStakeManager.startDelegation({ value: relayFee }))
        .emit(dStakeManager, "TransferOut")
        .withArgs(amount.sub(smallAmount));
      expect(await dStakeManager.depositsDelegated()).to.be.eq(0);
      expect(await dStakeManager.depositsInContract()).to.be.eq(smallAmount);
      expect(await dStakeManager.depositsBridgingOut()).to.be.eq(
        amount.sub(smallAmount)
      );

      const botDelegateRequest = await bStakeManager.getBotDelegateRequest(0);
      expect(botDelegateRequest.startTime).to.be.not.eq(0);
      expect(botDelegateRequest.endTime).to.be.eq(0);
      expect(botDelegateRequest.amount).to.be.eq(amount.sub(smallAmount));
    });

    it("Only one Delegation request allowed at any time", async () => {
      const amount = ethers.utils.parseEther("1");

      await uStakeManager.deposit({ value: amount });
      expect(await dStakeManager.depositsInContract()).to.be.eq(amount);

      expect(await bStakeManager.startDelegation({ value: relayFee }))
        .emit(dStakeManager, "TransferOut")
        .withArgs(amount);
      expect(await dStakeManager.depositsDelegated()).to.be.eq(0);
      expect(await dStakeManager.depositsInContract()).to.be.eq(0);
      expect(await dStakeManager.depositsBridgingOut()).to.be.eq(amount);

      let botDelegateRequest = await bStakeManager.getBotDelegateRequest(0);
      expect(botDelegateRequest.startTime).to.be.not.eq(0);
      expect(botDelegateRequest.endTime).to.be.eq(0);
      expect(botDelegateRequest.amount).to.be.eq(amount);

      botDelegateRequest = await bStakeManager.getBotDelegateRequest(1);
      expect(botDelegateRequest.startTime).to.be.eq(0);
      expect(botDelegateRequest.endTime).to.be.eq(0);
      expect(botDelegateRequest.amount).to.be.eq(0);

      // Lets try one more start Delegation
      await uStakeManager.deposit({ value: amount });
      expect(await dStakeManager.depositsInContract()).to.be.eq(amount);

      await expect(
        bStakeManager.startDelegation({ value: relayFee })
      ).to.be.revertedWith("Previous Delegation Pending");
      expect(await dStakeManager.depositsDelegated()).to.be.eq(0);
      expect(await dStakeManager.depositsInContract()).to.be.eq(amount);
      expect(await dStakeManager.depositsBridgingOut()).to.be.eq(amount);

      botDelegateRequest = await bStakeManager.getBotDelegateRequest(0);
      expect(botDelegateRequest.startTime).to.be.not.eq(0);
      expect(botDelegateRequest.endTime).to.be.eq(0);
      expect(botDelegateRequest.amount).to.be.eq(amount);

      botDelegateRequest = await bStakeManager.getBotDelegateRequest(1);
      expect(botDelegateRequest.startTime).to.be.eq(0);
      expect(botDelegateRequest.endTime).to.be.eq(0);
      expect(botDelegateRequest.amount).to.be.eq(0);
    });
  });

  describe("RetryTransferOut", () => {
    it("Accessible only by Manager", async () => {
      await expect(uStakeManager.retryTransferOut(0)).to.be.revertedWith(
        "Accessible only by Manager"
      );
    });

    it("Fails if no TokenHub transferOut Failure", async () => {
      await expect(
        mStakeManager.retryTransferOut(0, { value: relayFee })
      ).to.be.revertedWith("Invalid UUID");

      const amount = ethers.utils.parseEther("1.2");

      await uStakeManager.deposit({ value: amount });

      await bStakeManager.startDelegation({ value: relayFee });

      await expect(
        mStakeManager.retryTransferOut(0, { value: relayFee })
      ).to.be.revertedWith("Invalid BridgingOut Amount");

      await bStakeManager.completeDelegation(0);

      await expect(
        mStakeManager.retryTransferOut(0, { value: relayFee })
      ).to.be.revertedWith("Invalid UUID");

      await expect(
        mStakeManager.retryTransferOut(1, { value: relayFee })
      ).to.be.revertedWith("Invalid UUID");
    });

    // it("Successful retryTransferOut", async () => {
    // const amount = ethers.utils.parseEther("1.2");
    // await uStakeManager.deposit({ value: amount });
    // await bStakeManager.startDelegation({ value: relayFee });
    // // Assume previos transferOut failed
    // // Lets simulate the refund of funds
    // const tx = {
    //   from: user.address,
    //   to: uStakeManager.address,
    //   value: amount,
    //   nonce: user.getTransactionCount(),
    //   gasLimit: ethers.utils.hexlify(31000),
    //   gasPrice: ethers.provider.getGasPrice(),
    // };
    // TODO: stuck, unable to send fund to contract in hardhat environment, need to research more
    // await user.sendTransaction(tx);
    // await expect(
    //   mStakeManager.retryTransferOut(0, { value: relayFee })
    // ).to.be.revertedWith("Invalid UUID");
    // await bStakeManager.completeDelegation(0);
    // });
  });

  describe("completeDelegation", () => {
    it("Fails when invoked by anyone except bot", async () => {
      // deployer
      await expect(dStakeManager.completeDelegation(0)).to.be.revertedWith(
        "is missing role"
      );

      // user
      await expect(uStakeManager.completeDelegation(0)).to.be.revertedWith(
        "is missing role"
      );

      // manager
      await expect(mStakeManager.completeDelegation(0)).to.be.revertedWith(
        "is missing role"
      );

      // admin
      const aStakeManager = dStakeManager.connect(admin);
      await expect(aStakeManager.completeDelegation(0)).to.be.revertedWith(
        "is missing role"
      );

      // bot
      await expect(bStakeManager.completeDelegation(0)).to.be.revertedWith(
        "Invalid UUID"
      );
    });

    it("Fails when Invalid UUID is passed", async () => {
      await expect(bStakeManager.completeDelegation(0)).to.be.revertedWith(
        "Invalid UUID"
      );

      const amount = ethers.utils.parseEther("1");
      await uStakeManager.deposit({ value: amount });
      await bStakeManager.startDelegation({ value: relayFee });
      await expect(bStakeManager.completeDelegation(1)).to.be.revertedWith(
        "Invalid UUID"
      );
      await expect(bStakeManager.completeDelegation(2)).to.be.revertedWith(
        "Invalid UUID"
      );
      await expect(bStakeManager.completeDelegation(126)).to.be.revertedWith(
        "Invalid UUID"
      );
    });

    it("Should succeed when correct UUID is passed", async () => {
      const amount = ethers.utils.parseEther("1.1");
      await uStakeManager.deposit({ value: amount });
      await bStakeManager.startDelegation({ value: relayFee });

      expect(await dStakeManager.depositsBridgingOut()).to.be.eq(amount);

      expect(await bStakeManager.completeDelegation(0))
        .emit(dStakeManager, "Delegate")
        .withArgs(0, amount);

      expect(await dStakeManager.depositsDelegated()).to.be.eq(amount);
      expect(await dStakeManager.depositsBridgingOut()).to.be.eq(0);

      const botDelegateRequest = await bStakeManager.getBotDelegateRequest(0);
      expect(botDelegateRequest.endTime).to.be.not.eq(0);
    });

    it("Fails when invoked again with stale UUID", async () => {
      const amount = ethers.utils.parseEther("1.1");
      await uStakeManager.deposit({ value: amount });
      await bStakeManager.startDelegation({ value: relayFee });
      await bStakeManager.completeDelegation(0);
      await expect(bStakeManager.completeDelegation(0)).to.be.revertedWith(
        "Invalid UUID"
      );
    });
  });

  describe("requestWithdraw", () => {
    it("Fails if user doesn't have XdcX", async () => {
      await expect(uStakeManager.requestWithdraw(0)).to.be.revertedWith(
        "Invalid Amount"
      );
      await expect(uStakeManager.requestWithdraw(5)).to.be.revertedWith(
        "Not enough XDC to withdraw"
      );

      const amount = ethers.utils.parseEther("2");
      // deployer deposits
      await dStakeManager.deposit({ value: amount });
      await bStakeManager.startDelegation({ value: relayFee });
      await bStakeManager.completeDelegation(0);

      // user tries to withdraw, but doesn't have any XDCx in account
      await xdcXApprove(user, amount.add(amount)); // Just to provide more allowance
      await expect(uStakeManager.requestWithdraw(5)).to.be.revertedWith(
        "ERC20: transfer amount exceeds balance"
      );
    });

    it("Fails if user has not approved the StakeManager Contract for spending XdcX", async () => {
      const amount = ethers.utils.parseEther("2");
      await uStakeManager.deposit({ value: amount });

      await bStakeManager.startDelegation({ value: relayFee });
      await bStakeManager.completeDelegation(0);

      await expect(
        uStakeManager.requestWithdraw(ethers.utils.parseEther("1"))
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Fails if user requests to withdraw more Xdc than eligible", async () => {
      const amount = ethers.utils.parseEther("2");
      await uStakeManager.deposit({ value: amount });

      await bStakeManager.startDelegation({ value: relayFee });
      await bStakeManager.completeDelegation(0);

      await xdcXApprove(user, amount.add(amount)); // Just to provide more allowance
      await expect(
        uStakeManager.requestWithdraw(ethers.utils.parseEther("3"))
      ).to.be.revertedWith("Not enough XDC to withdraw");

      // deployer deposits more funds
      await dStakeManager.deposit({ value: amount });
      await bStakeManager.startDelegation({ value: relayFee });
      await bStakeManager.completeDelegation(1);

      await expect(
        uStakeManager.requestWithdraw(ethers.utils.parseEther("3"))
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Fails if user requests to withdraw before it is actually staked at Beacon Chain", async () => {
      const amount = ethers.utils.parseEther("2");
      await uStakeManager.deposit({ value: amount });
      await xdcXApprove(user, amount);
      await expect(
        uStakeManager.requestWithdraw(ethers.utils.parseEther("1"))
      ).to.be.revertedWith("Not enough XDC to withdraw");

      await bStakeManager.startDelegation({ value: relayFee });
      await expect(
        uStakeManager.requestWithdraw(ethers.utils.parseEther("1"))
      ).to.be.revertedWith("Not enough XDC to withdraw");
    });

    it("Should successfully raise withdraw request", async () => {
      const amount = ethers.utils.parseEther("2");
      const withdrawAmount = ethers.utils.parseEther("1");

      await uStakeManager.deposit({ value: amount });

      await bStakeManager.startDelegation({ value: relayFee });
      await bStakeManager.completeDelegation(0);

      let userRequests = await dStakeManager.getUserWithdrawalRequests(
        user.address
      );
      expect(userRequests.length).to.be.eq(0);

      await xdcXApprove(user, amount);
      await expect(uStakeManager.requestWithdraw(withdrawAmount))
        .emit(dStakeManager, "RequestWithdraw")
        .withArgs(user.address, withdrawAmount);

      expect(await xdcX.balanceOf(dStakeManager.address)).to.be.eq(
        withdrawAmount
      );
      expect(await dStakeManager.totalXdcXToBurn()).to.be.eq(withdrawAmount);
      userRequests = await dStakeManager.getUserWithdrawalRequests(
        user.address
      );
      expect(userRequests.length).to.be.eq(1);
    });

    it("Should successfully raise 100 withdraw request", async () => {
      const amount = ethers.utils.parseEther("2.1");
      const withdrawAmount = ethers.utils.parseEther("0.01");

      await uStakeManager.deposit({ value: amount });

      await bStakeManager.startDelegation({ value: relayFee });
      await bStakeManager.completeDelegation(0);

      let userRequests = await dStakeManager.getUserWithdrawalRequests(
        user.address
      );
      expect(userRequests.length).to.be.eq(0);

      await xdcXApprove(user, amount);

      for (let i = 0; i < 100; i++) {
        await uStakeManager.requestWithdraw(withdrawAmount);
      }

      expect(await xdcX.balanceOf(dStakeManager.address)).to.be.eq(
        ethers.utils.parseEther("1")
      );
      expect(await xdcX.balanceOf(user.address)).to.be.eq(
        ethers.utils.parseEther("1.1")
      );
      expect(await dStakeManager.totalXdcXToBurn()).to.be.eq(
        ethers.utils.parseEther("1")
      );
      userRequests = await dStakeManager.getUserWithdrawalRequests(
        user.address
      );
      expect(userRequests.length).to.be.eq(100);
    });
  });

  describe("startUndelegation", () => {
    it("Fails when invoked by anyone except bot", async () => {
      // deployer
      await expect(dStakeManager.startUndelegation()).to.be.revertedWith(
        "is missing role"
      );

      // user
      await expect(uStakeManager.startUndelegation()).to.be.revertedWith(
        "is missing role"
      );

      // manager
      await expect(mStakeManager.startUndelegation()).to.be.revertedWith(
        "is missing role"
      );

      // admin
      const aStakeManager = dStakeManager.connect(admin);
      await expect(aStakeManager.startUndelegation()).to.be.revertedWith(
        "is missing role"
      );

      // bot
      await expect(bStakeManager.startUndelegation()).to.be.revertedWith(
        "Insufficient Withdraw Amount"
      );
    });

    it("Fails when no withdraw requests", async () => {
      await expect(bStakeManager.startUndelegation()).to.be.revertedWith(
        "Insufficient Withdraw Amount"
      );
    });

    it("Should successfully start undelegation after user requests withdraw", async () => {
      const amount = ethers.utils.parseEther("2");
      const withdrawAmount = ethers.utils.parseEther("1");

      await uStakeManager.deposit({ value: amount });

      await bStakeManager.startDelegation({ value: relayFee });
      await bStakeManager.completeDelegation(0);

      await xdcXApprove(user, amount);
      await uStakeManager.requestWithdraw(withdrawAmount);
      expect(await xdcX.balanceOf(dStakeManager.address)).to.be.eq(
        withdrawAmount
      );

      await bStakeManager.startUndelegation();
      expect(await dStakeManager.totalXdcXToBurn()).to.be.eq(0);
      expect(await xdcX.balanceOf(dStakeManager.address)).to.be.eq(0);

      const botUndelegateRequest = await bStakeManager.getBotUndelegateRequest(
        0
      );
      expect(botUndelegateRequest.amount).to.be.eq(withdrawAmount);
      expect(botUndelegateRequest.startTime).to.be.eq(0);
      expect(botUndelegateRequest.endTime).to.be.eq(0);
    });

    it("Should burn more in case of dust and change ER", async () => {
      const amount = ethers.utils.parseEther("2");
      const dust = BigNumber.from("56782");
      const xdcXToWithdraw = ethers.utils.parseEther("1").add(dust);

      await uStakeManager.deposit({ value: amount });

      await bStakeManager.startDelegation({ value: relayFee });
      await bStakeManager.completeDelegation(0);

      await xdcXApprove(user, amount);
      await uStakeManager.requestWithdraw(xdcXToWithdraw);
      expect(await xdcX.balanceOf(dStakeManager.address)).to.be.eq(
        xdcXToWithdraw
      );

      await bStakeManager.startUndelegation();
      expect(await dStakeManager.totalXdcXToBurn()).to.be.eq(0);
      expect(await xdcX.balanceOf(dStakeManager.address)).to.be.eq(0);

      const botUndelegateRequest = await bStakeManager.getBotUndelegateRequest(
        0
      );
      expect(botUndelegateRequest.amount).to.be.eq(xdcXToWithdraw.sub(dust));
      expect(botUndelegateRequest.amountInXdcX).to.be.eq(xdcXToWithdraw);
      expect(botUndelegateRequest.startTime).to.be.eq(0);
      expect(botUndelegateRequest.endTime).to.be.eq(0);

      const amountInXdcX = await dStakeManager.convertXdcToXdcX(amount);
      expect(amountInXdcX).to.be.not.eq(amount);
    });
  });

  describe("undelegationStarted", () => {
    it("Fails when Invalid UUID", async () => {
      const amount = ethers.utils.parseEther("2");
      const withdrawAmount = ethers.utils.parseEther("1");

      await expect(bStakeManager.undelegationStarted(0)).to.be.revertedWith(
        "Invalid UUID"
      );
      await expect(bStakeManager.undelegationStarted(3)).to.be.revertedWith(
        "Invalid UUID"
      );
      await uStakeManager.deposit({ value: amount });

      await expect(bStakeManager.undelegationStarted(0)).to.be.revertedWith(
        "Invalid UUID"
      );

      await bStakeManager.startDelegation({ value: relayFee });

      await expect(bStakeManager.undelegationStarted(0)).to.be.revertedWith(
        "Invalid UUID"
      );

      await bStakeManager.completeDelegation(0);

      await expect(bStakeManager.undelegationStarted(0)).to.be.revertedWith(
        "Invalid UUID"
      );

      await xdcXApprove(user, amount);
      await uStakeManager.requestWithdraw(withdrawAmount);

      await expect(bStakeManager.undelegationStarted(0)).to.be.revertedWith(
        "Invalid UUID"
      );

      await bStakeManager.startUndelegation();

      await bStakeManager.undelegationStarted(0);

      // stale UUID
      await expect(bStakeManager.undelegationStarted(0)).to.be.revertedWith(
        "Invalid UUID"
      );
    });

    it("Should log startTime once invoked", async () => {
      const amount = ethers.utils.parseEther("2");
      const withdrawAmount = ethers.utils.parseEther("1");

      await uStakeManager.deposit({ value: amount });

      await bStakeManager.startDelegation({ value: relayFee });
      await bStakeManager.completeDelegation(0);

      await xdcXApprove(user, amount);
      await uStakeManager.requestWithdraw(withdrawAmount);
      expect(await xdcX.balanceOf(dStakeManager.address)).to.be.eq(
        withdrawAmount
      );

      await bStakeManager.startUndelegation();
      expect(await dStakeManager.totalXdcXToBurn()).to.be.eq(0);
      expect(await xdcX.balanceOf(dStakeManager.address)).to.be.eq(0);

      let botUndelegateRequest = await bStakeManager.getBotUndelegateRequest(0);
      expect(botUndelegateRequest.amount).to.be.eq(withdrawAmount);
      expect(botUndelegateRequest.endTime).to.be.eq(0);

      expect(botUndelegateRequest.startTime).to.be.eq(0);
      await bStakeManager.undelegationStarted(0);

      botUndelegateRequest = await bStakeManager.getBotUndelegateRequest(0);
      expect(botUndelegateRequest.startTime).to.be.not.eq(0);
    });
  });

  describe("completeUndelegation", () => {
    it("Fails when invoked by anyone except bot", async () => {
      await expect(uStakeManager.completeUndelegation(0)).to.be.revertedWith(
        "is missing role"
      );
    });

    it("Fails when invalid UUID is passed", async () => {
      const amount = ethers.utils.parseEther("2");
      const withdrawAmount = ethers.utils.parseEther("1");

      await expect(bStakeManager.completeUndelegation(0)).to.be.revertedWith(
        "Invalid UUID"
      );

      await uStakeManager.deposit({ value: amount });
      await bStakeManager.startDelegation({ value: relayFee });
      await bStakeManager.completeDelegation(0);
      await xdcXApprove(user, amount);
      await uStakeManager.requestWithdraw(withdrawAmount);

      await expect(bStakeManager.completeUndelegation(0)).to.be.revertedWith(
        "Invalid UUID"
      );
      await expect(bStakeManager.completeUndelegation(1)).to.be.revertedWith(
        "Invalid UUID"
      );

      await bStakeManager.startUndelegation();

      await expect(bStakeManager.completeUndelegation(0)).to.be.revertedWith(
        "Invalid UUID"
      );

      await bStakeManager.undelegationStarted(0);

      await expect(bStakeManager.completeUndelegation(1)).to.be.revertedWith(
        "Invalid UUID"
      );

      await expect(bStakeManager.completeUndelegation(4)).to.be.revertedWith(
        "Invalid UUID"
      );
    });

    it("Fails when incorrect amount of passed while invoking", async () => {
      const amount = ethers.utils.parseEther("2");
      const withdrawAmount = ethers.utils.parseEther("1");
      await uStakeManager.deposit({ value: amount });
      await bStakeManager.startDelegation({ value: relayFee });
      await bStakeManager.completeDelegation(0);
      await xdcXApprove(user, amount);
      await uStakeManager.requestWithdraw(withdrawAmount);
      await bStakeManager.startUndelegation();
      await bStakeManager.undelegationStarted(0);

      await expect(bStakeManager.completeUndelegation(0)).to.be.revertedWith(
        "Send Exact Amount of Fund"
      );

      await expect(
        bStakeManager.completeUndelegation(0, {
          value: withdrawAmount.sub(500),
        })
      ).to.be.revertedWith("Send Exact Amount of Fund");

      await expect(
        bStakeManager.completeUndelegation(0, {
          value: withdrawAmount.add(500),
        })
      ).to.be.revertedWith("Send Exact Amount of Fund");
    });

    it("Should successfully complete Undelegation", async () => {
      const amount = ethers.utils.parseEther("2");
      const withdrawAmount = ethers.utils.parseEther("1");
      await uStakeManager.deposit({ value: amount });
      await bStakeManager.startDelegation({ value: relayFee });
      await bStakeManager.completeDelegation(0);
      await xdcXApprove(user, amount);
      await uStakeManager.requestWithdraw(withdrawAmount);
      await bStakeManager.startUndelegation();
      await bStakeManager.undelegationStarted(0);

      await expect(
        bStakeManager.completeUndelegation(0, { value: withdrawAmount })
      )
        .emit(dStakeManager, "Undelegate")
        .withArgs(0, withdrawAmount);

      const botUndelegateRequest = await bStakeManager.getBotUndelegateRequest(
        0
      );
      expect(botUndelegateRequest.endTime).to.be.not.eq(0);
    });
  });

  describe("claimWithdraw", () => {
    it("Fails when user attempts to claim without raising a request", async () => {
      await expect(uStakeManager.claimWithdraw(0)).to.be.revertedWith(
        "Invalid index"
      );

      const amount = ethers.utils.parseEther("2");
      await uStakeManager.deposit({ value: amount });
      await bStakeManager.startDelegation({ value: relayFee });
      await bStakeManager.completeDelegation(0);
      await xdcXApprove(user, amount);

      await expect(uStakeManager.claimWithdraw(0)).to.be.revertedWith(
        "Invalid index"
      );
    });

    it("Fails when user claims with a invalid `_idx`", async () => {
      const amount = ethers.utils.parseEther("2");
      const withdrawAmount = ethers.utils.parseEther("1");
      await uStakeManager.deposit({ value: amount });
      await bStakeManager.startDelegation({ value: relayFee });
      await bStakeManager.completeDelegation(0);
      await xdcXApprove(user, amount);
      await uStakeManager.requestWithdraw(withdrawAmount);

      await expect(uStakeManager.claimWithdraw(1)).to.be.revertedWith(
        "Invalid index"
      );
      await expect(uStakeManager.claimWithdraw(2)).to.be.revertedWith(
        "Invalid index"
      );
      await expect(uStakeManager.claimWithdraw(41)).to.be.revertedWith(
        "Invalid index"
      );
    });

    it("Fails when user user's fund is not ready to claim", async () => {
      const amount = ethers.utils.parseEther("2");
      const withdrawAmount = ethers.utils.parseEther("1");
      await uStakeManager.deposit({ value: amount });
      await bStakeManager.startDelegation({ value: relayFee });
      await bStakeManager.completeDelegation(0);
      await xdcXApprove(user, amount);
      await uStakeManager.requestWithdraw(withdrawAmount);

      let userStatus = await dStakeManager.getUserRequestStatus(
        user.address,
        0
      );
      expect(userStatus._isClaimable).to.be.eq(false);
      await expect(uStakeManager.claimWithdraw(0)).to.be.revertedWith(
        "Not able to claim yet"
      );

      await bStakeManager.startUndelegation();
      await bStakeManager.undelegationStarted(0);

      userStatus = await dStakeManager.getUserRequestStatus(user.address, 0);
      expect(userStatus._isClaimable).to.be.eq(false);
      await expect(uStakeManager.claimWithdraw(0)).to.be.revertedWith(
        "Not able to claim yet"
      );
    });

    it("Should successfully be able to claim after raising withdraw request", async () => {
      const amount = ethers.utils.parseEther("2");
      const withdrawAmount = ethers.utils.parseEther("1");
      await uStakeManager.deposit({ value: amount });
      await bStakeManager.startDelegation({ value: relayFee });
      await bStakeManager.completeDelegation(0);
      await xdcXApprove(user, amount);
      await uStakeManager.requestWithdraw(withdrawAmount);
      await bStakeManager.startUndelegation();
      await bStakeManager.undelegationStarted(0);

      let userStatus = await dStakeManager.getUserRequestStatus(
        user.address,
        0
      );
      expect(userStatus._isClaimable).to.be.eq(false);

      await bStakeManager.completeUndelegation(0, { value: withdrawAmount });

      const userBalanceBeforeClaim = await user.getBalance();
      let userRequests = await uStakeManager.getUserWithdrawalRequests(
        user.address
      );
      expect(userRequests.length).to.be.eq(1);

      userStatus = await dStakeManager.getUserRequestStatus(user.address, 0);
      expect(userStatus._isClaimable).to.be.eq(true);

      await expect(uStakeManager.claimWithdraw(0))
        .emit(dStakeManager, "ClaimWithdrawal")
        .withArgs(user.address, 0, withdrawAmount);

      const userBalanceAfterClaim = await user.getBalance();
      // eslint-disable-next-line no-unused-expressions
      expect(userBalanceAfterClaim.sub(userBalanceBeforeClaim).isNegative()).to
        .be.false;

      userRequests = await uStakeManager.getUserWithdrawalRequests(
        user.address
      );
      expect(userRequests.length).to.be.eq(0);
    });
  });

  describe("Miscellaneous", () => {
    it("post-increment", async () => {
      let value = 1;
      const currentValue = value++;
      const incrementedValue = value;

      expect(currentValue).to.be.eq(1);
      expect(incrementedValue).to.be.eq(2);
    });

    it("set new Manager", async () => {
      await expect(
        uStakeManager.proposeNewManager(bot.address)
      ).to.be.revertedWith("Accessible only by Manager");

      await expect(mStakeManager.proposeNewManager(user.address))
        .emit(dStakeManager, "ProposeManager")
        .withArgs(user.address);

      await expect(mStakeManager.acceptNewManager()).to.be.revertedWith(
        "Accessible only by Proposed Manager"
      );
      await expect(uStakeManager.acceptNewManager())
        .emit(uStakeManager, "SetManager")
        .withArgs(user.address);
    });

    it("Precision issue", async () => {
      const amount = ethers.utils.parseEther("1.234453748767838949");
      await uStakeManager.deposit({ value: amount });
      await bStakeManager.startDelegation({ value: relayFee });
      await bStakeManager.completeDelegation(0);

      await bStakeManager.addRestakingRewards(0, BigNumber.from("8273873"));

      const amountInXdcX = await uStakeManager.convertXdcToXdcX(amount);

      expect(await uStakeManager.convertXdcXToXdc(amountInXdcX)).to.be.not.eq(
        amount
      );
    });

    it("User able to requestWithdraw more than limit shown", async () => {
      const depositAmount = ethers.utils.parseEther("1.234453748767838949");
      await uStakeManager.deposit({ value: depositAmount });
      await bStakeManager.startDelegation({ value: relayFee });
      await bStakeManager.completeDelegation(0);

      await bStakeManager.addRestakingRewards(0, BigNumber.from("8273873"));

      await xdcXApprove(user, depositAmount.add(depositAmount)); // Just to provide more allowance
      await uStakeManager.requestWithdraw(BigNumber.from("256561"));
      const xdcXWithdrawLimit = await uStakeManager.getXdcXWithdrawLimit();
      // failed
      await expect(
        uStakeManager.requestWithdraw(
          xdcXWithdrawLimit.add(BigNumber.from("2"))
        )
      ).to.be.revertedWith("Not enough XDC to withdraw");

      // user able to unstake more than limit shown
      await uStakeManager.requestWithdraw(
        xdcXWithdrawLimit.add(BigNumber.from("1"))
      );
    });
  });
});
