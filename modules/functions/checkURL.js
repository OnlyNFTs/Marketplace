
async function checkURL() {
    
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    urlNFT = params.get('nft');
    if (urlNFT) urlNFT = urlNFT.toLowerCase();
    urlNFTID = params.get('id');
    urlProfile = params.get('p');
    if (urlProfile) urlProfile = urlProfile.toLowerCase();
    if (urlNFT, urlNFTID) return(urlNFT, urlNFTID);
    if (urlProfile) return(urlProfile);

    
}

