<script>
  import { _ } from 'svelte-i18n';

  import images from '../config/images.json';
  import links from '../config/links.json';
  import pools from '../config/pools.json';

  export let token;
</script>

<div class="quantstamp-container">
  <a href={links.audit} alt={token} target="_blank">
    <span>{$_('piedao.audit.result')}</span>
    <img src={images.logos.quantstamp} alt="{$_('brands.quantstamp')}" />
  </a>
</div>