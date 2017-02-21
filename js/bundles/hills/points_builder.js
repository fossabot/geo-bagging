define(['../abstract_points_builder'],
	function(AbstractPointsBuilder) {
		return AbstractPointsBuilder.extend({
			parse: function(point) {
				//[Longitude,Latitude,Id,Name,Classification,Height(m)]
				var lng = point[0];
				var lat = point[1];
				var id = point[2];
				var name = point[3];
				var classification = point[4];
				var height = point[5];
				
				var url = 'http://www.hill-bagging.co.uk/mountaindetails.php?rf=' + id;

				var classificationStrings = classification.split(';').map(function(classf) {
					var displayString = this._bundleConfig.hillDisplayNames[classf];
					if (displayString == null) {
						displayString = classf;
					}
					return displayString;
				}.bind(this));
				var extraInfos = {
					'Height': height,
					'Classifications': classificationStrings
				};
				this.addMarker(id, lat, lng, url, name, extraInfos, null, [classification]);
			},
		});
	}
);
