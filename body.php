<div id="quick_chart"></div>
<div class="container" id="body_container">
	<div id="loading"><div class="loader"></div></div>
	<div class="row" id="header-buttons">
		<div class="col-4 d-none d-md-block p-3">
			<span id="logo"><i id="logo_2" class="fas fa-rocket"></i><i id="logo_1" class="fas fa-moon"></i>rypto</span>
		</div>
		<div class="col-12 col-sm-12 col-md-8 col-lg-8 col-xl-8 p-3">
			<ul class="nav float-right" style="position: relative;top: 5px;">
				<li class="nav-item d-inline d-md-none">
					<div class="form-check">
						<span id="mlogo"><i id="mlogo_2" class="fas fa-rocket"></i><i id="mlogo_1" class="fas fa-moon"></i></span>
					</div>
				</li>
				<li class="nav-item">
					<div class="form-check">
						<div class="input-group">
							<span id="totalholding_all" style="position:relative;top:2px" class="label_holding"></span>
						</div>
					</div>
				</li>
				<li class="nav-item">
					<div class="form-check">
						<div class="input-group">
							<span id="totaholding_exchanges" style="position:relative;top:2px" class="label_holding"></span>
						</div>
					</div>
				</li>
				<li class="nav-item">
					<div class="form-check">
						<div class="input-group">
							<div class="input-group-prepend">
								<label class="input-group-text" for="autoupd"><i class="fas fa-stopwatch"></i></label>
							</div>
							<select data-toggle="tooltip" data-html="true" title="Select interval to start auto update." class="custom-select" style="cursor: pointer;" id="autoupd">
								<option selected value="0">Disable</option>
								<option value="1">1m</option>
								<option value="2">5m</option>
								<option value="3">10m</option>
								<option value="4">30m</option>
								<option value="5">1h</option>
							</select>
							<div class="input-group-append "><label class="input-group-text"><span id="countdown">Paused</span></label></div>
							<div class="input-group-append "><button data-toggle="tooltip" data-html="true" title="Update database" id="btn_refresh_portfolio" type="button" class="btn btn-dark float-right nav-item"><i class="fas fa-sync"></i></button></div>
						</div>
					</div>
				</li>
				<li class="nav-item">
					<div class="form-check">
						<div class="input-group" data-toggle="tooltip" data-html="true" title="Coin Calendar">
							<button id="btn_cal" type="button" class="btn btn-dark btn-dark1 float-right nav-item">
								<i class="fas fa-spinner fa-spin"></i>
							</button>
							<span class="badge button-badge" id="cal_new"></span>
						</div>
					</div>
				</li>
				<li class="nav-item">
					<div class="form-check">
						<div class="input-group" data-toggle="tooltip" data-html="true" title="Exchanges Data">
							<button id="btn_exch" type="button" class="btn btn-dark btn-dark1 float-right nav-item">
								<i class="fas fa-spinner fa-spin"></i>
							</button>
						</div>
					</div>
				</li>
				<li class="nav-item">
					<div class="form-check">
						<div class="input-group" data-toggle="tooltip" data-html="true" title="Configuration">
							<button id="btn_config" type="button" class="btn btn-dark btn-dark1 float-right nav-item">
								<i class="fas fa-cogs"></i>
							</button>
						</div>
					</div>
				</li>
			</ul>
		</div>
	</div>
	
	<div class="row" style="padding-bottom: 11px !important;">
		<div class="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-8" style="border-right: 4px solid #212529">
		
			<div class="dash_block">
				<div class="row">
					<div class="col-12 bg-block p-0">
						<span class="block-title-logo"><i class="fas fa-exchange-alt"></i></span>
						<span class="block-title d-none d-sm-inline">Online trades</span>
						<button id="btn_holding_add_online" type="button" class="btn btn-primary float-right btn-add-hold btn-dark" data-toggle="modal" data-target="#modal_holding_online_add"><i class="fas fa-plus" ></i></button>
						<div class="dropdown show float-right">
							<a class="btn btn-add-hold btn-dark dropdown-toggle btn-dash" href="#" role="button" id="table_onlinelist_length" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								<i class="fas fa-list-ol"></i>
							</a>
							<div class="dropdown-menu" aria-labelledby="table_onlinelist_length">
								<a class="dropdown-item clen change_len_online" data-val="5" href="#">5</a>
								<a class="dropdown-item clen change_len_online" data-val="10" href="#">10</a>
								<a class="dropdown-item clen change_len_online" data-val="25" href="#">25</a>
								<a class="dropdown-item clen change_len_online" data-val="50" href="#">50</a>
								<a class="dropdown-item clen change_len_online" data-val="100" href="#">100</a>
							</div>
						</div>
						<input type="text" class="form-control search_input float-right btn-add-hold" placeholder="BTC" id="search_online_text">
						<button data-id="search_online_text" class="btn float-right btn-add-hold btn-dark search_button btn-dash" id="search_online"><i class="fas fa-search"></i></button>
						<button class="label_holding btn btn-primary float-right btn-add-hold btn-dark" id="totalholding_online" data-placement="bottom" data-toggle="popover" title="Balances by exchange" data-html="true" data-content="">0$</button>						
					</div>
				</div>
				<div class="row body-block">
					<div class="col-12 pt-2 pb-2">
						<div class="table-responsive">
							<table class="table sortable tcoins nowrap" id="table_onlinelist">
								<thead class="thead">
									<tr>
										<th scope="col">Exchange</th>
										<th scope="col">Coin</th>
										<th scope="col">Amount</th>
										<th scope="col">Trade at</th>
										<th scope="col">Price now</th>
										<th scope="col" class="text-center">Total</th>
										<th scope="col" style="width: 132px !important; min-width: 132px;max-width: 155px;">P/L</th>
										<th scope="col"></th>
									</tr>
								</thead>
								<tbody>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
			
			<div class="dash_block">
				<div class="row">
					<div class="col-12 bg-block p-0">
					<span class="block-title-logo"><i class="fas fa-wallet"></i></span>
						<span class="block-title d-none d-sm-inline">Local holding</span>
						<button id="btn_holding_add" type="button" class="btn btn-primary float-right btn-add-hold  btn-dark" data-toggle="modal" data-target="#modal_holding_add"><i class="fas fa-plus" ></i></button>
						<div class="dropdown show float-right">
							<a class="btn btn-add-hold btn-dark dropdown-toggle btn-dash" href="#" role="button" id="table_locallist_length" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								<i class="fas fa-list-ol"></i>
							</a>
							<div class="dropdown-menu" aria-labelledby="table_locallist_length">
								<a class="dropdown-item clen change_len_local" data-val="5" href="#">5</a>
								<a class="dropdown-item clen change_len_local" data-val="10" href="#">10</a>
								<a class="dropdown-item clen change_len_local" data-val="25" href="#">25</a>
								<a class="dropdown-item clen change_len_local" data-val="50" href="#">50</a>
								<a class="dropdown-item clen change_len_local" data-val="100" href="#">100</a>
							</div>
						</div>	
						<input type="text" class="form-control search_input float-right btn-add-hold" placeholder="BTC" id="search_local_text">
						<button data-id="search_local_text" class="btn float-right btn-add-hold btn-dark search_button btn-dash" id="search_local"><i class="fas fa-search"></i></button>
						<button class="label_holding btn btn-primary float-right btn-add-hold btn-dark" id="totalholding_local">0$</button>	
					</div>
				</div>
				<div class="row body-block">
					<div class="col-12 pt-2 pb-2">
						<div class="table-responsive">
							<table class="table sortable tcoins nowrap" id="table_coinlist">
								<thead class="thead">
									<tr>
										<th scope="col">Coin</th>
										<th scope="col">Amount</th>
										<th scope="col">Price</th>
										<th scope="col">% 1h</th>
										<th scope="col">% 24h</th>
										<th scope="col">% 7d</th>
										<th scope="col">Total</th>
										<th scope="col"></th>
									</tr>
								</thead>
								<tbody>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
		
		<div class="dash_block col-12 col-sm-12 col-md-12 col-lg-12 col-xl-4 body-bloc">
			<div class="row">
				<div class="col-12 bg-block p-0">
					<span class="block-title-logo"><img src="img/caplogo.png"></span>
					<span class="block-title d-none d-sm-inline">Coinmarketcap Charts</span>
					<button id="fav_add" type="button" class="btn btn-primary float-right btn-add-hold  btn-dark"><i class="fas fa-plus" ></i></button>
					<div class="dropdown show float-right">
						<a class="btn btn-add-hold btn-dark dropdown-toggle btn-dash" href="#" role="button" id="fav_time" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							<i class="fas fa-list-ol"></i>
						</a>
						<div class="dropdown-menu" aria-labelledby="fav_time">
							<a class="dropdown-item clen fav_time_set setactive" data-val="1d" href="#">1 Day</a>
							<a class="dropdown-item clen fav_time_set" data-val="7d" href="#">7 Day</a>
						</div>
					</div>
				</div>
			</div>
			<div class="row body-block">
				<div class="col-12 pt-2">
					<div id="favs_block" class="row p-2"></div>
				</div>
			</div>
		</div>
	</div>
</div>

<!--
	MODAL P/L INFO
-->
<div class="modal fade" id="modal_plinfo" tabindex="-1" role="dialog" aria-labelledby="P/L INFO" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered modal-lg" role="document">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">P/L INFO<span id="date_add"></span></h5>
				<button type="button" class="close" data-dismiss="modal" aria-label="Close">
					<span aria-hidden="true">&times;</span>
				</button>
			</div>
			<div class="modal-body">
				<h4>Last trade <span class="pl_date_add label label-pl"></span><span class="pl_date_conv1 label"></span></h4>
				<div class="table-responsive mb-3">
					<table id="table_pl1" class="table tcoins">
						<thead>
							<tr>
								<th scope="col" style="width: 100px;">Trade</th>
								<th scope="col">Amount</th>
								<th scope="col">Traded at</th>
								<th scope="col">Total</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td><span class="pl_trade"></span></td>
								<td><span class="pl_amount"></span> <span class="pl_symbol"></span></td>
								<td><span class="pl_price_old"></span> <span class="pl_diff_pair"></span></td>
								<td>
									<div class="short-div"><span class="pl_total_old"></span> <span class="pl_diff_pair"></span></div>
									<div class="short-div"><span class="pl_total_old2"></span></span></div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<h4>Next trade <span class="pl_percent label label-pl"></span><span class="pl_date_conv2 label"></span></h4>
				<div class="table-responsive">
					<table id="table_pl" class="table tcoins">
						<thead>
							<tr>
								<th scope="col">Amount</th>
								<th scope="col">Current price</th>
								<th scope="col">Total</th>
								<th scope="col" style="min-width: 111px">P/L | USD</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td><span class="pl_trade2"></span></td>
								<td><span class="pl_amount2"></span> <span class="pl_symbol"></span></td>
								<td><span class="pl_price_now"></span> <span class="pl_diff_pair"></span></td>
								<td>
									<div class="short-div"><span class="pl_total"></span> <span class="pl_diff_pair"></span></div>
									<div class="short-div"><span class="pl_total2"></span></div>
								</td>
								<td>
									<div class="short-div"><span class="pl_diff" ></span> <span class="pl_diff_pair"></span></div>
									<div class="short-div"><span class="pl_diff2"></span></div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
			</div>
		</div>
	</div>
</div>

<!--
	MODAL FAV
-->
<div class="modal fade" id="modal_fav" tabindex="1" role="dialog" aria-labelledby="Add local holding" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered modal-sm" role="document">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">Add favorite</h5>
				<button type="button" class="close" data-dismiss="modal" aria-label="Close">
					<span aria-hidden="true">&times;</span>
				</button>
			</div>
			<div class="modal-body">
				<form id="form_fav">
					<div class="form-group">
						<label for="input_coinidfav">Cryptocurrency</label>
						<select tabindex="1" data-style="btn-dropdown-dark" data-style="btn-dropdown-dark" id="input_coinidfav" name="input_coinidfav" class="form-control selectpicker"  data-live-search="true">
							<option>Nothing selected</option>
						</select>
					</div>
				</form>
				<div id="alert_fav" class="alert alert-danger d-none" role="alert"></div>
			</div>
			<div class="modal-footer">
				<button tabindex="3" type="button" id="submit_fav" class="btn btn-primary">Save changes</button>
			</div>
		</div>
	</div>
</div>

<!--
	MODAL HOLDING LOCAL NEW
-->
<div class="modal fade" id="modal_holding_add" tabindex="1" role="dialog" aria-labelledby="Add local holding" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered modal-sm" role="document">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">Add new local holding</h5>
				<button class="btn btn-dark" style="display: none" id="remove_this_holding" data-id="0">
					<i class="fas fa-trash-alt"></i>
				</button>
				<button type="button" class="close" data-dismiss="modal" aria-label="Close">
					<span aria-hidden="true">&times;</span>
				</button>
			</div>
			<div class="modal-body">
				<form id="form_local" data-type="add">
					<div class="form-group">
						<label for="input_coinid">Cryptocurrency</label>
						<select tabindex="1" id="input_coinid"  data-style="btn-dropdown-dark" name="input_coinid" class="form-control selectpicker"  data-live-search="true">
							<option>Nothing selected</option>
						</select>
					</div>
					<div id="form_addr" class="form-group d-none">
						<label for="input_amount">Address</label>
						<input tabindex="2" type="text" id="input_addr" name="input_addr" class="form-control" placeholder="0x458ce2c712836ad03d535a766060491e3a161337">
					</div>
					<div class="form-group">
						<label for="input_amount">Amount</label>
						<div class="input-group">
						<input tabindex="2" type="number" id="input_amount" name="input_amount" class="form-control" placeholder="0.01">
							<div class="input-group-append">
								<span class="input-group-text" id="amount_local"></span>
							</div>
						</div>
					</div>
				</form>
				<div id="alert_local" class="alert alert-danger d-none" role="alert"></div>
			</div>
			<div class="modal-footer">
				<button tabindex="3" type="button" id="submit_holding_add" class="btn btn-primary">Save changes</button>
			</div>
		</div>
	</div>
</div>

<!--
	MODAL HOLDING ONLINE NEW
-->
<div class="modal fade" id="modal_holding_online_add" tabindex="2" role="dialog" aria-labelledby="Add online holding" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered modal-sm" role="document">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">Add new online trade</h5>
				<button class="btn btn-dark" style="display: none" id="remove_this_holding_online" data-id="0">
					<i class="fas fa-trash-alt"></i>
				</button>
				<button type="button" class="close" data-dismiss="modal" aria-label="Close">
					<span aria-hidden="true">&times;</span>
				</button>
			</div>
			<div class="modal-body">
				<form id="form_online" data-type="add">
					<div class="form-group">
						<label for="input_exchange">Exchange</label>
						<select tabindex="1" id="input_exchange" name="input_exchange" data-style="btn-dropdown-dark" class="form-control selectpicker">
							<option>Nothing selected</option>
						</select>
					</div>
					<div class="form-group disabled">
						<label for="input_coinonlineid">Cryptocurrency</label>
						<select tabindex="2" id="input_coinonlineid" name="input_coinonlineid" data-style="btn-dropdown-dark" class="form-control selectpicker"  data-live-search="true" disabled>
							<option>Nothing selected</option>
						</select>
					</div>
					<div class="form-group">
						<label for="input_amountonline">Amount</label>
						<div class="input-group">
							<input tabindex="3" type="number" id="input_amountonline" name="input_amountonline" class="form-control disabled" placeholder="0.01" disabled>
							<div class="input-group-append">
								<span class="input-group-text" id="amount_curr"><i class="fas fa-dollar-sign"></i></span>
							</div>
						</div>
					</div>
					<div class="form-group">
						<label for="input_boughtat">Trade at price</label>
						<div class="input-group">
							<input tabindex="4" type="number" id="input_boughtat" name="input_boughtat" class="form-control disabled" placeholder="0.01" disabled>
							<div class="input-group-append">
								<span class="input-group-text" id="boughtat_curr"><i class="fas fa-dollar-sign"></i></span>
							</div>
						</div>
					</div>
					<div class="form-group">
						<label for="trade_date">Trade date</label>
						<div class="input-group date" id="trade_datepicker" data-target-input="nearest">
							<input type="text" name="trade_date" id="trade_date" class="form-control datetimepicker-input disabled" data-target="#trade_date" disabled/>
							<div class="input-group-append" data-target="#trade_date" data-toggle="datetimepicker">
								<div class="input-group-text"><i class="fa fa-calendar"></i></div>
							</div>
						</div>
					</div>
					<div class="form-group" id="price_crypto">
						<label for="input_boughtat">Price of pair at date</label>
						<div class="input-group">
							<input tabindex="5" type="number" id="input_boughtat_date" name="input_boughtat_date" class="form-control disabled" placeholder="0.01" disabled>
							<div class="input-group-append">
								<span class="input-group-text" id="input_boughtat_date_curr"><i class="fas fa-dollar-sign"></i></span>
							</div>
						</div>
					</div>
				</form>
				<div id="alert_online" class="alert alert-danger d-none" role="alert"></div>
			</div>
			<div class="modal-footer">
				<button tabindex="5" type="button" data-trade="buy" class="btn btn-success submit_holding_online_add btn-lg btn-block">Buy</button>
				<button tabindex="6" type="button" data-trade="sell"  style="margin-top: 0px !important" class="btn btn-danger submit_holding_online_add btn-lg btn-block">Sell</button>
			</div>
		</div>
	</div>
</div>

<!--
	MODAL TV IDEA
-->
<div class="modal fade" id="modal_idea" tabindex="1" role="dialog" aria-labelledby="TradingView IDEA" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered" style="max-width: 1030px;" role="document">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">TradingView IDEA</h5>
				<button type="button" class="close" data-dismiss="modal" aria-label="Close">
					<span aria-hidden="true">&times;</span>
				</button>
			</div>
			<div class="modal-body">
			</div>
		</div>
	</div>
</div>

<!--
	MODAL ORDERS
-->
<div class="modal fade" id="modal_orders" tabindex="1" role="dialog" aria-labelledby="Extract orders" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered modal-xl" role="document">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">Extract orders</h5>
				<button type="button" class="close" data-dismiss="modal" aria-label="Close">
					<span aria-hidden="true">&times;</span>
				</button>
			</div>
			<div class="modal-body">
				<div style="width: 300px;margin: 0 auto;">
					<div class="form-group">
						<label for="input_orders_exchange">Exchange</label>
						<select tabindex="1" id="input_orders_exchange" data-style="btn-dropdown-dark"  name="input_exchange" class="form-control selectpicker">
							<option>Nothing selected</option>
						</select>
					</div>
					<div class="form-group disabled">
						<label for="input_orders_coinonlineid">Cryptocurrency</label>
						<select tabindex="2" id="input_orders_coinonlineid"  data-style="btn-dropdown-dark" name="input_coinonlineid" class="form-control selectpicker"  data-live-search="true" disabled>
							<option>Nothing selected</option>
						</select>
					</div>
				</div>
				<div class="alert alert-warning" style="display:none" role="alert" id="orders_alert">No orders found</div>
				<div class="table-responsive">
					<table id="table_orders" class="table tcoins nowrap" style="display:none">
						<thead>
							<tr>
								<th scope="col">OrderID</th>
								<th scope="col">Date</th>
								<th scope="col">Pairs</th>
								<th scope="col">Amount</th>
								<th scope="col">Price</th>
								<th scope="col">Status</th>
								<th scope="col">Type</th>
								<th scope="col"></th>
							</tr>
						</thead>
						<tbody>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</div>

<div id="image_modal" class="imgmodal">
  <span class="img_close">&times;</span>
  <img class="imgmodal-content" id="img01">
  <div id="caption"></div>
</div>

