<style>
  a { text-transform: lowercase; }
</style>

<script>
  import { _ } from 'svelte-i18n';
  import images from '../config/images.json';
  import links from '../config/links.json';

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
    <a class="link" href={links.dao} target="_blank" rel="noopener noreferrer">
      {$_('piedao.aragonLink')}
    </a>
    <a class="link" href={links.docs} target="_blank" rel="noopener noreferrer">
      {$_('general.docs')}
    </a>
    <a class="link" href={links.whitepaper} target="_blank" rel="noopener noreferrer">
      {$_('general.whitepaper')}
    </a>
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
              <a href={links.root} on:click={toggleMobileMenu}>
                {$_('general.home')}
              </a>
            </li>
            <li>
              <a
                class="navbar-item"
                href={links.docs}
                on:click={toggleMobileMenu}
                rel="noopener noreferrer"
                target="_blank"
              >
                {$_('general.docs')}
              </a>
            </li>
            <li>
              <a
                class="navbar-item"
                href={links.whitepaper}
                on:click={toggleMobileMenu}
                rel="noopener noreferrer"
                target="_blank"
              >
                {$_('general.whitepaper')}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    {/if}
  </div>
</div>