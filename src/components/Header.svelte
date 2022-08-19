<script>
  import { _ } from 'svelte-i18n';
  import { eth } from '../stores/eth.js';

  import images from '../config/images.json';
  import links from '../config/links.json';

  import { clickOutside } from '../helpers/clickOutside.js';
  import { resetConnection } from '../stores/eth/connection';
  import { clearChachedProvider } from '../stores/eth.js';
  import Web3Button from './Web3Button.svelte';
  import TVL from './Tvl.svelte';

  let mobileMenuVisible = false;
  let dropdownOpen = false;
  let dropdownOpen2 = false;

  const disconnect = () => {
    window.localStorage.removeItem('address');
    window.localStorage.removeItem('walletconnect');

    $eth.address = null;
    clearChachedProvider();
    resetConnection();
  };

  const toggleMobileMenu = (event) => {
    event.stopPropagation();
    mobileMenuVisible = !mobileMenuVisible;
  };

  const outsideClicks = (event) => {
    if (mobileMenuVisible) {
      toggleMobileMenu(event);
    }
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

<svelte:window on:click={outsideClicks} />

<div class="header-container relative z-50">
  <div class="left piedaologoheader">
    <a href="#/">
      <img
        src={images.logos.piedao}
        alt={$_('general.logo')}
        height="36px"
        width="182px"
        class="piedaologoheader"
      />
    </a>
  </div>
  <div class="block left ml-5px text-grey-200 text-sm opacity-20 cursor-pie">(beta)</div>
  <div class="right">
    <div class="relative inline-block text-left hidden md:block">
      <div use:clickOutside on:click_outside={closeDropdown1}>
        <span class="shadow-sm">
          <button
            on:click={toggleDropdow}
            type="button"
            class="inline-flex justify-center w-full ml-2 py-2 bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800 transition ease-in-out duration-150"
            id="options-menu"
            aria-haspopup="true"
            aria-expanded="true"
          >
            Products
            <svg
              class="-mr-1 ml-3px h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </span>
      </div>
      {#if dropdownOpen}
        <div
          class="z-50 origin-top-right absolute right-0 mt-1 thinborder w-56 drowpdown-shadow roundedl"
        >
          <div
            class="bg-white roundedl"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <div class="py-1 roundedl">
              <a
                href="#/pies"
                on:click={toggleDropdow}
                class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
                role="menuitem">🥧 Indices <span class="font-thin">(PIEs)</span></a
              >
            </div>
          </div>
        </div>
      {/if}
    </div>

    <div class="relative text-left hidden md:block">
      <div use:clickOutside on:click_outside={closeDropdown2}>
        <span class="shadow-sm">
          <button
            on:click={toggleDropdow2}
            type="button"
            class="inline-flex justify-center w-full  ml-4 py-2 bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800 transition ease-in-out duration-150"
            id="options-menu"
            aria-haspopup="true"
            aria-expanded="true"
          >
            Governance
            <svg
              class="-mr-1 ml-3px h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </span>
      </div>
      {#if dropdownOpen2}
        <div
          class="z-50 origin-top-right absolute right-0 mt-1 thinborder w-56 drowpdown-shadow roundedl"
        >
          <div
            class="bg-white roundedl"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <div class="py-1 roundedl">
              <a
                href="#/staking-simulator"
                on:click={toggleDropdow2}
                class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
                role="menuitem">📟 Staking Simulator</a
              >
              <a
                href="http://forum.piedao.org/"
                target="_blank"
                on:click={toggleDropdow2}
                class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
                role="menuitem">📢 Forum</a
              >
              <a
                href="https://client.aragon.org/?#/piedao"
                target="_blank"
                on:click={toggleDropdow2}
                class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
                role="menuitem">🦅 Aragon DAO</a
              >
              <a
                href="https://snapshot.org/#/piedao.eth"
                target="_blank"
                on:click={toggleDropdow2}
                class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
                role="menuitem">⚡ Snapshot</a
              >
              <a
                href="https://piedao.notion.site/Partnerships-24891a4f2aec45f69aea950330b76b81"
                target="_blank"
                on:click={toggleDropdow2}
                class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
                role="menuitem">🤝 Partnerships</a
              >
            </div>
          </div>
        </div>
      {/if}
    </div>

    <div class="relative inline-block text-left block md:hidden focus:outline-none">
      <div>
        <span>
          <button class="hamburger" type="button" on:click={toggleMobileMenu}>
            <img src={images.icons.hamburger} alt="hamburger icon" class="w-min-20px" />
          </button>
        </span>
      </div>
      {#if mobileMenuVisible}
        <div
          class="z-50 origin-top-right absolute right-0 mt-1 thinborder w-56 drowpdown-shadow roundedl"
        >
          <div
            class="bg-white roundedl"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <div
              class="inline-flex roundedl w-full px-4 pt-2 bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800 transition ease-in-out duration-150 text-left font-bold"
            >
              Products:
            </div>
            <div class="roundedl">
              <a
                href="#/pies"
                on:click={toggleMobileMenu}
                class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
                role="menuitem">🥧 Indices <span class="font-thin">(PIEs)</span></a
              >
            </div>
            <div class="thinborderbottom" />
            <div
              class="inline-flex w-full px-4 pt-2 bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800 transition ease-in-out duration-150 text-left font-bold"
            >
              Governance:
            </div>
            <div class="">
              <a
                href="#/staking-simulator"
                on:click={toggleMobileMenu}
                class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
                role="menuitem">📟 Staking Simulator</a
              >
              <a
                href="http://forum.piedao.org/"
                target="_blank"
                on:click={toggleMobileMenu}
                class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
                role="menuitem">📢 Forum</a
              >
              <a
                href="https://client.aragon.org/?#/piedao"
                target="_blank"
                on:click={toggleMobileMenu}
                class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
                role="menuitem">🦅 Aragon DAO</a
              >
              <a
                href="https://snapshot.org/#/piedao.eth"
                target="_blank"
                on:click={toggleMobileMenu}
                class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
                role="menuitem">⚡ Snapshot</a
              >
              <a
                href="https://piedao.notion.site/Partnerships-24891a4f2aec45f69aea950330b76b81"
                target="_blank"
                on:click={toggleMobileMenu}
                class="block px-4 py-2 mb-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
                role="menuitem">🤝 Partnerships</a
              >
            </div>
            <div class="thinborderbottom" />
            <div
              class="inline-flex w-full px-4 pt-2 bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800 transition ease-in-out duration-150 text-left font-bold"
            >
              Misc:
            </div>
            <div class="">
              <a
                href="#/learn"
                on:click={toggleMobileMenu}
                class="block px-4 py-2 mb-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
                role="menuitem">📚 Learn</a
              >
            </div>
          </div>
        </div>
      {/if}
    </div>

    <a
      class="pl-3 ml-4 -mr-2 text-sm leading-5 font-medium text-gray-700 hidden lg:block"
      href="#/learn"
      rel="noopener noreferrer"
    >
      Learn
    </a>
  </div>
</div>
