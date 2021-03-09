<script>
  const members = [
    { username: 'cryptouf', img: 'https://pbs.twimg.com/profile_images/1250846427930075149/PW5lOu8T_400x400.jpg'},
    { username: 'Alexintosh', img: 'https://pbs.twimg.com/profile_images/1225182358955069443/iDGzgOTY_400x400.jpg'},
    { username: 'BlockEnthusiast', img: 'https://pbs.twimg.com/profile_images/962999701191606272/QFIb1hxe_400x400.jpg'},
    { username: 'uegabs', img: 'https://pbs.twimg.com/profile_images/1031332907900694529/sN0nr8hY_400x400.jpg'},
    { username: 'MickdeG010', img: 'https://pbs.twimg.com/profile_images/1223246943998136320/8BKy5LB2_400x400.jpg'},
    { username: 'dimarconicola', img: 'https://pbs.twimg.com/profile_images/1126082672277716993/mmbNmJB4_400x400.png'},
    { username: 'jasonnov', img: 'https://pbs.twimg.com/profile_images/1128035069187244035/PS6zWOC2_400x400.png'},
    { username: 'williambrealey1', img: 'https://pbs.twimg.com/profile_images/1272481570503438340/s6OgeLXX_400x400.jpg'},
    { username: 'checkoutmyspac3', img: 'https://pbs.twimg.com/profile_images/1246054788116045828/Qg5YbuWd_400x400.jpg'},
    { username: 'scupytrooples', img: 'https://pbs.twimg.com/profile_images/1315752406085296128/khc-2Kue_400x400.jpg'},
    { username: 'nanexcool', img: 'https://pbs.twimg.com/profile_images/1304944532291817477/H86k9FLR_400x400.jpg'},
    { username: 'kaiynne', img: 'https://pbs.twimg.com/profile_images/1170881713926365184/gI59qCJT_400x400.jpg'},
    { username: 'luikohl', img: 'https://pbs.twimg.com/profile_images/1346378302806749184/fJ2_Jdbq_400x400.jpg'},
    { username: 'btsfav', img: 'https://pbs.twimg.com/profile_images/1256203973574492168/M6aTthQs_400x400.jpg'},
    { username: 'DOUGHdefi', img: 'https://pbs.twimg.com/profile_images/1339540666225987584/RGvcKVW6_400x400.jpg'},
    { username: 'Evert0x', img: 'https://pbs.twimg.com/profile_images/1229796883389984768/-51xkMj3_400x400.jpg'},
    { username: 'PierrickGT', img: 'https://pbs.twimg.com/profile_images/1223022968722415619/9DPgCQiP_400x400.jpg'},
    { username: 'lemiscate', img: 'https://pbs.twimg.com/profile_images/1324997770281951233/E_NJr06Q_400x400.jpg'},
    { username: 'anastasiya_vc', img: 'https://pbs.twimg.com/profile_images/1291768835800993792/T6Zk-A30_400x400.jpg'},   
  ]

  const shuffledMembers = members.sort(() => Math.random() - 0.5);
  const featured = shuffledMembers.splice(0, 4)
  const secondRow = shuffledMembers.splice(0, 15)
</script>


<div class="flex flex-col rounded md:py-10 px-4 md:px-6 mx-2 md:mx-40 flex justify-center">
  <div class="flex flex-col max-w-1200px px-2 md:px-8">
    <div class="text-lg text-center w-100pc block md:hidden leading-7 mb-2">If you want to go fast, go alone. If you want to go far, DAO it together.</div>
    <div class="font-huge text-center w-100pc hidden md:block">If you want to go fast, go alone.<br/>If you want to go far, DAO it together.</div>
    <div class="flex flex-col md:flex-row items-center justify-between mt-2 md:mt-8 self-center">
      <div class="font-base font-thin text-left w-100pc ">Our fast growing community inlcudes top founders and developers of DeFi, join us!</div>
      <a target="_blank" href="http://discord.link/PieDAO"><div class="bg-lightgrey text-xs font-bold max-content py-2 px-4 rounded-xl thinborder-purple pointer flex ml-0 md:ml-4 mt-2 md:mt-0">+ 4420 <span class="font-thin ml-2">members</span></div></a>
    </div>
  </div>

  <div class="flex max-w-100pc md:max-w-1200px px-2 md:px-8 mt-4 flex-wrap justify-center self-center">
      
    {#each featured as member}
      <a href="https://twitter.com/{member.username}" target="_blank" class="md:min-w-200px md:w-250px w-100pc flex items-center bg-lightgrey thinborder rounded p-2 thinborder-purple pointer mr-2 md:mt-2 hidden md:flex md:visible">
          <div class="w-60px h-60px circle" style="background: url({member.img}) no-repeat center center; background-size: cover!important;"></div>
          <div class="ml-2 flex flex-col items-start">
            <span class="text-left font-bold text-base">{member.username}</span>
            <span class="text-left text-sm font-thin">Crusty AF</span>
          </div>
      </a>
    {/each}

  </div>

</div>

<div class="flex w-100pc justify-center self-center">
<div class="flex max-w-100pc md:max-w-1200px px-2 md:px-8 mt-2 md:mt-8 overflow-hidden flex-nowrap justify-between self-center overflow-x-scroll md:overflow-x-hidden hidescrollbar">

  {#each secondRow as member}
    <a href="https://twitter.com/{member.username}" target="_blank">
      <div class="w-60px h-60px circle mr-2" style="background: url({member.img}) no-repeat center center; background-size: cover!important;"></div>
    </a>
  {/each}

</div>
</div>


