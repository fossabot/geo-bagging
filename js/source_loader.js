define([
	'jquery',
	'leaflet',
	'constants',
	'model_views'
],
	function(
		$,
		leaflet,
		constants,
		ModelViews
	) {
	
		var SourceLoader = leaflet.Class.extend({
			initialize: function (map, config) {
				this._osMap = map;
				this._config = config;
			},
			
			loadSources: function(selectedSourceIds) {
				var sourceIds = $.uniqueSort(selectedSourceIds.concat(constants.dataSources));
				var sourceModuleIds = this._sourceIdsToDataSources(sourceIds);
				sourceModuleIds = sourceModuleIds.map(function(sourceId){
					return 'bundles/' + sourceId;
				});
				var deferredObject = $.Deferred();
				require(sourceModuleIds, function(/*sources...*/) {
					var sources = {};
					for (var i = 0; i < arguments.length; i++) {
						sources[sourceIds[i]] = arguments[i];
					}
				
					//https://tstibbs.github.io/geo-bagging/js/bundles/trigs/data_all.json
					var sourceDataPrefix = (this._config.remoteData ? 'https://tstibbs.github.io/geo-bagging' : window.os_map_base);//some mobile browsers don't support local ajax, so this provides a workaround for dev on mobile devices.
					
					var sourceModels = {};
					var lazyModels = {};
					var promises = Object.keys(sources).map(function(sourceName) {
						var source = sources[sourceName];
						var parser = new source.parser(this._config, source, sourceName, sourceDataPrefix);
						
						var metaPromise = parser.fetchMeta();
						if (selectedSourceIds.indexOf(sourceName) != -1) {
							var dataPromise = parser.fetchData();
							sourceModels[sourceName] = parser;
							return $.when(metaPromise, dataPromise);
						} else {
							lazyModels[sourceName] = parser;
							return metaPromise;
						}
					}.bind(this));
					
					$.when.apply($, promises).always(function() {
						var modelViews = new ModelViews();
						modelViews.loadModelViews(sourceModels, lazyModels, this._osMap.getMap(), this._config, this._osMap.getControls(), this._osMap.getLayers(), sources, this._finish);
						//don't need to wait for ModeViews to finish, callback will update UI when the time comes, but can safely return after this call
						deferredObject.resolve();
					}.bind(this));
				}.bind(this));
				return deferredObject.promise();
			},
			
			_sourceIdsToDataSources: function(allSources) {
				if (allSources != null) {
					allSources = allSources.map(function(source) {
						if (source.indexOf('/') == -1) {
							return source + '/config';
						} else {
							return source;
						}
					});
				} else {
					allSources = [];
				}
				return allSources;
			},
			
			_finish: function() {
				$('div#loading-message-pane').hide();
			}
		});

		return SourceLoader;
	}
);
