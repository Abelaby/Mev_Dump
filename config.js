"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentConfig = void 0;
var v3_sdk_1 = require("@uniswap/v3-sdk");
var constants_1 = require("./libs/constants");
// Example Configuration
exports.CurrentConfig = {
    rpc: {
        local: 'http://localhost:8545',
        mainnet: '',
    },
    tokens: {
        in: constants_1.USDC_TOKEN,
        amountIn: 1000,
        out: constants_1.WETH_TOKEN,
        poolFee: v3_sdk_1.FeeAmount.MEDIUM,
    },
};
