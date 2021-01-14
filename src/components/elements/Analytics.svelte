<svelte:head>
    <script async src="https://www.googletagmanager.com/gtag/js?id={id}"></script>
</svelte:head>
<script>
    export let id
    if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer || []
        window.gtag = function gtag() {
            window.dataLayer.push(arguments)
        }
        window.gtag("js", new Date())
        window.gtag("config", id, { 'send_page_view': false })
    }
    $: {
        if (typeof gtag !== "undefined"){
            console.log('PATH', window.location.href)
            
            window.gtag("config", id, {
                page_path: window.location.href,
            });
        }
    }
</script>