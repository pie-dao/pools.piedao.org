<script>
  export let image;
  export let title;
  export let isGrey;
</script>

<div class:bg-grey-243={isGrey === true} class="rounded-sm p-8 flex justify-between flex-wrap w-full mt-4 md:mt-8">
    <div class="p-4 flex justify-center w-full flex-wrap md:w-1/3 p-16">
        <img class="w-100pc h-full h-auto md:w-100pc"src={image} alt={title} />
    </div>
    <div class="p-4 flex justify-center items-center content-center flex-wrap md:w-2/3">
        <h1 class="text-lg md:text-xl">
            {title}
        </h1>
        <div class="font-thin text-base mt-2 md:mt-4 md:text-lg lg:text-lg">
            <slot name="content">
                
            </slot>
        </div>
    </div>
</div>
