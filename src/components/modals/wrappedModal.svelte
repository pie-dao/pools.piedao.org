<script>
    import { onMount } from 'svelte';
    import { _ } from "svelte-i18n";
    import { get } from "svelte/store";
    import { erc20 } from "@pie-dao/abis";
    import BigNumber from "bignumber.js";
    import { ethers } from "ethers";
    import displayNotification from "../../notifications.js";
    import decimalWrapperABI from "../../config/decimalWrapperABI.json";
    import {
        balanceKey,
        allowances,
        approveMax,
        functionKey,
        balances,
        subject,
        eth
    } from "../../stores/eth.js";
    
    import {
      getTokenImage,
      fetchEthBalance,
      subscribeToBalance,
      subscribeToAllowance,
      toFixed
    } from "../../components/helpers.js";
    
    export let token;

    let amount = 0;
    $: selectedTab = 0;
    $: initialized = false;

    let allowanceKeyUnderlying = functionKey(token.productiveAs.address, 'allowance', [$eth.address, token.address]);
    let balanceKeyUnderlying = balanceKey(token.address, $eth.address);
    let balanceKeyWrapped = balanceKey(token.productiveAs.address, $eth.address);
    
    
    $: if($eth.address) {
        subscribeToBalance(token.address, $eth.address);
        subscribeToBalance(token.productiveAs.address, $eth.address);
        subscribeToAllowance(token.productiveAs.address, $eth.address, token.address);
    }
    
    const withdraw = async () => {
        const requestedAmount = $balances[balanceKeyWrapped];
        const amountWei = requestedAmount.multipliedBy(10 ** 18).toFixed(0);

        if (!$eth.address || !$eth.signer) {
          displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
          connectWeb3();
          return;
        }
        
        const instance = new ethers.Contract(token.productiveAs.address, decimalWrapperABI, $eth.signer); 
        const { emitter } = displayNotification(await instance.withdraw(amountWei) );
    
        emitter.on("txConfirmed", ({ hash }) => {
          const { dismiss } = displayNotification({
            message: "Confirming...",
            type: "pending",
          });
    
          const subscription = subject("blockNumber").subscribe({
            next: async () => {
              displayNotification({
                autoDismiss: 15000,
                message: `${oven.baking.symbol} successfully withdrew from the Wrap`,
                type: "success",
              });
              dismiss();
              await fetch();
              subscription.unsubscribe();
            },
          });
    
          return {
            autoDismiss: 1,
            message: "Mined",
            type: "success",
          };
        });
    };
    
    const askApproval = async (address, spender) => {
    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
      connectWeb3();
      return;
    }

    let erc20Contract = new ethers.Contract(address, erc20, $eth.signer);

    const { hash } = await erc20Contract['approve(address,uint256)'](spender, ethers.constants.MaxUint256);
    const { emitter } = displayNotification({ hash });
    const symbol = await erc20Contract.symbol();
    
    await new Promise((resolve) => emitter.on('txConfirmed', ({ blockNumber }) => {
      currentBlockNumber = blockNumber;
      resolve();
      return { message: `${symbol} unlocked`, type: 'success' };
    }));
  }

    
    const deposit = async () => {
        const underlying = new ethers.Contract(token.address, erc20, $eth.signer); 
        const decimals = await underlying.decimals();
        const requestedAmount = BigNumber(amount);
        const requestedAmountWei = requestedAmount.multipliedBy(10 ** decimals).toFixed(0);

        const max = BigNumber($balances[balanceKeyUnderlying]).multipliedBy(10 ** decimals).toFixed(0);
        

        let allowance = await underlying['allowance(address,address)']($eth.address, token.productiveAs.address);
        
        const arg = requestedAmount.dividedBy(10 ** decimals).toFixed(0);
        console.log('allowance', allowance.toString(), decimals, arg);
        console.log('max', max.toString());
        
    
        if (!$eth.address || !$eth.signer) {
          displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
          connectWeb3();
          return;
        }
    
        if (BigNumber(requestedAmount).isGreaterThan(BigNumber(max)) ) {
          const message = `Not enough token`;
          displayNotification({ message, type: "error", autoDismiss: 30000 });
          return;
        }

        let needAllowance = BigNumber( allowance.toString() ).isLessThan( BigNumber(requestedAmount) );
        if( needAllowance ) {
          console.log('Im asking for allowance')
          await askApproval(token.address, token.productiveAs.address);
        }

        console.log('Allowance done');
    
        const instance = new ethers.Contract(token.productiveAs.address, decimalWrapperABI, $eth.signer); 
        const { emitter } = displayNotification(await instance.deposit(requestedAmountWei) );
    
        emitter.on("txConfirmed", ({ hash }) => {
          const { dismiss } = displayNotification({
            message: "Confirming...",
            type: "pending",
          });
    
          const subscription = subject("blockNumber").subscribe({
            next: async () => {
              displayNotification({
                autoDismiss: 15000,
                message: `${requestedAmount.toFixed()} ${token.symbol} successfully wrapped`,
                type: "success",
              });

              dismiss();
              subscription.unsubscribe();
            },
          });
    
          return {
            autoDismiss: 1,
            message: "Mined",
            type: "success",
          };
        });
      };
    
    </script>
    
    
    <div class="liquidity-container flex-col justify-items-center bg-grey-243 rounded-4px lg:px-4 lg:pb-4">
      <div class="flex justify-center font-thin mb-2">
      </div>
    
      <!-- <div class="w-100pc flex justify-center justify-items-center content-center text-center">
        <button on:click={ () => selectedTab = 0} class:oven-button-active={selectedTab === 0} class="oven-button m-0 mb-4 w-50pc rounded-8px min-w-100px lg:w-20pc lg:min-w-100px">
            Wrap
        </button>
      </div> -->
    
          <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white">
              <div class="flex items-center justify-between">
                <div class="flex nowrap intems-center p-1 font-thin">Amount to wrap</div>
                <div class="right text-white font-bold text-xs py-1px text-center align-right float-right rounded">
                  <button on:click={() => amount = toFixed($balances[balanceKeyUnderlying])} class="oven-withdraw-button">100%</button>
                </div>
              </div>
              <div class="flex nowrap items-center p-1">
                <input bind:value={amount} class="swap-input-from" inputmode="decimal" autocomplete="off" autocorrect="off" type="number" pattern="^[0-9]*[.]?[0-9]*$" placeholder="0.0" minlength="1" maxlength="79" spellcheck="false">
                <div class="h-32px flex items-center pointer">
              <img class="token-icon w-30px h-30px" src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" alt="ETH">
              <span class="py-2px px-4px">ETH</span></div> 
            </div>
          </div>
    
        <div class="flex justify-center">
          <button on:click={deposit} class="btn m-0 mt-4 rounded-8px px-56px py-15px" >Deposit</button>
        </div>
    
        <div class="flex w-100pc bg-lightgrey-2 p-4 rounded mt-8 flex-col text-black text-center text-xs md:text-xs lg:text-base justify-around">
         
          <div class="flex w-100pc justify-between items-center py-2 px-4  bg-white rounded">
            <div class="flex flex-col items-start">
            <div class="font-thin text-base">
              Your wATRI
            </div>
            <div class="font-bold text-base">{toFixed($balances[balanceKeyWrapped], 6)} ETH</div>
          </div>
            <button disabled={$balances[balanceKeyWrapped] === 0} on:click={() => withdraw()} class="oven-withdraw-button">withdraw</button>
          </div>
    
          <div class="flex w-100pc justify-between items-center py-2 px-4 mt-2 bg-white rounded">
            <div class="flex flex-col items-start">
                <div class="font-thin text-base">
                Your ATRI:
                </div>
                <div class="font-bold text-base">{toFixed($balances[balanceKeyUnderlying], 0)} </div>
            </div>
          </div>
    
        </div>
</div>