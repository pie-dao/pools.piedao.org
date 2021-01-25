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
             class="flex flex-col justify-start modalcontent w-100pc min-h-100pc p-2 overflow-x-hidden overflow-y-auto lg:max-w-50pc lg:min-w-30pc lg:max-h-80pc lg:min-h-50pc" use:mousedownOutside on:click_outside={() => modalIsOpen = false}>
            <div class="flex">
             {#if title}
                <h1 class="pl-50px text-center text-xl w-100pc"> {title} </h1>
            {/if}
            <button on:click={close} class="w-30px h-30px mr-20px self-center">
                <img src={images.closebutton} alt="closebutton" />
            </button>
        </div>
            <slot name="content">
                
            </slot>
        </div>
    </div>
{/if}