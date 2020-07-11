<script>
  import { _ } from 'svelte-i18n';

  export let token;

  // TODO: pull this from the markdown
  const links = [
    {
      href: "#",
      text: "BTC++ is 4th by Adj Liquidity on Balancer Pools",
    },
    {
      href: "#",
      text: "Check BTC++ price on CoinGecko.com",
    },
    {
      href: "#",
      text: "Read More about BTC++ on PieDAO Forum",
    },
    {
      href: "#",
      text: "How to mint BTC++ tutorial on PieDAO Medium Channel",
    },
    {
      href: "#",
      text: "BTC++ Activity on DeFi MarketCap",
    },
    {
      href: "#",
      text: "DeFi Score",
    },
  ];
</script>

<div class="info-container">
  <h1>{$_('general.info')}</h1>
  <ul>
    {#each links as link}
      <li>
        <a href={link.href} alt={link.text} target="_blank">{link.text}</a>
      </li>
    {/each}
  </ul>
</div>