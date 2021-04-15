<script>
  import images from "../config/images.json";
</script>

<div class="content flex items-center flex-col w-100pc px-6 md:px-0 justify-between text-center md:w-100pc opacity-60">
  <div class="text-black text-base font-thin mt-4 mb-4">Audited By</div>
    <div class="flex justify-center mb-10">
        <img class="w-80pc h-auto hidden md:block" src={images.auditslogos} alt="PieDAO Audited by" />
        <img class="w-100pc h-100pc block md:hidden" src={images.auditslogosmobile} alt="PieDAO Audited by" />
    </div>
</div>
