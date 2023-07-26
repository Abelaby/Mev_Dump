"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var sdk_1 = require("@balancer-labs/sdk");
function findArbitrageOpportunities() {
    return __awaiter(this, void 0, void 0, function () {
        var config, balancer, pools, allPools, filteredPools, graph, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = {
                        network: sdk_1.Network.MAINNET,
                        rpcUrl: "https://mainnet.infura.io/v3/f5363227615e463db096757712e53f20",
                    };
                    balancer = new sdk_1.BalancerSDK(config);
                    pools = balancer.data.pools;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, pools.all()];
                case 2:
                    allPools = _a.sent();
                    filteredPools = allPools.filter(function (pool) { return parseFloat(pool.totalLiquidity) > 100000; });
                    return [4 /*yield*/, buildTokenGraph(filteredPools, balancer)];
                case 3:
                    graph = _a.sent();
                    console.log(graph);
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error('An error occurred:', error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function buildTokenGraph(poolfilter, balancer) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var graph, i, pool, tokens, poolId, pool1, j, tokenA, priceTokenA, k, tokenB, priceTokenB, wrtPriceAB, wrtPriceBA, spotPriceAtoB, spotPriceBtoA, tokenPairKey, inverseTokenPairKey;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    graph = new Map();
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < poolfilter.length)) return [3 /*break*/, 4];
                    pool = poolfilter[i];
                    tokens = pool.tokens.map(function (token) { return token.address; });
                    poolId = pool.id;
                    return [4 /*yield*/, balancer.pools.find(poolId)];
                case 2:
                    pool1 = _c.sent();
                    if (!pool1) {
                        throw new sdk_1.BalancerError(sdk_1.BalancerErrorCode.POOL_DOESNT_EXIST);
                    }
                    for (j = 0; j < tokens.length; j++) {
                        tokenA = tokens[j];
                        priceTokenA = parseFloat(((_a = pool1.tokens[j].token) === null || _a === void 0 ? void 0 : _a.latestUSDPrice) || '0');
                        for (k = j + 1; k < tokens.length; k++) {
                            tokenB = tokens[k];
                            priceTokenB = parseFloat(((_b = pool1.tokens[k].token) === null || _b === void 0 ? void 0 : _b.latestUSDPrice) || '0');
                            if (isNaN(priceTokenA) || isNaN(priceTokenB)) {
                                throw new sdk_1.BalancerError(sdk_1.BalancerErrorCode.MISSING_TOKENS);
                            }
                            wrtPriceAB = priceTokenA / priceTokenB;
                            wrtPriceBA = priceTokenB / priceTokenA;
                            spotPriceAtoB = wrtPriceAB * (1 + parseFloat(pool1.swapFee));
                            spotPriceBtoA = wrtPriceBA * (1 + parseFloat(pool1.swapFee));
                            tokenPairKey = "".concat(tokenA, "_").concat(tokenB);
                            inverseTokenPairKey = "".concat(tokenB, "_").concat(tokenA);
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
                    _c.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, graph];
            }
        });
    });
}
findArbitrageOpportunities();
