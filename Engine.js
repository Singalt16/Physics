/**
 * @class Engine
 * Manages the updates of its worlds.
 * This is the topmost level container in the program.
 *
 * Properties:
 * @property {World[]} worlds: the worlds controlled by the engine
 * @property {number} startTime: the time at which run() was called
 * @property {boolean} go: specifies whether or not to update the engine
 *
 * Methods:
 * @method create(): returns the engine object
 * @method update(): updates the state of the engine and its components
 * @method addWorld(): adds a world to the engine
 * @method run(): runs the engine
 * @method pause(): pauses the engine
 * @method timeElapsed(): (getter) returns the time elapsed since the engine was run
 */
class Engine {

  /**
   * @constructor
   */
  constructor() {
    this.worlds = [];
    this.startTime = undefined;
    this.go = false;
  }

  /**
   * @method addWorld
   * @param {World} world: the world to add to the engine
   */
  addWorld(world) {
    this.worlds.push(world);
  }

  /**
   * @method update
   * Updates the worlds inside of the engine
   */
  update() {
    this.worlds.forEach(w => w.update());
    if (this.go) {
      let self = this;
      requestAnimationFrame(function() {
        self.update();
      });
    }
  }

  /**
   * @method run
   * Starts/resumes the engine
   */
  run() {
    this.go = true;
    if (!this.startTime) {
      this.startTime = new Date();
    }
    this.update();
  }

  /**
   * @method pause
   * Pauses the engine
   */
  pause() {
    this.go = false;
  }

  /**
   * @method timeElapsed
   * Returns the time elapsed since the engine begin running in seconds
   * @returns {number}
   */
  get timeElapsed() {
    let currentTime = new Date();
    return (currentTime - this.startTime) / 1000;
  }
}
