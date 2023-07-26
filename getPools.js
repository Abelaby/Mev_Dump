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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ethers_1 = require("ethers");
var constants_1 = require("./libs/constants");
var poolData_1 = require("./poolData");
var Quoter_json_1 = __importDefault(require("./ABI/Quoter.json"));
var Provider = new ethers_1.ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/819e8d5c4e5e4e3dbc5ed6630346bd7a');
function buildTokenGraph(poolData) {
    return __awaiter(this, void 0, void 0, function () {
        var graph, uniqueTokens, pools, quoterContract, fetchQuotePrice;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    graph = new Map();
                    uniqueTokens = new Set();
                    pools = poolData.data.pools.slice(0, 150);
                    quoterContract = new ethers_1.ethers.Contract(constants_1.QUOTER_CONTRACT_ADDRESS, Quoter_json_1.default.abi, Provider);
                    fetchQuotePrice = function (pool) { return __awaiter(_this, void 0, void 0, function () {
                        var token0, token1, amountIn, quotedAmountOut, amountOut, quotePrice0to1, quotePrice1to0, tokenPairKey, inverseTokenPairKey, error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    token0 = pool.token0, token1 = pool.token1;
                                    uniqueTokens.add(token0.id);
                                    uniqueTokens.add(token1.id);
                                    amountIn = ethers_1.ethers.utils.parseUnits('1', token0.decimals);
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, quoterContract.callStatic.quoteExactInputSingle(token0.id, token1.id, pool.feeTier, amountIn, 0)];
                                case 2:
                                    quotedAmountOut = _a.sent();
                                    amountOut = ethers_1.ethers.utils.formatUnits(quotedAmountOut, token1.decimals);
                                    quotePrice0to1 = Math.log(parseFloat(amountOut));
                                    quotePrice1to0 = -quotePrice0to1;
                                    tokenPairKey = "".concat(token0.id, "_").concat(token1.id);
                                    inverseTokenPairKey = "".concat(token1.id, "_").concat(token0.id);
                                    graph.set(tokenPairKey, quotePrice0to1);
                                    graph.set(inverseTokenPairKey, quotePrice1to0);
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_1 = _a.sent();
                                    console.error("Error calculating spot price for pool ".concat(pool.id, ":"));
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); };
                    // Fetch quote prices for all pools concurrently
                    return [4 /*yield*/, Promise.all(pools.map(fetchQuotePrice))];
                case 1:
                    // Fetch quote prices for all pools concurrently
                    _a.sent();
                    return [2 /*return*/, { graph: graph, nodes: Array.from(uniqueTokens) }];
            }
        });
    });
}
//buildTokenGraph(poolData);
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var graphData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, buildTokenGraph(poolData_1.poolData)];
                case 1:
                    graphData = _a.sent();
                    console.log(graphData);
                    return [2 /*return*/];
            }
        });
    });
}
main();
