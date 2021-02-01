<script>
  import { _ } from 'svelte-i18n';
  import images from '../config/images.json';
</script>

<div class="SpreadBanner text-white absolute bottom-0 md:bottom-0 md:right-0 z-50 mr-2 ml-2 mb-2 md:ml-0 md:mr-4 md:mb-4 pointer flex flex-col items-end bg-lightgrey p-4 rounded">
<img src={images.closebutton} alt="closebutton" width="20px" class="invertcolor" />
<span class="w-100pc text-left font-bold">Market price is currently higher than NAV</span>
<span class="w-100pc text-left font-thin">This means you can buy at a discount, don't miss it!</span>
</div>