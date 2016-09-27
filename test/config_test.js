define(["config"],
    function(Config) {
		QUnit.module('config', function(hooks) {
			hooks.beforeEach(function() {
				if (localStorage !== undefined) {
					localStorage.clear();
				}
			});
			QUnit.test('should inherit defaults', function(assert) {
				var config = new Config();
				assert.equal(true, config.cluster);
				assert.equal(false, config.dimensional_layering);
				assert.equal(undefined, config.blah);
				assert.notOk(config.hasOwnProperty('blah'));
			});
			QUnit.test('defaults can be overridden', function(assert) {
				var config = new Config({
					cluster: false,
					blah: 'stuff'
				});
				assert.equal(false, config.cluster);
				assert.equal(false, config.dimensional_layering);
				assert.equal('stuff', config.blah);
				assert.ok(config.hasOwnProperty('blah'));
			});
			QUnit.module('persistence', function() {
				QUnit.test('can save and retrieve', function(assert) {
					var config = new Config({blah: 4});
					assert.equal(4, config.blah);
					config.persist({blah: 5});
					assert.equal(4, config.blah);//should still be 4 - persisting shouldn't change the retrieved values until we reload the page
					var config2 = new Config({blah: 4});
					assert.equal(5, config2.blah);//saved value should override the value from config
				});
				QUnit.test('can save and retrieve with null options', function(assert) {
					var config = new Config();
					config.persist({blah: 5});
					var config2 = new Config();
					assert.equal(5, config2.blah);//saved value should now be available
				});
				QUnit.test('can force override', function(assert) {
					var config = new Config();
					config.persist({blah: 5});
					var config2 = new Config({
						force_config_override: true,
						blah: 4
					});
					assert.equal(4, config2.blah);//passed-in value should override saved value
				});
				QUnit.test('saving is for a given page id', function(assert) {
					//set up
					var config1 = new Config({page_id: 'abc'});
					config1.persist({blah: 5});
					var config2 = new Config({page_id: 'xyz'});
					config2.persist({blah: 6});
					//test
					var newConfig1 = new Config({page_id: 'abc'});
					var newConfig2 = new Config({page_id: 'xyz'});
					assert.equal(5, newConfig1.blah);
					assert.equal(6, newConfig2.blah);
				});
			});
			QUnit.module('bundles', function() {
				QUnit.test('can load without bundles', function(assert) {
					var config = new Config({page_id: 'abc'});
					assert.ok(true);//no error occured
				});
				QUnit.test('bundle overrides defaults', function(assert) {
					var bundle = {
						blah: 'thing'
					}
					var config = new Config({blah: 'stuff'}, bundle);
					assert.equal(config.blah, bundle.blah);
				});
				QUnit.test('bundles override each other', function(assert) {
					var bundle1 = {
						blah: 'thing'
					}
					var bundle2 = {
						blah: 'xyz'
					}
					var config = new Config({blah: 'stuff'}, bundle1, bundle2);
					assert.equal(config.blah, bundle2.blah);
				});
				QUnit.test('saved config overrides bundles', function(assert) {
					//set up
					var savedValue= 'lmnop';
					var config1 = new Config();
					config1.persist({blah: savedValue});
					assert.equal(savedValue, (new Config()).blah);//check it's been persisted correctly
					//test
					var bundle = {
						blah: 'abc'
					}
					var config2 = new Config({blah: 'xyz'}, bundle);
					assert.equal(config2.blah, savedValue);
				});
			});
		});
	}
);
