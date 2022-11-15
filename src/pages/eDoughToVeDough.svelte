<script>
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { eth, subject } from '../stores/eth.js';
  import { getTokenImage } from '../components/helpers';
  import { formatFiat } from '../components/helpers.js';
  import { _ } from 'svelte-i18n';
  import BigNumber from 'bignumber.js';
  import displayNotification from '../notifications';
  import { ethers } from 'ethers';
  import rewardEscrowAbi from '../abis/rewardEscrowAbi.json';
  import smartcontracts from '../config/smartcontracts.json';
  import moment from 'moment';
  import images from '../config/images.json';
  import StakedModal from '../components/elements/StakedModal.svelte';

  const baseListed = [
    {
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      symbol: 'ETH',
      icon: getTokenImage('eth'),
      decimals: 18,
    },
    {
      address: '0x63cbd1858bd79de1a06c3c26462db360b834912d',
      symbol: 'eDOUGH',
      icon: getTokenImage('0xad32A8e6220741182940c5aBF610bDE99E737b2D'),
      decimals: 18,
    },
    {
      address: '0xE6136F2e90EeEA7280AE5a0a8e6F48Fb222AF945',
      symbol: 'veDOUGH',
      icon: getTokenImage('0xE6136F2e90EeEA7280AE5a0a8e6F48Fb222AF945'),
      decimals: 18,
    },
  ];

  let defaultTokenSell = baseListed.find((l) => l.symbol === 'eDOUGH');
  let defaultTokenBuy = baseListed.find((l) => l.symbol === 'veDOUGH');

  const defaultAmount = {
    bn: new BigNumber(0),
    label: 0,
  };

  const toNum = (num, decimals = 18) =>
    Number(
      BigNumber(num.toString())
        .dividedBy(10 ** decimals)
        .toFixed(2),
    );

  $: sellToken = defaultTokenSell;
  $: buyToken = defaultTokenBuy;
  $: amount = defaultAmount;
  $: receivedAmount = 0;
  $: initialized = {
    onMount: false,
    onChainData: false,
  };
  $: isLoading = false;
  $: error = null;
  $: balanceError = false;

  let doughInEscrow = BigNumber(0);
  let veDoughInEscrow = BigNumber(0);
  let claimableDoughInEscrow = BigNumber(0);
  let accountSchedule = [];
  let stakedModal = null;
  let isStaking = false;
  let rewardEscrowContract;
  let modal_content_key = 'vesting_ve_dough';

  $: if ($eth.address || $eth.currentBlockNumber) {
    $eth.address || !$eth.signer;
    fetchRewardEscrowData();
  }

  $: if ($eth.address) {
    if (!initialized.onChainData && !isLoading) {
      isLoading = true;
      initialized.onChainData = true;
      isLoading = false;
    }
  }

  onMount(async () => {
    isLoading = true;
    if ($eth.signer || $eth.provider) {
      rewardEscrowContract = new ethers.Contract(
        smartcontracts.eDOUGH,
        rewardEscrowAbi,
        $eth.signer || $eth.provider,
      );
    }
    if ($eth.address) {
      initialized.onChainData = true;
    }

    initialized.onMount = true;
    isLoading = false;
  });

  $: if ($eth.address || $eth.currentBlockNumber) {
    $eth.address || !$eth.signer;
    fetchRewardEscrowData();
  }

  function mapAccountSchedule(accountSchedule) {
    let mappedAccountSchedule = [];

    for (var i = 0; i < accountSchedule.length / 2; i += 2) {
      if (!accountSchedule[i].eq(0) && !accountSchedule[i + 1].eq(0)) {
        mappedAccountSchedule.push({
          timestamp: accountSchedule[i],
          amount: accountSchedule[i + 1],
        });
      }
    }

    return mappedAccountSchedule;
  }

  async function fetchRewardEscrowData() {
    try {
      const address = $eth.address;

      if (!address) {
        return;
      }

      const { provider, signer } = get(eth);
      rewardEscrowContract = new ethers.Contract(
        smartcontracts.eDOUGH,
        rewardEscrowAbi,
        signer || provider,
      );

      doughInEscrow = await rewardEscrowContract.totalEscrowedAccountBalance(address);
      accountSchedule = mapAccountSchedule(
        await rewardEscrowContract.checkAccountSchedule(address),
      );

      let now = moment().unix();
      veDoughInEscrow = BigNumber(0);
      claimableDoughInEscrow = BigNumber(0);

      accountSchedule.forEach((schedule) => {
        if (now >= moment(moment.unix(schedule.timestamp.toString())).subtract(26, 'week').unix()) {
          veDoughInEscrow = veDoughInEscrow.plus(schedule.amount.toString());
          amount.bn = veDoughInEscrow;
          amount.label = toNum(veDoughInEscrow, 18);
          receivedAmount = amount.label;
        }

        if (now >= moment(moment.unix(schedule.timestamp.toString())).unix()) {
          claimableDoughInEscrow = claimableDoughInEscrow.plus(schedule.amount.toString());
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function stake() {
    isStaking = true;

    try {
      const { emitter } = displayNotification(await rewardEscrowContract.migrateToVeDOUGH());

      emitter.on('txConfirmed', async () => {
        const subscription = subject('blockNumber').subscribe({
          next: async () => {
            displayNotification({
              autoDismiss: 15000,
              message: 'You staked for veDOUGH',
              type: 'success',
            });

            subscription.unsubscribe();

            isStaking = false;
            fetchRewardEscrowData();
            stakedModal.showModal(toNum(veDoughInEscrow), '36');
          },
        });
      });
    } catch (error) {
      console.error(error);
      isStaking = false;

      displayNotification({
        autoDismiss: 15000,
        message: error.message,
        type: 'error',
      });
    }
  }
</script>

<StakedModal bind:this={stakedModal} />

<div class="relative content flex flex-col px-4">
  <div class="w-full py-20">
    <h1
      class="text-xl font-bold inline bg-gradient-to-r from-[#ed1ea0] via-[#6c5dfe] to-[#ed1ea0] bg-clip-text tracking-tight text-transparent leading-12"
    >
      eDOUGH for veDOUGH
    </h1>
    <div class="mt-6 space-y-6 font-display text-sm tracking-tight">
      <p>
        As per the PieDAO to Auxo migration, veDOUGH tokens will be exchanged for veAUXO
        automatically by the time of the migration. If you hold eDOUGH that has been vesting for
        more than 6 months you are eligible to bridge them to veDOUGH under a fixed timelock of 36
        months — enabling you to <a
          class="text-pink"
          target="_blank"
          rel="noopener noreferrer"
          href="#/dough-staking-campaign">earn Governance Rewards</a
        >
        by helping govern the DAO. For more information,
        <a
          class="text-pink"
          target="_blank"
          rel="noopener noreferrer"
          href="https://forum.piedao.org/t/the-rise-of-auxo/1419">click here</a
        >. Below you will be able to check the pool and your position status and execute the swap if
        wanted.
      </p>
    </div>
    <div
      class="cardboardergradient bg-transparent flex flex-col items-center w-94pc md:w-50pc h-50pc mx-auto mt-20"
    >
      <div class="w-full py-8 px-12 sm:px-20 flex flex-col items-center">
        <h2 class="text-xl font-bold text-center mb-4">Bridge your eDOUGH</h2>

        <div class="flex flex-col nowrap w-100pc swap-from p-16px">
          <div class="flex items-center justify-between">
            <div class="flex nowrap intems-center p-1 font-thin">Total Eligible eDOUGH</div>
          </div>
          <div class="flex nowrap items-center p-1">
            <input
              class:error={balanceError}
              class="swap-input-from"
              bind:value={amount.label}
              inputmode="decimal"
              title="Token Amount"
              autocomplete="off"
              autocorrect="off"
              type="number"
              pattern="^[0-9]*[.]?[0-9]*$"
              placeholder="0.0"
              minlength="1"
              maxlength="79"
              spellcheck="false"
              disabled
            />
            <button class="swap-button-migration">
              <div class="flex items-center">
                <img
                  class="h-auto w-24px mr-5px"
                  alt={sellToken ? `${sellToken.symbol} logo` : ''}
                  src={sellToken ? sellToken.icon : ''}
                />
                <span class="sc-kXeGPI jeVIZw token-symbol-container"
                  >{sellToken ? sellToken.symbol : ''}</span
                >
              </div>
            </button>
          </div>
        </div>

        <div class="my-20px flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#cccccc"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg
          >
        </div>

        <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px">
          <div class="flex items-center justify-between">
            <div class="flex nowrap intems-center p-1 font-thin">To</div>
          </div>
          <div class="flex nowrap items-center p-1">
            <input
              class="swap-input-from"
              bind:value={receivedAmount}
              disabled
              inputmode="decimal"
              title="Token Amount"
              autocomplete="off"
              autocorrect="off"
              type="number"
              pattern="^[0-9]*[.,]?[0-9]*$"
              placeholder="0.0"
              minlength="1"
              maxlength="79"
              spellcheck="false"
            />
            <button class="swap-button-migration">
              <div class="flex items-center">
                <img
                  class="h-auto w-24px mr-5px"
                  alt={buyToken ? `${buyToken.symbol} logo` : ''}
                  src={buyToken ? buyToken.icon : ''}
                />
                <span class="sc-kXeGPI jeVIZw token-symbol-container"
                  >{buyToken ? buyToken.symbol : ''}</span
                >
              </div>
            </button>
          </div>
        </div>

        {#if error}
          <button disabled={true} class="stake-button error rounded-20px mt-10px p-15px w-100pc">
            {error}
          </button>
        {:else}
          <button
            class:error={error || isLoading || balanceError ? true : false}
            on:click={stake}
            disabled={error || isLoading || veDoughInEscrow.eq(0) || !$eth.address}
            class="stake-button mt-10px rounded-20px p-15px w-100pc"
          >
            Bridge
          </button>
        {/if}
      </div>
    </div>
    {#if accountSchedule.length}
      <div
        class="bg-lightgreen rounded-xl text-black pt-8 pb-2 md:py-8 px-2 md:px-6 w-94pc md:w-70pc mx-auto mt-8"
      >
        <div class="font-huge text-center">Vesting Entries</div>
        <div class="flex flex-row text-little md:text-base">
          <div
            class="flex text-center items-center rounded md:rounded-xl bg-white p-2 md:p-4 mt-4 mx-auto w-full"
          >
            <div class="overflow-y-scroll max-h-100 w-full">
              <table class="w-full overflow-x-scroll md:min-w-400px">
                <thead>
                  <tr>
                    <th class="sticky_table_header gray_border p-2 border-r-2 w-1/5 text-left"
                      >Amount</th
                    >
                    <th class="sticky_table_header gray_border p-2 border-r-2 w-2/5 text-left"
                      >Get DOUGH</th
                    >
                    <th class="sticky_table_header gray_border p-2 w-2/5 text-left"
                      >💰 Get veDOUGH</th
                    >
                  </tr>
                </thead>
                <tbody>
                  {#each accountSchedule as schedule}
                    <tr class="gray_border border-t-2 w-full">
                      <td class="gray_border p-2 border-r-2 min-w-1/5 w-1/5 text-left">
                        {formatFiat(toNum(schedule.amount), ',', '.', '')}
                      </td>

                      {#if moment().unix() >= moment(moment.unix(schedule.timestamp.toString())).unix()}
                        <td class="gray_border p-2 font-thin border-r-2 min-w-2/5 w-2/5 text-left">
                          <img
                            class="float-left mr-1 mt-1 hidden md:block"
                            width="20px"
                            height="20px"
                            src={images.doughtoken}
                            alt="token name"
                          />
                          <span class="w-90px">Ready</span>
                        </td>
                      {:else}
                        <td class="gray_border p-2 border-r-2 min-w-2/5 w-2/5 font-thin text-left">
                          <img
                            class="float-left mr-1 mt-1 hidden md:block"
                            width="20px"
                            height="20px"
                            src={images.calendar}
                            alt="token name"
                          />
                          <span class="w-90px"
                            >{moment(moment.unix(schedule.timestamp.toString())).format(
                              'DD/MM/YY',
                            )}</span
                          >
                        </td>
                      {/if}

                      {#if moment().unix() >= moment(moment.unix(schedule.timestamp.toString()))
                          .subtract(26, 'week')
                          .unix()}
                        <td class="gray_border p-2 text-left">
                          <img
                            class="float-left mr-1 mt-1 hidden md:block"
                            width="20px"
                            height="20px"
                            src={images.gem_stone}
                            alt="token name"
                          />
                          <span class="w-90px">Stake & Earn</span>
                        </td>
                      {:else}
                        <td class="gray_border p-2 font-thin text-left">
                          <img
                            class="float-left mr-1 mt-1 hidden md:block"
                            width="20px"
                            height="20px"
                            src={images.calendar}
                            alt="token name"
                          />
                          <span class="w-90px"
                            >{moment(moment.unix(schedule.timestamp.toString()))
                              .subtract(26, 'week')
                              .format('DD/MM/YY')}</span
                          >
                        </td>
                      {/if}
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
