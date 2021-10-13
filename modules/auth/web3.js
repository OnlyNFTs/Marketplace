Moralis.initialize("Yt8nY74340sEhXEWlVCASjPTq5kcBMg4pzqu7iox");
Moralis.serverURL = 'https://uctux2sj3ina.moralisweb3.com:2053/server';

// Contract Addresses
const WBNB_TOKEN_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const TOKEN_CONTRACT_ADDRESS = "0x67A3C573bE9edca87f5097e3A3F8f1111E51a6cd";
const MARKETPLACE_CONTRACT_ADDRESS = "0x09a13f95bBcDf87C92412ba42d849Bb852C8795e";
const PAYMENT_TOKEN_ADDRESS = "0x134BBB94Fc5a92c854cD22B783FfE9E1C02d761B";
//const MINT_TOKEN_ADDRESS = "0xa1aFA0F5F11B5fF4700883Ed76fb2Baa98c94E83";
const MINT_TOKEN_ADDRESS = "0x134BBB94Fc5a92c854cD22B783FfE9E1C02d761B";
const EARLY_HOLDERS_NFT_ADDRESS = "0x5692AB9e489e9c88d72431ce572c31061BbC7531";
//const EARLY_HOLDERS_NFT_ADDRESS = "0x1E2DA509D7bDfA8eEb4a9D8E40B509Fb2d68DBe8";
const PANCAKESWAP_ROUTER_ADDRESS = "0x10ED43C718714eb63d5aA57B78B54704E256024E";

async function initWeb3() {
    if (window.localStorage.walletconnect) {
        window.web3 = await Moralis.enable({
            provider: "walletconnect"
        });
        walletProvider = "walletconnect";
    } else {
        window.web3 = await Moralis.enable();
        walletProvider = "";
    }
    

    // window.web3 = await Moralis.Web3.enable({provider: walletProvider});
    window.tokenContract = new web3.eth.Contract(tokenContractAbi, TOKEN_CONTRACT_ADDRESS);
    window.marketplaceContract = new web3.eth.Contract(marketplaceContractAbi, MARKETPLACE_CONTRACT_ADDRESS);
    window.paymentTokenContract = new web3.eth.Contract(paymentTokenContractAbi, PAYMENT_TOKEN_ADDRESS);
    window.mintTokenContract = new web3.eth.Contract(mintTokenContractAbi, MINT_TOKEN_ADDRESS);
    window.earlyHoldersContract = new web3.eth.Contract(earlyHoldersContractAbi, EARLY_HOLDERS_NFT_ADDRESS);
    window.pancakeswapRouterContract = new web3.eth.Contract(pancakeswapRouterAbi, PANCAKESWAP_ROUTER_ADDRESS);
    console.log(walletProvider);
    //const chainId = await web3.eth.chainId();
    //console.log(chainId);
    const networkId = await web3.eth.net.getId();
    console.log(networkId);

}