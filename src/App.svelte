<script>
  import "./styles.css";
  
  import Analytics from "./components/elements/Analytics.svelte";
  import Footer from "./components/Footer.svelte";
  import Header from "./components/Header.svelte";

  import { currentRoute } from "./stores/routes.js";
  console.log(global);
</script>

<section id="App">
  <Header />
  <Analytics id={'G-DFT6D7P7L3'} />
  <svelte:component this={$currentRoute.page} params={$currentRoute.params} />
  <Footer />
</section>
