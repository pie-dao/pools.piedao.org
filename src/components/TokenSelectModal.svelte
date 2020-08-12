<script>
  export let callback;
  export let tokens;

  export let open;
</script>

<style>
  .token-select-container {
    z-index: 100;
    left: 50%;
  }

  td,
  th {
    padding: 10px 0;
  }

  td:first-child,
  th:first-child {
    padding-left: 20px;
  }

  td:nth-child(2),
  th:nth-child(2) {
    padding-right: 20px;
  }

  tr {
    border-bottom: 1px solid;
  }
</style>

{#if open}
  <div class="token-select-container bg-white fixed w-400px -ml-200px">
    <div class="top bg-grey-204 p-20px flex">
      <h3 class="text-lg">Select a Token</h3>
      <button on:click={() => callback()} class="ml-auto">X</button>
    </div>
    <div class="bottom">
      <table class="w-100pc">
        <thead>
          <tr class="border-grey-243">
            <th class="font-thin w-50pc text-left">Token Name</th>
            <th class="font-thin w-50pc text-right">Balance</th>
          </tr>
          x
        </thead>
        <tbody>
          {#each tokens as token}
            <tr class="border-grey-243" on:click={() => callback(token)}>
              <td class="flex text-left">
                <img
                  src={token.icon}
                  alt={token.symbol}
                  class="token-icon w-32px h-32px my-4px mx-2px" />
                <span>{token.symbol}</span>
              </td>
              <td class="text-right">{token.balance}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
  <div class="overlay" />
{/if}
