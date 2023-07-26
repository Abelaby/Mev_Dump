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
function getSpotPrice() {
    return __awaiter(this, void 0, void 0, function () {
        var config, balancer, pools, poolId, pool, spotPrice, result, balbalance, wethbalance, balwt, wethwt, price, revPrice, test, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    config = {
                        network: sdk_1.Network.MAINNET,
                        rpcUrl: "https://mainnet.infura.io/v3/f5363227615e463db096757712e53f20",
                    };
                    balancer = new sdk_1.BalancerSDK(config);
                    pools = balancer.data.pools;
                    poolId = '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014';
                    return [4 /*yield*/, balancer.pools.find(poolId)];
                case 1:
                    pool = _a.sent();
                    if (!pool) {
                        throw new Error('Pool not found');
                    }
                    return [4 /*yield*/, pool.calcSpotPrice('0xba100000625a3754423978a60c9317c58a424e3D', // BAL
                        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // WETH
                        )];
                case 2:
                    spotPrice = _a.sent();
                    result = void 0;
                    return [4 /*yield*/, pools.all()];
                case 3:
                    result = _a.sent(); // Assign result the value of pools.all()
                    balbalance = parseFloat(pool.tokens[0].balance || '0');
                    wethbalance = parseFloat(pool.tokens[1].balance || '0');
                    balwt = parseFloat(pool.tokens[0].weight || '0');
                    wethwt = parseFloat(pool.tokens[1].weight || '0');
                    if (isNaN(balbalance) || isNaN(wethbalance || balwt || wethwt)) {
                        throw new sdk_1.BalancerError(sdk_1.BalancerErrorCode.MISSING_TOKENS);
                    }
                    price = (balbalance / wethbalance) * (wethwt / balwt);
                    console.log('WeTH/BAL', price + (price * parseFloat(pool.swapFee)));
                    console.log(price);
                    revPrice = (wethbalance / balbalance) * (balwt / wethwt);
                    console.log('revPrice', revPrice);
                    return [4 /*yield*/, balancer.contracts.vault.getPoolTokenInfo('0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014', '0xba100000625a3754423978a60c9317c58a424e3D')];
                case 4:
                    test = _a.sent();
                    console.log(test);
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.error('An error occurred:', error_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
getSpotPrice();
