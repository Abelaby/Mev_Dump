import { ethers } from 'ethers';
import { QUOTER_CONTRACT_ADDRESS } from './libs/constants';
import { poolData } from './poolData';
import Quoter from './ABI/Quoter.json';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import {ArbitrageOpportunity} from './bellmanFordWorker';
//import { Edge } from './node_modules/@ty';

interface Token {
    id: string;
    name: string;
    symbol: string;
    decimals: string;
  }
  
  interface Pool {
    id: string;
    token0: Token;
    token1: Token;
    feeTier: string; // Updated property name
  }
  
  interface PoolData {
    data: {
      pools: Pool[];
    };
  }
  
  const Provider = new ethers.providers.JsonRpcProvider('://.infura.io/v3/');
  
  async function buildTokenGraph(poolData: PoolData) {
    const graph = new Map<string, number>();
    const uniqueTokens = new Set<string>();
  
    const pools = poolData.data.pools.slice(0, 900);
  
    const quoterContract = new ethers.Contract(
      QUOTER_CONTRACT_ADDRESS,
      Quoter.abi,
      Provider
    );
  
    const fetchQuotePrice = async (pool: Pool) => {
      const { token0, token1 } = pool;
  
      uniqueTokens.add(token0.id);
      uniqueTokens.add(token1.id);
  
      const amountIn = ethers.utils.parseUnits('1', token0.decimals); // Parse decimals to integer
  
      try {
        const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
          token0.id,
          token1.id,
          pool.feeTier,
          amountIn,
          0
        );
        
  
        const amountOut = ethers.utils.formatUnits(quotedAmountOut, token1.decimals)
        const quotePrice0to1 = Math.log(parseFloat(amountOut));
        const quotePrice1to0 = -quotePrice0to1; 
  
        const tokenPairKey = `${token0.id}_${token1.id}`;
        const inverseTokenPairKey = `${token1.id}_${token0.id}`;
  
        graph.set(tokenPairKey, quotePrice0to1); 
        graph.set(inverseTokenPairKey, quotePrice1to0); 
      } catch (error) {
        console.error(`Error calculating spot price for pool ${pool.id}:`);
      }
    };
  
    // Fetch quote prices for all pools concurrently
    await Promise.all(pools.map(fetchQuotePrice));
  
    return { graph, nodes: Array.from(uniqueTokens) };
  }
  

interface Edge {
  u: string;
  v: string;
  weight: number;
}

async function bellmanFord(graph: Edge[], nodes: string[]): Promise<ArbitrageOpportunity | null> {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./bellmanFordWorker.ts');
    

    worker.postMessage({ graph, nodes });

    worker.on('message', (arbitrageOpportunity: ArbitrageOpportunity | null) => {
      resolve(arbitrageOpportunity);
    });

    worker.on('error', (error) => {
      reject(error);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}
async function main() {
    const graphData = await buildTokenGraph(poolData);
  
    if (isMainThread) {
        const worker = new Worker('./bellmanFordWorker.js');

        worker.on('message', (arbitrageOpportunity) => {
          console.log(arbitrageOpportunity);
        });
        
        worker.on('error', (error) => {
          console.error('Worker error:', error.message);
          console.error('Stack trace:', error.stack);
        });
        
        worker.on('exit', (code) => {
          if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
          }
        });
        
    } else {
      const arbitrageOpportunity = bellmanFord(workerData.graph, workerData.nodes);
      parentPort!.postMessage(arbitrageOpportunity);
    }
    
  }
  
  
main();
