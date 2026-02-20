import axios from "axios";
import { getHeaders } from "../../helpers/okx";

/**
 * Get transaction gas limit from Onchain gateway API
 * @param fromAddress - Sender address
 * @param toAddress - Target contract address
 * @param txAmount - Transaction amount (0 for approvals)
 * @param inputData - Transaction calldata
 * @returns Estimated gas limit
 */
export async function getGasLimit(
  fromAddress: string,
  toAddress: string,
  chainIndex: string,
  txAmount: string = "0",
  inputData: string = "",
): Promise<string> {
  try {
    const path = "dex/pre-transaction/gas-limit";
    const url = `https://web3.okx.com/api/v6/${path}`;

    const body = {
      chainIndex: chainIndex,
      fromAddress: fromAddress,
      toAddress: toAddress,
      txAmount: txAmount,
      extJson: {
        inputData: inputData,
      },
    };

    // Prepare authentication with body included in signature
    const bodyString = JSON.stringify(body);
    const timestamp = new Date().toISOString();
    const requestPath = `/api/v6/${path}`;
    const headers = getHeaders(timestamp, "POST", requestPath, "", bodyString);

    const response = await axios.post(url, body, { headers });

    if (response.data.code === "0") {
      return response.data.data[0].gasLimit;
    } else {
      throw new Error(`API Error: ${response.data.msg || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Failed to get gas limit:", (error as Error).message);
    throw error;
  }
}
