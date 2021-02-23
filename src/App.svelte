<script>
  import "./styles.css";
  import AOS from 'aos';
  import 'aos/dist/aos.css'; 
  import Analytics from "./components/elements/Analytics.svelte";
  import Footer from "./components/Footer.svelte";
  import Header from "./components/Header.svelte";
  import { currentRoute } from "./stores/routes.js";

  AOS.init();
</script>

<section id="App">
  <Header />
  <Analytics id={'G-DFT6D7P7L3'} />
  <svelte:component this={$currentRoute.page} params={$currentRoute.params} />
  <Footer />
</section>
