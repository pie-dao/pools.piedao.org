<script>
  export let image;
  export let title;
  export let isGrey;
</script>

<div class:bg-grey-243={isGrey === true}>
    <div class="flex flex-col justify-between content-center items-center">
        <img class="w-25pc h-auto mt-8 l md:mt-16 md:w-25pc h-auto" src={image} alt={title} />
    </div>
    
    <h1 class="text-center text-lg  mt-8 md:text-xl md:mt-12">{title}</h1>
    <div class="text-left font-thin text-xs mt-2 md:mt-4 md:text-lg">
        <slot name="content">
                
        </slot>
    </div>
</div>