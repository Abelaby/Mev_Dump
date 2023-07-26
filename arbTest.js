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
        var config, balancer, pools, allPools, filteredPools, graph, arbitrageOpportunities, error_1;
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
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, pools.all()];
                case 2:
                    allPools = _a.sent();
                    filteredPools = allPools.filter(function (pool) { return parseFloat(pool.totalLiquidity) > 50000; });
                    graph = buildTokenGraph(filteredPools);
                    arbitrageOpportunities = findArbitrageOpportunitiesBellmanFord(graph);
                    if (arbitrageOpportunities.length > 0) {
                        console.log('Arbitrage opportunities found:', arbitrageOpportunities);
                    }
                    else {
                        console.log('No arbitrage opportunities found.');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('An error occurred:', error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function buildTokenGraph(pools) {
    var _a, _b;
    var graph = {};
    // Iterate over the pools
    for (var _i = 0, pools_1 = pools; _i < pools_1.length; _i++) {
        var pool = pools_1[_i];
        var tokens = pool.tokens.map(function (token) { return token.address; });
        // Add token connections to the graph
        for (var i = 0; i < tokens.length; i++) {
            var tokenA = tokens[i];
            var priceTokenA = parseFloat(((_a = pool.tokens[i].token) === null || _a === void 0 ? void 0 : _a.latestUSDPrice) || '0');
            if (!(tokenA in graph)) {
                graph[tokenA] = {};
            }
            for (var j = i + 1; j < tokens.length; j++) {
                var tokenB = tokens[j];
                var priceTokenB = parseFloat(((_b = pool.tokens[j].token) === null || _b === void 0 ? void 0 : _b.latestUSDPrice) || '0');
                if (!(tokenB in graph)) {
                    graph[tokenB] = {};
                }
                var wrtPriceAB = priceTokenA / priceTokenB;
                var wrtPriceBA = priceTokenB / priceTokenA;
                var slippageTolerance = 0.005;
                var spotPriceAtoB = wrtPriceAB * (1 + parseFloat(pool.swapFee)) * (1 - slippageTolerance);
                var spotPriceBtoA = wrtPriceBA * (1 + parseFloat(pool.swapFee)) * (1 - slippageTolerance);
                graph[tokenA][tokenB] = Math.log(spotPriceAtoB);
                graph[tokenB][tokenA] = Math.log(spotPriceBtoA);
            }
        }
    }
    return graph;
}
function findArbitrageOpportunitiesBellmanFord(graph) {
    var vertices = Object.keys(graph);
    var edges = getEdges(graph);
    var distances = initializeDistances(vertices);
    var predecessors = initializePredecessors(vertices);
    for (var i = 0; i < vertices.length - 1; i++) {
        for (var _i = 0, edges_1 = edges; _i < edges_1.length; _i++) {
            var _a = edges_1[_i], u = _a[0], v = _a[1], weight = _a[2];
            if (distances[u] + weight < distances[v]) {
                distances[v] = distances[u] + weight;
                predecessors[v] = u;
            }
        }
    }
    for (var _b = 0, edges_2 = edges; _b < edges_2.length; _b++) {
        var _c = edges_2[_b], u = _c[0], v = _c[1], weight = _c[2];
        if (distances[u] + weight < distances[v]) {
            var cycle = getCycle(predecessors, u);
            return cycle;
        }
    }
    return [];
}
function getEdges(graph) {
    var edges = [];
    for (var u in graph) {
        for (var v in graph[u]) {
            edges.push([u, v, graph[u][v]]);
        }
    }
    return edges;
}
function initializeDistances(vertices) {
    var distances = {};
    for (var _i = 0, vertices_1 = vertices; _i < vertices_1.length; _i++) {
        var vertex = vertices_1[_i];
        distances[vertex] = Infinity;
    }
    distances[vertices[0]] = 0;
    return distances;
}
function initializePredecessors(vertices) {
    var predecessors = {};
    for (var _i = 0, vertices_2 = vertices; _i < vertices_2.length; _i++) {
        var vertex = vertices_2[_i];
        predecessors[vertex] = null;
    }
    return predecessors;
}
function getCycle(predecessors, start) {
    var cycle = [];
    var current = start;
    while (!cycle.includes(current)) {
        cycle.push(current);
        current = predecessors[current];
    }
    cycle.push(current);
    return cycle;
}
// Run the function every 5 minutes
setInterval(findArbitrageOpportunities, 5 * 60 * 1000);
