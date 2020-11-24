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
            <a class="font-bold mt-4 md:mt-4" target="_blank" href={`https://medium.com/piedao/dough-farming-season-7329ea5e84dd`}>Migration Tutorial</a><br/>
            <a class="font-bold mt-4 md:mt-4" target="_blank" href={`https://client.aragon.org/?#/piedao/0x968986e7ab9d05b4f6334efdc6c4c5efd89d4119/`}>Migrate Now</a>
        </div>
	</span>
</SectionImageLeft>