import CryptoJS from "crypto-js";
import { configs } from "../../constants/okx";

export function getHeaders(
  timestamp: string,
  method: string,
  requestPath: string,
  queryString = "",
  body = "",
) {
  const { apiKey, secretKey, apiPassphrase, projectId } = configs;

  if (!apiKey || !secretKey || !apiPassphrase || !projectId) {
    throw new Error(
      "Missing required environment variables for API authentication",
    );
  }

  const stringToSign = timestamp + method + requestPath + (queryString || body);

  return {
    "Content-Type": "application/json",
    "OK-ACCESS-KEY": apiKey,
    "OK-ACCESS-SIGN": CryptoJS.enc.Base64.stringify(
      CryptoJS.HmacSHA256(stringToSign, secretKey),
    ),
    "OK-ACCESS-TIMESTAMP": timestamp,
    "OK-ACCESS-PASSPHRASE": apiPassphrase,
    "OK-ACCESS-PROJECT": projectId,
  };
}
