<script>
  import moment from 'moment';
  import { onMount } from 'svelte';
  import filter from "lodash/filter";
  import images from "../../config/images.json";

  $: isLoading = false;
  $: initialized = false;
  $: proposals = [];

  const fetchProposals = async () => {
    const response = await fetch(`https://hub.snapshot.page/api/piedao/proposals`);
    const result = await response.json();

    var now = moment();
    let activeProposals = filter(Object.entries(result), ([key, component]) => {
      if( now.isBetween(moment.unix(component.msg.payload.start), moment.unix(component.msg.payload.end) ) ) {
        return true;
      }
      return false;
    });
    
    if(activeProposals.length > 0) {
      return activeProposals.map( o => o[1]);
    }
    return [];
  }

  onMount(async () => {
    if(initialized) return;
    proposals = await fetchProposals();
    console.log('proposals', proposals);
    initialized = true;
  });
</script>

<span class="-mt-20px">
  {#if !initialized}
  Loading...
{:else if initialized && proposals.length === 0}
<a class="" href="#/dough">
  <div class="rounded-xl">
    <img width="100%" height="auto" class="rounded-xl" src="https://raw.githubusercontent.com/pie-dao/brand/master/misc/oven-little-banner.png" alt="external link icon" />
  </div>
</a>
{:else}
  <a class="" href="https://snapshot.page/#/piedao" target="_blank"><img width="20px" height="20px" class="ml-auto relative top-40px right-20px" src={images.extLink} alt="external link icon" /></a>

  
  <div class="bg-lightpink rounded-xl text-black py-8 px-6">

      <div class="font-huge text-center">Governance</div>
      
      {#each proposals as p}
        <a href={`https://snapshot.page/#/piedao/proposal/${p.authorIpfsHash}`} target="_blank">
          <div class="w-100pc rounded-xl bg-white p-6 mt-6">
            <div class="font-bold leading-5 block break-all">{p.msg.payload.name}</div>
            <span class="flex items-center mt-1">
              <span class="bg-darkpurple text-white px-5px py-1px roundedxs text-xs mr-2">Snapshot</span>
              <span class="text-base leading-6 font-thin opacity-60">Ends on: {moment(moment.unix(p.msg.payload.end)).format('MMM Do YYYY')}</span>
            </span>
          </div>
        </a>
      {/each}
    </div>
    {/if}
    
</span>


