export default class ApiOx {

    constructor() {
        this.baseUrl = 'https://api.0x.org/swap/v1/'
    }

    async getQuote(addressOne, addressTwo, amount) {
        const callUrl = `${this.baseUrl}quote?sellAmount=${amount}&buyToken=${addressTwo}&sellToken=${addressOne}`;
        let response = await fetch(callUrl)
        console.log('response', response);
        if (response.status !== 200) {
            console.error('The server responded with an unexpected status.', response.status);
            return false;
        }
    
        const result = await response.json();
        return result;
    }
}