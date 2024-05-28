var VSHADER_SOURCE = `
precision mediump float;
attribute vec2 a_UV;
attribute vec3 a_Normal;
attribute vec4 a_Position;

varying vec2 v_UV;
varying vec3 v_Normal;
varying vec4 v_VertPos;

uniform mat4 u_ModelMatrix;
uniform mat4 u_GlobalRotateMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;
uniform bool u_normalOn;
uniform mat4 u_NormalMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    if (u_normalOn) {
      v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1)));
    } else {
      v_Normal = a_Normal;
    }
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
precision mediump float;
varying vec2 v_UV;
varying vec3 v_Normal;
varying vec4 v_VertPos;

uniform vec3 u_lightpos;
uniform vec3 u_cameraPos;
uniform vec4 u_FragColor;
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
uniform sampler2D u_Sampler2;
uniform sampler2D u_Sampler3;
uniform sampler2D u_Sampler4;
uniform int u_whichTexture;
uniform bool u_lightOn;
uniform vec3 u_lightColor;

  void main() {
    if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal + 1.0)/2.0, 1.0);
    } else if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV,1.0,1.0);
    } else if (u_whichTexture == 0) { 
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if (u_whichTexture == 3) {
      gl_FragColor = texture2D(u_Sampler3, v_UV);
    } else if (u_whichTexture == 4) {
      gl_FragColor = vec4(0.41569, 0.55294, 0.45098, 1);
    } else if (u_whichTexture == 5) {
      gl_FragColor = texture2D(u_Sampler4, v_UV);
    } else {
      gl_FragColor = vec4(1,.2,.2,1);
    }

    vec3 lightVector = u_lightpos - vec3(v_VertPos);
    float r=length(lightVector);

    // N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N,L), 0.0);

    // Reflection
    vec3 R = reflect(L, N);

    // eye
    vec3 E = normalize(u_cameraPos-vec3(v_VertPos));

    // Specular
    float specular = pow(max(dot(E,R), 0.0),30.0);

    vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.3;

    if (u_lightOn) {
      if (u_whichTexture == 0) {
        gl_FragColor = vec4(diffuse+ambient, 1.0);
      } else {
        gl_FragColor = vec4(specular * u_lightColor + diffuse * u_lightColor + ambient, gl_FragColor.a);
      }
    }
    
   
  }`


// Global vars for setup
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_NormalMatrix

let a_UV;
let a_Normal;
let u_ViewMatrix;
let u_ProjectionMatrix;

let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_whichTexture;
let u_lightOn;
let u_lightpos;
let u_cameraPos;
let u_lightColor;
let u_normalOn;

// SETUP --------------------------------------------------------------------------
function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);

}

// Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return ([x, y]);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_lightpos = gl.getUniformLocation(gl.program, 'u_lightpos');
  if (!u_lightpos) {
    console.log('Failed to get the storage location of u_lightpos');
    return;
  }

  u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  if (!u_lightColor) {
    console.log('Failed to get the storage location of u_lightColor');
    return;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }

  u_normalOn = gl.getUniformLocation(gl.program, 'u_normalOn');
  if (!u_normalOn) {
    console.log('Failed to get the storage location of u_normalOn');
    return;
  }

  // Get the storage location of u_Modelmatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_Modelmatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix) {
    console.log('Failed to get the storage location of u_NormalMatrix');
    return;
  }


  // first of the 3 doesnt work grr
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get u_ProjectionMatrix');
    return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get u_whichTexture');
    return;
  }

  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get u_lightOn');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0'); //sky
  if (!u_Sampler0) {
    console.log('Failed to get u_Sampler0');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1'); //grass
  if (!u_Sampler1) {
    console.log('Failed to get u_Sampler1');
    return false;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get u_Sampler2');
    return false;
  }

  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
    console.log('Failed to get u_Sampler3');
    return false;
  }

  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  if (!u_Sampler4) {
    console.log('Failed to get u_Sampler4');
    return false;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

function initTextures() {
  var image = new Image();
  if (!image) {
    console.log('Failed to get image');
    return false;
  }
  image.onload = function () { sendImageToTEXTURE0(image); };
  image.crossOrigin = "anonymous";
  image.src = 'sky.png';

  var image1 = new Image();
  if (!image1) {
    console.log('Failed to get image1');
    return false;
  }
  image1.onload = function () { sendImageToTEXTURE1(image1); };
  //console.log('hi');
  image1.crossOrigin = "anonymous";
  image1.src = 'grass.jpg';

  var image2 = new Image();
  if (!image2) {
    console.log('Failed to get image2');
    return false;
  }
  image2.onload = function () { sendImageToTEXTURE2(image2); };
  //console.log('hi');
  image2.crossOrigin = "anonymous";
  image2.src = 'panda.png';

  var image3 = new Image();
  if (!image3) {
    console.log('Failed to get image3');
    return false;
  }
  image3.onload = function () { sendImageToTEXTURE3(image3); };
  //console.log('hi');
  image3.crossOrigin = "anonymous";
  image3.src = 'grass.jpg';

  var image4 = new Image();
  if (!image4) {
    console.log('Failed to get image4');
    return false;
  }
  image4.onload = function () { sendImageToTEXTURE4(image4); };
  //console.log('hi');
  image4.crossOrigin = "anonymous";
  image4.src = 'space.png';

  return true;
}

function sendImageToTEXTURE0(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to get texture0');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler0, 0);
  //console.log('finished load texture');
}

function sendImageToTEXTURE1(image1) {
  var texture = gl.createTexture();   // create a texture object
  if (!texture) {
    console.log('Failed to get texture1');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image1);
  gl.uniform1i(u_Sampler1, 1);
  //console.log('finished load texture');
}

function sendImageToTEXTURE2(image2) {
  var texture = gl.createTexture();   // create a texture object
  if (!texture) {
    console.log('Failed to get texture1');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image2);
  gl.uniform1i(u_Sampler2, 2);
  //console.log('finished load texture');
}

function sendImageToTEXTURE3(image3) {
  var texture = gl.createTexture();   // create a texture object
  if (!texture) {
    console.log('Failed to get texture1');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image3);
  gl.uniform1i(u_Sampler3, 3);
  //console.log('finished load texture');
}

function sendImageToTEXTURE4(image3) {
  var texture = gl.createTexture();   // create a texture object
  if (!texture) {
    console.log('Failed to get texture1');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE4);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image3);
  gl.uniform1i(u_Sampler4, 5);
  //console.log('finished load texture');
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const PIC = 3;

// Globals for UI
let g_AngleX = 0;
let g_camSlider = -180;
let g_AngleY = 0;

let g_frontLeft = 0;
let g_frontRight = 0;
let g_backLeft = 0;
let g_backRight = 0;
let g_base = 0;
let g_middle = 0;
let g_tip = 0;
let g_animate = false;
let shift_key = false;
let g_hat = 0;
var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;
var g_camera;
let g_lightpos = [0, 1, -2];
let g_lightOn = false;
let g_lightColor = [1.0, 1.0, 1.0];
let g_normalOn = false;
let g_aniLight = true;

function addActionForHtmlUI() {
  // Slider Events
  document.getElementById('angleSlide').addEventListener('mousemove', function () { g_camSlider = this.value; renderScene(); });
  document.getElementById('lightX').addEventListener('mousemove', function (ev) { if (ev.buttons == 1) { g_lightpos[0] = this.value / 100; renderScene(); } })
  document.getElementById('lightY').addEventListener('mousemove', function (ev) { if (ev.buttons == 1) { g_lightpos[1] = this.value / 100; renderScene(); } })
  document.getElementById('lightZ').addEventListener('mousemove', function (ev) { if (ev.buttons == 1) { g_lightpos[2] = this.value / 100; renderScene(); } })
  document.getElementById('bSlide').addEventListener('mousemove', function () { g_lightColor[2] = this.value / 10; });
  //document.getElementById('frontLeft').addEventListener('mousemove', function () { g_frontLeft = this.value; renderScene(); });
  //document.getElementById('frontRight').addEventListener('mousemove', function () { g_frontRight = this.value; renderScene(); });
  //document.getElementById('backLeft').addEventListener('mousemove', function () { g_backLeft = this.value; renderScene(); });
  //document.getElementById('backRight').addEventListener('mousemove', function () { g_backRight = this.value; renderScene(); });
  //document.getElementById('base').addEventListener('mousemove', function () { g_base = this.value; renderScene(); });
  //document.getElementById('middle').addEventListener('mousemove', function () { g_middle = this.value; renderScene(); });
  //document.getElementById('tip').addEventListener('mousemove', function () { g_tip = this.value; renderScene(); });

  // Buttons
  document.getElementById('normal_on').addEventListener('click', function () { g_normalOn = true; });
  document.getElementById('normal_off').addEventListener('click', function () { g_normalOn = false; });
  document.getElementById('light_on').addEventListener('click', function () { g_lightOn = true; });
  document.getElementById('light_off').addEventListener('click', function () { g_lightOn = false; });
  document.getElementById('Lon').addEventListener('click', function () { g_aniLight = true; });
  document.getElementById('Loff').addEventListener('click', function () { g_aniLight = false; });

}

// MAIN --------------------------------------------------------------------------
var xyCoord = [0, 0];
function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionForHtmlUI();
  canvas.onmousedown = click;
  //document.onwheel = scroll;
  canvas.onmousemove = function (ev) {
    if (ev.buttons == 1) {
      click(ev, 1)
    } else {
      if (xyCoord[0] != 0) {
        xyCoord = [0, 0];
      }
    }
  }
  g_camera = new Camera();
  document.onkeydown = keydown;
  initTextures();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  requestAnimationFrame(tick);
}

function scroll(ev) {
  if (ev.deltaY > 0) {
    g_camera.forward(1);
  } else {
    g_camera.back(1);
  }
}

function click(ev) {
  // make rotation on y and x axis
  let [x, y] = convertCoordinatesEventToGL(ev);
  if (xyCoord[0] == 0) {
    xyCoord = [x, y];
  }
  g_AngleX += xyCoord[0] - x;
  g_AngleY += xyCoord[1] - y;
  if (Math.abs(g_AngleX / 360) > 1) {
    g_AngleX = 0;
  }
  if (Math.abs(g_AngleY / 360) > 1) {
    g_AngleY = 0;
  }
}

// TICK --------------------------------------------------------------------------
let time = 0;
function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  updateAnimationAngles();
  renderScene();
  requestAnimationFrame(tick);
}

// UPDATE ANIMATION ANGLES -------------------------------------------------------
function updateAnimationAngles() {
  if (g_animate) {
    //legs
    g_frontLeft = (25 * Math.sin(g_seconds));
    g_frontRight = (25 * Math.sin(g_seconds));
    g_backLeft = (10 * Math.sin(g_seconds));
    g_backRight = (10 * Math.sin(g_seconds));
    //tail
    g_base = (10 * Math.sin(g_seconds));
    // g_middle = (5 * Math.sin(g_seconds));
    //g_tip = (25 * Math.sin(g_seconds));
  }
  if (g_aniLight){
    g_lightpos = [2 * Math.cos(-1 * g_seconds), 1.2, 2 * Math.sin(-1 * g_seconds)];
  }

}

// KEYDOWN --------------------------------------

function keydown(ev) {
  if (ev.keyCode == 68) { //d
    g_camera.eye.elements[0] += 0.2;
  } else if (ev.keyCode == 65) { // a
    g_camera.eye.elements[0] -= 0.2;
  } else if (ev.keyCode == 87) { //w
    g_camera.forward();
  } else if (ev.keyCode == 83) {
    g_camera.back();
  } else if (ev.keyCode == 81) {
    g_camera.panLeft();
  } else if (ev.keyCode == 69) {
    g_camera.panRight();
  }
  renderScene();
  //console.log(ev.keyCode);
}



// DRAWING CUBES ------------------------------------------------
var g_map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 2, 0, 0, 2, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 3, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 2, 0, 0, 2, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

function drawMap() {
  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {
      if (g_map[x][y] == 1) {
        var body = new Cube();
        if (g_normalOn) {
          body.textureNum = -3;
        } else {
          body.textureNum = 1;
        }
        body.matrix.translate(x - 4, -.75, y - 4);
        body.normalMatrix.setInverseOf(body.matrix).transpose();
        body.renderfaster();
      } else if (g_map[x][y] == 2) {
        var body = new Cube();
        if (g_normalOn) {
          body.textureNum = -3;
        } else {
          body.textureNum = 3;
        }
        body.matrix.translate(x - 3.5, -.9, y - 4);
        body.normalMatrix.setInverseOf(body.matrix).transpose();
        body.render();
      } else if (g_map[x][y] == 3) {
        var body = new Cube();
        if (g_normalOn) {
          body.textureNum = -3;
        } else {
          body.textureNum = 2;
        }
        body.matrix.translate(x - 3.5, -.3, y - 4);
        body.normalMatrix.setInverseOf(body.matrix).transpose();
        body.render();
      }
    }
  }
}

// RENDER --------------------------------------------------------------------------
var g_eye = [0, 0, 3];
var g_at = [0, 0, -100];
var g_up = [0, 1, 0];

function renderScene() {
  var startTime = performance.now();

  var projMat = new Matrix4();
  projMat.setPerspective(50, canvas.width / canvas.height, .1, 1000);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Pass the view matrix
  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
    g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);


  var globalRotMat = new Matrix4().rotate(g_AngleX, 0, -1, 0);
  globalRotMat.rotate(g_camSlider, 0, 1, 0);
  globalRotMat.rotate(g_AngleY, -1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);


  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.uniform3f(u_lightpos, g_lightpos[0], g_lightpos[1], g_lightpos[2]);
  gl.uniform3f(u_lightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);
  gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
  gl.uniform1i(u_lightOn, g_lightOn);
  gl.uniform1i(u_normalOn, g_normalOn);


  var lightS = new Cube();
  lightS.color = [g_lightColor[0], g_lightColor[1], g_lightColor[2], 1.0];
  lightS.matrix.translate(g_lightpos[0], g_lightpos[1], g_lightpos[2]);
  lightS.matrix.scale(-0.1, -0.1, -0.1);
  lightS.matrix.translate(-0.5, -.5, -.5);
  lightS.render();

  var light = [0.95294, 0.88627, 0.92549, 1.0];
  var taupe = [0.51765, 0.49412, 0.53725, 1.0];
  var darkLiver = [0.33725, 0.28627, 0.29804, 1.0];


  // floor
  var floor = new Cube();
  //floor.color = [1, 0, 0, 1];
  if (g_normalOn) {
    floor.textureNum = -3;
  } else {
    floor.textureNum = 4;
  }
  floor.matrix.translate(0, -.235, 0);
  floor.matrix.scale(10, 0, 10);
  floor.matrix.translate(-.5, 0, -.5);
  floor.normalMatrix.setInverseOf(floor.matrix).transpose();
  floor.render();

  // sky
  var sky = new Cube();
  sky.color = [1, 0, 0, 1];
  if (g_normalOn) {
    sky.textureNum = -3;
  } else {
    sky.textureNum = 0;
  }
  sky.matrix.scale(-11, -11, -11);
  sky.matrix.translate(-.5, -.5, -.5);
  sky.normalMatrix.setInverseOf(sky.matrix).transpose();
  sky.render();

  // sphere
  var sphere = new Sphere();
  sphere.matrix.translate(-0.75, 0.75, -.3);
  sphere.matrix.scale(.5, .5, .5);
  //sphere.matrix.translate(-.5, 0, -.5);
  if (g_normalOn) {
    sphere.textureNum = -3;
  } else {
    sphere.textureNum = 1;
  }
  sphere.normalMatrix.setInverseOf(sphere.matrix).transpose();
  sphere.render();

  drawMap();

  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration) / 10, "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}