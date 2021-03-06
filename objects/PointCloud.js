/**
 * @author alteredq / http://alteredqualia.com/
 */
/**
 * @classdesc 点云对象<br />
 * 注释内容部分参照 http://blog.csdn.net/omni360
 * @param {THREE.Geometry} geometry 点云对象的几何对象
 * @param {THREE.Material} material	点云对象的材质对象
 * @constructor
 */
THREE.PointCloud = function ( geometry, material ) {

	THREE.Object3D.call( this );

	this.type = 'PointCloud';
	/**
	 * @desc 点云对象的几何对象
	 * @type {THREE.Geometry}
	 */
	this.geometry = geometry !== undefined ? geometry : new THREE.Geometry();
	/**
	 * @desc 点云对象的材质对象
	 * @type {THREE.Material}
	 */
	this.material = material !== undefined ? material : new THREE.PointCloudMaterial( { color: Math.random() * 0xffffff } );
	/**
	 * @desc 是否对点云排序
	 * @type {boolean}
	 */
	this.sortParticles = false;

};
/**
 * @desc PointCloud从Objec3D的原型继承所有属性方法
 * @type {THREE.Object3D}
 */
THREE.PointCloud.prototype = Object.create( THREE.Object3D.prototype );

/**
 * @function
 * @desc 点云的拾取判断函数
 * @param {THREE.Raycaster} raycaster 拾取射线对象
 * @param {*} intersects 拾取结果对象数组
 */
THREE.PointCloud.prototype.raycast = ( function () {

	var inverseMatrix = new THREE.Matrix4();
	var ray = new THREE.Ray();

	return function ( raycaster, intersects ) {

		var object = this;
		var geometry = object.geometry;
		var threshold = raycaster.params.PointCloud.threshold;

		inverseMatrix.getInverse( this.matrixWorld );
		ray.copy( raycaster.ray ).applyMatrix4( inverseMatrix );
		// 外包围盒碰撞判断
		if ( geometry.boundingBox !== null ) {

			if ( ray.isIntersectionBox( geometry.boundingBox ) === false ) {

				return;

			}

		}

		var localThreshold = threshold / ( ( this.scale.x + this.scale.y + this.scale.z ) / 3 );
		var position = new THREE.Vector3();
		//检查射线与点云元素是否碰撞的具体实现.
		var testPoint = function ( point, index ) {

			var rayPointDistance = ray.distanceToPoint( point );

			if ( rayPointDistance < localThreshold ) {

				var intersectPoint = ray.closestPointToPoint( point );
				intersectPoint.applyMatrix4( object.matrixWorld );

				var distance = raycaster.ray.origin.distanceTo( intersectPoint );

				intersects.push( {

					distance: distance,
					distanceToRay: rayPointDistance,
					point: intersectPoint.clone(),
					index: index,
					face: null,
					object: object

				} );

			}

		};
		// 如果geometry对象是BufferGeometry对象
		if ( geometry instanceof THREE.BufferGeometry ) {

			var attributes = geometry.attributes;
			var positions = attributes.position.array;
			// 下面对三种数据格式的pointCloud对象的元素进行检测.
			if ( attributes.index !== undefined ) {

				var indices = attributes.index.array;
				var offsets = geometry.offsets;

				if ( offsets.length === 0 ) {

					var offset = {
						start: 0,
						count: indices.length,
						index: 0
					};

					offsets = [ offset ];

				}

				for ( var oi = 0, ol = offsets.length; oi < ol; ++oi ) {

					var start = offsets[ oi ].start;
					var count = offsets[ oi ].count;
					var index = offsets[ oi ].index;

					for ( var i = start, il = start + count; i < il; i ++ ) {

						var a = index + indices[ i ];

						position.fromArray( positions, a * 3 );

						testPoint( position, a );

					}

				}

			} else {

				var pointCount = positions.length / 3;

				for ( var i = 0; i < pointCount; i ++ ) {

					position.set(
						positions[ 3 * i ],
						positions[ 3 * i + 1 ],
						positions[ 3 * i + 2 ]
					);

					testPoint( position, i );

				}

			}

		} else {

			var vertices = this.geometry.vertices;

			for ( var i = 0; i < vertices.length; i ++ ) {

				testPoint( vertices[ i ], i );

			}

		}

	};

}() );
/**
 * @desc Three.PointCloud 克隆函数
 * @param {THREE.PointCloud} object
 * @returns {THREE.PointCloud}
 */
THREE.PointCloud.prototype.clone = function ( object ) {

	if ( object === undefined ) object = new THREE.PointCloud( this.geometry, this.material );

	object.sortParticles = this.sortParticles;

	THREE.Object3D.prototype.clone.call( this, object );

	return object;

};

// Backwards compatibility
/**
 * @ignore
 * @param geometry
 * @param material
 * @returns {THREE.PointCloud}
 * @constructor
 */
THREE.ParticleSystem = function ( geometry, material ) {

	console.warn( 'THREE.ParticleSystem has been renamed to THREE.PointCloud.' );
	return new THREE.PointCloud( geometry, material );

};
