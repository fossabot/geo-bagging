//$.getScript("https://tstibbs.github.io/geo-bagging/integration/trigpointing_embed.js");

var urlBase = 'https://tstibbs.github.io/geo-bagging/';

$.ajaxSetup({
  cache: true
});
$.getScript("https://cdnjs.cloudflare.com/ajax/libs/require.js/2.2.0/require.js").then(function() {
	return $.getScript(urlBase + "js/loader.js")
})
.then(function() {
	loadOsMap(urlBase, function(main) {
		require(['conversion'], function(conversion) {
			var centreGridRef = $("div:contains('Grid reference : '):not(:has(*)) + div a").text();
			var lngLat = conversion.gridRefToLngLat(centreGridRef);
			var lng = lngLat[0];
			var lat = lngLat[1];
			
			// create a bounding box roughly 20km from the point in each direction. add and subtract the following from the lat/long of the point
			var latAddition = 0.1797;
			var lngAddition = 0.305;

			var minLat = lat - latAddition;
			var maxLat = lat + latAddition;
			var minLng = lng - lngAddition;
			var maxLng = lng + lngAddition;
			
			var mapDiv = $('map[name="trigmap"]').parent();
			mapDiv.empty()

			var options = {
				start_position: [lat, lng],
				markerConstraints: [[minLat, minLng], [maxLat, maxLng]],
				map_outer_container_element: mapDiv
			};
			
			main.loadMiniMap(options, ['trigs']);
			function moveMap() {
				var miniMap = $('div.mini-map');
				if (miniMap.length > 0) {
					miniMap.css('top', $('div.navbar').css('height'));
				} else {
					setTimeout(moveMap.bind(this), 500);
				}
			}
			moveMap();
		}.bind(this));
	});
});
