define(['jquery'],
	function($) {
		return function(leafletMap) {
			var container = $('div.full-screen-link');
			if (container.length > 0) {
				var link = $('<a href="#">Open in full screen</a>');
				link.click(function() {
					var zoom = leafletMap.getZoom();
					var centre = leafletMap.getCenter();
					var newUrl = '25k-layers.html?startPosition=' + centre.lat + ',' + centre.lng + '&startZoom=' + zoom;
					window.location.href = newUrl;
				});
				$('div.full-screen-link').append(link);
			}
		};
	}
);
