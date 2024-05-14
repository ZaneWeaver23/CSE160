class Cube {
    constructor () {
        this.type = 'cube';
        // this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        // this.size = 5.0;
        // this.segments = 10;
        this.matrix = new Matrix4();
        this.textureNum = -2;
    }

    render() {
        // var xy = this.position;
        var rgba = this.color;
        // var size = this.size;
        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of point to u_FrageColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Back of Cube
        drawTriangle3DUV( [0,0,1,  1,1,1,  1,0,1], [1,0, 0,1, 0,0] );
        drawTriangle3DUV( [0,0,1,  0,1,1,  1,1,1], [1,0, 1,1, 0,1] );

        // Left of cube
        drawTriangle3DUV( [0,0,0,  0,1,1,  0,0,1], [1,0, 0,1, 0,0] );
        drawTriangle3DUV( [0,0,0,  0,1,0,  0,1,1], [1,0, 1,1, 0,1] );
        
        // Bottom of cube
        drawTriangle3DUV( [0,0,0,  1,0,1,  1,0,0], [0,1, 1,0, 1,1] );
        drawTriangle3DUV( [0,0,0,  0,0,1,  1,0,1], [0,1, 0,0, 1,0] );

        // Front of Cube
        drawTriangle3DUV( [0,0,0,  1,1,0,  1,0,0], [0,0, 1,1, 1,0] );
        drawTriangle3DUV( [0,0,0,  0,1,0,  1,1,0], [0,0, 0,1, 1,1] );

        // Right of cube
        drawTriangle3DUV( [1,0,0,  1,1,1,  1,0,1], [0,0, 1,1, 1,0] );
        drawTriangle3DUV( [1,0,0,  1,1,0,  1,1,1], [0,0, 0,1, 1,1] );

        // Top of cube
        drawTriangle3DUV( [0,1,0,  1,1,1,  1,1,0], [0,0, 1,1, 1,0] );
        drawTriangle3DUV( [0,1,0,  0,1,1,  1,1,1], [0,0, 0,1, 1,1] );


    }

    renderFast() {
        // var xy = this.position;
        var rgba = this.color;
        // var size = this.size;
        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of point to u_FrageColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var allverts = [];
        // Back of Cube
        allverts = allverts.concat( [0,0,1,  1,1,1,  1,0,1] );
        allverts = allverts.concat( [0,0,1,  0,1,1,  1,1,1] );

        // Left of cube
        allverts = allverts.concat( [0,0,0,  0,1,1,  0,0,1] );
        allverts = allverts.concat( [0,0,0,  0,1,0,  0,1,1] );
        
        // Bottom of cube
        allverts = allverts.concat( [0,0,0,  1,0,1,  1,0,0] );
        allverts = allverts.concat( [0,0,0,  0,0,1,  1,0,1] );

        // Front of Cube
        allverts = allverts.concat( [0,0,0,  1,1,0,  1,0,0] );
        allverts = allverts.concat( [0,0,0,  0,1,0,  1,1,0] );

        // Right of cube
        allverts = allverts.concat( [1,0,0,  1,1,1,  1,0,1] );
        allverts = allverts.concat( [1,0,0,  1,1,0,  1,1,1] );

        // Top of cube
        allverts = allverts.concat( [0,1,0,  1,1,1,  1,1,0] );
        allverts = allverts.concat( [0,1,0,  0,1,1,  1,1,1] );

        drawTriangle3D(allverts);
    }
    renderFaster(){
    var rgba = this.color;

    // pass the texture number
    gl.uniform1i(u_whichTexture, this.textureNum);

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    //pass the matrix to u_ModalMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix,false,this.matrix.elements);

    if (g_vertexBuffer == null){
        initTriangle3D();
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.cubeVerts), gl.DYNAMIC_DRAW);


    gl.drawArrays(gl.TRIANGLES,0,36);
    }
}