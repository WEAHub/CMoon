<?php
include "inc/simple_html_dom.php";

// BINANCE API
function binance_cmd_v3($path, $parameters = null) {
	global $conn;
	$api_user = $conn->query("SELECT id, api, secret FROM wm_api WHERE exchange = 'Binance'")->fetch_object();
	$api_key = trim($api_user->api);
	$api_secret = trim($api_user->secret);
	if($api_key == '' || $api_secret  == '') {
		return 0;
	}
	$base = 'https://api.binance.com/api/';
	$server_time = _curl("{$base}v1/time");
	$server_time = json_decode($server_time);
	$server_time = $server_time->serverTime;
	$ts = number_format($server_time, 0, '.', '');
	$params = "timestamp=$ts";
	$params = ($parameters ? "$params&".implode('&', $parameters) : $params);
	$signature = hash_hmac('sha256', $params, $api_secret);
	$headers = array("X-MBX-APIKEY: $api_key");
	$data = _curl("$base$path?$params&signature=$signature", null, array(), null, $headers, null);

	$data = json_decode($data, true);
	if(isset($data['msg'])) {
		if($data['msg'] == 'API-key format invalid.') return 0;
	}
	return $data;
}

function binance_cmd_v1($path, $parameters = null) {
	global $conn;
	$api_user = $conn->query("SELECT id, api, secret FROM wm_api WHERE exchange = 'Binance'")->fetch_object();
	$api_key = trim($api_user->api);
	$api_secret = trim($api_user->secret);
	if($api_key == '' || $api_secret  == '') {
		return 0;
	}
	$base = 'https://api.binance.com/api/';
	$params = "";
	$params = ($parameters ? "$params&".implode('&', $parameters) : $params);
	$headers = array("X-MBX-APIKEY: $api_key");
	$data = _curl("$base$path?$params", null, array(), null, $headers, null);
	$data = json_decode($data, true);
	if(isset($data['msg'])) {
		if($data['msg'] == 'API-key format invalid.') return 0;
	}
	return $data;
}

function binance_getOrderHist($pairs) {
	return binance_cmd_v3('v3/allOrders', array("symbol=$pairs", 'limit=15'));
}

function binance_getBalance() {
	$ret = binance_cmd_v3('v3/account');
	return $ret;
}

function binance_getOrderHist_all() {
	return 0;
}
// BINANCE API

// BITFINEX API
function bfx_getBalance() {
	return bfx_cmd('/auth/r/wallets');
}

function bfx_getOrderHist_all() {	
	return bfx_cmd("/auth/r/orders/hist");

}

function bfx_getOrderHist($pairs) {
	$pairs = strtoupper($pairs);
	$now = number_format(round(time() * 1000), 0, ".", "");
	$start = number_format(round(strtotime("-60 day") * 1000), 0, ".", "");

	return bfx_cmd("/auth/r/orders/t$pairs/hist",
		array(
			"start" => $now,
			"end" => $start,
			"limit" => 25,
			"sort" => -1
		)
	);

}

function bfx_cmd($path, $parameters = null) {
	global $conn;
	$api_user = $conn->query("SELECT id, api, secret FROM wm_api WHERE exchange = 'Bitfinex'")->fetch_object();
	$api_key = trim($api_user->api);
	$api_secret = trim($api_user->secret);
	if($api_key == '' || $api_secret  == '') {
		return 0;
	}

	$nonce = (string) number_format(round(microtime(true) * 1000000), 0, ".", "");
	$params = $parameters ? json_encode($parameters) : '{}';
	$signature = hash_hmac('sha384', utf8_encode("/api/v2$path$nonce$params"), utf8_encode($api_secret));
	$header = array(
		'content-type: application/json',
		'content-length: ' . strlen($params),
		"bfx-apikey: $api_key",
		"bfx-signature: $signature",
		"bfx-nonce: $nonce"
	);

	$result = _curl("https://api.bitfinex.com/v2$path", null, $params, null, $header, null);
	$result = json_decode($result);

	if(isset($result[0])) {
		if($result[0] == 'error') return 0;
	}

	return $result;

}
//BITFINEX API

function get_opinions($pairs) {
	$data = _curl("https://www.tradingview.com/symbols/$pairs/?sort=recent");
	$html = str_get_html($data);
	$arr = array();
	foreach($html->find("div[data-widget-type='idea']") as $element) {
		$json_data = json_decode($element->attr['data-widget-data']);
		$like_score = $json_data->like_score;
		$title = $json_data->name;
		$chart_id = $json_data->image_url;
		$username = $element->find('span[data-username]', 0)->attr['data-username'];
		$img = $element->find('img.tv-widget-idea__cover', 0)->attr['src'];
		$time = substr($element->find('span[data-timestamp]', 0)->attr['data-timestamp'], 0, -2);
		$description = $element->find('p.tv-widget-idea__description-text', 0)->innertext;
		$time_frame = str_replace(array(' ', ','), '', $element->find('span.tv-widget-idea__timeframe', 0)->innertext);
		$suggest = $element->find('span.tv-idea-label', 0) ? $element->find('span.tv-idea-label', 0)->innertext : '';
		$user_img = $element->find('img.tv-user-link__avatar', 0)->attr['src'];
		$url_idea = $element->find('a.tv-widget-idea__title', 0)->attr['href'];
		$views = $element->find('span[data-name="views"]', 0)->find('.tv-social-stats__count', 0)->innertext;
		$comments = $element->find('span[data-name="comments"]', 0)->find('.tv-social-stats__count', 0)->innertext;
		$arr[] = array($title, $username, $img, $time, $description, $time_frame, $suggest, $like_score, $user_img, $url_idea, $views, $comments, $chart_id);
	}
	return $arr;
}

function get_calendar($page) {
	$page = $page ? $page : 1;
	$data = _curl("https://coinmarketcal.com/?form%5Bdate_range%5D=01/05/2018%20-%2001/09/2021&form%5Bsort_by%5D=&form%5Bsubmit%5D=&page=$page");
	$html = str_get_html($data);
	$arr = array();
	foreach($html->find("div.card__body") as $element) {
		$date = trim(strip_tags($element->find('.card__date' , 0)->innertext));
		$title = trim(strip_tags($element->find('.card__coins' , 0)->innertext));
		$subtitle = trim(strip_tags($element->find('.card__title' , 0)->innertext));
		$desc = trim(strip_tags($element->find('.card__description' , 0)->innertext));
		$proof = trim(strip_tags($element->find('.proof_modal' , 0)->attr['href']));
		$source = trim(strip_tags($element->find('a' , 4)->attr['href']));
		$votes = $element->find('.progress__votes' , 0) ? trim(strip_tags($element->find('.progress__votes' , 0)->innertext)) : 0;
		$percent = $element->find('div[aria-valuenow]' , 0) ? trim(strip_tags($element->find('div[aria-valuenow]' , 0)->attr['aria-valuenow'])) : 0;
		$arr[] = array($date, $title, $subtitle, $desc, $proof, $source, $votes, $percent);
	}
	return $arr;
}

function get_historical_price($from, $to, $exchange, $ts) {
	$exchange = strtolower($exchange);
	if($exchange == 'bitfinex') {
		$start = $ts;
		$end = strtotime(date("Y-m-d H:i:s", $start)." +2 minutes");
		$start = (string) number_format(round($start * 1000), 0, ".", "");
		$end = (string) number_format(round($end * 1000), 0, ".", "");
		$json = json_decode(_curl("https://api.bitfinex.com/v2/candles/trade:1m:t$from$to/hist?limit=1&start=$start&end=$end"), true);				
		$ret = $json[0][2];
	}
	elseif($exchange =='binance') {
		$start = $ts;
		$end = strtotime(date("Y-m-d H:i:s", $start)." +2 minutes");
		$start = (string) number_format(round($start * 1000), 0, ".", "");
		$end = (string) number_format(round($end * 1000), 0, ".", "");
		$json = json_decode(_curl("https://api.binance.com/api/v1/klines?symbol=$from$to&interval=1m&startTime=$start&endTime=$end&limit=1"), true);		
		$ret = $json[0][4];
	}
	if($ret > 0) {
		return $ret; 
	}
	else {
		$json = json_decode(_curl("https://min-api.cryptocompare.com/data/pricehistorical?fsym=$from&tsyms=$to&ts=$ts&markets=$exchange"), true);
		return isset($json["$from"]["$to"]) ? $json["$from"]["$to"] : 0;
	}
}

function get_historical_price_v2($from, $to, $exchange, $ts) {
	$exchange = strtolower($exchange);
	$json = json_decode(_curl("https://min-api.cryptocompare.com/data/histohour?fsym=$from&tsym=$to&limit=1&e=$exchange&toTs=$ts"), true);
	return isset($json["Data"][0]['close']) ? $json["Data"][0]['close'] : 0;
}

function get_exchange_rate($from, $to){
	$data = json_decode(_curl("http://free.currencyconverterapi.com/api/v5/convert?q={$from}_{$to}&compact=ultra"), true);
	return current($data);
}

function get_price_by_exchange($exchange, $symbol) {
	global $conn;
	return $conn->query("SELECT coin_price FROM wm_exchange_rates WHERE coin_id = '{$symbol}' AND exchange = '{$exchange}'")->fetch_object()->coin_price;
}

function get_coincapcharturl($sym) {
	global $conn;
	return $conn->query("SELECT dbid FROM wm_ccapdb WHERE sym = '$sym'")->fetch_object()->dbid;
}

function get_balance_by_address($coin, $addr) {
	global $arr_urls;
	$balance = false;
	if($coin == 'ethereum') {/*
		$json = json_decode(_curl($arr_urls['eth_balance'] . $addr));
		if($json) {
			if($json->message == 'OK' & $json->status == 1) {
				$balance = $json->result;
				$balance = ($balance / 1000000000000000000);
			}
		}*/
		$data = _curl("https://etherscan.io/address/$addr");
		$str = explode('Balance:', $data)[1];
		$str = explode('Ether', $str)[0];
		$str = trim(strip_tags($str));
		$balance = $str;
	}
	elseif($coin == 'bitcoin') {
		$json = _curl($arr_urls['btc_balance'] . $addr);
		$balance = is_numeric($json) ? ($json / 100000000) : false;
	}
	elseif($coin == 'bitcoin-cash') {


	}
	return $balance;
}

function _curl($url, $ref = null, $post = array(), $ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36", $headers = array(), $encoding = null) {
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_AUTOREFERER, true);
	if(!empty($ref)) curl_setopt($ch, CURLOPT_REFERER, $ref);
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER , 0);
	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
	if($encoding) curl_setopt($ch,CURLOPT_ENCODING , $encoding);
	if(!empty($ua)) curl_setopt($ch, CURLOPT_USERAGENT, $ua);
	error_reporting(0);
	if(count($post) > 0){
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
	}
	$output = curl_exec($ch);
	curl_close($ch);
	error_reporting(E_ERROR | E_WARNING | E_PARSE);
	return $output;
}

function checkInstall() {
	global $conn;
	global $db_db;

	//$conn->query("DROP DATABASE $db_db");
	
	$conn->query("CREATE DATABASE IF NOT EXISTS $db_db");
	$conn->select_db($db_db);

	$conn->query('CREATE TABLE IF NOT EXISTS `wm_currs` (
		`id` int(11) NOT NULL AUTO_INCREMENT,
		`coin_id` text NOT NULL,
		`coin_name` text NOT NULL,
		`price` text NOT NULL,
		`symbol` text NOT NULL,
		`percent_change_1h` text NOT NULL,
		`percent_change_24h` text NOT NULL,
		`percent_change_7d` text NOT NULL,
		`market_cap_usd` text NOT NULL,
		`24h_volume_usd` text NOT NULL,
		PRIMARY KEY (`id`)
	) ENGINE=MyISAM AUTO_INCREMENT=1599 DEFAULT CHARSET=latin1;');

	$conn->query('CREATE TABLE IF NOT EXISTS `wm_ccapdb` (
		`id` int(11) NOT NULL AUTO_INCREMENT,
		`sym` text NOT NULL,
		`dbid` text NOT NULL,
		PRIMARY KEY (`id`)
	) ENGINE=MyISAM AUTO_INCREMENT=1569 DEFAULT CHARSET=latin1;');

	$conn->query('CREATE TABLE IF NOT EXISTS `wm_exchange_rates` (
		`id` int(11) NOT NULL AUTO_INCREMENT,
		`coin_id` text NOT NULL,
		`coin_price` text NOT NULL,
		`exchange` text NOT NULL,
		PRIMARY KEY (`id`)
	) ENGINE=MyISAM AUTO_INCREMENT=309 DEFAULT CHARSET=latin1;');

	$conn->query('CREATE TABLE IF NOT EXISTS `wm_onlineholding` (
		`id` int(11) NOT NULL AUTO_INCREMENT,
		`coin_id` text NOT NULL,
		`amount` text NOT NULL,
		`bought_at` text NOT NULL,
		`exchange` text NOT NULL,
		`date_add` timestamp NOT NULL,
		`trade` int(11) NOT NULL,
		`date_trade` timestamp NOT NULL,
		`pair_price` text NOT NULL,
		PRIMARY KEY (`id`)
	) ENGINE=MyISAM AUTO_INCREMENT=210 DEFAULT CHARSET=latin1;');

	$conn->query('CREATE TABLE IF NOT EXISTS `wm_localholding` (
		`id` int(11) NOT NULL AUTO_INCREMENT,
		`coin_id` text NOT NULL,
		`amount` text NOT NULL,
		`addr` text NOT NULL,
		`type` text NOT NULL,
		`last_check` timestamp NOT NULL,
		PRIMARY KEY (`id`)
	) ENGINE=MyISAM AUTO_INCREMENT=91 DEFAULT CHARSET=latin1;');

	$conn->query('CREATE TABLE IF NOT EXISTS `wm_favs` (
		`id` int(11) NOT NULL AUTO_INCREMENT,
		`curr_id` text NOT NULL,
		PRIMARY KEY (`id`)
	) ENGINE=MyISAM AUTO_INCREMENT=64 DEFAULT CHARSET=latin1;');

	$conn->query('CREATE TABLE IF NOT EXISTS `wm_api` (
		`id` int(11) NOT NULL AUTO_INCREMENT,
		`exchange` text NOT NULL,
		`api` text NOT NULL,
		`secret` text NOT NULL,
		`help` text NOT NULL,
		PRIMARY KEY (`id`)
	) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;');


	$conn->query("CREATE TABLE IF NOT EXISTS `wm_conf` (
		`id` int(11) NOT NULL AUTO_INCREMENT,
		`name` text NOT NULL,
		`val` text NOT NULL,
		PRIMARY KEY (`id`)
	) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;");

	if($conn->query("SELECT count(*) as count FROM wm_currs")->fetch_object()->count < 1) {
		
		$conn->query("INSERT INTO `wm_conf` (`id`, `name`, `val`) VALUES (1, 'refresh', '1')");
		
		$conn->query("INSERT INTO `wm_api` (`id`, `exchange`, `api`, `secret`, `help`) VALUES
			(1, 'Bitfinex', '', '', 'https://support.bitfinex.com/hc/en-us/articles/115002349625-API-Key-Setup-Login'),
			(2, 'Binance', '', '', 'https://support.binance.com/hc/en-us/articles/115000840592-Binance-API-Beta')");
			
		$conn->query("INSERT INTO `wm_favs` (`id`, `curr_id`) VALUES
			(1, 'bitcoin'),
			(2, 'ethereum'),
			(3, 'ripple'),
			(4, 'neo'),
			(5, 'stellar'),
			(6, 'nano')");
			
		update_db();
		
	}

}

function update_db() {
	global $conn;
	global $arr_urls;
	global $muvdi_channel;

	$conn->query('TRUNCATE TABLE wm_currs');
	$conn->query('TRUNCATE TABLE wm_exchange_rates');

	// COINMAKERCAP
	$json = json_decode(_curl($arr_urls['coinmarketcap_all']), true);
	foreach($json as $curr) {
		$conn->query("INSERT INTO wm_currs(coin_id, coin_name, price, symbol, 24h_volume_usd, market_cap_usd, percent_change_1h, percent_change_24h, percent_change_7d)
		VALUES ('{$curr["id"]}', '{$curr["name"]}', '{$curr["price_usd"]}', '{$curr["symbol"]}', '{$curr["24h_volume_usd"]}', '{$curr["market_cap_usd"]}', '{$curr["percent_change_1h"]}', '{$curr["percent_change_24h"]}', '{$curr["percent_change_7d"]}')");
	}
	
	
	if($conn->query("SELECT count(*) as count FROM wm_ccapdb")->fetch_object()->count < 1) {
		$data = file_get_contents($arr_urls['coincap_json']);
		$json = json_decode($data);
		foreach($json as $curr) {
			$sym = $curr->symbol;
			$id = $curr->id;
			$conn->query("INSERT INTO wm_ccapdb(sym, dbid) VALUES ('$sym', '$id')");
		}
	}

	
	// BINANCE
	$json = json_decode(_curl($arr_urls['binance_all']));
	foreach($json as $curr) {
		$conn->query("INSERT INTO wm_exchange_rates(coin_id, coin_price, exchange) VALUES ('{$curr->symbol}', '{$curr->price}', 'Binance')");
	}

	// BITFINEX
	$gbpusd_price = get_exchange_rate('gbp', 'usd');
	$jpyusd_price = get_exchange_rate('jpy', 'usd');
	$eurusd_price = get_exchange_rate('eur', 'usd');

	$conn->query("INSERT INTO wm_exchange_rates(coin_id, coin_price, exchange) VALUES ('gbpusd','{$gbpusd_price}', 'Bitfinex')");
	$conn->query("INSERT INTO wm_exchange_rates(coin_id, coin_price, exchange) VALUES ('jpyusd','{$jpyusd_price}', 'Bitfinex')");
	$conn->query("INSERT INTO wm_exchange_rates(coin_id, coin_price, exchange) VALUES ('eurusd','{$eurusd_price}', 'Bitfinex')");

	$json = json_decode(_curl($arr_urls['bitfinex_symbols']), true);
	$symbols = '';
	foreach($json as $sym) {
		$sym = strtoupper($sym);
		$symbols .= "t$sym,";
	}

	$json =_curl($arr_urls['bitfinex_tickerv2'].$symbols);
	$json = substr($json, 1);
	$json = substr($json, 0, -1);
	$arr = explode('[', $json);

	foreach($arr as $val) {
		if(!empty($val)) {
			$val = substr($val, 0, -1);
			$arr_val = explode(',', $val);
			$name = $arr_val[0];
			$name = substr($name, 2, -1);
			$price = $arr_val[1];
			$conn->query("INSERT INTO wm_exchange_rates(coin_id, coin_price, exchange) VALUES ('{$name}','{$price}', 'Bitfinex')");
		}
	}
}

function diffJson($arr1, $arr2) {
	$diff = array();
	foreach( $arr1 as $k1=>$v1 ){
		if( isset( $arr2[$k1]) ){
			$v2 = $arr2[$k1];
			if( is_array($v1) && is_array($v2) ){
				$changes = diffJson($v1, $v2);
				if( count($changes) > 0 ) $diff[$k1] = array('upd' => $changes);
				unset($arr2[$k1]);
			}
			else if( $v2 === $v1 ){
				unset($arr2[$k1]);
			}
			else {
				$diff[$k1] = array( 'old' => $v1, 'new'=>$v2 );
				unset($arr2[$k1]);
			}
		}
		else {
			$diff[$k1] = array( 'old' => $v1 );
		}
	}
	reset( $arr2 );
	foreach( $arr2 as $k=>$v ) {
		$diff[$k] = array( 'new' => $v );
	}
	return $diff;
}
?>
