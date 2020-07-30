<script>
  import { _ } from "svelte-i18n";

  import pools from "../config/pools.json";

  export let token;

  // TODO: pull this from the markdown
  let links = [
    {
      href: "#",
      text: "Loading...",
    },
  ];

  $: (async () => {
    const response = await fetch(pools[token].docs);
    const markdown = await response.text();
    const data = markdown.toString().split("## Marketing Info")[1];
    const parts = data.split("{% endhint %}");
    links = parts[1]
      .split("\n")
      .filter((link) => link.match(/  */g))
      .map((raw) => {
        return {
          href: raw.match(/\((.*)\)/)[1],
          text: raw.match(/\[(.*)\]/)[1],
        };
      });
  })();
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
