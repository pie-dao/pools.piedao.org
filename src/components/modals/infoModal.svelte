<script>
    import { _ } from "svelte-i18n";
    export let description_key;
    </script>
    
  <div class="liquidity-container flex-col justify-items-center bg-grey-243 rounded-4px lg:px-4 lg:pb-4">
    {$_(description_key)}
  </div>