import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
  
import { expect } from "chai";
import { ethers } from "hardhat";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { IERC20, IUniswapV2Pair } from "../typechain-types";

const DaiWhale = "0x16b34ce9a6a6f7fc2dd25ba59bf7308e7b38e186";
const DaiAddress = "0x6b175474e89094c44da98b954eedeac495271d0f";

const UniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
const UniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"

class Tokens {
    dai: IERC20;
    mpt: IERC20;

    constructor(dai: IERC20, mpt: IERC20) {
        this.dai = dai;
        this.mpt = mpt;
    }

    async getBalances(address: string) {
        return {
            dai: await this.dai.balanceOf(address),
            mpt: await this.mpt.balanceOf(address),
        }
    }

    async buildUniswapPair() : Promise<IUniswapV2Pair> {
        return await ethers.getContractAt("IUniswapV2Factory", UniswapFactoryAddress).then((factory) => {
            factory.createPair(this.dai.address, this.mpt.address);
            return factory.getPair(this.dai.address, this.mpt.address).then((pairAddress) => ethers.getContractAt("IUniswapV2Pair", pairAddress));
        });
    }

    getAddresses() : string[] {
        return [this.mpt.address, this.dai.address];
    }
}

describe("MPToken", function () {

    // Deploy MPToken contract with 11*10^18 MPT as the initial supply for Alice
    // And move 10 Dai to Alice's account from the Dai Whale
    async function buildAccountsFixture() {
        const [alice, otherAccount] = await ethers.getSigners();

        const daiOwner: SignerWithAddress = await ethers.getImpersonatedSigner(DaiWhale);

        await otherAccount.sendTransaction({
            to: daiOwner.address,
            value: ethers.utils.parseEther("1"),
        });
    
        const mpToken = await ethers.getContractFactory("MPToken").then(
            (factory) => factory.deploy(ethers.utils.parseEther("11"))
            );

        const DAI = await ethers.getContractAt("IERC20", DaiAddress);

        await DAI.connect(daiOwner).transfer(alice.address, ethers.utils.parseEther("10"));

        const tokens = new Tokens(DAI, mpToken);

        return { alice, daiOwner, tokens };
    }


    it("Create pair and swap MPT to DAI", async function () {
        const { alice, tokens} = await loadFixture(buildAccountsFixture)

        const UniswapV2Pair = await tokens.buildUniswapPair();

        await tokens.dai.connect(alice).transfer(UniswapV2Pair.address, ethers.utils.parseEther("10"));
        await tokens.mpt.transfer(UniswapV2Pair.address, ethers.utils.parseEther("10"));

        await UniswapV2Pair.mint(alice.address);

        expect(await tokens.dai.balanceOf(alice.address)).to.equal(0);

        await tokens.getBalances(alice.address).then((balances) => {
            console.log("Alice's balances before swap: ", balances);
        });

        const reserveBefore = await UniswapV2Pair.getReserves();

        const router = await ethers.getContractAt("IUniswapV2Router01", UniswapRouterAddress);
        await tokens.mpt.approve(router.address, ethers.utils.parseEther("1"));

        await router.swapExactTokensForTokens(
            ethers.utils.parseEther("1"),
            0,
            tokens.getAddresses(),
            alice.address,
            (await time.latest()) + 1000000
        );

        const reserveAfter = await UniswapV2Pair.getReserves();

        expect(reserveAfter[0]).to.be.lt(reserveBefore[0]);
        expect(reserveAfter[1]).to.be.gt(reserveBefore[1]);

        console.log();
        console.log("Successfully swapped MPT to DAI");
        console.log("Reserves0 changed from ", reserveBefore[0], " to ", reserveAfter[0]);
        console.log("Reserves1 changed from ", reserveBefore[1], " to ", reserveAfter[1]);
        console.log();

        await tokens.getBalances(alice.address).then((balances) => {
            expect(balances.dai).to.be.gt(0);
            expect(balances.mpt).to.be.eq(0);
            console.log("Alice's balances after swap: ", balances);
        });
    });
    
})
    