import {ethers} from "ethers";

const url = window.location.href;
const query = url.split('?')[1];

if(query) {
    const urlParams = new URLSearchParams("?" + query);
    if (urlParams.has('r')) {
        const ref = urlParams.get('r');

        if(ethers.utils.isAddress(ref)) {
            localStorage.setItem("ref", ref);
        }
    }
    // strip off all params from url
    window.location.href = url.split("?")[0];
}