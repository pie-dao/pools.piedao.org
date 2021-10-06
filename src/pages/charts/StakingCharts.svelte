<script>
  import { fetchAllStakingStats } from '../../helpers/staking.js';
  import { onMount } from 'svelte';

  import Tab1 from "./tabs/Tab1.svelte";
	import Tab2 from "./tabs/Tab2.svelte";
	import Tab3 from "./tabs/Tab3.svelte";
  import Tab4 from "./tabs/Tab4.svelte";
  import Tabs from "./tabs/Tabs.svelte";

  // global stats variable...
  let stats = [];

  // creating tabs...
  let tabs = [
    { 
      label: "Average Lock Time",
      value: 1,
      component: Tab4
    },   
    { 
      label: "Locks Counters",
      value: 2,
      component: Tab1
    },
    { 
      label: "Locks Values",
      value: 3,
      component: Tab2
    },
    {
      label: "Tokens Totals",
      value: 4,
      component: Tab3
    },      
  ]; 

  onMount(async () => {
    try {
      stats = await fetchAllStakingStats();
      stats = stats.reverse();
    } catch (error) {
      console.error(error);
    }
  });
</script>

<div class="flex flex-col items-center text-center mt-4 md:mt-10">
  <div class="w-92pc mx-4 md:w-full md:mx-0">
    {#key stats}
      <Tabs tabs={tabs} stats={stats}/>
    {/key}
  </div>
</div>
