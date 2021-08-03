<script>
  export let tabs = [];
  export let projections = {};
  export let activeTabValue = 1;
  
  const handleClick = tabValue => () => (activeTabValue = tabValue);
</script>

<ul class="tabs_menu overflow-x-auto whitespace-nowrap .hidescrollbar">
{#each tabs as item}
	<li class={activeTabValue === item.value ? 'active' : ''}>
		<span on:click={handleClick(item.value)}>{item.label}</span>
	</li>
{/each}
</ul>
{#each tabs as item}
	{#if activeTabValue == item.value}
	<div class="tabs_content box">
		<svelte:component this={item.component} projections={projections}/>
	</div>
	{/if}
{/each}
<style>
	.box {
		margin-bottom: 10px;
		border: 1px solid #dee2e6;
    border-radius: 0 0 .5rem .5rem;
    border-top: 0;
	}
  ul {
    display: flex;
    flex-wrap: nowrap;
    padding-left: 0;
    margin-bottom: 0;
    list-style: none;
    border-bottom: 1px solid #dee2e6;
  }
	li {
		margin-bottom: -1px;
    font-size: 1rem;
    color: #727272;
	}

  span {
    border: 1px solid transparent;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    display: block;
    padding: 0.5rem 1rem;
    cursor: pointer;
    white-space: nowrap;
  }

  span:hover {
    border-color: #e9ecef #e9ecef #dee2e6;
  }

  li.active > span {
    color: black;
    background-color: #fff;
    border-color: #dee2e6 #dee2e6 #fff;
  }

  @media screen and (max-width: 640px) {
    li {
      font-size: 1rem;
    }
    span {
    padding: 0.8rem 0.8rem;
  }
}
</style>