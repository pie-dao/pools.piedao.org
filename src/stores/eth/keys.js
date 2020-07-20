import {
  validateIsAddress,
  validateIsArray,
  validateIsPOJO,
  validateIsString,
} from "@pie-dao/utils";

export const balanceKey = (token, address) => {
  validateIsAddress(token);
  validateIsAddress(address);
  return `${token}.${address}`.toLowerCase();
};

export const functionKey = (contractAddress, functionName, functionArgs, overrides = {}) => {
  validateIsAddress(contractAddress);
  validateIsString(functionName);
  validateIsArray(functionArgs);
  validateIsPOJO(overrides);
  return btoa(JSON.stringify([contractAddress, functionName, functionArgs, overrides]));
};
