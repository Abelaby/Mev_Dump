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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var sdk_1 = require("@balancer-labs/sdk");
var foundArbitrageOpportunities = new Set();
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
        });
    });
}
function findArbitrageOpportunities() {
    return __awaiter(this, void 0, void 0, function () {
        var config, balancer, pools, allPools, filteredPools, graph, arbitrageOpportunities, uniqueOpportunities, minDelay, maxDelay, randomDelay, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = {
                        network: sdk_1.Network.MAINNET,
                        rpcUrl: "https://mainnet.infura.io/v3/f5363227615e463db096757712e53f20",
                    };
                    balancer = new sdk_1.BalancerSDK(config);
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 8];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 6, , 7]);
                    return [4 /*yield*/, balancer.data.pools];
                case 3:
                    _a.sent();
                    pools = balancer.data.pools;
                    return [4 /*yield*/, pools.all()];
                case 4:
                    allPools = _a.sent();
                    filteredPools = allPools.filter(function (pool) {
                        if (pool.totalSwapVolume === undefined) {
                            return false;
                        }
                        var swapVolume = parseFloat(pool.totalSwapVolume);
                        return swapVolume > 10000;
                    });
                    graph = buildTokenGraph(filteredPools);
                    arbitrageOpportunities = johnsonsAlgorithm(graph, Array.from(graph.keys()));
                    uniqueOpportunities = arbitrageOpportunities.filter(function (opportunity) { return !foundArbitrageOpportunities.has(opportunity); });
                    if (uniqueOpportunities.length > 0) {
                        console.log('Arbitrage opportunities found:', uniqueOpportunities);
                        uniqueOpportunities.forEach(function (opportunity) { return foundArbitrageOpportunities.add(opportunity); });
                    }
                    else {
                        console.log('No new arbitrage opportunities found.');
                    }
                    minDelay = 1 * 60 * 1000;
                    maxDelay = 5 * 60 * 1000;
                    randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
                    return [4 /*yield*/, sleep(randomDelay)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error('An error occurred:', error_1);
                    return [3 /*break*/, 7];
                case 7: return [3 /*break*/, 1];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function buildTokenGraph(pools) {
    var _a, _b;
    var graph = new Map();
    for (var _i = 0, pools_1 = pools; _i < pools_1.length; _i++) {
        var pool = pools_1[_i];
        var tokens = pool.tokens.map(function (token) { return token.address; });
        for (var i = 0; i < tokens.length; i++) {
            var tokenA = tokens[i];
            var priceTokenA = parseFloat(((_a = pool.tokens[i].token) === null || _a === void 0 ? void 0 : _a.latestUSDPrice) || '0');
            if (!graph.has(tokenA)) {
                graph.set(tokenA, new Map());
            }
            for (var j = i + 1; j < tokens.length; j++) {
                var tokenB = tokens[j];
                var priceTokenB = parseFloat(((_b = pool.tokens[j].token) === null || _b === void 0 ? void 0 : _b.latestUSDPrice) || '0');
                if (!graph.has(tokenB)) {
                    graph.set(tokenB, new Map());
                }
                var wrtPriceAB = priceTokenA / priceTokenB;
                var wrtPriceBA = priceTokenB / priceTokenA;
                var slippageTolerance = 0.005;
                var spotPriceAtoB = wrtPriceAB * (1 + parseFloat(pool.swapFee)) * (1 - slippageTolerance);
                var spotPriceBtoA = wrtPriceBA * (1 + parseFloat(pool.swapFee)) * (1 - slippageTolerance);
                graph.get(tokenA).set(tokenB, Math.log(spotPriceAtoB));
                graph.get(tokenB).set(tokenA, Math.log(spotPriceBtoA));
            }
        }
    }
    return graph;
}
function johnsonsAlgorithm(graph, vertices) {
    var newGraph = addSourceVertex(graph, vertices);
    var _a = bellmanFordForJohnson(newGraph, __spreadArray(__spreadArray([], vertices, true), ['source'], false), 'source'), distances = _a[0], predecessors = _a[1];
    var reweightedGraph = reweightGraph(graph, vertices, distances);
    var allPairsShortestPaths = floydWarshallForJohnson(reweightedGraph, vertices);
    return findMostProfitableCycle(allPairsShortestPaths, vertices);
}
function addSourceVertex(graph, vertices) {
    var newGraph = new Map(graph);
    newGraph.set('source', new Map());
    for (var _i = 0, vertices_1 = vertices; _i < vertices_1.length; _i++) {
        var vertex = vertices_1[_i];
        newGraph.get('source').set(vertex, 0);
    }
    return newGraph;
}
function bellmanFordForJohnson(graph, vertices, source) {
    var distances = {};
    var predecessors = {};
    for (var _i = 0, vertices_2 = vertices; _i < vertices_2.length; _i++) {
        var vertex = vertices_2[_i];
        distances[vertex] = Infinity;
        predecessors[vertex] = null;
    }
    distances[source] = 0;
    for (var i = 0; i < vertices.length; i++) {
        for (var _a = 0, _b = graph.entries(); _a < _b.length; _a++) {
            var _c = _b[_a], u = _c[0], connections = _c[1];
            for (var _d = 0, _e = connections.entries(); _d < _e.length; _d++) {
                var _f = _e[_d], v = _f[0], weight = _f[1];
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
    var reweightedGraph = new Map();
    for (var _i = 0, _a = graph.entries(); _i < _a.length; _i++) {
        var _b = _a[_i], u = _b[0], connections = _b[1];
        reweightedGraph.set(u, new Map());
        for (var _c = 0, _d = connections.entries(); _c < _d.length; _c++) {
            var _e = _d[_c], v = _e[0], weight = _e[1];
            var reweightedEdge = weight + distances[u] - distances[v];
            reweightedGraph.get(u).set(v, reweightedEdge);
        }
    }
    return reweightedGraph;
}
function floydWarshallForJohnson(graph, vertices) {
    var dist = new Map();
    for (var _i = 0, vertices_3 = vertices; _i < vertices_3.length; _i++) {
        var u = vertices_3[_i];
        dist.set(u, new Map());
        for (var _a = 0, vertices_4 = vertices; _a < vertices_4.length; _a++) {
            var v = vertices_4[_a];
            if (u === v) {
                dist.get(u).set(v, 0);
            }
            else if (graph.has(u) && graph.get(u).has(v)) {
                dist.get(u).set(v, graph.get(u).get(v));
            }
            else {
                dist.get(u).set(v, Infinity);
            }
        }
    }
    for (var _b = 0, vertices_5 = vertices; _b < vertices_5.length; _b++) {
        var k = vertices_5[_b];
        for (var _c = 0, vertices_6 = vertices; _c < vertices_6.length; _c++) {
            var i = vertices_6[_c];
            for (var _d = 0, vertices_7 = vertices; _d < vertices_7.length; _d++) {
                var j = vertices_7[_d];
                var ijPath = dist.get(i).get(j);
                var ikPath = dist.get(i).get(k);
                var kjPath = dist.get(k).get(j);
                if (ikPath + kjPath < ijPath) {
                    dist.get(i).set(j, ikPath + kjPath);
                }
            }
        }
    }
    return dist;
}
function findMostProfitableCycle(allPairsShortestPaths, vertices) {
    var maxProfit = 0;
    var mostProfitableCycle = [];
    for (var _i = 0, vertices_8 = vertices; _i < vertices_8.length; _i++) {
        var start = vertices_8[_i];
        for (var _a = 0, vertices_9 = vertices; _a < vertices_9.length; _a++) {
            var end = vertices_9[_a];
            var profit = -allPairsShortestPaths.get(start).get(end) - allPairsShortestPaths.get(end).get(start);
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
