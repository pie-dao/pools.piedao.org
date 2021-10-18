<script>
    import images from '../../config/images.json';
    import Meta from '../elements/meta.svelte';
</script>
<div>

    <Meta 
        metadata={{
            title: "PLAY Page, NFT/Gaming Index - PieDAO",
            description: "PieDAO & NFTX team up to bring to market the most comprehensive NFT/Gaming index in the market.",
            image: images.ypie,
            imageAlt: "PLAY index assets."
        }}
    />
    
    <h1 class="font-lg">Summary:</h1>
    <span class="font-thin">
      SLICE is the rewards token for distributing PieDAO’s revenues as described by the new governance mining initiative launched on 4th  October 2021.
    </span>
    <br/><br/>
    <span class="font-thin">
      From a technical perspective, SLICE is a regular <a href="https://github.com/pie-dao/PieVaults" target="_blank" class="font-bold">PieVault</a> with the only difference that the function joinPool is disabled, which means only the treasury can mint SLICE.<br/>
      Inside SLICE your find protocol fees coming from products like PLAY and BCP, as well as Alpha and farmed tokens from yield generating strategies by the <a href="https://forum.piedao.org/t/treasury-farming-initialization/892/9" target="_blank" class="font-bold">Treasury</a>.
    </span>
    <span class="font-thin">
      The underlying assets inside the RewardsPie will not be used productively and are therefore enabled for meta-governance at any time.
    </span>
    <br/><br/>
    <span class="font-thin">
      Monthly reports of Treasury yield can be found <a href="https://piedao.notion.site/3f394f3105114e929fd6a7d6f7dbfdc7?v=de24e9ab61d444db80639cb80f15491d" target="_blank" class="font-bold">here</a>
    </span>




  </div>