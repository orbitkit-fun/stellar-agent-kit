import axios from "axios";
import { baseUrl } from "../../constants/okx";
import { getHeaders } from "../../helpers/okx";

export async function getApproveTx(
  tokenAddress: string,
  amount: string,
  chainIndex: string,
): Promise<any> {
  try {
    const path = "dex/aggregator/approve-transaction";
    const url = `${baseUrl}${path}`;
    const params = {
      chainIndex: chainIndex,
      tokenContractAddress: tokenAddress,
      approveAmount: amount,
    };

    // Prepare authentication
    const timestamp = new Date().toISOString();
    const requestPath = `/api/v6/${path}`;
    const queryString = "?" + new URLSearchParams(params).toString();
    const headers = getHeaders(timestamp, "GET", requestPath, queryString);

    const response = await axios.get(url, { params, headers });

    if (response.data.code === "0") {
      return response.data.data[0];
    } else {
      throw new Error(`API Error: ${response.data.msg || "Unknown error"}`);
    }
  } catch (error) {
    console.error(
      "Failed to get approval transaction data:",
      (error as Error).message,
    );
    throw error;
  }
}
