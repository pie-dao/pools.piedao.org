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
    <img src="https://static.tildacdn.com/tild3234-6331-4632-b931-346235343766/Logo-mixBytes3.svg" alt="MixBytes" />
  </a>
</div>
