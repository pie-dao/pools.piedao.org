<script>
  import { _ } from "svelte-i18n";

  import images from "../config/images.json";
  import links from "../config/links.json";

  import Web3Button from "./Web3Button.svelte";
  import TVL from "./Tvl.svelte";

  let mobileMenuVisible = false;

  let dropdownOpen = false;
  let dropdownOpen2 = false;

  const toggleMobileMenu = () => {
    mobileMenuVisible = !mobileMenuVisible;
  };

  const toggleDropdow = () => {
    dropdownOpen2 = false;
    dropdownOpen = !dropdownOpen;
  };


  const toggleDropdow2 = () => {
    dropdownOpen = false;
    dropdownOpen2 = !dropdownOpen2;
  };

</script>
<div class="header-container">
  <div class="left">
    <a href="#/">
      <img src={images.logos.piedao} alt={$_('general.logo')} />
    </a>
  </div>
  <div class="right">

    <div class="hidden md:block">
      <TVL/>
    </div>
    

    <div class="relative inline-block text-left">

      <div>
        <span class="shadow-sm">
          <button on:click={toggleDropdow} type="button" class="inline-flex justify-center w-full px-4 py-2 bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800 transition ease-in-out duration-150" id="options-menu" aria-haspopup="true" aria-expanded="true">
            Products
            <!-- Heroicon name: chevron-down -->
            <svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </span>
      </div>
      {#if dropdownOpen}
        <div class="origin-top-right absolute right-0 mt-2 w-56 shadow-lg">
          <div class=" bg-white shadow-xs" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <div class="py-1">
              <a href="#/pies" on:click={toggleDropdow} class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">Indexes</a>
              <a href="#/stake" on:click={toggleDropdow} class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">Farms</a>
            </div>
            <div class="border-t border-gray-100"></div>
            <div class="py-1">
              <a href="#/dough" on:click={toggleDropdow} class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">
                $DOUGH
              </a>
            </div>
          </div>
        </div>
        {/if}
      </div>

    <div class="relative inline-block text-left">
    <div>
        <span class="shadow-sm">
          <button on:click={toggleDropdow2} type="button" class="inline-flex justify-center w-full px-4 py-2 bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800 transition ease-in-out duration-150" id="options-menu" aria-haspopup="true" aria-expanded="true">
            Governance
            <svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </span>
      </div>
      {#if dropdownOpen2}
        <div class="origin-top-right absolute right-0 mt-2 w-56 shadow-lg">
          <div class=" bg-white shadow-xs" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <div class="py-1">
              <a href="http://forum.piedao.org/" target="_blank" on:click={toggleDropdow2} class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">Forum</a>
              <a href="{$_('piedao.aragonLink')}" target="_blank" on:click={toggleDropdow2} class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">Aragon DAO</a>
              <a href="https://snapshot.page/#/piedao" target="_blank" on:click={toggleDropdow2} class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">Snapshot</a>
            </div>
          </div>
        </div>
      {/if}
    </div>

  
  

    
    
    <a class="text-sm leading-5 font-medium text-gray-700" href={links.docs} target="_blank" rel="noopener noreferrer">
      {$_('general.docs')}
    </a>
    
    <div class="hidden md:block">
      <Web3Button />
    </div>

  </div>
</div>
