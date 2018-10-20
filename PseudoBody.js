class Body {

  constructor(options) {

    const defaults = {
      tag: 'body',
      position: new Vector(0, 0),
      angle: 0,
      velocity: new Vector(0, 0),
      angularVelocity: 0,
      mass: 1,
      force: new Vector(0, 0),
      torque: 0,
      isStatic: false,
      render: {}
    };
    const settings = Object.assign({}, defaults, options);

    let position = settings.position;
    let angle = settings.angle;
    let velocity = settings.velocity;
    let angularVelocity = settings.angularVelocity;
    let acceleration = new Vector(0, 0);
    let angularAcceleration = 0;
    let mass = (settings.isStatic) ? Infinity : settings.mass;
    let force = settings.force;
    let torque = settings.torque;
    let isStatic = settings.isStatic;

    Object.defineProperties(this, {

      // Public properties:
      "tag": {
        value: settings.tag,
        enumerable: true,
        writable: true
      }
      "render": {
        value: settings.render,
        writable: true
      },

      // Private properties:
      "position": {
        enumerable: true,
        get: () => new Vector(position.x, position.y),
        set: newPos => this.translate(Vector.difference(newPos, position))
      },
      "angle": {
        enumerable: true,
        get: () => angle,
        set: newAng => this.rotate(newAng - angle)
      },
      "velocity": {
        enumerable: true,
        get: () => velocity,
        set: newVelocity => velocity.set(newVelocity)
      },
      "angularVelocity": {
        enumerable: true,
        get: () => angularVelocity,
        set: newAngVel => angularVelocity = newAngVel
      }
      "acceleration": {
        enumerable: true,
        get: () => acceleration,
        set: newAcc => acceleration.set(newAcc)
      },
      "angularAcceleration": {
        enumerable: true,
        get: () => angularAcceleration,
        set: newAngAcc => angularAcceleration = newAngAcc
      },
      "mass": {
        enumerable: true,
        get: () => mass,
        set: newMass => {
          if (this.rotationalInertia) this.rotationalInertia *= newMass / mass;
          mass = newMass;
        }
      },
      "force": {
        enumerable: true,
        get: () => force,
        set: newForce => force.set(newForce)
      },
      "torque": {
        enumerable: true,
        get: () => torque,
        set: newTorque => torque = newTorque
      }
      "isStatic": {
        enumerable: true
        get: () => isStatic,
        set: newVal => {
          if (newVal) this.mass = Infinity
          isStatic = newVal;
        }
      },

      // Constant properties (unchanged by the user):
      "type": {
        value: 'body',
        configurable: true,
        enumerable: true
      },
      "rotationalInertia": {
        value: undefined,
        configurable: true,
        enumerable: true
      },
      "world": {
        value: undefined,
        configurable: true,
        enumerable: true
      },
    });

    this.translate = translation => position.add(translation);
    this.rotate = rotation => {
      angle += rotation;
      if (this.angle > Math.PI * 2) {
        this.angle %= Math.PI * 2;
      } else if (this.angle < 0) {
        this.angle = Math.PI * 2 + (this.angle % Math.PI * 2);
      }
    }
  }

  /**
   * @method applyForce
   * Applies a local force to the body
   * @param {Vector} force: the force vector to apply
   * @param {number} timeout: (optional) the time in seconds until the force is removed
   */
  applyForce(force, timeout = 0) {
    this.force.add(force);
    if (timeout) {
      const self = this;
      setTimeout(function() {self.applyForce(force.inverse);}, timeout * 1000);
    }
  }

  /**
   * @method applyTorque
   * Applies torque to the body
   * @param {number} force: force that creates a rotation
   * @param {number} radius: perpendicular distance from the force to the point of rotation
   * @param {number} timeout: (optional) the time in seconds until the torque is reset
   */
  applyTorque(force, radius, timeout = 0) {
    this.torque += force * radius;
    if (timeout) {
      const self = this;
      setTimeout(function() {self.applyTorque(-force, radius);}, timeout * 1000);
    }
  }

  /**
   * @method update
   * Updates the body's properties
   */
  update() {
    this.updateAcceleration();
    this.updateVelocity();
    this.updatePosition();
    this.updateAngularAcceleration();
    this.updateAngularVelocity();
    this.updateAngle();
  }

  /**
   * @method updatePosition
   * Updates the body's position
   */
  updatePosition() {
    this.translate(this.velocity);
  }

  /**
   * @method updateVelocity
   * Updates the body's velocity
   */
  updateVelocity() {
    this.velocity.add(this.acceleration);
  }

  /**
   * @method updateAcceleration
   * Updates the body's acceleration
   */
  updateAcceleration() {
    if (!this.isStatic) {
      this.acceleration = Vector.sum(
        this.world.gravity.multipliedBy(this.mass),
        this.world.force,
        this.force
      ).dividedBy(this.mass);
    }
  }

  /**
   * @method updateAngle
   * Updates the body's angular position
   */
  updateAngle() {
    this.rotate(this.angularVelocity);
  }

  /**
   * @method updateAngularVelocity
   * Updates the body's angular velocity
   */
  updateAngularVelocity() {
    this.angularVelocity += this.angularAcceleration;
  }

  /**
   * @method updateAngularAcceleration
   * Updates the body's angular acceleration
   */
  updateAngularAcceleration() {
    if (!this.isStatic) {
      this.angularAcceleration = this.torque / this.rotationalInertia;
    }
  }
}

// class Body {
//
//   /**
//    * @constructor
//    * @param {Vector} position: the body's initial position
//    * @param {Object} options: (optional) set any other local property and bypass the defaults
//    */
//   constructor(position, options) {
//     const defaults = {
//       tag: 'body',
//       velocity: new Vector(0, 0),
//       angle: 0,
//       angularVelocity: 0,
//       mass: 1,
//       force: new Vector(0, 0),
//       torque: 0,
//       isStatic: false,
//       render: {}
//     };
//     const settings = Object.assign({}, defaults, options);
//     Object.defineProperties(this, {
//       "type": {
//         value: 'body',
//         configurable: true,
//         enumerable: true
//       },
//       "tag": {
//         value: settings.tag,
//         configurable: true,
//         enumerable: true,
//         writable: true
//       },
//       "position": {
//         value: position,
//         configurable: true,
//         enumerable: true,
//         writable: true
//       },
//       "velocity": {
//         value: settings.velocity,
//         configurable: true,
//         enumerable: true,
//         writable: true
//       },
//       "acceleration": {
//         value: new Vector(0, 0),
//         configurable: true,
//         enumerable: true,
//         writable: true
//       },
//       "angle": {
//         value: settings.angle,
//         configurable: true,
//         enumerable: true,
//         writable: true
//       },
//       "angularVelocity": {
//         value: settings.angularVelocity,
//         configurable: true,
//         enumerable: true,
//         writable: true
//       },
//       "angularAcceleration": {
//         value: 0,
//         configurable: true,
//         enumerable: true,
//         writable: true
//       },
//       "mass": {
//         value: settings.mass,
//         configurable: true,
//         enumerable: true,
//         writable: true
//       },
//       "force": {
//         value: settings.force,
//         configurable: true,
//         enumerable: true,
//         writable: true
//       },
//       "torque": {
//         value: settings.torque,
//         configurable: true,
//         enumerable: true,
//         writable: true
//       },
//       "render": {
//         value: settings.render,
//         configurable: true,
//         enumerable: true,
//         writable: true
//       },
//       "isStatic": {
//         value: settings.isStatic,
//         configurable: true,
//         enumerable: true,
//         writable: true
//       },
//       "rotationalInertia": {
//         value: undefined,
//         configurable: true,
//         enumerable: true,
//         writable: true
//       },
//       "world": {
//         value: undefined,
//         configurable: true,
//         enumerable: true,
//         writable: true
//       },
//       "boundingBox": {
//         value: {},
//         configurable: true,
//         enumerable: true,
//         writable: true
//       }
//     });
//   }
//
//   /**
//    * @method applyForce
//    * Applies a local force to the body
//    * @param {Vector} force: the force vector to apply
//    * @param {number} timeout: (optional) the time in seconds until the force is removed
//    */
//   applyForce(force, timeout = 0) {
//     this.force.add(force);
//     if (timeout) {
//       const self = this;
//       setTimeout(function() {self.applyForce(force.inverse);}, timeout * 1000);
//     }
//   }
//
//   /**
//    * @method applyTorque
//    * Applies torque to the body
//    * @param {number} force: force that creates a rotation
//    * @param {number} radius: perpendicular distance from the force to the point of rotation
//    * @param {number} timeout: (optional) the time in seconds until the torque is reset
//    */
//   applyTorque(force, radius, timeout = 0) {
//     this.torque += force * radius;
//     if (timeout) {
//       let self = this;
//       setTimeout(function() {self.applyTorque(-force, radius);}, timeout * 1000);
//     }
//   }
//
//   /**
//    * @method update
//    * Updates the body's properties
//    */
//   update() {
//     this.updateAcceleration();
//     this.updateVelocity();
//     this.updatePosition();
//     this.updateAngularAcceleration();
//     this.updateAngularVelocity();
//     this.updateAngle();
//   }
//
//   /**
//    * @method updatePosition
//    * Updates the body's position
//    */
//   updatePosition() {
//     this.translate(this.velocity);
//   }
//
//   /**
//    * @method updateVelocity
//    * Updates the body's velocity
//    */
//   updateVelocity() {
//     this.velocity.add(this.acceleration);
//   }
//
//   /**
//    * @method updateAcceleration
//    * Updates the body's acceleration
//    */
//   updateAcceleration() {
//     if (!this.isStatic) {
//       let gravitationalForce = this.world.gravity.multipliedBy(this.mass);
//       let netForce = Vector.sum(gravitationalForce, this.world.force, this.force);
//       this.acceleration = netForce.dividedBy(this.mass);
//     }
//   }
//
//   /**
//    * @method updateAngle
//    * Updates the body's angular position
//    */
//   updateAngle() {
//     this.rotate(this.angularVelocity);
//   }
//
//   /**
//    * @method updateAngularVelocity
//    * Updates the body's angular velocity
//    */
//   updateAngularVelocity() {
//     this.angularVelocity += this.angularAcceleration;
//   }
//
//   /**
//    * @method updateAngularAcceleration
//    * Updates the body's angular acceleration
//    */
//   updateAngularAcceleration() {
//     if (!this.isStatic) {
//       this.angularAcceleration = this.torque / this.rotationalInertia;
//     }
//   }
//
//   /**
//    * @method setMass
//    * Sets the body's mass
//    * @param {number} mass
//    */
//   setMass(mass) {
//     if (this.rotationalInertia) this.rotationalInertia *= mass / this.mass;
//     this.mass = mass;
//   }
//
//   /**
//    * @method setPosition
//    * Sets the body's position
//    * @param {Vector} pos
//    */
//   setPosition(pos) {
//     this.position.set(pos);
//   }
//
//   /**
//    * @method translate
//    * Shifts the body's position by a given vector
//    * @param {Vector} translation: the vector to translate by
//    */
//   translate(translation) {
//     this.position.add(translation);
//   }
//
//   /**
//    * @method setAngle
//    * Sets the body's angle
//    * @param {number} angle
//    */
//   setAngle(angle) {
//     this.angle = angle;
//     if (this.angle > Math.PI * 2) {
//       this.angle %= Math.PI * 2;
//     } else if (this.angle < 0) {
//       this.angle = Math.PI * 2 + (this.angle % Math.PI * 2);
//     }
//   }
//
//   /**
//    * @method rotate
//    * Rotates the body by a given angle
//    * @param {number} angle
//    */
//   rotate(angle) {
//     this.angle += angle;
//     if (this.angle > Math.PI * 2) {
//       this.angle %= Math.PI * 2;
//     } else if (this.angle < 0) {
//       this.angle = Math.PI * 2 + (this.angle % Math.PI * 2);
//     }
//   }
// }
