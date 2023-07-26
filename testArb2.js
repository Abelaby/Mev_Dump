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
        var config, balancer, pools, allPools, filteredPools, arbitrageOpportunities, graph, error_1;
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
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, pools.all()];
                case 2:
                    allPools = _a.sent();
                    filteredPools = allPools.filter(function (pool) { return parseFloat(pool.totalLiquidity) > 50000; });
                    arbitrageOpportunities = [];
                    _a.label = 3;
                case 3:
                    if (!(arbitrageOpportunities.length === 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, buildTokenGraph(filteredPools, balancer)];
                case 4:
                    graph = _a.sent();
                    arbitrageOpportunities = findArbitrageOpportunitiesFloydWarshall(graph);
                    if (arbitrageOpportunities.length > 0) {
                        console.log('Arbitrage opportunities found:', arbitrageOpportunities);
                    }
                    else {
                        console.log('No arbitrage opportunities found. Repeating the process...');
                    }
                    return [3 /*break*/, 3];
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error('An error occurred:', error_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function buildTokenGraph(poolfilter, balancer) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var graph, uniqueTokens, _i, poolfilter_1, pool, tokens, poolId, pool1, j, tokenA, priceTokenA, k, tokenB, priceTokenB, wrtPriceAB, wrtPriceBA, slippageTolerance, spotPriceAtoB, spotPriceBtoA, tokenPairKey, inverseTokenPairKey;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    graph = new Map();
                    uniqueTokens = new Set();
                    _i = 0, poolfilter_1 = poolfilter;
                    _c.label = 1;
                case 1:
                    if (!(_i < poolfilter_1.length)) return [3 /*break*/, 4];
                    pool = poolfilter_1[_i];
                    tokens = pool.tokens.map(function (token) { return token.address; });
                    poolId = pool.id;
                    return [4 /*yield*/, balancer.pools.find(poolId)];
                case 2:
                    pool1 = _c.sent();
                    for (j = 0; j < tokens.length; j++) {
                        tokenA = tokens[j];
                        uniqueTokens.add(tokenA);
                        priceTokenA = parseFloat(((_a = pool1.tokens[j].token) === null || _a === void 0 ? void 0 : _a.latestUSDPrice) || '0');
                        for (k = j + 1; k < tokens.length; k++) {
                            tokenB = tokens[k];
                            uniqueTokens.add(tokenB);
                            priceTokenB = parseFloat(((_b = pool1.tokens[k].token) === null || _b === void 0 ? void 0 : _b.latestUSDPrice) || '0');
                            wrtPriceAB = priceTokenA / priceTokenB;
                            wrtPriceBA = priceTokenB / priceTokenA;
                            slippageTolerance = 0.005;
                            spotPriceAtoB = wrtPriceAB * (1 + parseFloat(pool1.swapFee)) * (1 - slippageTolerance);
                            spotPriceBtoA = wrtPriceBA * (1 + parseFloat(pool1.swapFee)) * (1 - slippageTolerance);
                            tokenPairKey = "".concat(tokenA, "_").concat(tokenB);
                            inverseTokenPairKey = "".concat(tokenB, "_").concat(tokenA);
                            graph.set(tokenPairKey, Math.log(spotPriceAtoB));
                            graph.set(inverseTokenPairKey, Math.log(spotPriceBtoA));
                        }
                    }
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, { graph: graph, nodes: Array.from(uniqueTokens) }];
            }
        });
    });
}
function findArbitrageOpportunitiesFloydWarshall(graphData) {
    var graph = graphData.graph, nodes = graphData.nodes;
    var distances = new Map();
    var next = new Map();
    // Initialize distances and next nodes
    for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
        var node = nodes_1[_i];
        distances.set(node, new Map());
        next.set(node, new Map());
        for (var _a = 0, nodes_2 = nodes; _a < nodes_2.length; _a++) {
            var neighbor = nodes_2[_a];
            distances.get(node).set(neighbor, Infinity);
            next.get(node).set(neighbor, null);
        }
        distances.get(node).set(node, 0);
    }
    // Update distances and next nodes based on direct edges
    for (var _b = 0, _c = graph.entries(); _b < _c.length; _b++) {
        var _d = _c[_b], edge = _d[0], weight = _d[1];
        var _e = edge.split('_'), source = _e[0], target = _e[1];
        distances.get(source).set(target, weight);
        next.get(source).set(target, target);
    }
    // Update distances and next nodes based on intermediate nodes
    for (var _f = 0, nodes_3 = nodes; _f < nodes_3.length; _f++) {
        var intermediate = nodes_3[_f];
        for (var _g = 0, nodes_4 = nodes; _g < nodes_4.length; _g++) {
            var source = nodes_4[_g];
            for (var _h = 0, nodes_5 = nodes; _h < nodes_5.length; _h++) {
                var target = nodes_5[_h];
                var newDistance = distances.get(source).get(intermediate) + distances.get(intermediate).get(target);
                if (newDistance < distances.get(source).get(target)) {
                    distances.get(source).set(target, newDistance);
                    next.get(source).set(target, next.get(source).get(intermediate));
                }
            }
        }
    }
    // Find negative weight cycles
    var arbitrageOpportunities = [];
    for (var _j = 0, nodes_6 = nodes; _j < nodes_6.length; _j++) {
        var source = nodes_6[_j];
        for (var _k = 0, nodes_7 = nodes; _k < nodes_7.length; _k++) {
            var target = nodes_7[_k];
            if (distances.get(source).get(target) < 0) {
                var cycle = findNegativeWeightCycle(next, source, target);
                arbitrageOpportunities.push(cycle.join(' -> '));
            }
        }
    }
    return arbitrageOpportunities;
}
function findNegativeWeightCycle(next, source, target) {
    var cycle = [source];
    var node = source;
    while (node !== target) {
        node = next.get(node).get(target);
        cycle.push(node);
    }
    cycle.push(source);
    return cycle;
}
// Run the function every 5 minutes
setInterval(findArbitrageOpportunities, 5 * 60 * 1000);
