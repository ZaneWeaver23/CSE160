// DrawRectangle.js
function main() {
    canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to recieve the <canvas> element');
        return false;
    }

    ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function handleDrawOperatorEvent() {
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let v1x = document.getElementById("v1x").value;
    let v1y = document.getElementById("v1y").value;

    let v1 = new Vector3([v1x, v1y, 0])
    drawVector(v1, "red")

    let v2x = document.getElementById("v2x").value;
    let v2y = document.getElementById("v2y").value;

    let v2 = new Vector3([v2x, v2y, 0])
    drawVector(v2, "blue")

    let operation = document.getElementById("Operation-Select").value;
    let Scalar = document.getElementById("Scalar").value
    // console.log(Scalar)

    // console.log(operation)
    if (operation == "add") {
        let v3 = v1.add(v2);
        drawVector(v3, "green")
    }
    if (operation == "sub") {
        let v3 = v1.sub(v2);
        drawVector(v3, "green")
    }
    if (operation == "multiply") {
        let v3 = v1.mul(Scalar);
        drawVector(v3, "green")
        let v4 = v2.mul(Scalar)
        drawVector(v4, "green")
    }
    if (operation == "divide") {
        let v3 = v1.div(Scalar);
        drawVector(v3, "green")
        let v4 = v2.div(Scalar);
        drawVector(v4, "green")
    }
    if (operation == "magnitude") {
        let m1 = v1.magnitude();
        let m2 = v2.magnitude();
        console.log("Magnitude v1: ", m1)
        console.log("Magnitude v2: ", m2)
    }
    if (operation == "normalize") {
        let v3 = v1.normalize();
        let v4 = v2.normalize();
        drawVector(v3, "green")
        drawVector(v4, "green")
    }
    if (operation == "angleBetween") {
        let v3 = angleBetween(v1, v2);
        console.log("Angle: ", v3)
    }
    if (operation == "area") {
        let v3 = areaTriangle(v1, v2);
        console.log("Area of the Triangle: ", v3)
    }
}

function angleBetween(v1, v2) {
    var m1 = v1.magnitude();
    var m2 = v2.magnitude();

    var dot = Vector3.dot(v1, v2);
    var cosAngle = dot / (m1 * m2);
    var angleRad = Math.acos(cosAngle);
    var angleDeg = angleRad * (180 / Math.PI);

    return angleDeg
}

function areaTriangle(v1, v2) {
    var cross = Vector3.cross(v1, v2);
    var magCross = cross.magnitude();
    var area = magCross / 2;
    
    return area
}

function handleDrawEvent() {
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let v1x = document.getElementById("v1x").value;
    let v1y = document.getElementById("v1y").value;

    let v1 = new Vector3([v1x, v1y, 0])
    drawVector(v1, "red")

    let v2x = document.getElementById("v2x").value;
    let v2y = document.getElementById("v2y").value;

    let v2 = new Vector3([v2x, v2y, 0])
    drawVector(v2, "blue")
}

function drawVector(v, color) {
    ctx.strokeStyle = color;
    let cx = canvas.width/2;
    let cy = canvas.height/2;
    let vx = v.elements[0] * 20;
    let vy = v.elements[1] * 20;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + vx, cy - vy)
    ctx.stroke();
}
