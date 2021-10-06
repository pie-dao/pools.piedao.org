<script>
  import { _ } from 'svelte-i18n';
  import images from '../config/images.json';
  import pools from "../config/pools.json";
</script>

<div class="quantstamp-container">
  <a href="#/dough-staking" alt="Stale for rewards">
    <span>Get amazing rewards</span>
    <img src={images.logos.stakedough} alt="{$_('brands.stakedough')}" />
  </a>
</div>
