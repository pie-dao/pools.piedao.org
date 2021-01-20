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

  function getBalance(obj) {
    if(obj && obj.label) return obj.label;
    if(obj) return obj;
    return '-';
  }
</script>

{#if open}
<div class="flex flex-col w-100pc h-100pc max-h-100pc content-stretch justify-center items-center overflow-hidden">
  <div class="token-select-container overflow-y-scroll bg-white w-96pc max-h-80pc md:w-60pc lg:w-40pc rounded-12px" use:clickOutside on:click_outside={() => callback()}>
    <div class="top bg-lightgrey px-20px py-4 flex rounded-t-4px">
      <h3 class="text-md">Select a Token</h3>
      <button on:click={() => callback()} class="ml-auto">
        <img src={images.icons.timesLight} alt="close" class="w-12px" />
      </button>
    </div>
    <div class="bottom rounded-b-4px">
      <table class="w-100pc">
        <thead>
          <tr class="text-xs">
            <th class="font-thin w-50pc text-left py-4">Token Name</th>
            <th class="font-thin w-50pc text-right py-4">Balance</th>
          </tr>
        </thead>
        <tbody>
          {#each tokens as token}
            <tr class="pointer" on:click={() => callback(token)}>
              <td class="flex text-left py-2 my-1">
                {#if token.icon}
                <img
                  src={token.icon}
                  alt={token.symbol}
                  class="token-icon w-40px h-40px mr-1" />
                {/if}
                <span class="leading-32px pl-2 text-md">{token.symbol}</span>
              </td>
              <td class="text-right py-4px text-md font-thin">{getBalance(token.balance)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
  <div class="overlay" />
</div>
{/if}
