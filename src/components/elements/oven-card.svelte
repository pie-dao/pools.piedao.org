<script>
  export let title;
  export let subTitle;
  export let image;
  export let description;
  export let callback;
  export let isHighlighted;
</script>

<div class:highlight-box={isHighlighted === true} class="farming-card flex flex-col justify-center align-center items-center text-center mx-2 my-2 md:m-2 border border-gray border-opacity-50 border-solid rounded-sm p-6">
    <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={image} alt={title} />
    <div class="title text-lg"> <a href="" target="_blank"> {title} </a></div>
    <div class="subtitle font-thin">{description}</div>
    <div class="apy">{subTitle}</div>
    <button on:click={callback} class="btn border-white clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Select</button>
</div>