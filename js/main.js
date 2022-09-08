$(function() {

	moment.updateLocale('es', null);
	var chart;
	var arr_coinsTraded = [];
	var refresh_check = false;
	var auto_refresh = null;
	var auto_count = null;
	var	table_local = null;
	var	table_orders = null;
	var	table_online = null;
	var arr_exchanges = {'Binance' : 'https://binance.com',	'Bitfinex' : 'https://bitfinex.com'}
	var arr_balances = {'bitcoin' : 'https://blockchain.info/address/',	'ethereum' : 'https://etherscan.io/address/'}

	jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + "px");
    return this;
	}

	function urlify(text) {
		var urlRegex = /(https?:\/\/[^\s]+)/g;
		return text.replace(urlRegex, function(url) {
				return '<a href="' + url + '">' + url + '</a>';
		})
	}
	
	var ID = function () {
		return '_' + Math.random().toString(36).substr(2, 9);
	};

	String.prototype.replaceAll = function(search, replacement) {
		var target = this;
		return target.split(search).join(replacement);
	};

	function dragElement(elmnt) {
		var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
		elmnt.onmousedown = dragMouseDown;

		function dragMouseDown(e) {
			e = e || window.event;
			pos3 = e.clientX;
			pos4 = e.clientY;
			document.onmouseup = closeDragElement;
			document.onmousemove = elementDrag;
		}

		function elementDrag(e) {
			e = e || window.event;
			pos1 = pos3 - e.clientX;
			pos2 = pos4 - e.clientY;
			pos3 = e.clientX;
			pos4 = e.clientY;
			elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
			elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
		}

		function closeDragElement() {
			document.onmouseup = null;
			document.onmousemove = null;
		}
	}

	function getPercent(oldNumber, newNumber){
			return ((oldNumber - newNumber) / oldNumber) * 100;
	}

	function startTimer(duration, display) {
		var timer = duration, minutes, seconds;
		clearInterval(auto_count);
		auto_count = setInterval(function () {
			minutes = parseInt(timer / 60, 10)
			seconds = parseInt(timer % 60, 10);

			minutes = minutes < 10 ? "0" + minutes : minutes;
			seconds = seconds < 10 ? "0" + seconds : seconds;

			$(display).empty().append(minutes + ":" + seconds);

			if (--timer < 0) {
					timer = duration;
					load_portfolio(true);
			}
		}, 1000);
	}

	$('#autoupd').change(function() {

		var _interv = $(this).val();
		var _time = 0;

		clearInterval(auto_count);

		if(_interv == 0) {
			$('#countdown').empty().append("paused");
			return null;
		}
		else if(_interv == 1) {
			_time = (60000);
		}
		else if(_interv == 2) {
			_time = (60000 * 5);
		}
		else if(_interv == 3) {
			_time = (60000 * 10);
		}
		else if(_interv == 4) {
			_time = (60000 * 30);
		}
		else if(_interv == 5) {
			_time = (60000 * 60);
		}

		startTimer((_time / 1000), $('#countdown'));

	});

	$('#btn_refresh_portfolio').click(function() {
		$(this).prop('disabled', true);
		load_portfolio(true);
		$(this).prop('disabled', false);
	});


	$('.submit_holding_online_add').click(function() {
		var amount = $('#input_amountonline').val();
		var coinid = $('#input_coinonlineid').val();
		var boughtat = $('#input_boughtat').val();
		var exchange = $('#input_exchange').val();


		if(isNaN(amount) || (amount < 0)) {

			if($('#alert_online').hasClass('d-none')) $('#alert_online').toggleClass('d-none');
			$('#alert_online').empty().append('Invalid amount.');
			return false
		}

		if(isNaN(boughtat) || (boughtat < 0)) {
			$('#alert_online').empty().append('Invalid trade price.');
			return false
		}

		if((coinid == '') || (coinid == 'Nothing selected')) {
			if($('#alert_online').hasClass('d-none')) $('#alert_online').toggleClass('d-none');
			$('#alert_online').empty().append('Invalid cryptocurrency.');
			return false
		}

		if((exchange == '') || (exchange == 'Nothing selected')) {
			if($('#alert_online').hasClass('d-none')) $('#alert_online').toggleClass('d-none');
			$('#alert_online').empty().append('Invalid exchange.');
			return false
		}

		var _cmd = $('#form_online').attr('data-type') == 'add' ?
		'add_holding_online' :
		$('#form_online').attr('data-type') == 'mod' ?
			'mod_holding_online' :
			'add';

		var _data = { cmd: _cmd, trade: $(this).attr('data-trade'), data: JSON.stringify($('#form_online').serializeArray())}
		if(_cmd == 'mod_holding_online') {
				_data['id'] = $('#remove_this_holding_online').attr('data-id');

		}

		$.ajax({
			url: 'index.php',
			type : "POST",
			data : _data,
			success : function(result) {
				if(result == '1') {
					load_portfolio(true);
					$('#modal_holding_online_add').modal('toggle');
				} else if(result == '0') {
					if($('#alert_online').hasClass('d-none')) $('#alert_online').toggleClass('d-none');
					$('#alert_online').empty().append('Some value are invalid or empty...');
				}
			}
		});

	});

	$('#btn_holding_add_online').click(function() {
		document.getElementById('form_online').reset();
		$('#form_online').attr('data-type', 'add');
		$('#remove_this_holding_online').hide();
		$("#input_exchange").selectpicker("refresh");
		$("#input_coinonlineid").selectpicker("refresh");
		$("#input_coinonlineid").find('option').remove();
		$("#input_boughtat").val('');
		$('#price_crypto').hide();
		
		$('#input_coinonlineid').prop('disabled', true);
		$('#input_amountonline').addClass('disabled').prop('disabled', true);
		$('#input_boughtat').addClass('disabled').prop('disabled', true);
		$('#trade_date').addClass('disabled').prop('disabled', true);
		$('#input_boughtat_date').addClass('disabled').prop('disabled', true);

	});
	
	$('#btn_holding_add').click(function() {
		document.getElementById('form_local').reset();
		$("#input_coinid").selectpicker("refresh");
		if(!$('#form_addr').hasClass('d-none')) $('#form_addr').toggleClass('d-none');
	});
	
	$('#submit_holding_add').click(function() {
		var amount = $('#input_amount').val();
		var coinid = $('#input_coinid').val();
		var addr = $('#input_addr').val();

		if(!$('#input_addr').hasClass('d-none')) {
			if((addr == '') || (addr == 'Nothing selected')) {
				if(!$('#alert_local').hasClass('d-none')) {
					$('#alert_local').empty().append('Invalid address.');
					$('#alert_local').toggleClass('d-none');
					return false;
				}
			}
		}

		if((coinid == '') || (coinid == 'Nothing selected')) {
			console.log(coinid);
			if($('#alert_local').hasClass('d-none')) $('#alert_local').toggleClass('d-none');
			$('#alert_local').empty().append('Invalid cryptocurrency.');
			return false
		}

		if(isNaN(amount) || (amount < 0)) {
			if($('#alert_local').hasClass('d-none')) $('#alert_local').toggleClass('d-none');
			$('#alert_local').empty().append('Invalid amount.');
			return false
		}
		
		var _cmd = $('#form_local').attr('data-type') == 'add' ?
		'add_holding' :
		$('#form_local').attr('data-type') == 'mod' ?
			'mod_holding' :
			'add';

		var _data = { cmd: _cmd, data: JSON.stringify($('#form_local').serializeArray())}
		if(_cmd == 'mod_holding') {
			_data['id'] = $('#remove_this_holding').attr('data-id');
		}
		
		$.ajax({
			url: 'index.php',
			type : "POST",
			data : _data,
			success : function(result) {
				if(result == '1') {
					$('#modal_holding_add').modal('hide');
					load_portfolio(true);
				} else if(result == '0') {
					if($('#alert_local').hasClass('d-none'))$('#alert_local').toggleClass('d-none');
					$('#alert_local').empty().append('some value are invalid or empty...');
				}
			}
		});
	});

	Number.prototype.format = function(n, x, s, c) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
        num = this.toFixed(Math.max(0, ~~n));

    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
	};

	function toDollars(num) {
		return num.replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
	}

	$('#input_amountonline,#input_boughtat,#input_amount').change(function() {
		$(this).val(parseFloat($(this).val().replace(/[^0-9-.]/g, '')));
	});

	$('#input_amountonline, #input_boughtat, #input_amount').on('keydown', function(e){-1!==$.inArray(e.keyCode,[46,8,9,27,13,110,190])||(/65|67|86|88/.test(e.keyCode)&&(e.ctrlKey===true||e.metaKey===true))&&(!0===e.ctrlKey||!0===e.metaKey)||35<=e.keyCode&&40>=e.keyCode||(e.shiftKey||48>e.keyCode||57<e.keyCode)&&(96>e.keyCode||105<e.keyCode)&&e.preventDefault()});


	$('#input_amount').on('keydown', function(e) {
		if (e.which == 13) {
			e.preventDefault();
			$('#submit_holding_add').click();
		}
	})

	$('#input_coinonlineid').change(function (e) {
		var exchange = $('#input_exchange').val();
		var pair = $(this)[0].selectedOptions[0].label;
		if(pair == 'Nothing selected') return 0;
		pair = pair.split('(')[1];
		pair = pair.substring(0, pair.length - 1).split('/');

		$.ajax({
			url: 'index.php',
			type : "POST",
			data : {
				cmd: "get_exchange_price",
				exchange: exchange,
				pairs : pair[0] + pair[1],
			},
			success : function(result) {
				result = JSON.parse(result);
				$('#input_boughtat').val(result);
			}
		});
		if(!isCurr(pair[1])) {
			$('#price_crypto').show();
		}
		else {
			$('#price_crypto').hide();
		}
		$('#trade_conv').empty();
		$('#amount_curr').empty().append(pair[0]);
		$('#boughtat_curr').empty().append(pair[1]);
		$('#input_amountonline').removeClass('disabled').removeAttr('disabled');
		$('#input_boughtat').removeClass('disabled').removeAttr('disabled');
		$('#trade_date').removeClass('disabled').removeAttr('disabled');
		$('#input_boughtat_date').removeClass('disabled').removeAttr('disabled');

	});

	$('#input_coinid').change(function(e) {

		if(!$('#alert_local').hasClass('d-none'))
			$('#alert_local').toggleClass('d-none');

		var pair = (this).selectedOptions[0].label;

		pair = pair.split('(')[1];
		pair = pair.substring(0, pair.length - 1);
		$('#amount_local').empty().append(pair);

		var val = $(this).val();
		if(val == 'ethereum') {
			if($('#form_addr').hasClass('d-none')) $('#form_addr').toggleClass('d-none');

		}
		else if(val == 'bitcoin') {
			if($('#form_addr').hasClass('d-none')) $('#form_addr').toggleClass('d-none');

		}
		else {
			if(!$('#form_addr').hasClass('d-none')) $('#form_addr').toggleClass('d-none');
		}
		
		
		
	});

	$('#remove_this_holding_online').click(function() {
		if(!confirm('Are you sure?')) return 0;
		var _id = $(this).attr('data-id');
		$.ajax({
			url: 'index.php',
			type : "POST",
			data : { cmd: "remove_local_holding_online", id: _id },
			success : function(result) {
				$('#modal_holding_online_add').modal('hide');
				load_portfolio(false);
			}
		});
	});

	$('#remove_this_holding').click(function() {
		if(!confirm('Are you sure?')) return 0;
		var _id = $(this).attr('data-id');
		$.ajax({
			url: 'index.php',
			type : "POST",
			data : { cmd: "remove_local_holding", id: _id },
			success : function(result) {
				$('#modal_holding_add').modal('hide');
				load_portfolio(false);
			}
		});
	});
	
	$('#input_exchange').change(function() {
		$.ajax({
			url: 'index.php',
			type : "POST",
			data : { cmd: "get_currencies_by_exchange", id: $(this).val() },
			success : function(result) {
				var data = JSON.parse(result);
				if(data) {
					$('#input_coinonlineid').empty().append('<option>Nothing selected</option>');
					$(data).each(function(i,v) {
						if(v[3] !== '')
							$('#input_coinonlineid').append('<option value="' + v[0] + '">' + v[1] + ' (' + v[2] + '/' + v[3] +')</option>');
					});
					$('#input_coinonlineid').prop('disabled', false);
					$('#input_coinonlineid').selectpicker('refresh');
				}
			}
		});
	});

	function load_exchanges() {
		$.ajax({
			url: 'index.php',
			type : "POST",
			data : { cmd: 'get_exchanges'},
			success : function(msg) {
				var data = JSON.parse(msg);
				
				$('#input_exchange, #input_orders_exchange').empty().append('<option>Nothing selected</option>');
				$(data).each(function(i,v) {
					$('#input_exchange, #input_orders_exchange').append('<option data-content="<span><img class=\'img_exchange\' src=\'img/svg/' + v.toLowerCase() + '.svg\'/></span>" value="' + v + '">' + v + '</option>');
				});
				$('#input_exchange, #input_orders_exchange').selectpicker('refresh');
			}
		});
	}

	function load_currs() {
		$.ajax({
			url: 'index.php',
			type : "POST",
			data : { cmd: 'get_coincapcurrs' },
			success : function(msg) {
				$('#input_coinid').empty();
				$('#input_coinidfav').empty();
				var data = JSON.parse(msg);
				$('#input_coinid,#input_coinidfav').empty().append('<option>Nothing selected</option>');
				$(data).each(function(i,v) {
					$('#input_coinid,#input_coinidfav').append('<option value="' + v[0] + '">' + v[1] + '</option>');
				});
				$('#input_coinid').selectpicker('render');
				$('#input_coinidfav').selectpicker('render');
			}
		});
	}

	function load_portfolio(refresh_rates) {
		console.log('updating portfolio..');
		$.ajax({
			url: 'index.php',
			type : "POST",
			data : { cmd: 'update_db', data: (refresh_rates ? 1 : 0) },
			beforeSend : function() {
				$('#loading').css('display' , 'flex');
			},
			success : function() {
				$.ajax({
					url: 'index.php',
					type : "POST",
					data : { cmd: 'get_portfolio' },
					success : function(result) {
						var data
						if(result) {
							try {
								data = JSON.parse(result);
							} catch(e) {
								console.log(e);
							}
						}
						var holding_local_total = 0;
						var holding_online_total = 0;
						var holding_all = 0;
						var exchanges_balances = {'Binance'  : 0, 'Bitfinex' : 0};
						
						if(data) {
							if(table_local !== null) table_local.destroy();
							if(table_online !== null) table_online.destroy();
							
							$('#table_coinlist tbody').empty();
							$('#table_onlinelist tbody').empty();
							//Local holdings
							$(data[0]).each(function(i,v) {

								var id = v[0];
								var coin_name = v[1];
								var amount = v[2];
								var price = v[3];
								var symbol = v[4];
								var coin_id = v[5];
								var addr = v[6];
								var type = v[7];
								var percent_change_1h = v[8];
								var percent_change_24h = v[9];
								var percent_change_7d = v[10];
								var amount_label = (type == 0) ? amount : '<a class="chart_label" href="' + arr_balances[coin_name.toLowerCase()] + addr + '" target="_blank">' + amount + '</a>';
								var total = toDollars((amount * price).toFixed(2));
								var chart_link = 'https://coinmarketcap.com/currencies/' + coin_id;
								var coin_icon = '<img class="mr-2 coin_svg" src="img/coinspng/' + symbol + '.png" onerror="this.onerror=null;this.src=\'img/svg/noicon.svg\';">';								
								var loc_attrs = 'data-id="' + id + '" '+ 
																'data-coin_id="' + coin_id + '" ' + 
																'data-amount="' + amount + '" ' +
																'data-addr="' + addr + ' "';
								
								var buttons = '<button ' + loc_attrs + ' class="btn btn-link edit_local"><i class="far fa-edit"></i></button>';
								
								$('#table_coinlist tbody').append('<tr>' +
									'<td data-order="' + coin_name + '" class="chart_label">' + coin_icon + '<a href="' + chart_link + '" target="_blank">' + coin_name + '<span class="coin_symbol">(' + symbol + ')</span></a></td>' +
									'<td data-order="' + amount + '">' + amount_label + '</td>' +
									'<td data-order="' + price + '">' + toDollars((price * 1).toFixed(2)) + '$</td>' +
									'<td data-order="' + percent_change_1h + '" class="percent_1 ' + ((percent_change_1h > 0 ) ? 'positive' : 'negative') + '">' + percent_change_1h + '%</td>' +
									'<td data-order="' + percent_change_24h + '" class="percent_1 ' + ((percent_change_24h > 0 ) ? 'positive' : 'negative') + '">' + percent_change_24h + '%</td>' +
									'<td data-order="' + percent_change_7d + '" class="percent_1 ' + ((percent_change_7d > 0 ) ? 'positive' : 'negative') + '">' + percent_change_7d + '%</td>' +
									'<td data-order="' + total + '" class="row_total">' + total + '$</td>' +
									'<td class="text-center">' + buttons + '</td></tr>');

								arr_coinsTraded.push(symbol);
								
								arr_coinsTraded.push(coin_name);
								
								holding_local_total += (amount * price);
							});

							//Online holdings
							$(data[1]).each(function(i,v) {

								var id = v[0];
								var coin_name = v[1];
								var amount = v[2];
								var price = v[3];
								var exchange = v[4];
								var bought_at = v[5];
								var date_add = v[6];
								var coin_id = v[7];
								var coin_pair = v[8];
								var coin_symbol = v[9];
								var trade = v[10];
								var date_trade = v[11];
								var pair_price = v[12];
								var pair_price_now = v[13];

								var id_cell = '<td>' + id + '</td>';
								var coin_icon = '<img class="mr-2 coin_svg iconfix" src="img/coinspng/' + coin_symbol + '.png" onerror="this.onerror=null;this.src=\'img/svg/noicon.svg\';">';
								var exchange_cell = '<td data-order="' + exchange + '"><a href="' + arr_exchanges[exchange] + '" target="_blank"><div class="' + exchange + '-logo exchange-logo" /></a></td>';
								var coin_cell = '<td data-order="' + coin_name + '" class="chart_label position-relative" data-exchange="' + exchange + '" data-pair="' + coin_id + '"><div class="td_chart_icon d-none d-md-inline"><i class="fas fa-chart-bar"></i></div>' + coin_icon + '<a class="d-inline d-lg-none" data-coinpair="' + coin_id + '" >' + coin_symbol + '</span></a><a class="d-none d-lg-inline" data-coinpair="' + coin_id + '" >' + coin_name + '<span class="coin_symbol">(' + coin_symbol + ')</span></a></td>';

								var mod_attrs =
									'data-id="' + id + '" ' +
									'data-exchange="' + exchange + '" ' +
									'data-date_add="' + date_add + '" ' +
									'data-bought_at="' + bought_at + '" ' +
									'data-amount="' + amount + '" ' +
									'data-price="' + price + '" ' +
									'data-coin_id="' + coin_id + '" ' +
									'data-date_trade="' + date_trade + '" ' +
									'data-pair_price="' + pair_price + '" ' +
									'data-pair_price_now="' + pair_price_now + '" ';


								var buttons_cell = '<td data-order="' + id + '" class="text-center"><button ' + mod_attrs + ' class="btn btn-default btn-link edit_trade"><i class="far fa-edit"></i></button></td>';
								var trade_icon = (trade == 0) ? '<i class="fas fa-arrow-up arrow arrow_buy"></i>' : '<i class="fas fa-arrow-down arrow arrow_sell"></i>';
								var amount_cell = '<td data-order="' + amount + '">' + trade_icon + amount.substring(0, 11) + '</td>';

								var total = (price * amount);
								var total_old = (bought_at * amount);
								var total_r = (trade == 0) ? total : total_old;

								var diff = (trade == 0) ? (total - total_old) : (total_old - total);
								var	diff_percentage = parseFloat(getPercent(total_old, total)).toFixed(2);

								diff_percentage = diff_percentage.replace('-', '').replace('+', '');
								diff_percentage = (diff < 0 ) ? '-' + diff_percentage : diff_percentage;

								var diff_porn = (diff < 0 ) ? 'diff_negative' : 'diff_positive';

								var data_attrs = 'data-diff="' + diff + '" ' +
									'data-date_add="'+ date_add + '" ' +
									'data-date_trade="'+ date_trade + '" ' +
									'data-coinsymbol="' + coin_symbol + '" ' +
									'data-coinpair="' + coin_pair +  '" ' +
									'data-tradeat="' + bought_at +  '" ' +
									'data-trade="' + trade +  '" ' +
									'data-total_old="' + total_old +  '" ' +
									'data-diff_percentage="' + diff_percentage +  '" ' +
									'data-total="' + total + '" ' +
									'data-price="' + price + '" ' +
									'data-amount="' + amount + '" ';
									
								arr_coinsTraded.push(coin_symbol);
								arr_coinsTraded.push(coin_name);
								
								if(isCurr(coin_pair)) {

									data_attrs += 'data-vs="curr" ';

									var bought_cell = '<td>' + toDollars((bought_at * 1).toFixed(2)) + '<span class="coin_pair_"> ' + coin_pair + '</span></td>';
									var price_cell = '<td>' + toDollars((price * 1).toFixed(2)) + '<span class="coin_pair_"> ' + coin_pair + '</span></td>';

									//CRYPTO/USD
									var total_cell = '<td data-order="' + total_r + '" class="row_total">' + toDollars((total_r * 1).toFixed(2)) + '<span class="coin_pair_"> ' + coin_pair + '</span></td>';

									var cell_diff = '<td data-order="' + diff_percentage + '" ' + data_attrs + ' class="td_diff td_' + diff_porn + '">' +
											'<span class="diff_2 ' + diff_porn + ' col_' + diff_porn + ' percent ">' + diff_percentage + '%</span>' +
											'<div class="diff_block">' +
												'<span class="diff_1 ' + diff_porn + '">' + toDollars((diff * 1).toFixed(2))  + ' <span class="coin_pair_"> ' + coin_pair + '</span></span>' +
												'<span class="diff_1 ' + diff_porn + '">' + (diff / price).toFixed(2) + ' <span class="coin_pair_">' + coin_symbol + '</span></span>' +
											'</div>' +
										'</td>';

									holding_online_total += total_r;
									exchanges_balances[exchange] += total_r;

								} else {

									data_attrs += 'data-vs="crypto" data-conv="' + pair_price_now + '" data-conv2="' + pair_price + '"';

									var bought_cell = '<td>' + bought_at.substring(0, 12) + ' ' + '<span class="coin_pair_"> ' + coin_pair + '</span>' +
										'<div class="short-div">' +
											'<span class="total_3">1 ' + coin_pair + ' = ' + toDollars((pair_price * 1).toFixed(2)) + '$</span>' +
										'</div></td>';

									var price_cell = '<td>' + price.substring(0, 12) + ' ' + '<span class="coin_pair_"> ' + coin_pair +
										'<div class="short-div">' +
											'<span class="total_3">1 ' + coin_pair + ' = ' + toDollars((pair_price_now * 1).toFixed(0)) + '$</span>' +
										'</div></span></td>';


									var total_cell = '<td data-order="' + (total_r * pair_price_now) + '" class="row_total"><div class="short-div">' +
											'<span class="total_1">' +	total_r.toFixed(6) + '<span class="coin_pair_"> ' + coin_pair + '</span></span>' +
										'</div>' +
										'<div class="short-div">' +
											'<span class="total_2">' + toDollars((total_r * pair_price_now).toFixed(2)) + '$</span>' +
										'</div></td>';


									var cell_diff = '<td data-order="' + diff_percentage + '" ' + data_attrs + ' class="td_diff td_' + diff_porn + '">' +
											'<span class="diff_2 ' + diff_porn + ' col_' + diff_porn + ' percent">' + diff_percentage + '%</span>' +
											'<div class="diff_block">' +
												'<span class="diff_1 ' + diff_porn + '">' + diff.toFixed(6) + ' <span class="coin_pair_">' + coin_pair + '</span></span>' +
												'<span class="diff_1 ' + diff_porn + '">' + toDollars((diff * pair_price_now).toFixed(2)) + '<span class="coin_pair_"> USD</span></span>' +
											'</div>' +
										'</td>';

									holding_online_total += (total_r * pair_price_now);
									exchanges_balances[exchange] += (total_r * pair_price_now);
								}

								$('#table_onlinelist tbody').append('<tr>' +
									exchange_cell +
									coin_cell +
									amount_cell +
									bought_cell +
									price_cell +
									total_cell +
									cell_diff +
									buttons_cell + '</tr>');

							});

							holding_all += holding_local_total;
							holding_all += holding_online_total;

							$('#table_onlinelist .chart_label').click(function() {
								setChart(this);
							});

							var popover_html = '<ul class="list-group"><li class="list-group-item"><div class="exchange-logo Bitfinex-logo"></div><span class="popover_money">' + toDollars((exchanges_balances['Bitfinex']).toFixed(2)) + '$</span></li>' +
																 '<li class="list-group-item"><div class="exchange-logo Binance-logo"></div><span class="popover_money">' + toDollars((exchanges_balances['Binance']).toFixed(2)) + '$</span></li></ul>' ;

							$('#totalholding_online').attr('data-content', popover_html).popover({trigger : 'hover'});

							$('#totalholding_online').empty().append(toDollars((holding_online_total).toFixed(2)) + '$');
							$('#totalholding_all').empty().append(toDollars((holding_all).toFixed(2)) + "$");
							$('#totalholding_local').empty().append(toDollars((holding_local_total).toFixed(2)) + "$");

							$('.td_diff').click(function() {
								var date_add = $(this).attr('data-date_add');
								var date_trade = $(this).attr('data-date_trade');

								var trade = ($(this).attr('data-trade') == 0) ? 'buy' : 'sell'
								var trade2 = (trade == 'buy' ? 'sell' : 'buy');

								var amount = $(this).attr('data-amount');
								var price = $(this).attr('data-price');

								var coinsymbol = $(this).attr('data-coinsymbol');
								var coinpair = $(this).attr('data-coinpair');
								var tradeat = $(this).attr('data-tradeat');

								var diff_percentage = $(this).attr('data-diff_percentage');
								var diff = $(this).attr('data-diff').substring(0, 10);
								var conversion = $($(this).find('.diff_1')[1]).text();
								var total_old = (amount * tradeat);
								var total = $(this).attr('data-total').substring(0, 10);

								var total2 = $(this).closest('tr').find('.total_2').text();
								var conv = $(this).attr('data-conv');
								var conv2 = $(this).attr('data-conv2');
								var vs = $(this).attr('data-vs');
								var total2_conv = (total_old * conv2);
								total2_conv = total2_conv ? toDollars((total2_conv * 1).toFixed(2)) + ' USD' : '';

								//trade1
								$('.pl_trade').html('<i class="fas fa-arrow-' + (trade == 'buy' ? 'up' : 'down') + ' arrow arrow_' + trade + '"></i>' + trade.toUpperCase());
								$('.pl_amount').text(amount);
								$('.pl_price_old').text(tradeat);
								$('.pl_total_old').text(amount * tradeat);
								$('.pl_total_old2').text(total2_conv);

								//trade2
								$('.pl_price_now').text(price);
								$('.pl_trade2').html('<i class="fas fa-arrow-' + (trade == 'buy' ? 'down' : 'up') + ' arrow arrow_' + trade2 + '"></i>' + trade2.toUpperCase());

								$('.pl_total2').text('');

								if(trade2 == 'sell') {
									$('.pl_amount2').text(amount);
									$('.pl_total').text(total);
									var total_t = conv ? ((amount * price) * conv).toFixed(2).toString() + '$' : '';
									$('.pl_total2').text(toDollars(total_t));
								}
								else if(trade2 == 'buy') {
									var amount_now = null;
									var total_now = null;
									var total_conv = null;

									if(vs == 'crypto') {
										amount_now = (total_old / price).toFixed(8);
										total_now = (amount_now * price).toFixed(8);
										total_conv = toDollars((total_now * conv2).toFixed(2)) + ' USD';
									}
									else if(vs == 'curr') {
										amount_now = (total_old / price).toFixed(8);
										total_now = toDollars((amount_now * price).toFixed(2));
									}

									amount_now = amount_now ? amount_now : '';
									total_now = total_now ? total_now : '';
									total_conv = total_conv ? total_conv : '';
									$('.pl_total2').text(total_conv);
									$('.pl_amount2').text(amount_now);
									$('.pl_total').text(total_now);
								}

								if(conv && conv2) {
									$('.pl_date_conv1').text('1 ' + coinpair + ' = ' + conv2 + '$');
									$('.pl_date_conv2').text('1 ' + coinpair + ' = ' + conv + '$');
								}
								else {
									$('.pl_date_conv1').empty();
									$('.pl_date_conv2').empty();
								}

								$('.pl_diff_pair').text(coinpair);
								$('.pl_symbol').text(coinsymbol);
								$('.pl_percent').text(diff_percentage + '%');
								$('.pl_diff').text(diff);
								$('.pl_date_add').text(date_trade);
								$('.pl_diff2').text(conversion);

								$('#date_add').text('DATE ADD: ' + date_add);
								$('#modal_plinfo').modal('show');
							});


							$('.edit_trade').click(function() {

								var exchange = $(this).attr('data-exchange');
								var date_add = $(this).attr('data-date_add');
								var bought_at = $(this).attr('data-bought_at');
								var amount = $(this).attr('data-amount');
								var price = $(this).attr('data-price');
								var coin_id = $(this).attr('data-coin_id');
								var date_trade = $(this).attr('data-date_trade');
								var pair_price = $(this).attr('data-pair_price');
								var pair_price_now = $(this).attr('data-pair_price');
								var _id = $(this).attr('data-id');

								$('#input_exchange').selectpicker('val', exchange);
								$('#input_amountonline').val(amount);
								$('#remove_this_holding_online').attr('data-id', _id).show();

								var loop = setInterval(function() {
									if($('#input_coinonlineid').find('option').length > 0 ) {
										clearInterval(loop);
										$('#input_coinonlineid').selectpicker('val', coin_id);
										$('#trade_date').val(date_trade);
										var loop2 = setInterval(function() {
											if($('#input_boughtat').val() > 0) {
												clearInterval(loop2);
												$('#input_boughtat').val(bought_at);
												$('#input_boughtat_date').val(pair_price);
												$('#form_online').attr('data-type', 'mod');
												$('#modal_holding_online_add').modal('show');
											}
										}, 200);
									}
								}, 200);
								
							});							
						}	
						
						$('.edit_local').click(function() {
								var coin_id = $(this).attr('data-coin_id');
								var amount = $(this).attr('data-amount');
								var addr = $(this).attr('data-addr');
								var _id = $(this).attr('data-id');
								
								
								if(!$('#form_addr').hasClass('d-none')) $('#form_addr').toggleClass('d-none');
								$('#modal_holding_add .modal-title').text('Modify holding');
								$('#input_coinid').selectpicker('val', coin_id.toLowerCase());
								$('#input_amount').val(amount);
								$('#input_addr').val(addr);
								$('#remove_this_holding').attr('data-id', _id).show();
								
								$('#form_local').attr('data-type', 'mod');
								$('#modal_holding_add').modal('show');

						});
						
						table_local = $('#table_coinlist').DataTable({
							"bjQueryUI" : true,
							"info": false,
							"bLengthChange": false
						});
						
						table_online = $('#table_onlinelist').DataTable({
							"bjQueryUI" : true,
							"info": false,
							"bLengthChange": false
						});
						
						$('.change_len_online').removeClass('setactive');
						$('.change_len_online[data-val="' + table_online.page.len() + '"]').addClass('setactive');
						$('.change_len_local').removeClass('setactive');
						$('.change_len_local[data-val="' + table_local.page.len() + '"]').addClass('setactive');
						
						$('#loading').css('display' , 'none');	
						refresh_mods();				
										
	
					}
				});
			}
		});
	};
	
	$('#search_online_text').on('input', function() {
		table_online.search($(this).val()).draw();
	});
	$('#search_local_text').on('input', function() {
		table_local.search($(this).val()).draw();
	});
	
	$('.change_len_online').click(function() {
		var len = $(this).attr('data-val');
		$('.change_len_online').removeClass('setactive');
		$(this).addClass('setactive');
		table_online.page.len(len).draw();
	});
	
	$('.change_len_local').click(function() {
		var len = $(this).attr('data-val');
		$('.change_len_local').removeClass('setactive');
		$(this).addClass('setactive');
		table_local.page.len(len).draw();
	});
	
	$('.search_button').click(function() {
		var id = '#' + $(this).attr('data-id');
		$(id).toggle();
		if($(id).is(':visible')) $(id).focus();
	
	});
	
	function setChart(element) {
		var chart_w = $("#quick_chart").width();
		var chart_h = $("#quick_chart").height();
		var margin = 150;

		var _exchange = $(element).attr('data-exchange');
		var _pair = $(element).attr('data-pair');
		var chart_link = 'https://www.tradingview.com/chart/?symbol=' + _exchange + ':' + _pair;

		chart = new TradingView.widget({
			"width" : chart_w,
			"height" : chart_h,
			"symbol" : _exchange + ":" +_pair,
			"interval" : "240",
			"timezone" : "Europe/London",
			"theme" : "Dark",
			"style" : "1",
			"locale" : "en",
			"toolbar_bg" : "#f1f3f6",
			"enable_publishing" : false,
			"hideideas" : true,
			"save_image" : false,
			"hide_side_toolbar" : false,
			"studies" : [
				"RSI@tv-basicstudies",
				"StochasticRSI@tv-basicstudies",
				"MACD@tv-basicstudies"
			],
			"container_id": "quick_chart"});

		$("#quick_chart").prepend(
			'<div id="ideas_chart_block"><div id="idea_loading"><div class="loader"></div></div></div>' +
				'<div id="chart_buttons">' +
					'<div id="move_chart" class="chart_btn"><i class="fas fa-arrows-alt"></i></div>' +
					'<div id="ideas_chart" data-pairs="' + _pair + '" class="chart_btn"><i class="fas fa-lightbulb"></i></div>' +
					'<div id="open_ext" class="chart_btn"><a href="' + chart_link + '" target="_blank"><i class="fas fa-external-link-square-alt"></i></a></div>' +
					'<div id="hide_chart" class="chart_btn"><i class="fas fa-times"></i></div>' +
				'</div>' +
			'</div>'
		)
		.center()
		.show();

		$.ajax({
			url: 'index.php',
			type : "POST",
			data : { cmd: 'get_opinions', pairs : _pair },
			success : function(result) {

				var json = JSON.parse(result);

				$(json).each(function(i,v) {
					var title = v[0];
					var username = v[1];
					var img = v[2];
					var time = v[3];
					var description = v[4];
					var time_frame = v[5];
					var suggest = v[6];
					var like_score = v[7];
					var user_img = v[8];
					var idea_url = v[9];
					var views = v[10];
					var comments = v[11];
					var id = v[12];

					suggest = (suggest !== '') ? '<span class="idea_label ' + suggest.toLowerCase() + '">' + suggest + '</span>' : '';

					var time_moment = moment.unix(time).format("MM/DD/YYYY HH:mm:ss");

					var time_text =
					moment().diff(time_moment, 'hours') ?
						moment().diff(time_moment, 'hours') > 23 ?
						moment().diff(time_moment, 'days') + ' d' :
						moment().diff(time_moment, 'hours') + ' h' :
					moment().diff(time_moment, 'minutes') + ' m';

					var idea_block = '<div class="row idea_block">' +
						'<div class="col-12">' +
							'<div class="mb-2 position-relative">' +
								'<div class="idea_userimg"><img src="' + user_img + '" class="idea_userimage"/></div>' +
								'<div class="idea_title"><a href="https://www.tradingview.com' + idea_url + '" target="_blank">' + title.substring(0, 58)  + '</a></div>' +
								'<div class="idea_username"><a href="https://www.tradingview.com/u/' + username + '/" target="_blank">' + username + '</a></div>' +
								'<div class="idea_time">' + time_text + '</div>' +
							'</div>' +
							'<div class="position-relative mb-2">' +
								'<img src="' + img + '" class="idea_img" data-id="' + id +'" data-idea-title="' + title + '" data-idea-description="' + description + '" />' +
								'<div class="idea_desc">' + description + '</div>' +
							'</div>' +
							'<div class="idea_pairs">' +
								'<a href="https://www.tradingview.com/symbols/'+ _pair + '/" target="_blank">' + _pair + '</a>, ' + time_frame + suggest +
								'<div class="idea_social">' +
									'<i class="fas fa-thumbs-up mr-2"></i>' + like_score +
									'<i class="fas fa-eye ml-4 mr-2"></i>' + views +
									'<i class="fas fa-comment ml-4 mr-2"></i>' + comments +
								'</div>'
							'</div>' +
						'</div>' +
					'</div>';

					$('#ideas_chart_block').append(idea_block);

				});

				$('.idea_img').click(function() {
					$('#iframe_idea').hide();
					var id = $(this).attr('data-id');
					var title = $(this).attr('data-idea-title');
					var description = $(this).attr('data-idea-description');
					$('#modal_idea').find('.modal-body').empty().append(
						'<div id="idea_loading_chart">' +
							'<div class="loader"></div>' +
						'</div>' +
						'<iframe id="iframe_idea" src="" frameborder="0" width="1000" height="500"></iframe>' +
						'<p>' + description + '</p>'
					);
					$('#modal_idea').find('.modal-title').empty().append(title);
					$('#iframe_idea').on('load', function() {
						$('#idea_loading_chart').fadeOut('fast', function() {
							$(this).remove();
							$('#iframe_idea').fadeIn();
						});
					})
					.attr('src', 'https://www.tradingview.com/embed/' + id);

					$('#modal_idea').modal();
				});

				$('.idea_block').mouseenter(function() {
					$($(this).find('.idea_desc')[0]).show('fast');
				})
				.mouseleave(function() {
					$($(this).find('.idea_desc')[0]).hide('fast');
				});

				$('#idea_loading').fadeOut('normal', function() {
					$(this).remove();
				});
			}
		});

		$('#hide_chart').click(function() {
			$('#quick_chart').hide();
		});

		$('#ideas_chart').click(function() {
			$('#ideas_chart_block').slideToggle();
		});

		dragElement(document.getElementById(("quick_chart")));
	}

	$('#fav_add').click(function() {
		if(!$('#alert_fav').hasClass('d-none')) $('#alert_fav').toggleClass('d-none');
		$('#modal_fav').modal('show');
	});

	$('#submit_fav').click(function() {
		var coinid = $('#input_coinidfav').val();
		if((coinid == '') || (coinid == 'Nothing selected')) {
			if(!$('#alert_fav').hasClass('d-none')) $('#alert_fav').toggleClass('d-none');
			$('#alert_fav').empty().append('Invalid cryptocurrency.');
			return false
		}

		$.ajax({
			url: 'index.php',
			type : "POST",
			data : { cmd: "add_fav", id: coinid },
			success : function(result) {
				if(result == '1') {
					load_favs();
					$('#modal_fav').modal('toggle');
					$('#modal_fav').modal('toggle');
				} else if(result == '0') {
					if($('#alert_fav').hasClass('d-none')) $('#alert_fav').toggleClass('d-none');
					$('#alert_fav').empty().append('some value are invalid or empty...');
				} else if(result == '2') {
					if($('#alert_fav').hasClass('d-none')) $('#alert_fav').toggleClass('d-none');
					$('#alert_fav').empty().append('This curr are already in fav list.');
				}
			}
		});
	});

	function load_favs() {
		$('.fit').css('opacity', '0.4');
		$.ajax({
			url: 'index.php',
			type : "POST",
			data : { cmd: "get_favs"},
			success : function(result) {
				var json
				if(result) {
					try {
						json = JSON.parse(result);
					} catch(e) {
						console.log(e);
					}
				}
				$('.fit').remove();
				
				var interval = $('.fav_time_set.setactive').attr('data-val') ? $('.fav_time_set.setactive').attr('data-val'): '1d';
				console.log(interval);
				console.log($('.fav_time_set.setactive').attr('data-val'));

				var d = (interval == '1d') ? 'percent_change_24h' : 'percent_change_7d';
				$(json).each(function(i, v) {
					var porn = v[d] < 0 ? 'negative' : 'positive';
					var img = '<img class="mr-1 coin_svg_fav" src="img/coinspng/' + v["symbol"] + '.png" onerror="this.onerror=null;this.src=\'img/svg/noicon.svg\';">';
					var info = 
						'<div data-id="' + v['db_id'] + '" class="fav_close">' +
							'<span aria-hidden="true">&times;</span>' +
						'</div>' +
						'<div data-percent="' + v['percent_change_24h'] + '" data-cid="' + v['chart_url'] + '" data-time="1d" class="fav_qchange">1d</div>' +
						'<div data-percent="' + v['percent_change_7d'] + '" data-cid="' + v['chart_url'] + '" data-time="7d" class="fav_qchange">7d</div>' +
						'<div class="fav_info">' +
							'<span class="fav_sym"><a target="_blank" href="https://coinmarketcap.com/currencies/' + v['coin_id'] + '">' + v['symbol'] + '</a></span>' +
							'<span class="fav_title"><div class="fav_ttext">' + img + v['coin_name'] + '</div><span class="ml-1 percent_1 ' + porn + '">(' + v[d] + '%)</span></span>' +
							'<span class="fav_price">' + v['price'].substring(0, 8) + '$</span>' +
							'<span class="fav_cap">CAP: ' + parseFloat(v['market_cap_usd']).format() + '$</span>' +
						'</div>';

					var rid = Date.now();
					var block = $('<div>')
						.addClass('col-6 favs_item fit')
						.css('background-image', 'url(https://s2.coinmarketcap.com/generated/sparklines/web/' + interval + '/usd/' + v['chart_url'] + '.png)')
						.attr('id', rid)
						.append(info);

					$('#favs_block').prepend(block);

					$('.fav_qchange').click(function() {
						var interval = $(this).attr('data-time');
						var cid = $(this).attr('data-cid');
						var perc = $(this).attr('data-percent');
						var neg = perc < 0 ? 'negative' : 'positive';
						var percent = $(this).closest('.fit').find('.percent_1');
						$(this).closest('.fit').css('background-image', 'url(https://s2.coinmarketcap.com/generated/sparklines/web/' + interval + '/usd/' + cid + '.png)');
						$(percent).empty().removeClass('negative').removeClass('positive').addClass(neg).append('(' + perc + '%)')
					});

					$('.fav_close').click(function() {
						$.ajax({
							url: 'index.php',
							type : "POST",
							data : { cmd: "delete_fav", id: $(this).attr('data-id')}
						});
						$(this).closest('.favs_item').remove();
					});

				});
				$('.fit').css('opacity', '1');
			}
		});

	}

	$('.fav_time_set').click(function() {
		$('.fav_time_set').removeClass('setactive');		
		$(this).addClass('setactive');
		load_favs();
	});

	$.fn.datetimepicker.Constructor.Default.icons = {
		time:     'far fa-clock',
		date:     'far fa-calendar-alt',
		up:       'fas fa-arrow-up',
		down:     'fas fa-arrow-down',
		previous: 'fas fa-chevron-left',
		next:     'fas fa-chevron-right',
		today:    'far fa-calendar-check',
		clear:    'fas fa-trash-alt',
		close:    'fas fa-times'
	};

	$('#trade_date').on('change', function() { var date = moment($(this).val()).format('MM/DD/YYYY h:mm:ss A');	$(this).val(date); });
	
	function checkTradeDate() {
		var ts = $('#trade_date').val();
		var exchange = $('#input_exchange').val();
		var coin_pair = $('#boughtat_curr').text();
		var coin_pair2 = $('#amount_curr').text();
		if(!isCurr(coin_pair)) {
			$.ajax({
				url: 'index.php',
				type : "POST",
				data : {
					cmd: "get_historical_price",
					'exchange': exchange,
					symbol : coin_pair,
					trade_date : ts
				},
				success : function(result) {
					$('#input_boughtat_date').val(result);
				}
			});
			$.ajax({
				url: 'index.php',
				type : "POST",
				data : {
					cmd: "get_historical_price_pairs",
					'exchange': exchange,
					pair2 : coin_pair,
					pair1 : coin_pair2,
					trade_date : ts
				},
				success : function(result) {
					$('#input_boughtat').val(result);
				}
			});
		}
		else {
			var coin_pair = $('#amount_curr').text();
			$.ajax({
				url: 'index.php',
				type : "POST",
				data : {
					cmd: "get_historical_price",
					'exchange': exchange,
					symbol : coin_pair,
					trade_date : ts
				},
				success : function(result) {
					$('#input_boughtat').val(result);
				}
			});
		}
	}
	
	$('#trade_date').on('blur.datetimepicker', function(e) {
		checkTradeDate();
	});

	function isCurr(coin_pair)  {
		return (coin_pair.toUpperCase() !== 'USD' &&
			 coin_pair.toUpperCase() !== 'USDT' &&
			 coin_pair.toUpperCase() !== 'EUR' &&
			 coin_pair.toUpperCase() !== 'JPY' &&
			 coin_pair.toUpperCase() !== 'GBP') ? false : true;
	}
	function load_calendar(page) {
		page = page ? page : 1;
		$('.cal_block').css('opacity', '0.3');
		$('#btn_cal').html('<i class="fas fa-spinner fa-spin"></i>');
		$.ajax({
			url: 'index.php',
			type : "POST",
			data : {
				cmd: "get_calendar",
				'page': page,
			},
			success : function(result) {
				var content = '';
				var traded_count = 0;
				var json = JSON.parse(result);
				last_check = json['last_check'];
				json = JSON.parse(json['data']);

				$(json).each(function(i, v) {
					var title = v[1];
					var subtitle = v[2];
					var description = v[3];
					var img = v[4];
					var date = v[0];
					var url = v[5];
					var votes = v[6];
					var percent_real = v[7];

					var symbol = title.substring(title.indexOf('(')).replace('(', '').replace(')', '');
					var votes = votes ? votes.replace('(', '').replace(')', '') : 0;

					var arr_coins = arr_coinsTraded;
					var isTraded = check_coin(symbol);
					if(isTraded) traded_count++;
					content +=
					'<div data-url="' + url + '" class="cal_block' + (isTraded ? ' traded' : '') + '">' +
						'<div class="cal_votes">' + votes + '<br/>' + (percent_real * 1).toFixed(0) + '% real</div>' +
						'<div class="cal_img"><img class="coin_svg" src="img/coinspng/' + symbol + '.png" onerror="this.onerror=null;this.src=\'img/svg/noicon.svg\';"></img></div>' +
						'<div class="cal_date">' + date + '</div>' +
						'<div class="cal_title">' + title + '</div>' +
						'<div class="cal_subtitle">' + subtitle + '</div>' +
						'<div class="cal_info">' + description + '</div>' +
					'</div>';
				});

				if(page == 1) {
					var fcal = $('#cal_back').attr('data-page');
					if(fcal == '0') {
						$('#cal_next').attr('data-page', 2);
						$('#cal_back').attr('data-page', 0);
						$('#popover_cal').html(content);
						$('#pager_num').text(page);
					}
					else {
						var pager = '<div id="cal_pageitor">' +
												'<span class="cal_gopage" id="cal_back" style="display:none" data-page="0"><i class="fas fa-arrow-alt-circle-left"></i></span>' +
												'<span id="pager_num"></span>' +
												'<span class="cal_gopage ml-2" id="cal_next" data-page="2"><i class="fas fa-arrow-alt-circle-right"></i></span>' +
											'</div>';
						traded_count = traded_count > 0 ? traded_count : '';
						$('#cal_new').text(traded_count);
						$('#btn_cal').popover('dispose');
						$('#btn_cal').popover({
							html: true,
							trigger : 'click',
							placement: 'left',
							title: 'CoinMarket Calendar  - Last Check: ' + last_check + pager + '<span class="pop_close">&times;</span>',
							content: content,
							template: '<div class="popover" role="tooltip">' +
													'<div class="arrow"></div>' +
													'<h3 class="popover-header"></h3>' +
													'<div class="popover-body" id="popover_cal"></div>' +
												'</div>'
						})
						.on('show.bs.popover', function() {
								$('.popover').popover('hide')
						})
						.on('shown.bs.popover', function() {
							hideTips();
							$('.pop_close').click(function() {
								$(this).closest('.popover').popover('hide');
							});
							$('#pager_num').text(page);
							$('#cal_back').click(function() {
								var next = $('#cal_next').attr('data-page');
								var back = $(this).attr('data-page');

								$(this).attr('data-page', (back * 1) - 1);
								$('#cal_next').attr('data-page', back);

								load_calendar(back);
							});
							$('#cal_next').click(function() {
								var next = $(this).attr('data-page');
								var back = $('#cal_back').attr('data-page');

								$(this).attr('data-page', (next * 1) + 1);
								$('#cal_back').attr('data-page', next - 1);
								load_calendar(next);
							});

							$('.cal_block').click(function() {
								window.open($(this).attr('data-url'));
							});
						});

					}
					$($('.cal_gopage')[0]).hide();
				}
				else {
					$($('.cal_gopage')[0]).show();
					$('#popover_cal').html(content);
					$('#pager_num').text(page);
					$('.cal_block').click(function() {
						window.open($(this).attr('data-url'));
					});
					$('#btn_cal').popover().on('shown.bs.popover', function() {
						$('.cal_block').click(function() {
							window.open($(this).attr('data-url'));
						});
					});
				}
				$('.cal_block').css('opacity', '1');
				$('#btn_cal').html('<i class="far fa-calendar-alt"></i>');
			}
		});

	}

	function load_config() {

		$.ajax({
			url: 'index.php',
			type : "POST",
			async : false,
			data : {
				cmd: "get_config"
			},
			success : function(result) {
				var json = JSON.parse(result);

				var refresh = json[0][0][2] == '1' ? 'checked' : '';
				refresh_check = json[0][0][2] == '1' ? true : false;

				var content =
        '<form id="form_config">' +
					'<div class="mb-3">' +
            '<input type="checkbox" id="check_refresh" ' + refresh + '>' +
            '<label class="form-check-label ml-2" for="check_refresh">Refresh database at start.</label>' +
          '</div>' +
					'<div class="mb-3">' +
            '<button type="button" class="btn btn-dark btn-sm" id="update_icons">Update</button>' +
            '<div id="icons_pb" class="progress bg-dark">' +
              '<div id="pb_percent"></div>' +
              '<div id="icon_pb" class="progress-bar progress-bar-striped progress-bar-animated pb-update bg-dark text-center" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%"></div>' +
            '</div>' +
            '<label class="form-check-label ml-2" for="check_refresh" id="icons_label">Update icons from coinmarketcap.</label>' +
          '</div>';

				$(json[1]).each(function(i,v) {
					var id_api = 'input_api_' + v['0'];
					var id_key = 'input_key_' + v['0'];
					content +=
						'<div class="api_header">' +
							'<span class="api_title">API</span>' +
							'<img class="img_exchange d-block" src="img/svg/' + (v['0']).toLowerCase() + '-dark.svg"/>' +
							'<a href="' + v['3'] + '" target="_blank" style="font-size: 10px;">' + v['3'] + '</a>'+
						'</div>' +
						'<div class="config-block">' +
							'<div class="form-group row">' +
								'<label for="' + id_api + '" class="col-sm-2 col-form-label  text-right">Key</label>' +
								'<div class="col-sm-9"><input type="text" name="' + id_api +'" id="' + id_api + '" class="form-control form-control-dark blurunfocus" value="' + v['1'] + ' " /></div>' +
							'</div>' +
							'<div class="form-group row">' +
								'<label for="' + id_key + '" class="col-sm-2 col-form-label text-right">Secret</label>' +
								'<div class="col-sm-9"><input type="text" name="' + id_key +'" id="' + id_key + '" class="form-control form-control-dark blurunfocus" value="' + v['2'] + ' " /></div>' +
							'</div>' +
						'</div>'
				});

				content += '<button type="button" id="btn_saveconfig" class="btn btn-dark mt-3 btn-block">Save</button></form>';
				$('#btn_config').popover('dispose');
				var pop = $('#btn_config').popover({
					html: true,
					trigger : 'click',
					placement: 'left',
					title: 'Configuration' + '<span class="pop_close">&times;</span>',
					content: content,
					template: '<div class="popover" role="tooltip">' +
										'<div class="arrow"></div>' +
										'<h3 class="popover-header"></h3>' +
										'<div class="popover-body" id="popover_conf"></div>' +
									'</div>'
				})
				.on('show.bs.popover', function() {
					$('.popover').popover('hide');
				})
				.on('shown.bs.popover', function() {
					$('#check_refresh').bootstrapToggle();
					$('.pop_close').click(function() {
						$(this).closest('.popover').popover('hide');
					});
					hideTips()
					$('.api_header').click(function() {
						$($(this).next('.config-block')[0]).slideToggle();
					});
					$('#btn_saveconfig').click(function() {
						var refresh_check = $('input#check_refresh').is(':checked') ? 1 : 0;
						var bfx_api = $('#input_api_Bitfinex').val();
						var bfx_key = $('#input_key_Bitfinex').val();
						var bnc_api = $('#input_api_Binance').val();
						var bnc_key = $('#input_key_Binance').val();
						$.ajax({
							url: 'index.php',
							type : "POST",
							data : {
								cmd: "save_config",
								'bfx_api' : bfx_api,
								'bfx_key' : bfx_key,
								'bnc_api' : bnc_api,
								'bnc_key' : bnc_key,
								'refresh_check' : refresh_check
							},
							success : function(result) {
								load_config();
							}
						});
					});
          $('#update_icons').click(function(e) {
            $(this).prop('disabled', true);
            $('#icons_pb').show();
            $('#icons_label').hide();
            $.ajax({
              url: 'index.php',
              type : "POST",
              data : {
                cmd: "get_icons_db"
              },
              success: function(e) {

                var data = JSON.parse(e);
                var count = Object.keys(data).length;

                $('#icon_pb')
                  .attr('aria-valuemin', '0')
                  .attr('aria-valuemax', count)

                $(data).each(function(i, v) {
                  var _url = 'https://s2.coinmarketcap.com/static/img/coins/32x32/' + v['id'] + '.png';
                  var _sym = v['symbol'];
                  var percent = getPercent(count, i);
                  percent = 100 - percent;
                  percent = percent.toFixed(2);
                  $.ajax({
                    url: 'index.php',
                    type : "POST",
                    data : {
                      cmd: "upd_icon",
                      url: _url,
                      sym: _sym
                    },
                    success: function(e) {
                      e = JSON.parse(e);
                      $('#pb_percent').html(e[0] + ' - ' + percent + '%');
                      $('#icon_pb')
                      .attr('aria-valuenow', i)
                      .css('width', percent + '%');
                      if(i >= (count - 1)) {
                        $('#icons_pb').hide();
                        $('#icons_label').show();
                        $(this).prop('disabled', false);
                        $('#icons_label').text('Icons updated successfully!!');
                      }
                    }
                  });
                });
              }
            });

          });
				});

			}
		});
	}

	function load_exchanges_data() {
		var apis = 0;
		$('#btn_exch').html('<i class="fas fa-spinner fa-spin"></i>');
		$.ajax({
			url: 'index.php',
			type : "POST",
			data : {
				cmd: "get_exchange_data"
			},
			success : function(result) {
				var json = JSON.parse(result);
				var content = '';
				$(json).each(function(i,v) {
					var btcusd = v['btcusd'] ? v['btcusd'] : 0;
					var exchange = v['exchange'];
					var exchange_balance = 0;
					var balances_content = '';
					if(v['balances'] !== 'noapi') {
						++apis;
						$(v['balances']).each(function(y, b) {
							var img =  '<img class="coin_exchb" src="img/coinspng/' + b['coin'] + '.png" onerror="this.onerror=null;this.src=\'img/svg/noicon.svg\';">';
							var price = b['price'];
							var total = (b['amount'] * price);
							var total_btc = ((b['amount'] * price) / btcusd).toFixed(8);
							var usdpair = (exchange == 'Binance' ? 'USDT' : 'USD');
							var ech_id = ID();
							var pairs = b['coin'] + (b['coin'] == 'BTC' ? usdpair : 'BTC');
							balances_content +=
							'<div class="btn-group">' +
								'<div class="etchb_block" id="' + ech_id + '" data-toggle="dropdown" aria-expanded="false">' +
									'<div class="row">' +
										'<div class="p-0 col-4">' +
											'<div class="echb_ico">' + img + '</div>' +
											'<span class="echb_name">' + b['coin'] + '</span>' +
										'</div>' +
										'<div class="p-0 col-8">' +
											'<div class="echb_bal">' +
												'<div class="echb_type">' + b['wallet'] + '</div>' +
												'<div class="echb_amount short-div">' + (b['amount'] * 1).toFixed(8) + '</div>' +
												'<div class="echb_total short-div">' + toDollars((total * 1).toFixed(2)) + ' <span class="coin_pair_">USD</span></div>' +
												'<div class="echb_pricebtc short-div">' + total_btc + ' <span class="coin_pair_">BTC</span></div>' +
												'<div class="echb_priceusd short-div">' + toDollars((price * 1).toFixed(2)) + ' <span class="coin_pair_">USD</span></div>' +
											'</div>' +
										'</div>' +
									'</div>' +
								'</div>' +
								'<div class="dropdown-menu" aria-labelledby="' + ech_id + '">' +
									'<a class="dropdown-item exchb_show_chart" href="#" data-exchange="' + exchange + '" data-pair="' + pairs + '">Open ' + pairs + ' in TradingView Chart</a>' +
									(b['coin'] !== 'BTC' ? '<a class="dropdown-item exchb_show_orders" href="#" data-exchange="' + exchange + '" data-pair="' + b['coin'] + 'BTC">Get orders of ' + b['coin'] + 'BTC - ' + exchange + '</a>'  : '') +
									'<a class="dropdown-item exchb_show_orders" href="#" data-exchange="' + exchange + '" data-pair="' + b['coin'] + 'ETH">Get orders of ' + b['coin'] + 'ETH - ' + exchange + '</a>' +
									'<a class="dropdown-item exchb_show_orders" href="#" data-exchange="' + exchange + '" data-pair="' + b['coin'] + usdpair + '">Get orders of ' + b['coin'] + usdpair + ' - ' + exchange + '</a>' +
								'</div>' +
							'</div>';

							exchange_balance += (total_btc * 1);
						});
						content +=
						'<div class="ech_col">' +
							'<div class="ech_header">' +
								'<div class="' + exchange + '-logo exchb_logo" ></div>' +
								'<div class="exchange_bals">' +
									'<span class="exchange_balance1">' + (exchange_balance).toFixed(8)  + ' <span class="coin_pair_">BTC</span></span>' +
									'<span class="exchange_balance2">' + toDollars((exchange_balance * btcusd).toFixed(2)) + ' <span class="coin_pair_">USD</span></span>' +
								'</div>' +
							'</div>' +
							'<div class="echb_blocks">' + balances_content + '</div>' +
						'</div>';
					}
				});

				if(apis == 0) {
					$('#btn_exch').prop('disabled', true);
				}

				$('#btn_exch').popover('dispose');
				var pop = $('#btn_exch').popover({
					html: true,
					trigger : 'click',
					placement: 'left',
					title: 'Exchange Data' + '<span class="pop_close">&times;</span><button data-toggle="modal" data-target="#modal_orders" id="btn_orders" class="btn btn-dark btn-sm">Extract orders</button>',
					content: content,
					template: '<div class="popover" role="tooltip">' +
										'<div class="arrow"></div>' +
										'<h3 class="popover-header"></h3>' +
										'<div class="popover-body" id="popover_exch"></div>' +
									'</div>'
				})

				.on('show.bs.popover', function() {
					$('.popover').popover('hide');
				})
				.on('shown.bs.popover', function() {
					$('.exchb_show_orders').click(function() {
						var exchange = $(this).attr('data-exchange');
						var pairs = $(this).attr('data-pair');
						$('#input_orders_exchange').selectpicker('val', exchange);
						var loop = setInterval(function() {
							if($('#input_orders_coinonlineid').find('option').length > 0 ) {
								clearInterval(loop);
								$('#input_orders_coinonlineid').selectpicker('val', pairs);
								$('#modal_orders').modal('show');
							}
						}, 200);
					});
					$('.exchb_show_chart').click(function() {
						setChart(this);
					});
					$('*[data-toggle=tooltip]').tooltip();
					$('.pop_close').click(function() {
						$(this).closest('.popover').popover('hide');
					});
					hideTips();
				});

				$('#btn_exch').html('<i class="fas fa-exchange-alt"></i>')
			}
		});

	}

	$('#input_orders_exchange').change(function() {
		var exchange = $(this).val();
		$.ajax({
			url: 'index.php',
			type : "POST",
			data : { cmd: "get_currencies_by_exchange", id: exchange },
			success : function(result) {
				var data = JSON.parse(result);
				if(data) {
					$('#input_orders_coinonlineid').empty().append('<option value="">Nothing selected</option>');
					$(data).each(function(i,v) {
						if(v[3] !== '')
							$('#input_orders_coinonlineid').append('<option value="' + v[0] + '">' + v[1] + ' (' + v[2] + '/' + v[3] +')</option>');
					});
					$('#input_orders_coinonlineid').prop('disabled', false);
					$('#input_orders_coinonlineid').selectpicker('refresh');
					load_hist_orders(exchange, false);
				}
			}
		});
	})
	
	
	$('#modal_orders').on('show.bs.modal', function (e) {
		$('#orders_alert').hide();
	});

	$('#modal_holding_online_add').on('shown.bs.modal', function (e) {
		$('#input_coinonlineid').selectpicker('refresh');		
		if(!$('#alert_online').hasClass('d-none')) {
			$('#alert_online').addClass('d-none');
		}
	});
	
	$('#modal_holding_add').on('shown.bs.modal', function (e) {
		$('#input_coinid').selectpicker('refresh');
		if(!$('#alert_local').hasClass('d-none')) {
			$('#alert_local').addClass('d-none');
		}
	});
	
	var load_hist_orders = (exchange, pair) => {
		$.ajax({
			url: 'index.php',
			type : "POST",
			data : {
				cmd: "get_historical_orders",
				exchange: exchange,
				pairs : (pair ? pair[0] + pair[1] : ''),
			},
			success : function(result) {
				result = JSON.parse(result);
				var rows = '';
				if(result !== 0) {
					$('#orders_alert').hide();
					$(result).each(function(i, v) {
						var date = moment(v['DATE']).format('MM/DD/YYYY h:mm:ss A');
						var trade_icon = (v['TRADE'] == 'buy') ? '<i class="fas fa-arrow-up arrow arrow_buy"></i>' : '<i class="fas fa-arrow-down arrow arrow_sell"></i>';
						var amount = trade_icon + v['AMOUNT'];						
						var add_attrs = 
							'data-date="' + date + '" ' +
							'data-pairs="' + v['PAIRS'] + '" ' +
							'data-price="' + v['PRICE'] + '" ' +
							'data-exchange="' + exchange + '" ' +
							'data-amount="' + v['AMOUNT'] + '"';
							
						var add = '<button ' + add_attrs + ' class="btn btn-dark btn_add_order"><i class="fas fa-plus"></i></button>';
						
						rows +=
							'<tr>' +
								'<td>' + v['ID'] + '</td>' +
								'<td>' + date + '</td>' +
								'<td>' + v['PAIRS'] + '</td>' +
								'<td>' + amount + '</td>' +
								'<td>' + v['PRICE'] + '</td>' +
								'<td><span class="order_status">' + v['STATUS'] + '</span></td>' +
								'<td>' + v['TYPE'] + '</td>' +
								'<td>' + add + '</td>' +
							'</tr>'
					});
					
					if(table_orders !== null) table_orders.destroy();
					
					$('#table_orders').show().find('tbody').empty().append(rows);
					
					table_orders = $('#table_orders').DataTable({
						"bjQueryUI" : true,
						"info": false,
						"bLengthChange": false,
						"order": [[0, 'desc']]
					});
					
					$('.btn_add_order').click(function() {
						var coin_id = $(this).attr('data-pairs');
						var date_trade = $(this).attr('data-date');
						var price = $(this).attr('data-price');
						var amount = $(this).attr('data-amount');
						var exchange = $(this).attr('data-exchange');
												
						
						$('#input_exchange').selectpicker('val', exchange);
						$('#input_amountonline').val(amount);

						var loop = setInterval(function() {
							if($('#input_coinonlineid').find('option').length > 0 ) {
								clearInterval(loop);
								$('#input_coinonlineid').selectpicker('val', coin_id);
								$('#trade_date').val(date_trade);
								checkTradeDate();
								var loop2 = setInterval(function() {
									if($('#input_boughtat').val() > 0) {
										clearInterval(loop2);
										if(price > 0) { $('#input_boughtat').val(price); }
										$('#modal_orders').modal('hide');
										$('#modal_holding_online_add').modal('show');
									}
								}, 200);
							}
						}, 200);
						
					});
					
					
					
				}
				else {
					$('#table_orders').show().find('tbody').empty();
					$('#orders_alert').show();
				}
			}
		});
	}
	
	$('#input_orders_coinonlineid').change(function() {
		var exchange = $('#input_orders_exchange').val();
		var pair = $(this)[0].selectedOptions[0].label;
		pair = pair.split('(')[1];
		pair = pair.substring(0, pair.length - 1).split('/');
		$('#orders_alert').hide();
		$('#table_orders').hide();
		load_hist_orders(exchange, pair);
	});

	var check_coin = (coin) => {
		var result = false;
		$(arr_coinsTraded).each((i,v) => {
			if(v !== undefined) {
				if(v.indexOf(coin) > -1) result = true;
				if(coin.indexOf(v) > -1) result = true;
			}
		});
		return result;
	}

	$('*[data-toggle=tooltip]').tooltip();

  function hideTips() {
		$('[data-toggle="tooltip"]').tooltip('hide');
	}

	function refresh_mods() {
		load_favs();
		load_exchanges_data();
		load_calendar(1);
	}
	
	load_config();
	load_exchanges();
	load_currs();
	load_portfolio(refresh_check);

});
