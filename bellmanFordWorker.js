"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var worker_threads_1 = require("worker_threads");
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.on('message', function (_a) {
    var graph = _a.graph, nodes = _a.nodes;
    console.log('Worker received graph and nodes:', graph, nodes);
    var distances = new Map();
    for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
        var node = nodes_1[_i];
        distances.set(node, Infinity);
    }
    var startNode = nodes[0];
    distances.set(startNode, 0);
    for (var i = 1; i < nodes.length; i++) {
        for (var _b = 0, graph_1 = graph; _b < graph_1.length; _b++) {
            var _c = graph_1[_b], u = _c.u, v = _c.v, weight = _c.weight;
            var newDistance = distances.get(u) + weight;
            if (newDistance < distances.get(v)) {
                distances.set(v, newDistance);
            }
        }
    }
    var arbitrageOpportunity = null;
    for (var _d = 0, graph_2 = graph; _d < graph_2.length; _d++) {
        var _e = graph_2[_d], u = _e.u, v = _e.v, weight = _e.weight;
        var newDistance = distances.get(u) + weight;
        if (newDistance < distances.get(v)) {
            var path = [v, u];
            var currentNode = u;
            while (currentNode !== startNode && currentNode !== '') {
                currentNode = nodes.reduce(function (prev, curr) {
                    var _a;
                    var prevDistance = distances.get(prev);
                    var currDistance = distances.get(curr);
                    var edgeWeight = ((_a = graph.find(function (edge) { return edge.u === prev && edge.v === curr; })) === null || _a === void 0 ? void 0 : _a.weight) || 0;
                    return prevDistance + edgeWeight === currDistance ? curr : prev;
                }, currentNode);
                path.unshift(currentNode);
            }
            var profit = Math.exp(-newDistance) - 1;
            arbitrageOpportunity = { path: path, profit: profit };
            break;
        }
    }
    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage(arbitrageOpportunity);
    console.log('Worker finished searching for arbitrage opportunity');
});
