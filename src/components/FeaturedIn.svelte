<script>
  import images from "../config/images.json";
</script>

<div class="content flex flex-col w-100pc px-6 md:px-0 justify-between spl text-center md:w-80pc">
  <div class="text-black text-base font-thin mb-10px">FEATURED IN</div>
    <div class="my-20px">
        <img class="w-100pc h-auto hidden md:block" src={images.press} alt="PieDAO Featured In" />
        <img class="w-100pc h-auto block md:hidden" src={images.pressmobile} alt="PieDAO Featured In" />
    </div>
</div>
