<script>
import DLP from './dlp-explanation.svelte'
import DXP from './dxp-explanation.svelte'
import DSP from './dsp-explanation.svelte'
import BTC from './btcp-explanation.svelte'
export let address;

</script>
<div>
    {#if address === '0x78f225869c08d478c34e5f645d07a87d3fe8eb78'}
        <DLP />
    {:else if address === '0x8d1ce361eb68e9e05573443c407d4a3bed23b033'}
        <DXP />
    {:else if address === '0xad6a626ae2b43dcb1b39430ce496d2fa0365ba9c'}
        <DSP />
    {:else if address === '0x0327112423f3a68efdf1fcf402f6c5cb9f7c33fd'}
        <BTC />
    {/if}
</div>