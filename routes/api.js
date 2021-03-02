const express = require('express')
const app = express.Router()
const chainData = require('../utils/getChainData')
  
app.get("/total-supply", (req, res) => {
  res.json(req.chainData.tokenData.totalSupply)
}) 
 
app.get("/circulating", (req, res) => {
  res.json(req.chainData.tokenData.circulating)
}) 
 

app.get("/total-supply-simple", (req, res) => {
  res.json(req.chainData.tokenData.totalSupply.value)
}) 
 
app.get("/circulating-simple", (req, res) => {
  res.json(req.chainData.tokenData.circulating.value)
}) 

app.get('/', (req, res) => {
  res.json(req.chainData.tokenData)
})

module.exports = app
