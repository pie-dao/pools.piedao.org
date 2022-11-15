<script>
  import images from '../../config/images.json';
  import { formatFiat } from '../../components/helpers.js';
  import { toNum } from '../../helpers/staking.js';
  import rewardEscrowABI from '../../config/rewardEscrowABI.json';
  import { eth } from '../../stores/eth.js';
  import { get } from 'svelte/store';
  import smartcontracts from '../../config/smartcontracts.json';
  import { ethers } from 'ethers';
  import moment from 'moment';
  import BigNumber from 'bignumber.js';

  let rewardEscrowContract;
  let doughInEscrow = BigNumber(0);
  let veDoughInEscrow = BigNumber(0);
  let availableForMigration = BigNumber(0);
  let edoughMigrationLabel = '0';
  let escrowEntries = 'n/a';
  let accountSchedule = [];

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
        rewardEscrowABI,
        signer || provider,
      );

      doughInEscrow = await rewardEscrowContract.totalEscrowedAccountBalance(address);
      accountSchedule = mapAccountSchedule(
        await rewardEscrowContract.checkAccountSchedule(address),
      );

      let vestingEntries = (await rewardEscrowContract.numVestingEntries(address)).toString();
      escrowEntries = {
        vesting: accountSchedule.length,
        claimed: vestingEntries - accountSchedule.length,
      };

      const now = moment().unix();
      veDoughInEscrow = BigNumber(0);

      accountSchedule.forEach((schedule) => {
        if (now >= moment(moment.unix(schedule.timestamp.toString())).subtract(26, 'week').unix()) {
          veDoughInEscrow = veDoughInEscrow.plus(schedule.amount.toString());
        }
        edoughMigrationLabel = Number(toNum(availableForMigration.toString(), 18)).toFixed(2);
      });
    } catch (error) {
      console.error(error);
    }
  }
</script>

<div class="mt-8">
  <div class="bg-lightgreen rounded-xl text-black ">
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:p-8 p-2">
      <div class="flex items-center rounded md:rounded-xl bg-white p-2 md:p-4">
        <div class="flex items-center mr-2 text-little md:text-xs">
          <img class="" width="40px" height="40px" src={images.eDough} alt="dough" />
        </div>
        <div class="flex flex-col justify-around w-full text-little md:text-base">
          <span class="font-thin opacity-80">Your eDOUGH Total</span>
          <span class="font-bold leading-6"
            >{formatFiat(toNum(doughInEscrow), '.', ',', '') || 0} eDOUGH</span
          >
        </div>
      </div>
      <div class="flex items-center rounded md:rounded-xl bg-white p-2 md:p-4">
        <div class="items-center mr-4 text-l md:text-sm hidden md:block">🧮</div>
        <div class="flex flex-col justify-around text-little md:text-base">
          <span class="font-thin opacity-80">Your Vesting Entries</span>
          <span class="font-bold leading-6">{escrowEntries.vesting || 0}</span>
        </div>
      </div>
    </div>
  </div>
</div>
