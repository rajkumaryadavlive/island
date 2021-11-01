var express = require('express');
var router = express.Router();
const HomeController=require('../controllers/HomeController');
const TransactionController=require('../controllers/TransactionController');
const BidController=require('../controllers/BidController');
const authuser=require('../middleware/authuser');
/* GET home page. */
//router.use(authuser);
router.get('/',authuser,HomeController.index);
router.get('/place-bid',BidController.placeBid);

router.get('/market',authuser,HomeController.market);
router.get('/land-nft',HomeController.fetchNft);
router.get('/sale-nft',HomeController.addOrder);
router.get('/map',authuser,HomeController.map);

router.get('/search',HomeController.exploreContent);
router.get('/defi', function(req, res, next) {
  res.render('defi',{ layout: 'layouts/front/layout',name: req.session.re_usr_name});
});
router.get('/buy-content',TransactionController.buyNft);

router.get('/model',authuser,HomeController.model);
router.get('/author',authuser,HomeController.author);
router.get('/contact',authuser, function(req, res, next) {
  res.render('contactus',{ layout: 'layouts/front/layout',name: req.session.re_usr_name });
});
router.get('/subscriptions',authuser,function(req,res){
  res.render('subscription',{layout:'layouts/front/layout',name: req.session.re_usr_name});
});

router.get('/subscribed',authuser,function(req,res){
   res.render('subscribed',{layout:'layouts/front/layout',name: req.session.re_usr_name});
});

router.get('/buy-plan',authuser,function(req,res){
  res.render('buy-plan',{layout:'layouts/front/layout',name: req.session.re_usr_name});
});
router.get('/detail',authuser,HomeController.contentDetail);

module.exports = router;
