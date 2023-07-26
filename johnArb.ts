import { BalancerSDK, BalancerSdkConfig, Network } from '@balancer-labs/sdk';


const foundArbitrageOpportunities = new Set<string>();
async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function findArbitrageOpportunities() {
  const config: BalancerSdkConfig = {
    network: Network.MAINNET,
    rpcUrl: `https://mainnet.infura.io/v3/`,
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
    const arbitrageOpportunities = johnsonsAlgorithm(graph, Array.from(graph.keys()));

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


type Vertex = string;
type Weight = number;
type Graph = Map<Vertex, Map<Vertex, Weight>>;

function johnsonsAlgorithm(graph: Graph, vertices: Vertex[]): Vertex[] {
  const newGraph = addSourceVertex(graph, vertices);
  const [distances, predecessors] = bellmanFordForJohnson(newGraph, [...vertices, 'source'], 'source');
  const reweightedGraph = reweightGraph(graph, vertices, distances);
  const allPairsShortestPaths = floydWarshallForJohnson(reweightedGraph, vertices);

  return findMostProfitableCycle(allPairsShortestPaths, vertices);
}

function addSourceVertex(graph: Graph, vertices: Vertex[]): Graph {
  const newGraph = new Map<Vertex, Map<Vertex, Weight>>(graph);
  newGraph.set('source', new Map<Vertex, Weight>());

  for (const vertex of vertices) {
    newGraph.get('source')!.set(vertex, 0);
  }

  return newGraph;
}

  
  function bellmanFordForJohnson(graph, vertices, source) {
    const distances = {};
    const predecessors = {};
  
    for (const vertex of vertices) {
      distances[vertex] = Infinity;
      predecessors[vertex] = null;
    }
    distances[source] = 0;
  
    for (let i = 0; i < vertices.length; i++) {
      for (const [u, connections] of graph.entries()) {
        for (const [v, weight] of connections.entries()) {
          if (distances[u] + weight < distances[v]) {
            distances[v] = distances[u] + weight;
            predecessors[v] = u;
          }
        }
      }
    }
  
    return [distances, predecessors];
  }
  
  function reweightGraph(graph, vertices, distances) {
    const reweightedGraph = new Map();
  
    for (const [u, connections] of graph.entries()) {
      reweightedGraph.set(u, new Map());
  
      for (const [v, weight] of connections.entries()) {
        const reweightedEdge = weight + distances[u] - distances[v];
        reweightedGraph.get(u).set(v, reweightedEdge);
      }
    }
  
    return reweightedGraph;
  }
  
  function floydWarshallForJohnson(graph: Graph, vertices: Vertex[]): Map<Vertex, Map<Vertex, Weight>> {
    const dist = new Map<Vertex, Map<Vertex, Weight>>();
  
    for (const u of vertices) {
      dist.set(u, new Map<Vertex, Weight>());
  
      for (const v of vertices) {
        if (u === v) {
          dist.get(u)!.set(v, 0);
        } else if (graph.has(u) && graph.get(u)!.has(v)) {
          dist.get(u)!.set(v, graph.get(u)!.get(v)!);
        } else {
          dist.get(u)!.set(v, Infinity);
        }
      }
    }
  
    for (const k of vertices) {
      for (const i of vertices) {
        for (const j of vertices) {
          const ijPath = dist.get(i)!.get(j)!;
          const ikPath = dist.get(i)!.get(k)!;
          const kjPath = dist.get(k)!.get(j)!;
  
          if (ikPath + kjPath < ijPath) {
            dist.get(i)!.set(j, ikPath + kjPath);
          }
        }
      }
    }
  
    return dist;
  }
  
  function findMostProfitableCycle(allPairsShortestPaths: Map<Vertex, Map<Vertex, Weight>>, vertices: Vertex[]): Vertex[] {
    let maxProfit = 0;
    let mostProfitableCycle: Vertex[] = [];
  
    for (const start of vertices) {
      for (const end of vertices) {
        const profit = -allPairsShortestPaths.get(start)!.get(end)! - allPairsShortestPaths.get(end)!.get(start)!;
  
        if (profit > maxProfit) {
          maxProfit = profit;
          mostProfitableCycle = [start, end];
        }
      }
    }
  
    return mostProfitableCycle;
  }
  // Run the function every 5 minutes 
  //no need
  findArbitrageOpportunities();
  