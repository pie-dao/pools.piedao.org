<script>
import {clickOutside} from '../../helpers/clickOutside.js';

export let backgroundColor;
export let title;

export const open = () => {
    modalIsOpen = true;
}

export const close = () => {
    modalIsOpen = false;
}

let modalIsOpen = false;
console.log('backgroundColor', backgroundColor)
</script>

{#if modalIsOpen}
    <div class="genericmodal flex  justify-center items-center">
        <div style={ backgroundColor ? `background-color: ${backgroundColor} !important` : "#fff"} 
             class="flex flex-col justify-start py-4 modalcontent w-100pc min-h-100pc overflow-x-hidden overflow-y-auto lg:max-w-50pc lg:min-w-30pc lg:max-h-80pc lg:h-80pc lg:min-h-50pc" use:clickOutside on:click_outside={() => modalIsOpen = false}>
            <div class="flex">
             {#if title}
                <h1 class="text-center text-xl w-100pc"> {title} </h1>
            {/if}
            <button on:click={close} class="w-30px h-30px mr-20px self-center">
                X
            </button>
        </div>
            <slot name="content">
                
            </slot>
        </div>
    </div>
{/if}