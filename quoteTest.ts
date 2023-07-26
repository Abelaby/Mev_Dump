import { ethers } from 'ethers';
import { QUOTER_CONTRACT_ADDRESS } from './libs/constants';
import Quoter from './ABI/Quoter.json';



async function main() {
const Provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/');

const quoterContract = new ethers.Contract(
    QUOTER_CONTRACT_ADDRESS,
    Quoter.abi,
    Provider
  );
   const amountIn = ethers.utils.parseUnits('1', '18'); // Parse decimals to integer

    try {
      const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', //weth
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', //USDC
        '500',
        amountIn,
        0
      );
      const amountOut = ethers.utils.formatUnits(quotedAmountOut, '6')
      const quotePrice0to1 = amountOut;
      const quotePrice1to0 = 1 / parseFloat(quotePrice0to1); // Parse decimals to integer

      console.log("quotePrice0to1", quotePrice0to1);
      console.log("quotePrice1to0", quotePrice1to0);
    } catch (error) {
      console.error(`Error calculating spot price for pool :`, error);
    }
  
}

main();
