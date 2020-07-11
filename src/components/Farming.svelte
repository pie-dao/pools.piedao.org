<script>
  import { _ } from 'svelte-i18n';

  import images from '../config/images.json';
  import pools from '../config/pools.json';

  export let token;

  let rewards = '26.5%'; // TODO: Get this from docs markdown
  let brand = 'balancer';
  let symbol = '$BAL';
</script>

<div class="farming-container">
  <div class="left">
    <img src={images.logos.balancerWhite} alt="Balancer" />
    <h2>
      {$_(`brands.${brand}`)}<br>
      {$_('defi.liquidity.mining')} {$_('general.program')}
    </h2>
  </div>
  <div class="right">
    <h1 class="text-xl">{rewards}</h1>
    <span class="text-xs">
      {$_('general.duration.annualized')} {$_('general.returns')}<br>
      {symbol} {$_('general.tokens')}
    </span>
  </div>
</div>