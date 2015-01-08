// Going through this? The code is kind of messy and I apologise in advance.
// It's the absolute result of not having a plan before you begin.
// That said, it should be mostly straightforward. 

var defaulturl = 'http://www.responsivetester.net/go.html';


Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}


// Create default sizes, or reset
function setDefaults () {

	// clear anything set already, irrelevant if starting fresh
	localStorage.clear();
	
	var timenow = new Date().getTime();
	
	localStorage.setItem('size-1' + timenow, JSON.stringify( { 'name': 'iPad Landscape', 'w': '1024', 'h': '768', 'display': '1' } ));
	localStorage.setItem('size-2' + timenow, JSON.stringify( { 'name': 'iPad Portrait', 'w': '768', 'h': '1024', 'display': '1' } ));
	localStorage.setItem('size-3' + timenow, JSON.stringify( { 'name': 'Nexus 7 / Tablet', 'w': '601', 'h': '800', 'display': '1' } ));
	localStorage.setItem('size-4' + timenow, JSON.stringify( { 'name': 'Small Tablet', 'w': '480', 'h': '640', 'display': '1' } ));
	localStorage.setItem('size-5' + timenow, JSON.stringify( { 'name': 'Nexus 5 / Smartphone', 'w': '360', 'h': '598', 'display': '1' } ));
	localStorage.setItem('size-6' + timenow, JSON.stringify( { 'name': 'iPhone 4 / Smartphone', 'w': '320', 'h': '480', 'display': '1' } ));
	localStorage.setItem('size-7' + timenow, JSON.stringify( { 'name': 'iPhone 6+ / Smartphone', 'w': '414', 'h': '736', 'display': '1' } ));
	localStorage.setItem('size-8' + timenow, JSON.stringify( { 'name': 'Small Phone', 'w': '240', 'h': '320', 'display': '0' } ));
	
	localStorage.setItem('extraPixels', '0');
	localStorage.setItem('largestFirst', '0');
	localStorage.setItem('cropFrames', '1');
	
	localStorage.setItem('showNotice', '1');
	localStorage.setItem('panelHidden', '0');
	
}



// Set the height for the scrolling pane 
function setSizesScrollHeight () {
	var bottomPanelsHeight = $('#bottomLeft').outerHeight();
	$('#defContainer').css('padding-bottom', bottomPanelsHeight);
}


// Order size boxes and frames
// http://stackoverflow.com/questions/21600802/jquery-sort-list-based-on-data-attribute-value
function sortList(a, b){
	if (localStorage.getItem( 'largestFirst' ) == '1') {
		return ($(b).data('fwidth')) > ($(a).data('fwidth')) ? 1 : -1;	
	} else {
		return ($(b).data('fwidth')) < ($(a).data('fwidth')) ? 1 : -1;
	}
}
function sortLists() {
	$("#sizesList li").sort(sortList).appendTo('#sizesList');
	$("#panel div").sort(sortList).appendTo('#panel');
}


// Add and append
function createIframe(frameID) {

	frameOptions = JSON.parse( localStorage.getItem( frameID ) );
	extraPixels  = localStorage.getItem( 'extraPixels' );
	frameWidth   = (parseInt(frameOptions.w) + parseInt(extraPixels));

	$('<h2>' + frameOptions.w + ' x ' + frameOptions.h + ' <span>(' + frameOptions.name + ')</span></h2>').appendTo('#' + frameID);
	$('<iframe src="' + defaulturl + '" style="width: ' + frameWidth + 'px; height: ' + frameOptions.h + 'px;">').appendTo('#' + frameID);
	
	$('#' + frameID + ' iframe').load(function () { frameLoaded('#' + frameID) });
	
	$('#' + frameID).fadeIn('fast', function() {
		resizeFramePanel();
		cropFrames();		
	});

}


// Resize iframe panel
function resizeFramePanel() {
	var width = 0;
	var height = 0;
	$('#panel div').each(function() {

		if ($(this).hasClass('noShow')) {
			
		} else {
		    width += $(this).outerWidth( true );
		    if ($(this).outerHeight( true ) > height) height = $(this).outerHeight( true );	
		}
			
	});
	width += parseInt($('#panel').css('padding-left')) + parseInt($('#panel').css('padding-right'));
	$('#panel').css('width', width);
	//$('#panel').css('width', width + 50);
	//$('#panel').css('height', height + 30); // extra for padding;
}


// Update all frames
function updateFrames() {
	$('#panel').empty();
	$('#urlbox').addClass('isLoading');
	getAllFrames(false);
}


// Set this so we can count them later
var iframesLoaded = 0;
// When the frame is loaded
function frameLoaded (frameID) {
	// compare total count to all those returned.
	iframesLoaded++;
	if (iframesLoaded == $('#panel iframe').length) {
		iframesLoaded = 0;
		$('#urlbox').removeClass('isLoading');
	}
}


// Get all frames 
function getAllFrames(addSizes) {
	for ( var i = 0, len = localStorage.length; i < len; ++i ) {
		if ( localStorage.key( i ).substring(0, 5) == "size-" ) {		
			var winSize = JSON.parse( localStorage.getItem( localStorage.key( i ) ) );
			
			var checked      = '';
			var classChecked = '';
			var divChecked   = ' noShow';
			if (winSize.display == '1') {
				checked      = ' checked="checked"';
				classChecked = ' class="checked"';
				divChecked   = ''; 
			}
			if (addSizes == true) {
				$("#sizesList").append('<li data-fwidth="' + winSize.w + '" data-panelid="' + localStorage.key( i ) + '"><label' + classChecked + '><input type="checkbox" ' + checked + ' />' + winSize.w + ' x ' + winSize.h + ' (' + winSize.name + ')</label><div class="close"></div></li>');	
			}
			$("#panel").append('<div id="' + localStorage.key( i ) + '" class="framePanel' + divChecked + '" data-fwidth="' + winSize.w + '"></div>');
			
			// If we're displaying, create the iframe
			if (winSize.display == '1') createIframe(localStorage.key( i ));
		}
		
	}
	// Sort the list
	sortLists();
}


// Reload Frames 
function reloadFrames() {
	updateFrames();
}


// Crop Frames
function cropFrames() {
	if (localStorage.getItem( 'cropFrames' ) == '1') {
		var winHeight = $(window).outerHeight(true);
		var remHeight = parseInt($('#panel').css('padding-top')) + parseInt($('#panel').css('padding-bottom')) + $('#panel div h2').outerHeight(true);
		
		setHeight = winHeight - remHeight - 20;
		
		$('#panel iframe').css('max-height', setHeight + 'px');
	} else {
		$('#panel iframe').css('max-height', '');
	}
}


// Add HTTP
function addHttp(url) {
	if (url.substr(0, 7) !== 'file://' && url.substr(0,7) !== 'http://' && url.substr(0,8) !== 'https://') {
		return 'http://' + url;
	} else {
		return url;
	}
}




$(document).ready( function () {
	
	// -- Set defaults if not set
	if (localStorage.getItem( 'panelHidden' ) === null) {
		setDefaults();
	}
	
	// -- Then tick appropriate boxes
	if (localStorage.getItem( 'largestFirst' ) == '1') {
		$('#largestFirst').prop( 'checked', true );
	}
	if (localStorage.getItem( 'cropFrames' ) == '1') {
		$('#cropFrames').prop( 'checked', true );
	}
	$('#extraPixels').val( localStorage.getItem( 'extraPixels' ) );


	// -- And hide panel if necessary
	if (localStorage.getItem( 'panelHidden' ) == '1') {
		$('#container').css('padding-left', '10px');
		$('nav').css('left', '-290px');
		$('#slideInOut').addClass('isIn');
	} else {
		$('#container').css('padding-left', '300px');
		$('nav').css('left', '0');
		$('#slideInOut').removeClass('isIn');
	}


	// -- Set the height for the scrolling pane 
	setSizesScrollHeight(); 
	
	// -- ...and resize it on browser size change
	window.addEventListener('resize', function(event){
		setSizesScrollHeight(); 
		
		// Also redo our frame cropping
		cropFrames();
	});



	// -- Check for query string, set deafult URL if not
	var fromUrl = document.URL;

	if( fromUrl.indexOf('?') === -1 ){
		fromUrl = '';
	} else {
		fromUrl = fromUrl.substring( fromUrl.indexOf('?') );
		fromUrl = fromUrl.substr(1)
	}

	if (fromUrl === '') fromUrl = defaulturl;
	fromUrl = addHttp(fromUrl);
	
	defaulturl = fromUrl;
	$('#urlbox').val(fromUrl);
	$('#urlbox').addClass('isLoading');



	// -- Add any sizes to panel and divs to main section
	// Loop through and append the sizes to the list
	getAllFrames(true);	
	

	
	// -- Remove size when clicked
	// Set the click to actually remove it.
	$('#sizesList').on('click', '.close', function (e) {
	
		e.preventDefault();
		e.stopPropagation();
		
		if (window.confirm("Sure?")) {
			
			// Get the what we're removing
			var panelid = $(this).parent('li');
			// Remove from localstorgae
			localStorage.removeItem(panelid.data('panelid'));
			// remove the div
			$('#' + panelid.data('panelid')).remove();
			// remove the list item
			$(panelid).remove();
			
		}
		
	});

	
	// -- Add new size
	$('#submitButton').on('click', function (e) {
		
		e.preventDefault();
		$('#submitButton').prop("disabled", true);
		
		
		// Check all our boxes are more or less fine
		if ($('#wBox').val() != '' && $('#hBox').val() != '' && $('#iBox').val() != '' && $('#wBox').val() > 0 && $('#hBox').val() > 0) {
			// Fade in the loading wheel
			$('#loading').fadeIn(100, function () {
				
				var timenow = new Date().getTime();
				
				localStorage.setItem('size-' + timenow, JSON.stringify( { 'name': $('#iBox').val(), 'w': $('#wBox').val(), 'h': $('#hBox').val(), 'display': '1' } ));
				$('<li data-fwidth="' + $('#wBox').val() + '" data-panelid="' + 'size-' + timenow + '"><label class="checked"><input type="checkbox" checked="checked" />' + $('#wBox').val() + ' x ' + $('#hBox').val() + ' (' + $('#iBox').val() + ')</label><div class="close"></div></li>').appendTo($("#sizesList"));
				updateFrames();
				sortLists();
				$('#submitButton').prop("disabled", false);
				$('#loading').fadeOut(100);
				
			});
	
		// Error
		} else {
			$('#error').fadeIn(100).delay(2000).fadeOut('slow', function() { $(this).removeAttr("disabled"); });
			$('#submitButton').prop("disabled", false);
		}
	});
	
	
		
	// -- Set properties for options on change
	$('#largestFirst').change( function () {
		if ($('#largestFirst').prop( "checked" ) == true) {
			localStorage.setItem('largestFirst', '1'); 
		} else {
			localStorage.setItem('largestFirst', '0'); 
		}
		sortLists();
	});
	$('#cropFrames').change( function () {
		
		if ($('#cropFrames').prop( "checked" ) == true) {
			localStorage.setItem('cropFrames', '1');
			cropFrames();
		} else {
			localStorage.setItem('cropFrames', '0'); 
			cropFrames();
		}
	});
	$('#extraPixels').change( function () {
		var wto;
		clearTimeout(wto);
		wto = setTimeout(function() {
			if ($('#extraPixels').val() < 1 || !$.isNumeric($('#extraPixels').val())) {
				$('#extraPixels').val(0);
			}
			localStorage.setItem('extraPixels', $('#extraPixels').val());
			updateFrames();
		}, 2000);
	});
	// Size changes
	$('#sizesList').on('change', 'input', function () {
		
		// disable it until done
		var thisCheck = $(this);
		$(this).prop('disabled', true);
		
		var parentPanel = $(this).parents('li').data('panelid');
		var changeSize  = JSON.parse( localStorage.getItem( parentPanel ) );
		
		// if the size is checked or not, do your biziness
		if ($(this).prop( "checked" ) == true) {
			$(this).parent('label').addClass('checked');
			createIframe( parentPanel );
			$('#' + parentPanel).fadeIn('fast', function () {
				$('#' + parentPanel).removeClass('noShow');
				resizeFramePanel();
				thisCheck.prop('disabled', false);
			});
			displayitem = 1;
		} else {
			$(this).parent('label').removeClass('checked');
			$('#' + parentPanel).fadeOut('fast', function () {
				$('#' + parentPanel).empty();
				$('#' + parentPanel).addClass('noShow');
				resizeFramePanel();
				thisCheck.prop('disabled', false);
			});
			displayitem = 0;
		}
		changeSize.display = displayitem;
		localStorage.setItem(parentPanel, JSON.stringify( changeSize ));
	});
			
	
	
	// -- Reset to defaults
	$('#resetDefaults').on('click', function (e) {
		e.preventDefault();
		if (window.confirm("Reset to defaults? All custom sizes will be lost!")) {
			localStorage.clear();
			location.reload();
        }
	});
	
	
	
	// -- ReloadFrames 
	$('#reloadFrames').on('click', function () {
		reloadFrames();
	});
	
	
	
	// -- HideSide 
	$('#slideInOut').on('click', function() {
		if (localStorage.getItem( 'panelHidden' ) == '0') {
			$('#container').stop(true, true).animate( {'padding-left': '10px'}, 100);
			$('nav').stop(true, true).animate( {'left': '-290px'}, 100, function () {
				localStorage.setItem( 'panelHidden', 1 );
				$('#slideInOut').addClass('isIn');
			});
		} else {
			$('#container').stop(true, true).animate( {'padding-left': '300px'}, 100);
			$('nav').stop(true, true).animate( {'left': '0'}, 100, function () {
				localStorage.setItem( 'panelHidden', 0 );
				$('#slideInOut').removeClass('isIn');
			});			
		}
		
	});
	
	
	
	// -- Do this if we have something in the box
	$('form').submit(function(e) {
	
		e.preventDefault();
		
		$('#urlbox').removeClass('isLoading');
		
		defaulturl = addHttp( $('#urlbox').val() );
		
		if (history.pushState) {
		  history.pushState('', '', '?' + defaulturl);
		}

		
		updateFrames();
		
	});
	
	
	
	// -- Close the infoPane 
	$('#infoPane').on('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		
		$('#infoPane').fadeOut('fast');
		
	});
	$('#infoPane a').on('click', function (e) {
		e.stopPropagation();
	});
	// -- Open the infoPane {
	$('#infoOpen').on('click', function(e) {
		e.preventDefault();
		
		$('#infoPane').fadeIn('fast');
	});
	

	
});


$(window).load(function () {

	// Also done above, but let's get some heights, chop a bit off and resize the windows if necessary
	cropFrames();

});


