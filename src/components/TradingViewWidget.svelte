<script>
  import { onMount } from "svelte";
  export let options = Object;
  const SCRIPT_ID = "tradingview-widget-script";

  $: CONTAINER_ID =
    options && options.container_id ? options.container_id : "svelte-tradingview-widget;";

  onMount(() => {
    appendScript(initWidget);
    console.log("asfd");
  });

  const initWidget = (opts = {}) => {
    if (typeof TradingView !== "undefined") {
      const container_id = CONTAINER_ID;
      new window.TradingView.widget({ container_id, ...opts });
      console.log("asfd");
    }
  };

  $: initWidget(options);

  function appendScript(onload) {
    if (document.getElementById(SCRIPT_ID) === null) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.type = "text/javascript";
      script.async = true;
      script.src = "https://s3.tradingview.com/tv.js";
      script.onload = () => onload(options);
      document.getElementsByTagName("head")[0].appendChild(script);
    } else {
      const script = document.getElementById(SCRIPT_ID);
      const oldOnload = script.onload;
      return (script.onload = () => {
        oldOnload();
        onload();
      });
    }
  }

  $: autosize = options.autosize;
</script>

<div id={CONTAINER_ID} class:autosize />
