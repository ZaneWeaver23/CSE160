class Prism {
    constructor() {
        this.type = 'prism';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }
    
    render() {
        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        //Front Face
        drawTriangle3D( [0.0,0.0,0.0,   1.0,0.0,0.0,   0.5,0.5,0.0]);
        
        //Right Face
        drawTriangle3D( [0.0,0.0,0.0,   0.5,0.0,0.5,   0.5,0.5,0.0]);
        
        //Left Face
        drawTriangle3D( [0.5,0.0,0.5,   1.0,0.0,0.0,   0.5,0.5,0.0]);
        
        //Top Face
        gl.uniform4f(u_FragColor, rgba[0]*0.5, rgba[1]*0.5, rgba[2]*0.5, rgba[3]);
        drawTriangle3D( [0.0,0.0,0.0,   0.5,0.0,0.5,   1.0,0.0,0.0]);
        
        //Bottom Face

    }
    
}