<script>
  import { onMount } from 'svelte';
  import { ethers } from 'ethers';
  import filter from 'lodash/filter';
  import images from '../../config/images.json';
  import { balances, balanceKey, eth } from '../../stores/eth.js';
  import { getTokenImage, subscribeToBalance, toFixed } from '../../components/helpers.js';
  import { fetchOvensUserData } from '../../helpers/multicall';
  import Modal from '../../components/elements/Modal.svelte';
  import OvenModal from '../../components/modals/OvenModal.svelte';

  $: ovens = [
    {
      addressOven: '0x1d616dad84dd0b3ce83e5fe518e90617c7ae3915',
      deprecated: false,
      name: 'DEFI++ Oven',
      description: 'Bakes DEFI++ at Zero cost',
      data: {
        ethBalance: 0,
        pieBalance: 0,
      },
      baking: {
        symbol: 'DEFI++',
        address: '0x8d1ce361eb68e9e05573443c407d4a3bed23b033',
        balance: '0',
        icon: getTokenImage('0x8d1ce361eb68e9e05573443c407d4a3bed23b033'),
      },
      highlight: true,
      enabled: true,
    },
    {
      addressOven: '0xE3d74Df89163A8fA1cBa540FF6B339d13D322F61',
      deprecated: false,
      name: 'BCP Oven',
      description: 'Bakes BCP at Zero cost',
      data: {
        ethBalance: 0,
        pieBalance: 0,
      },
      baking: {
        symbol: 'BCP',
        address: '0xe4f726adc8e89c6a6017f01eada77865db22da14',
        balance: '0',
        icon: getTokenImage('0xe4f726adc8e89c6a6017f01eada77865db22da14'),
      },
      highlight: true,
      enabled: true,
    },
    {
      addressOven: '0xAedec86DeDe3DEd9562FB00AdA623c0e9bEEb951',
      deprecated: false,
      name: 'YPIE Oven',
      description: 'Bakes YPIE at Zero cost',
      data: {
        ethBalance: 0,
        pieBalance: 0,
      },
      baking: {
        symbol: 'YPIE',
        address: '0x17525e4f4af59fbc29551bc4ece6ab60ed49ce31',
        balance: '0',
        icon: getTokenImage('0x17525e4f4af59fbc29551bc4ece6ab60ed49ce31'),
      },
      highlight: true,
      enabled: true,
    },
    // {
    //   addressOven: '0x925f860d1596cc6383c16294d8290f82bde172f7',
    //   deprecated: true,
    //   name: 'YPIE Oven',
    //   description: 'Bakes YPIE at Zero cost',
    //   data: {
    //     ethBalance: 0,
    //     pieBalance: 0,
    //   },
    //   baking: {
    //     symbol: 'YPIE',
    //     address: '0x17525e4f4af59fbc29551bc4ece6ab60ed49ce31',
    //     balance: '0',
    //     icon: getTokenImage('0x17525e4f4af59fbc29551bc4ece6ab60ed49ce31'),
    //   },
    //   highlight: true,
    //   enabled: true,
    // },
  ];

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
    <a class="" href="#/dough">
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
              <span class="font-bold text-right flex items-center"><img width="28px" height="28px" class="mr-2" src={images.bcp} alt="token name" />{oven.baking.symbol}</span>
            </div>
            <div class="flex justify-between my-2 h-28px">
              <div class="flex items-center ">
                <span class="font-thin text-left mr-2">Minimum reached</span>
              </div>
              <div class="font-bold text-right rounded-sm bg-black w-40pc h-24px">
                <div class="px-2 h-24px flex items-center rounded-sm text-xs bg-gradient-purple text-left text-white fit-content">
                  <span>{getPercetageCompletion($balances[oven.KeyEthBalance])}</span>
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


