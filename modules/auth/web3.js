
appId = "Yt8nY74340sEhXEWlVCASjPTq5kcBMg4pzqu7iox";
serverUrl = 'https://uctux2sj3ina.moralisweb3.com:2053/server';
// Contract Addresses
const WBNB_TOKEN_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const TOKEN_CONTRACT_ADDRESS = "0x67A3C573bE9edca87f5097e3A3F8f1111E51a6cd";
const NFT_CONTRACT_ADDRESS = "";
const MARKETPLACE_CONTRACT_ADDRESS = "0x09a13f95bBcDf87C92412ba42d849Bb852C8795e";
const NFT_MARKETPLACE_CONTRACT_ADDRESS = "0x09a13f95bBcDf87C92412ba42d849Bb852C8795e";
const NSFW_MARKETPLACE_CONTRACT_ADDRESS = "0x09a13f95bBcDf87C92412ba42d849Bb852C8795e";
const PAYMENT_TOKEN_ADDRESS = "0x134BBB94Fc5a92c854cD22B783FfE9E1C02d761B";
//const MINT_TOKEN_ADDRESS = "0xa1aFA0F5F11B5fF4700883Ed76fb2Baa98c94E83";
const MINT_TOKEN_ADDRESS = "0x134BBB94Fc5a92c854cD22B783FfE9E1C02d761B";
const EARLY_HOLDERS_NFT_ADDRESS = "0x5692AB9e489e9c88d72431ce572c31061BbC7531";
//const EARLY_HOLDERS_NFT_ADDRESS = "0x1E2DA509D7bDfA8eEb4a9D8E40B509Fb2d68DBe8";
const PANCAKESWAP_ROUTER_ADDRESS = "0x10ED43C718714eb63d5aA57B78B54704E256024E";

var web3NotificationCount = localStorage.getItem('web3_notif_counter');

async function initWeb3() {
    await Moralis.start({ serverUrl, appId });
    if (window.localStorage.walletconnect) {
        window.web3 = await Moralis.enableWeb3({
            provider: "walletconnect"
        });
        walletProvider = "walletconnect";
    } else {
        window.web3 = await Moralis.enableWeb3();
        
    }
    

    // window.web3 = await Moralis.Web3.enable({provider: walletProvider});
    window.tokenContract = new web3.eth.Contract(tokenContractAbi, TOKEN_CONTRACT_ADDRESS);
    window.marketplaceContract = new web3.eth.Contract(marketplaceContractAbi, NFT_MARKETPLACE_CONTRACT_ADDRESS);
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

async function checkWalletProvider() {
if (typeof web3 !== 'undefined') {
    
    walletProvider = 'active';
    console.log('web3 is enabled')
    if (web3.currentProvider.isMetaMask === true) {
        walletProvider = 'metamask';
        console.log('MetaMask is active');
        notificationHeader.innerText = "MetaMask Detected";
        notificationBody.innerText = "MetaMask has been Detected! ";
       
       
        $('.toast').toast('show');
        
        //window.web3 = Moralis.Web3.enable({provider: 'metamask'});
        initWeb3();
    } else {
        console.log('MetaMask is not available');
        notificationHeader.innerText = "Web3 Browser Detected";
        notificationBody.innerText = "Web3 Browser has been Detected! ";
        $('.toast').toast('show');
        //window.web3 = Moralis.Web3.enable({provider: 'walletconnect, trustwallet'});
        initWeb3();
    }
} else if (window.localStorage.walletconnect)  {
    
    console.log('MetaMask is not available');
    notificationHeader.innerText = "Web3 Browser Detected";
    notificationBody.innerText = "Web3 Browser has been Detected! ";
    $('.toast').toast('show');
    //window.web3 = Moralis.Web3.enable({provider: 'walletconnect, trustwallet'});
    initWeb3();
} else if (walletProvider == 'undefined'){
    walletProvider = 'undefined';
    notificationHeader.innerText = "No Web3 Browser Detected";
    notificationBody.innerHTML = `<p>Please Visit our Docs page for more info on how to get started! <a href="https://docs.onlynfts.online/get-started">Click Here</a></p>`;
    const notSettings = document.getElementById("notificationAlert");
    notSettings.setAttribute("data-delay", '150000000');
    //notificationTime.innerText = Math.round(Date.now()/1000)+60*20;
    $('.toast').toast('show');
    user = await Moralis.User.current();
    if (user) {
        Moralis.User.logOut();
    }  
}
};