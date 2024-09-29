<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebGL 2D Object Color Changer</title>
    <style>
        body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: Arial, sans-serif; }
        #container { text-align: center; border: 2px solid #333; padding: 20px; border-radius: 10px; }
        canvas { border: 1px solid #999; margin-bottom: 10px; }
        button { margin: 5px; padding: 10px 20px; font-size: 16px; }
    </style>
</head>
<body>
    <div id="container">
        <canvas id="glCanvas" width="400" height="300"></canvas>
        <br>
        <button id="color1">Color 1</button>
        <button id="color2">Color 2</button>
        <button id="color3">Color 3</button>
        <button id="resetColor">Reset Color</button>
    </div>

    <script>
        let gl;
        let shaderProgram;
        let colorLocation;
        let originalColor = [1.0, 0.0, 0.0, 1.0]; // Red

        window.onload = function() {
            const canvas = document.getElementById('glCanvas');
            gl = canvas.getContext('webgl');

            if (!gl) {
                alert('Unable to initialize WebGL. Your browser may not support it.');
                return;
            }

            const vsSource = `
                attribute vec2 aPosition;
                void main() {
                    gl_Position = vec4(aPosition, 0.0, 1.0);
                }
            `;

            const fsSource = `
                precision mediump float;
                uniform vec4 uColor;
                void main() {
                    gl_FragColor = uColor;
                }
            `;

            shaderProgram = initShaderProgram(gl, vsSource, fsSource);
            const positionLocation = gl.getAttribLocation(shaderProgram, 'aPosition');
            colorLocation = gl.getUniformLocation(shaderProgram, 'uColor');

            // Create a circle
            const radius = 0.5;
            const numSegments = 100;
            const vertices = [];
            for (let i = 0; i <= numSegments; i++) {
                const theta = (i / numSegments) * Math.PI * 2;
                vertices.push(Math.cos(theta) * radius, Math.sin(theta) * radius);
            }

            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(positionLocation);

            gl.useProgram(shaderProgram);

            function drawCircle(r, g, b) {
                gl.clearColor(1.0, 1.0, 1.0, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.uniform4f(colorLocation, r, g, b, 1.0);
                gl.drawArrays(gl.TRIANGLE_FAN, 0, numSegments + 2);
            }

            drawCircle(...originalColor);

            document.getElementById('color1').addEventListener('click', () => drawCircle(0.0, 1.0, 0.0)); // Green
            document.getElementById('color2').addEventListener('click', () => drawCircle(0.0, 0.0, 1.0)); // Blue
            document.getElementById('color3').addEventListener('click', () => drawCircle(1.0, 1.0, 0.0)); // Yellow
            document.getElementById('resetColor').addEventListener('click', () => drawCircle(...originalColor));
        }

        function initShaderProgram(gl, vsSource, fsSource) {
            const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
            const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

            const shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
                return null;
            }

            return shaderProgram;
        }

        function loadShader(gl, type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }

            return shader;
        }
    </script>
</body>
</html>