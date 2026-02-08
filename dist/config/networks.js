"use strict";
/**
 * Network config – mainnet only.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainnet = void 0;
exports.getNetworkConfig = getNetworkConfig;
exports.mainnet = {
    horizonUrl: "https://horizon.stellar.org",
    sorobanRpcUrl: "https://soroban-rpc.mainnet.stellar.gateway.fm",
};
function getNetworkConfig(_name) {
    return exports.mainnet;
}
//# sourceMappingURL=networks.js.map