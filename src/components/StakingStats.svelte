<script>
  import { _ } from 'svelte-i18n';
  import { formatFiat } from '../components/helpers.js';
  import { toNum } from '../helpers/staking.js';
  import images from '../config/images.json';

  export let stakingStats;
</script>

<div
  class="w-full flex flex-col lg:flex-row items-center px-4 md:max-w-700px lg:px-4 lg:max-w-1280px p-6"
>
  <div class="w-full flex flex-col w-full p-1px rounded-16" style="background-color: #e1f4f2;">
    <div class="flex nowrap items-center p-1">
      <span class="sc-iybRtq gjVeBU m-4">
        <img class="h-auto w-24px" src={images.cut_of_meat} alt="dough token" />
        <div class="flex nowrap intems-center p-1 font-24px">Key Staking Stats</div>
      </span>
    </div>
    <!-- TOTAL STAKED DOUGH -->
    <div class="flex flex-col nowrap w-92pc m-4 swap-from rounded-20px bg-white p-16px">
      <div class="flex nowrap items-center p-1">
        <span class="sc-iybRtq gjVeBU">
          <img class="h-auto w-24px" src={images.doughtoken} alt="dough token" />
          <div class="flex nowrap intems-center p-1 font-thin">Total staked DOUGH</div>
          <div class="font-24px">
            {formatFiat(toNum(stakingStats.totalStakedDough), ',', '.', '')} DOUGH
          </div>
        </span>
      </div>
    </div>
    <!-- Average Time Lock -->
    <div class="flex flex-col nowrap w-92pc m-4 swap-from rounded-20px bg-white p-16px">
      <div class="flex nowrap items-center p-1">
        <span class="sc-iybRtq gjVeBU">
          <img class="h-auto w-24px" src={images.locked_with_key} alt="dough token" />
          <div class="flex nowrap intems-center p-1 font-thin">Average Time Lock</div>
          <div class="font-24px">{stakingStats.averageLockDUration} Months</div>
        </span>
      </div>
    </div>
    <!-- TOTAL veDOUGH -->
    <div class="flex flex-col nowrap w-92pc m-4 swap-from rounded-20px bg-white p-16px">
      <div class="flex nowrap items-center p-1">
        <span class="sc-iybRtq gjVeBU">
          <img class="h-auto w-24px" src={images.veDough} alt="dough token" />
          <div class="flex nowrap intems-center p-1 font-thin">Total veDOUGH</div>
          <div class="font-24px">
            {formatFiat(toNum(stakingStats.totalVeDough), ',', '.', '')} veDOUGH
          </div>
        </span>
      </div>
    </div>
    <!-- Voting Addresses -->
    <div class="flex flex-col nowrap w-92pc m-4 swap-from rounded-20px bg-white p-16px">
      <div class="flex nowrap items-center p-1">
        <span class="sc-iybRtq gjVeBU">
          <img class="h-auto w-24px" src={images.person_raising_hand} alt="dough token" />
          <div class="flex nowrap intems-center p-1 font-thin">Voting Addresses</div>
          <div class="font-24px">{stakingStats.totalHolders}</div>
        </span>
      </div>
    </div>
  </div>
</div>
