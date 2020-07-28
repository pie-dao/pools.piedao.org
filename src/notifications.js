import Notify from "bnc-notify";

import { isAddress, isTransactionHash } from "@pie-dao/utils";

import env from "./config/env.json";
import { isString } from "@pie-dao/utils/src/utils/typeChecks";

const notify = Notify(env.blocknative);

export const displayNotification = ({
  address,
  autoDismiss = 4000,
  eventCode = "notice",
  hash,
  message,
  onclick = () => {},
  type = "success",
}) => {
  console.log("displayNotification", {
    address,
    autoDismiss,
    eventCode,
    hash,
    message,
    onclick,
    type,
  });

  const notificationObject = {
    autoDismiss,
    eventCode,
    message,
    onclick,
    type,
  };

  let notificationResponse = {};

  if (isString(message)) {
    notificationResponse = notify.notification(notificationObject);
  }

  if (isAddress(address)) {
    const { emitter } = notify.account(address);
    return { ...notificationResponse, emitter };
  }

  if (isTransactionHash(hash)) {
    const { emitter } = notify.hash(hash);
    return { ...notificationResponse, emitter };
  }

  return notificationResponse;
};
