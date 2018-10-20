/**
 * @class Renderer
 * The renderer for the program.
 * Uses HTML5 Canvas.
 * To use this renderer, you must create a canvas in your html file, and pass its ID when instantiating this class.
 *
 * Properties:
 * @property canvas: the canvas reference
 * @property context: the reference to canvas' 2D context
 *
 * Methods:
 * @method canvasSetup(): sets up canvas
 * @method renderEngine(): renders every world within an engine
 * @method renderWorld(): renders every body within a world
 * @method renderBody(): renders a body
 * @method circlePath(): defines the path for a circle body
 * @method polygonPath(): defines the path for a polygon body
 */
class Renderer {

  /**
   * @constructor
   * @param {String} canvasID: the ID assigned to canvas in the html file
   */
  constructor(canvasID) {
    this.canvasSetup(canvasID);
  }

  /**
   * @method canvasSetup
   * Sets up canvas and its 2D context
   * @param {String} canvasID
   */
  canvasSetup(canvasID) {
    this.canvas = document.getElementById(canvasID);
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.context = this.canvas.getContext("2d");

    window.addEventListener('resize', function() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    });
  }

  /**
   * @method renderEngine
   * Renders every world within an engine
   * @param {Engine} engine: the engine to render
   */
  renderEngine(engine) {
    for (let world of engine.worlds) {
      this.renderWorld(world);
    }
  }

  /**
   * @method renderWorld
   * Renders every body within a world
   * @param {World} world
   */
  renderWorld(world) {
    for (let b of world.bodies) this.renderBody(b);
  }

  /**
   * @method renderBody
   * Renders a single body
   * @param {Body} body
   */
  renderBody(body) {

    // assigns the default rendering options
    let renderSettings = {
      border: true,
      fill: false,
      borderColor: 'black',
      fillColor: 'black',
      borderWidth: 1,
      visible: true
    };

    // allows the body's render property to override the defaults
    Object.assign(renderSettings, body.render);

    if (!renderSettings.visible) return;

    // sets up the render settings in the context
    this.context.fillStyle = renderSettings.fillColor;
    this.context.strokeStyle = renderSettings.borderColor;
    this.context.lineWidth = renderSettings.borderWidth;
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';

    // defines the path for the body's border
    this.context.beginPath();
    if (body instanceof Circle) this.circlePath(body);
    else if (body instanceof Polygon) this.polygonPath(body);

    // renders the body on the screen
    if (renderSettings.border) this.context.stroke();
    if (renderSettings.fill) this.context.fill();
  }

  /**
   * @method circlePath
   * Defines the path for a circle body
   * @param {Circle} circle
   */
  circlePath(circle) {
    this.context.arc(circle.position.x, circle.position.y, circle.radius, 0, Math.PI * 2);
  }

  /**
   * @method polygonPath
   * Defines the path for a polygon body
   * @param {Polygon} polygon
   */
  polygonPath(polygon) {
    const c = this.context;
    const vertices = polygon.vertices.slice();
    vertices.push(polygon.vertices[0]);

    // specifies a line from each vertex to the next in order
    vertices.forEach((v, i) => {
      if (i === 0) c.moveTo(v.x, v.y);
      else c.lineTo(v.x, v.y);
    });
  }
}
