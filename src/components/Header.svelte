<script>
  import { _ } from "svelte-i18n";
  import { eth } from '../stores/eth.js';

  import images from "../config/images.json";
  import links from "../config/links.json";

  import {clickOutside} from '../helpers/clickOutside.js';

  import Web3Button from "./Web3Button.svelte";
  import TVL from "./Tvl.svelte";

  let mobileMenuVisible = false;
  let dropdownOpen = false;
  let dropdownOpen2 = false;

  const disconnect = () => {
    $eth.address = null;
    window.localStorage.removeItem('address');
  }

  const toggleMobileMenu = (event) => {
    mobileMenuVisible = !mobileMenuVisible;
  };

  const toggleDropdow = (event) => {
    dropdownOpen2 = false;
    dropdownOpen = !dropdownOpen;
    event.preventDefault();
  };

  const toggleDropdow2 = () => {
    dropdownOpen = false;
    dropdownOpen2 = !dropdownOpen2;
    event.preventDefault();
  };

  const closeMobileDropdown = () => {
    mobileMenuVisible = false;
  };

  const closeDropdowns = () => {
    dropdownOpen = false;
  };

  const closeDropdown1 = () => {
    dropdownOpen = false;
  };

  const closeDropdown2 = () => {
    dropdownOpen2 = false;
  };

  const closeDropdownMobile = () => {
    dropdownOpen2 = false;
  };

</script>
<div class="header-container">
  <div class="left">
    <a href="#/">
      <img src={images.logos.piedao} alt={$_('general.logo')} />
    </a>
  </div>
  <div class="left ml-5px text-grey-200 text-sm opacity-20 cursor-pie">
    (beta)
  </div>
  <div class="right">

    <div class="hidden md:block">
      <TVL/>
      <a href="https://medium.com/piedao/piedao-is-expanding-the-core-team-and-open-sourcing-the-search-for-talent-b22fce733293" target="_blank" class="block md:px-4 py-2 text-sm leading-5 font-bold text-pink hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">
        🧙🦄🥷 We are hiring!
      </a>
    </div>

    <div class="relative inline-block text-left hidden md:block">
      <div use:clickOutside on:click_outside={closeDropdown1}>
        <span class="shadow-sm">
          <button on:click={toggleDropdow}  type="button" class="inline-flex justify-center w-full px-4 py-2 bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800 transition ease-in-out duration-150" id="options-menu" aria-haspopup="true" aria-expanded="true">
            Products
            <svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </span>
      </div>
      {#if dropdownOpen}
        <div class="z-50 origin-top-right absolute right-0 mt-1 thinborder w-56 drowpdown-shadow roundedl">
          <div class="bg-white roundedl" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <div class="py-1 roundedl">
              <a href="#/pies" on:click={toggleDropdow} class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">🥧 Indices <span class="font-thin">(PIEs)</span></a>
              <a href="#/swap" on:click={toggleDropdow} class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">🔀 Exchange</a>
              <a href="#/oven" on:click={toggleDropdow} class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">⏲️ Ovens <span class="font-thin">(Buy Gas Free)</span></a>
              <a href="#/farms" on:click={toggleDropdow} class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">🚜 Farms + DOUGHpamine</a>
            </div>
            <div class="borderDiveder"></div>
            <div class="py-1">
              <a href="#/dough" on:click={toggleDropdow} class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">
                🟣 Token
              </a>
            </div>
          </div>
        </div>
        {/if}
    </div>

    <div class="relative inline-block text-left hidden md:block">
    <div use:clickOutside on:click_outside={closeDropdown2}>
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
        <div class="z-50 origin-top-right absolute right-0 mt-1 thinborder w-56 drowpdown-shadow roundedl">
          <div class="bg-white roundedl" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <div class="py-1 roundedl">
              <a href="http://forum.piedao.org/" target="_blank" on:click={toggleDropdow2} class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">📢 Forum</a>
              <a href="https://client.aragon.org/?#/piedao" target="_blank" on:click={toggleDropdow2} class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">🦅 Aragon DAO</a>
              <a href="https://snapshot.page/#/piedao" target="_blank" on:click={toggleDropdow2} class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">⚡ Snapshot</a>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <div class="relative inline-block text-left block md:hidden focus:outline-none">
      <div>
        <span class="">
          <button class="hamburger" type="button" on:click={toggleMobileMenu}>
            <img src={images.icons.hamburger} alt="hamburger icon" class="w-min-20px" />
          </button>
        </span>
      </div>
      {#if mobileMenuVisible}
        <div class="z-50 origin-top-right absolute right-0 mt-1 thinborder w-56 drowpdown-shadow roundedl">
          <div class="bg-white roundedl" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <a href="https://medium.com/piedao/piedao-is-expanding-the-core-team-and-open-sourcing-the-search-for-talent-b22fce733293" target="_blank" class="block px-4 py-2 text-sm leading-5 text-pink font-bold hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">🧙🦄🥷 We are hiring!</a>
            <div class="thinborderbottom mb-2"></div>
            <div class="inline-flex roundedl w-full px-4 pt-2 bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800 transition ease-in-out duration-150 text-left font-bold">Products:</div>
            <div class="roundedl">
              <a href="#/pies" on:click={toggleMobileMenu} class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">🥧 Indices <span class="font-thin">(PIEs)</span></a>
              <a href="#/swap" on:click={toggleMobileMenu} class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">🔀 Exchange</a>
              <a href="#/oven" on:click={toggleMobileMenu} class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">⏲️ Ovens <span class="font-thin">(Buy Gas Free)</a>
              <a href="#/farms" on:click={toggleMobileMenu} class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">🚜 Farms + DOUGHpamine</a>
              <a href="#/dough" on:click={toggleMobileMenu} class="block px-4 py-2 mb-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">🟣 Token</a>
            </div>
            <div class="thinborderbottom"></div>
            <div class="inline-flex w-full px-4 pt-2 bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800 transition ease-in-out duration-150 text-left font-bold">Governance:</div>
            <div class="">
              <a href="http://forum.piedao.org/" target="_blank" on:click={toggleMobileMenu} class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">📢 Forum</a>
              <a href="https://client.aragon.org/?#/piedao" target="_blank" on:click={toggleMobileMenu} class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">🦅 Aragon DAO</a>
              <a href="https://snapshot.page/#/piedao" target="_blank" on:click={toggleMobileMenu} class="block px-4 py-2 mb-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">⚡ Snapshot</a>
            </div>
            <div class="thinborderbottom"></div>
            <div class="inline-flex w-full px-4 pt-2 bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800 transition ease-in-out duration-150 text-left font-bold">Misc:</div>
            <div class="">
              <a href='#/learn' on:click={toggleMobileMenu} class="block px-4 py-2 mb-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">📚 Learn</a>
            </div>            
            <div class="thinborderbottom"></div>
            <div class="flex justify-center py-2">
              <Web3Button />
            </div>
            <div class="flex justify-center py-2">
              <a on:click={disconnect} href="#" class="block px-4 py-2 mb-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">Logout</a>
            </div>            
          </div>
        </div>
        {/if}
    </div>

    
    <a class="pl-1 text-sm leading-5 font-medium text-gray-700 hidden md:block" href='#/dough' rel="noopener noreferrer">
      Token
    </a>
    
    <a class="pl-3 ml-4 text-sm leading-5 font-medium text-gray-700 hidden md:block" href='#/learn' rel="noopener noreferrer">
     Learn
    </a>

    {#if $eth.address}
      <a class="pl-3 ml-4 text-sm leading-5 font-medium text-gray-700 hidden md:block" href="#" on:click={disconnect} rel="noopener noreferrer">
        Logout
      </a>    
    {/if}
    
    <div class="hidden md:block">
        <Web3Button />
    </div>

  </div>
</div>
