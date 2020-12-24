<script>
import DLP from './dlp-explanation.svelte'
import DXP from './dxp-explanation.svelte'
import DSP from './dsp-explanation.svelte'
import BTC from './btcp-explanation.svelte'
import USD from './usdp-explanation.svelte'
import BCP from './bcp-explanation.svelte';
import YPIE from './ypie-explanation.svelte';


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
    {:else if address === '0x9a48bd0ec040ea4f1d3147c025cd4076a2e71e3e'}
        <USD />
    {:else if address === '0xe4f726adc8e89c6a6017f01eada77865db22da14'}
        <BCP />
    {:else if address === '0x17525e4f4af59fbc29551bc4ece6ab60ed49ce31'}
        <YPIE />
    {/if}
</div>