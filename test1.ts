import { BalancerSDK, BalancerSdkConfig, Network,BalancerError, BalancerErrorCode} from '@balancer-labs/sdk';

async function findArbitrageOpportunities() {
  const config: BalancerSdkConfig = {
    network: Network.MAINNET,
    rpcUrl: ``,
  };
  const balancer = new BalancerSDK(config);
  const { pools } = balancer.data;

  try {
    const allPools = await pools.all();
    const filteredPools = allPools.filter(pool => parseFloat(pool.totalLiquidity) > 100000);
    // Build a graph of token connections
    const graph = await buildTokenGraph(filteredPools, balancer);

    console.log(graph);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

async function buildTokenGraph(poolfilter, balancer) {
  const graph = new Map();

  for (let i = 0; i < poolfilter.length; i++) {
    const pool = poolfilter[i];
    const tokens = pool.tokens.map((token) => token.address);
    const poolId = pool.id;
    const pool1 = await balancer.pools.find(poolId);

    if (!pool1) {
      throw new BalancerError(BalancerErrorCode.POOL_DOESNT_EXIST);
    }

    for (let j = 0; j < tokens.length; j++) {
      const tokenA = tokens[j];
      const priceTokenA = parseFloat(pool1.tokens[j].token?.latestUSDPrice || '0');

      for (let k = j + 1; k < tokens.length; k++) {
        const tokenB = tokens[k];
        const priceTokenB = parseFloat(pool1.tokens[k].token?.latestUSDPrice || '0');

        if (isNaN(priceTokenA) || isNaN(priceTokenB)) {
          throw new BalancerError(BalancerErrorCode.MISSING_TOKENS);
        }

        const wrtPriceAB = priceTokenA / priceTokenB;
        const wrtPriceBA = priceTokenB / priceTokenA;
        const spotPriceAtoB = wrtPriceAB * (1 + parseFloat(pool1.swapFee));
        const spotPriceBtoA = wrtPriceBA * (1 + parseFloat(pool1.swapFee));

        const tokenPairKey = `${tokenA}_${tokenB}`;
        const inverseTokenPairKey = `${tokenB}_${tokenA}`;

        graph.set(tokenPairKey, spotPriceAtoB);
        graph.set(inverseTokenPairKey, spotPriceBtoA);

       // console.log('Assigned spotPriceAtoB:', spotPriceAtoB);
        //console.log('Assigned spotPriceBtoA:', spotPriceBtoA);
        //console.log('graph.get(tokenPairKey):', graph.get(tokenPairKey));
        //console.log('graph.get(inverseTokenPairKey):', graph.get(inverseTokenPairKey));
        //console.log(graph.get('0xba100000625a3754423978a60c9317c58a424e3d_0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'));
        //console.log(graph.get('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2_0xba100000625a3754423978a60c9317c58a424e3d'));
        //console.log(tokenA, tokenB);
        //console.log(priceTokenA);
        //console.log(priceTokenB);
        //console.log(pool1.tokens[k].id )
        
      }
    }
  }

  return graph;
}


findArbitrageOpportunities();
