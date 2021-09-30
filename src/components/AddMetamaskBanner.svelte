<script>
  import { _ } from 'svelte-i18n';
  import images from '../config/images.json';
  import {addTokenToMM} from "../helpers/addTokenToMM.js";

  export let pie;
  export let pieAddress;
</script>

<div class="quantstamp-container pointer">
  <a on:click={() => addTokenToMM(pie.symbol, pieAddress, 18)}  alt="Add to Metamask" target="_blank">
    <span>Add token to</span>
    <img width="100%" height="auto" src={images.logos.addmetamask} alt="{$_('brands.addmetamask')}" />
  </a>
</div>