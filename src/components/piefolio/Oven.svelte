<script>
  import { onMount } from 'svelte';
  import { ethers } from 'ethers';
  import filter from 'lodash/filter';
  import images from '../../config/images.json';
  import ovensConf from '../../config/ovensConf.js';
  import { balances, balanceKey, eth } from '../../stores/eth.js';
  import { getTokenImage, subscribeToBalance, toFixed } from '../../components/helpers.js';
  import { fetchOvensUserData } from '../../helpers/multicall';
  import Modal from '../../components/elements/Modal.svelte';
  import OvenModal from '../../components/modals/OvenModal.svelte';

  $: ovens = ovensConf;

  let modal;
  let modalAdd;
  let initialized = false;
  let modalOption = {
    title: "Bake",
    pieAddress: null,
    ovenAddress: null,
  };

  $: ovenData = null;

  $: (async () => {
    if($eth.address && !initialized) {
      ovenData = await fetchOvensUserData(ovens, $eth.address, $eth.provider);
      initialized = true;
    }
  })()

  onMount(() => {
    ovens.forEach((ov) => {
      subscribeToBalance(null, ov.addressOven);
      ov.KeyEthBalance = balanceKey(ethers.constants.AddressZero, ov.addressOven);
    });
  });

  function getPercetageCompletion(balance) {
    let percetage = ( parseFloat(balance) / 10) * 100;
    return toFixed(percetage > 100 ? 100 : percetage, 2); 
  }
  
</script>

<Modal title={modalOption.title} backgroundColor="#f3f3f3" bind:this={modal}>
  <span slot="content">
    <OvenModal
      deprecated={modal.deprecated}
      pieAddress={modal.pieAddress}
      ovenAddress={modal.ovenAddress} />
  </span>
</Modal>

<span class="-mt-20px">

    {#if !ovenData}
      Ovens Loading...
    {:else if !ovenData.userHasPosition}
    <a class="" href="#/oven">
      <div class="rounded-xl">
        <img width="100%" height="auto" class="rounded-xl" src="https://raw.githubusercontent.com/pie-dao/brand/master/misc/oven-little-banner.png" alt="external link icon" />
      </div>
    </a>
    {:else}
    <div class="bg-lightyellow rounded-xl text-black py-8 px-6">
      <a class="" href="#/oven"><img width="20px" height="20px" class="ml-auto relative top-40px right-20px" src={images.extLink} alt="external link icon" /></a>
      <div class="font-huge text-center">Oven</div>
      {#each ovens as oven}
        {#if ovenData[oven.addressOven].ethBalance.number > 0 || ovenData[oven.addressOven].pieBalance.number > 0}
          <div class="w-100pc rounded-xl bg-white p-6 mt-6">
            <div class="flex justify-between my-2 h-28px">
              <span class="font-thin text-left">Oven name</span>
              <span class="font-bold text-right flex items-center"><img width="28px" height="28px" class="mr-2" src={oven.baking.icon} alt="token name" />{oven.baking.symbol}</span>
            </div>
            <div class="flex justify-between my-2 h-28px">
              <div class="flex items-center ">
                <span class="font-thin text-left mr-2">Minimum reached</span>
              </div>
              <div class="font-bold text-right rounded-sm bg-black w-40pc h-24px">
                <div class="px-2 h-24px flex items-center rounded-sm text-xs bg-gradient-purple text-left text-white fit-content" style={`width: ${getPercetageCompletion($balances[oven.KeyEthBalance])}% !important`}>                  
                  <span>{getPercetageCompletion($balances[oven.KeyEthBalance])}%</span>
                </div>
              </div>
            </div>
            <div class="flex justify-between my-2 h-28px">
              <span class="font-thin text-left">Your ETH in the Oven</span>
              <span class="font-bold text-right">{ovenData[oven.addressOven].ethBalance.label} ETH</span>
            </div>
            <div class="flex justify-between my-2 h-28px">
              <span class="font-thin text-left">Your Pie ready</span>
              <span class="font-bold text-right">{ovenData[oven.addressOven].pieBalance.label} {oven.baking.symbol}</span>
            </div>
            
            <div class="flex justify-between my-2">
            <button
              on:click={() => {
                modal.pieAddress = oven.baking.address;
                modal.ovenAddress = oven.addressOven;
                modal.deprecated = oven.deprecated;
                modal.open();
              }}
              class="small-cta m-0 mt-2 rounded-8px p-10px w-full">
              Deposit / Withdraw
            </button>
            </div>
          </div>
        {/if}
      {/each}
    </div>

    {/if}

</span>


