import { BalancerSDK, BalancerSdkConfig, Network } from '@balancer-labs/sdk';

async function findArbitrageOpportunities() {
  const config: BalancerSdkConfig = {
    network: Network.MAINNET,
    rpcUrl: `https://mainnet.infura.io/v3/`,
  };
  const balancer = new BalancerSDK(config);
  const { pools } = balancer.data;

  try {
    const allPools = await pools.all();
    const filteredPools = allPools.filter(pool => parseFloat(pool.totalLiquidity) > 50000);
    const graph = buildTokenGraph(filteredPools);
    const arbitrageOpportunities = findArbitrageOpportunitiesBellmanFord(graph);

    if (arbitrageOpportunities.length > 0) {
      console.log('Arbitrage opportunities found:', arbitrageOpportunities);
    } else {
      console.log('No arbitrage opportunities found.');
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

function buildTokenGraph(pools: any[]): Record<string, Record<string, number>> {
  const graph: Record<string, Record<string, number>> = {};

  // Iterate over the pools
  for (const pool of pools) {
    const tokens = pool.tokens.map((token: any) => token.address);

    // Add token connections to the graph
    for (let i = 0; i < tokens.length; i++) {
      const tokenA = tokens[i];
      const priceTokenA = parseFloat(pool.tokens[i].token?.latestUSDPrice || '0');

      if (!(tokenA in graph)) {
        graph[tokenA] = {};
      }

      for (let j = i + 1; j < tokens.length; j++) {
        const tokenB = tokens[j];
        const priceTokenB = parseFloat(pool.tokens[j].token?.latestUSDPrice || '0');

        if (!(tokenB in graph)) {
          graph[tokenB] = {};
        }

        const wrtPriceAB = priceTokenA / priceTokenB;
        const wrtPriceBA = priceTokenB / priceTokenA;
        const slippageTolerance = 0.005;
        const spotPriceAtoB = wrtPriceAB * (1 + parseFloat(pool.swapFee)) * (1 - slippageTolerance);
        const spotPriceBtoA = wrtPriceBA * (1 + parseFloat(pool.swapFee)) * (1 - slippageTolerance);

        graph[tokenA][tokenB] = Math.log(spotPriceAtoB);
        graph[tokenB][tokenA] = Math.log(spotPriceBtoA);
      }
    }
  }

  return graph;
}


function findArbitrageOpportunitiesBellmanFord(graph: Record<string, Record<string, number>>): string[] {
  const vertices = Object.keys(graph);
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
      const cycle = getCycle(predecessors, u);
      return cycle;
    }
  }

  return [];
}

function getEdges(graph: Record<string, Record<string, number>>): [string, string, number][] {
  const edges: [string, string, number][] = [];

  for (const u in graph) {
    for (const v in graph[u]) {
      edges.push([u, v, graph[u][v]]);
    }
  }

  return edges;
}

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

function getCycle(predecessors: Record<string, string | null>, start: string): string[] {
  const cycle: string[] = [];
  let current = start;

  while (!cycle.includes(current)) {
    cycle.push(current);
    current = predecessors[current]!;
  }

  cycle.push(current);

  return cycle;
}

// Run the function every 5 minutes
setInterval(findArbitrageOpportunities, 5 * 60 * 1000);
