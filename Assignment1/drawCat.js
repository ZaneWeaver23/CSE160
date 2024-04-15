function drawCat() {
    g_shapesList = []
    var head = [
        -0.4, 0,
        0.4, 0,
        0.0, 0.7
    ];
    var body = [
        -0.6, -1,
        .6, -1,
        0.0, .2
    ]
    var tail1 = [
        -.6, -1,
        -.5, -.8,
        -1, -.7
    ]
    var tail1highlight = [
        -1, -.7,
        -.85, -.815,
        -.82, -.735
    ]
    var tail2 = [
        -1, -.7,
        -.85, -.815,
        -.6, -.2
    ]
    var tail2highlight = [
        -.6, -.2,
        -.65, -.325,
        -.675, -.2875
    ]
    var tail3 = [
        -.6, -.2,
        -.65, -.325,
        -.8, -.1
    ]
    var leftFoot = [
        -.4, -1,
        -.2, -1,
        -.3, -.8
    ]
    var rightFoot = [
        .4, -1,
        .2, -1,
        .3, -.8
    ]
    var mouth = [
        -.1, 0,
        .1, 0,
        0.0, .2
    ]
    var leftlefteye = [
        -.2, .2,
        -.12, .2,
        -.12, .4
    ]
    var rightlefteye = [
        -.04, .2,
        -.12, .2,
        -.12, .4
    ]
    var rightrighteye = [
        .2, .2,
        .12, .2,
        .12, .4
    ]
    var leftrighteye = [
        .04, .2,
        .12, .2,
        .12, .4
    ]
    var leftear = [
        -.2, .35,
        -.4, .65,
        -.1, .525
    ]
    var rightear = [
        .2, .35,
        .4, .65,
        .1, .525
    ]
    var leftinnerear = [
        -.175, .385,
        -.275, .535,
        -.125, .475
    ]
    var rightinnerear = [
        .175, .385,
        .275, .535,
        .125, .475
    ]
    var toe1 = [
        -.375, -1,
        -.325, -1,
        -.350, -.95
    ]
    var toe2 = [
        -.325, -1,
        -.275, -1,
        -.30, -.95
    ]
    var toe3 = [
        -.275, -1,
        -.225, -1,
        -.25, -.95
    ]
    var toe4 = [
        .375, -1,
        .325, -1,
        .350, -.95
    ]
    var toe5 = [
        .325, -1,
        .275, -1,
        .30, -.95
    ]
    var toe6 = [
        .275, -1,
        .225, -1,
        .25, -.95
    ]

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.uniform4fv(u_FragColor, [0.9, 0.9, 0.0, 1.0]);
    drawTriangle(head)
    gl.uniform4fv(u_FragColor, [1.0, .5, 0.0, 1.0]);
    drawTriangle(body)
    gl.uniform4fv(u_FragColor, [.6, .4, .2, 1.0]);
    drawTriangle(leftFoot)
    gl.uniform4fv(u_FragColor, [.6, .4, .2, 1.0]);
    drawTriangle(rightFoot)
    gl.uniform4fv(u_FragColor, [1.0, 1.0, 0.0, 1.0]);
    drawTriangle(mouth)
    gl.uniform4fv(u_FragColor, [0.0, 1.0, 0.0, 1.0]);
    drawTriangle(rightlefteye)
    drawTriangle(leftrighteye)
    gl.uniform4fv(u_FragColor, [0.5, 1.0, 0.0, 1.0]);
    drawTriangle(leftlefteye)
    drawTriangle(rightrighteye)
    gl.uniform4fv(u_FragColor, [1.0, 0.0, 0.0, 1.0]);
    drawTriangle(leftear)
    drawTriangle(rightear)
    gl.uniform4fv(u_FragColor, [1.0, .75, 0.8, 1.0]);
    drawTriangle(leftinnerear)
    drawTriangle(rightinnerear)
    gl.uniform4fv(u_FragColor, [0.0, 0.0, 0.0, 1.0]);
    drawTriangle(toe1)
    drawTriangle(toe2)
    drawTriangle(toe3)
    drawTriangle(toe4)
    drawTriangle(toe5)
    drawTriangle(toe6)
    gl.uniform4fv(u_FragColor, [0.0, 0.0, 1.0, 1.0])
    drawTriangle(tail1)
    drawTriangle(tail2)
    drawTriangle(tail3)
    gl.uniform4fv(u_FragColor, [0.0, 1.0, 1.0, 1.0])
    drawTriangle(tail1highlight)
    drawTriangle(tail2highlight)
}