<script>
  import { onMount } from 'svelte';
  import { ethers } from 'ethers';
  import images from "../../config/images.json";
  import ProductBox from '../../components/elements/product-box.svelte';

  import Meta from '../../components/elements/meta.svelte';
  import { balances, balanceKey } from '../../stores/eth.js';
  
  import {
    getTokenImage,
    subscribeToBalance,
    toFixed
  } from "../../components/helpers.js";

  import Modal from '../../components/elements/Modal.svelte';
  import LiquidityModal from '../../components/modals/LiquidityModal.svelte';
  import OvenModal from "../../components/modals/OvenModal.svelte";
import TooltipButton from '../../components/elements/TooltipButton.svelte';

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

  <Meta 
    metadata={{
      title: "Oven Page - PieDAO",
      description: "The PieDAO Oven pools ETH to issue pies in batches, giving users access to our index products gas-free. This design makes getting involved affordable and convenient, opening participation to everyone. Don't forget, the Oven won't activate until it's full!",
      image: images.oven_social,
      imageAlt: 'How the Oven makes minting pies gas-free.'
    }}
  />

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
  <section class="pt-4 px-4 text-center md:pt-8 lg:pt-12">
    <div class="w-full max-w-2xl mx-auto">
      <h2 class="text-xl mt-2 mb-6 leading-tight font-heading">Bake Together, save 97% Gas.</h2>
      <p class="mb-4 text-gray-500 font-thin text-md leading-relaxed">Get hold of your pie almost gas-free by sharing the cost.<br/>Turn your ETH into delicious pie in three easy steps.</p>
    </div>
  </section>

  <div class="content flex flex-col justify-between spl text-center">
    <div class="flex flex-col justify-between content-center lg:flex-row">
      <ProductBox 
        image={images.depositeth}
        title="Deposit ETH"
        description="When at least 10 ETH is deposited the Oven can begin"
      />
      
      <ProductBox 
        image={images.waitoven}
        title="Wait"
        description="Oven will bake when gas prices are affordable, saving everyone money"
      />

      <ProductBox 
      image={images.sharegascost}
      title="Withdraw Your Pie"
      description="Once the Pie is baked you can withdraw it to your wallet"
    />
    </div>
</div>

<section class="pt-12 px-4 text-center">
  <div class="w-full max-w-2xl mx-auto">
    <h2 class="text-xl mt-2 mb-6 leading-tight font-heading">Select Your Pie</h2>
  </div>
</section>

<!-- <div class="flex flex-col w-96pc place-content-center spl">
  <table class="breakdown-table table-auto w-full ml-2 md:mx-6 lg:mx-6">
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
                  Bake / Withdraw
                {:else}
                  Withdraw
                {/if}
              </button>
          </td>
          
        </tr>
      {/each}
    </tbody>
  </table>
</div> -->


<div class="content flex flex-col content-center flex-wrap lg:flex-row">
{#each ovens as oven}
<div class="w-full md:w-1/3 max13 my-10px lg:m-10px p-20px rounded-sm bg-white border-thin">
    <div class="flex justify-start mb-4 items-center">
        <a href={`#/pie/${oven.baking.address}`}>
            <img class="w-50px h-auto md:w-50px h-auto" src={oven.baking.icon} alt={oven.baking.symbol} />
            <span class="font-bold text-xl text-right ml-2">{oven.baking.symbol}</span>
        <div/>
    </div>
    <div class="flex justify-between my-2">
      <div class="flex items-center "><span class="font-thin text-left mr-2">Minimum reached</span><TooltipButton tooltip="Oven needs 10 ETH and low Gas Price to be activated"><div class="infolink"></div></TooltipButton></div>
      <div class="font-bold text-right rounded-sm bg-black w-40pc">
        <div class="px-2 py-1 rounded-sm text-xs bg-gradient-purple text-left text-white fit-content">65%</div>
      </div>
    </div>
    <div class="flex justify-between my-2">
      <span class="font-thin text-left">Your ETH in the Oven</span>
      <span class="font-bold text-right">0.75 ETH</span>
    </div>
    <div class="flex justify-between my-2">
      <span class="font-thin text-left">Pie ready</span>
      <span class="font-bold text-right">134.50 DEFI++</span>
    </div>
    <button on:click={() => {
        modal.pieAddress = oven.baking.address;
        modal.ovenAddress = oven.addressOven;
        modal.deprecated = oven.deprecated;
        modal.open()
      }}  class="main-cta-ghost m-0 mt-4 rounded-8px p-15px w-full">
      Select your Pie
    </button>
  </div>
{/each}
</div>



<section class="pt-12 px-4 text-center">
  <div class="w-full max-w-2xl mx-auto">
    <h2 class="text-xl mt-2 mb-6 leading-tight font-heading">Can't wait?</h2>
    <p class="mb-4 text-gray-500 font-thin text-md leading-relaxed">You can always <strong>Buy or Issue</strong> your Pie instantly from the the Pie Page</p>
  </div>
  <button on:click={modalAdd.open} class="btn m-0 mt-4 rounded-8px p-15px min-w-200px w-96pc lg:w-200px lg:min-w-200px">
    Select your Pie
  </button>
</section>



