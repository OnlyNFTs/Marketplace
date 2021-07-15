Moralis.initialize("kjD0iZDa6qnqTsIN7NNyt2zMcDIPkf8DuELBhUxt");
Moralis.serverURL = 'https://2xpqa1mlwfdh.usemoralis.com:2053/server';

const TOKEN_CONTRACT_ADDRESS = "0x019001B30ed26172581F1e5F775B6CE710F02204";
const MARKETPLACE_CONTRACT_ADDRESS = "0x650F4180144fe5a812969842F561b8D219e7634E";
const PAYMENT_TOKEN_ADDRESS = "0xF9f612F44351753C9F600cbFf08e0dd0F726DB6B";



init = async () => {
    hideElement(userItemsSection);
    window.web3 = await Moralis.Web3.enable();
    window.tokenContract = new web3.eth.Contract(tokenContractAbi, TOKEN_CONTRACT_ADDRESS);
    window.marketplaceContract = new web3.eth.Contract(marketplaceContractAbi, MARKETPLACE_CONTRACT_ADDRESS);
    window.paymentTokenContract = new web3.eth.Contract(paymentTokenContractAbi, PAYMENT_TOKEN_ADDRESS);
    initUser();
    loadItems();

    const soldItemsQuery = new Moralis.Query('SoldItemsRoylt');
    const soldItemsSubscription = await soldItemsQuery.subscribe();
    soldItemsSubscription.on("create", onItemSold);

    const itemsAddedQuery = new Moralis.Query('ItemsForSaleRoylt');
    const itemsAddedSubscription = await itemsAddedQuery.subscribe();
    itemsAddedSubscription.on("create", onItemAdded);
}

BigNumber.config({
    DECIMAL_PLACES: 2,
    ERRORS: true,
    CRYPTO: true,
    MODULO_MODE: 1
});

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

initUser = async () => {
    if (await Moralis.User.current()){
        hideElement(userConnectButton);
        showElement(userProfileButton);
        showElement(openCreateItemButton);
        showElement(openUserItemsButton);
        loadUserItems();
    }else{
        showElement(userConnectButton);
        hideElement(userProfileButton);
        hideElement(openCreateItemButton);
        hideElement(openUserItemsButton);
    }
}

login = async () => {
    try {
        await Moralis.Web3.authenticate();
        alert("Loged in Successfully!");
        initUser();
    } catch (error) {
        alert(error)
    }
}

logout = async () => {
    await Moralis.User.logOut();
    hideElement(userInfo);
    alert("Logged Out Successfully!");
    initUser();
}

openUserInfo = async () => {
    user = await Moralis.User.current();
    // const bnbBalance = await Moralis.Web3.getERC20({chain: 'bsc', symbol: 'ONFTs'});
    // console.log (bnbBalance)

    if (user){    
        const email = user.get('email');
        if(email){
            userEmailField.value = email;
        }else{
            userEmailField.value = "";
        }
        
        userUsernameField.value = user.get('username');
        
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

createItem = async () => {

    if (createItemFile.files.length == 0){
        alert("Please select a file!");
        return;
    } else if (createItemNameField.value.length == 0){
        alert("Please give the item a name!");
        return;
    }

    user = await Moralis.User.current();
    const userAddress = user.get('ethAddress');

    document.getElementById("btnCreateItem").disabled = 1;
    const nftFile = new Moralis.File("nftFile",createItemFile.files[0]);
    await nftFile.saveIPFS();

    const nftFilePath = nftFile.ipfs();

    const metadata = {
        name: createItemNameField.value,
        description: createItemDescriptionField.value,
        image: nftFilePath,
        creator: userAddress,
    };

    const nftFileMetadataFile = new Moralis.File("metadata.json", {base64 : btoa(JSON.stringify(metadata))});
    await nftFileMetadataFile.saveIPFS();

    const nftFileMetadataFilePath = nftFileMetadataFile.ipfs();

    const nftId = await mintNft(nftFileMetadataFilePath);

    

    alert("Nft Minted!");
    hideElement(createItemForm);

    switch(createItemStatusField.value){
        case "0":
            return;
        case "1":
            await ensureMarketplaceIsApproved(nftId, TOKEN_CONTRACT_ADDRESS);
            await marketplaceContract.methods.addItemToMarket(nftId, TOKEN_CONTRACT_ADDRESS, createItemPriceField.value).send({from: userAddress});
            alert("Added to marketplace!");
            break;
        case "2":
            alert("Not yet supported!");
            return;
    }

    
}

mintNft = async (metadataUrl) => {
    const receipt = await tokenContract.methods.createItem(metadataUrl).send({from: ethereum.selectedAddress});
    console.log(receipt);
    return receipt.events.Transfer.returnValues.tokenId;
}

openUserItems = async () => {
    user = await Moralis.User.current();
    if (user){    
        $('#userItems').modal('show');
    }else{
        login();
    }
}

loadUserItems = async () => {
    const ownedItems = await Moralis.Cloud.run("getUserItems");
    ownedItems.forEach(item => {
        const userItemListing = document.getElementById(`user-item-${item.tokenObjectId}`);
        if (userItemListing) return;
        getAndRenderItemData(item, renderUserItem);
    });
}

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


initTemplate = (id) => {
    const template = document.getElementById(id);
    template.id = "";
    template.parentNode.removeChild(template);
    return template;
}

renderUserItem = async (item) => {
    const userItemListing = document.getElementById(`user-item-${item.tokenObjectId}`);
    if (userItemListing) return;

    const userItem = userItemTemplate.cloneNode(true);
    userItem.getElementsByTagName("img")[0].src = item.image;
    userItem.getElementsByTagName("img")[0].alt = item.name;
    userItem.getElementsByTagName("h5")[0].innerText = item.name;
    userItem.getElementsByTagName("p")[0].innerText = item.description; 
   // userItem.getElementsByTagName("p")[0].innerText = item.creator;    

    userItem.getElementsByTagName("input")[0].value = item.askingPrice ?? 1;
    userItem.getElementsByTagName("input")[0].disabled = item.askingPrice > 0;
    userItem.getElementsByTagName("button")[0].disabled = item.askingPrice > 0;
    userItem.getElementsByTagName("button")[0].onclick = async () => {
        user = await Moralis.User.current();
        if (!user){
            login();
            return;
        }
         await ensureMarketplaceIsApproved(item.tokenId, item.tokenAddress);
        await userItem.getElementsByTagName("input")[0].value;
        let test1 = userItem.getElementsByTagName("input")[0].value;
        let askingPriceBN = new BigNumber(test1).times(1000000000).times(1000000000);
        let creator = item.creator;
        // let royaltyPriceBN = new Bignumber(askingPriceBN).div(10);
        // let finalPriceBN = new Bignumber(askingPriceBN).sub(royaltyPriceBN);
        let royaltyFee = 10;
        // //await web3.fromWei(userItem.getElementsByTagName("input")[0].value.toString(tests1), "ether")
     await marketplaceContract.methods.addItemToMarket(item.tokenId, item.tokenAddress, askingPriceBN, creator, royaltyFee).send({from: user.get('ethAddress')});
     alert("NFT Added To Marketplace!");
     return;
    };

    userItem.id = `user-item-${item.tokenObjectId}`
    userItems.appendChild(userItem);
}

renderItem = (item) => {
    const itemForSale = marketplaceItemTemplate.cloneNode(true);
    if (item.sellerAvatar){
        itemForSale.getElementsByTagName("img")[0].src = item.sellerAvatar.url();
        itemForSale.getElementsByTagName("img")[0].alt = item.sellerUsername;
     
    }

    itemForSale.getElementsByTagName("img")[1].src = item.image;
    itemForSale.getElementsByTagName("img")[1].alt = item.name;
    itemForSale.getElementsByTagName("h5")[0].innerText = item.name;
    itemForSale.getElementsByTagName("p")[0].innerText = item.description;
    
    let itemlol = new BigNumber(item.askingPrice).div(1000000000).div(1000000000);
    itemForSale.getElementsByTagName("button")[0].innerText = `Buy for ${itemlol} $ONFTs`;
    
    itemForSale.getElementsByTagName("button")[0].onclick = () => buyItem(item);
    itemForSale.id = `item-${item.uid}`;
    itemsForSale.appendChild(itemForSale);
}


getAndRenderItemData = (item, renderFunction) => {
    
    fetch(item.tokenUri)
    .then(response => response.json())
    .then(data => {
        item.name = data.name;
        item.description = data.description;
        item.image = data.image;
        item.creator = data.creator;
        renderFunction(item);
    })
}

ensureMarketplaceIsApproved = async (tokenId, tokenAddress) => {
    user = await Moralis.User.current();
    const userAddress = user.get('ethAddress');
    const contract = new web3.eth.Contract(tokenContractAbi, tokenAddress);
    const approvedAddress = await contract.methods.getApproved(tokenId).call({from: userAddress});
    if (approvedAddress != MARKETPLACE_CONTRACT_ADDRESS){
        await contract.methods.approve(MARKETPLACE_CONTRACT_ADDRESS,tokenId).send({from: userAddress});
    }
}

ensurePaymentTokenIsApproved = async (tokenAddress, amount) => {
    user = await Moralis.User.current();
    //new BN(9999999999999999999999999999999*10**18).toString();
    const userAddress = user.get('ethAddress');
    const contract = new web3.eth.Contract(paymentTokenContractAbi, tokenAddress);
    const approvedAddress = await contract.methods.approve(MARKETPLACE_CONTRACT_ADDRESS, web3.utils.toWei('1', 'ether')).call({from: userAddress});
    if (approvedAddress != PAYMENT_TOKEN_ADDRESS){
        await contract.methods.approve(MARKETPLACE_CONTRACT_ADDRESS, web3.utils.toWei('1', 'tether')).send({from: userAddress});
    }
}

buyItem = async (item) => {
    user = await Moralis.User.current();
    if (!user){
        login();
        return;
    }
    await ensurePaymentTokenIsApproved(PAYMENT_TOKEN_ADDRESS); 
    await marketplaceContract.methods.buyItem(item.uid).send({from: user.get('ethAddress')});
    alert("NFT Purchased");
}



hideElement = (element) => element.style.display = "none";
showElement = (element) => element.style.display = "block";

// Navbar
const userConnectButton = document.getElementById("btnConnect");
userConnectButton.onclick = login;

const userProfileButton = document.getElementById("btnUserInfo");
userProfileButton.onclick = openUserInfo;

const openCreateItemButton = document.getElementById("btnOpenCreateItem");
openCreateItemButton.onclick = () => $('#createItem').modal('show');

//  User profile
const userInfo = document.getElementById("userInfo");
const userUsernameField = document.getElementById("txtUsername");
const userEmailField = document.getElementById("txtEmail");
const userAvatarImg = document.getElementById("imgAvatar");
const userAvatarFile = document.getElementById("fileAvatar");

document.getElementById("btnCloseUserInfo").onclick = () => hideElement(userInfo);
document.getElementById("btnLogout").onclick = logout;
document.getElementById("btnSaveUserInfo").onclick = saveUserInfo;

// Item creation
const createItemForm = document.getElementById("createItem");

const createItemNameField = document.getElementById("txtCreateItemName");
const createItemDescriptionField = document.getElementById("txtCreateItemDescription");
const createItemPriceFieldSn = document.getElementById("numCreateItemPrice");

// Set DECIMAL_PLACES for the original BigNumber constructor
const createItemPriceField = new BigNumber(createItemPriceFieldSn).toFixed(18);
const createItemStatusField = document.getElementById("selectCreateItemStatus");
const createItemFile = document.getElementById("fileCreateItemFile");
document.getElementById("btnCloseCreateItem").onclick = () => hideElement(createItemForm);
document.getElementById("btnCreateItem").onclick = createItem;

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


init();