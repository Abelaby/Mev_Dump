import { BalancerSDK, BalancerSdkConfig, Network, Vault, Vault__factory, Swaps,SwapType,BatchSwapStep } from '@balancer-labs/sdk';
import { Wallet } from 'ethers';
import { ethers } from 'ethers';


const PRIVATE_KEY = '';
const INFURA_API_KEY = '';

async function findArbitrageOpportunities() {
  const config: BalancerSdkConfig = {
    network: Network.MAINNET,
    rpcUrl: `https://mainnet.infura.io/v3/f5asfsadf363227615e463db096757712e53f20`,
  };
  const balancer = new BalancerSDK(config);
  const { pools } = balancer.data;
  const vaultAddress = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';


  try {
    const allPools = await pools.all();
    const filteredPools = allPools.filter(pool => parseFloat(pool.totalLiquidity) > 50000);

    let arbitrageOpportunities: string[] = [];
    while (arbitrageOpportunities.length === 0) {
        // Build a graph of token connections
      const graph = await buildTokenGraph(filteredPools, balancer);
      // Perform graph search to find arbitrage opportunities using FloydWarshall algorithm
    arbitrageOpportunities = findArbitrageOpportunitiesFloydWarshall(graph);

   for (const opportunity of arbitrageOpportunities) {
       const path = opportunity.split('-').slice(1).map(address => address.split('_')[1]);
       await executeFlashSwap(path, vaultAddress, balancer);
      }

    } 
    }
    catch (error) {
        console.error('An error occurred:', error);
  }
}

import vaultAbi from './abig';
async function executeFlashSwap(path: string[], vaultAddress: string, balancer : BalancerSDK ) {
    const provider = new ethers.providers.InfuraProvider(Network.MAINNET, INFURA_API_KEY);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
    const swaps: BatchSwapStep[] = [];
    const assets: string[] = [];
  
    for (let i = 0; i < path.length - 1; i++) {
      const poolId = getPoolIdFromKey(path[i]);
  
      if (!poolId) {
        throw new Error(`Pool not found for path ${path[i]}`);
      }
  
      const tokenA = path[i].split('_')[1];
      const tokenB = path[i + 1].split('_')[1];
  
      const swapStep: BatchSwapStep = {
        poolId,
        assetInIndex: i === 0 ? i : i - 1,
        assetOutIndex: i === 0 ? i + 1 : i,
        amount: '1000000000000000', // Replace with the appropriate amount for each swap step
        userData: '0x',
      };
  
      swaps.push(swapStep);
      assets.push(tokenA);
    }
  
    const funds = {
      sender: wallet.address,
      fromInternalBalance: false,
      recipient: wallet.address,
      toInternalBalance: false,
    };
  
    const limits = ['1000000000000000', '0', '0'];
    const deadline = '9999999999999999';
  
    const encodedBatchSwapData = Swaps.encodeBatchSwap({
      kind: SwapType.SwapExactIn,
      swaps,
      assets,
      funds,
      limits,
      deadline,
    });

    const deltas = await balancer.swaps.queryBatchSwap({
        kind: SwapType.SwapExactIn,
        swaps,
        assets,
      });
      console.log(deltas.toString());  
    // deltas can be implemented for check , must use call instead of transaction
    // await wallet.call()
    const flashSwapTx = await wallet.sendTransaction({
      to: vaultAddress,
      data: encodedBatchSwapData,
      value: '0',
      gasLimit: 4000000,
    });
  
    console.log('Flash Swap Transaction:', flashSwapTx.hash);
  }
  
  
  async function buildTokenGraph(poolfilter, balancer) {
    const graph = new Map();
    const uniqueTokens = new Set();
  
    for (const pool of poolfilter) {
      const tokens = pool.tokens.map((token) => token.id);
      const poolId = pool.id;
      const pool1 = await balancer.pools.find(poolId);
  
      for (let j = 0; j < tokens.length; j++) {
        const tokenA = tokens[j];
        uniqueTokens.add(tokenA);
        const priceTokenA = parseFloat(pool1.tokens[j].token?.latestUSDPrice || '0');
  
        for (let k = j + 1; k < tokens.length; k++) {
          const tokenB = tokens[k];
          uniqueTokens.add(tokenB);
          const priceTokenB = parseFloat(pool1.tokens[k].token?.latestUSDPrice || '0');
  
          const wrtPriceAB = priceTokenA / priceTokenB;
          const wrtPriceBA = priceTokenB / priceTokenA;
          const spotPriceAtoB = wrtPriceAB * (1 + parseFloat(pool1.swapFee));
          const spotPriceBtoA = wrtPriceBA * (1 + parseFloat(pool1.swapFee));
  
          const tokenPairKey = `${tokenA}_${tokenB}`;
          const inverseTokenPairKey = `${tokenB}_${tokenA}`;
  
          graph.set(tokenPairKey, Math.log(spotPriceAtoB));
          graph.set(inverseTokenPairKey, Math.log(spotPriceBtoA));
        }
      }
    }
  
    return { graph, nodes: Array.from(uniqueTokens) };
  }

  function findArbitrageOpportunitiesFloydWarshall(graphData) {
    const { graph, nodes } = graphData;
    const distances = new Map();
    const next = new Map();

  // Initialize distances and next nodes
  for (const node of nodes) {
    distances.set(node, new Map());
    next.set(node, new Map());
    for (const neighbor of nodes) {
      distances.get(node).set(neighbor, Infinity);
      next.get(node).set(neighbor, null);
    }
    distances.get(node).set(node, 0);
  }

  // Update distances and next nodes based on direct edges
  for (const [edge, weight] of graph.entries()) {
    const [source, target] = edge.split('_');
    distances.get(source).set(target, weight);
    next.get(source).set(target, target);
  }

  // Update distances and next nodes based on intermediate nodes
  for (const intermediate of nodes) {
    for (const source of nodes) {
      for (const target of nodes) {
        const newDistance = distances.get(source).get(intermediate) + distances.get(intermediate).get(target);
        if (newDistance < distances.get(source).get(target)) {
          distances.get(source).set(target, newDistance);
          next.get(source).set(target, next.get(source).get(intermediate));
        }
      }
    }
  }

  // Find negative weight cycles
  const arbitrageOpportunities: string[] = [];
  for (const source of nodes) {
    for (const target of nodes) {
      if (distances.get(source).get(target) < 0) {
        const cycle = findNegativeWeightCycle(next, source, target);
        arbitrageOpportunities.push(cycle.join(' -> '));

      }
    }
  }

  return arbitrageOpportunities;
}

function findNegativeWeightCycle(next, source, target) {
    const cycle: string[] = [source];
    let node = source;
    while (node !== target) {
      node = next.get(node).get(target);
      cycle.push(node);
    }
    cycle.push(source);
    return cycle;
  }

 /* function findtokenaddress(key) {
    const startIndex = key.indexOf('-') + 1; // Find the index after the first '-'
    const endIndex = key.indexOf('_', startIndex); // Find the index of the first '_'
  
    // Extract the pool ID substring from the key
    const poolId = key.substring(startIndex, endIndex);
  
    return poolId;
  }*/
  function getPoolIdFromKey(key) {
    const separatorIndex = key.indexOf('-'); // Find the index of the first '-'
    const poolId = key.substring(0, separatorIndex); // Extract the pool ID from the key
    return poolId;
  }
  


findArbitrageOpportunities();
