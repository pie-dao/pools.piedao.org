<script>
    import { onMount } from 'svelte';
    import { get } from "svelte/store";
    import orderBy from 'lodash/orderBy';
    
    import { _ } from "svelte-i18n";
    import BigNumber from "bignumber.js";
    import { ethers } from "ethers";
    import poolsConfig from "../../config/pools.json";
    import ovenABI from '../../config/OvenV2ABI.json';
    import displayNotification from "../../notifications.js";
    import Modal from '../../components/elements/Modal.svelte';
    import images from '../../config/images.json';
    import TooltipButton from '../../components/elements/TooltipButton.svelte';

    import {
        balanceKey,
        balances,
        subject,
        eth
    } from "../../stores/eth.js";
    
    import {
      getTokenImage,
      fetchEthBalance,
      toFixed
    } from "../../components/helpers.js";
    
    import Gauge from '../../components/charts/gauge.svelte';
    
    export let ovenAddress;
    export let keyBalance;
    export let pieAddress;
    export let deprecated;
    
    let amount = 0;
    let instance;
    let ethKey;
    
    $: balanceKeyOven = keyBalance;
    $: selectedTab = deprecated ? 2 : 1;
    $: ovenData = {
      ethBalance: 0,
      pieBalance: 0,
      logs: []
    }
    
    $: pie = poolsConfig[pieAddress];
    $: initialized = false;
    
    $: if($eth.address) {
      fetchEthBalance($eth.address);
      ethKey = balanceKey(ethers.constants.AddressZero, $eth.address);
    }
    
    $: ethBalance = BigNumber($balances[ethKey]).toFixed(4);
    
    onMount(async () => {
      const { provider, signer } = get(eth);
      instance = new ethers.Contract(ovenAddress, ovenABI, signer);
      
      await fetch();
    
      let bakeLogs = await instance.queryFilter(instance.filters.Bake(), 3604155, "latest");
      ovenData.logs = orderBy(bakeLogs.map( log => {
        return {
          amount: (log.args.amount / 1e18).toFixed(2),
          price: log.args.price / 1e18,
          user: log.args.user,
          tx: log.transactionHash,
          blockNumber: log.blockNumber
        }
      }), ['blockNumber'], ['desc']);
    
      console.log('bakeLogs', bakeLogs);
    });
    
    const fetch = async () => {
        const ethBal = await instance.inputBalanceOf($eth.address);
        const pieBal = await instance.outputBalanceOf($eth.address);
        ovenData.ethBalance = ethBal / 1e18;
        ovenData.ethBalanceBn = ethBal;
        ovenData.pieBalance = pieBal / 1e18;
        ovenData.pieBalanceBn = pieBal;
        ovenData.cap = await instance.cap() / 1e18;
        initialized = true;  
    };
    
    const withdrawPie = async () => {
        if (!$eth.address || !$eth.signer) {
          displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
          connectWeb3();
          return;
        }
        const { emitter } = displayNotification(await instance.withdraw(10000) );
    
        emitter.on("txConfirmed", ({ hash }) => {
          const { dismiss } = displayNotification({
            message: "Confirming...",
            type: "pending",
          });
    
          const subscription = subject("blockNumber").subscribe({
            next: async () => {
              displayNotification({
                autoDismiss: 15000,
                message: `${oven.baking.symbol} successfully withdrew from the Oven`,
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
    
    const withdrawEth = async () => {
        if (!$eth.address || !$eth.signer) {
          displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
          connectWeb3();
          return;
        }
    
        const { emitter } = displayNotification(await instance.withdraw(10000) );
    
        emitter.on("txConfirmed", ({ hash }) => {
          const { dismiss } = displayNotification({
            message: "Confirming...",
            type: "pending",
          });
    
          const subscription = subject("blockNumber").subscribe({
            next: async () => {
              displayNotification({
                autoDismiss: 15000,
                message: `${ovenData.ethBalance.toFixed()} ETH successfully withdrew from the Oven`,
                type: "success",
              });
              await fetch();
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
    
    const deposit = async () => {
        const requestedAmount = BigNumber(amount);
        const max = BigNumber(ethBalance).multipliedBy(10 ** 18).toFixed(0);
    
        if (!$eth.address || !$eth.signer) {
          displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
          connectWeb3();
          return;
        }
    
        if (BigNumber(requestedAmount).isGreaterThan(BigNumber(max)) ) {
          const message = `Not enough ETH`;
          displayNotification({ message, type: "error", autoDismiss: 30000 });
          return;
        }
    
        const amountWei = requestedAmount.multipliedBy(10 ** 18).toFixed(0);
        let overrides = {
          value: amountWei
        }
    
        const { emitter } = displayNotification(await instance.depositEth(overrides) );
    
        emitter.on("txConfirmed", ({ hash }) => {
          const { dismiss } = displayNotification({
            message: "Confirming...",
            type: "pending",
          });
    
          const subscription = subject("blockNumber").subscribe({
            next: async () => {
              displayNotification({
                autoDismiss: 15000,
                message: `${requestedAmount.toFixed()} ETH successfully deposited in the Oven`,
                type: "success",
              });
              await fetch();
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
      let modalinfo;
    </script>
    
    <Modal title="Oven V.2" backgroundColor="#f3f3f3" bind:this="{modalinfo}">
      <span slot="content" class="p-4 font-thin">
        <strong>Expanding range</strong><br/>
        With Oven V2, all the other pies are getting added, including DEFI+S, DEFI+L, USD++, and more upcoming Pies.<br/><br/>

        <strong>Small fees</strong><br/>
        With Oven V2, while sharing the cost of the gas, we ask users to chip in a 2% baking round fee that is paid according to the deposit size.<br/>
        This will help PieDAO to cover the high cost of minting the Pie.
        <br/><br/>
    
        <strong>More deposit assets</strong><br/>
        Oven V2 users will be able to choose between a range of input assets, with specific Ovens for ETH, DAI, USDC and more!<br/><br/>

        <strong>Provide Liquidity Together</strong><br/>
        The new architecture allows to easily build Ovens for community members to share the costs of adding liquidity together, handling everything on the back end.<br/><br/>

        <strong>Arbitrage Together</strong><br/>
        When the NAV and pie price differ this is an opportunity for arbitragers to either buy and redeem, or mint and sell and pocket that difference. This arbitrage opportunity means the pie price consistently moves towards the NAV peg.<br/><br/>
    </Modal>
    
    <div class="liquidity-container flex-col justify-items-center bg-grey-243 rounded-4px lg:px-4 lg:pb-4">
      <div class="flex justify-center font-thin mb-2">
    
            
            <a on:click={() => {
              modalinfo.open()
            }} class="cursor-pointer hover:opacity-60" role="menuitem">
            <div class="flex items-center font-bold text-xs md:text-base">
              OVEN V.2
                  <img src={images.InfoIcon} class="ml-1" alt="info" width="15px" />
            </div>
          </a>
    
      </div>
    
      <div class="w-100pc flex justify-center justify-items-center content-center text-center">
        <button on:click={ () => selectedTab = 0} class:oven-button-active={selectedTab === 0} class="oven-button m-0 mb-4 w-50pc rounded-8px min-w-100px lg:w-20pc lg:min-w-100px">
            Status
        </button>
        {#if !deprecated}
        <button on:click={ () => selectedTab = 1} class:oven-button-active={selectedTab === 1} class="oven-button m-0 mb-4 w-50pc rounded-8px min-w-100px lg:w-20pc lg:min-w-100px">
            Deposit
        </button>
        {/if}
        <!-- <button on:click={ () => selectedTab = 2} class:oven-button-active={selectedTab === 2} class="oven-button m-0 mt-4 mb-4 w-50pc rounded-8px min-w-100px lg:w-20pc lg:min-w-100px">
            Withdraw
        </button> -->
      </div>
    
      {#if selectedTab === 0}
        <div class="flex justify-center py-4">
          <Gauge value={BigNumber($balances[balanceKeyOven]).toFixed(4)} max={10} />
        </div>
        <table class="breakdown-table table-auto w-full mx-1">
            <thead>
              <tr>
                <th class="font-thin border-b-2 px-4 py-2 text-left">Baked {pie.symbol}</th>
                <th class="font-thin border-b-2 px-4 py-2">Block</th>
                <th class="font-thin border-b-2 px-4 py-2">Tx</th>
              </tr>
            </thead>
            <tbody>
              {#each ovenData.logs as log}
                <tr class="row-highlight">
                  <td class="pointer border border-gray-800 px-2 py-2 text-left">
                    {log.amount} {pie.symbol}
                  </td>
                  <td class="pointer border px-4 ml-8 py-2 font-thin text-center">
                    {log.blockNumber}
                  </td>
                  <td class="border px-4 ml-8 py-2 font-thin text-center">
                      <a href={`https://etherscan.io/tx/${log.tx}`} target="_blank">Etherscan</a>
                  </td>
                  
                </tr>
              {/each}
            </tbody>
          </table>
      {/if}
      
      {#if selectedTab === 1}
          <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white">
              <div class="flex items-center justify-between">
                <div class="flex nowrap intems-center p-1 font-thin">Amount to Deposit (min 0.1 ETH)</div>
                <div class="right text-white font-bold text-xs py-1px text-center align-right float-right rounded">
                  <button on:click={() => amount = ethBalance} class="oven-withdraw-button">100%</button>
                </div>
              </div>
              <div class="flex nowrap items-center p-1">
                <input bind:value={amount} class="swap-input-from" inputmode="decimal" autocomplete="off" autocorrect="off" type="number" pattern="^[0-9]*[.]?[0-9]*$" placeholder="0.0" minlength="1" maxlength="79" spellcheck="false">
                <div class="h-32px flex items-center pointer">
              <img class="token-icon w-30px h-30px" src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" alt="ETH">
              <span class="py-2px px-4px">ETH</span></div> 
            </div>
          </div>
          
          <TooltipButton tooltip="The fee is going to be shared by all participants according to deposit size">
            <span class="font-thin ml-2">*Baking round fee: 2%</span>
          </TooltipButton>
    
        <div class="flex justify-center">
          <button on:click={deposit} class="btn m-0 mt-4 rounded-8px px-56px py-15px" >Deposit</button>
        </div>
    
        <!-- <div class="flex w-100pc bg-lightgrey-2 p-4 rounded mt-8 flex-col text-black text-center text-xs md:text-xs lg:text-base justify-around"> -->
         
          <!-- <div class="flex w-100pc justify-between items-center py-2 px-4  bg-white rounded">
            <div class="flex flex-col items-start">
            <div class="font-thin text-base">
              Your ETH in the Oven
            </div>
            <div class="font-bold text-base">{toFixed(ovenData.ethBalance, 6)} ETH</div>
          </div>
          <button disabled={ovenData.ethBalance === 0} on:click={withdrawEth} class="oven-withdraw-button">withdraw</button>
          </div>
    
          <div class="flex w-100pc justify-between items-center py-2 px-4 mt-2 bg-white rounded">
            <div class="flex flex-col items-start">
            <div class="font-thin text-base">
              Your Pie ready
            </div>
            <div class="font-bold text-base">{toFixed(ovenData.pieBalance, 2)} {pie.symbol}</div>
          </div>
          <button disabled={ovenData.pieBalance === 0} on:click={withdrawPie} class="oven-withdraw-button ">withdraw</button>
          </div> -->

          <div class="flex w-100pc mt-8 flex-col text-black text-center text-xs md:text-xs lg:text-base justify-around">


          <div class="flex flex-col w-full rounded-sm bg-white">
            <div class="flex w-full justify-between items-center p-2">
              <span class="font-thin">Your ETH in the Oven</span>
              <span>{toFixed(ovenData.ethBalance, 6)} ETH</span>
            </div>
            <div class="flex w-full justify-between items-center p-2">
              <span class="font-thin">Your Pie ready</span>
              <span>{toFixed(ovenData.pieBalance, 2)} {pie.symbol}</span>
            </div>
          </div>

          <div class="flex justify-center">
            <button on:click={withdrawPie} class="btn m-0 mt-4 rounded-8px px-36px py-15px" >Withdraw All</button>
          </div>
    
        </div>
        {/if}
    
    
    
        {#if selectedTab === 2}
          <div class="flex justify-between flex-col items-center rounded-8px ">            
            <div class="input bg-white border border-solid rounded-8px border-grey-204 w-100pc">
                <div class="top h-32px text-sm font-thin px-4 py-4 md:py-2">
                  <div class="left float-left">Amount</div>
                  <div class="right text-white font-bold text-xs py-1px text-center align-right float-right rounded">
                    <button on:click={() => amount = ovenData.ethBalance} class="percentage-btn inline-block rounded-20px h-20px bg-black w-50px cursor-pointer">100%</button>
                  </div>
                </div>
                <div class="bottom  px-4 py-4 md:px-4 pb-4">
                  <input bind:value={amount} type="number" class="font-thin text-base w-60pc md:w-75pc md:text-xl">
                  <div class="asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex
                align-middle justify-center items-center pointer mt-0 md:mt-14px">
                <img class="token-icon w-20px h-20px md:h-26px md:w-26px my-4px mx-2px" src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" alt="ETH">
                <span class="py-2px px-4px">ETH</span></div> 
              </div>
            </div>
            
            <div class="flex justify-center">
              <button disabled={ovenData.ethBalance === 0} on:click={withdrawEth} class="btn m-0 mt-4 rounded-8px px-20px py-15px" >Withdraw ETH</button>
            </div>
          </div>
    
          <div class="flex justify-between flex-col items-center py-4 rounded-8px ">
                        
            <div class="input flex items-center h-97px bg-white border border-solid rounded-8px border-grey-204 mx-0 px-4 py-1 w-100pc md:px-4">
              <img class="token-icon w-40px h-40px  my-4px mx-2px" src={getTokenImage(pieAddress)} alt={`PieDAO ` + pie.symbol}>
              <span class="w-90pc lg:w-70pc md:w-70pc md:text-xl py-2px px-4px">{toFixed(ovenData.pieBalance, 2)} {pie.symbol}</span>
            </div>
            
            <div class="flex justify-center">
              <button disabled={ovenData.pieBalance === 0} on:click={withdrawPie} class="btn m-0 mt-4 rounded-8px px-20px py-15px" >Withdraw Pie</button>
            </div>
          </div>
        {/if}

    </div>