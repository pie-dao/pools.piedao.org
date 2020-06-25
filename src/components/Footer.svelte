<script>
  import { _ } from 'svelte-i18n';

  import images from '../config/images.json';
  import links from '../config/links.json';

  import { eth } from '../stores/eth.js';

  const year = (new Date()).getFullYear();
</script>

<div class="footer-container">
  <div class="left">
    <a href={links.piedao} class="footer-link">
      {$_('brands.piedao')}
      &nbsp;
      {year}
    </a>
    {#if $eth.currentBlockNumber > 0}
      <a
        class="footer-link"
        target="_blank"
        rel="noopener noreferrer"
        href={`https://etherscan.io/block/${$eth.currentBlockNumber}`}
      >
        Block: {$eth.currentBlockNumber}
      </a>
    {/if}
  </div>
  <div class="right">
    <a
      class="footer-link"
      href={links.discord}
      target="_blank"
      rel="noopener noreferrer"
    >
      {$_('brands.discord')}
    </a>
    <a
      class="footer-link"
      href={links.twitter}
      target="_blank"
      rel="noopener noreferrer"
    >
      {$_('brands.twitter')}
    </a>
    <a
      class="footer-link"
      href={links.medium}
      target="_blank"
      rel="noopener noreferrer"
    >
      {$_('brands.medium')}
    </a>
    <a
      class="footer-link"
      href={links.forum}
      target="_blank"
      rel="noopener noreferrer"
    >
      {$_('general.forum')}
    </a>
    <a
      class="footer-link"
      href={links.docs}
      target="_blank"
      rel="noopener noreferrer"
    >
      {$_('general.documentation')}
    </a>
    <a
      class="footer-link"
      href={links.github}
      target="_blank"
      rel="noopener noreferrer"
    >
      {$_('brands.github')}
    </a>
    <a href={links.dao} target="_blank" rel="noopener noreferrer">
      <img src={images.logos.aragon} class="aragon" alt={$_('brands.aragon')} />
    </a>
  </div>
</div>