userConnectButton = document.getElementById("btnConnect");
userConnectButton.onclick = () => $('#connectWalletModal').modal('show');
//Log In
async function login() {
    
    try {
        
        if (typeof web3 !== 'undefined') {
            
            if (web3.currentProvider.isMetaMask === true) {
                walletProvider = 'metamask';
        await Moralis.authenticate({signingMessage: "Log In"});
        //alert("Logged in Successfully!");
        user = await Moralis.User.current();
        notificationHeader.innerText = "Logged in Successfully!";
        notificationBody.innerText = "You have successfully logged in as " + user.get('username');
        //notificationTime.innerText = Math.round(Date.now()/1000)+60*20;
        $('.toast').toast('show');        

        $('#connectWalletModal').modal('hide'); 
        initUser();
            }else {
                await Moralis.authenticate({provider: 'trustwallet', signingMessage: "Log In"});
        alert("Logged in Successfully!");
        $('#connectWalletModal').modal('hide'); 
        initUser(); 
            }
        } else {
            await Moralis.authenticate();
            alert("Logged in Successfully!");
            $('#connectWalletModal').modal('hide'); 
            initUser(); 
        }


    } catch (error) {
        alert(error)
    }
}

//Log In
async function loginTW() {
    
    try {
        await Moralis.authenticate({provider: 'trustwallet', signingMessage: "Log In"});
        alert("Logged in Successfully!");
        $('#connectWalletModal').modal('hide'); 
        initUser(); 

    } catch (error) {
        alert(error)
    }
}

//Log In
async function loginWC() {
    
    try {
        walletProvider = "walletconnect";
        console.log(walletProvider);
        await Moralis.authenticate({provider: walletProvider, chainId: 56, signingMessage: "Log In"});
        alert("Logged in Successfully!");
        $('#connectWalletModal').modal('hide'); 
        initWeb3();
        initUser();

    } catch (error) {
        alert(error)
    }
}






async function logout() {
    await Moralis.User.logOut();
    hideElement(userInfo);
    //alert("Logged Out Successfully!");

    notificationHeader.innerText = "Logged Out";
    notificationBody.innerText = "Logged Out Successfully!";
    //notificationTime.innerText = Math.round(Date.now()/1000)+60*20;
    $('.toast').toast('show');
    initUser();
}