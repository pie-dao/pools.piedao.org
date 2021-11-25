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
    try {
      // we retrieve the block infos...
      let block = await provider.getBlockWithTransactions(blockNumber);
      // we get the emitters froms store writables...
      let emittersArray = get(emitters);

      console.log("block event", block.transactions, blockNumber, emittersArray);

      // for each transaction in the current block...
      block.transactions.forEach(async(transaction) => {
        // we search for a match in the emitersArray...
        let tnx = emittersArray.find(el => el.hash.toLowerCase() === transaction.hash.toLowerCase());
        // if a transaction was stored into our emitersArray...
        if(tnx) {
          // we fetch the transaction receipt, and check the status...
          let tnxReceipt = await provider.getTransactionReceipt(transaction.hash);

          if(tnxReceipt.status == 1) {
            await tnx.emitter.emit({...tnxReceipt, eventCode: 'txConfirmed'});
          } else {
            await tnx.emitter.emit({...tnxReceipt, eventCode: 'txFailed'});

            displayNotification({
              autoDismiss: 15000,
              message: 'Sorry, something went wrong.',
              type: 'error',
            });            
          }

          // removing pending notification from DOM...
          let pendingNotifications = document.getElementsByClassName("bn-notify-notification-pending");
          for (let item of pendingNotifications) {
              item.remove();  
          }

          // cleaning up emittersArray after firing the event...
          const index = emittersArray.indexOf(tnx);
          if (index > -1) {
            emittersArray.splice(index, 1);
          }
          emitters.set(emittersArray);
        }
      });    
    } catch(error) {
      console.log("block event: error", error);
    }
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
