import { BalancerSDK, BalancerSdkConfig, Network, BalancerError, BalancerErrorCode } from '@balancer-labs/sdk';

async function calculateSpotPrice(): Promise<string> {
  const config: BalancerSdkConfig = {
    network: Network.MAINNET,
    rpcUrl: `https://mainnet.infura.io/v3/`,
  };
  const balancer = new BalancerSDK(config);

  const poolId = '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014';
  const pool = await balancer.pools.find(poolId);
  if (!pool) throw new BalancerError(BalancerErrorCode.POOL_DOESNT_EXIST);

  const spotPrice = await pool.calcSpotPrice(
    '0xba100000625a3754423978a60c9317c58a424e3D', // BAL
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // WETH
  );

  return spotPrice.toString();
}

calculateSpotPrice()
  .then((spotPrice) => {
    console.log('Spot Price:', spotPrice);
  })
  .catch((error) => {
    console.error('Error:', error.message);
  });

