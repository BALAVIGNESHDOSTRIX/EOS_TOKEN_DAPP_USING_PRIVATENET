var express = require('express');
var token_router = express.Router();
var bodyparser = require('body-parser')
var app = express()
Eos = require('eosjs')
fs = require('fs')
//var prettyjson = require('prettyjson')

app.use(bodyparser.json())
app.use(express.urlencoded({ extended: true }));

initaPrivate = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3'
initaPublic = 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'
keyProvider = initaPrivate
app.disable('etag');

config = {
  chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f', // 32 byte (64 char) hex string
  keyProvider: ['5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3'], // WIF string or array of keys..
  httpEndpoint: 'http://127.0.0.1:8888',
  expireInSeconds: 60,
  broadcast: true,
  verbose: false, // API activity
  sign: true
}

wif = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3'
pubkey = 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'


config.binaryen = require("binaryen")
eos = Eos.Localnet(config)

token_router.post('/acc_create',(req,res,next) =>{
eos.transaction(tr => {
  tr.newaccount({
    creator: 'eosio',
    name: req.body.acc_name,
    owner: pubkey,
    active: pubkey
  })
 
  tr.buyrambytes({
    payer: 'eosio',
    receiver: req.body.acc_name,
    bytes: 8192
  })
 
  tr.delegatebw({
    from: 'eosio',
    receiver:req.body.acc_name,
    stake_net_quantity: '100.0000 SYS',
    stake_cpu_quantity: '100.0000 SYS',
    transfer: 0
  })
}).then((da) =>{
        res.contentType('application/json');
        res.json(da);
})


})


//Deploying the Contract For account

wasm = fs.readFileSync(`./contracts/eosio.token.wasm`)
abi = fs.readFileSync(`./contracts/eosio.token.abi`)


token_router.post('/setwasm',(req,res) =>{

        var name = req.body.doply_acc;
      eos.setcode(req.body.doply_acc, 0, 0, wasm,function(err,data){
if(err){
        res.contentType('application/json');
        res.send("Already the Contract is deployed" + err)

}
else{

        res.contentType('application/json');
        res.send(data)
}


})

    

})

token_router.post('/setabi',(req,res) => {
eos.setabi(req.body.doply_acc, JSON.parse(abi),(err,data) =>{

if(err){
        res.contentType('application/json');
        res.send("Already the Contract is deployed" + err)

}
else{

        res.contentType('application/json');
        res.send(data)
}


})

})


//token create

token_router.post('/tok_create',(req,res) => {
        var name = req.body.ac_name;
        var total = req.body.total_sup;
        var syb = req.body.sym;
        var token = total +' '+ syb;


eos.transaction(name, myaccount => {
 
  // Create the initial token with its max supply

  myaccount.create(name,token , { authorization: [name]})
 
  // Issue some of the max supply for circulation into an arbitrary account
  myaccount.issue(name, token, 'transfered',{ authorization: [name]})
}).then((da) => {

        res.contentType('application/json');
        res.json(da);

})




})


//transfer

token_router.post('/transer',(req,res) => {

        var name = req.body.contract_acc;
        var from = req.body.trans_from;
	var toadd = req.body.trans_to;
	var symb = req.body.send_smb;
	var total = req.body.trans_amo;
	var token = total + ' '+symb+'@'+name;
	//console.log(token)

	eos.transaction(name, da =>{
        da.transfer(from,toadd,token, { authorization: [from]});

}).then((da) => { res.contentType('application/json');
        res.json(da);
})
})


token_router.post('/getbal',(req,res)=>{

var name = req.body.con_namet;
var acc_n = req.body.acc_nio;
var smb = req.body.smbc;



                eos.getCurrencyBalance(name, acc_n,smb,(err,data) => {
if(err) {
                res.contentType('application/json');
        res.json(err);

}
else{
        res.contentType('application/json');
        res.json(data);

}
})


})
module.exports = token_router;


