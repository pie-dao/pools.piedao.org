import BigNumber from 'bignumber.js';

export default class ApiOx {

    constructor() {
        this.baseUrl = 'https://api.0x.org/swap/v1/'
    }

    async getQuote(sellToken, buyToken, amount) {
        if(sellToken.address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
            sellToken.address = 'ETH'
        }
        if(buyToken.address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
            buyToken.address = 'ETH'
        }

        const decimals = sellToken.decimals || 18;
        const weiAmount = (new BigNumber(amount).multipliedBy(10**decimals)).toFixed(0).toString();
        const callUrl = `${this.baseUrl}quote?sellAmount=${weiAmount}&buyToken=${buyToken.address}&sellToken=${sellToken.address}`;
        let response = await fetch(callUrl)
        
        if (response.status !== 200) {
            console.error('The server responded with an unexpected status.', response);
            //TODO Handle errors
            return response.json();
        }
    
        const result = await response.json();
        return result;
    }
}