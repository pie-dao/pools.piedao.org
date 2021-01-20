import BigNumber from 'bignumber.js';
export default class ApiOx {

    constructor() {
        this.baseUrl = 'https://api.0x.org/swap/v1/'
    }

    async getQuote(addressOne, addressTwo, amount) {
        if(addressOne === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
            addressOne = 'ETH'
        }
        if(addressTwo === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
            addressTwo = 'ETH'
        }

        const weiAmount = (new BigNumber(amount).multipliedBy(10**18)).toFixed(0).toString();

        const callUrl = `${this.baseUrl}quote?sellAmount=${weiAmount}&buyToken=${addressTwo}&sellToken=${addressOne}`;
        console.log('callUrl', callUrl)
        let response = await fetch(callUrl)
        console.log('response', response);
        if (response.status !== 200) {
            console.error('The server responded with an unexpected status.', response);
            //TODO Handle errors
            return response.json();
        }
    
        const result = await response.json();
        return result;
    }
}