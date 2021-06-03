<script>
import {mousedownOutside} from '../../helpers/mousedownOutside.js';
import images from '../../config/images.json';

export let backgroundColor;
export let title;

export const open = () => {
    modalIsOpen = true;
}

export const close = () => {
    modalIsOpen = false;
}

let modalIsOpen = false;
</script>

{#if modalIsOpen}
    <div class="genericmodal flex justify-center items-center">
        <div style={ backgroundColor ? `background-color: ${backgroundColor} !important` : "#fff"} 
             class="flex flex-col justify-start modalcontent w-100pc min-h-100pc p-2 overflow-x-hidden overflow-y-auto lg:max-w-600px lg:min-w-30pc lg:max-h-70pc lg:min-h-50pc" use:mousedownOutside on:click_outside={() => modalIsOpen = false}>
         
             {#if title}
             <div class="flex">
                <h1 class="pl-50px text-center text-xl w-100pc"> {title} </h1>
                <button on:click={close} class="w-30px h-30px mr-20px self-center">
                    <img src={images.closebutton} alt="closebutton" />
                </button>
             </div>
            {:else}
            <div class="flex justify-end">
                <button on:click={close} class="w-30px h-30px self-center">
                    <img src={images.closebutton} alt="closebutton" />
                </button>
             </div>
            {/if}
            <slot name="content">
                
            </slot>
        </div>
    </div>
{/if}