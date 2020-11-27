<script>
  import images from "../../config/images.json";
  import ProductBox from '../../components/elements/product-box.svelte';
  import poolsConfig from "../../config/pools.json";
  import { pools } from '../../stores/eth.js';
  import {
    getTokenImage,
    formatFiat,
  } from "../../components/helpers.js";

  import Modal from '../../components/elements/Modal.svelte';
  import LiquidityModal from '../../components/LiquidityModal.svelte';
  
  import OvenModal from "../../components/OvenModal.svelte";

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
    }
  ]

  let modal;
  let modalAdd;
  let modalOption = {
    title: "Bake"
  }

</script>

  <Modal title={modalOption.title} backgroundColor="#f3f3f3" bind:this="{modal}">
    <span slot="content">
      <OvenModal pieAddress={'0x8d1ce361eb68e9e05573443c407d4a3bed23b033'} ovenAddress={'0x1d616dad84dd0b3ce83e5fe518e90617c7ae3915'}/>
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
      <h2 class="text-xl mt-2 mb-6 leading-tight font-heading">Bake a Pie together</h2>
      <p class="mb-4 text-gray-500 font-thin text-md leading-relaxed">Oven makes possible to collect ETH together and mint the PIE all in once. In this way mint happens only once the ETH limit is reached and all participants share the gas cost, making it significantly more convenient than minting a Pie on your own. Beware: The Oven must be full befor start baking!</p>
    </div>
  </section>

  <div class="content flex flex-col w-100pc justify-between spl text-center md:w-80pc">
    <div class="flex flex-col justify-around w-100pc content-center lg:flex-row">
      <ProductBox 
        image={images.depositeth}
        title="Deposit ETH"
        description="Deposit the amount of ETH you want to use to issue the PIE you want"
      />
      
      <ProductBox 
        image={images.waitoven}
        title="Wait the Oven limit"
        description="Oven must be full as baking starts when a specific limit is reached."
      />

      <ProductBox 
      image={images.sharegascost}
      title="Gas cost is on us"
      description="Once the limit is reached we will bake the PIE all together."
    />
    </div>
</div>

<section class="pt-12 px-4 text-center">
  <div class="w-full max-w-2xl mx-auto">
    <h2 class="text-xl mt-2 mb-6 leading-tight font-heading">Select a Pie to bake</h2>
  </div>
</section>

<div class="flex flex-col w-96pc place-content-center spl">
  <table class="breakdown-table table-auto w-full mx-6">
    <thead>
      <tr>
        <th class="font-thin border-b-2 px-4 py-2 text-left">Pie Name</th>
        <th class="font-thin border-b-2 px-4 py-2">Bake Session Limit</th>
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
              10 ETH
            </a>
          </td>
          <td class="pointer border px-4 ml-8 py-2 font-thin text-center" on:click={() => window.location.hash = `#/pie/${oven.baking.address}`}>
            Deposits Open
          </td>
          <td class="pointer border px-4 ml-8 py-2 font-thin text-center" on:click={() => window.location.hash = `#/pie/${oven.baking.address}`}>
            96%
          </td>
          <td class="border px-4 ml-8 py-2 font-thin text-center">
              <button on:click={modal.open} class="table-btn highlight-box min-w-70px">
                Bake
              </button>
          </td>
          
        </tr>
      {/each}
    </tbody>
  </table>
</div>




<section class="pt-12 px-4 text-center">
  <div class="w-full max-w-2xl mx-auto">
    <h2 class="text-xl mt-2 mb-6 leading-tight font-heading">Want your PIE faster?</h2>
    <p class="mb-4 text-gray-500 font-thin text-md leading-relaxed">You are always free to mint a Pie on your own by issuing liquidity. Go check the Index page and select the right Pie for you.</p>
  </div>
  <button on:click={modalAdd.open} class="btn m-0 mt-4 rounded-8px p-15px min-w-200px w-96pc lg:w-200px lg:min-w-200px">
    Issue liquidity
  </button>
</section>



