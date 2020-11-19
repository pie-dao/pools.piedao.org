<script>
  import images from "../../config/images.json";
  import SectionImageRight from "../../components/elements/SectionImageRight.svelte"
  import SectionImageLeft from "../../components/elements/SectionImageLeft.svelte"
</script>

<section class="py-12 px-4 text-center">
  <div class="w-full max-w-2xl mx-auto">
    <h2 class="text-xl mt-2 mb-6 leading-tight font-heading">Tokenized ETFs governed by a DAO</h2>
    <p class="mb-8 text-gray-500 font-thin text-md leading-relaxed">Welcome to the largest Ethereum DAO. An open, inclusive and diverse community of builders, thinkers and DeFi believers based around the globe.</p>
  </div>
</section>

<SectionImageRight image={images.defiplusicons} title="something">
    <span slot="content">
		<div class="font-thin mb-50px">
            PieDAO is a decentralized ETF manager governed by holders of the DOUGH token. Holding DOUGH gives you a voice in everything we do, as well as a share of the fees our products generate. Our index offerings provide risk-minimised exposure to the rapidly expanding DeFi ecosystem. Get involved today.
        </div>
	</span>
</SectionImageRight>

<SectionImageLeft image={images.defiplusicons} title="something">
    <span slot="content">
		<div class="font-thin mb-50px">
            PieDAO is a decentralized ETF manager governed by holders of the DOUGH token. Holding DOUGH gives you a voice in everything we do, as well as a share of the fees our products generate. Our index offerings provide risk-minimised exposure to the rapidly expanding DeFi ecosystem. Get involved today.
        </div>
	</span>
</SectionImageLeft>

<div class="content flex w-100pc justify-between spl">
    <div class="flex w-7/12 flex-col mt-10 p-5">
        <img class="w-100pc h-auto md:w-100pc h-auto"src={images.banner} alt="PieDAO Hero" />
    </div>
    <div class="flex w-5/12 flex-col mt-10 p-5">
        <div class="font-thin mb-50px">
            PieDAO is a decentralized ETF manager governed by holders of the DOUGH token. Holding DOUGH gives you a voice in everything we do, as well as a share of the fees our products generate. Our index offerings provide risk-minimised exposure to the rapidly expanding DeFi ecosystem. Get involved today.
        </div>
    </div>
</div>
