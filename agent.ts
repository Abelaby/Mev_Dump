import { ethers, providers, Wallet, Contract } from 'ethers';
import { BalancerSubgraphClient, BalancerSubgraphPoolsBatch, BalancerSubgraphPool } from '@balancer-labs/sdk';
import { SwapTypes, encodeSwap, batchSwap } from '@balancer-labs/balancer-js';
import { Balancer, SwapTypes } from "@balancer-labs/sor";

async function executeMultihopBatchSwap(tokenPath, senderAddress, recipientAddress, amountIn, privateKey, balancerVaultAddress) {
  try {
    // Set up provider and signer
    const provider = new ethers.providers.InfuraProvider('homestead', 'INFURA_API_KEY');
    const signer = new ethers.Wallet(privateKey, provider);

    // Set up Balancer SDK
    const balancer = await Balancer.create(provider, signer);

    // Construct swaps array
    const swaps = [];
    for (let i = 0; i < tokenPath.length - 1; i++) {
      const fromToken = tokenPath[i];
      const toToken = tokenPath[i + 1];

      const poolId = await balancer.getPoolIdFromTokens(fromToken, toToken);
      const assetIndexes = await balancer.getPoolAssets(poolId);

      const swap = {
        poolId,
        assetInIndex: assetIndexes[0],
        assetOutIndex: assetIndexes[1],
        amount: amountIn,
        userData: ethers.utils.hexlify(0),
      };

      swaps.push(swap);
    }

    // Set up transaction parameters
    const txParams = {
      swaps: swaps,
      sender: senderAddress,
      recipient: recipientAddress,
      deadline: '999999999999999999',
      limits: ['0'],
      vault: balancerVaultAddress,
      permittee: ethers.constants.AddressZero,
      permitData: {
        v: 0,
        r: ethers.constants.HashZero,
        s: ethers.constants.HashZero,
      },
    };

    // Execute the batch swap
    const tx = await balancer.batchSwap(txParams);
    console.log(tx.hash);
  } catch (error) {
    console.log('Error executing batch swap:', error);
  }
}

const tokenPath = ['ETH', 'USDC', 'WBTC'];
const senderAddress = 'SENDER_ADDRESS';
const recipientAddress = 'RECIPIENT_ADDRESS';
const amountIn = '1000000000000000000'; // 1 ETH in wei
const privateKey = 'YOUR_PRIVATE_KEY';
const balancerVaultAddress = 'BALANCER_VAULT_ADDRESS';

executeMultihopBatchSwap(tokenPath, senderAddress, recipientAddress, amountIn, privateKey, balancerVaultAddress);
