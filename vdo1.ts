import { ethers } from 'ethers'
import { CurrentConfig } from './config'
import { computePoolAddress } from '@uniswap/v3-sdk'
import Quoter from './ABI/Quoter.json'
import IUniswapV3PoolABI from './ABI/IUniswapV3Pool.json'
import {
  POOL_FACTORY_CONTRACT_ADDRESS,
  QUOTER_CONTRACT_ADDRESS,
} from './libs/constants'
import { getProvider } from './libs/providers'
import { toReadableAmount, fromReadableAmount } from './libs/conversion'

//const provider = 'https://mainnet.infura.io/v3/819e8d5c4e5e4e3dbc5ed6630346bd7a'

const Provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/')

export async function quote(): Promise<string> {
  const quoterContract = new ethers.Contract(
    QUOTER_CONTRACT_ADDRESS,
    Quoter.abi,
    Provider
  )
  const poolConstants = await getPoolConstants()

  const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
    poolConstants.token1,
    poolConstants.token0,
    poolConstants.fee,
    fromReadableAmount(
      CurrentConfig.tokens.amountIn,
      CurrentConfig.tokens.in.decimals
    ).toString(),
    0
  )
  console.log('Quoted Amount Out:', quotedAmountOut.toString())

  return toReadableAmount(quotedAmountOut, CurrentConfig.tokens.out.decimals)
}



async function getPoolConstants(): Promise<{
  token0: string
  token1: string
  fee: number
}> {
  const currentPoolAddress = computePoolAddress({
    factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
    tokenA: CurrentConfig.tokens.in,
    tokenB: CurrentConfig.tokens.out,
    fee: CurrentConfig.tokens.poolFee,
  })

  const poolContract = new ethers.Contract(
    currentPoolAddress,
    IUniswapV3PoolABI.abi,
    Provider
  )
  const [token0, token1, fee] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
  ])
  //console.log(poolContract)
  console.log('Token0:', token0)
  console.log('Token1:', token1)
  console.log('Fee:', fee)

  return {
    token0,
    token1,
    fee,
  }
}

//getPoolConstants();
quote();

