<script>
    import { _ } from 'svelte-i18n';
    import get from 'lodash/get';
    import flattenDeep from 'lodash/flattenDeep';

  
    import images from '../config/images.json';
    import poolsConfig from '../config/pools.json';
    import { piesMarketDataStore } from '../stores/coingecko.js';
    
    import { amountFormatter } from '../components/helpers.js';
  
    import { pools } from '../stores/eth.js';

  import BigNumber from "bignumber.js";
  import recipeUnipool from '../config/unipoolABI.json';

  import displayNotification from "../notifications.js";
  import {
    subscribeToBalance,
    subscribeToAllowance,
    subscribeToStaking,
    subscribeToStakingEarnings,
  } from "../components/helpers.js";

  import {
    allowances,
    functionKey,
    approveMax,
    balanceKey,
    balances,
    connectWeb3,
    contract,
    eth,
    bumpLifecycle,
    subject,
  } from "../stores/eth.js";


  
    export let params;
  
    $: token = params.address;
  
    let pieOfPies = false;
    let tradingViewWidgetComponent;
  
    $: links = (poolsConfig[token] || {}).landingLinks || [];
  
    $: symbol = (poolsConfig[token] || {}).symbol;
    $: swapFees = (poolsConfig[token] || {}).swapFees;
    $: tokenLogo = images.logos[token];
    $: change24H = get(
      $piesMarketDataStore,
      `${token}.market_data.price_change_percentage_24h`,
      null,
    );
    $: tokenPrice = get(
      $piesMarketDataStore,
      `${token.toLowerCase()}.market_data.current_price`,
      null,
    );
  
    $: (() => {
      pieOfPies = false;
    })(token);
  
    $: composition = flattenDeep(
      $pools[token].map((component) => {
        if (component.isPie) {
          if(!pieOfPies) pieOfPies = [];
          pieOfPies.push(component);
          return $pools[component.address].map((internal) => {
            return {
              ...internal,
              percentage: ((component.percentage / 100) * (internal.percentage / 100) * 100).toFixed(
                2
              ),
            };
          });
        }
        return component;
      })
    );
  
    $: options = {
      symbol: poolsConfig[token].tradingViewFormula,
      container_id: `single-pie-chart-${token}`,
      theme: 'light',
      autosize: true,
      interval: '60',
      locale: 'en',
      style: 3,
      hide_top_toolbar: true,
      hide_legend: true,
      allow_symbol_change: false,
    };
  
    $: tradingViewWidgetComponent ? tradingViewWidgetComponent.initWidget(options) : null;

    let ethKey;
  let ethBalance = 0;
  let intiated = false;
  let amountToStake = 0;
  $: amountToClaim = pool && $balances[pool.KeyUnipoolEarnedBalance] ? $balances[pool.KeyUnipoolEarnedBalance] : "0.00000000";
  let amountToUnstake = "0.00000000";
  
  $: needAllowance = true;
  $: incentivizedPools = [
    {
      addressTokenToStake: '0x43c3A3d3616B492E0788AB70905e28D17666a91D',
      addressUniPoll: '0x57eFE63548Ec9aA39Fc06cacA3D5Ee71c1814869',
      name: 'DOUGH / ETH',
      description: 'WEEKLY REWARDS',
      weeklyRewards: 200000,
      apy: 1.8,
      allowance: 0,
      allowanceKey: '',
      highlight: true,
      needAllowance: true,
    },
    {
      addressTokenToStake: '0x83a6Fa745cF0bc3880D0be47A878EB5b80fd8Fa5',
      addressUniPoll: '0x233aC080DE7Ec6e08089a4A6789ee5565bfB677e',
      name: 'DEFI+S',
      description: 'WEEKLY REWARDS',
      weeklyRewards: 25000,
      apy: 1.8,
      allowance: 0,
      allowanceKey: '',
      needAllowance: true,
    },
    {
      addressTokenToStake: '0x83a6Fa745cF0bc3880D0be47A878EB5b80fd8Fa5',
      addressUniPoll: '0x233aC080DE7Ec6e08089a4A6789ee5565bfB677e',
      name: 'DEFI+S / DAI',
      description: 'WEEKLY REWARDS',
      weeklyRewards: 25000,
      apy: 1.8,
      allowance: 0,
      allowanceKey: '',
      needAllowance: true,
    },
  ]

  $: {     
    if(pool)
      needAllowance = needApproval(pool, ($allowances[pool.allowanceKey] || BigNumber(0)));
  }

  $: pool = null;

  $: if($eth.address && !intiated) {
    incentivizedPools.forEach( p => {
      subscribeToBalance(p.addressTokenToStake, $eth.address, true);
      subscribeToStaking(p.addressUniPoll, $eth.address, true);
      subscribeToStakingEarnings(p.addressUniPoll, $eth.address, true);
      subscribeToAllowance(p.addressTokenToStake, $eth.address, p.addressUniPoll);

      p.allowanceKey = functionKey(p.addressTokenToStake, 'allowance', [$eth.address, p.addressUniPoll]);
      p.KeyAddressTokenToStake = balanceKey(p.addressTokenToStake, $eth.address);
      p.KeyUnipoolBalance = balanceKey(p.addressUniPoll, $eth.address);
      p.KeyUnipoolEarnedBalance = balanceKey(p.addressUniPoll, $eth.address, '.earned');
    })
    intiated = true;
    bumpLifecycle();
  }

  const needApproval = (pool, allowance) => {
    if( allowance.isEqualTo(0) ) return true;
    if( allowance.isGreaterThanOrEqualTo( BigNumber(amountToStake)) ) return false;
  }

  const action = async (pool, actionType) => {
    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
      connectWeb3();
      return;
    }

    const { addressTokenToStake, addressUniPoll } = pool;

    if (actionType === "unlock") {
      await approveMax(addressTokenToStake, addressUniPoll);
      needAllowance = false;
    }
  };

  const unstake = async () => {
    const requestedAmount = BigNumber(amountToUnstake);
    const max = $balances[pool.KeyUnipoolBalance];

    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
      connectWeb3();
      return;
    }

    const unipool = await contract({ address: pool.addressUniPoll, abi: recipeUnipool });
    const amountWei = requestedAmount.multipliedBy(10 ** 18).toFixed(0);

    // displayNotification({ message, type: "error", autoDismiss: 30000 });

    const { emitter } = displayNotification(await unipool.withdraw(amountWei) );

    emitter.on("txConfirmed", ({ hash }) => {
      const { dismiss } = displayNotification({
        message: "Confirming...",
        type: "pending",
      });

      const subscription = subject("blockNumber").subscribe({
        next: () => {
          displayNotification({
            autoDismiss: 15000,
            message: `${requestedAmount.toFixed()} unstaked successfully`,
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
  }

  const stake = async () => {
    const requestedAmount = BigNumber(amountToStake);
    const max = $balances[pool.KeyAddressTokenToStake];

    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
      connectWeb3();
      return;
    }

    const unipool = await contract({ address: pool.addressUniPoll, abi: recipeUnipool });
    const amountWei = requestedAmount.multipliedBy(10 ** 18).toFixed(0);

    // displayNotification({ message, type: "error", autoDismiss: 30000 });

    const { emitter } = displayNotification(await unipool.stake(amountWei) );

    emitter.on("txConfirmed", ({ hash }) => {
      const { dismiss } = displayNotification({
        message: "Confirming...",
        type: "pending",
      });

      const subscription = subject("blockNumber").subscribe({
        next: () => {
          displayNotification({
            autoDismiss: 15000,
            message: `${requestedAmount.toFixed()} staked successfully`,
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
  }

  const getRewards = async () => {
    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
      connectWeb3();
      return;
    }

    const unipool = await contract({ address: pool.addressUniPoll, abi: recipeUnipool });
    const { emitter } = displayNotification(await unipool.getReward() );

    emitter.on("txConfirmed", ({ hash }) => {
      const { dismiss } = displayNotification({
        message: "Confirming...",
        type: "pending",
      });

      const subscription = subject("blockNumber").subscribe({
        next: () => {
          displayNotification({
            autoDismiss: 15000,
            message: `${requestedAmount.toFixed()} staked successfully`,
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
  }
  </script>
  
  
  
  <div class="content flex flex-col spl">
   <img class="w-100pc h-auto md:w-100pc h-auto"src={images.herodough} alt="PieDAO Hero" />


   <div class="text-center font-thin text-xs mt-8 md:mt-20 md:text-lg">
    DOUGH is the PieDAO governance token. Owning DOUGH makes you a member of PieDAO. Holders are capable of participating in the DAO’s governance votes and proposing votes of their own. 1.5M DOUGH tokens will be available on Balancer around Oct 3, 2020, at 1:00 pm UTC.<br/>
   </div>
   <a class="singleTag font-bold mt-4 md:mt-4" href={`https://medium.com/piedao/dough-tokens-d2479c7ea608`}>Learn more about DOUGH</a>



   <div class="bg-grey-243 rounded-sm pt-8 pb-8 flex justify-between flex-wrap w-full mt-4 md:mt-8">
    <div class="p-0 md:w-1/4">
      <div class="text-center font-thin text-xs md:text-base">PieDAO</div>
      <div class="text-center text-2xl md:text-xl font-black">Governance</div>
    </div>
    <div class="p-0 md:w-1/4">
      <div class="text-center font-thin text-xs md:text-base">Value accrual</div>
      <div class="text-center text-2xl md:text-xl font-black">Fees</div>
    </div>
    <div class="p-0 md:w-1/4">
        <div class="text-center font-thin text-xs md:text-base">Liquidity</div>
        <div class="text-center text-2xl md:text-xl font-black">Mining</div>
      </div>
    <div class="p-0 md:w-1/4">
      <div class="text-center font-thin text-xs md:text-base">Staking &</div>
      <div class="text-center text-2xl md:text-xl font-black">Delegation</div>
    </div>
  </div>


  <img class="w-20pc h-auto mt-8 l md:mt-12 md:w-20pc h-auto"src={images.tokenmigration} alt="PieDAO Hero" />
  <h1 class="text-center text-lg  mt-8 md:text-xl md:mt-12">Token Migration</h1>
  <div class="text-center font-thin text-xs mt-2 md:mt-4 md:text-lg">
    PieDAO is entering the next phase of its mission to democratize the access to wealth allocation strategies by migrating the currently non-transferable token (DOUGHv1) to a transferable one (DOUGHv2).<br/>
    To further develop the community and to incentivize early adopters through the liquidity mining program the community believes the time is right to start the migration of DOUGH to DOUGH v2.<br/>
  </div>
  <a class="singleTag font-bold mt-4 md:mt-4" href={`https://medium.com/piedao/piedao-token-migration-d2e9cd5d1a16`}>DOUGH Migration on Medium</a>
  

  <div class="bg-grey-243 rounded-sm p-8 flex justify-between flex-wrap w-full mt-8 md:mt-20">
    <div class="p-4 flex justify-center items-center content-center flex-wrap md:w-2/3">
        <h1 class="text-lg md:text-xl">Vesting Period</h1>
        <div class="font-thin text-xs mt-2 md:mt-4 md:text-base">
            To align incentives early token requests were accepted at a lower rate then later ones but are subject to longer vesting periods. DOUGH holders are subject to the following vesting schedules:<br/>
            <ul class="list-disc list-inside mt-2 md:mt-4">
                <li>Contribution on Epoch 1 (from block to block) 1.5y vesting</li>
                <li>Contribution on Epoch 2 (from block to block) 1y vesting</li>
                <li>Summoners 3y vesting</li>
                <li>Bounties, no vesting applied</li>
              </ul>
        </div>
    </div>
    <div class="p-4 flex justify-center w-full flex-wrap md:w-1/3 p-16"><img class="w-100pc h-auto md:w-100pc h-auto"src={images.vestingperiod} alt="PieDAO Hero" /></div>
  </div>

  <div class="bg-grey-243 rounded-sm p-8 flex justify-between flex-wrap w-full mt-4 md:mt-8">
    <div class="p-4 flex justify-center w-full flex-wrap md:w-1/3 p-16"><img class="w-100pc h-auto md:w-100pc h-auto"src={images.howtomigrate} alt="PieDAO Hero" /></div>
    <div class="p-4 flex justify-center items-center content-center flex-wrap md:w-2/3">
        <h1 class="text-lg md:text-xl">How to Migrate</h1>
        <div class="font-thin text-xs mt-2 md:mt-4 md:text-base">
            To make the process as simple as possible an Aragon app will be installed which allows you to migrate your tokens.<br/>
            By visiting the Aragon interface of PieDAO and opening the migration app you can easily migrate your already vested tokens to DOUGH v2.
The interface will automatically fill in the maximum amount you are able to migrate.<br/>
<a class="font-bold mt-4 md:mt-4" href={`https://medium.com/piedao/dough-farming-season-7329ea5e84dd`}>Migrate Now</a>

        </div>
    </div>
  </div>



  <img class="w-25pc h-auto mt-8 l md:mt-16 md:w-25pc h-auto"src={images.liquiditymining} alt="PieDAO Hero" />
  <h1 class="text-center text-lg  mt-8 md:text-xl md:mt-12">Liquidity Mining</h1>
  <div class="text-left font-thin text-xs mt-2 md:mt-4 md:text-lg">
    With the imminent migration to the DOUGH v2 governance token and the launch of the DOUGH / ETH liquidity pool on Balancer, PieDAO will also open its DOUGH farming season!
  </div>
    <div class="text-left font-thin text-xs mt-2 md:mt-4 md:text-lg">
    <strong>Incentives: </strong>60,000,000 DOUGH v2 tokens (60% of total) will be locked in a vault off-circulation and assigned to the DAO to promote its development overtime through liquidity mining programs and other incentives.
</div>
    <div class="text-left font-thin text-xs mt-2 md:mt-4 md:text-lg">
    <strong>Eligibility: </strong>All Liquidity Providers to selected pools will be eligible for these incentive programs by staking their LP tokens to PieDAO staking contract.
</div>
    <!-- <div class="w-100pc text-left font-thin text-xs mt-2 md:mt-4 md:text-lg">
    <strong>Pools: </strong>
    <ul class="list-disc list-inside mt-2 md:mt-4">
        <li>Contribution on Epoch 1 (from block to block) 1.5y vesting</li>
        <li>Contribution on Epoch 2 (from block to block) 1y vesting</li>
        <li>Summoners 3y vesting</li>
        <li>Bounties, no vesting applied</li>
      </ul>
    </div> -->

  <a class="singleTag font-bold mt-4 md:mt-4" href={`https://medium.com/piedao/dough-farming-season-7329ea5e84dd`}>Learn more about farming</a>
  <h1 class="text-center text-lg  mt-8 md:text-xl md:mt-12">Available Pools</h1>
  <div class="liquidity-container flex flex-col align-center bg-grey-243 rounded-4px p-4 my-4 md:p-6 w-full">

    {#if !pool}
    <h1 class="mt-8 mb-1 px-2 text-center text-lg md:text-xl">Select a pool</h1>
    <div class="flex flex-col w-full justify-center md:flex-row">
        {#each incentivizedPools as ammPool}
          {#if ammPool.highlight }
            <div class="highlight-box farming-card flex flex-col justify-center align-center items-center text-center mx-2 my-2 md:m-2 border border-gray border-opacity-50 border-solid rounded-sm p-6">
              <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.logos.piedao_clean} alt="PieDAO logo" />
                <div class="title text-lg"> {ammPool.name}</div>
                <div class="subtitle font-thin">{ammPool.description}</div>
                <div class="apy">{ammPool.weeklyRewards} DOUGH</div>
                <button on:click={() => pool = ammPool } class="btn border-white clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Select</button>
            </div>
          {:else}
            <div class="farming-card flex flex-col justify-center align-center items-center text-center mx-2 my-2 md:m-2 border border-gray border-opacity-50 border-solid rounded-sm p-6">
              <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.logos.piedao_clean} alt="PieDAO logo" />
                <div class="title text-lg"> {ammPool.name}</div>
                <div class="subtitle font-thin">{ammPool.description}</div>
                <div class="apy">{ammPool.weeklyRewards} DOUGH</div>
                <button on:click={() => pool = ammPool } class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Select</button>
            </div>
          {/if}
        {/each}
    </div>
    {:else}
        <div>
          <button on:click={() => pool = null } class="md:w-1 float-left btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Go back</button>
          <button on:click={() => pool = null } class="float-right btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Claim and Unstake</button>
        </div>

        <div class="flex flex-col w-full justify-around md:flex-row">
          <!-- UNSTAKE BOX -->
          <div class="farming-card flex flex-col justify-center align-center items-center mx-1 my-4  border border-gray border-opacity-50 border-solid rounded-sm py-2">
                <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.logos.piedao_clean} alt="PieDAO logo" />
                <div class="title text-lg">UNSTAKE</div>
                <div class="subtitle font-thin">STAKED BALANCE</div>
                <div class="apy">
                  {pool.KeyAddressTokenToStake ? amountFormatter({ amount: $balances[pool.KeyUnipoolBalance], displayDecimals: 4}) : 0.0000} LP
                </div>
                <div class="w-80 input bg-white border border-solid rounded-8px border-grey-204 mx-0 md:mx-4">
                    <div class="top h-24px text-sm font-thin px-4 py-4 md:py-2">
                        <div class="left float-left">{$_('general.amount')} to unstake</div>
                    </div>
                    <div class="bottom px-4 py-4 md:py-2">
                        <input bind:value={amountToUnstake} type="text" class="text-black font-thin text-base w-60pc md:w-75pc md:text-lg">
                        <div class="text-black asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex align-middle justify-center items-center pointer mt-0">
                            <button on:click={() => {
                              if($balances[pool.KeyUnipoolBalance]) {
                                amountToUnstake = $balances[pool.KeyUnipoolBalance].toFixed(4, BigNumber.ROUND_DOWN);
                              } else {
                                amountToUnstake = 0;
                              }}} class="text-black py-2px px-4px">MAX</button>
                        </div>
                    </div>            
                </div>
                <button on:click={() => unstake()} class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Unstake</button>
          </div>

          <!-- STAKE BOX -->
          <div class="farming-card highlight-box flex flex-col justify-center align-center items-center mx-1 my-4  border border-grey border-opacity-50 border-solid rounded-sm py-2">
                <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.logos.piedao_clean} alt="PieDAO logo" />
                <div class="title text-lg"> STAKE</div>
                <div class="subtitle font-thin">BALANCE</div>
                <div class="apy">
                  {pool.KeyAddressTokenToStake ? amountFormatter({ amount: $balances[pool.KeyAddressTokenToStake], displayDecimals: 4}) : 0.0000} LP
                </div>
                <div class="w-80 input bg-white border border-solid rounded-8px border-grey-204 mx-0 md:mx-4">
                    <div class="top h-24px text-sm font-thin px-4 py-4 md:py-2">
                        <div class="text-black left black float-left">{$_('general.amount')} to stake</div>
                    </div>
                    <div class="bottom px-4 py-4 md:py-2">
                        <input bind:value={amountToStake} type="text" class="text-black font-thin text-base w-60pc md:w-75pc md:text-lg">
                        <div class="text-black asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex align-middle justify-center items-center pointer mt-0">
                            <button on:click={() => {
                              if($balances[pool.KeyAddressTokenToStake]) {
                                amountToStake = $balances[pool.KeyAddressTokenToStake].toFixed(4, BigNumber.ROUND_DOWN);
                              } else {
                                amountToStake = 0;
                              }}} class="text-black py-2px px-4px">MAX</button>
                        </div>
                    </div>           
                </div>
                {#if needAllowance }
                  <button on:click={ () => action(pool, 'unlock')} class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4 border-white">Approve</button>
                {:else}
                  <button on:click={() => stake()} class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4 border-white">Stake</button>
                {/if}
          </div>

          <!-- CLAIM BOX -->
          <div class="farming-card flex flex-col justify-center align-center items-center mx-1 my-4  border border-gray border-opacity-50 border-solid rounded-sm py-2">
                <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.logos.piedao_clean} alt="PieDAO logo" />
                <div class="title text-lg">REWARDS AVAILABLE</div>
                <div class="subtitle font-thin">DOUGH TO CLAIM</div>
                <div class="apy">
                  {pool.KeyUnipoolEarnedBalance ? amountFormatter({ amount: $balances[pool.KeyUnipoolEarnedBalance], displayDecimals: 4}) : 0.0000} DOUGH
                </div>
                <div class="w-80 input bg-white border border-solid rounded-8px border-grey-204 mx-0 md:mx-4">
                    <div class="top h-24px text-sm font-thin px-4 py-4 md:py-2">
                        <div class="left float-left">{$_('general.amount')} to claim</div>
                    </div>
                    <div class="bottom px-4 py-4 md:py-2">
                        <input disabled bind:value={amountToClaim} type="text" class="text-black font-thin text-base w-60pc md:w-75pc md:text-lg">
                        <div class="text-black asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex align-middle justify-center items-center pointer mt-0">
                            <button on:click={() => {
                              if($balances[pool.KeyUnipoolEarnedBalance]) {
                                amountToClaim = $balances[pool.KeyUnipoolEarnedBalance].toFixed(4, BigNumber.ROUND_DOWN);
                              } else {
                                amountToClaim = 0;
                              }}} class="text-black py-2px px-4px">MAX</button>
                        </div>
                    </div>            
                </div>
                <button on:click={() => getRewards()} class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Claim</button>
          </div>
        </div>
    {/if}
</div>

 


</div>



  