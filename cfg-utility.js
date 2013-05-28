/*
 * Custom Field GUI Utility 3.3
 *
 * Copyright (c) Tomohiro Okuwaki and Tsuyoshi Kaneko
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Since:       2008-10-15
 * Last Update: 2013-03-01
 *
 * jQuery v1.7.1
 * Facebox 1.2
 * exValidation 1.3.0  (c)5509 (http://5509.me/)
 */
jQuery(function($){

	// 新しいメディアアップローダー対応 <START>
	var css_static = {
		'position':'static'
	};
	var css_required = {
		'position': 'absolute',
		'z-index': '9',
		'width': '580px',
		'left': '50%',
		'margin-left': '-290px'
	};

	var file_type;
	var admin_url = location.href;
	var images_url = admin_url.replace(/(http.+)(wp-admin)(.+)/,'$1') + 'wp-content/plugins/' + current_dir + '/images/';
	var cancel_png = images_url + 'cancel.png';
	var must_png = images_url + 'must.png';

	var $media;
	var $inp;
	$('.button.cfg-add-image').click(function(e) {
	   e.preventDefault();

	   // inputフィールドを取得
	   $inp = $(this).closest('.inside').find('input.data');

	   // 既にメディアアップローダーのインスタンスが存在する場合
	   if ($media) {
		 $media.open();
		 return;
	   }

	   // メディアアップローダーのインスタンスを生成
	   $media = wp.media({
		 title: 'ファイルを選択',
		 button: {
		  text: 'カスタムフィールドに挿入'
		 },
		 // 複数ファイル選択を許可しない
		 multiple: false
	   });

	   /**
		* メディア選択時のイベント
		*/
	   $media.on('select', function() {
		 // 選択したメディア情報を取得
		 var attachment = $media.state().get('selection').first().toJSON();

		 // メディアのIDとURLをinputフィールドに設定
		 $inp.val("[" + attachment.id  + "]" + attachment.url);

			// テキストフィールドにファイルの種類のアイコンとキャンセルボタンを表示
				var media_url = getMediaURL ($inp.val());
				var media_type = getMediaType (attachment.url);

				if (media_type) {
					$inp
						.css('background','url(' + images_url + media_type + '.png) no-repeat 3px center')
						.css('padding-left','20px')
						.end()
						.find('a.image')
							.attr('href',media_url)
							.html('<img src="' + media_url + '" width="150" />');
				} else {
					$inp.removeAttr('style');
				}
				$inp.parent().find('img.cancel').attr('src', cancel_png).show();
	   });

	   // メディアアップローダーを開く
	   $media.open();
	});
	// 新しいメディアアップローダー対応 </END>

// Functions

	function getMediaURL (str) {
		return str.replace(/^(\[[0-9]+\])(.+)/,'$2');
	}

	function getMediaType (str) {
		var media_type = str.match(/[a-z]{2,5}$/i);
		if ((media_type == 'pdf')||(media_type == 'PDF')) {
			media_type = 'pdf';
		} else if ((media_type == 'jpg')||(media_type == 'JPG')||(media_type == 'gif')||(media_type == 'GIF')||(media_type == 'png')||(media_type == 'PNG')) {
			media_type = 'image';
		} else if ((media_type == 'html')||(media_type == 'HTML')||(media_type == 'htm')||(media_type == 'HTM')||(media_type == 'shtml')||(media_type == 'SHTML')||(media_type == 'php')||(media_type == 'PHP')) {
			media_type = 'web';
		} else if ((media_type == 'atom')||(media_type == 'ATOM')||(media_type == 'rss')||(media_type == 'RSS')||(media_type == 'rdf')||(media_type == 'RDF')) {
			media_type = 'feed';
		} else if ((media_type == 'doc')||(media_type == 'DOC')||(media_type == 'docx')||(media_type == 'DOCX')) {
			media_type = 'word';
		} else if ((media_type == 'xls')||(media_type == 'XLS')||(media_type == 'xlsx')||(media_type == 'XLSX')) {
			media_type = 'excel';
		} else {
			media_type = 'file';
		}
		return media_type;
	}

	// getPageScroll() by quirksmode.com
	function getPageScroll() {
		var xScroll, yScroll;
		if (self.pageYOffset) {
			yScroll = self.pageYOffset;
			xScroll = self.pageXOffset;
		} else if (document.documentElement && document.documentElement.scrollTop) {   // Explorer 6 Strict
			yScroll = document.documentElement.scrollTop;
			xScroll = document.documentElement.scrollLeft;
		} else if (document.body) {// all other Explorers
			yScroll = document.body.scrollTop;
			xScroll = document.body.scrollLeft;
		}
		return new Array(xScroll,yScroll)
	}

	// Adapted from getPageSize() by quirksmode.com
	function getPageHeight() {
		var windowHeight
		if (self.innerHeight) {   // all except Explorer
			windowHeight = self.innerHeight;
		} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
			windowHeight = document.documentElement.clientHeight;
		} else if (document.body) { // other Explorers
			windowHeight = document.body.clientHeight;
		}
		return windowHeight
	}

	function get_thumb_url (id) {
		var imaze_size_item = $(id + ' tr.image-size td.field div.image-size-item:has(input:checked)');
		var thumb_size = imaze_size_item.find('label.help').text();
			thumb_size = thumb_size.replace(/(\()([0-9]+)([^0-9]+)([0-9]+)(\))/,'-$2x$4');

		var thumb_url = $(id + ' tr.url td.field button.urlfile').attr('title');
		var thumb_ext = thumb_url.match(/\.[a-z]{2,5}$/i);
			thumb_ext = thumb_ext[0].toLowerCase().toString();
			thumb_url = thumb_url.replace(/(\.[a-z]{2,5}$)/i,thumb_size + thumb_ext);
		return thumb_url;
	}

	// Multi Checkbox [start]
	$('div.multi_checkbox').each(function(){

		var self = $(this);

		var checkboxs  = self.find('input:checkbox');
		var data_elm = self.find('input.data');
		var data_val = data_elm.val();
		var data_def = self.find('span.default').text().replace(/[ 　]*#[ 　]*/g,',');

		var data_arry = new Array;
		if (data_val) {
			data_arry = data_val.split(',');
			checkboxs.val(data_arry);
		}

		checkboxs.click(function(){
			var data_arry = new Array;
			self.find('input:checked').each(function(){
				data_arry.push($(this).val());
			});
			self.find('input.data').val(data_arry.join());
		});
	});
	// Multi Checkbox [end]

	// 管理画面にサムネイルを表示 [start]
	$('div.imagefield').each(function(){
		var div = $(this);
		var imf_data = div.find('input.data');
		var imf_val = imf_data.val();
		var imf_cancel = div.find('img.cancel');

		if (imf_val) {
			imf_cancel.attr('src', cancel_png).show();

			var media_url = getMediaURL(imf_val);
			var media_type = getMediaType(media_url);

			imf_data.css({
				'background':'url(' + images_url + media_type + '.png) no-repeat 3px center',
				'padding-left':'20px'
			});
			div.find('a.image').attr('href', media_url).html('<img src="' + media_url + '" width="150" />');
		} else {
			imf_data.removeAttr('style');
		}

		imf_data.change(function(){
			var imf_val = $(this).val();

			if (imf_val) {
				var images_url = getMediaURL(imf_val);
				var media_type = getMediaType(media_url);
				$(this)
					.css({
						'background':'url(' + images_url + media_type + '.png) no-repeat 3px center',
						'padding-left':'20px'
					})
					.next('img.cancel').attr('src', cancel_png).show();
			} else {
				$(this)
					.removeAttr('style')
					.nextAll('img.cancel').attr('src', '').hide();
			}

			$(this)
				.nextAll('span.thumb')
				.find('a.image').attr('href', media_url).html('<img src="' + media_url + '" width="150" />');
		});
	});
	// 管理画面にサムネイルを表示 [end]

	// 「キャンセル」ボタンを押したときの動作の設定 [start]
	$('img.cancel').live('click', function() {
		$(this)
			.next('span')
				.find('a.image').removeAttr('href')
				.end()
				.find('img').fadeOut('slow', function(){
					$(this).remove();
				})
				.end()
			.end()
			.prev().val('').removeAttr('style')
			.end()
			.hide();
	});
	// 「キャンセル」ボタンを押したときの動作の設定 [end]

	// フォーカスしたテキストフィールドの初期値を消す [start]
	$('div.postbox.textfield').find('input.data').each(function(){
		$(this).focus(function(){
			var default_val = $(this).attr('title');
			var current_val = $(this).val();
			if (default_val == current_val) {
				$(this).val('');
			}
		});
		$(this).blur(function(){
			var default_val = $(this).attr('title');
			var current_val = $(this).val();
			if (current_val == '') {
				$(this).val(default_val);
			}
		});
	});
	// フォーカスしたテキストフィールドの初期値を消す [end]

	// for facebox.js
	$("a[rel*=facebox],p.descriptionImage > a").facebox();
	
	$('div.postbox.table > div.inside')
	  .each(function(){
			var $_inside = $(this);
			
			var $_add = $(this).find('span.addBtn');
			
			var $_hidden = $(this).children('input.tableValue');
			var imagePath = $_hidden.attr('data-imgpath');
			
			if($_hidden.val()){
				var html = '';
				var lineArr = $_hidden.val().split('|');
				for(var i=0;i < lineArr.length;i++){
					
					lineArr[i] = lineArr[i].split(' ');
					for(var j=0;j < lineArr[i].length;j++){
						lineArr[i][j] = decodeURI(lineArr[i][j]);
					}
					html += '<div class="line">';
					html += '<span class="deleteBtn"><img src="'+imagePath+'remove.png"></span>';
					html += '<span><textarea class="key">' + lineArr[i][0] + '</textarea></span>';
					html += '<span><textarea class="value">' + lineArr[i][1] + '</textarea></span>';
					html += '</div>';
				}
				$(this).find('div.line').remove();
				$_add.before(html);
			}
			
			$(this).on('click','span.deleteBtn',function(){
				$(this).parent().slideUp('fast',function(){
					$(this).remove();
					updateTableValue();
				});
			});
			$(this).on('blur keypress keyup','textarea',function(){
				updateTableValue();
			});
			
			$_add
				.click(function(){
					$_newLine = $('<div class="line"><span class="deleteBtn"><img src="'+ imagePath +'remove.png"></span><span><textarea class="key"></textarea></span><span><textarea class="value"></textarea></span></div>');
					$_newLine.css('display','none');
					$(this).parent().find('span.addBtn').before($_newLine);
					$_newLine.slideDown('fast');
					updateTableValue();
				});
			function updateTableValue(){
				var tableValue = new Array();
				$_inside.find('div.line')
					.each(function(n){
						var key = $(this).find('textarea.key').val();
						var value = $(this).find('textarea.value').val();
						key = key || '';
						value = value || '';
						var key_encoded = encodeURI(key);
						var value_encoded = encodeURI(value);
						if(key || value){
							tableValue[n] = key_encoded +' '+value_encoded;
						}
					});
				var tableStr = tableValue.join('|');
				if(tableStr === undefined){
					tableStr = '';
				}
				$_hidden.val(tableStr);
			}
		});
	
	//datepicker
	
	if(!Modernizr.inputtypes.date){
		$('input[type=date]')
			.attr({
				type:'text'
			})
			.datepicker({
				dateFormat:'yy-mm-dd'
			});
	}
	

	$('div.datepicker_box')
		.each(function(){
			var $self = $(this);
			var $datepicker = $self.children('div.datepicker');
			var $list = $self.children('ol.datepicker_list');
			var $input = $self.children('input');
			var selectedDateArray = [];
			if($input.val() !== ""){
				selectedDateArray = $input.val().split(',').sort();
				refreshList();
			}
			$datepicker
				.datepicker({
					dateFormat: "yy-mm-dd",
					beforeShowDay:function(date){
						var year = date.getFullYear();
						var month = padNumber(date.getMonth() + 1);
						var day = padNumber(date.getDate());
						var dateStr = [year,month,day].join('-');
						if($.inArray(dateStr,selectedDateArray) !== -1){
							return [true,"ui-multi-selected"];
						}else{
							return [true, ""];
						}
					},
					onSelect:function(date){
						var index = $.inArray(date,selectedDateArray);
						if(index !== -1){
							selectedDateArray.splice(index,1);
						}else{
							selectedDateArray.push(date);
						}
						selectedDateArray.sort();
						refreshList();
					}
				});
			function refreshList(){
				$list.empty();
				var i = 0,len = selectedDateArray.length;
				for(;i < len; i += 1){
					$list
						.append('<li>'+ selectedDateArray[i] +'</li>');
				}
				$input
					.val(selectedDateArray.join(','))
					.trigger('change');
			}
		});

	//簡易必須項目のチェック
	var $targets = $('#cfg_utility div.postbox.must').filter(function(){
		var $self = $(this);
		if($self.hasClass('textarea') ||
			$self.hasClass('textfield') ||
			$self.hasClass('imagefield') ||
			$self.hasClass('table') ||
			$self.hasClass('datearray') ||
			$self.hasClass('simpledate')
		){
			return $self;
		}
	});

	var $publish = $('#publish');
	var $miscPublishingActions = $('#misc-publishing-actions');

	$targets
		.on('focusout select blur focus change keyup',function(){
			if(checkTargets() === 0){
				$publish
					.prop('disabled',false);
				$miscPublishingActions
					.children('div.error')
						.remove();
			}else{
				$publish
					.prop('disabled',true);
				if($miscPublishingActions.children('div.error').length === 0){
					$miscPublishingActions
						.append('<div class="error">未入力の必須項目があります！</div>');
				}
			}
		});
	$(window)
		.on('load',function(e){
			$targets
				.trigger('blur');
		});

	function checkTargets(){
		var errorNum = 0;
		$targets
			.each(function(){
				var $self = $(this);
				var $text = $self.find('input[name],textarea[name]');
				var val = $text.val();
				//val = val.replace(/\s/g,val);
				if(val.length <= 0){
					errorNum += 1;
					showError($self);
				}else{
					removeError($self);
				}
			});
		return errorNum;
	}
	function showError($postbox){
		var $title = $postbox.find('h4.cf_title');
		if($title.children('span.error').length === 0){
			$title
				.append('<span id="error_'+$postbox.attr('id')+'" class="error">必ず入力して下さい。</span>');
		}
	}
	function removeError($postbox){
		var $title = $postbox.find('h4.cf_title');
		$title
			.children('span.error')
				.remove();
	}


	function padNumber(num){
		var result = num;
		if (num < 10){
			result = '0' + num;
		}
		return result;
	}
});
