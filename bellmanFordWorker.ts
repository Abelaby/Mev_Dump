import { parentPort } from 'worker_threads';

interface Edge {
  u: string;
  v: string;
  weight: number;
}

export interface ArbitrageOpportunity {
  path: string[];
  profit: number;
}

parentPort?.on('message', ({ graph, nodes }: { graph: Edge[]; nodes: string[] }) => {
  console.log('Worker received graph and nodes:', graph, nodes);
  const distances: Map<string, number> = new Map();

  for (const node of nodes) {
    distances.set(node, Infinity);
  }

  const startNode: string = nodes[0];
  distances.set(startNode, 0);

  for (let i = 1; i < nodes.length; i++) {
    for (const { u, v, weight } of graph) {
      const newDistance = distances.get(u)! + weight;

      if (newDistance < distances.get(v)!) {
        distances.set(v, newDistance);
      }
    }
  }

  const edgeMap = new Map(graph.map((edge) => [`${edge.u}_${edge.v}`, edge.weight]));
  const opportunities: ArbitrageOpportunity[] = [];

  for (const { u, v, weight } of graph) {
    const newDistance = distances.get(u)! + weight;

    if (newDistance < distances.get(v)!) {
      const path: string[] = [v, u];
      let currentNode = u;

      while (currentNode !== startNode && currentNode !== '') {
        const prevDistance = distances.get(currentNode)!;
        const neighbors = graph.filter((edge) => edge.u === currentNode);
        const nextNode = neighbors.reduce((prev, curr) => {
          const edgeWeight = edgeMap.get(`${curr.u}_${curr.v}`) || 0;
          const currDistance = distances.get(curr.v)!;
          return prevDistance + edgeWeight === currDistance ? curr.v : prev;
        }, '');
        path.unshift(nextNode);
        currentNode = nextNode;
      }

      const profit = Math.exp(-newDistance) - 1;
      opportunities.push({ path, profit });
    }
  }

  if (opportunities.length > 0) {
    opportunities.sort((a, b) => b.profit - a.profit);
    parentPort?.postMessage(opportunities[0]);
  } else {
    parentPort?.postMessage(null);
  }

  console.log('Worker finished searching for arbitrage opportunity');
});
