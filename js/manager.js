define([
	'jquery',
	'leaflet',
	'controls',
	'layers'
],
	function(
		$,
		leaflet,
		Controls,
		layersBuilder
	) {
	
		//basic manager class that simplifies interoperation between other components
		return leaflet.Class.extend({
			initialize: function (map, config) {
				this._authenticated = false;
				this._map = map;
				this._config = config;
				this._layers = layersBuilder(map, config);
				this._controls = new Controls(config, this._layers, map, this);
			},
			
			setViewConstraints: function (limitFunction) {
				this._limitFunction = limitFunction;//function(latLng) {return true or false}
			},
			
			getViewConstraints: function() {
				return this._limitFunction;
			},
			
			getControls: function() {
				return this._controls;
			},
			
			getMap: function() {
				return this._map;
			},
			
			getLayers: function() {
				return this._layers;
			},
			
			getConfig: function() {
				return this._config;
			},
			
			setAuthenticated: function(/*boolean*/ authenticated) {
				this._authenticated = authenticated;
			},
			
			shouldManageVisits: function() {
				//currently just checks that we're authenticated
				return this._authenticated;
			}
		});
	}
);
