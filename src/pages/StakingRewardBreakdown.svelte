<script>
  import { currentRoute } from "../stores/routes.js";
  import StakingRewardActivity from '../components/staking/rewards/Activity.svelte';
  import StakingRewardGovernance from '../components/staking/rewards/Governance.svelte';
  import StakingRewardRevenues from '../components/staking/rewards/Revenues.svelte';
  import epochsJSON from '../config/epochs.json';
  import moment from 'moment';

  // TODO: this should be changed, fetch the epochs from backend
  let epoch = epochsJSON.epochs.find(epoch => epoch.startDate <= $currentRoute.params.timestamp && epoch.endDate >= $currentRoute.params.timestamp);
  let date = moment(new Date(epoch.startDate));
</script>

<div class="flex w-100pc py-20px flex flex-col items-center">
  <div
    class="w-full flex flex-col items-center px-4 md:max-w-700px lg:px-4 lg:max-w-1280px"
  >

  <div class="flex flex-col items-center w-full md:w-1/2 p-1px bg-lightgrey rounded-16 m-10px">
    <div class="flex flex-col nowrap w-96pc m-2pc swap-from rounded-20px bg-white p-16px">
      <div class="font-huge text-center pb-4">{date.format('MMMM YYYY')}</div>
      <div class="text-center p-1 font-thin">
        Epoch Blocks Start: {epoch.startBlock} - Epoch Blocks End: {epoch.endBlock}
      </div>
    </div>
  </div>

  <StakingRewardActivity timestamp={$currentRoute.params.timestamp} /> 
  <StakingRewardGovernance timestamp={$currentRoute.params.timestamp} /> 
  <StakingRewardRevenues timestamp={$currentRoute.params.timestamp} /> 
  </div>
</div>
