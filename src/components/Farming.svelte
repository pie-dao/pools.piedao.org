<script>
  import { _ } from "svelte-i18n";

  import images from "../config/images.json";
  import pools from "../config/pools.json";
  import links from '../config/links.json';


  export let token;

  let rewards = "00.0%"; // TODO: Get this from docs markdown
  let brand = "piedao";
  let symbol = "$BAL";

  // $: (async () => {
  //   const response = await fetch(pools[token].docs);
  //   const markdown = await response.text();
  //   const data = markdown.toString().split("## Marketing Info")[1];
  //   const parts = data.split("{% endhint %}");
  //   const balParts = parts[0].split("\n");
  //   const balLine = balParts[balParts.length - 2];
  //   rewards = balLine.split(" ")[0];
  // })();
</script>

<!-- <div class="farming-container">
    <div class="left">
      <img class="h-40px md:h-70px"src={images.logos.piedao_clean} alt="PieDAO logo" />
      <h2 class="text-sm md:text-lg">
        {$_('defi.liquidity.mining')} 
      </h2>
    </div>
    <div class="right">
      <a href="#/stake">
        <h1 class="text-lg md:text-xl">Stake</h1>
        <span class="text-xs">
          To get DOUGH Rewards
        </span>
      </a>
    </div>
</div> -->

<div class="quantstamp-container">
  <a href={links.audit} alt={token} target="_blank">
    <span>Get amazing rewards</span>
    <img src={images.logos.stakedough} alt="{$_('brands.stakedough')}" />
  </a>
</div>
