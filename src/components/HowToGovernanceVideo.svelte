<script>
    import { elasticOut } from 'svelte/easing'

    function Transition() {
        return {
            duration: 2000,
            css(tick) {
                tick = elasticOut(tick)
                return `
                    opacity: ${tick};
                `
            },
        }
    }
</script>

<div class="videoWrapper w-full" in:Transition>
    <iframe width="560" height="315" src="https://www.youtube.com/embed/_ef6IkZUCu0?fs=1&autoplay=1&mute=1&loop=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
