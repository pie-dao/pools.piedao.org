<script>
  import images from "../config/images.json";
  import { currentRoute } from '../stores/routes.js';
</script>

<div class="content flex flex-col">
    <h1 class="mt-8 mb-4 text-base md:text-xl">Select a Pool</h1>
    <div class="flex flex-col w-full justify-center md:flex-row">

        <div class="farming-card flex flex-col justify-center align-center items-center text-center mx-2 my-2 md:m-2 border border-gray border-opacity-50 border-solid rounded-sm p-6">
            <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.logos.piedao_clean} alt="PieDAO logo" />
            <div class="title text-lg"> ETH pool Balancer 1</div>
            <div class="subtitle font-thin">sometihng goes here</div>
            <div class="apy">APY 15%</div>
            <a href="#button">
            <button class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Select</button>
            </a>
        </div>

        <div class="farming-card flex flex-col justify-center align-center items-center text-center mx-2 my-2 md:m-2 border border-gray border-opacity-50 border-solid rounded-sm p-6">
            <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.logos.piedao_clean} alt="PieDAO logo" />
            <div class="title text-lg"> ETH pool Balancer 2</div>
            <div class="subtitle font-thin">sometihng goes here</div>
            <div class="apy">APY 15%</div>
            <a href="#button">
            <button class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Select</button>
            </a>
        </div>

        <div class="farming-card flex flex-col justify-center align-center items-center text-center mx-2 my-2 md:m-2 border border-gray border-opacity-50 border-solid rounded-sm p-6">
            <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.logos.piedao_clean} alt="PieDAO logo" />
            <div class="title text-lg"> ETH pool Balancer 3</div>
            <div class="subtitle font-thin">sometihng goes here</div>
            <div class="apy">APY 15%</div>
            <a href="#button">
            <button class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Select</button>
            </a>
        </div>
    </div>

    <h1 class="mt-8 mb-1 px-2 text-center text-lg md:text-xl">ETH pool Balancer 2 Rewards</h1>
    <div class="subtitle px-2 text-center font-thin">You first need to approve the Balancer Pool contract in order to stake your token</div>
    <a href="#button">
    <button class="btn approvebtn clear font-bold my-8 ml-1 mr-0 py-2 px-4 md:mr-4">Approve</button>
    </a>

</div>
