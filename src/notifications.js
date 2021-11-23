import Notify from 'bnc-notify';

import { isAddress, isTransactionHash } from '@pie-dao/utils';

import { isString } from '@pie-dao/utils/src/utils/typeChecks';
import env from './config/env.json';
import { get } from 'svelte/store';
import { emitters } from './stores/eth/writables';
import { ethers } from 'ethers';

const notify = Notify(env.blocknative);

if(env.customRPC.enabled) {
  // hardcoding a custom tenderly RPC, and listening to events from there...
  const provider = new ethers.providers.JsonRpcProvider(env.customRPC.url);
  // for eavery block update we receive from the custom RPC...
  provider.on("block", async(blockNumber) => {
    // we retrieve the block infos...
    let block = await provider.getBlockWithTransactions(blockNumber);
    // we get the emitters froms store writables...
    let emittersArray = get(emitters);
    // for each transaction in the current block...
    block.transactions.forEach(async(transaction) => {
      // we search for a match in the emitersArray...
      let tnx = emittersArray.find(el => el.hash == transaction);
      // if a transaction was stored into our emitersArray...
      if(tnx) {
        // we fetch the transaction receipt, and check the status...
        let tnxReceipt = await provider.getTransactionReceipt(transaction);
        // if status = 1 it means success, then we can trigger the event for it...
        if(tnxReceipt.status == 1) {
          tnx.emitter.emit('txConfirmed');
        }
      }
    });

    console.log("block event", block, blockNumber, emittersArray);
  });
}

const displayNotification = ({
  address,
  autoDismiss = 4000,
  eventCode = 'notice',
  hash,
  message,
  onclick = () => {},
  type = 'success',
}) => {
  console.log('displayNotification', {
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

    let emittersArray = get(emitters);
    emittersArray.push({hash: hash, emitter: emitter});
    emitters.set(emittersArray);

    return { ...notificationResponse, emitter };
  }

  return notificationResponse;
};

export default displayNotification;
