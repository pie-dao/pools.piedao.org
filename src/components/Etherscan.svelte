<script>
  import { _ } from 'svelte-i18n';

  import { etherscanLink } from '@pie-dao/utils';

  import images from '../config/images.json';
  import pools from '../config/pools.json';

  import { eth } from '../stores/eth.js';

  export let token;

  $: link = etherscanLink({ address: token, networkId: $eth.network.chainId || 1 })
</script>

<div class="etherscan-container">
  <a href={link} alt={token} target="_blank">
    <span>{$_('piedao.check.contract.on')}</span>
    <img src={images.logos.etherscan} alt="{$_('brands.etherscan')}" />
  </a>
</div>