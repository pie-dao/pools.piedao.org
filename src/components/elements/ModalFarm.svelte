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
        <div class="flex flex-col justify-start p-1px cardbordergradient w-80pc min-h-100pc overflow-x-hidden overflow-y-auto lg:max-w-60pc lg:min-w-30pc lg:max-h-80pc lg:h-80pc lg:min-h-50pc" use:mousedownOutside on:click_outside={() => modalIsOpen = false}>

            <button on:click={close} class="w-30px h-30px ml-auto relative top-20px right-20px">
                <img src={images.closebutton} alt="closebutton" />
            </button>
            <slot name="content">
                
            </slot>
        </div>
    </div>
{/if}