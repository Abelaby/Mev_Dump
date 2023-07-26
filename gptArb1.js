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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
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
                    arbitrageOpportunities = findArbitrageOpportunitiesBellmanFord(graph, filteredPools);
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
    var e_1, _a;
    var _b, _c;
    var graph = new Map();
    try {
        for (var pools_1 = __values(pools), pools_1_1 = pools_1.next(); !pools_1_1.done; pools_1_1 = pools_1.next()) {
            var pool = pools_1_1.value;
            var tokens = pool.tokens.map(function (token) { return token.address; });
            for (var i = 0; i < tokens.length; i++) {
                var tokenA = tokens[i];
                var priceTokenA = parseFloat(((_b = pool.tokens[i].token) === null || _b === void 0 ? void 0 : _b.latestUSDPrice) || '0');
                if (!graph.has(tokenA)) {
                    graph.set(tokenA, new Map());
                }
                for (var j = i + 1; j < tokens.length; j++) {
                    var tokenB = tokens[j];
                    var priceTokenB = parseFloat(((_c = pool.tokens[j].token) === null || _c === void 0 ? void 0 : _c.latestUSDPrice) || '0');
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
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (pools_1_1 && !pools_1_1.done && (_a = pools_1.return)) _a.call(pools_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return graph;
}
// ... (previous code remains the same)
function findArbitrageOpportunitiesBellmanFord(graph, pools) {
    var e_2, _a, e_3, _b;
    var vertices = Array.from(graph.keys());
    var edges = getEdges(graph);
    var distances = initializeDistances(vertices);
    var predecessors = initializePredecessors(vertices);
    for (var i = 0; i < vertices.length - 1; i++) {
        try {
            for (var edges_1 = (e_2 = void 0, __values(edges)), edges_1_1 = edges_1.next(); !edges_1_1.done; edges_1_1 = edges_1.next()) {
                var _c = __read(edges_1_1.value, 3), u = _c[0], v = _c[1], weight = _c[2];
                if (distances[u] + weight < distances[v]) {
                    distances[v] = distances[u] + weight;
                    predecessors[v] = u;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (edges_1_1 && !edges_1_1.done && (_a = edges_1.return)) _a.call(edges_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    try {
        for (var edges_2 = __values(edges), edges_2_1 = edges_2.next(); !edges_2_1.done; edges_2_1 = edges_2.next()) {
            var _d = __read(edges_2_1.value, 3), u = _d[0], v = _d[1], weight = _d[2];
            if (distances[u] + weight < distances[v]) {
                var cycle = getCycle(predecessors, u, pools);
                if (cycle.length > 0) {
                    return cycle;
                }
            }
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (edges_2_1 && !edges_2_1.done && (_b = edges_2.return)) _b.call(edges_2);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return [];
}
function getEdges(graph) {
    var e_4, _a, e_5, _b;
    var edges = [];
    try {
        for (var _c = __values(graph.entries()), _d = _c.next(); !_d.done; _d = _c.next()) {
            var _e = __read(_d.value, 2), u = _e[0], connections = _e[1];
            try {
                for (var _f = (e_5 = void 0, __values(connections.entries())), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var _h = __read(_g.value, 2), v = _h[0], weight = _h[1];
                    edges.push([u, v, weight]);
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                }
                finally { if (e_5) throw e_5.error; }
            }
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_4) throw e_4.error; }
    }
    return edges;
}
// ... (rest of the code remains the same)
function initializeDistances(vertices) {
    var e_6, _a;
    var distances = {};
    try {
        for (var vertices_1 = __values(vertices), vertices_1_1 = vertices_1.next(); !vertices_1_1.done; vertices_1_1 = vertices_1.next()) {
            var vertex = vertices_1_1.value;
            distances[vertex] = Infinity;
        }
    }
    catch (e_6_1) { e_6 = { error: e_6_1 }; }
    finally {
        try {
            if (vertices_1_1 && !vertices_1_1.done && (_a = vertices_1.return)) _a.call(vertices_1);
        }
        finally { if (e_6) throw e_6.error; }
    }
    distances[vertices[0]] = 0;
    return distances;
}
function initializePredecessors(vertices) {
    var e_7, _a;
    var predecessors = {};
    try {
        for (var vertices_2 = __values(vertices), vertices_2_1 = vertices_2.next(); !vertices_2_1.done; vertices_2_1 = vertices_2.next()) {
            var vertex = vertices_2_1.value;
            predecessors[vertex] = null;
        }
    }
    catch (e_7_1) { e_7 = { error: e_7_1 }; }
    finally {
        try {
            if (vertices_2_1 && !vertices_2_1.done && (_a = vertices_2.return)) _a.call(vertices_2);
        }
        finally { if (e_7) throw e_7.error; }
    }
    return predecessors;
}
function getCycle(predecessors, start, pools) {
    var cycle = [];
    var current = start;
    while (!cycle.includes(current)) {
        cycle.push(current);
        current = predecessors[current];
    }
    // Add the starting token to the end of the cycle to represent a closed loop
    cycle.push(start);
    // Check if the tokens in the cycle are in the same pools
    var validCycle = isValidCycle(cycle, pools);
    if (validCycle) {
        return cycle;
    }
    else {
        return [];
    }
}
function isValidCycle(cycle, pools) {
    var _loop_1 = function (i) {
        var tokenA = cycle[i];
        var tokenB = cycle[i + 1];
        var matchingPools = pools.filter(function (pool) {
            var tokenAddresses = pool.tokens.map(function (token) { return token.address; });
            return tokenAddresses.includes(tokenA) && tokenAddresses.includes(tokenB);
        });
        if (matchingPools.length < 2) {
            return { value: false };
        }
    };
    for (var i = 0; i < cycle.length - 1; i++) {
        var state_1 = _loop_1(i);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    return true;
}
// Run the function every 5 minutes 
//no need
findArbitrageOpportunities();
