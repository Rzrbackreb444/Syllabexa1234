/**
 * Canvas OffscreenRendering for high-resolution PDF/X Raster & CMYK Previews
 * Leverages WebGL2 texture mapping for hardware-accelerated color rendering.
 */

export async function renderGpuCmykPreview(
  canvasElement: HTMLCanvasElement, 
  imageBitmap: ImageBitmap
): Promise<void> {
  const gl = canvasElement.getContext('webgl2', { alpha: false, preserveDrawingBuffer: true });
  
  if (!gl) {
    console.warn('WebGL2 not supported, falling back to 2D context rendering.');
    const ctx = canvasElement.getContext('2d');
    if (ctx) {
      ctx.drawImage(imageBitmap, 0, 0, canvasElement.width, canvasElement.height);
    }
    return;
  }

  // Set up WebGL viewports
  gl.viewport(0, 0, canvasElement.width, canvasElement.height);

  // Vertex Shader
  const vsSource = `#version 300 es
    in vec2 a_position;
    in vec2 a_texCoord;
    out vec2 v_texCoord;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y);
    }
  `;

  // Fragment Shader (Simulates SWOP/GRACoL CMYK Proofing Channel Mapping)
  const fsSource = `#version 300 es
    precision mediump float;
    uniform sampler2D u_image;
    in vec2 v_texCoord;
    out vec4 outColor;
    void main() {
      vec4 rgb = texture(u_image, v_texCoord);
      // Fast CMYK Proof Approximation (UCR/GCR)
      float k = 1.0 - max(max(rgb.r, rgb.g), rgb.b);
      float c = (1.0 - rgb.r - k) / max(0.001, 1.0 - k);
      float m = (1.0 - rgb.g - k) / max(0.001, 1.0 - k);
      float y = (1.0 - rgb.b - k) / max(0.001, 1.0 - k);
      
      // Re-map soft press gamut
      outColor = vec4(1.0 - c*(1.0-k) - k, 1.0 - m*(1.0-k) - k, 1.0 - y*(1.0-k) - k, 1.0);
    }
  `;

  const createShader = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };

  const vs = createShader(gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return;

  const program = gl.createProgram();
  if (!program) return;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);

  // Buffer geometry
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 0, 0,
     1, -1, 1, 0,
    -1,  1, 0, 1,
    -1,  1, 0, 1,
     1, -1, 1, 0,
     1,  1, 1, 1,
  ]), gl.STATIC_DRAW);

  const posLoc = gl.getAttribLocation(program, 'a_position');
  const texLoc = gl.getAttribLocation(program, 'a_texCoord');

  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);

  gl.enableVertexAttribArray(texLoc);
  gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 16, 8);

  // Bind Texture
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageBitmap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}