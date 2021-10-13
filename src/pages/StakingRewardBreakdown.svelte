<script>
  import { currentRoute } from "../stores/routes.js";
  import StakingRewardActivity from '../components/staking/rewards/Activity.svelte';
  import StakingRewardGovernance from '../components/staking/rewards/Governance.svelte';
  import StakingRewardRevenues from '../components/staking/rewards/Revenues.svelte';
</script>

<div class="flex w-100pc py-20px flex flex-col items-center">
  <div
    class="w-full flex flex-col items-center px-4 md:max-w-700px lg:px-4 lg:max-w-1280px"
  >
  <StakingRewardActivity block={$currentRoute.params.block} /> 
  <StakingRewardGovernance block={$currentRoute.params.block} /> 
  <StakingRewardRevenues block={$currentRoute.params.block} /> 
  </div>
</div>
