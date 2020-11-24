<script>
  import images from "../../config/images.json";
</script>

<div class="content flex flex-col spl">
  <div class="text-center font-thin text-xs mt-4 mb-4 md:text-lg">
    What's your style?
   </div>
   <div class="flex justify-around w-100pc content-center">
    <a href="ciao" class="investment-card flex w-1/3 items-center min-h-150px bg-lightgrey m-10px p-20px rounded-sm">
      <div class="text-left mr-20px"><img class="w-80px h-auto"src={images.koala} alt="PieDAO Hero" /></div>
      <div class="flex flex-col text-left">
        <div class="text-lg">Sleepy gainer</div>
        <div class="font-thin">Easy peasy crypto sweeties</div>
      </div>
    </a>
    <a href="ciao" class="investment-card flex w-1/3 items-center min-h-150px bg-lightgrey m-10px p-20px rounded-sm">
      <div class="text-left mr-20px"><img class="w-80px h-auto"src={images.defihero} alt="PieDAO Hero" /></div>
      <div class="flex flex-col text-left">
        <div class="text-lg">DeFi Hero</div>
        <div class="font-thin">Reasonable gains and risks</div>
      </div>
    </a>
    <a href="ciao" class="investment-card flex w-1/3 items-center min-h-150px bg-lightgrey m-10px p-20px rounded-sm">
      <div class="text-left mr-20px"><img class="w-80px h-auto"src={images.degen} alt="PieDAO Hero" /></div>
      <div class="flex flex-col text-left">
        <div class="text-lg">Degen warrior</div>
        <div class="font-thin">Harvest them all</div>
      </div>
    </a>
   </div>
</div>