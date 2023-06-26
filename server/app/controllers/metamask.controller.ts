import { BeamRequestBaseModel, sendRequest } from "../shared/helpers/axios";
import { BeamWalletStatusResponse } from "../interfaces";

export const getChainId = () => {
  return "0x582"; //hardcoded in POC
};

export const getNetVersion = () => {
  return getChainId();
};

export const getBlockNumber = async () => {
  const res = await sendRequest<BeamRequestBaseModel, BeamWalletStatusResponse>({
    jsonrpc: "2.0",
    id: 6,
    method: "wallet_status",
  });

  return res.current_height.toString(16);
};

export const getGasPrice = () => {
  return "0x0";
};

export const getEstimateGasPrice = () => {
  return getGasPrice();
};

export const getEthGetCode = () => {
  return "0x600160008035811a818181146012578301005b601b6001356025565b8060005260206000f25b600060078202905091905056";
};
