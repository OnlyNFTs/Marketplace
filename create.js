Moralis.start({serverUrl: 'https://uctux2sj3ina.moralisweb3.com:2053/server',
    appId: "Yt8nY74340sEhXEWlVCASjPTq5kcBMg4pzqu7iox" 
    });

//Moralis.initialize("Yt8nY74340sEhXEWlVCASjPTq5kcBMg4pzqu7iox");
//Moralis.serverURL = 'https://uctux2sj3ina.moralisweb3.com:2053/server';

// Fees/Requirements
onftsHoldersMintRequirements = 1000;
mintFee = 1000;
onftsEarlyHoldersNFTAddress = "0x5692ab9e489e9c88d72431ce572c31061bbc7531";
onftsNSFWAddress = "0x67a3c573be9edca87f5097e3a3f8f1111e51a6cd";
onftsAddress = "0x134bbb94fc5a92c854cd22b783ffe9e1c02d761b";

let currentTrade = {};
let currentSelectSide;
let tokens;

// Initialise
init = async () => {
    //initWeb3();
    hideElement(nsfwButton);
    hideElement(connectWalletModal);
    hideElement(userItemsSection);
    hideElement(createItemForm);
    hideElement(loadingMintForm);
    hideElement(musicPlayer);
    hideElement(itemsForSaleUI);
  
    window.addEventListener('load', function() {
        checkWalletProvider();
       });

    await checkURL();
    // $("#ageVer").modal('show');
    await fetchCoinPrice();
    
    await loadItems();
    await initUser();
   
}

getSupportedTokens = async () => {
     const result = await Moralis.Plugins.oneInch.getSupportedTokens({
       chain: 'bsc', // The blockchain you want to use (eth/bsc/polygon)
     });
     console.log(result);

    tokens = {
        "0x134bbb94fc5a92c854cd22b783ffe9e1c02d761b":
        {
        symbol: "ONFTs",
        name: "OnlyNFTs",
        decimals: 18,
        address: "0x134bbb94fc5a92c854cd22b783ffe9e1c02d761b",
        logoURI: 'favicon.ico'
        },
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee":
        {
            symbol: "BNB",
            name: "BNB",
            decimals: 18,
            address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            logoURI: "https://tokens.1inch.io/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c.png"
            },
        "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c":
        {
        symbol: "WBNB",
        name: "Wrapped BNB",
        decimals: 18,
        address: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
        logoURI: "https://tokens.1inch.io/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c.png"
        },
        "0xe9e7cea3dedca5984780bafc599bd69add087d56":
        {
        symbol: "BUSD Token",
        name: "BUSD",
        decimals: 18,
        address: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
        logoURI: "https://tokens.1inch.io/0x4fabb145d64652a948d72533023f6e7a623c7c53.png"
        },
        "0x55d398326f99059ff775485246999027b3197955":
        {
        symbol: "USDT",
        name: "Tether USD",
        decimals: 18,
        address: "0x55d398326f99059ff775485246999027b3197955",
        logoURI: "https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png"
        }
    }
    // tokens = result.tokens;
    let parent = document.getElementById("token_list");
    for (const address in tokens){
        let token = tokens[address];
        let div = document.createElement("div");
        div.setAttribute("data-address", address)
        div.className = "token_row";
        let html = `
        <img class="token_list_img" src="${token.logoURI}">
        <span class="token_list_text">${token.symbol}</span>
        `
        div.innerHTML = html;
        div.onclick = (() => {selectToken(address, parent, div)});
        parent.appendChild(div);        
        //  if(address != "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c" && address != "0x55d398326f99059ff775485246999027b3197955" && address != "0xe9e7cea3dedca5984780bafc599bd69add087d56" && address != "0x134bbb94fc5a92c854cd22b783ffe9e1c02d761b") {
        //       parent.removeChild(div);
        //  }  
      
    }
  }

  function selectToken(address, parent, div) {
    $('#tokenSwapModal').modal('hide');
    // let address = event.target.getAttribute("data-address");
    currentTrade[currentSelectSide] = tokens[address];
    console.log(currentTrade);
    if(address === address) {
        parent.appendChild(div);
    }

    renderInterface()
    getQuote();
  }

  getMarketQuote = async () => {
       var priceTest = new BigNumber(onftsPriceBNB * 5000000 *10);
       console.log(priceTest);
       var pricelol = priceTest.toString();
       console.log(pricelol);
    const quote = await Moralis.Plugins.oneInch.quote({
        
      chain: 'bsc', // The blockchain you want to use (eth/bsc/polygon)
      fromTokenAddress: WBNB_TOKEN_ADDRESS, // The token you want to swap
      toTokenAddress: PAYMENT_TOKEN_ADDRESS, // The token you want to receive
      amount: pricelol,
    });
    console.log(quote);
    console.log(quote.toTokenAmount);
    if (quote.toTokenAmount) {
        const quote2 = await Moralis.Plugins.oneInch.quote({
        chain: 'bsc', // The blockchain you want to use (eth/bsc/polygon)
        fromTokenAddress: PAYMENT_TOKEN_ADDRESS, // The token you want to swap
        toTokenAddress: WBNB_TOKEN_ADDRESS, // The token you want to receive
        amount: 1,
      });
      console.log(quote2);
      
    }
  }



const livecoindata_api_url = 'https://api.livecoinwatch.com/coins/single';

const pancakeswap_api_url = 'https://api.pancakeswap.info/api/v2/tokens/0x134bbb94fc5a92c854cd22b783ffe9e1c02d761b';

// Fetch Coin Price
fetchCoinPrice = async () => {
    const checkPricing = await Moralis.Web3API.token.getTokenPrice({chain:'bsc', address:"0x134bbb94fc5a92c854cd22b783ffe9e1c02d761b"});
    console.log(checkPricing);
     onftsPrice = checkPricing.usdPrice;
    console.log(onftsPrice);
     onftsPriceBNB = checkPricing.nativePrice.value;

    console.log(onftsPriceBNB);
    onftsPriceBN = new BigNumber(onftsPrice);
    onftsPriceBNBBN = new BigNumber(onftsPriceBNB);
    document.getElementById("onftspricebutton").innerText = `$${onftsPriceBN.dp(6)}`;
    return(onftsPrice, onftsPriceBNB);

}

// Big Number Config
BigNumber.config({
    DECIMAL_PLACES: 2,
    ERRORS: true,
    CRYPTO: true,
    MODULO_MODE: 1
});

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
        hideElement(userConnectButton1);
        showElement(userProfileButton);
        showElement(openCreateItemButton);
        showElement(openUserItemsButton);
        showElement(userSubscriptionsButton);
        showElement(userDashboardButton);
        showElement(userLogoutButton);
        showElement(nsfwButton);
        await loadBalances();
        await loadUserItems();
        await loadUserListedItems();
        await openCreateItem();
    }else{
        showElement(userConnectButton);
        showElement(userConnectButton1);
        hideElement(userProfileButton);
        hideElement(openCreateItemButton);
        hideElement(openUserItemsButton);
        hideElement(userSubscriptionsButton);
        hideElement(userDashboardButton);
        hideElement(userLogoutButton);
    }
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
    // await createProfilePage();
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
    const unlocksSection = document.getElementById("unlocksSection");
    const unlocksList = document.getElementById("unlocksList");
    document.getElementById("unlocksButton").onclick = () => showElement(unlocksSection) && hideElement(unlocksList);
    document.getElementById("unlocksCloseButton").onclick = () => showElement(unlocksList) && hideElement(unlocksSection);

    addSecretFileSwitch.disabed = 0;


    if (user){ 
        await checkUserLevel(); 
        console.log(userLevel);
    createItemPriceField.disabled = 1;
    addSecretFileSwitch.disabled = 1;
    changeCreatorAddressSwitch.disabled = 1;
           sendToCustomAddressSwitch.disabled = 1;
        

        if (mintApprovedStatus != true) {
            $('#enterReferrer').modal('show');
        }
        if (userLevel >= 1 && mintApprovedStatus == true){
            document.getElementById("lvl1").classList.add('ti-check');
           
        } if (userLevel == 2){
            document.getElementById("lvl2").classList.add('ti-check');
           
        } else if(userLevel == 3){
            document.getElementById("lvl2").classList.add('ti-check');
            document.getElementById("lvl3").classList.add('ti-check');
            addSecretFileSwitch.disabled = 0;
            changeCreatorAddressSwitch.disabled = 0;
           
        } else if(userLevel == 4){
        document.getElementById("lvl2").classList.add('ti-check');
        document.getElementById("lvl3").classList.add('ti-check');
        document.getElementById("lvlOG").classList.add('ti-check');
            addSecretFileSwitch.disabled = 0;
            changeCreatorAddressSwitch.disabled = 0;
          
        }

        onftsBalanceString = onftsBalanceBN.toLocaleString();
        document.getElementById("createBalance").innerText = onftsBalanceString;
        
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
            
            createItemCreator.disabled = 1;
            if (await adminStatus == true) {

                showElement(devSwitchButton);
                devSwitch.disabled = 0;
    
    
            }
           }
           createItemCreator.value = await user.get('ethAddress');
           createNFTValue = "0";
           addToMarketplaceValue = "0";
           addSecretFileSwitchValue = false;
           changeCreatorAddressSwitchValue = false;
           sendToCustomAddressSwitchValue = false;
           createItemPriceField.disabled = 1;
           secretNftFile.disabled = 1;
           createItemCreator.disabled = 1;
           sendToCustomAddressSwitch.disabled = 1;
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
    } else if (addSecretFileSwitchValue == true) {
        if (secretNftFile.files.length == 0){
        alert("Please select a secret file or disable the option");
        return;
        }
    
    }

    document.getElementById("btnCreateItem").disabled = 1;
    const loadingStatus = document.getElementById("loadingStatus");
    $('#createItem').modal('hide');
    $('#loadingMint').modal('show');
    loadingProgress.style.width = 1 + "%";
    loadingStatus.innerText = "Gathering Information and saving it on IPFS"

    const mimeType = createItemFile.files[0].type;
    console.log(mimeType);
    user = await Moralis.User.current();
    loadingProgress.style.width = 5 + "%";
    const userAddress = user.get('ethAddress');
    const creator = await createItemCreator.value;
    loadingProgress.style.width = 10 + "%";
    const royaltyFee = await createItemRoyaltyFee.value;
    
    const nftFile = new Moralis.File("nftFile",createItemFile.files[0]);
    await nftFile.saveIPFS();
    loadingProgress.style.width = 20 + "%";
    const nftFilePath = nftFile.ipfs();

    if (addSecretFileSwitchValue == true) {
        
        file = secretNftFile.files[0];
        const secretFile = new Moralis.File("secretFile", file);
        await secretFile.save().then(function() {
         secretfileURL = secretFile.url();
        console.log(secretfileURL);
      }, function(error) {
        // The file either could not be read, or could not be saved to Moralis.
      });
    
    }
   
     const metadata = {
        name: createItemNameField.value,
        description: createItemDescriptionField.value,
        image: nftFilePath,
        creator: creator,
        royaltyFee: royaltyFee,
        referrer: userReferrerAddress,
        mime: mimeType,
        secretFile: addSecretFileSwitchValue
    };


//var Item = Moralis.Object.extend("OnlyNFTs");
    // var OnlyNFTs = new Item();
    // OnlyNFTs.set('name', createItemNameField.value);
    // OnlyNFTs.set('description', createItemDescriptionField.value);
    // OnlyNFTs.set('owner_of', creator);
    // OnlyNFTs.set('creator_address', creator);
    // OnlyNFTs.set('royaltyFee', royaltyFee);
    // OnlyNFTs.set('token_address', onftsNSFWAddress);
    // OnlyNFTs.set('token_id', nftId);
    // OnlyNFTs.set('token_uri', nftFileMetadataFilePath);
    // OnlyNFTs.set('token_symbol', symbol);
    // OnlyNFTs.set('token_name', name);
    // OnlyNFTs.set('referrer_address', userReferrerAddress);
    //  OnlyNFTs.save();


    const nftFileMetadataFile = new Moralis.File("metadata.json", {base64 : btoa(JSON.stringify(metadata))});
    await nftFileMetadataFile.saveIPFS();
    loadingProgress.style.width = 40 + "%";
    loadingStatus.innerText = "Please confirm transaction for mintfee approval";
    const nftFileMetadataFilePath = nftFileMetadataFile.ipfs();
    await ensureMintTokenIsApproved(MINT_TOKEN_ADDRESS);
    loadingProgress.style.width = 50 + "%";
    loadingStatus.innerText = "Please confirm transaction to mint your NFT";
   
    //alert(creator);
    switch(createNFTValue){

        case "0":
            //nftId = await mintNft(nftFileMetadataFilePath, royaltyFee, userReferrerAddress);
            // await mintNft(nftFileMetadataFilePath, royaltyFee, userReferrerAddress);
            
             const RoyaltyFee = royaltyFee;
             const user = await Moralis.User.current();
            const userAddress = user.get('ethAddress');
        if (userLevel <= 0 ) {
            tx = await mintNft(nftFileMetadataFilePath, royaltyFee, userReferrerAddress);
        } else if (userLevel >= 2 && addSecretFileSwitchValue == false && changeCreatorAddressSwitchValue == false) {
            tx = await mintNftNoFee(nftFileMetadataFilePath, royaltyFee, userReferrerAddress);
        } else if (userLevel >= 2 && addSecretFileSwitchValue == true && changeCreatorAddressSwitchValue == false) {
            tx = await mintNftSecretFileNoFee(nftFileMetadataFilePath, royaltyFee, userReferrerAddress, secretfileURL);
        } else if (userLevel >= 2 && addSecretFileSwitchValue == true && changeCreatorAddressSwitchValue == true && sendToCustomAddressSwitchValue == false) {
            tx = await mintNftSecretFileCusttomAddressNoFee(nftFileMetadataFilePath, royaltyFee, userReferrerAddress, secretfileURL, creator);
        } else if (userLevel >= 2 && addSecretFileSwitchValue == true && changeCreatorAddressSwitchValue == true && sendToCustomAddressSwitchValue == true) {
            tx = await mintNftSecretFileCusttomAddressSendNoFee(nftFileMetadataFilePath, royaltyFee, userReferrerAddress, secretfileURL, creator);
        } else if (userLevel >= 2 && addSecretFileSwitchValue == false && changeCreatorAddressSwitchValue == true && sendToCustomAddressSwitchValue == false) {
            tx = await mintNftCusttomAddressNoFee(nftFileMetadataFilePath, royaltyFee, userReferrerAddress, creator);
        } else if (userLevel >= 2 && addSecretFileSwitchValue == false && changeCreatorAddressSwitchValue == true && sendToCustomAddressSwitchValue == true) {
            tx = await mintNftCusttomAddressSendNoFee(nftFileMetadataFilePath, royaltyFee, userReferrerAddress, creator);
        }
             loadingProgress.style.width = 60 + "%";
                loadingStatus.innerText = "Request Sent - Waiting for blockchain";

             await tx.on("transactionHash", (hash) => { 
                 console.log("hash" + hash); 
                 loadingProgress.style.width = 70 + "%";
                loadingStatus.innerText = "Hash Confirmed - Waiting for blockchain";
                })
                await tx.on("receipt", (receipt) => { 
                     console.log("receipt" + receipt); 
                     loadingProgress.style.width = 80 + "%";
                          loadingStatus.innerText = "Finalizing - Waiting for blockchain";
                    })
                  .on("confirmation", (confirmationNumber, receipt) => {
                          console.log(receipt);
                          
                           loadingProgress.style.width = 100 + "%";
                           loadingStatus.innerText = "NFT Successfully minted!";
                          
                          return;
                      })
                      .on("error", (error) => { 
                          alert(error.message);
                        $('#loadingMint').modal('hide');
                       
                        
                     });
                     
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
            if (walletProvider == 'walletconnect'){
                await marketplaceContract.methods.addItemToMarket(nftId, TOKEN_CONTRACT_ADDRESS, askingPriceBN, creator, royaltyFee, userReferrerAddress).send({provider: walletProvider, chainId: 56, from: user.get('ethAddress')});
            } else {
            await marketplaceContract.methods.addItemToMarket(nftId, TOKEN_CONTRACT_ADDRESS, askingPriceBN, creator, royaltyFee, userReferrerAddress).send({from: user.get('ethAddress')});
            }
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
    userAddress = user.get('ethAddress');
    const txOptions = {
        contractAddress: NFT_CONTRACT_ADDRESS,
            functionName: "createItem",
            abi: NFTContractABI,
        params: {
            uri: metadataUrl,
            creator: userAddress,
            royaltyFee: RoyaltyFee,
            referrer: referrerAddress
          },
          awaitReceipt: false
        };

        return tx = await Moralis.executeFunction(txOptions);

}

mintNftNoFee = async (metadataUrl, RoyaltyFee, referrerAddress) => {
    userAddress = user.get('ethAddress');
    const txOptions = {
        contractAddress: NFT_CONTRACT_ADDRESS,
            functionName: "createItemNoFee",
            abi: NFTContractABI,
        params: {
            uri: metadataUrl,
            creator: userAddress,
            royaltyFee: RoyaltyFee,
            referrer: referrerAddress
          },
          awaitReceipt: false
        };

        return tx = await Moralis.executeFunction(txOptions);

}

mintNftCusttomAddressNoFee = async (metadataUrl, RoyaltyFee, referrerAddress, creator) => {

    const txOptions = {
        contractAddress: NFT_CONTRACT_ADDRESS,
            functionName: "createItemCustomAddressNoFee",
            abi: NFTContractABI,
        params: {
            uri: metadataUrl,
            creator: creator,
            royaltyFee: RoyaltyFee,
            referrer: referrerAddress
          },
          awaitReceipt: false
        };

        return tx = await Moralis.executeFunction(txOptions);

}


mintNftCusttomAddressSendNoFee = async (metadataUrl, RoyaltyFee, referrerAddress, creator) => {

    const txOptions = {
        contractAddress: NFT_CONTRACT_ADDRESS,
            functionName: "createItemCustomAddressSendNoFee",
            abi: NFTContractABI,
        params: {
            uri: metadataUrl,
            creator: creator,
            royaltyFee: RoyaltyFee,
            referrer: referrerAddress
          },
          awaitReceipt: false
        };

        return tx = await Moralis.executeFunction(txOptions);

}


mintNftSecretFileNoFee = async (metadataUrl, RoyaltyFee, referrerAddress, secretfileURL) => {
    userAddress = user.get('ethAddress');
    const txOptions = {
        contractAddress: NFT_CONTRACT_ADDRESS,
            functionName: "createSecretItemNoFee",
            abi: NFTContractABI,
        params: {
            uri: metadataUrl,
            creator: userAddress,
            royaltyFee: RoyaltyFee,
            referrer: referrerAddress,
            secretUri: secretfileURL
          },
          awaitReceipt: false
        };

        return tx = await Moralis.executeFunction(txOptions);

}

mintNftSecretFileCusttomAddressNoFee = async (metadataUrl, RoyaltyFee, referrerAddress, secretfileURL, creator) => {

    const txOptions = {
        contractAddress: NFT_CONTRACT_ADDRESS,
            functionName: "createSecretItemCustomAddressNoFee",
            abi: NFTContractABI,
        params: {
            uri: metadataUrl,
            creator: creator,
            royaltyFee: RoyaltyFee,
            referrer: referrerAddress,
            secretUri: secretfileURL
          },
          awaitReceipt: false
        };

        return tx = await Moralis.executeFunction(txOptions);

}

mintNftSecretFileCusttomAddressSendNoFee = async (metadataUrl, RoyaltyFee, referrerAddress, secretfileURL, creator) => {

    const txOptions = {
        contractAddress: NFT_CONTRACT_ADDRESS,
            functionName: "createSecretItemCustomAddressSendNoFee",
            abi: NFTContractABI,
        params: {
            uri: metadataUrl,
            creator: creator,
            royaltyFee: RoyaltyFee,
            referrer: referrerAddress,
            secretUri: secretfileURL
          },
          awaitReceipt: false
        };

        return tx = await Moralis.executeFunction(txOptions);

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
    loadUserListedItems();
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
        if (user)   { 
            if (urlProfile) { 
                urlProfileLC = urlProfile.toLowerCase();
                if (urlProfileLC != item.creator) {
                    const userItemListing = document.getElementById(`user-item-${item.tokenObjectId}`);
                    if (userItemListing) userItemListing.parentNode.removeChild(userItemListing);
                    return;
                }
            }   
        }  if (urlProfile) { 
            urlProfileLC = urlProfile.toLowerCase();
            if (urlProfileLC != item.creator) {
                const userItemListing = document.getElementById(`user-item-${item.tokenObjectId}`);
                if (userItemListing) userItemListing.parentNode.removeChild(userItemListing);
                return;
            }
        }
        getAndRenderItemData(item, renderItem);
    });
}


// Load Listed User Items
loadUserListedItems = async () => {
    const items = await Moralis.Cloud.run("getItems");
    user = await Moralis.User.current();
    items.forEach(item => {
        if (user)   { 
                if (user.attributes.accounts != item.ownerOf) {
                    console.log(item.ownerOf);
                    console.log("work");
                    const userItemListing = document.getElementById(`user-item-${item.tokenObjectId}`);
                    if (userItemListing) userItemListing.parentNode.removeChild(userItemListing);
                    return;
                }
                getAndRenderItemData(item, renderUserListedItems);
            }   
            
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
    userItem.getElementsByTagName("input")[0].disabled = await item.askingPrice > 0;
    //userItem.getElementsByTagName("button")[0].disabled = 1;
    userItem.getElementsByTagName("button")[0].disabled = await item.askingPrice > 0;
    // if (item.askingPrice == null) {hideElement(userItem.getElementsByTagName("button")[1]);};
    // if (item.askingPrice != null) {hideElement(userItem.getElementsByTagName("button")[2]);};

    userItem.getElementsByTagName("button")[1].disabled = await item.askingPrice == null;
    userItem.getElementsByTagName("button")[2].disabled = await item.askingPrice > 0;
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

// Render User Items
renderUserListedItems = async (item) => {
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
    userItem.getElementsByTagName("input")[0].disabled = await item.askingPrice > 0;
    //userItem.getElementsByTagName("button")[0].disabled = 1;
    userItem.getElementsByTagName("button")[0].disabled = await item.askingPrice > 0;
    // if (item.askingPrice == null) {hideElement(userItem.getElementsByTagName("button")[1]);};
    // if (item.askingPrice != null) {hideElement(userItem.getElementsByTagName("button")[2]);};

    userItem.getElementsByTagName("button")[1].disabled = await item.askingPrice == null;
    userItem.getElementsByTagName("button")[2].disabled = await item.askingPrice > 0;
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
    
    userItemsListed.appendChild(userItem);
}

 // Render Marketplace Item
 renderItem = (item) => {
     const itemForSale = marketplaceItemTemplate.cloneNode(true);
     itemForSale.getElementsByTagName("img")[0].src = item.image;
     itemForSale.getElementsByTagName("img")[0].alt = item.name;
     if (item.sellerAvatar){
                itemForSale.getElementsByTagName("img")[1].src = item.sellerAvatar.url();
                itemForSale.getElementsByTagName("img")[1].alt = item.sellerUsername;
             
        }

     hideElement(itemForSale.getElementsByTagName("video")[0]);
    item.creator 
     itemForSale.getElementsByTagName("h2")[0].innerText = item.sellerUsername;
     itemForSale.getElementsByTagName("h3")[0].innerText = item.name;
     itemForSale.getElementsByTagName("p")[0].innerText = item.description;

    
     const itemaskingPriceBN = new BigNumber(item.askingPrice).div(1000000000).div(1000000000);
     const convertedToUSDPrice = new BigNumber(onftsPrice).times(itemaskingPriceBN);
     itemForSale.getElementsByTagName("button")[0].innerText = `${itemaskingPriceBN} ONFTs`;
     itemForSale.getElementsByTagName("button")[1].innerText = `$${convertedToUSDPrice.dp(2)} USD`;
     itemForSale.getElementsByTagName("button")[0].onclick = async () =>  buyItem(item);
     itemForSale.getElementsByTagName("button")[2].onclick = () => {
             var copyText = "https://marketplace.onlynfts.online/?nft=" + item.tokenAddress + "&id=" + item.tokenId;
            //  copyText.select();
            //  copyText.setSelectionRange(0, 99999);
             navigator.clipboard.writeText(copyText);
        
             notificationHeader.innerText = "Copied!";
         notificationBody.innerText = "Copied: " + copyText;
        //notificationTime.innerText = Math.round(Date.now()/1000)+60*20;
        $('.toast').toast('show');
            };

            itemForSale.getElementsByTagName("button")[1].onclick = () => {  
                $('.toast').toast('show');
            };  

    itemForSale.getElementsByTagName("h2")[0].onclick = () => {  
        window.open("https://onlynfts.online/profile?p=" + item.creatorUsername).focus();
    };    

    itemForSale.getElementsByTagName("img")[1].onclick = () => {  
        window.open("https://onlynfts.online/profile?p=" + item.creatorUsername).focus();
    };  
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
    console.log(walletProvider);
    const contract = new web3.eth.Contract(paymentTokenContractAbi, PAYMENT_TOKEN_ADDRESS);
    const approvedAddress = await contract.methods.allowance(userAddress, MARKETPLACE_CONTRACT_ADDRESS).call({provider: walletProvider, from: userAddress});
    console.log(approvedAddress);
    if (approvedAddress < amount){
        await contract.methods.approve(MARKETPLACE_CONTRACT_ADDRESS, amount).send({provider: walletProvider, from: userAddress});
    }
}

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

createProfilePage = async () => {
    var Item = Moralis.Object.extend("ProfilePages");
    var profilePages = new Item();
    profilePages.set('username', createItemNameField.value);
    profilePages.set('bio', createItemDescriptionField.value);
    profilePages.set('avatar', createItemFile.files[0]);
    profilePages.set('link', 'https://onlynfts.online');
    profilePages.set('creator_address', user.get('ethAddress'));
    profilePages.set('referrer_address', userReferrerAddress);
    
    
    await profilePages.save();

}


// Buy Item
buyItem = async (item) => {
    user = await Moralis.User.current();
    if (!user){
        login();
        return;
    }
    console.log(walletProvider);
    await ensurePaymentTokenIsApproved(PAYMENT_TOKEN_ADDRESS, item.askingPrice); 
    await marketplaceContract.methods.buyItem(item.uid).send({provider: walletProvider, chainId: 56, from: user.get('ethAddress')});
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
    //     const BscTokenBalance = Moralis.Object.extend("BscTokenBalance");
    //     const query = new Moralis.Query(BscTokenBalance);
    //     query.equalTo("token_address", onftsAddress);
    //     query.equalTo("address", user.get('ethAddress'));
    //     const results = await query.find();
    //     onftsBalanceBN = 0;
    // // Do something with the returned Moralis.Object values
    // for (let i = 0; i < results.length; i++) {
    //     const object = results[i];
    //     //alert(object.id + ' - ' + object.get('balance'));
    //     const onftsBalance1 = object.get('balance');
    //     onftsBalanceBN = new BigNumber(onftsBalance1).div(1000000000).div(1000000000);
    //     onftsBalanceUSDBN = new BigNumber(onftsBalanceBN).times(onftsPrice);
    //     console.log(onftsBalance1);
     
    // };
    
    // query.equalTo("token_address", onftsAddress);
    // query.equalTo("address", user.get('ethAddress'));
    // const results1 = await query.find();
    // //alert("Successfully retrieved " + results1.length + " balance.");
    // // Do something with the returned Moralis.Object values
    // for (let i = 0; i < results1.length; i++) {
    // const object1 = results1[i];
    // //alert(object.id + ' - ' + object.get('balance'));
    // const mintTokenBalance = object1.get('balance');
    // mintTokenBalanceBN = new BigNumber(mintTokenBalance).div(1000000000).div(1000000000);
    // console.log(mintTokenBalance);
    // }; 
    
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
    
    
    
    const options = { chain: "bsc", address: userAddress };
    const balance = await Moralis.Web3API.account.getTokenBalances(options);
    console.log(balance);
    if (balance.length != 0) {
        const tokenAddress =  "0x134bbb94fc5a92c854cd22b783ffe9e1c02d761b"; // You can specify for example: tokenAddress, name or symbol
        const tokenBalance = balance.find((token) => token.token_address === tokenAddress);
        console.log(tokenBalance.balance);
        onftsBalance = tokenBalance.balance
        onftsBalanceBN = new BigNumber(onftsBalance).div(1000000000).div(1000000000);
        onftsBalanceUSDBN = new BigNumber(onftsBalanceBN).times(onftsPrice);
    } else {
        onftsBalance = 0
        onftsBalanceBN = new BigNumber(onftsBalance).div(1000000000).div(1000000000);
        onftsBalanceUSDBN = new BigNumber(onftsBalanceBN).times(onftsPrice);
        console.log(onftsBalance);
    }}
    }

//Handle User Levels
checkUserLevel = async () => {
    const level1req = 100;
   
    if (onftsBalanceUSDBN > 100 < 500 && earlyHoldersBalance == null) {
    userLevel = 2;
    } else if (onftsBalanceUSDBN > 500 && earlyHoldersBalance == null) {
    userLevel = 3;
    } else if (earlyHoldersBalance !== null) {
        userLevel = 4; 
    } else {
        userLevel = 1;
    }
}

//Buy Crypto
buyCrypto = async () => {
    if (user) {
        const userAddress = user.get('ethAddress');
        
        let response = await Moralis.Plugins.fiat.buy({ coin: "BNB_BEP20", receiver: userAddress,}, {disableTriggers: true});
        console.log(response.data);
        $('#buyCryptoModal').modal('show');
        document.getElementById('buyCryptoModalInner').style.display = 'block';
    document.getElementById('buyCryptoModalInner').src = response.data;

     } else {
        let response = await Moralis.Plugins.fiat.buy({ coin: "BNB_BEP20", receiver: '',}, {disableTriggers: true});
        console.log(respone);
        $('#buyCryptoModal').modal('show');
         document.getElementById('buyCryptoModalInner').style.display = 'block';
    document.getElementById('buyCryptoModalInner').src = response.data;
     }
 }



// Fetch Coin Price
fetchLiveCoinData = async () => {
    var currentTime = Date.now();
    console.log(currentTime);
    var yesterdayTime = currentTime - 86400000 * 7;
console.log(currentTime);
console.log(yesterdayTime);
    const response = await fetch(new Request('https://api.livecoinwatch.com/coins/single/history'), {
        method: 'POST',
        headers: new Headers({
          'content-type': 'application/json',
          'x-api-key': '7c49a6ef-ab71-4f3b-8a07-6ae9220b2bd3'
        }),
        body: JSON.stringify({
            currency: 'USD',
            code: 'ONFTS',
            start: yesterdayTime,
            end: currentTime,
            meta: true
          })
        })
    .then((response) => {
        
    
        return response.json();
    })

    mcapHistoryFirst = response.history[0].rate;
    mcapHistoryLast = response.history[4].rate;

    volumeHistoryFirst = response.history[0].volume;
    volumeHistoryLast = response.history[4].volume;
    volumeHistoryLastText = volumeHistoryLast.toLocaleString();


    volumePercentageChange = volumeHistoryLast / volumeHistoryFirst * 100 - 100;
    volumePercentageChangeBool = Math.sign(volumePercentageChange);
    volumePercentageChangeText = volumePercentageChange.toLocaleString();

    mcapPercentageChange = mcapHistoryLast / mcapHistoryFirst * 100 - 100;
    mcapPercentageChangeBool = Math.sign(mcapPercentageChange);
    mcapPercentageChangeText = mcapPercentageChange.toLocaleString();

    console.log(mcapPercentageChangeText);
    console.log(mcapPercentageChangeBool);
    
    document.getElementById("onftsDailyVolumeInfo").innerText = "$" + volumeHistoryLastText ;
    document.getElementById("onftsDailyVolumeInfoTrend").innerText = " " + volumePercentageChangeText + "% (24hrs)" ;
    if (volumePercentageChangeBool === 1) {
        document.getElementById("onftsDailyVolumeInfoTrend").classList.add('positive-number', 'fas', 'fa-angle-double-up');
    } else {

    document.getElementById("onftsDailyVolumeInfoTrend").classList.add('negative-number', 'fas', 'fa-angle-double-down');
    }



    document.getElementById("onftsMarketcapInfoTrend").innerText = " " + mcapPercentageChangeText + "% (24hrs)" ;
    if (mcapPercentageChangeBool === 1) {
        document.getElementById("onftsMarketcapInfoTrend").classList.add('positive-number', 'fas', 'fa-angle-double-up');
    } else {

    document.getElementById("onftsMarketcapInfoTrend").classList.add('negative-number', 'fas', 'fa-angle-double-down');
    }
    if (user){

    
    if (onftsBalanceBN > 1) {
        var onftsBalanceNumber = Number(onftsBalanceBN);
        var onftsBalanceText = onftsBalanceNumber.toLocaleString();
        console.log(onftsBalanceText);
        document.getElementById("onftsBalanceInfo").innerText = onftsBalanceText + " $ONFTs";
    }
    }
}

function handleTokenSwapModal(side) {
    currentSelectSide = side;
    $('#tokenSwapModal').modal('show');
}

async function renderInterface() {
    if(currentTrade.from){
    document.getElementById("from_token_img").src = currentTrade.from.logoURI;
    document.getElementById("from_token_txt").innerHTML = currentTrade.from.symbol;
    if (user) {await getQuoteBalancesFrom()};
    }

    if(currentTrade.to){
    document.getElementById("to_token_img").src = currentTrade.to.logoURI;
    document.getElementById("to_token_txt").innerHTML = currentTrade.to.symbol;
    if (user) {await getQuoteBalancesTo()};
    }
}

async function getQuoteBalancesFrom() {
    console.log(currentTrade.from.address);
    if (currentTrade.from.symbol !== "BNB") {
    const BscTokenBalance = Moralis.Object.extend("BscTokenBalance");
    const query = new Moralis.Query(BscTokenBalance);
    query.equalTo("token_address", currentTrade.from.address);
    query.equalTo("address", user.get('ethAddress'));
    const results = await query.find();
    console.log(results);
if (results.length > 0) {
for (let i = 0; i < results.length; i++) {
    const object = results[i];
    //alert(object.id + ' - ' + object.get('balance'));
    const currentTradeFromBalance = new Number (object.get('balance')) / 10**currentTrade.from.decimals;    
    console.log(currentTradeFromBalance);
    document.getElementById("from_balance").innerText = "Bal: " + currentTradeFromBalance.toLocaleString();
        };
    } else {
        document.getElementById("from_balance").innerText = "Bal: " + 0;

    };
    } else {
        const BscBalance = Moralis.Object.extend("BscBalance");
        const query = new Moralis.Query(BscBalance);
        query.equalTo("address", user.get('ethAddress'));
        const results = await query.find();
        console.log(results);
        if (results.length > 0) {
            for (let i = 0; i < results.length; i++) {
            const object = results[i];
            //alert(object.id + ' - ' + object.get('balance'));
            const currentTradeFromBalance = new Number (object.get('balance')) / 10**currentTrade.from.decimals;    
            console.log(currentTradeFromBalance);
            document.getElementById("from_balance").innerText = "Bal: " +  currentTradeFromBalance.toLocaleString();
            };
        } else {
            document.getElementById("from_balance").innerText = "Bal: " +  0;
        }
    };
};

async function getQuoteBalancesTo() {
    console.log(currentTrade.to.address);
    if (currentTrade.to.symbol !== "BNB") {
        const BscTokenBalance = Moralis.Object.extend("BscTokenBalance");
        const query = new Moralis.Query(BscTokenBalance);
        query.equalTo("token_address", currentTrade.to.address);
        query.equalTo("address", user.get('ethAddress'));
        const results = await query.find();
        console.log(results);
        if (results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                const object = results[i];
                //alert(object.id + ' - ' + object.get('balance'));
                const currentTradeToBalance = new Number (object.get('balance')) / 10**currentTrade.to.decimals;    
                console.log(currentTradeToBalance);
                document.getElementById("to_balance").innerText = "Bal: " +  currentTradeToBalance.toLocaleString();
            };
        } else {
            document.getElementById("to_balance").innerText = "Bal: " +  0;
        };
    } else {
        const BscBalance = Moralis.Object.extend("BscBalance");
        const query = new Moralis.Query(BscBalance);
        query.equalTo("address", user.get('ethAddress'));
        const results = await query.find();
        console.log(results);
        if (results.length > 0) {
        for (let i = 0; i < results.length; i++) {
        const object = results[i];
            //alert(object.id + ' - ' + object.get('balance'));
            const currentTradeToBalance = new Number (object.get('balance')) / 10**currentTrade.to.decimals;    
            console.log(currentTradeToBalance);
            document.getElementById("to_balance").innerText = "Bal: " +  currentTradeToBalance.toLocaleString();
            };
        } else {
            document.getElementById("to_balance").innerText = "Bal: " +  0;
        };
    };
};

async function getQuote() {
    if(!currentTrade.from || !currentTrade.to || !document.getElementById("from_amount").value) return;
    
    var fromAmountValue = document.getElementById("from_amount").value;
    let amountBN = Number (fromAmountValue * 10**currentTrade.from.decimals);
    let amount = Moralis.Units.ETH(fromAmountValue, currentTrade.from.decimals);
    //let amount = Number (Moralis.Units.ETH(fromAmountValue));
    console.log(amountBN);
  console.log(amount);
    const quote = await Moralis.Plugins.oneInch.quote({
       chain: 'bsc',
       fromTokenAddress: currentTrade.from.address,
       toTokenAddress: currentTrade.to.address,
       amount: amount,
   })
   console.log(quote);
   document.getElementById("to_amount").value = quote.toTokenAmount / 10**currentTrade.to.decimals;
   document.getElementById("gas_amount").innerHTML = quote.estimatedGas;

}

async function trySwap() {
    alert("tryingswap");
    let address = await user.get('ethAddress');
    var fromAmountValue = document.getElementById("from_amount").value;
    let amount = Moralis.Units.ETH(fromAmountValue, currentTrade.from.decimals);

    //let amount = Number (fromAmountValue * 10**currentTrade.from.decimals);
    if (currentTrade.from.symbol !== "BNB") {
        const allowance = await Moralis.Plugins.oneInch.hasAllowance({
            chain: 'bsc',
            fromTokenAddress: currentTrade.from.address,
            fromAddress: address,
            amount: amount,
        })
        console.log(allowance);
        if (!allowance){
            await Moralis.Plugins.oneInch.approve({
                chain: 'bsc',
                tokenAddress: currentTrade.from.address,
                fromAddress: address,
                amount: amount,
            });
        }
    }
    let receipt = await doSwap(address, amount);
    console.log(receipt);
}

async function doSwap(userAddress, amount) {
    return Moralis.Plugins.oneInch.swap({
        chain: 'bsc',
        fromTokenAddress: currentTrade.from.address,
        toTokenAddress: currentTrade.to.address,
        amount: amount,
        fromAddress: userAddress,
        slippage: 8,
    })

}

// Hide Elements
hideElement = (element) => element.style.display = "none";
showElement = (element) => element.style.display = "block";

// Navbar
const userConnectButton = document.getElementById("btnConnect");
userConnectButton.onclick = () => $('#connectWalletModal').modal('show');
const userConnectButton1 = document.getElementById("btnConnect1");
userConnectButton1.onclick = () => $('#connectWalletModal').modal('show')
const userProfileButton = document.getElementById("btnUserInfo");
userProfileButton.onclick = openUserInfo;
const openCreateItemButton = document.getElementById("btnOpenCreateItem");
// openCreateItemButton.onclick = handleOpenCreateItem;
const userSubscriptionsButton = document.getElementById("btnUserSubscriptions");
const userDashboardButton = document.getElementById("btnUserDashboard");
const userLogoutButton = document.getElementById("btnLogout1");
userLogoutButton.onclick = logout;
const buyCryptoButton = document.getElementById("buyCryptoButton");
buyCryptoButton.onclick = buyCrypto;


//document.getElementById("from_amount").onkeydown = getQuote; //Keystroke
//document.getElementById("from_amount").onpaste = getQuote; //IE, FF3
//document.getElementById("from_amount").oninput = getQuote; //FF,Opera,Chrome,Safari



// Notification
const notificationHeader = document.getElementById("notificationHeader")
const notificationBody = document.getElementById("notificationBody")
const notificationTime = document.getElementById("notificationTime")

// Age Ver
const ageVer = document.getElementById("ageVer");

// User profile
const userInfo = document.getElementById("userInfo");
const userUsernameField = document.getElementById("txtUsername");
const userEmailField = document.getElementById("txtEmail");
const userAvatarImg = document.getElementById("imgAvatar");
const userAvatarFile = document.getElementById("fileAvatar");
const onftsBalanceButton = document.getElementById("onftsBalanceButton");
const editProfilePageButton = document.getElementById("editProfilePageButton");
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

// Music Player
const musicPlayer = document.getElementById("musicPlayer")
document.getElementById("secretbutton").onclick = () => $('#musicPlayer').modal('show');

// Connect Wallet
const connectWalletModal = document.getElementById("connectWalletModal");
document.getElementById("mmWallet").onclick = () => login();
document.getElementById("tWallet").onclick = () => loginTW();
document.getElementById("wcWallet").onclick = () => loginWC();

// User items
const userItemsSection = document.getElementById("userItems");
const userItems = document.getElementById("userItemsList");
const userItemsListed = document.getElementById("userItemsListedList");
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
const addSecretFileSwitch = document.getElementById("customSwitch3"); 
const devSwitch = document.getElementById("customSwitch2");
const devSwitchButton = document.getElementById("devSwitch");
const sendToCustomAddressSwitch = document.getElementById("customSwitch5"); 
const changeCreatorAddressSwitch = document.getElementById("customSwitch4"); 
const itemsForSaleList = document.getElementById("itemsForSale");
const itemsForSaleUI = document.getElementById("itemsForSaleUI");

//NSFW 
const nsfwButton = document.getElementById("nsfwButton");

// Mint NFT Options
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

secretFileEnableSwitch = async() => {
    
    if (addSecretFileSwitchValue == true) {
        addSecretFileSwitchValue = false;
        console.log(addSecretFileSwitchValue);
        secretNftFile.disabled = 1;
    }
    else if (addSecretFileSwitch.checked) {
        
        addSecretFileSwitchValue = true;
        console.log(addSecretFileSwitchValue);
        secretNftFile.disabled = 0;
        return;
    }
}

changeCreatorAddressEnableSwitch = async() => {
    
    if (changeCreatorAddressSwitchValue == true) {
        changeCreatorAddressSwitchValue = false;
        console.log(changeCreatorAddressSwitchValue);
        createItemCreator.disabled = 1;
        sendToCustomAddressSwitch.disabled = 1;
    }
    else if (changeCreatorAddressSwitch.checked) {
        
        changeCreatorAddressSwitchValue = true;
        console.log(changeCreatorAddressSwitchValue);
        createItemCreator.disabled = 0;
        sendToCustomAddressSwitch.disabled = 0;
        
        return;
    }
}

sendToCustomAddressEnableSwitch = async() => {
    
    if (sendToCustomAddressSwitchValue == true) {
        sendToCustomAddressSwitchValue = false;
        console.log(sendToCustomAddressSwitchValue);
      return;
    }
    else if (sendToCustomAddressSwitch.checked) {
        
        sendToCustomAddressSwitchValue = true;
        console.log(sendToCustomAddressSwitchValue);
        
        
        return;
    }
}

//Mint NFT Dev Options
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

