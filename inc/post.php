<?php
$conn->select_db($db_db);
if($cmd = $_POST['cmd']) {
	if($cmd == 'update_db') {
		$updatedb = $conn->real_escape_string($_POST['data']);
		settype($updatedb, 'integer');
		if($updatedb == 1) update_db();
	}
	elseif($cmd == 'get_icons_db') {
    set_time_limit(0);
		echo _curl('https://s2.coinmarketcap.com/generated/search/quick_search.json');
	}
  elseif($cmd == 'upd_icon') {
    $url = $conn->real_escape_string(trim($_POST["url"]));
    $sym = $conn->real_escape_string(trim($_POST["sym"]));
    if($sym !== 'con') {
      $path = "img\\coinspng\\$sym.png";
      if(file_exists($path)) unlink($path);
      file_put_contents("img\\coinspng\\$sym.png", _curl($url));
    }
    echo json_encode(array($sym, $path));
  }
	elseif($cmd == 'get_symbol') {
		$coin = $_POST["coin"];
		echo $conn->query("SELECT symbol FROM wm_currs WHERE symbol = '$coin' OR coin_id = '$coin' OR coin_name = '$coin'")->fetch_object()->symbol;
	}
	elseif($cmd == 'get_historical_orders') {

		$exchange = $conn->real_escape_string(trim($_POST["exchange"]));		
		$pairs = isset($_POST['pairs']) ? $conn->real_escape_string(trim($_POST["pairs"])) : null;

		$hist_arr = array();

		if($exchange == 'Binance') {
			$hist = ($pairs ? binance_getOrderHist($pairs) : binance_getOrderHist_all());
			if($hist) {
				foreach($hist as $trade) {
					//if($trade['status'] !== 'CANCELED') {
						$hist_arr[] = array(
							'ID' => $trade['orderId'],
							'PAIRS' => $pairs,
							'DATE' => $trade['time'],
							'TRADE' => strtolower($trade['side']),
							'AMOUNT' => $trade['origQty'],
							'TYPE' => $trade['type'],
							'STATUS' => $trade['status'],
							'PRICE' => $trade['price']
						);
					//}
				}
			}
			else {
				$hist_arr = 0;
			}
		}
		elseif($exchange == 'Bitfinex') {
			$hist = ($pairs ? bfx_getOrderHist($pairs) : bfx_getOrderHist_all());
			if($hist) {
				foreach($hist as $trade) {
					$hist_arr[] = array(
						'ID' => $trade[0],
						'PAIRS' => substr($trade[3], 1),
						'DATE' => $trade[4],
						'TRADE' => (($trade[6] < 0) ? 'sell' : 'buy'),
						'AMOUNT' => $trade[7],
						'STATUS' => $trade[13],
						'TYPE' =>  $trade[8],
						'PRICE' => $trade[16]
					);
				}
			}
			else {
				$hist_arr = 0;
			}
		}

		echo json_encode($hist_arr);

	}
	elseif($cmd == 'save_config') {
		$bfx_api = $conn->real_escape_string(trim($_POST["bfx_api"]));
		$bfx_key = $conn->real_escape_string(trim($_POST["bfx_key"]));
		$bnc_api = $conn->real_escape_string(trim($_POST["bnc_api"]));
		$bnc_key = $conn->real_escape_string(trim($_POST["bnc_key"]));
		$refresh_check = $conn->real_escape_string(trim($_POST["refresh_check"]));
		$conn->query("UPDATE wm_conf SET val='$refresh_check' WHERE name='refresh'");
		$conn->query("UPDATE wm_api SET api='$bfx_api', secret='$bfx_key' WHERE exchange='Bitfinex'");
		$conn->query("UPDATE wm_api SET api='$bnc_api', secret='$bnc_key' WHERE exchange='Binance'");
	}
	elseif($cmd == 'get_exchange_data') {
		if($binance_data = binance_getBalance()) {
			$binance_arr = array();
			$btcusd_price_binance = $conn->query("SELECT coin_price FROM wm_exchange_rates WHERE coin_id = 'BTCUSDT' and exchange='Binance'")->fetch_object()->coin_price;
			foreach($binance_data['balances'] as $binance_balance) {
				$coin = $binance_balance['asset'];
				$balance = ($binance_balance['free'] + $binance_balance['locked']);
				if ($balance > 0) {
					$btc_price = $conn->query("SELECT coin_price FROM wm_exchange_rates WHERE coin_id = '{$coin}BTC' and exchange = 'Binance'")->fetch_object()->coin_price;
					$binance_arr[] = array(
						'coin' => $coin,
						'wallet' => 'exchange',
						'amount' => number_format($balance, 8, '.', ''),
						'price_btc' => number_format($btc_price, 8, '.', ''),
						'price' => ($btc_price * $btcusd_price_binance),
					);
				}
			}

			$binance_arr = array(
				'btcusd' => $btcusd_price_binance,
				'balances' => $binance_arr,
				'exchange' => 'Binance',
			);
		}

		if($bitfinex_data = bfx_getBalance()) {
			$bitfinex_arr = array();
			$btcusd_price_bitfinex = $conn->query("SELECT coin_price FROM wm_exchange_rates WHERE coin_id = 'BTCUSD' and exchange='Bitfinex'")->fetch_object()->coin_price;

			foreach($bitfinex_data as $bitfinex_balance) {
				$wallet = $bitfinex_balance[0];
				$coin = $bitfinex_balance[1];
				$balance = $bitfinex_balance[2];
				if($coin !== 'USD') {
					$usd_price = $conn->query("SELECT coin_price FROM wm_exchange_rates WHERE coin_id = '{$coin}USD' and exchange='Bitfinex'")->fetch_object()->coin_price;
					$btc_price = $coin !== 'BTC' ?  $conn->query("SELECT coin_price FROM wm_exchange_rates WHERE coin_id = '{$coin}BTC' and exchange='Bitfinex'")->fetch_object()->coin_price : 1;
					if(!$usd_price) {
						$usd_price = $conn->query("SELECT coin_price FROM wm_exchange_rates WHERE coin_id = '{$coin}BTC' and exchange='Bitfinex'")->fetch_object()->coin_price;
						$usd_price = ($usd_price * $btcusd_price_bitfinex);
					}
				}
				else {
					$btc_price = $balance / $btcusd_price_bitfinex;
					$usd_price = $balance;
				}

				$bitfinex_arr[] = array(
					'wallet' => $wallet,
					'coin' => $coin,
					'amount' => number_format($balance, 8, '.', ''),
					'price_btc' => number_format($btc_price, 8, '.', ''),
					'price' => $usd_price,
				);

			}

			$bitfinex_arr = array (
				'btcusd' => $btcusd_price_bitfinex,
				'balances' => $bitfinex_arr,
				'exchange' => 'Bitfinex',
			);
		}
		$bitfinex_arr = $bitfinex_data ? $bitfinex_arr :
			array('exchange' => 'Bitfinex',
			'balances' => 'noapi');

		$binance_arr = $binance_data ? $binance_arr :
			array('exchange' => 'Binance',
			'balances' => 'noapi');

		$exchanges_data = json_encode(array($bitfinex_arr, $binance_arr));
		echo $exchanges_data;
	}
	elseif($cmd == 'get_calendar') {
		$page = $conn->real_escape_string($_POST['page']);
		echo json_encode(array(
			'data' => json_encode(get_calendar($page)),
			'last_check' => date("Y-m-d H:i:s")
		));
	}
	elseif($cmd == 'get_config') {
		$config = $conn->query("SELECT id, name, val FROM wm_conf")->fetch_all();
		$exchange_keys = $conn->query("SELECT exchange, api, secret, help FROM wm_api")->fetch_all();
		$data = json_encode(array($config, $exchange_keys));
		echo $data;
	}
	elseif($cmd == 'get_favs') {
		$result = $conn->query("SELECT curr_id, id FROM wm_favs order by id DESC");
		$arr = array();
		while ($row = $result->fetch_row()) {
			$curr = $conn->query("SELECT id, coin_id, coin_name, price, symbol, percent_change_1h, percent_change_24h, percent_change_7d, market_cap_usd, 24h_volume_usd FROM wm_currs WHERE coin_id = '{$row[0]}' LIMIT 1")->fetch_object();
			$curr->chart_url = get_coincapcharturl($curr->symbol);
			$curr->db_id = $row[1];
			$arr[] = $curr;
		}

		echo json_encode($arr);
	}
	elseif($cmd == 'delete_fav') {
		$id = $conn->real_escape_string($_POST['id']);
		settype($id, 'integer');
		$conn->query("DELETE FROM wm_favs WHERE id = $id");
	}
	elseif($cmd == 'add_fav') {
		$fav = $conn->real_escape_string($_POST['id']);

		if($conn->query("SELECT count(curr_id) as count FROM wm_favs WHERE curr_id = '{$fav}'")->fetch_object()->count < 1) {
			echo $conn->query("INSERT INTO wm_favs(curr_id) VALUES ('{$fav}')") ? 1 : 0;
		}
		else {
			echo 2;
		}
	}
	elseif($cmd == 'add_holding') {
		$json = json_decode($_POST['data']);
		$coin_id = $conn->real_escape_string($json[0]->value);
		$addr = $conn->real_escape_string($json[1]->value);
		$amount = $conn->real_escape_string($json[2]->value);
		$type = ($addr !== '') ?  1 : 0;

		if($type == 1) {
			$amount = get_balance_by_address($coin_id, $addr);
			$amount = $amount ? $amount : 0;
		}

		if(is_numeric($amount) & !empty($coin_id)) {
			echo ($conn->query("INSERT INTO wm_localholding(coin_id, amount, addr, type, last_check) VALUES ('{$coin_id}','{$amount}','{$addr}','{$type}', now())")) ? 1 : 0;
		}
		else {
			echo 0;
		}
	}
	elseif($cmd == 'mod_holding') {
		$json = json_decode($_POST['data']);
		$coin_id = $conn->real_escape_string($json[0]->value);
		$addr = trim($conn->real_escape_string($json[1]->value));
		$amount = $conn->real_escape_string($json[2]->value);
		$id = $conn->real_escape_string($_POST['id']);
		$type = ($addr !== '') ?  1 : 0;

		if($type == 1) {
			$amount = get_balance_by_address($coin_id, $addr);
			$amount = $amount ? $amount : 0;
		}

		if(is_numeric($amount) & !empty($coin_id)) {
			echo ($conn->query("UPDATE wm_localholding SET
				coin_id = '{$coin_id}',
				amount = '{$amount}',
				addr = '{$addr}',
				type = '{$type}',
				last_check = now()
				WHERE id = $id")) ? 1 : 0;
		}
		else {
			echo 0;
		}

	}
	elseif($cmd == 'get_historical_price') {
		$symbol = $conn->real_escape_string($_POST['symbol']);
		$exchange = $conn->real_escape_string($_POST['exchange']);
		$ts = $conn->real_escape_string($_POST['trade_date']);
		$ts = strtotime($ts);
		$pairs = $conn->query("SELECT coin_id FROM wm_exchange_rates WHERE coin_id LIKE '%{$symbol}USD%' and exchange = '{$exchange}'")->fetch_object()->coin_id;
		$vspair = str_replace($symbol, '', $pairs);
		$historical_price = get_historical_price($symbol, $vspair, $exchange, $ts);
		echo $historical_price;
	}
	elseif($cmd == 'get_historical_price_pairs') {
		$exchange = $conn->real_escape_string($_POST['exchange']);
		$ts = $conn->real_escape_string($_POST['trade_date']);
		$pair1 = $conn->real_escape_string($_POST['pair1']);
		$pair2 = $conn->real_escape_string($_POST['pair2']);
		$ts = strtotime($ts);
		
		$historical_price = get_historical_price($pair1, $pair2, $exchange, $ts);
		$historical_price = number_format($historical_price, 8);
		echo $historical_price;
	}
	elseif($cmd == 'get_opinions') {
		$pairs = $conn->real_escape_string($_POST['pairs']);
		echo json_encode(get_opinions($pairs));
	}
	elseif($cmd == 'get_exchange_price') {
		$pairs = $conn->real_escape_string($_POST['pairs']);
		$exchange = $conn->real_escape_string($_POST['exchange']);
		if($exchange == 'Bitfinex') {
			$price = json_decode(_curl($arr_urls["bitfinex_ticker"].$pairs));
			$price = $price->last_price;
		}
		elseif($exchange == 'Binance') {
			$price = $conn->query("SELECT coin_price FROM wm_exchange_rates WHERE coin_id LIKE '%{$pairs}%' and exchange = '{$exchange}'")->fetch_object()->coin_price;
		}
		echo $price;
	}
	elseif($cmd == 'add_holding_online') {
		$json = json_decode($_POST['data']);
		$exchange = $conn->real_escape_string($json[0]->value);
		$coin_id = $conn->real_escape_string($json[1]->value);
		$amount = $conn->real_escape_string($json[2]->value);
		$bought_at = $conn->real_escape_string($json[3]->value);
		$trade_date = $conn->real_escape_string($json[4]->value);
		$pair_price = (isset($json[5]->value)) ? $conn->real_escape_string($json[5]->value) :  '';
		$trade_date = strtotime($trade_date);

		$trade = $_POST['trade'] == 'buy' ? 0 : 1;

		$symbol = substr($coin_id, 0, 3) . str_replace($arr_pairs, '', substr($coin_id, 3, strlen($coin_id) - 3));
		$coin_pair = str_replace($symbol, '', $coin_id);;

		if(is_numeric($amount) &
		is_numeric($bought_at) &
		!empty($exchange) &
		!empty($coin_id)&
		!empty($trade_date)) {
			echo ($conn->query("INSERT INTO wm_onlineholding (exchange, coin_id, amount, bought_at, date_add, trade, date_trade, pair_price) VALUES ('{$exchange}','{$coin_id}','{$amount}',{$bought_at}, NOW(), {$trade}, FROM_UNIXTIME({$trade_date}), '{$pair_price}')")) ? 1 : 0;
		} else {
			echo 0;
		}
	}
	elseif($cmd == 'mod_holding_online') {
		$json = json_decode($_POST['data']);
		$exchange = $conn->real_escape_string($json[0]->value);
		$coin_id = $conn->real_escape_string($json[1]->value);
		$amount = $conn->real_escape_string($json[2]->value);
		$bought_at = $conn->real_escape_string($json[3]->value);
		$trade_date = $conn->real_escape_string($json[4]->value);
		$pair_price = (isset($json[5]->value)) ? $conn->real_escape_string($json[5]->value) :  '';
		$id = $conn->real_escape_string($_POST['id']);
		$trade_date = strtotime($trade_date);

		$trade = $_POST['trade'] == 'buy' ? 0 : 1;

		$symbol = substr($coin_id, 0, 3) . str_replace($arr_pairs, '', substr($coin_id, 3, strlen($coin_id) - 3));
		$coin_pair = str_replace($symbol, '', $coin_id);;
		if(is_numeric($amount) &
		is_numeric($bought_at) &
		!empty($exchange) &
		!empty($coin_id)&
		!empty($trade_date)) {
			echo ($conn->query("UPDATE wm_onlineholding
			SET exchange='{$exchange}', coin_id='{$coin_id}', amount='{$amount}', bought_at={$bought_at}, date_add=NOW(), trade={$trade}, date_trade=FROM_UNIXTIME({$trade_date}), pair_price='{$pair_price}'
			WHERE id={$id}")) ? 1 : 0;
		} else {
			echo 0;
		}

	}
	elseif($cmd == 'get_portfolio') {
		$arr = array();
		$arr_ = array();

		if ($result = $conn->query('SELECT id, coin_id, amount, addr, type, last_check FROM wm_localholding order by type DESC')) {
			while ($row = $result->fetch_row()) {
				$id = $row[0];
				$coin_id = strtoupper($row[1]);
				$type = $row[4];
				$check = $row[5];
				$coin = $conn->query("SELECT symbol, coin_name, price, percent_change_1h, percent_change_24h, percent_change_7d FROM wm_currs WHERE coin_id = '{$coin_id}'")->fetch_object();
				$symbol = $coin->symbol;
				$coin_name = $coin->coin_name;
				$price = $coin->price;
				$percent_change_1h = $coin->percent_change_1h;
				$percent_change_24h = $coin->percent_change_24h;
				$percent_change_7d = $coin->percent_change_7d;
				$addr = $row[3];
				if($type == 0) {
					$amount = $row[2];
				}
				elseif($type == 1) {
					$check = strtotime($check);
					$need = date("Y-m-d H:i:s", strtotime(date("Y-m-d H:i:s", $check)." +10 minutes"));
					$now = date("Y-m-d H:i:s");
					if($now >= $need || $row[2] == '') {
						$amount = get_balance_by_address(strtolower($coin_id), $addr);
						$conn->query("UPDATE wm_localholding SET amount='$amount', last_check=now() WHERE id=$id");
					}
					else {
						$amount = $row[2];
					}
				}
				if(!$price) $price = 'ERROR';
				$arr[] = array($id, $coin_name, $amount, $price, $symbol, $coin_id, $addr, $type, $percent_change_1h, $percent_change_24h, $percent_change_7d);
			}
		}
		if ($result = $conn->query('SELECT id, coin_id, amount, exchange, bought_at, date_add, trade, date_trade, pair_price FROM wm_onlineholding order by date_add DESC')) {
			while ($row = $result->fetch_row()) {
				$id = $row[0];
				$coin_id = strtoupper($row[1]);
				$amount = $row[2];
				$exchange = $row[3];
				$bought_at = $row[4];
				$date_add = $row[5];
				$trade = $row[6];
				$date_trade = $row[7];

				$pair_price_traded = $row[8];

				$symbol = substr($coin_id, 0, 3) . str_replace($arr_pairs, '', substr($coin_id, 3, strlen($coin_id) - 3));
				$coin_pair = str_replace($symbol, '', $coin_id);
				$coin_name = $conn->query("SELECT coin_name FROM wm_currs WHERE symbol = '{$symbol}'");
				$coin_name = $coin_name->num_rows ?  $coin_name->fetch_object()->coin_name : $symbol;
				$price = get_price_by_exchange($exchange, $coin_id);
				$pair_price_now = '';


				if(str_replace($pairs_curr, '', $coin_pair) !== '') {
					$usdpair = $conn->query("SELECT coin_id FROM wm_exchange_rates WHERE coin_id LIKE '%{$coin_pair}USD%' and exchange = '{$exchange}'")->fetch_object()->coin_id;
					$pair_price_now = get_price_by_exchange($exchange, $usdpair);
				}

				if(!$price) $price = 'ERROR';
				$arr_[] = array($id, $coin_name, $amount, $price, $exchange, $bought_at, $date_add, $coin_id, $coin_pair, $symbol, $trade, $date_trade, $pair_price_traded, $pair_price_now);
			}
		}
		echo json_encode(array($arr, $arr_));
	}
	elseif($cmd == 'remove_local_holding') {
		$id = $conn->real_escape_string($_POST['id']);
		settype($id, 'integer');
		echo ($conn->query("DELETE FROM wm_localholding WHERE id = '{$id}'")) ? 1 : null;
	}
	elseif($cmd == 'remove_local_holding_online') {
		$id = $conn->real_escape_string($_POST['id']);
		settype($id, 'integer');
		echo ($conn->query("DELETE FROM wm_onlineholding WHERE id = '{$id}'")) ? 1 : null;
	}
	elseif($cmd == 'get_currencies_by_exchange') {
		$exchange = $_POST['id'];
		$json = array();
		$result = $conn->query("SELECT coin_id FROM wm_exchange_rates WHERE	exchange = '$exchange' AND coin_id <> 'eurusd' AND coin_id <> 'jpyusd' AND coin_id <> 'gbpusd'");
		while ($row = $result->fetch_row()) {
			$json[] .= $row[0];
		}
		sort($json);
		$arr = array();
		foreach($json as $symbol) {
			$pair = strtoupper($symbol);
			$sym = substr($pair, 0, 3) . str_replace($arr_pairs, '', substr($pair, 3, strlen($pair) - 3));
			$sym = $conn->real_escape_string($sym);
			$coin_pair = str_replace($sym, '', $pair);
			$coin_name = $conn->query("SELECT coin_name FROM wm_currs WHERE symbol = '{$sym}'");
			$coin_name = $coin_name->num_rows ?  $coin_name->fetch_object()->coin_name : $sym;
			$arr[] = array($pair, $coin_name, $sym, $coin_pair);
		}
		echo json_encode($arr);
	}
	elseif($cmd == 'get_exchanges') {
		echo json_encode($arr_ex);
	}
	elseif($cmd == 'get_coincapcurrs') {
		$result = $conn->query('SELECT coin_id, coin_name, symbol FROM wm_currs order by coin_name');
		$arr = array();
		while ($row = $result->fetch_row()) {
			$arr[] = array($row[0], ($row[1] . " ({$row[2]})"), $row[2]);
		}
		echo json_encode($arr);
	}
}
$conn->close();
exit;
?>
