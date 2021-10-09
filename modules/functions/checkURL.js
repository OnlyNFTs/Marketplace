
async function checkURL() {
    
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    urlNFT = params.get('nft');
    if (urlNFT) urlNFT = urlNFT.toLowerCase();
    urlNFTID = params.get('id');
    urlProfile = params.get('p');
    urlProfileAddress = params.get('p-addr');
    if (urlProfile) {
        urlProfile = urlProfile.toLowerCase();
        const params = {username: urlProfile};
        profilePageCloudInfo = await Moralis.Cloud.run('getProfilePages', params);
        urlProfile = profilePageCloudInfo.profileCreator;
        console.log(profilePageCloudInfo);
        console.log(profilePageCloudInfo.profileAvatar.url());
     return(urlProfile, profilePageCloudInfo);
    };
    if (urlNFT, urlNFTID) return(urlNFT, urlNFTID);
    

    
}

