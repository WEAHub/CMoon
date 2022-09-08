<?php
date_default_timezone_set('Europe/Paris');
ini_set('precision', 12);

$db_user = 'root';
$db_host = 'localhost';
$db_pass = '';
$db_db = 'db_weamon';

$arr_pairs = array('ETH', 'BTC', 'USDT', 'BNB', 'USD', 'GBP', 'EUR', 'JPY');
$pairs_crypto = array('ETH', 'BTC', 'BNB');
$pairs_curr =  array('USDT', 'USD', 'GBP', 'EUR', 'JPY');
$arr_ex = array('Bitfinex', 'Binance');

$cryptocap_limit = 2000;

$arr_urls = array(
	'coinmarketcap_all' => "https://api.coinmarketcap.com/v1/ticker/?limit=$cryptocap_limit",
	'coincap_json' => 'https://s2.coinmarketcap.com/generated/search/quick_search.json',
	'binance_all' => 'https://api.binance.com/api/v3/ticker/price',									
	'bitfinex_ticker' => 'https://api.bitfinex.com/v1/pubticker/',							
	'bitfinex_tickerv2' => 'https://api.bitfinex.com/v2/tickers?symbols=',
	'bitfinex_symbols' => 'https://api.bitfinex.com/v1/symbols',
	'eth_balance' => 'https://api.etherscan.io/api?module=account&action=balance&address=',
	'btc_balance' => 'https://blockchain.info/de/q/addressbalance/',	
);

$muvdi_channel = '401047032858673152';

$conn = new mysqli($db_host, $db_user, $db_pass);
?>