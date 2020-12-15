<script>
  import images from "../../config/images.json";

  export let callback;
  export let tokens;

  export let open;
  /** Dispatch event on click outside of node */
  export function clickOutside(node) {
    
    const handleClick = event => {
      if (node && !node.contains(event.target) && !event.defaultPrevented) {
        node.dispatchEvent(
          new CustomEvent('click_outside', node)
        )
      }
    }

    document.addEventListener('click', handleClick, true);
    
    return {
      destroy() {
        document.removeEventListener('click', handleClick, true);
      }
    }
  }
</script>

{#if open}
  <div class="token-select-container bg-white fixed w-300px -ml-150px rounded-4px" use:clickOutside on:click_outside={() => callback()}>
    <div class="top bg-grey-204 px-20px py-6px flex rounded-t-4px">
      <h3 class="text-md">Select a Token</h3>
      <button on:click={() => callback()} class="ml-auto">
        <img src={images.icons.timesLight} alt="close" class="w-8px" />
      </button>
    </div>
    <div class="bottom rounded-b-4px">
      <table class="w-100pc">
        <thead>
          <tr class="border-grey-243 text-xs">
            <th class="font-thin w-50pc text-left py-10px">Token Name</th>
            <th class="font-thin w-50pc text-right py-10px">Balance</th>
          </tr>
        </thead>
        <tbody>
          {#each tokens as token}
            <tr class="border-grey-243 pointer" on:click={() => callback(token)}>
              <td class="flex text-left py-4px">
                {#if token.icon}
                <img
                  src={token.icon}
                  alt={token.symbol}
                  class="token-icon w-24px h-24px my-4px mx-2px" />
                {/if}
                <span class="leading-32px pl-2 text-md">{token.symbol}</span>
              </td>
              <td class="text-right py-4px text-md font-thin">{token.balance}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
  <div class="overlay" />
{/if}
