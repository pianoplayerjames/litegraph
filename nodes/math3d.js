/**
 * LiteGraph math3d nodes - ESM version
 * Converted from the original litegraph.js library
 */

/**
 * Registers math3d nodes with LiteGraph
 * @param {Object} LiteGraph - The LiteGraph namespace
 */
export function registerMath3dNodes(LiteGraph) {
var _global = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : {}));

// Fix: Define DEG2RAD constant
var DEG2RAD = Math.PI / 180;

// Fix: Extract glMatrix functions from global scope or create minimal fallbacks
var glMatrix = _global.glMatrix;
var vec3 = (glMatrix && glMatrix.vec3) || _global.vec3 || {
    create: function() { return new Float32Array(3); },
    fromValues: function(x, y, z) { return new Float32Array([x, y, z]); },
    add: function(out, a, b) { out[0] = a[0] + b[0]; out[1] = a[1] + b[1]; out[2] = a[2] + b[2]; return out; },
    sub: function(out, a, b) { out[0] = a[0] - b[0]; out[1] = a[1] - b[1]; out[2] = a[2] - b[2]; return out; },
    mul: function(out, a, b) { out[0] = a[0] * b[0]; out[1] = a[1] * b[1]; out[2] = a[2] * b[2]; return out; },
    div: function(out, a, b) { out[0] = a[0] / b[0]; out[1] = a[1] / b[1]; out[2] = a[2] / b[2]; return out; },
    scale: function(out, a, s) { out[0] = a[0] * s; out[1] = a[1] * s; out[2] = a[2] * s; return out; },
    dot: function(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; },
    cross: function(out, a, b) { var ax = a[0], ay = a[1], az = a[2], bx = b[0], by = b[1], bz = b[2]; out[0] = ay * bz - az * by; out[1] = az * bx - ax * bz; out[2] = ax * by - ay * bx; return out; },
    length: function(a) { return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]); },
    normalize: function(out, a) { var len = vec3.length(a); if (len > 0) { len = 1 / len; out[0] = a[0] * len; out[1] = a[1] * len; out[2] = a[2] * len; } return out; },
    transformQuat: function(out, a, q) { var x = a[0], y = a[1], z = a[2], qx = q[0], qy = q[1], qz = q[2], qw = q[3], ix = qw * x + qy * z - qz * y, iy = qw * y + qz * x - qx * z, iz = qw * z + qx * y - qy * x, iw = -qx * x - qy * y - qz * z; out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy; out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz; out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx; return out; }
};

var mat4 = (glMatrix && glMatrix.mat4) || _global.mat4 || {
    create: function() { var out = new Float32Array(16); out[0] = 1; out[5] = 1; out[10] = 1; out[15] = 1; return out; },
    identity: function(out) { out.fill(0); out[0] = 1; out[5] = 1; out[10] = 1; out[15] = 1; return out; },
    translate: function(out, a, v) { out.set(a); out[12] += v[0]; out[13] += v[1]; out[14] += v[2]; return out; },
    scale: function(out, a, v) { out.set(a); out[0] *= v[0]; out[5] *= v[1]; out[10] *= v[2]; return out; },
    multiply: function(out, a, b) { var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15]; var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3]; out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30; out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31; out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32; out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33; b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7]; out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30; out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31; out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32; out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33; b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11]; out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30; out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31; out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32; out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33; b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15]; out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30; out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31; out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32; out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33; return out; },
    fromQuat: function(out, q) { var x = q[0], y = q[1], z = q[2], w = q[3], x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, yx = y * x2, yy = y * y2, zx = z * x2, zy = z * y2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2; out[0] = 1 - yy - zz; out[1] = yx + wz; out[2] = zx - wy; out[3] = 0; out[4] = yx - wz; out[5] = 1 - xx - zz; out[6] = zy + wx; out[7] = 0; out[8] = zx + wy; out[9] = zy - wx; out[10] = 1 - xx - yy; out[11] = 0; out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1; return out; }
};

var quat = (glMatrix && glMatrix.quat) || _global.quat || {
    create: function() { return new Float32Array([0, 0, 0, 1]); },
    fromEuler: function(out, euler) { var x = euler[0] * 0.5, y = euler[1] * 0.5, z = euler[2] * 0.5, sx = Math.sin(x), cx = Math.cos(x), sy = Math.sin(y), cy = Math.cos(y), sz = Math.sin(z), cz = Math.cos(z); out[0] = sx * cy * cz - cx * sy * sz; out[1] = cx * sy * cz + sx * cy * sz; out[2] = cx * cy * sz - sx * sy * cz; out[3] = cx * cy * cz + sx * sy * sz; return out; },
    normalize: function(out, a) { var len = Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2] + a[3]*a[3]); if (len > 0) { len = 1 / len; out[0] = a[0] * len; out[1] = a[1] * len; out[2] = a[2] * len; out[3] = a[3] * len; } return out; },
    multiply: function(out, a, b) { var ax = a[0], ay = a[1], az = a[2], aw = a[3], bx = b[0], by = b[1], bz = b[2], bw = b[3]; out[0] = ax * bw + aw * bx + ay * bz - az * by; out[1] = ay * bw + aw * by + az * bx - ax * bz; out[2] = az * bw + aw * bz + ax * by - ay * bx; out[3] = aw * bw - ax * bx - ay * by - az * bz; return out; },
    slerp: function(out, a, b, t) { var ax = a[0], ay = a[1], az = a[2], aw = a[3], bx = b[0], by = b[1], bz = b[2], bw = b[3], omega, cosom, sinom, scale0, scale1; cosom = ax * bx + ay * by + az * bz + aw * bw; if (cosom < 0.0) { cosom = -cosom; bx = -bx; by = -by; bz = -bz; bw = -bw; } if ((1.0 - cosom) > 0.000001) { omega = Math.acos(cosom); sinom = Math.sin(omega); scale0 = Math.sin((1.0 - t) * omega) / sinom; scale1 = Math.sin(t * omega) / sinom; } else { scale0 = 1.0 - t; scale1 = t; } out[0] = scale0 * ax + scale1 * bx; out[1] = scale0 * ay + scale1 * by; out[2] = scale0 * az + scale1 * bz; out[3] = scale0 * aw + scale1 * bw; return out; },
    setAxisAngle: function(out, axis, rad) { rad = rad * 0.5; var s = Math.sin(rad); out[0] = s * axis[0]; out[1] = s * axis[1]; out[2] = s * axis[2]; out[3] = Math.cos(rad); return out; },
    toEuler: function(out, q) { var x = q[0], y = q[1], z = q[2], w = q[3]; var sinr_cosp = 2 * (w * x + y * z); var cosr_cosp = 1 - 2 * (x * x + y * y); out[0] = Math.atan2(sinr_cosp, cosr_cosp); var sinp = 2 * (w * y - z * x); if (Math.abs(sinp) >= 1) out[1] = Math.sign(sinp) * Math.PI / 2; else out[1] = Math.asin(sinp); var siny_cosp = 2 * (w * z + x * y); var cosy_cosp = 1 - 2 * (y * y + z * z); out[2] = Math.atan2(siny_cosp, cosy_cosp); return out; }
};

function Math3DMat4()
	{
        this.addInput("T", "vec3");
        this.addInput("R", "vec3");
        this.addInput("S", "vec3");
        this.addOutput("mat4", "mat4");
		this.properties = {
			"T":[0,0,0],
			"R":[0,0,0],
			"S":[1,1,1],
			R_in_degrees: true
		};
		this._result = mat4.create();
		this._must_update = true;
	}

	Math3DMat4.title = "mat4";
	Math3DMat4.temp_quat = new Float32Array([0,0,0,1]);
	Math3DMat4.temp_mat4 = new Float32Array(16);
	Math3DMat4.temp_vec3 = new Float32Array(3);

	Math3DMat4.prototype.onPropertyChanged = function(name, value)
	{
		this._must_update = true;
	}

	Math3DMat4.prototype.onExecute = function()
	{
		var M = this._result;
		var Q = Math3DMat4.temp_quat;
		var temp_mat4 = Math3DMat4.temp_mat4;
		var temp_vec3 = Math3DMat4.temp_vec3;

		var T = this.getInputData(0);
		var R = this.getInputData(1);
		var S = this.getInputData(2);

		if( this._must_update || T || R || S )
		{
			T = T || this.properties.T;
			R = R || this.properties.R;
			S = S || this.properties.S;
			mat4.identity( M );
			mat4.translate( M, M, T );
			if(this.properties.R_in_degrees)
			{
				temp_vec3.set( R );
				vec3.scale(temp_vec3,temp_vec3,DEG2RAD);
				quat.fromEuler( Q, temp_vec3 );
			}
			else
				quat.fromEuler( Q, R );
			mat4.fromQuat( temp_mat4, Q );
			mat4.multiply( M, M, temp_mat4 );
			mat4.scale( M, M, S );
		}

		this.setOutputData(0, M);		
	}

    LiteGraph.registerNodeType("math3d/mat4", Math3DMat4);

    //Math 3D operation
    function Math3DOperation() {
        this.addInput("A", "number,vec3");
        this.addInput("B", "number,vec3");
        this.addOutput("=", "number,vec3");
        this.addProperty("OP", "+", "enum", { values: Math3DOperation.values });
		this._result = vec3.create();
    }

    Math3DOperation.values = ["+", "-", "*", "/", "%", "^", "max", "min","dot","cross"];

    LiteGraph.registerSearchboxExtra("math3d/operation", "CROSS()", {
        properties: {"OP":"cross"},
        title: "CROSS()"
    });

    LiteGraph.registerSearchboxExtra("math3d/operation", "DOT()", {
        properties: {"OP":"dot"},
        title: "DOT()"
    });

	Math3DOperation.title = "Operation";
    Math3DOperation.desc = "Easy math 3D operators";
    Math3DOperation["@OP"] = {
        type: "enum",
        title: "operation",
        values: Math3DOperation.values
    };
    Math3DOperation.size = [100, 60];

    Math3DOperation.prototype.getTitle = function() {
		if(this.properties.OP == "max" || this.properties.OP == "min" )
			return this.properties.OP + "(A,B)";
        return "A " + this.properties.OP + " B";
    };

    Math3DOperation.prototype.onExecute = function() {
        var A = this.getInputData(0);
        var B = this.getInputData(1);
		if(A == null || B == null)
			return;
		if(A.constructor === Number)
			A = [A,A,A];
		if(B.constructor === Number)
			B = [B,B,B];

        var result = this._result;
        switch (this.properties.OP) {
            case "+":
                result = vec3.add(result,A,B);
                break;
            case "-":
                result = vec3.sub(result,A,B);
                break;
            case "x":
            case "X":
            case "*":
                result = vec3.mul(result,A,B);
                break;
            case "/":
                result = vec3.div(result,A,B);
                break;
            case "%":
                result[0] = A[0]%B[0];
                result[1] = A[1]%B[1];
                result[2] = A[2]%B[2];
                break;
            case "^":
                result[0] = Math.pow(A[0],B[0]);
                result[1] = Math.pow(A[1],B[1]);
                result[2] = Math.pow(A[2],B[2]);
                break;
            case "max":
                result[0] = Math.max(A[0],B[0]);
                result[1] = Math.max(A[1],B[1]);
                result[2] = Math.max(A[2],B[2]);
                break;
            case "min":
                result[0] = Math.min(A[0],B[0]);
                result[1] = Math.min(A[1],B[1]);
                result[2] = Math.min(A[2],B[2]);
            case "dot":
                result = vec3.dot(A,B);
                break;
            case "cross":
                vec3.cross(result,A,B);
                break;
            default:
                console.warn("Unknown operation: " + this.properties.OP);
        }
        this.setOutputData(0, result);
    };

    Math3DOperation.prototype.onDrawBackground = function(ctx) {
        if (this.flags.collapsed) {
            return;
        }

        ctx.font = "40px Arial";
        ctx.fillStyle = "#666";
        ctx.textAlign = "center";
        ctx.fillText(
            this.properties.OP,
            this.size[0] * 0.5,
            (this.size[1] + LiteGraph.NODE_TITLE_HEIGHT) * 0.5
        );
        ctx.textAlign = "left";
    };

    LiteGraph.registerNodeType("math3d/operation", Math3DOperation);

    // ========== Vec3 Creation Node ==========
    function Math3DVec3() {
        this.addInput("x", "number");
        this.addInput("y", "number");
        this.addInput("z", "number");
        this.addOutput("vec3", "vec3");
        this.properties = { x: 1, y: 0, z: 0 };
        this._data = new Float32Array(3);

        var that = this;
        this.addWidget("number", "X", this.properties.x, function(v) { that.properties.x = v; }, { step: 0.1 });
        this.addWidget("number", "Y", this.properties.y, function(v) { that.properties.y = v; }, { step: 0.1 });
        this.addWidget("number", "Z", this.properties.z, function(v) { that.properties.z = v; }, { step: 0.1 });
        this.size = [160, 120];
    }

    Math3DVec3.title = "Vec3";
    Math3DVec3.desc = "Creates a vec3 from x, y, z components";

    Math3DVec3.prototype.onExecute = function() {
        var x = this.getInputData(0);
        var y = this.getInputData(1);
        var z = this.getInputData(2);

        this._data[0] = x !== undefined ? x : this.properties.x;
        this._data[1] = y !== undefined ? y : this.properties.y;
        this._data[2] = z !== undefined ? z : this.properties.z;

        this.setOutputData(0, this._data);
    };

    LiteGraph.registerNodeType("math3d/vec3", Math3DVec3);

    // ========== Vec3 Cross Product Node ==========
    function Math3DVec3Cross() {
        this.addInput("A", "vec3");
        this.addInput("B", "vec3");
        this.addOutput("AxB", "vec3");
        this._data = new Float32Array(3);
    }

    Math3DVec3Cross.title = "Vec3 Cross";
    Math3DVec3Cross.desc = "Cross product of two vec3s";

    Math3DVec3Cross.prototype.onExecute = function() {
        var a = this.getInputData(0);
        var b = this.getInputData(1);
        if (!a || !b) return;

        this._data[0] = a[1] * b[2] - a[2] * b[1];
        this._data[1] = a[2] * b[0] - a[0] * b[2];
        this._data[2] = a[0] * b[1] - a[1] * b[0];

        this.setOutputData(0, this._data);
    };

    LiteGraph.registerNodeType("math3d/vec3-cross", Math3DVec3Cross);

    function Math3DVec3Scale() {
        this.addInput("in", "vec3");
        this.addInput("f", "number");
        this.addOutput("out", "vec3");
        this.properties = { f: 1 };
        this._data = new Float32Array(3);
    }

    Math3DVec3Scale.title = "vec3_scale";
    Math3DVec3Scale.desc = "scales the components of a vec3";

    Math3DVec3Scale.prototype.onExecute = function() {
        var v = this.getInputData(0);
        if (v == null) {
            return;
        }
        var f = this.getInputData(1);
        if (f == null) {
            f = this.properties.f;
        }

        var data = this._data;
        data[0] = v[0] * f;
        data[1] = v[1] * f;
        data[2] = v[2] * f;
        this.setOutputData(0, data);
    };

    LiteGraph.registerNodeType("math3d/vec3-scale", Math3DVec3Scale);

    function Math3DVec3Length() {
        this.addInput("in", "vec3");
        this.addOutput("out", "number");
    }

    Math3DVec3Length.title = "vec3_length";
    Math3DVec3Length.desc = "returns the module of a vector";

    Math3DVec3Length.prototype.onExecute = function() {
        var v = this.getInputData(0);
        if (v == null) {
            return;
        }
        var dist = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        this.setOutputData(0, dist);
    };

    LiteGraph.registerNodeType("math3d/vec3-length", Math3DVec3Length);

    function Math3DVec3Normalize() {
        this.addInput("in", "vec3");
        this.addOutput("out", "vec3");
        this._data = new Float32Array(3);
    }

    Math3DVec3Normalize.title = "vec3_normalize";
    Math3DVec3Normalize.desc = "returns the vector normalized";

    Math3DVec3Normalize.prototype.onExecute = function() {
        var v = this.getInputData(0);
        if (v == null) {
            return;
        }
        var dist = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        var data = this._data;
        data[0] = v[0] / dist;
        data[1] = v[1] / dist;
        data[2] = v[2] / dist;

        this.setOutputData(0, data);
    };

    LiteGraph.registerNodeType("math3d/vec3-normalize", Math3DVec3Normalize);

    function Math3DVec3Lerp() {
        this.addInput("A", "vec3");
        this.addInput("B", "vec3");
        this.addInput("f", "vec3");
        this.addOutput("out", "vec3");
        this.properties = { f: 0.5 };
        this._data = new Float32Array(3);
    }

    Math3DVec3Lerp.title = "vec3_lerp";
    Math3DVec3Lerp.desc = "returns the interpolated vector";

    Math3DVec3Lerp.prototype.onExecute = function() {
        var A = this.getInputData(0);
        if (A == null) {
            return;
        }
        var B = this.getInputData(1);
        if (B == null) {
            return;
        }
        var f = this.getInputOrProperty("f");

        var data = this._data;
        data[0] = A[0] * (1 - f) + B[0] * f;
        data[1] = A[1] * (1 - f) + B[1] * f;
        data[2] = A[2] * (1 - f) + B[2] * f;

        this.setOutputData(0, data);
    };

    LiteGraph.registerNodeType("math3d/vec3-lerp", Math3DVec3Lerp);

    function Math3DVec3Dot() {
        this.addInput("A", "vec3");
        this.addInput("B", "vec3");
        this.addOutput("out", "number");
    }

    Math3DVec3Dot.title = "vec3_dot";
    Math3DVec3Dot.desc = "returns the dot product";

    Math3DVec3Dot.prototype.onExecute = function() {
        var A = this.getInputData(0);
        if (A == null) {
            return;
        }
        var B = this.getInputData(1);
        if (B == null) {
            return;
        }

        var dot = A[0] * B[0] + A[1] * B[1] + A[2] * B[2];
        this.setOutputData(0, dot);
    };

    LiteGraph.registerNodeType("math3d/vec3-dot", Math3DVec3Dot);

    //if glMatrix is installed...
    if (_global.glMatrix) {
        function Math3DQuaternion() {
            this.addOutput("quat", "quat");
            this.properties = { x: 0, y: 0, z: 0, w: 1, normalize: false };
            this._value = quat.create();
        }

        Math3DQuaternion.title = "Quaternion";
        Math3DQuaternion.desc = "quaternion";

        Math3DQuaternion.prototype.onExecute = function() {
            this._value[0] = this.getInputOrProperty("x");
            this._value[1] = this.getInputOrProperty("y");
            this._value[2] = this.getInputOrProperty("z");
            this._value[3] = this.getInputOrProperty("w");
            if (this.properties.normalize) {
                quat.normalize(this._value, this._value);
            }
            this.setOutputData(0, this._value);
        };

        Math3DQuaternion.prototype.onGetInputs = function() {
            return [
                ["x", "number"],
                ["y", "number"],
                ["z", "number"],
                ["w", "number"]
            ];
        };

        LiteGraph.registerNodeType("math3d/quaternion", Math3DQuaternion);

        function Math3DRotation() {
            this.addInputs([["degrees", "number"], ["axis", "vec3"]]);
            this.addOutput("quat", "quat");
            this.properties = { angle: 90.0, axis: vec3.fromValues(0, 1, 0) };

            this._value = quat.create();
        }

        Math3DRotation.title = "Rotation";
        Math3DRotation.desc = "quaternion rotation";

        Math3DRotation.prototype.onExecute = function() {
            var angle = this.getInputData(0);
            if (angle == null) {
                angle = this.properties.angle;
            }
            var axis = this.getInputData(1);
            if (axis == null) {
                axis = this.properties.axis;
            }

            var R = quat.setAxisAngle(this._value, axis, angle * 0.0174532925);
            this.setOutputData(0, R);
        };

        LiteGraph.registerNodeType("math3d/rotation", Math3DRotation);


        function MathEulerToQuat() {
            this.addInput("euler", "vec3");
            this.addOutput("quat", "quat");
            this.properties = { euler:[0,0,0], use_yaw_pitch_roll: false };
			this._degs = vec3.create();
            this._value = quat.create();
        }

        MathEulerToQuat.title = "Euler->Quat";
        MathEulerToQuat.desc = "Converts euler angles (in degrees) to quaternion";

        MathEulerToQuat.prototype.onExecute = function() {
            var euler = this.getInputData(0);
            if (euler == null) {
                euler = this.properties.euler;
            }
			vec3.scale( this._degs, euler, DEG2RAD );
			if(this.properties.use_yaw_pitch_roll)
				this._degs = [this._degs[2],this._degs[0],this._degs[1]];
            var R = quat.fromEuler(this._value, this._degs);
            this.setOutputData(0, R);
        };

        LiteGraph.registerNodeType("math3d/euler_to_quat", MathEulerToQuat);

        function MathQuatToEuler() {
            this.addInput(["quat", "quat"]);
            this.addOutput("euler", "vec3");
			this._value = vec3.create();
        }

        MathQuatToEuler.title = "Euler->Quat";
        MathQuatToEuler.desc = "Converts rotX,rotY,rotZ in degrees to quat";

        MathQuatToEuler.prototype.onExecute = function() {
            var q = this.getInputData(0);
			if(!q)
				return;
            var R = quat.toEuler(this._value, q);
			vec3.scale( this._value, this._value, DEG2RAD );
            this.setOutputData(0, this._value);
        };

        LiteGraph.registerNodeType("math3d/quat_to_euler", MathQuatToEuler);


        //Math3D rotate vec3
        function Math3DRotateVec3() {
            this.addInputs([["vec3", "vec3"], ["quat", "quat"]]);
            this.addOutput("result", "vec3");
            this.properties = { vec: [0, 0, 1] };
        }

        Math3DRotateVec3.title = "Rot. Vec3";
        Math3DRotateVec3.desc = "rotate a point";

        Math3DRotateVec3.prototype.onExecute = function() {
            var vec = this.getInputData(0);
            if (vec == null) {
                vec = this.properties.vec;
            }
            var quat = this.getInputData(1);
            if (quat == null) {
                this.setOutputData(vec);
            } else {
                this.setOutputData(
                    0,
                    vec3.transformQuat(vec3.create(), vec, quat)
                );
            }
        };

        LiteGraph.registerNodeType("math3d/rotate_vec3", Math3DRotateVec3);

        function Math3DMultQuat() {
            this.addInputs([["A", "quat"], ["B", "quat"]]);
            this.addOutput("A*B", "quat");

            this._value = quat.create();
        }

        Math3DMultQuat.title = "Mult. Quat";
        Math3DMultQuat.desc = "rotate quaternion";

        Math3DMultQuat.prototype.onExecute = function() {
            var A = this.getInputData(0);
            if (A == null) {
                return;
            }
            var B = this.getInputData(1);
            if (B == null) {
                return;
            }

            var R = quat.multiply(this._value, A, B);
            this.setOutputData(0, R);
        };

        LiteGraph.registerNodeType("math3d/mult-quat", Math3DMultQuat);

        function Math3DQuatSlerp() {
            this.addInputs([
                ["A", "quat"],
                ["B", "quat"],
                ["factor", "number"]
            ]);
            this.addOutput("slerp", "quat");
            this.addProperty("factor", 0.5);

            this._value = quat.create();
        }

        Math3DQuatSlerp.title = "Quat Slerp";
        Math3DQuatSlerp.desc = "quaternion spherical interpolation";

        Math3DQuatSlerp.prototype.onExecute = function() {
            var A = this.getInputData(0);
            if (A == null) {
                return;
            }
            var B = this.getInputData(1);
            if (B == null) {
                return;
            }
            var factor = this.properties.factor;
            if (this.getInputData(2) != null) {
                factor = this.getInputData(2);
            }

            var R = quat.slerp(this._value, A, B, factor);
            this.setOutputData(0, R);
        };

        LiteGraph.registerNodeType("math3d/quat-slerp", Math3DQuatSlerp);


        //Math3D rotate vec3
        function Math3DRemapRange() {
            this.addInput("vec3", "vec3");
            this.addOutput("remap", "vec3");
			this.addOutput("clamped", "vec3");
            this.properties = { clamp: true, range_min: [-1, -1, 0], range_max: [1, 1, 0], target_min: [-1,-1,0], target_max:[1,1,0] };
			this._value = vec3.create();
			this._clamped = vec3.create();
        }

        Math3DRemapRange.title = "Remap Range";
        Math3DRemapRange.desc = "remap a 3D range";

        Math3DRemapRange.prototype.onExecute = function() {
            var vec = this.getInputData(0);
			if(vec)
				this._value.set(vec);
			var range_min = this.properties.range_min;
			var range_max = this.properties.range_max;
			var target_min = this.properties.target_min;
			var target_max = this.properties.target_max;

			//swap to avoid errors
			/*
			if(range_min > range_max)
			{
				range_min = range_max;
				range_max = this.properties.range_min;
			}

			if(target_min > target_max)
			{
				target_min = target_max;
				target_max = this.properties.target_min;
			}
			*/

			for(var i = 0; i < 3; ++i)
			{
				var r = range_max[i] - range_min[i];
				this._clamped[i] = clamp( this._value[i], range_min[i], range_max[i] );
				if(r == 0)
				{
					this._value[i] = (target_min[i] + target_max[i]) * 0.5;
					continue;
				}

				var n = (this._value[i] - range_min[i]) / r;
				if(this.properties.clamp)
					n = clamp(n,0,1);
				var t = target_max[i] - target_min[i];
				this._value[i] = target_min[i] + n * t;
			}

			this.setOutputData(0,this._value);
			this.setOutputData(1,this._clamped);
        };

        LiteGraph.registerNodeType("math3d/remap_range", Math3DRemapRange);



    } //glMatrix
	else if (LiteGraph.debug)
		console.warn("No glmatrix found, some Math3D nodes may not work");
}

export default registerMath3dNodes;
