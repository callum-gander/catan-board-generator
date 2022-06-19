/*
	Example tile class that constructs its geometry for rendering and holds some gameplay properties.

	@author Corey Birnbaum https://github.com/vonWolfehaus/
*/
vg.Tile = function(config) {
	config = config || {};
	// var texture = new THREE.TextureLoader().load( 'textures/catan.jpg' );
	// var tMaterial = new THREE.MeshBasicMaterial({
	// 	map: texture
	// });
	// wheat, forest, brick, stone, sheep, desert, water
	var colors = ['#FEBA1A', '#2F6529', '#DC6320', '#6D687E', '#7DC245', '#000000', '#01A6E6'];
	function getRndInteger(min, max) {
		return Math.floor(Math.random() * (max - min) ) + min;
	}

	var randomMaterial = new THREE.MeshBasicMaterial({
			color: colors[getRndInteger(0, 6)],
			side: THREE.DoubleSide
		});



	var settings = {
		cell: null, // required vg.Cell
		geometry: null, // required threejs geometry
		material: randomMaterial // not required but it would improve performance significantly
	};
	settings = vg.Tools.merge(settings, config);

	if (!settings.cell || !settings.geometry) {
		throw new Error('Missing vg.Tile configuration');
	}

	this.cell = settings.cell;
	if (this.cell.tile && this.cell.tile !== this) this.cell.tile.dispose(); // remove whatever was there
	this.cell.tile = this;

	this.uniqueID = vg.Tools.generateID();

	this.geometry = settings.geometry;
	this.material = settings.material;
	if (!this.material) {
		var test = colors[getRndInteger(0, 7)];
		console.log(test);
		this.material = new THREE.MeshPhongMaterial({
			color: test
		});
	}

	this.objectType = vg.TILE;
	this.entity = null;
	this.userData = {};

	this.selected = false;
	this.highlight = '0x0084cc';

	this.mesh = new THREE.Mesh(this.geometry, this.material);
	this.mesh.userData.structure = this;

	// create references so we can control orientation through this (Tile), instead of drilling down
	this.position = this.mesh.position;
	this.rotation = this.mesh.rotation;

	// rotate it to face "up" (the threejs coordinate space is Y+)
	this.rotation.x = -90 * vg.DEG_TO_RAD;
	this.mesh.scale.set(settings.scale, settings.scale, 1);

	if (this.material.emissive) {
		this._emissive = this.material.emissive.getHex();
	}
	else {
		this._emissive = null;
	}
};

vg.Tile.prototype = {
	select: function() {
		if (this.material.emissive) {
			this.material.emissive.setHex(this.highlight);
		}
		this.selected = true;
		return this;
	},

	deselect: function() {
		if (this._emissive !== null && this.material.emissive) {
			this.material.emissive.setHex(this._emissive);
		}
		this.selected = false;
		return this;
	},

	toggle: function() {
		if (this.selected) {
			this.deselect();
		}
		else {
			this.select();
		}
		return this;
	},

	dispose: function() {
		if (this.cell && this.cell.tile) this.cell.tile = null;
		this.cell = null;
		this.position = null;
		this.rotation = null;
		if (this.mesh.parent) this.mesh.parent.remove(this.mesh);
		this.mesh.userData.structure = null;
		this.mesh = null;
		this.material = null;
		this.userData = null;
		this.entity = null;
		this.geometry = null;
		this._emissive = null;
	}
};

vg.Tile.prototype.constructor = vg.Tile;
