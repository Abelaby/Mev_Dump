import { BalancerSDK, BalancerSdkConfig, Network } from '@balancer-labs/sdk';

async function findArbitrageOpportunities() {
  const config: BalancerSdkConfig = {
    network: Network.MAINNET,
    rpcUrl: ``,
  };
  const balancer = new BalancerSDK(config);
  const { pools } = balancer.data;

  try {
    const allPools = await pools.all();
    const filteredPools = allPools.filter(pool => parseFloat(pool.totalLiquidity) > 50000);

    let arbitrageOpportunities: string[] = [];
    while (arbitrageOpportunities.length === 0) {
      const graph = await buildTokenGraph(filteredPools, balancer);
      arbitrageOpportunities = findArbitrageOpportunitiesFloydWarshall(graph);

      if (arbitrageOpportunities.length > 0) {
        console.log('Arbitrage opportunities found:', arbitrageOpportunities);
      } else {
        console.log('No arbitrage opportunities found. Repeating the process...');
      }
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

async function buildTokenGraph(poolfilter, balancer) {
  const graph = new Map();
  const uniqueTokens = new Set();

  for (const pool of poolfilter) {
    const tokens = pool.tokens.map((token) => token.address);
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
        const slippageTolerance = 0.005;
        const spotPriceAtoB = wrtPriceAB * (1 + parseFloat(pool1.swapFee)) * (1 - slippageTolerance);
        const spotPriceBtoA = wrtPriceBA * (1 + parseFloat(pool1.swapFee)) * (1 - slippageTolerance);

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

// Run the function every 5 minutes
setInterval(findArbitrageOpportunities, 5 * 60 * 1000);
