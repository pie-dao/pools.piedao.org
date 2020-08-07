<script>
  import { _ } from "svelte-i18n";

  import images from "../config/images.json";
  import pools from "../config/pools.json";

  export let token;

  let rewards = "00.0%"; // TODO: Get this from docs markdown
  let brand = "piedao";
  let symbol = "$BAL";

  $: (async () => {
    const response = await fetch(pools[token].docs);
    const markdown = await response.text();
    const data = markdown.toString().split("## Marketing Info")[1];
    const parts = data.split("{% endhint %}");
    const balParts = parts[0].split("\n");
    const balLine = balParts[balParts.length - 2];
    rewards = balLine.split(" ")[0];
  })();
</script>

<div class="farming-container">
  <div class="left">
    <img src={images.logos.piedao} alt="PieDAO logo" />
    <h2>
      {$_(`brands.${brand}`)}
      <br />
      {$_('defi.liquidity.mining')} {$_('general.program')}
    </h2>
  </div>
  <div class="right">
    <h1 class="text-xl">Soon™️</h1>
    <span class="text-xs">
      Join us on Discord to learn more
    </span>
  </div>
</div>
