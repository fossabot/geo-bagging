define([
	'os_map',
	'config',
	'params',
	'jquery',
	'map_view',
	'source_loader'
],
	function(
		OsMap,
		Config,
		params,
		$,
		mapView,
		SourceLoader
	) {
			
		return {			
			getBundleIds: function(bundles) {
				var allBundles = [];
				if (bundles != null) {
					allBundles.push.apply(allBundles, bundles);
				}
				var dataSourcesString = params.test('datasources');
				if (dataSourcesString != null && dataSourcesString.length > 0) {
					allBundles.push.apply(allBundles, dataSourcesString.split(','));
				}
				//legacy options
				if (params.test('hills') == 'true') {
					allBundles.push('hills');
				}
				if (params.test('trigs') == 'true') {
					allBundles.push('trigs');
				}
				//end legacy options
				return allBundles;
			},
		
			loadMap: function(options, bundleIds) {
				if (options.skipLandingPage) {
					allBundles = this.getBundleIds(bundleIds);
				} else {
					allBundles = bundleIds;
				}
				if (this.hasUrlData()) {
					alert('Loading data from URL is no longer an option.');
					throw new Error('Loading data from URL is no longer an option.');
				} else if (options.pointsToLoad != null) {
					var generalPoints = options.pointsToLoad.generalPoints;
					options.cluster = (generalPoints.length > 300);
					options.dimensional_layering = false;
					allBundles = ['trigs/config_embedding'];
				}
				options = $.extend({ //set some defaults that can be overriden by the page or by loadMiniMap
					cluster: true,
					dimensional_layering: true
				}, options);
				
				var map = this._buildMap(options);
				return (new SourceLoader(map, this._config)).loadSources(allBundles).then(function() {
					return map;
				});
			},
			
			loadMiniMap: function(options, bundles) {
				//set some defaults that can be overriden by the page
				options = $.extend({
					cluster: false,
					dimensional_layering: false,
					initial_zoom: 10,
					start_position: [54.454463, -3.213515],
					show_search_control: false,
					show_locate_control: false,
					show_hider_control: true,
					hider_control_start_visible: false,
					map_style: 'mini',
					use_sidebar: false
				}, options);
				if (bundles == null) { //default if we haven't passed one in
					bundles = ['trigs/config_mini'];
				}
				this.loadMap(options, bundles);
			},
		
			_buildMap: function(options) {
				this._config = new Config(options);
				mapView(this._config);
				return new OsMap(this._config);
			},
			
			hasUrlData: function() {
				return params.test('trigs') != null;
			}
		};
	}
);
