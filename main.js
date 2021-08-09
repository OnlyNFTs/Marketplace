Moralis.initialize("Yt8nY74340sEhXEWlVCASjPTq5kcBMg4pzqu7iox");
Moralis.serverURL = 'https://uctux2sj3ina.moralisweb3.com:2053/server';

// Contract Addresses
const TOKEN_CONTRACT_ADDRESS = "0x67A3C573bE9edca87f5097e3A3F8f1111E51a6cd";
const MARKETPLACE_CONTRACT_ADDRESS = "0x09a13f95bBcDf87C92412ba42d849Bb852C8795e";
const PAYMENT_TOKEN_ADDRESS = "0x134BBB94Fc5a92c854cD22B783FfE9E1C02d761B";
//const MINT_TOKEN_ADDRESS = "0xa1aFA0F5F11B5fF4700883Ed76fb2Baa98c94E83";
const MINT_TOKEN_ADDRESS = "0x134BBB94Fc5a92c854cD22B783FfE9E1C02d761B";
const EARLY_HOLDERS_NFT_ADDRESS = "0x5692AB9e489e9c88d72431ce572c31061BbC7531";
//const EARLY_HOLDERS_NFT_ADDRESS = "0x1E2DA509D7bDfA8eEb4a9D8E40B509Fb2d68DBe8";

// Fees/Requirements
onftsHoldersMintRequirements = 1000;
mintFee = 1000;
onftsEarlyHoldersNFTAddress = "0x5692ab9e489e9c88d72431ce572c31061bbc7531";
onftsNSFWAddress = "0x67a3c573be9edca87f5097e3a3f8f1111e51a6cd";
onftsAddress = "0x134bbb94fc5a92c854cd22b783ffe9e1c02d761b";


// Initialise
init = async () => {
    
    hideElement(userItemsSection);
    hideElement(createItemForm);
    hideElement(loadingMintForm);
    hideElement(musicPlayer);
//     window.addEventListener('load', function() {
//     if (typeof web3 !== 'undefined') {
//     console.log('web3 is enabled')
//     if (web3.currentProvider.isMetaMask === true) {
//       console.log('MetaMask is active')
//     } else {
//       console.log('MetaMask is not available')
//     }
//   } else {
//     alert('No Web3 Browser Has Been Detected. Please visit https://metamask.io/download And install Metamask!')
//   }
// });
    window.web3 = await Moralis.Web3.enable({provider: 'walletconnect, metamask'});
    window.tokenContract = new web3.eth.Contract(tokenContractAbi, TOKEN_CONTRACT_ADDRESS);
    window.marketplaceContract = new web3.eth.Contract(marketplaceContractAbi, MARKETPLACE_CONTRACT_ADDRESS);
    window.paymentTokenContract = new web3.eth.Contract(paymentTokenContractAbi, PAYMENT_TOKEN_ADDRESS);
    window.mintTokenContract = new web3.eth.Contract(mintTokenContractAbi, MINT_TOKEN_ADDRESS);
    window.earlyHoldersContract = new web3.eth.Contract(earlyHoldersContractAbi, EARLY_HOLDERS_NFT_ADDRESS);
     
    initUser();
    fetchCoinPrice();

    loadItems();
    const soldItemsQuery = new Moralis.Query('SoldItemsRoylt');
    const soldItemsSubscription = await soldItemsQuery.subscribe();
    soldItemsSubscription.on("create", onItemSold);
    const itemsAddedQuery = new Moralis.Query('ItemsForSaleRoylt');
    const itemsAddedSubscription = await itemsAddedQuery.subscribe();
    itemsAddedSubscription.on("create", onItemAdded);
    const removedItemsQuery = new Moralis.Query('removedItems');
    const removedItemsSubscription = await removedItemsQuery.subscribe();
    removedItemsSubscription.on("create", onItemRemoved);

}

const livecoindata_api_url = 'https://api.livecoinwatch.com/coins/single';
const pancakeswap_api_url = 'https://api.pancakeswap.info/api/v2/tokens/0x134bbb94fc5a92c854cd22b783ffe9e1c02d761b';

// Fetch Coin Price
fetchCoinPrice = async () => {
const response = await fetch(pancakeswap_api_url)
.then((response) => {
    return response.json();
})
.then((data) => {
    var onftsApiData = data.data;
    onftsPrice = onftsApiData.price;
    onftsPriceBN = new BigNumber(onftsPrice);
    document.getElementById("onftspricebutton").innerText = `$${onftsPriceBN.dp(6)}`;
})
}

// Big Number Config
BigNumber.config({
    DECIMAL_PLACES: 2,
    ERRORS: true,
    CRYPTO: true,
    MODULO_MODE: 1
});

// On Item Sold Cloud Function
onItemSold = async (item) => {
    const listing = document.getElementById(`item-${item.attributes.uid}`);
    if (listing){
        listing.parentNode.removeChild(listing);
    }
    
    user = await Moralis.User.current();
    if (user){
        const params = {uid: `${item.attributes.uid}`};
        const soldItem = await Moralis.Cloud.run('getItem', params);
        if (soldItem){
            if (user.get('accounts').includes(item.attributes.buyer)){
                getAndRenderItemData(soldItem, renderUserItem);
            }

            const userItemListing = document.getElementById(`user-item-${item.tokenObjectId}`);
            if (userItemListing) userItemListing.parentNode.removeChild(userItemListing);
          
        }
   
    }
}

// Item Removed Cloud Function
onItemRemoved = async (item) => {
    const listing = document.getElementById(`item-${item.attributes.uid}`);
    if (listing){
        listing.parentNode.removeChild(listing);
    }
    
    user = await Moralis.User.current();
    if (user){
        const params = {uid: `${item.attributes.uid}`};
        const soldItem = await Moralis.Cloud.run('getItem', params);
        if (soldItem){
            if (user.get('accounts').includes(item.attributes.buyer)){
                getAndRenderItemData(soldItem, renderUserItem);
            }

            const userItemListing = document.getElementById(`user-item-${item.tokenObjectId}`);
            if (userItemListing) userItemListing.parentNode.removeChild(userItemListing);
          
        }
   
    }
}


// On Item added cloud function
onItemAdded = async (item) => {
    const params = {uid: `${item.attributes.uid}`};
    const addedItem = await Moralis.Cloud.run('getItem', params);
    if (addedItem){
        user = await Moralis.User.current();
        if (user){
            if (user.get('accounts').includes(addedItem.ownerOf)){
                const userItemListing = document.getElementById(`user-item-${item.tokenObjectId}`);
                if (userItemListing) userItemListing.parentNode.removeChild(userItemListing);

                getAndRenderItemData(addedItem, renderUserItem);
                return;
            }
        }
        getAndRenderItemData(addedItem, renderItem);
    }

}

// Init User
initUser = async () => {
    if (await Moralis.User.current()){
        user = await Moralis.User.current();
        mintApprovedStatus = await user.attributes.mintApproved;
        adminStatus = await user.attributes.adminStatus;
        console.log(mintApprovedStatus);
        console.log(adminStatus);

        if (await user.attributes.referrer !== undefined ) {
            //alert(user.attributes.referrer);
        userReferrerInfo = await user.attributes.referrer.id;
        
        userReferrerAddress = await user.attributes.referrerAddress;}
        userReferrerSubmited = await user.attributes.referrerSubmited;
        //alert(mintApprovedStatus);
        hideElement(userConnectButton);
        showElement(userProfileButton);
        showElement(openCreateItemButton);
        showElement(openUserItemsButton);
        loadBalances();
        loadUserItems();
    }else{
        showElement(userConnectButton);
        hideElement(userProfileButton);
        hideElement(openCreateItemButton);
        hideElement(openUserItemsButton);
    }
}

//Log In
login = async () => {
    try {
        await Moralis.Web3.authenticate({provider: 'walletconnect, metamask'});
        alert("Loged in Successfully!");
        initUser();
    } catch (error) {
        alert(error)
    }
}

// Logout
logout = async () => {
    await Moralis.User.logOut();
    hideElement(userInfo);
    alert("Logged Out Successfully!");
    initUser();
}

// Load/Open User Info Modal
openUserInfo = async () => {
    user = await Moralis.User.current();

    if (user){    
        const email = user.get('email');
        if(email){
            userEmailField.value = email;
        }else{
            userEmailField.value = "";
        }
        userUsernameField.value = user.get('username');
        userUniqueId = user.id;
        
        if (mintApprovedStatus == true) {
        document.getElementById("refferalId").innerText = userUniqueId;
        } else {
            document.getElementById("refferalId").innerText = "Please wait for approval"; 
        }

        if (earlyHoldersBalance != null) {
            document.getElementById("earlyNFT").innerText = "Level: Early Adopter";
            } else {
                document.getElementById("earlyNFT").innerText = "Level 1"; 
            }



        const userAvatar = user.get('avatar');
        if(userAvatar){
            userAvatarImg.src = userAvatar.url();
            showElement(userAvatarImg);
        }else{
            hideElement(userAvatarImg);
        }

        $('#userInfo').modal('show');
    }else{
        login();
    }
}


//Submit Referral
submitRefferal = async () => {
    if (userReferrerField.value.length == 24) {
        user.set('referrerSubmited', userReferrerField.value);
        await user.save();
        alert("Submited!");
    } else  {
        alert("Invalid Refferer ID Entered! Please enter a valid Referrer ID");
    }
    initUser();
    $('#enterReferrer').modal('hide');
}

// Save User Info
saveUserInfo = async () => {
    user.set('email', userEmailField.value);
    user.set('username', userUsernameField.value);

    if (userAvatarFile.files.length > 0) {
        const avatar = new Moralis.File("avatar1.jpg", userAvatarFile.files[0]);
        user.set('avatar', avatar);
    }

    await user.save();
    alert("User info saved successfully!");
    openUserInfo();
}

// Handle Open Create Item Modal
handleOpenCreateItem = async () => {

    
    if (mintApprovedStatus == false) {
    
        if (userReferrerSubmited == null) {
            //alert("enter referrer id");
            $('#enterReferrer').modal('show');
        } else {
            //alert("await for approval");
            $('#waitforApproval').modal('show');
        }
    
    }else if (mintApprovedStatus == true) {
        openCreateItem();
    }
    
}

// Open Create Item Modal
openCreateItem = async () => {
    user = await Moralis.User.current(); 
    if (user){ 
        
            hideElement(devSwitchButton);
            devSwitch.disabled = 1;
            console.log(adminStatus);
        if (onftsBalanceBN < onftsHoldersMintRequirements) { 
            document.getElementById("btnCreateItem").disabled = 1;
            createItemCreator.disabled = 1;
        }else if (earlyHoldersBalance !== null) {
            document.getElementById("mint-fee").innerText = "0";
            document.getElementById("mint-balance").innerText = onftsBalanceBN;
            createItemCreator.disabled = 0;
            if (await adminStatus == true) {

                showElement(devSwitchButton);
                devSwitch.disabled = 0;
    
    
            }
           } else {
            document.getElementById("mint-fee").innerText = mintFee;
            document.getElementById("mint-balance").innerText = onftsBalanceBN;
            createItemCreator.disabled = 1;
            if (await adminStatus == true) {

                showElement(devSwitchButton);
                devSwitch.disabled = 0;
    
    
            }
           }
           createItemCreator.value = await user.get('ethAddress');
           createNFTValue = "0";
           addToMarketplaceValue = "0";
           createItemPriceField.disabled = 1;
           $('#createItem').modal('show');
        }else{
    login();
    }
}

// Create Item
createItem = async () => {

    if (onftsBalanceBN < onftsHoldersMintRequirements) { 
        document.getElementById("btnCreateItem").disabled = 1;
        alert(`Not Enough Mint Tokens! You need atleast ${onftsHoldersMintRequirements} to mint an NFT!`);
       return;
    } else if (createItemFile.files.length == 0){
        alert("Please select a file!");
        return;
    } else if (createItemNameField.value.length == 0){
        alert("Please give the item a name!");
        return;
    } else if (createItemRoyaltyFee.value.length == 0){
        alert("Please give the item a royalty fee!");
        return;
    } else if (addToMarketplaceValue == 1){
        if (createItemPriceField.value.length == 0) {
        alert("Please give the item a price!");
        return;
        }
    } else if (createItemPriceField.value > 5000000){
        alert("Maximum sell price is 5,000,000 ONFTs!");
        return;
    } else if (createItemRoyaltyFee.value > 50){
        alert("Maximum royalty fee is 50!");
        return;
    }
    const loadingStatus = document.getElementById("loadingStatus");
    $('#createItem').modal('hide');
    $('#loadingMint').modal('show');
    loadingProgress.style.width = 1 + "%";
    loadingStatus.innerText = "Gathering Information and saving it on IPFS"
    
    user = await Moralis.User.current();
    loadingProgress.style.width = 5 + "%";
    const userAddress = user.get('ethAddress');
    const creator = createItemCreator.value;
    await createItemRoyaltyFee.value;
    loadingProgress.style.width = 10 + "%";
    const royaltyFee = createItemRoyaltyFee.value;
    alert(userReferrerAddress);
    alert(royaltyFee);
    document.getElementById("btnCreateItem").disabled = 1;
    const nftFile = new Moralis.File("nftFile",createItemFile.files[0]);
    await nftFile.saveIPFS();
    loadingProgress.style.width = 20 + "%";
    const nftFilePath = nftFile.ipfs();
    const metadata = {
        name: createItemNameField.value,
        description: createItemDescriptionField.value,
        image: nftFilePath,
        creator: creator,
        royaltyFee: royaltyFee,
        referrer: userReferrerAddress,
    };

    const nftFileMetadataFile = new Moralis.File("metadata.json", {base64 : btoa(JSON.stringify(metadata))});
    await nftFileMetadataFile.saveIPFS();
    loadingProgress.style.width = 40 + "%";
    loadingStatus.innerText = "Please confirm transaction for mintfee approval";
    const nftFileMetadataFilePath = nftFileMetadataFile.ipfs();
    await ensureMintTokenIsApproved(MINT_TOKEN_ADDRESS);
    loadingProgress.style.width = 70 + "%";
    loadingStatus.innerText = "Please confirm transaction to mint your NFT";
   
    alert(creator);
    switch(createNFTValue){

        case "0":

        nftId = await mintNft(nftFileMetadataFilePath, royaltyFee, userReferrerAddress);
        var symbol = await tokenContract.methods.symbol().call({from: user.get('ethAddress')});
        var name = await tokenContract.methods.name().call({from: user.get('ethAddress')}); 
        var Item = Moralis.Object.extend("OnlyNFTs");
        var OnlyNFTs = new Item();
        OnlyNFTs.set('name', createItemNameField.value);
        OnlyNFTs.set('description', createItemDescriptionField.value);
        OnlyNFTs.set('owner_of', creator);
        OnlyNFTs.set('creator_address', creator);
        OnlyNFTs.set('royaltyFee', royaltyFee);
        OnlyNFTs.set('token_address', onftsNSFWAddress);
        OnlyNFTs.set('token_id', 1);
        OnlyNFTs.set('token_uri', nftFileMetadataFilePath);
        OnlyNFTs.set('token_symbol', symbol);
        OnlyNFTs.set('token_name', name);
        OnlyNFTs.set('referrer_address', userReferrerAddress);
        await OnlyNFTs.save();
        break;

        case "1":

        nftId1 = await mintEANft(nftFileMetadataFilePath, creator, royaltyFee, userReferrerAddress);
        var symbol = await earlyHoldersContract.methods.symbol().call({from: user.get('ethAddress')});
        var name = await earlyHoldersContract.methods.name().call({from: user.get('ethAddress')}); 
        var Item = Moralis.Object.extend("EANFT");
        var eaNFT = new Item();
        eaNFT.set('name', createItemNameField.value);
        eaNFT.set('description', createItemDescriptionField.value);
        eaNFT.set('owner_of', creator);
        eaNFT.set('creator_address', creator);
        eaNFT.set('royaltyFee', royaltyFee);
        eaNFT.set('token_address', onftsEarlyHoldersNFTAddress);
        eaNFT.set('token_id', nftId1);
        eaNFT.set('token_uri', nftFileMetadataFilePath);
        eaNFT.set('token_symbol', symbol);
        eaNFT.set('token_name', name);
        eaNFT.set('referrer_address', userReferrerAddress);
        await eaNFT.save();
        break;
    }

    loadingProgress.style.width = 100 + "%";
    loadingStatus.innerText = "NFT Successfully minted!";
    
    switch(addToMarketplaceValue){

        case "0":

            document.getElementById("btnCreateItem").disabled = 0;
            initUser();
            break;

        case "1":

            loadingProgress.style.width = 1 + "%";
            loadingStatus.innerText = "Getting Info";
            await ensureMarketplaceIsApproved(nftId, TOKEN_CONTRACT_ADDRESS);
            loadingProgress.style.width = 30 + "%";
            loadingProgress.style.width = 40 + "%";
            let test1 = createItemPriceField.value;
            let askingPriceBN = new BigNumber(test1).times(1000000000).times(1000000000);
            let creator = userAddress;
            let royaltyFee = createItemRoyaltyFee.value;
            loadingProgress.style.width = 60 + "%";
            loadingStatus.innerText = "Please approve marketplace";
            await marketplaceContract.methods.addItemToMarket(nftId, TOKEN_CONTRACT_ADDRESS, askingPriceBN, creator, royaltyFee, userReferrerAddress).send({from: user.get('ethAddress')});
            loadingProgress.style.width = 100 + "%";
            loadingStatus.innerText = "NFT Successfully added to the marketplace!";
            document.getElementById("btnCreateItem").disabled = 0;
            initUser();
            break;
    }  
    hideElement(createItemForm);
}

// Burn NFT
burnNFT = async (item) => {
    user = await Moralis.User.current();
    if (!user){
        login();
        return;
    }
    await tokenContract.methods.burnToken(item.tokenId).send({from: user.get('ethAddress')});
    alert("NFT Destroyed!");
}


// Minft NFT
mintNft = async (metadataUrl, RoyaltyFee, referrerAddress) => {
    if (earlyHoldersBalance != null) {
    const receipt = await tokenContract.methods.createItemNoFee(metadataUrl, RoyaltyFee, referrerAddress).send({from: ethereum.selectedAddress});
    console.log(receipt);
    return receipt.events.Transfer.returnValues.tokenId;
} else {
     const receipt = await tokenContract.methods.createItem(metadataUrl, RoyaltyFee, referrerAddress).send({from: ethereum.selectedAddress});
     console.log(receipt);
     return receipt.events.Transfer.returnValues.tokenId;
    }
    
}

mintEANft = async (metadataUrl, creator, RoyaltyFee, referrerAddress) => {
  
    const receipt = await earlyHoldersContract.methods.createItem(metadataUrl, creator, RoyaltyFee, referrerAddress).send({from: ethereum.selectedAddress});
    console.log(receipt);
    return receipt.events.Transfer.returnValues.tokenId;
    
}


// Open User Items Modal
openUserItems = async () => {
    user = await Moralis.User.current(); 
    loadUserItems();
    if (user){ 
        const BscTokenBalance = Moralis.Object.extend("BscTokenBalance");
        const query = new Moralis.Query(BscTokenBalance);
        query.equalTo("token_address", onftsAddress);
        query.equalTo("address", user.get('ethAddress'));
        const results = await query.find();

    // Do something with the returned Moralis.Object values
    for (let i = 0; i < results.length; i++) {
        const object = results[i];
        //alert(object.id + ' - ' + object.get('balance'));
        const onftsBalance1 = object.get('balance');
        onftsBalanceBN = new BigNumber(onftsBalance1).div(1000000000).div(1000000000);
        onftsBalanceUSDBN = new BigNumber(onftsBalanceBN).times(onftsPrice);
        document.getElementById("onftsBalanceButton").innerText = `${onftsBalanceBN.dp(2)} ONFTs - ${onftsBalanceUSDBN.dp(2)} USD`;
    };

    query.equalTo("token_address", onftsAddress);
    query.equalTo("address", user.get('ethAddress'));
    const results1 = await query.find();
    for (let i = 0; i < results1.length; i++) {
    const object1 = results1[i];
    const mintTokenBalance = object1.get('balance');
    mintTokenBalanceBN = new BigNumber(mintTokenBalance).div(1000000000).div(1000000000);
    document.getElementById("mintTokenBalanceButton").innerText = `${mintTokenBalanceBN.dp(2)} TOKEN`;
    };   

        $('#userItems').modal('show');
    }else{
        login();
    }
}

// Load User Items
loadUserItems = async () => {
    const ownedItems = await Moralis.Cloud.run("getUserItems");
    ownedItems.forEach(item => {
        const userItemListing = document.getElementById(`user-item-${item.tokenObjectId}`);
        if (userItemListing) return;
        getAndRenderItemData(item, renderUserItem);
    });
}

// Load Marketplace Items
loadItems = async () => {
    const items = await Moralis.Cloud.run("getItems");
    user = await Moralis.User.current();
    items.forEach(item => {
        if (user){
            if (user.attributes.accounts.includes(item.ownerOf)){
                const userItemListing = document.getElementById(`user-item-${item.tokenObjectId}`);
                if (userItemListing) userItemListing.parentNode.removeChild(userItemListing);
                getAndRenderItemData(item, renderUserItem);
                return;
            }

        }

        getAndRenderItemData(item, renderItem);
    });
}

// Init NFT Template
initTemplate = (id) => {
    const template = document.getElementById(id);
    template.id = "";
    template.parentNode.removeChild(template);
    return template;
}

// Render User Items
renderUserItem = async (item) => {
    const userItemListing = document.getElementById(`user-item-${item.tokenObjectId}`);
    if (userItemListing) return;

    const userItem = userItemTemplate.cloneNode(true);
    userItem.getElementsByTagName("img")[1].src = item.image;
    userItem.getElementsByTagName("img")[1].alt = item.name;
    userItem.getElementsByTagName("h5")[0].innerText = item.name;
    userItem.getElementsByTagName("p")[0].innerText = item.symbol; 
    userItem.getElementsByTagName("p")[1].innerText = item.description; 
    userItem.getElementsByTagName("h6")[0].innerText = "Creator";
    userItem.getElementsByTagName("p")[2].innerText = item.creator;
    userItem.getElementsByTagName("p")[3].innerText = item.royaltyFee;    
    itemPrice = new BigNumber(item.askingPrice).div(1000000000).div(1000000000);
    userItem.getElementsByTagName("input")[0].value = await itemPrice ?? 1;
    userItem.getElementsByTagName("input")[0].disabled = item.askingPrice > 0;
    //userItem.getElementsByTagName("button")[0].disabled = 1;
    userItem.getElementsByTagName("button")[0].disabled = item.askingPrice > 0;
   // if (item.askingPrice == null) {hideElement(userItem.getElementsByTagName("button")[1]);};
   // if (item.askingPrice != null) {hideElement(userItem.getElementsByTagName("button")[2]);};

    userItem.getElementsByTagName("button")[1].disabled = item.askingPrice == null;
   userItem.getElementsByTagName("button")[2].disabled = item.askingPrice > 0;
    userItem.getElementsByTagName("button")[1].onclick = async () => removeItem(item);

    //userItem.getElementsByTagName("button")[1].disabled = item.askingPrice < 10;
    userItem.getElementsByTagName("button")[2].onclick = async () => burnNFT(item);
    userItem.getElementsByTagName("button")[0].onclick = async () => {
        user = await Moralis.User.current();
        if (!user){
            login();
            return;
        }else if (userItem.getElementsByTagName("input")[0].value > 5000000) {
            alert("Max 5Mil");
            return;
        }
         await ensureMarketplaceIsApproved(item.tokenId, item.tokenAddress);
        await userItem.getElementsByTagName("input")[0].value;
        let test1 = userItem.getElementsByTagName("input")[0].value;
        let askingPriceBN = new BigNumber(test1).times(1000000000).times(1000000000);
     await marketplaceContract.methods.addItemToMarket(item.tokenId, item.tokenAddress, askingPriceBN, item.creator, item.royaltyFee, item.referrer).send({from: user.get('ethAddress')});
     alert("NFT Added To Marketplace!");
    };

    userItem.id = `user-item-${item.tokenObjectId}`
    userItems.appendChild(userItem);
}

// Render Marketplace Item
renderItem = (item) => {
    const itemForSale = marketplaceItemTemplate.cloneNode(true);
    if (item.sellerAvatar){
        itemForSale.getElementsByTagName("img")[0].src = item.sellerAvatar.url();
        itemForSale.getElementsByTagName("img")[0].alt = item.sellerUsername;
     
    }
    itemForSale.getElementsByTagName("p")[0].innerText = item.symbol;
    itemForSale.getElementsByTagName("img")[1].src = item.image;
    itemForSale.getElementsByTagName("img")[1].alt = item.name;
    itemForSale.getElementsByTagName("h5")[0].innerText = item.name;
    itemForSale.getElementsByTagName("h6")[0].innerText = "Description:";
    itemForSale.getElementsByTagName("p")[1].innerText = item.description;
    itemForSale.getElementsByTagName("p")[2].innerText = `RoyaltyFee ${item.royaltyFee} %`;
    
    let itemlol = new BigNumber(item.askingPrice).div(1000000000).div(1000000000);
    let convertedToUSDPrice = new BigNumber(onftsPrice).times(itemlol);
    itemForSale.getElementsByTagName("button")[0].innerText = `BUY ${itemlol} ONFTs`;
    itemForSale.getElementsByTagName("button")[1].innerText = `$${convertedToUSDPrice.dp(2)} USD`;
    itemForSale.getElementsByTagName("button")[0].onclick = async () =>  buyItem(item);
    itemForSale.getElementsByTagName("a")[3].innerText = `Royalties ${item.royaltyFee}%`;
    itemForSale.id = `item-${item.uid}`;
    itemsForSale.appendChild(itemForSale);
}

// Render Item Data
getAndRenderItemData = (item, renderFunction) => {
    
    fetch(item.tokenUri)
    .then(response => response.json())
    .then(data => {
        item.name = data.name;
        item.description = data.description;
        item.image = data.image;
        item.creator = data.creator;
        item.royaltyFee = data.royaltyFee;
        item.referrer = data.referrer;
        renderFunction(item);
    })
}

// Marketplace Approval
ensureMarketplaceIsApproved = async (tokenId, tokenAddress) => {
    user = await Moralis.User.current();
    const userAddress = user.get('ethAddress');
    const contract = new web3.eth.Contract(tokenContractAbi, tokenAddress);
    const approvedAddress = await contract.methods.getApproved(tokenId).call({from: userAddress});
    if (approvedAddress != MARKETPLACE_CONTRACT_ADDRESS){
        await contract.methods.approve(MARKETPLACE_CONTRACT_ADDRESS, tokenId).send({from: userAddress});
    }
}

// Payment Token Approval
ensurePaymentTokenIsApproved = async (tokenAddress, amount) => {
    user = await Moralis.User.current();
    console.log(amount);
    const userAddress = user.get('ethAddress');
    const contract = new web3.eth.Contract(paymentTokenContractAbi, tokenAddress);
    const approvedAddress = await contract.methods.allowance(userAddress, MARKETPLACE_CONTRACT_ADDRESS).call({from: userAddress});
    console.log(approvedAddress);
    if (approvedAddress < amount){
        await contract.methods.approve(MARKETPLACE_CONTRACT_ADDRESS, amount).send({from: userAddress});
    }
}



// ensurePaymentTokenIsApproved = async (tokenAddress, amount) => {
//     user = await Moralis.User.current();
//     const userAddress = user.get('ethAddress');
//     const contract = new web3.eth.Contract(paymentTokenContractAbi, tokenAddress);
//     const approvedAddress = await contract.methods.approve(MARKETPLACE_CONTRACT_ADDRESS, web3.utils.toWei('1', 'ether')).call({from: userAddress});
//     if (approvedAddress != PAYMENT_TOKEN_ADDRESS){
//         await contract.methods.approve(MARKETPLACE_CONTRACT_ADDRESS, web3.utils.toWei('1', 'tether')).send({from: userAddress});
//     }
// }

// Mint Token Approval
ensureMintTokenIsApproved = async (tokenAddress, amount) => {
    user = await Moralis.User.current();
    const userAddress = user.get('ethAddress');
    const contract = new web3.eth.Contract(mintTokenContractAbi, tokenAddress);
    const approvedAddress = await contract.methods.allowance(userAddress, TOKEN_CONTRACT_ADDRESS).call({from: userAddress});
    console.log(approvedAddress)
    if (approvedAddress < 1000){
        await contract.methods.approve(TOKEN_CONTRACT_ADDRESS, web3.utils.toWei('1', 'tether')).send({from: userAddress});
    }
}


// ensureMintTokenIsApproved = async (tokenAddress, amount) => {
//     user = await Moralis.User.current();
//     const userAddress = user.get('ethAddress');
//     const contract = new web3.eth.Contract(mintTokenContractAbi, tokenAddress);
//     const approvedAddress = await contract.methods.approve(TOKEN_CONTRACT_ADDRESS, web3.utils.toWei('1', 'ether')).call({from: userAddress});
//     if (approvedAddress != MINT_TOKEN_ADDRESS){
//         await contract.methods.approve(TOKEN_CONTRACT_ADDRESS, web3.utils.toWei('1', 'tether')).send({from: userAddress});
//     }
// }

// Buy Item
buyItem = async (item) => {
    user = await Moralis.User.current();
    if (!user){
        login();
        return;
    }
    await ensurePaymentTokenIsApproved(PAYMENT_TOKEN_ADDRESS, item.askingPrice); 
    await marketplaceContract.methods.buyItem(item.uid).send({from: user.get('ethAddress')});
    alert("NFT Purchased");
}

// Remove from marketplace
removeItem = async (item) => {
    user = await Moralis.User.current();
    if (!user){
        login();
        return;
    }
    await marketplaceContract.methods.removeItem(item.uid).send({from: user.get('ethAddress')});
   
    alert("NFT Removed from Marketplace!");
}

//Load User
loadBalances = async () => {
user = await Moralis.User.current(); 
if (user){ 
    earlyHoldersBalance = null;
    const BscTokenBalance = Moralis.Object.extend("BscTokenBalance");
    const query = new Moralis.Query(BscTokenBalance);
    query.equalTo("token_address", onftsAddress);
    query.equalTo("address", user.get('ethAddress'));
    const results = await query.find();

// Do something with the returned Moralis.Object values
for (let i = 0; i < results.length; i++) {
    const object = results[i];
    //alert(object.id + ' - ' + object.get('balance'));
    const onftsBalance1 = object.get('balance');
    onftsBalanceBN = new BigNumber(onftsBalance1).div(1000000000).div(1000000000);
    onftsBalanceUSDBN = new BigNumber(onftsBalanceBN).times(onftsPrice);
    console.log(onftsBalance1);
 
};

query.equalTo("token_address", onftsAddress);
query.equalTo("address", user.get('ethAddress'));
const results1 = await query.find();
//alert("Successfully retrieved " + results1.length + " balance.");
// Do something with the returned Moralis.Object values
for (let i = 0; i < results1.length; i++) {
const object1 = results1[i];
//alert(object.id + ' - ' + object.get('balance'));
const mintTokenBalance = object1.get('balance');
mintTokenBalanceBN = new BigNumber(mintTokenBalance).div(1000000000).div(1000000000);
console.log(mintTokenBalance);
}; 

const BscNFTOwners = Moralis.Object.extend("BscNFTOwners");
const query2 = new Moralis.Query(BscNFTOwners);
query2.equalTo("token_address", onftsEarlyHoldersNFTAddress);
query2.equalTo("owner_of", user.get('ethAddress'));
const results2 = await query2.find();
// Do something with the returned Moralis.Object values
for (let i = 0; i < results2.length; i++) {
const object2 = results2[i];
earlyHoldersBalance = object2.get('token_id');
console.log(object2.get('token_id'));
if (earlyHoldersBalance !== null) {
    console.log(object2.get('token_id'));}
    


};

};
}


hideElement = (element) => element.style.display = "none";
showElement = (element) => element.style.display = "block";

// Navbar
const userConnectButton = document.getElementById("btnConnect");
userConnectButton.onclick = login;
const userProfileButton = document.getElementById("btnUserInfo");
userProfileButton.onclick = openUserInfo;
const openCreateItemButton = document.getElementById("btnOpenCreateItem");
openCreateItemButton.onclick = handleOpenCreateItem;




//  User profile
const userInfo = document.getElementById("userInfo");
const userUsernameField = document.getElementById("txtUsername");
//const userReferrerField = document.getElementById("txtReferrer");
const userEmailField = document.getElementById("txtEmail");
const userAvatarImg = document.getElementById("imgAvatar");
const userAvatarFile = document.getElementById("fileAvatar");
const onftsBalanceButton = document.getElementById("onftsBalanceButton");
document.getElementById("btnCloseUserInfo").onclick = () => hideElement(userInfo);
document.getElementById("btnLogout").onclick = logout;
document.getElementById("btnSaveUserInfo").onclick = saveUserInfo;

// Item creation
const createItemForm = document.getElementById("createItem");
const createItemNameField = document.getElementById("txtCreateItemName");
const createItemDescriptionField = document.getElementById("txtCreateItemDescription");
const createItemPriceField = document.getElementById("numCreateItemPrice");
const createItemRoyaltyFee = document.getElementById("numCreateRoyaltyFee");
const createItemCreator = document.getElementById("textCreateItemCreator");
const createItemStatusField = document.getElementById("selectCreateItemStatus");
const createItemFile = document.getElementById("fileCreateItemFile");
document.getElementById("btnCloseCreateItem").onclick = () => hideElement(createItemForm);
document.getElementById("btnCreateItem").onclick = async () => createItem();

// Referral
document.getElementById("btnSubmitReferrer").onclick = async () => submitRefferal();
const userReferrerField = document.getElementById("txtReferrer");
//Music Player
const musicPlayer = document.getElementById("musicPlayer")
document.getElementById("secretbutton").onclick = () => $('#musicPlayer').modal('show');


// User items
const userItemsSection = document.getElementById("userItems");
const userItems = document.getElementById("userItemsList");
document.getElementById("btnCloseUserItems").onclick = () => hideElement(userItemsSection);
const openUserItemsButton = document.getElementById("btnMyItems");
openUserItemsButton.onclick = openUserItems;
const userItemTemplate = initTemplate("itemTemplate");
const marketplaceItemTemplate = initTemplate("marketplaceItemTemplate");

// Items for sale
const itemsForSale = document.getElementById("itemsForSale");
var   usdPrice = new BigNumber(0.000025);
const removeNftButton = document.getElementById("remove-nft-button");


// Loading
const loadingMintForm = document.getElementById("loadingMint");
const loadingProgress = document.getElementById("myBar");

const NFToptions = document.getElementById("options");
const addToMarketplaceSwitch = document.getElementById("customSwitch1");  
const devSwitch = document.getElementById("customSwitch2");
const devSwitchButton = document.getElementById("devSwitch");

optionsBox = async() => {
    
    if (addToMarketplaceValue == 1) {
        addToMarketplaceValue = "0";
        console.log(addToMarketplaceValue);
        createItemPriceField.disabled = 1;
    }
    else if (addToMarketplaceSwitch.checked) {
        
        addToMarketplaceValue = "1";
        console.log(addToMarketplaceValue);
        createItemPriceField.disabled = 0;
        return;
    }
    
}

devsBox = async() => {
    
    if (createNFTValue == 1) {
        createNFTValue = "0";
        console.log(createNFTValue);
     
    }
    else if (devSwitch.checked) {
        
        createNFTValue = "1";
        console.log(createNFTValue);
    
        return;
    }
    
}

init();

