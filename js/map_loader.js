define(["leaflet", "os_map", "points_view", "config", "params", "conversion", "jquery", 'bundles/trigs/config_base', 'map_view', 'bundles/abstract_points_builder', 'bundles/abstract_geojson_builder'],
	function(leaflet, OsMap, PointsView, Config, params, conversion, $, trigsPointsBundle, mapView, AbstractPointsBuilder, AbstractGeojsonBuilder) {
			
		function finish() {
			$('div#loading-message-pane').hide();
		}
		
		return {			
			getBundleIds: function(bundles) {
				var allBundles = [];
				if (bundles != null) {
					allBundles.push.apply(allBundles, bundles);
				}
				var dataSourcesString = params('datasources');
				if (dataSourcesString != null && dataSourcesString.length > 0) {
					allBundles.push.apply(allBundles, dataSourcesString.split(','));
				}
				//legacy options
				if (params('hills') == 'true') {
					allBundles.push('hills');
				}
				if (params('trigs') == 'true') {
					allBundles.push('trigs');
				}
				//end legacy options
				return allBundles;
			},
			
			_bundleIdsToDataSources: function(options, bundles) {
				var allBundles;
				if (options.skipLandingPage) {
					allBundles = this.getBundleIds(bundles);
				} else {
					allBundles = bundles;
				}
				if (allBundles != null) {
					allBundles = allBundles.map(function(bundle) {
						if (bundle.indexOf('/') == -1) {
							return bundle + '/config';
						} else {
							return bundle;
						}
					});
				} else {
					allBundles = [];
				}
				return allBundles;
			},
		
			loadMap: function(options, bundleIds) {
				var allBundleIds = this._bundleIdsToDataSources(options, bundleIds);
				if (allBundleIds.length > 0) {
					options = $.extend({ //set some defaults that can be overriden by the page or by loadMiniMap
						cluster: true,
						dimensional_layering: true
					}, options);
					var bundleModuleIds = allBundleIds.map(function(bundleId){
						return 'bundles/' + bundleId;
					});
					require(bundleModuleIds, function(/*bundles...*/) {
						var configBundles = {};
						for (var i = 0; i < arguments.length; i++) {
							configBundles[allBundleIds[i]] = arguments[i];
						}
						this.buildMapWithBundleDatas(options, configBundles);
					}.bind(this));
				} else if (this.hasUrlData()) {
					this.buildMapFromUrl(options);
				} else {
					this.buildMapWithDummyData(options);
				}
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
					map_style: 'mini'
				}, options);
				if (bundles == null) { //default if we haven't passed one in
					bundles = ['trigs/config_mini'];
				}
				this.loadMap(options, bundles);
			},
		
			_buildMap: function(options, bundles) {
				this._config = new Config(options, bundles);
				mapView(this._config);
				this._osMap = new OsMap(this._config);
				this._bundleModels = {};
				return this._osMap;
			},
			
			hasUrlData: function() {
				return params('trigs') != null;
			},
			
			buildMapFromUrl: function(options) {
				var locationsFromUrl = params('trigs');
				var allPoints = locationsFromUrl.split(";");
				options.cluster = (allPoints.length > 300);
				options.dimensional_layering = false;
				this._buildMap(options, {trigs: trigsPointsBundle});
				var pointsModel = new trigsPointsBundle.parser(this._config, trigsPointsBundle);
				for (var i = 0; i < allPoints.length; i++) {
					var point = allPoints[i].split(',');
					var lngLat = conversion.osgbToLngLat(point[0], point[1]);
					pointsModel.add(lngLat, point[2], point[3]);
				}
				this._bundleModels.trigs = pointsModel;
				this._finishLoading();
			},
			
			buildMapWithDummyData: function(options) {
				options.cluster = false;
				options.dimensional_layering = false;
				this._buildMap(options, {trigs: trigsPointsBundle});
				//dummy data as an example
				var pointsModel = new trigsPointsBundle.parser(this._config, trigsPointsBundle);
				pointsModel.add(conversion.osgbToLngLat(418678, 385093), 'http://trigpointing.uk/trig/6995', 'Winhill Pike');
				pointsModel.add(conversion.osgbToLngLat(422816, 385344), 'http://trigpointing.uk/trig/3795', 'High Neb');
				pointsModel.add(conversion.osgbToLngLat(419762, 390990), 'http://trigpointing.uk/trig/949', 'Back Tor');
				pointsModel.add(conversion.osgbToLngLat(412927, 387809), 'http://trigpointing.uk/trig/3019', 'Edale Moor');
				this._bundleModels.trigs = pointsModel;
				this._finishLoading();
			},
			
			buildMapWithBundleDatas: function(options, bundles) {
				this._buildMap(options, bundles);
				//https://rawgit.com/tstibbs/geo-bagging/master/js/bundles/hills/data.json
				var bundleDataPrefix = (this._config.remoteData ? 'https://rawgit.com/tstibbs/geo-bagging/gh-pages' : window.os_map_base);//some mobile browsers don't support local ajax, so this provides a workaround for dev on mobile devices.
				var promises = Object.keys(bundles).map(function(bundleName) {
					var bundle = bundles[bundleName];
					var bundleModel = new bundle.parser(this._config, bundle, bundleName);
					this._bundleModels[bundleName] = bundleModel;
					return bundleModel.fetchData(bundleDataPrefix);
				}.bind(this));
				$.when.apply($, promises).always(this._finishLoading.bind(this));
			},
			
			_finishLoading: function() {
				var filterModels = function(className) {
					var matchingModels = {};
					Object.keys(this._bundleModels).filter(function(bundleName) {
						var model = this._bundleModels[bundleName];
						return model instanceof className;
					}.bind(this)).forEach(function(bundleName) {
						matchingModels[bundleName] = this._bundleModels[bundleName];
					}.bind(this));
					return matchingModels;
				}.bind(this);
				
				var pointsModels = filterModels(AbstractPointsBuilder);
				var geojsonModels = filterModels(AbstractGeojsonBuilder);
				this._pointsView = new PointsView(this._osMap.getMap(), this._config, pointsModels, this._osMap.getControls(), this._osMap.getLayers());
				Object.keys(geojsonModels).forEach(function(bundleName) {
					var model = geojsonModels[bundleName];
					model.addTo(this._osMap.getMap());
				}.bind(this));
				
				this._pointsView.finish(finish);
			}
		};
	}
);
