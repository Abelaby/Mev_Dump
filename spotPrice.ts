import { BalancerSDK, BalancerSdkConfig, Network,BalancerErrorCode,BalancerError,Vault } from '@balancer-labs/sdk';

async function getSpotPrice() {
  try {
    const config: BalancerSdkConfig = {
      network: Network.MAINNET,
      rpcUrl: `https://mainnet.infura.io/v3/`,
    };
    const balancer = new BalancerSDK(config);
    const { pools } = balancer.data;
  
    // 80/20 BAL/WETH pool
    const poolId = '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014';
    const pool = await balancer.pools.find(poolId);
    if (!pool) {
      throw new Error('Pool not found');
    }
  
    const spotPrice = await pool.calcSpotPrice(
      '0xba100000625a3754423978a60c9317c58a424e3D', // BAL
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // WETH
    );
    
    let result; // Declare result variable
    result = await pools.all(); // Assign result the value of pools.all()
    //const filteredPools = result.filter(pool => pool.totalLiquidity > 100000);
    /*for (let i = 0; i < filteredPools.length; i++) {
      const poolA = filteredPools[i];
      const tokens = poolA.tokens.map((token: any) => token.address);
      const poolId1 = poolA.id;
      const pool1 = await balancer.pools.find(poolId1)
      console.log(tokens )
      if (!pool1) throw new BalancerError(BalancerErrorCode.POOL_DOESNT_EXIST);
      const temp1 = await pool1.calcSpotPrice(tokens[0],tokens[1]);
      console.log(temp1)
      
      
        
    }*/
    const balbalance = parseFloat(pool.tokens[0].balance || '0');
    const wethbalance = parseFloat(pool.tokens[1].balance || '0');
    const balwt = parseFloat(pool.tokens[0].weight || '0');
    const wethwt= parseFloat(pool.tokens[1].weight || '0');
    

    if (isNaN(balbalance) || isNaN(wethbalance || balwt || wethwt  )) {
        throw new BalancerError(BalancerErrorCode.MISSING_TOKENS);
    }

    const price =   (balbalance / wethbalance) * (wethwt / balwt);
    console.log('WeTH/BAL',price + (price * parseFloat(pool.swapFee)));
    console.log(price)

    const revPrice= ( wethbalance / balbalance) * (  balwt / wethwt);
    console.log('revPrice', revPrice)

    //const revFee = revPrice + revPrice * parseFloat(pool.swapFee)
    //console.log('revPrice with swap fee', revFee)

    //const feePrice = price + price * parseFloat(pool.swapFee)
    //console.log('with swap fee',feePrice)
    
    //console.log('Spot Price:', spotPrice);
    //console.log('Result:', result); // Print the result
    //console.log(pool.priceRateProviders)
    //console.log(pool.tokens[0].address);
    //console.log(pool.tokens[1].address);
   // console.log('structure of pool: ',pool)
    //console.log('----------------------------------------------------------------------')
    //console.log('structure of token', pool.tokens[0])
    //return spotPrice.toString();

    const test = await balancer.contracts.vault.getPoolTokenInfo('0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014','0xba100000625a3754423978a60c9317c58a424e3D')
    console.log(test)
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

getSpotPrice();
