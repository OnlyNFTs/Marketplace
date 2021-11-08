const contractWallet = "0x74220d21E6D99528c00C37B28aF84604c398a1E8";

// get mainnet native balance for the current user
const balance = await Moralis.Web3API.account.getNativeBalance();

// get BSC native balance for a given address
const options = { chain: "bsc", address: contractWallet};
const balance = await Moralis.Web3API.account.getNativeBalance(options);