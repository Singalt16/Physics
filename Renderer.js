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
   * @param {HTMLElement} canvas: a canvas DOM element
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.context = this.canvas.getContext("2d");
  }

  /**
   * @method renderEngine
   * Renders every world within an engine
   * @param {Engine} engine: the engine to render
   */
  renderEngine(engine) {
    engine.worlds.forEach(w => this.renderWorld(w));
  }

  /**
   * @method renderWorld
   * Renders every body within a world
   * @param {World} world
   */
  renderWorld(world) {
    world.bodies.forEach(b => this.renderBody(b));
  }

  /**
   * @method renderBody
   * Renders a single body
   * @param {Body} body
   */
  renderBody(body) {

    // assigns the default rendering options
    let renderProps = {
      border: true,
      fill: false,
      borderColor: 'black',
      fillColor: 'black',
      borderWidth: 1,
      visible: true
    };

    // allows the body's render property to override the defaults
    Object.assign(renderProps, body.render);

    if (!renderProps.visible) return;

    // sets up the render settings in the context
    this.context.fillStyle = renderProps.fillColor;
    this.context.strokeStyle = renderProps.borderColor;
    this.context.lineWidth = renderProps.borderWidth;
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';

    // defines the path for the body's border
    this.context.beginPath();
    if (body instanceof Circle) this.circlePath(body);
    else if (body instanceof Polygon) this.polygonPath(body);

    // renders the body on the screen
    if (renderProps.border) this.context.stroke();
    if (renderProps.fill) this.context.fill();
  }

  /**
   * @method clearAll
   * Clears the canvas
   */
  clearAll() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
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

    // specifies a line from each vertex to the next in order
    polygon.vertices.concat(polygon.vertices[0]).forEach((v, i) => {
      if (i === 0) this.context.moveTo(v.x, v.y);
      else this.context.lineTo(v.x, v.y);
    });
  }
}
