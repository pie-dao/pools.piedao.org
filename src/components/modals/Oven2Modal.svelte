<script>
    import { onMount } from 'svelte';
    import { get } from "svelte/store";
    import orderBy from 'lodash/orderBy';
    import { erc20 } from "@pie-dao/abis";    
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
      toFixed,
      subscribeToBalance
    } from "../../components/helpers.js";
    
    import Gauge from '../../components/charts/gauge.svelte';
    
    export let ovenAddress;
    export let keyBalance;
    export let pieAddress;
    export let deprecated;
    
    let amount = 0;
    let instance;
    let ethKey;
    let wethKey;
    const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    
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
      wethKey = balanceKey(WETH_ADDRESS, $eth.address);
      subscribeToBalance(WETH_ADDRESS, $eth.address);
    }
    
    $: ethBalance = BigNumber($balances[ethKey]).toFixed(4);
    $: wethBalance = BigNumber($balances[wethKey]).toFixed(4);
    
    onMount(async () => {
      const { provider, signer } = get(eth);
      instance = new ethers.Contract(ovenAddress, ovenABI, signer);
      
      await fetch();
      ovenData.logs = []
    });
    
    const fetch = async () => {
        const ethBal = await instance.inputBalanceOf($eth.address);
        const pieBal = await instance.outputBalanceOf($eth.address);
        ovenData.ethBalance = ethBal / 1e18;
        ovenData.ethBalanceBn = ethBal;
        ovenData.pieBalance = pieBal / 1e18;
        ovenData.pieBalanceBn = pieBal;
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
                message: `Pie successfully withdrew from the Oven`,
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
                message: `WETH successfully withdrew from the Oven`,
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
        resolve();
        return { message: `${symbol} unlocked`, type: 'success' };
      }));
    }

    const depositWETH = async () => {
        const underlying = new ethers.Contract(WETH_ADDRESS, erc20, $eth.signer); 
        const decimals = await underlying.decimals();
        const requestedAmount = BigNumber(amount);
        const requestedAmountWei = requestedAmount.multipliedBy(10 ** decimals).toFixed(0);

        const max = BigNumber(wethBalance).multipliedBy(10 ** decimals).toFixed(0);
        let allowance = await underlying['allowance(address,address)']($eth.address, ovenAddress);
        
        console.log('allowance', allowance, allowance.toString(), decimals);
        console.log('max', max.toString());
        console.log('requestedAmountWei', requestedAmountWei.toString());
        
    
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


        let needAllowance = BigNumber( allowance.toString() ).isLessThan( BigNumber(requestedAmountWei) );
        console.log('needAllowance', needAllowance)
        
        if( needAllowance ) {
          console.log('Im asking for allowance')
          await askApproval(WETH_ADDRESS, ovenAddress);
        }

        console.log('Allowance done');
    
        try {
          const { emitter } = displayNotification(await instance.deposit(requestedAmountWei.toString()) );
    
          emitter.on("txConfirmed", ({ hash }) => {
            const { dismiss } = displayNotification({
              message: "Confirming...",
              type: "pending",
            });

            const subscription = subject("blockNumber").subscribe({
              next: async () => {
                displayNotification({
                  autoDismiss: 15000,
                  message: `${requestedAmount.toFixed()} WETH successfully deposited in the Oven`,
                  type: "success",
                });
                await fetch();
                amount = 0;
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
        } catch(e) {
          displayNotification({ message: e.message, type: "error", autoDismiss: 30000 });
        }
        
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
              amount = 0;
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
        With Oven V2, all the other pies are getting added.<br/><br/>

        <strong>Small fees</strong><br/>
        With Oven V2, while sharing the cost of the gas, we ask users to chip in in the cost of the baking round with a small fee that is paid according to the deposit size.<br/>
        This will help PieDAO to cover the high cost of minting the Pie. The fee will change over time according to the gas market and the gas price the community find reasonable to mint at.
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
    
      <!-- <div class="w-100pc">
        We have noticed a potential misfunction on the Oven V2 functionality, while investiganting the deposit and withdraw has been disabled. <br><br>
        <strong>Funds are SAFE and they will be returned as soon the issue is resolved.</strong><br><br>
        Thanks for your patience 🙏.
      </div> -->
      <div class="w-100pc flex justify-center justify-items-center content-center text-center">
        <button on:click={ () => selectedTab = 0} class:oven-button-active={selectedTab === 0} class="oven-button m-0 mb-4 w-50pc rounded-8px min-w-100px lg:w-20pc lg:min-w-100px">
            Status
        </button>
        <button on:click={ () => selectedTab = 1} class:oven-button-active={selectedTab === 1} class="oven-button m-0 mb-4 w-50pc rounded-8px min-w-100px lg:w-20pc lg:min-w-100px">
            Deposit ETH
        </button>
        <button on:click={ () => selectedTab = 2} class:oven-button-active={selectedTab === 2} class="oven-button ml-2 m-0 mb-4 w-50pc rounded-8px min-w-100px lg:w-20pc lg:min-w-100px">
          Deposit WETH
      </button>
      </div>
    
      {#if selectedTab === 0}
        <div class="flex justify-center py-4">
          <Gauge value={BigNumber($balances[balanceKeyOven]).toFixed(4)} max={10} />
        </div>
      {/if}
      
      {#if selectedTab === 1}
          <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white">
              <div class="flex items-center justify-between">
                <div class="flex nowrap intems-center p-1 font-thin">Amount to Deposit</div>
                <div class="right text-white font-bold text-xs py-1px text-center align-right float-right rounded">
                  <button on:click={() => amount = ethBalance-0.1} class="oven-withdraw-button">100%</button>
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
            <span class="font-thin ml-2">*Max Baking round fee: 2%</span>
          </TooltipButton>
    
        <div class="flex justify-center">
          <button on:click={deposit} class="btn m-0 mt-4 rounded-8px px-56px py-15px" >Deposit</button>
        </div>

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
        <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white">
            <div class="flex items-center justify-between">
              <div class="flex nowrap intems-center p-1 font-thin">Amount to Deposit </div>
              <div class="right text-white font-bold text-xs py-1px text-center align-right float-right rounded">
                <button on:click={() => amount = wethBalance} class="oven-withdraw-button">100%</button>
              </div>
            </div>
            <div class="flex nowrap items-center p-1">
              <input bind:value={amount} class="swap-input-from" inputmode="decimal" autocomplete="off" autocorrect="off" type="number" pattern="^[0-9]*[.]?[0-9]*$" placeholder="0.0" minlength="1" maxlength="79" spellcheck="false">
              <div class="h-32px flex items-center pointer">
            <img class="token-icon w-30px h-30px" src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" alt="ETH">
            <span class="py-2px px-4px">WETH</span></div> 
          </div>
        </div>
        
        <TooltipButton tooltip="The fee is going to be shared by all participants according to deposit size">
          <span class="font-thin ml-2">*Max Baking round fee: 2%</span>
        </TooltipButton>

      <div class="flex justify-center">
        <button on:click={depositWETH} class="btn m-0 mt-4 rounded-8px px-56px py-15px" >Deposit WETH</button>
      </div>

        <div class="flex w-100pc mt-8 flex-col text-black text-center text-xs md:text-xs lg:text-base justify-around">


        <div class="flex flex-col w-full rounded-sm bg-white">
          <div class="flex w-full justify-between items-center p-2">
            <span class="font-thin">Your ETH in the Oven</span>
            <span>{toFixed(ovenData.ethBalance, 6)} WETH</span>
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

    </div>