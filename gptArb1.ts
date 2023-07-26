import { BalancerSDK, BalancerSdkConfig, Network } from '@balancer-labs/sdk';


const foundArbitrageOpportunities = new Set<string>();
async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function findArbitrageOpportunities() {
  const config: BalancerSdkConfig = {
    network: Network.MAINNET,
    rpcUrl: `https://mainnet.infura.io/v3/f5363227615e463db096757712e53f20`,
  };
  const balancer = new BalancerSDK(config);
  
  while(true){
  try {
    await balancer.data.pools;
    const { pools } = balancer.data;
    const allPools = await pools.all();
    const filteredPools = allPools.filter(pool => {
        if (pool.totalSwapVolume === undefined) {
          return false;
        }
        const swapVolume = parseFloat(pool.totalSwapVolume);
        return swapVolume > 10000;
      });
      
      
    const graph = buildTokenGraph(filteredPools);
    const arbitrageOpportunities = findArbitrageOpportunitiesBellmanFord(graph, filteredPools);

  const uniqueOpportunities = arbitrageOpportunities.filter(opportunity => !foundArbitrageOpportunities.has(opportunity));

  if (uniqueOpportunities.length > 0) {
    console.log('Arbitrage opportunities found:', uniqueOpportunities);
    uniqueOpportunities.forEach(opportunity => foundArbitrageOpportunities.add(opportunity));
  } else {
    console.log('No new arbitrage opportunities found.');
  }
  const minDelay = 1 * 60 * 1000; // 1 minute
      const maxDelay = 5 * 60 * 1000; // 5 minutes
      const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
      await sleep(randomDelay);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}}

function buildTokenGraph(pools: any[]): Map<string, Map<string, number>> {
  const graph = new Map();

  for (const pool of pools) {
    const tokens = pool.tokens.map((token: any) => token.address);

    for (let i = 0; i < tokens.length; i++) {
      const tokenA = tokens[i];
      const priceTokenA = parseFloat(pool.tokens[i].token?.latestUSDPrice || '0');

      if (!graph.has(tokenA)) {
        graph.set(tokenA, new Map());
      }

      for (let j = i + 1; j < tokens.length; j++) {
        const tokenB = tokens[j];
        const priceTokenB = parseFloat(pool.tokens[j].token?.latestUSDPrice || '0');

        if (!graph.has(tokenB)) {
          graph.set(tokenB, new Map());
        }

        const wrtPriceAB = priceTokenA / priceTokenB;
        const wrtPriceBA = priceTokenB / priceTokenA;
        const slippageTolerance = 0.005;
        const spotPriceAtoB = wrtPriceAB * (1 + parseFloat(pool.swapFee)) * (1 - slippageTolerance);
        const spotPriceBtoA = wrtPriceBA * (1 + parseFloat(pool.swapFee)) * (1 - slippageTolerance);

        graph.get(tokenA).set(tokenB, Math.log(spotPriceAtoB));
        graph.get(tokenB).set(tokenA, Math.log(spotPriceBtoA));
      }
    }
  }

  return graph;
}


// ... (previous code remains the same)
function findArbitrageOpportunitiesBellmanFord(graph: Map<string, Map<string, number>>, pools: any[]): string[] {
    const vertices = Array.from(graph.keys());
    const edges = getEdges(graph);
    const distances = initializeDistances(vertices);
    const predecessors = initializePredecessors(vertices);
  
    for (let i = 0; i < vertices.length - 1; i++) {
      for (const [u, v, weight] of edges) {
        if (distances[u] + weight < distances[v]) {
          distances[v] = distances[u] + weight;
          predecessors[v] = u;
        }
      }
    }
  
    for (const [u, v, weight] of edges) {
        if (distances[u] + weight < distances[v]) {
          const cycle = getCycle(predecessors, u, pools);
          if (cycle.length > 0) {
            return cycle;
          }
        }
      }
    
      return [];
    }
  
  function getEdges(graph: Map<string, Map<string, number>>): [string, string, number][] {
    const edges: [string, string, number][] = [];
  
    for (const [u, connections] of graph.entries()) {
      for (const [v, weight] of connections.entries()) {
        edges.push([u, v, weight]);
      }
    }
  
    return edges;
  }
  
  // ... (rest of the code remains the same)
  
  function initializeDistances(vertices: string[]): Record<string, number> {
    const distances: Record<string, number> = {};
  
    for (const vertex of vertices) {
      distances[vertex] = Infinity;
    }
  
    distances[vertices[0]] = 0;
  
    return distances;
  }
  
  function initializePredecessors(vertices: string[]): Record<string, string | null> {
    const predecessors: Record<string, string | null> = {};
  
    for (const vertex of vertices) {
      predecessors[vertex] = null;
    }
  
    return predecessors;
  }
  
  function getCycle(predecessors: Record<string, string | null>, start: string, pools: any[]): string[] {
    const cycle: string[] = [];
    let current = start;
  
    while (!cycle.includes(current)) {
      cycle.push(current);
      current = predecessors[current]!;
    }
  
    // Add the starting token to the end of the cycle to represent a closed loop
    cycle.push(start);
  
    // Check if the tokens in the cycle are in the same pools
    const validCycle = isValidCycle(cycle, pools);
  
    if (validCycle) {
      return cycle;
    } else {
      return [];
    }
  }
  
  function isValidCycle(cycle: string[], pools: any[]): boolean {
    for (let i = 0; i < cycle.length - 1; i++) {
      const tokenA = cycle[i];
      const tokenB = cycle[i + 1];
  
      const matchingPools = pools.filter(pool => {
        const tokenAddresses = pool.tokens.map((token: any) => token.address);
        return tokenAddresses.includes(tokenA) && tokenAddresses.includes(tokenB);
      });
  
      if (matchingPools.length < 2) {
        return false;
      }
    }
  
    return true;
  }
  
  // Run the function every 5 minutes 
  //no need
  findArbitrageOpportunities();
  