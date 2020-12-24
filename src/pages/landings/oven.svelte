<script>
  import { onMount } from 'svelte';
  import { ethers } from 'ethers';
  import images from "../../config/images.json";
  import ProductBox from '../../components/elements/product-box.svelte';
  import { balances, balanceKey } from '../../stores/eth.js';
  
  import {
    getTokenImage,
    subscribeToBalance,
    toFixed
  } from "../../components/helpers.js";

  import Modal from '../../components/elements/Modal.svelte';
  import LiquidityModal from '../../components/modals/LiquidityModal.svelte';
  import OvenModal from "../../components/modals/OvenModal.svelte";

  $: ovens = [
    {
      addressOven: '0x1d616dad84dd0b3ce83e5fe518e90617c7ae3915',
      deprecated: false,
      name: 'DEFI++ Oven',
      description: 'Bakes DEFI++ at Zero cost',
      data: {
        ethBalance: 0,
        pieBalance: 0
      },
      baking: {
          symbol: "DEFI++",
          address: "0x8d1ce361eb68e9e05573443c407d4a3bed23b033",
          balance: '0',
          icon: getTokenImage('0x8d1ce361eb68e9e05573443c407d4a3bed23b033')
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
        pieBalance: 0
      },
      baking: {
          symbol: "BCP",
          address: "0xe4f726adc8e89c6a6017f01eada77865db22da14",
          balance: '0',
          icon: getTokenImage('0xe4f726adc8e89c6a6017f01eada77865db22da14')
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
        pieBalance: 0
      },
      baking: {
          symbol: "YPIE",
          address: "0x17525e4f4af59fbc29551bc4ece6ab60ed49ce31",
          balance: '0',
          icon: getTokenImage('0x17525e4f4af59fbc29551bc4ece6ab60ed49ce31')
      },
      highlight: true,
      enabled: true,
    },

    {
      addressOven: '0x925f860d1596cc6383c16294d8290f82bde172f7',
      deprecated: true,
      name: 'YPIE Oven',
      description: 'Bakes YPIE at Zero cost',
      data: {
        ethBalance: 0,
        pieBalance: 0
      },
      baking: {
          symbol: "YPIE",
          address: "0x17525e4f4af59fbc29551bc4ece6ab60ed49ce31",
          balance: '0',
          icon: getTokenImage('0x17525e4f4af59fbc29551bc4ece6ab60ed49ce31')
      },
      highlight: true,
      enabled: true,
    }
  ]

  let modal;
  let modalAdd;
  let modalOption = {
    title: "Bake",
    pieAddress: null,
    ovenAddress: null
  };

  onMount(() => {
    ovens.forEach(ov => {
      subscribeToBalance(null, ov.addressOven);
      ov.KeyEthBalance = balanceKey(ethers.constants.AddressZero, ov.addressOven);
    });
  });



</script>
  <Modal title={modalOption.title} backgroundColor="#f3f3f3" bind:this="{modal}">
    <span slot="content">
      <OvenModal deprecated={modal.deprecated} pieAddress={modal.pieAddress} ovenAddress={modal.ovenAddress} />
    </span>
  </Modal>

  <Modal title="Add Liquidity" backgroundColor="#f3f3f3" bind:this="{modalAdd}">
    <span slot="content">
      <LiquidityModal 
        token="0x8d1ce361eb68e9e05573443c407d4a3bed23b033" 
        method="single"
        poolAction="add"
      />
    </span>
  </Modal>
  <section class="pt-12 px-4 text-center">
    <div class="w-full max-w-2xl mx-auto">
      <h2 class="text-xl mt-2 mb-6 leading-tight font-heading">Baking Together</h2>
      <p class="mb-4 text-gray-500 font-thin text-md leading-relaxed">The PieDAO Oven pools ETH to issue pies in batches, giving users access to our index products gas-free. This design makes getting involved affordable and convenient, opening participation to everyone. Don't forget, the Oven won't activate until it's full!</p>
    </div>
  </section>

  <div class="content flex flex-col w-100pc justify-between spl text-center md:w-80pc">
    <div class="flex flex-col justify-around w-100pc content-center lg:flex-row">
      <ProductBox 
        image={images.depositeth}
        title="Deposit ETH"
        description="Add the ETH you wish to use to issue your chosen pie."
      />
      
      <ProductBox 
        image={images.waitoven}
        title="Wait For It To Fill"
        description="Oven won't activate and issue everyone's pie until the threshold is reached."
      />

      <ProductBox 
      image={images.sharegascost}
      title="Enjoy Your Pie"
      description="Once activated Oven will bake your pie, entirely gas-free."
    />
    </div>
</div>

<section class="pt-12 px-4 text-center">
  <div class="w-full max-w-2xl mx-auto">
    <h2 class="text-xl mt-2 mb-6 leading-tight font-heading">Select Your Pie</h2>
  </div>
</section>

<div class="flex flex-col w-96pc place-content-center spl">
  <table class="breakdown-table table-auto w-full mx-6">
    <thead>
      <tr>
        <th class="font-thin border-b-2 px-4 py-2 text-left">Pie Name</th>
        <th class="font-thin border-b-2 px-4 py-2">Bake Session</th>
        <th class="font-thin border-b-2 px-4 py-2">Oven state</th>
        <th class="font-thin border-b-2 px-4 py-2">Gas Savings</th>
      </tr>
    </thead>
    <tbody>
      {#each ovens as oven}
        <tr class="row-highlight">
          <td class="pointer border border-gray-800 px-2 py-2 text-left min-w-140px" on:click={() => window.location.hash = `#/pie/${oven.baking.address}`}>
            <a class="flex items-center px-2 py-2" href={`#/pie/${oven.baking.address}`}>
              <img
                class="inline icon ml-2 mr-2"
                src={oven.baking.icon}
                alt={oven.baking.symbol} />
                <span class="md:block">{oven.baking.symbol}</span>
            </a>
          </td>
          <td class="pointer border px-4 ml-8 py-2 font-thin text-center" on:click={() => window.location.hash = `#/pie/${oven.baking.address}`}>
            <a href={`#/pie/${oven.baking.address}`}>
              { toFixed($balances[oven.KeyEthBalance], 2) } / 10 ETH
            </a>
          </td>
          <td class="pointer border px-4 ml-8 py-2 font-thin text-center" on:click={() => window.location.hash = `#/pie/${oven.baking.address}`}>
            {#if !oven.deprecated}
              Deposits Open
            {:else}
              Withdraw-only
            {/if}
          </td>
          <td class="pointer border px-4 ml-8 py-2 font-thin text-center" on:click={() => window.location.hash = `#/pie/${oven.baking.address}`}>
            97.5%
          </td>
          <td class="border px-4 ml-8 py-2 font-thin text-center">
              <button on:click={() => {
                modal.pieAddress = oven.baking.address;
                modal.ovenAddress = oven.addressOven;
                modal.deprecated = oven.deprecated;
                modal.open()
              }} class="table-btn highlight-box min-w-70px">
                {#if !oven.deprecated}
                  Bake
                {:else}
                  Withdraw
                {/if}
              </button>
          </td>
          
        </tr>
      {/each}
    </tbody>
  </table>
</div>




<section class="pt-12 px-4 text-center">
  <div class="w-full max-w-2xl mx-auto">
    <h2 class="text-xl mt-2 mb-6 leading-tight font-heading">In a Rush?</h2>
    <p class="mb-4 text-gray-500 font-thin text-md leading-relaxed">You can always issue your own pie instantly from our Index page.</p>
  </div>
  <button on:click={modalAdd.open} class="btn m-0 mt-4 rounded-8px p-15px min-w-200px w-96pc lg:w-200px lg:min-w-200px">
    Issue liquidity
  </button>
</section>



