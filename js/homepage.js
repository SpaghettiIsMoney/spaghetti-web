$(function() {    
    consoleInit();
    start(main);
});

async function main() {
    const App = await init_ethers();

    const WBTC = new ethers.Contract(WBTC_TOKEN_ADDR, ERC20_ABI, App.provider);
    const WETH = new ethers.Contract(WETH_TOKEN_ADDR, ERC20_ABI, App.provider);
    const MKR = new ethers.Contract(MKR_TOKEN_ADDR, ERC20_ABI, App.provider);
    const COMP = new ethers.Contract(COMP_TOKEN_ADDR, ERC20_ABI, App.provider);
    const YFI = new ethers.Contract(YFI_TOKEN_ADDR, ERC20_ABI, App.provider);
    const LINK = new ethers.Contract(LINK_TOKEN_ADDR, ERC20_ABI, App.provider);
    const SNX = new ethers.Contract(SNX_TOKEN_ADDR, ERC20_ABI, App.provider);
    const LEND = new ethers.Contract(LEND_TOKEN_ADDR, ERC20_ABI, App.provider);

    const wbtcStaked = await WBTC.balanceOf(WBTC_REWARD_ADDR) / 1e8;
    const wethStaked = await WETH.balanceOf(WETH_REWARD_ADDR) / 1e18;
    const mkrStaked = await MKR.balanceOf(MKR_REWARD_ADDR) / 1e18;
    const compStaked = await COMP.balanceOf(COMP_REWARD_ADDR) / 1e18;
    const yfiStaked = await YFI.balanceOf(YFI_REWARD_ADDR) / 1e18;
    const linkStaked = await LINK.balanceOf(LINK_REWARD_ADDR) / 1e18;
    const snxStaked = await SNX.balanceOf(SNX_REWARD_ADDR) / 1e18;
    const lendStaked = await LEND.balanceOf(LEND_REWARD_ADDR) / 1e18;

    const prices = await lookUpPrices(["ethereum", "maker", "wrapped-bitcoin", "ethlend", "havven", "yearn-finance", "chainlink", "compound-governance-token"]);
    console.log(prices);

    _print(`WBTC locked = ${toDollar(wbtcStaked * prices["wrapped-bitcoin"].usd)}\n`);
    _print(`WETH locked = ${toDollar(wethStaked * prices["ethereum"].usd)}\n`);
    _print(`MKR locked  = ${toDollar(mkrStaked * prices["maker"].usd)}\n`);
    _print(`COMP locked = ${toDollar(compStaked * prices["compound-governance-token"].usd)}\n`);
    _print(`YFI locked  = ${toDollar(yfiStaked * prices["yearn-finance"].usd)}\n`);
    _print(`LINK locked = ${toDollar(linkStaked * prices["chainlink"].usd)}\n`);
    _print(`SNX locked  = ${toDollar(snxStaked * prices["havven"].usd)}\n`);
    _print(`LEND locked = ${toDollar(lendStaked * prices["ethlend"].usd)}\n`);
    _print(`TOTAL       = ${toDollar(wbtcStaked * prices["wrapped-bitcoin"].usd + snxStaked * prices["havven"].usd + linkStaked * prices["chainlink"].usd + yfiStaked * prices["yearn-finance"].usd + compStaked * prices["compound-governance-token"].usd + mkrStaked * prices["maker"].usd + wethStaked * prices["ethereum"].usd + lendStaked * prices["ethlend"].usd)}\n`);

};

