<script>
  export let image;
  export let title;
export let isGrey;
</script>

<div class:bg-grey-243={isGrey === true} class=" rounded-sm p-8 flex justify-between flex-wrap w-full mt-8 md:mt-20">
    <div class="p-4 flex justify-center items-center content-center flex-wrap md:w-2/3">
        <h1 class="text-lg md:text-xl">
            {title}
        </h1>
        <div class="font-thin text-xs mt-2 md:mt-4 md:text-base">
            <slot name="content">
                
            </slot>
        </div>
    </div>
    <div class="p-4 flex justify-center w-full flex-wrap md:w-1/3 p-16">
        <img class="w-100pc h-full md:h-auto md:w-100pc" src={image} alt={title} />
    </div>
</div>