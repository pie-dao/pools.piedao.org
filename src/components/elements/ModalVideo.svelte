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
    localStorage.setItem('show-modal-play', false);
}


let modalIsOpen = localStorage.getItem('show-modal-play') === 'false' ? false : true;
</script>

{#if modalIsOpen}
    <div class="genericmodal flex  justify-center items-center">
        <div style={ backgroundColor ? `background-color: ${backgroundColor} !important` : "#fff"}  use:mousedownOutside on:mousedown_outside={close} 
             class="flex flex-col justify-start py-4 modalcontent w-100pc min-h-100pc overflow-x-hidden overflow-y-auto lg:max-w-80pc lg:min-w-30pc  lg:min-h-50pc" use:mousedownOutside on:click_outside={() => modalIsOpen = false}>
            <div class="flex justify-end">
            <button on:click={close} class="w-30px h-30px mr-20px self-center">
                <img class="svgclose" src={images.closebutton} alt="closebutton" />
            </button>
        </div>
            <slot name="content">
                
            </slot>
        </div>
    </div>
{/if}