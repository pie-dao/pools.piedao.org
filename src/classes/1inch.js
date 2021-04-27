export default class Api1inch {

    constructor() {
        this.baseUrl = 'https://api.1inch.exchange/v3.0/1/'
        this.slippage = 3;
    }

    async getSwap(_sellToken, _buyToken, amount, fromAddress) {
        const sellToken = {..._sellToken};
        const buyToken = {..._buyToken};

        if(sellToken.address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
            sellToken.address = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
        }
        if(buyToken.address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
            buyToken.address = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
        }

        const weiAmount = amount.toFixed(0);
        const callUrl = `${this.baseUrl}swap?amount=${weiAmount}&toTokenAddress=${buyToken.address}&fromTokenAddress=${sellToken.address}&slippage=${this.slippage}&referrerAddress=0x3bFdA5285416eB06Ebc8bc0aBf7d105813af06d0&fromAddress=${fromAddress}`;
        let response = await fetch(callUrl)
        console.log('response', response);

    }

    async getQuote(_sellToken, _buyToken, amount) {
        //quote?
        const sellToken = {..._sellToken};
        const buyToken = {..._buyToken};

        if(sellToken.address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
            sellToken.address = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
        }
        if(buyToken.address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
            buyToken.address = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
        }

        const weiAmount = amount.toFixed(0);
        const callUrl = `${this.baseUrl}quote?amount=${weiAmount}&toTokenAddress=${buyToken.address}&fromTokenAddress=${sellToken.address}&slippage=${this.slippage}&referrerAddress=0x3bFdA5285416eB06Ebc8bc0aBf7d105813af06d0`;
        let response = await fetch(callUrl)
        const result = await response.json();
        console.log('response', result);

        // fromTokenAmount: "1000000000000000000"
        // protocols: [[[{name: "WETH", part: 100, fromTokenAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",…}],…]]
        // toToken: {address: "0xe4f726adc8e89c6a6017f01eada77865db22da14", decimals: 18, symbol: "BCP",…}
        // toTokenAmount: "650323441212107437436"

        return {
            buyAmount: result.toTokenAmount,
            sellAmount: result.fromTokenAmount,
            buyTokenAddress: result.toToken.address,
            sellTokenAddress: result.fromToken.address,
            sources: result.protocols,
            estimatedGas: result.estimatedGas
        };

        // allowanceTarget: "0x0000000000000000000000000000000000000000"
        // buyAmount: "650323441212107437436"
        // buyTokenAddress: "0xe4f726adc8e89c6a6017f01eada77865db22da14"
        // buyTokenToEthRate: "650.323441212107437436"
        // data: "0xd9627aa400000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000022324c987e9892b52800000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000e4f726adc8e89c6a6017f01eada77865db22da14869584cd00000000000000000000000010000000000000000000000000000000000000110000000000000000000000000000000000000000000000b6e6f625e66087eb02"
        // estimatedGas: "136000"
        // gas: "136000"
        // gasPrice: "57000000000"
        // guaranteedPrice: "630.813737975744214312"
        // minimumProtocolFee: "0"
        // orders: [{makerToken: "0xe4f726adc8e89c6a6017f01eada77865db22da14",…}]
        // price: "650.323441212107437436"
        // protocolFee: "0"
        // sellAmount: "1000000000000000000"
        // sellTokenAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
        // sellTokenToEthRate: "1"
        // sources: [{name: "0x", proportion: "0"}, {name: "Uniswap", proportion: "0"},…]
        // to: "0xdef1c0ded9bec7f1a1670819833240f027b25eff"
        // value: "1000000000000000000"
    }
}