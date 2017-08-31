define(['../abstract_points_builder'],
	function(AbstractPointsBuilder) {
		return AbstractPointsBuilder.extend({
			parse: function(point) {
				//[Longitude,Latitude,Name,Link,LifeboatTypes,LaunchMethods]
				var lng = point[0];
				var lat = point[1];
				var name = point[2];
				var link = point[3];
				var types = point[4];
				var launchMethods = point[5];
				
				var typeLabels = this._bundleConfig.dimensionValueLabels[this._bundleConfig.dimensionNames[0]];
				var launchMethodLabels = this._bundleConfig.dimensionValueLabels[this._bundleConfig.dimensionNames[1]];
				
				function split(values, labels) {
					var splits = values.split(';');
					splits = splits.map(function(value) {
						var label = labels[value];
						return label != null ? label : value;
					});
					if (splits.length == 1) {
						return splits[0];
					} else {
						return splits;
					}
				}

				var extraInfos = {
					'Types': split(types, typeLabels),
					'Launch Methods': split(launchMethods, launchMethodLabels)
				};
				this.addMarker(name, lat, lng, link, name, extraInfos, null, [types, launchMethods]);
			},
		});
	}
);
