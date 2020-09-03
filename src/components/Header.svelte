<script>
  import { _ } from "svelte-i18n";

  import images from "../config/images.json";
  import links from "../config/links.json";

  import Web3Button from "./Web3Button.svelte";

  let mobileMenuVisible = false;

  const toggleMobileMenu = () => {
    mobileMenuVisible = !mobileMenuVisible;
  };
</script>

<div class="header-container">
  <div class="left">
    <a href={links.root}>
      <img src={images.logos.piedao} alt={$_('general.logo')} />
    </a>
  </div>
  <div class="right">
    
    <a class="link" href="#/pie/0xad6a626ae2b43dcb1b39430ce496d2fa0365ba9c">
      DEFI+S
    </a>
    <a class="link" href="#/pie/0x9a48bd0ec040ea4f1d3147c025cd4076a2e71e3e">
      USD++
    </a>
    <a class="link" href="#/pie/0x0327112423f3a68efdf1fcf402f6c5cb9f7c33fd">
      BTC++
    </a>

    <span class="link">🥧</span>


    <a class="link" href={links.vision} target="_blank" rel="noopener noreferrer">
      {$_('general.vision')}
    </a>

    <a class="link" href={links.dao} target="_blank" rel="noopener noreferrer">
      {$_('piedao.aragonLink')}
    </a>
    <a class="link" href={links.docs} target="_blank" rel="noopener noreferrer">
      {$_('general.docs')}
    </a>
    <Web3Button />
    <div class="mobile-placeholder" />

    <button class="hamburger" type="button" on:click={toggleMobileMenu}>
      <img src={images.icons.hamburger} alt="hamburger icon" class="w-min-20px" />
    </button>

    {#if mobileMenuVisible}
      <div class="overlay">
        <button type="button" class="close" on:click={toggleMobileMenu}>
          {$_('general.close')}
        </button>
        <nav>
          <ul>
            <li>
              <a href={links.root} on:click={toggleMobileMenu}>{$_('general.home')}</a>
            </li>
            <li>
              <a
                class="navbar-item"
                href={links.docs}
                on:click={toggleMobileMenu}
                rel="noopener noreferrer"
                target="_blank">
                {$_('general.docs')}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    {/if}
  </div>
</div>
