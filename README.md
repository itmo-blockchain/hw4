# HW4 Fork mainnet and swap tokens

## Usage

First, install dependencies:

```bash
npm install
```

And specify at `.env` file your api key for Alchemy `ALCHEMY_TOKEN`

Then, run the script:

```bash
npm test
```

## Output

```bash
➜  hw4  npm test

> hw4@1.0.0 test
> npx hardhat test



  MPToken
Alice's balances before swap:  {
  dai: BigNumber { value: "0" },
  mpt: BigNumber { value: "1000000000000000000" }
}

Successfully swapped MPT to DAI
Reserves0 changed from  BigNumber { value: "10000000000000000000" }  to  BigNumber { value: "9093389106119850869" }
Reserves1 changed from  BigNumber { value: "10000000000000000000" }  to  BigNumber { value: "11000000000000000000" }

Alice's balances after swap:  {
  dai: BigNumber { value: "906610893880149131" },
  mpt: BigNumber { value: "0" }
}
    ✔ Create pair and swap MPT to DAI (8638ms)


  1 passing (9s)
```
