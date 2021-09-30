<script>
  import { farming } from '../../stores/eth/writables.js';
  import images from '../../config/images.json';

  let price = 'n/a';

  $: (async () => {
    price = $farming['0xB9a4Bca06F14A982fcD14907D31DFACaDC8ff88E'].DOUGHPrice.toFixed(2) || 0;
  })();
</script>

<button class="items-center stakinggradient shake text-black text-left mt-20 md:mt-4 hover:opacity-80" onclick="location.href='https://app.1inch.io/#/1/swap/ETH/DOUGH';" data-aos="fade-up" data-aos-delay="250">
  <div class="w-100pc flex items-center">
    <div class="m-10px">
      <img class="h-50px inline" src={images.doughtoken} alt="doughtoken" />
    </div>
    <div class="mr-20px">
      <div class="text-base font-bold leading-5">Buy DOUGH</div>
      <div class="text-sm font-thin">Current price: <strong>${price}</strong></div>
    </div>
  </div>
</button>