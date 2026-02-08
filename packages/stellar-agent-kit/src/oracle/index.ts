/**
 * Oracle module – price feeds (Reflector SEP-40, optional Band).
 */

export {
  createReflectorOracle,
  type ReflectorOracle,
  type ReflectorOracleConfig,
  type OracleAsset,
  type PriceData,
} from "./reflector.js";
export { REFLECTOR_ORACLE, BAND_ORACLE } from "../config/oracles.js";
