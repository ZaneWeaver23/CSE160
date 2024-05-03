// ColoredPoint.js (c) 2012 matsuda

// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV,1.0,1.0);
    } else if (u_whichTexture == 0) { 
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else {
      gl_FragColor = vec4(1, .2, .2, 1);
    }
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_whichTexture;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preservedDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
    }
  
    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return;
    }

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
      console.log('Failed to get the storage location of a_UV');
      return;
    }
  
    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
      console.log('Failed to get the storage location of u_FragColor');
      return;
    }

    // Get the storage of u_Size

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
      console.log('Failed to get the storage location of u_ModelMatrix');
      return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
      console.log('Failed to get the storage location of u_GlobalRotateMatrix');
      return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
      console.log('Failed to get the storage location of u_ViewMatrix');
      return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
      console.log('Failed to get the storage location of u_ProjectionMatrix');
      return;
    }

    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
      console.log('Failed to get the storage location of u_Sampler0');
      return false;
    }

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
      console.log('Failed to get the storage location of u_whichTexture');
      return false;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global Variables for UI Elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_globalAngle = 0;
let g_nose = 0;
let g_rightnose = 0;
let g_noseAnimation = false;
let g_noseAngle = 40;

// Set up actions for the HTML UI Elements
function addActionsForHtmlUI() {

  // Button Events
  document.getElementById('angleSlide').addEventListener('input', function() {g_globalAngle = this.value;});
  document.getElementById('animationOnButton').onclick = function() {g_noseAnimation = true;};
  document.getElementById('animationOffButton').onclick = function() {g_noseAnimation = false;};

  // Key Events
  // document.addEventListener("keydown", handleKeyDown);
  document.getElementById('rotateSlidex').addEventListener('input', function() {g_nose = this.value;});
  document.getElementById('rotateSlidey').addEventListener('input', function() {g_rightnose = this.value;});
}

function main() {

  // Sets up canvas and gl variables
  setupWebGL();

  // Sets up GLSL shader programs and connects GLSL variables
  connectVariablesToGLSL();

  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  // canvas.onmousedown = click;
  // canvas.onmousemove = function(ev) {if(ev.buttons == 1) { click(ev)}};
  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.75, 1.0, 1.0);

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);
  renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;

  updateAnimationAngles();

  renderAllShapes();

  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_noseAnimation) {
    g_noseAngle = (40*Math.sin(g_seconds));
  } else {
    g_noseAngle = (g_nose);
  }
}

var g_shapesList = [];

function click(ev) {

  let [x, y] = convertCoordinatesEventToGL(ev);

  // Create and store the new point
  let point;
  if (g_selectedType==POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_selectedSegments;
  }
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  // Clear <canvas>
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x, y]);
}

function initTextures() {

  var image = new Image();  // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function(){ sendTextureToGLSL(image); };
  // Tell the browser to load an image
  image.src = 'sky.jpg';

  return true;
}

function sendTextureToGLSL(image) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);
  
  //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}

function renderAllShapes() {

  var startTime = performance.now();

  var projMat = new Matrix4();
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
  g_shapesList[i].render();
  }

  var box = new Cube();
  box.color = [.5, 0.3, 0.0, 1.0];
  box.textureNum = -2;
  box.matrix.translate(.3, .3, .3);
  box.matrix.scale(.5, .5, .5)
  box.render();

  var body = new Cube();
  body.color = [.5, 0.3, 0.0, 1.0];
  body.textureNum = 0;
  body.matrix.translate(-.25, -.75, 0.0);
  body.matrix.rotate(-60, 1, 0, 0);
  body.matrix.scale(0.5, .3, 0.8);
  body.render();

  var neck = new Cube();
  neck.color = [.5, 0.3, 0.0, 1.0];
  neck.matrix.translate(-0.125, -.1, .3);
  neck.matrix.rotate(-60, 1, 0, 0);
  neck.matrix.scale(0.25, .15, 0.25);
  neck.render();

  var head = new Cube();
  head.color = [.5, 0.3, 0.0, 1.0];
  head.matrix.translate(-.2, 0.1, .45);
  head.matrix.rotate(-75, 1, 0, 0);
  head.matrix.scale(0.4, .25, 0.4);
  head.render();

  var hat = new Prism();
  hat.color = [0.0, 1.0, 0.0, 1.0];
  hat.matrix.translate(-.125, 0.5, .5);
  hat.matrix.rotate(-75, 1, 0, 0);
  hat.matrix.scale(0.25, .25, 0.4);
  hat.render();

  var head2 = new Cube();
  head2.color = [.5, 0.3, 0.0, 1.0];
  head2.matrix.translate(-.25, 0.17, .41);
  head2.matrix.rotate(-75, 1, 0, 0);
  head2.matrix.scale(0.5, .15, 0.3);
  head2.render();

  var head3 = new Cube();
  head3.color = [.5, 0.3, 0.0, 1.0];
  head3.matrix.translate(-.15, 0.05, .38);
  head3.matrix.rotate(-75, 1, 0, 0);
  head3.matrix.scale(0.3, .15, 0.5);
  head3.render();

  var head4 = new Cube();
  head4.color = [.5, 0.3, 0.0, 1.0];
  head4.matrix.translate(-.15, 0.135, .465);
  head4.matrix.rotate(-75, 1, 0, 0);
  head4.matrix.scale(0.3, .275, 0.3);
  head4.render();

  var nose1 = new Cube();
  nose1.color = [0.0, 0.0, 0.0, 1.0];
  nose1.matrix.translate(-0.02, 0.325, .26);
  nose1.matrix.rotate(-75, 1, 0, 0);
  nose1.matrix.scale(0.05, .05, 0.05);
  nose1.render();

  var nose2 = new Cube();
  nose2.color = [0.0, 0.0, 0.0, 1.0];
  nose2.matrix.translate(-.1, 0.275, .25);
  nose2.matrix.rotate(-75, 1, 0, 0);
  nose2.matrix.scale(0.2, .035, 0.015);
  nose2.render();

  var nose3 = new Cube();
  nose3.color = [0.0, 0.0, 0.0, 1.0];
  nose3.matrix.translate(-0.001, 0.275, .26);
  nose3.matrix.rotate(-75, 1, 0, 0);
  nose3.matrix.scale(0.015, .05, 0.05);
  nose3.render();

  var nose4 = new Cube();
  nose4.color = [0.0, 0.0, 0.0, 1.0];
  nose4.matrix.translate(0.09, 0.285, .26);
  nose4.matrix.rotate(285, 1, 0, 0);
  nose4.matrix.rotate(50, 0, 1, 0);
  nose4.matrix.rotate(g_noseAngle, 0, 1, 0);
  nose4.matrix.scale(0.015, .05, 0.05);
  nose4.render();

  var nose5 = new Cube();
  nose5.color = [0.0, 0.0, 0.0, 1.0];
  nose5.matrix.translate(-0.1, 0.27, .26);
  nose5.matrix.rotate(285, 1, 0, 0);
  nose5.matrix.rotate(310, 0, 1, 0);
  nose5.matrix.rotate(g_noseAngle * -1, 0, 1, 0);
  nose5.matrix.scale(0.015, .05, 0.05);
  nose5.render();

  var Larm1 = new Cube();
  Larm1.color = [.5, 0.3, 0.0, 1.0];
  Larm1.matrix.setTranslate(-.3, -.15, 0.2);
  Larm1.matrix.rotate(-110, 1, 1, 0);
  Larm1.matrix.scale(0.12, .12, 0.2);
  Larm1.render();

  var Larm2 = new Cube();
  Larm2.color = [.5, 0.3, 0.0, 1.0];
  Larm2.matrix.setTranslate(-.425, -0.025, 0.15);
  Larm2.matrix.rotate(200, 1, 1, 0);
  Larm2.matrix.scale(0.12, .12, 0.2);
  Larm2.render();

  var Larm3 = new Cube();
  Larm3.color = [.5, 0.3, 0.0, 1.0];
  Larm3.matrix.setTranslate(-.475, -.0, 0.05);
  Larm3.matrix.rotate(200, 1, 1, 0);
  Larm3.matrix.scale(0.15, .15, 0.1);
  Larm3.render();

  var Larm4 = new Cube();
  Larm4.color = [.5, 0.3, 0.0, 1.0];
  Larm4.matrix.setTranslate(-.46, .075, 0.05);
  Larm4.matrix.rotate(200, 1, 1, 0);
  Larm4.matrix.scale(0.12, .12, 0.08);
  Larm4.render();

  var Larmpaw1 = new Cube();
  Larmpaw1.color = [0.0, 0.0, 0.0, 1.0];
  Larmpaw1.matrix.setTranslate(-.45, .03, -0.005);
  Larmpaw1.matrix.rotate(200, 1, 1, 0);
  Larmpaw1.matrix.scale(0.08, .08, 0.075);
  Larmpaw1.render();

  var Larmpaw2 = new Cube();
  Larmpaw2.color = [0.0, 0.0, 0.0, 1.0];
  Larmpaw2.matrix.setTranslate(-.46, .125, 0.025);
  Larmpaw2.matrix.rotate(200, 1, 1, 0);
  Larmpaw2.matrix.scale(0.02, .02, 0.075);
  Larmpaw2.render();

  var Larmpaw3 = new Cube();
  Larmpaw3.color = [0.0, 0.0, 0.0, 1.0];
  Larmpaw3.matrix.setTranslate(-.42, .15, 0.025);
  Larmpaw3.matrix.rotate(200, 1, 1, 0);
  Larmpaw3.matrix.scale(0.02, .02, 0.075);
  Larmpaw3.render();

  var Larmpaw4 = new Cube();
  Larmpaw4.color = [0.0, 0.0, 0.0, 1.0];
  Larmpaw4.matrix.setTranslate(-.375, .125, 0.025);
  Larmpaw4.matrix.rotate(200, 1, 1, 0);
  Larmpaw4.matrix.scale(0.02, .02, 0.075);
  Larmpaw4.render();

  var Rarm1 = new Cube();
  Rarm1.color = [.5, 0.3, 0.0, 1.0];
  Rarm1.matrix.setTranslate(.2, -.1, 0.1);
  Rarm1.matrix.rotate(180, 1, 1, 1);
  Rarm1.matrix.scale(0.12, .12, 0.2);
  Rarm1.render();

  var Rarm2 = new Cube();
  Rarm2.color = [.5, 0.3, 0.0, 1.0];
  Rarm2.matrix.setTranslate(.275, -.02, 0.125);
  Rarm2.matrix.rotate(200, 1, 1, 0);
  Rarm2.matrix.rotate(330, 1, 0, 0);
  Rarm2.matrix.scale(0.12, .12, 0.2);
  Rarm2.render();

  var Rarm3 = new Cube();
  Rarm3.color = [.5, 0.3, 0.0, 1.0];
  Rarm3.matrix.setTranslate(.32, .02, -0.05);
  Rarm3.matrix.rotate(200, 1, 1, 0);
  Rarm3.matrix.rotate(330, 1, 0, 0);
  Rarm3.matrix.scale(0.15, .15, 0.1);
  Rarm3.render();

  var Rarm4 = new Cube();
  Rarm4.color = [.5, 0.3, 0.0, 1.0];
  Rarm4.matrix.setTranslate(.34, .1, -0.05);
  Rarm4.matrix.rotate(200, 1, 1, 0);
  Rarm4.matrix.rotate(330, 1, 0, 0);
  Rarm4.matrix.scale(0.12, .12, 0.08);
  Rarm4.render();

  var Rarmpaw1 = new Cube();
  Rarmpaw1.color = [0.0, 0.0, 0.0, 1.0];
  Rarmpaw1.matrix.setTranslate(.3675, .05, -0.07);
  Rarmpaw1.matrix.rotate(200, 1, 1, 0);
  Rarmpaw1.matrix.rotate(330, 1, 0, 0);
  Rarmpaw1.matrix.scale(0.08, .08, 0.075);
  Rarmpaw1.render();

  var Rarmpaw2 = new Cube();
  Rarmpaw2.color = [0.0, 0.0, 0.0, 1.0];
  Rarmpaw2.matrix.setTranslate(.355, .15, -0.04);
  Rarmpaw2.matrix.rotate(200, 1, 1, 0);
  Rarmpaw2.matrix.rotate(330, 1, 0, 0);
  Rarmpaw2.matrix.scale(0.02, .02, 0.075);
  Rarmpaw2.render();

  var Rarmpaw3 = new Cube();
  Rarmpaw3.color = [0.0, 0.0, 0.0, 1.0];
  Rarmpaw3.matrix.setTranslate(.44, .14, -0.03);
  Rarmpaw3.matrix.rotate(200, 1, 1, 0);
  Rarmpaw3.matrix.rotate(330, 1, 0, 0);
  Rarmpaw3.matrix.scale(0.02, .02, 0.075);
  Rarmpaw3.render();

  var Rarmpaw4 = new Cube();
  Rarmpaw4.color = [0.0, 0.0, 0.0, 1.0];
  Rarmpaw4.matrix.setTranslate(.4, .17, -0.03);
  Rarmpaw4.matrix.rotate(200, 1, 1, 0);
  Rarmpaw4.matrix.rotate(330, 1, 0, 0);
  Rarmpaw4.matrix.scale(0.02, .02, 0.075);
  Rarmpaw4.render();

  var tumTum = new Cube();
  tumTum.color = [.8, 0.8, 0.6, 1.0];
  tumTum.matrix.translate(-.15, -.55, -0.05);
  tumTum.matrix.rotate(-60, 1, 0, 0);
  tumTum.matrix.scale(0.3, .2, 0.5);
  tumTum.render();

  var eyeL1 = new Cube();
  eyeL1.color = [1.0, 1.0, 1.0, 1.0];
  eyeL1.matrix.translate(-.125, 0.4, .3);
  eyeL1.matrix.rotate(-75, 1, 0, 0);
  eyeL1.matrix.scale(0.05, 0.05, 0.05);
  eyeL1.render();

  var eyeL2 = new Cube();
  eyeL2.color = [0.0, 0.0, 0.0, 1.0];
  eyeL2.matrix.translate(-.11, 0.41, .26);
  eyeL2.matrix.rotate(-75, 1, 0, 0);
  eyeL2.matrix.scale(0.02, 0.02, 0.02);
  eyeL2.render();

  var eyeR1 = new Cube();
  eyeR1.color = [1.0, 1.0, 1.0, 1.0];
  eyeR1.matrix.translate(.075, 0.4, .3);
  eyeR1.matrix.rotate(-75, 1, 0, 0);
  eyeR1.matrix.scale(0.05, 0.05, 0.05);
  eyeR1.render();

  var eyeR2 = new Cube();
  eyeR2.color = [0.0, 0.0, 0.0, 1.0];
  eyeR2.matrix.translate(.0875, 0.41, .26);
  eyeR2.matrix.rotate(-75, 1, 0, 0);
  eyeR2.matrix.scale(0.02, 0.02, 0.02);
  eyeR2.render();

  var Lleg1 = new Cube();
  Lleg1.color = [.5, 0.3, 0.0, 1.0];
  Lleg1.matrix.setTranslate(-.3, -.7, -0.1);
  Lleg1.matrix.rotate(200, 1, 1, 0);
  Lleg1.matrix.scale(0.12, .12, 0.3);
  Lleg1.render();

  var Lleg2 = new Cube();
  Lleg2.color = [.5, 0.3, 0.0, 1.0];
  Lleg2.matrix.setTranslate(-.375, -.65, -0.35);
  Lleg2.matrix.rotate(200, 1, 1, 0);
  Lleg2.matrix.scale(0.15, .15, 0.1);
  Lleg2.render();

  var Llegpaw1 = new Cube();
  Llegpaw1.color = [0.0, 0.0, 0.0, 1.0];
  Llegpaw1.matrix.setTranslate(-.35, -.625, -0.4);
  Llegpaw1.matrix.rotate(200, 1, 1, 0);
  Llegpaw1.matrix.scale(0.08, .08, 0.075);
  Llegpaw1.render();

  var Rlegpaw2 = new Cube();
  Rlegpaw2.color = [0.0, 0.0, 0.0, 1.0];
  Rlegpaw2.matrix.setTranslate(-.355, -.53, -0.36);
  Rlegpaw2.matrix.rotate(200, 1, 1, 0);
  Rlegpaw2.matrix.scale(0.02, .02, 0.075);
  Rlegpaw2.render();

  var Rlegpaw3 = new Cube();
  Rlegpaw3.color = [0.0, 0.0, 0.0, 1.0];
  Rlegpaw3.matrix.setTranslate(-.31, -.53, -0.38);
  Rlegpaw3.matrix.rotate(200, 1, 1, 0);
  Rlegpaw3.matrix.rotate(330, 1, 0, 0);
  Rlegpaw3.matrix.scale(0.02, .02, 0.075);
  Rlegpaw3.render();

  var Rlegpaw4 = new Cube();
  Rlegpaw4.color = [0.0, 0.0, 0.0, 1.0];
  Rlegpaw4.matrix.setTranslate(-.35, -.495, -0.37);
  Rlegpaw4.matrix.rotate(200, 1, 1, 0);
  Rlegpaw4.matrix.rotate(330, 1, 0, 0);
  Rlegpaw4.matrix.scale(0.02, .02, 0.075);
  Rlegpaw4.render();

  var Lleg3 = new Cube();
  Lleg3.color = [.5, 0.3, 0.0, 1.0];
  Lleg3.matrix.setTranslate(-.365, -.575, -0.35);
  Lleg3.matrix.rotate(200, 1, 1, 0);
  Lleg3.matrix.scale(0.12, .12, 0.08);
  Lleg3.render();

  var Rleg1 = new Cube();
  Rleg1.color = [.5, 0.3, 0.0, 1.0];
  Rleg1.matrix.setTranslate(.175, -.7, -0.1);
  Rleg1.matrix.rotate(200, 1, 1, 0);
  Rleg1.matrix.rotate(330, 1, 0, 0);
  Rleg1.matrix.scale(0.12, .12, 0.3);
  Rleg1.render();

  var Rleg2 = new Cube();
  Rleg2.color = [.5, 0.3, 0.0, 1.0];
  Rleg2.matrix.setTranslate(.225, -.65, -0.35);
  Rleg2.matrix.rotate(200, 1, 1, 0);
  Rleg2.matrix.rotate(330, 1, 0, 0);
  Rleg2.matrix.scale(0.15, .15, 0.1);
  Rleg2.render();

  var Rlegpaw1 = new Cube();
  Rlegpaw1.color = [0.0, 0.0, 0.0, 1.0];
  Rlegpaw1.matrix.setTranslate(.27, -.625, -0.375);
  Rlegpaw1.matrix.rotate(200, 1, 1, 0);
  Rlegpaw1.matrix.rotate(330, 1, 0, 0);
  Rlegpaw1.matrix.scale(0.08, .08, 0.075);
  Rlegpaw1.render();

  var Rlegpaw2 = new Cube();
  Rlegpaw2.color = [0.0, 0.0, 0.0, 1.0];
  Rlegpaw2.matrix.setTranslate(.265, -.525, -0.34);
  Rlegpaw2.matrix.rotate(200, 1, 1, 0);
  Rlegpaw2.matrix.rotate(330, 1, 0, 0);
  Rlegpaw2.matrix.scale(0.02, .02, 0.075);
  Rlegpaw2.render();

  var Rlegpaw3 = new Cube();
  Rlegpaw3.color = [0.0, 0.0, 0.0, 1.0];
  Rlegpaw3.matrix.setTranslate(.34, -.535, -0.32);
  Rlegpaw3.matrix.rotate(200, 1, 1, 0);
  Rlegpaw3.matrix.rotate(330, 1, 0, 0);
  Rlegpaw3.matrix.scale(0.02, .02, 0.075);
  Rlegpaw3.render();

  var Rlegpaw4 = new Cube();
  Rlegpaw4.color = [0.0, 0.0, 0.0, 1.0];
  Rlegpaw4.matrix.setTranslate(.305, -.5, -0.325);
  Rlegpaw4.matrix.rotate(200, 1, 1, 0);
  Rlegpaw4.matrix.rotate(330, 1, 0, 0);
  Rlegpaw4.matrix.scale(0.02, .02, 0.075);
  Rlegpaw4.render();

  var Rleg3 = new Cube();
  Rleg3.color = [.5, 0.3, 0.0, 1.0];
  Rleg3.matrix.setTranslate(.25, -.575, -0.35);
  Rleg3.matrix.rotate(200, 1, 1, 0);
  Rleg3.matrix.rotate(330, 1, 0, 0);
  Rleg3.matrix.scale(0.12, .12, 0.08);
  Rleg3.render();

  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + "ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}
