<script>
  export let image;
  export let title;
  export let isGrey;
</script>

<div class:bg-grey-243={isGrey === true} class="rounded-sm p-s flex items-center justify-between flex-wrap w-full mt-4 md:mt-8 md:p-8 lg:p-8">
    <div class="p-4 flex justify-center items-center w-full flex-wrap md:w-1/3 lg:w-1/3">
        <img class="w-25pc md:w-200px md:h-200px lg:w-200px lg:h-200px"src={image} alt={title} />
    </div>
    <div class="p-4 flex justify-center items-center content-center flex-wrap md:w-2/3">
        <h1 class="text-lg text-center md:text-xl md:text-left lg:text-left">
            {title}
        </h1>
        <div class="font-thin text-base mt-2 md:mt-4 md:text-lg lg:text-lg">
            <slot name="content">
                
            </slot>
        </div>
    </div>
</div>
