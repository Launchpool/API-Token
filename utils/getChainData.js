const schedule = require("node-schedule")
const numeral = require("numeral")
const Web3 = require("web3")
const db = require("./db")
const addresses = require("./addresses")
const getPriceData = require("./getPriceData")
const lpoolAbi = require("../abis/lpool.json")
const { lockedTokens } = require("./addresses")

 
const setupWeb3 = async () => {
  const web3 = await new Web3(new Web3.providers.WebsocketProvider(process.env.INFURA_URL))
  return web3
}

// Set number formatting default
numeral.defaultFormat("0,0.00");

// For converting to proper number of decimals
const convert = (num, decimal) => {
  return Math.round((num / (10*10**(decimal-3))))/100
}

// Set up chain data object
const chainData = {}

const getData = async (web3) => {

  // Get block number
  const blockNumber = await web3.eth.getBlockNumber()

  // Instantiate smart contract object(s)
  let lpool = new web3.eth.Contract(lpoolAbi, addresses.lpool)

  // Make tokenData object
  let tokenData = {
    totalSupply: {},
    circulating: {},
  }

  // EXAMPLE CODE: REPLACE OR REMOVE FOR PRODUCTION
  // Add other data objects such as TVL here if needed 
  // let tvlData = {
  //   lpool: {},
  //   otherToken: {},
  // }

  // Calculate total locked LPOOL 
  let totalLocked = 0
  Object.keys(lockedTokens).forEach(async key => {
    const locked = await lpool.methods.balanceOf(lockedTokens[key]).call() 
    totalLocked += Number(locked)
  })
 
  // Get total supply
  tokenData.totalSupply.value  = await lpool.methods.totalSupply().call()

  // Get derived values
  tokenData.circulating.value = tokenData.totalSupply.value - totalLocked

  // Set up descriptions
  tokenData.circulating.description = "LPOOL total supply minus all locked LPOOL"
  tokenData.totalSupply.description = "LPOOL total supply."
 
  
  // Set converted and formatted value, block, and timestamp
  Object.keys(tokenData).forEach(key => {
    tokenData[key].value = convert(tokenData[key].value, 18)
    tokenData[key].formattedValue = numeral(tokenData[key].value).format()
    tokenData[key].block = blockNumber
    tokenData[key].timestamp = Date.now()
  })
  
  // Set price, block, and timestamp for tokenData, add tokenData object and other data objects
  const priceData = await getPriceData()
  chainData.lpool_price_usd = priceData.data.launchpool.usd
  chainData.block = blockNumber
  chainData.timestamp = Date.now()
  chainData.tokenData = tokenData
  // EXAMPLE CODE: REPLACE OR REMOVE FOR PRODUCTION
  //chaindata.tvlData = tvlData 
  
  try {
    const client = db.getClient()
    console.log(chainData)
    db.updateChainData(chainData, client) 
  }
  catch(err) {
    console.log(err)
  }
  return chainData
}
 
const updateData = async (web3) => {
  schedule.scheduleJob("0 * * * * *", async () => {    
    getData(web3)
  })
}

setupWeb3().then(web3 => updateData(web3))

module.exports = chainData