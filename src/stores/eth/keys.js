import {
  validateIsAddress,
  validateIsArray,
  validateIsPOJO,
  validateIsString,
} from "@pie-dao/utils";

export const balanceKey = (token, address, method = '') => {
  validateIsAddress(token);
  validateIsAddress(address);
  return `${token}.${address}${method}`.toLowerCase();
};

export const functionKey = (contractAddress, functionName, functionArgs, overrides = {}) => {
  validateIsAddress(contractAddress);
  validateIsString(functionName);
  validateIsArray(functionArgs);
  validateIsPOJO(overrides);
  return btoa(JSON.stringify([contractAddress, functionName, functionArgs, overrides]));
};
