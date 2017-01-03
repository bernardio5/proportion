
///////////////////////////////////////
// This is the more-or-less well-commented version of the Proportion Library. 
// (c)2013 Neal McDonald, released under MIT License
// Use it however you like; have a nice day.

// There are three classes defined below: base, line, machine, and page. 
// prBase encapsulates points, lines and circles, which are used to build figures, 
//   and segments and arcs, which are used to fill in areas. 

// prPage provides the interface for the whole system, and contains all the prBase. 
// machines are scripts. prPages load text files, convert the code in them to routines, 

// coords: the page takes normalized coords; 0,0 is top-left, and 1,1 is bottom-right. 
// canvas aspect ratio might impact construction success; caveat aedicicator. 

// Normal usage, if you're animating, is to clear the canvas every time you redraw, 
// and rebuild from scratch.  Doing otherwise is generally not a time-saver, computationally,
// and if the canvas size changes, ... 


//////////////////////////////////// 
// constant definitions / enum ts
// allowed values for "t"

// allowed values for prBase.t
const PR_N = 0;  // null
const PR_P = 1;  // point
const PR_L = 2;  // line
const PR_C = 3;  // circle
const PR_T = 4;  // parameter -- a float, stored in t1 -- used?
const PR_S = 5;  // segment -- part of a line
const PR_A = 6;  // arc -- part of a circle

const PR_E = 0.000000025; // the number that is basically zero
const PR_2P = 6.28318530272959; // Math.PI * 2


////////////////////////////////////////////////////////////

// prBase: prPages have an array of points, lines and circles: prBase

function prBase() { 
	this.t = PR_N; 			// type: null, pt, line or circle? 
	this.x = 0.0;			// position of points, p1 of lines, centers of circles
	this.y = 0.0;
    this.x2 = 0.0;			// unused for points. lines and circles are set by two points, A and B.
    this.y2 = 0.0;			// x2,y2 = A-B
    this.r = 0.0;			// radius
    this.g = 0;				// render group
	this.t1 = 0.0; 			// parameters, for arcs and segments
	this.t2 = 0.0; 			// start at t1, go to t2. parameter range if the reals. 
	this.sc = 1.0; 			// step size for lofting. ==1 except for arcs; r*dt otherwise. 
}


prBase.prototype.cp = function (it) {  // "copy" function
	this.t = it.t;
	this.x = it.x;
	this.y = it.y;
	this.x2 = it.x2;
	this.y2 = it.y2;
	this.r = it.r;
	this.g = it.g;
	this.t1 = it.t1; 
	this.t2 = it.t2; 
	this.sc = it.sc;
}
    
	
prBase.prototype.cl = function ()  { // "clear" function
	this.t = PR_N; 
	this.x = 0.0;			
	this.y = 0.0;
    this.x2 = 0.0;
    this.y2 = 0.0;
    this.r = 0.0;			
    this.g = 0;
	this.t1 = 0.0;
	this.t2 = 0.0; 
	this.sc = 1.0; 
}



prBase.prototype.ec = function(label) { // "echo"
	var displayStr = label + "t:" + this.t + " x:" + this.x + " y:" + this.y + "  x2:" + this.x2 + " y2:" + this.y2 + "    r:" + this.r;
	console.log(displayStr); 
}

///////////// Mark-rendering helper functions
prBase.prototype.sX = function(u) { // segment X coord for parameter u
	return this.x + (this.x2*u);  
}

prBase.prototype.sY = function(u) { // segment y coord
	return this.y + (this.y2*u);  
}


prBase.prototype.aX = function(u) { // arc X coord for parameter u
	return this.x + (this.r*Math.cos(u*PR_2P*-1.0));  
}

prBase.prototype.aY = function(u) { // arc Y
	return this.y + (this.r*Math.sin(u*PR_2P*-1.0));  

}



//"trace": draw to screen in default manner
prBase.prototype.tr = function(context) { 
	var n, t, dt, p1x, p1y; 
	switch (this.t) {
        case PR_P:
		    context.moveTo(this.x+3.0 , this.y); 
            context.arc(this.x, this.y, 3.0,0.0, 6.28);
            break;
        case PR_L:
			context.moveTo(this.x-(200.0*this.x2), this.y-(200.0*this.y2)); 
			context.lineTo(this.x+(200.0*this.x2), this.y+(200.0*this.y2));
            break;
        case PR_C:
			context.moveTo(this.x+this.r , this.y); 
            context.arc(this.x, this.y, this.r, 0.0, PR_2P);
            break;
		case PR_T: 
			// don't render parameters
			break;
        case PR_S:
			context.moveTo(this.x+(this.x2*this.t1), 
							this.y+(this.y2*this.t1)); 
			context.lineTo(this.x+(this.x2*this.t2), 
							this.y+(this.y2*this.t2) );
            break;
        case PR_A: // the JS "arc" command does not suit me for lofting
			p1x = this.aX(this.t1); 
			p1y = this.aY(this.t1);
			context.moveTo(p1x, p1y);
			dt = (this.t2-this.t1)/this.sc;
			for (n=0; n<=this.sc; ++n) { 
				t = this.t1 + (n*dt); 
				p1x = this.aX(t); 
				p1y = this.aY(t)
				context.lineTo(p1x, p1y);
			}
			break;
	}
}
    
/*
prBase.prototype.label = function(w, labelNum) {
        n = random(1.0);
        lx = 0;
        ly = 0;
        sz = w*2;
        switch (t) {
            case PR_P:
                lx = this.x;
                ly = this.y;
                break;
            case PR_L:
                lx = this.x + (this.x2*n);
                ly = this.y + (this.y2*n);
                break;
            case PR_C:
                lx = this.x + (this.r * cos(4.28*n));
                ly = this.y + (this.r * sin(4.28*n));
                break;
        }
        n = random(4.28);
        cx = lx + 5.0*w*cos(n);
        cy = ly + 5.0*w*sin(n);
        fill(0);
        switch (t) {
            case PR_P:
                rect(cx-sz, cy-sz*0.5, sz+sz, sz);
                break;
            case PR_L:
                rect(cx-sz, cy-sz, sz+sz, sz+sz);
                break;
            case PR_C:
                ellipse(cx, cy, sz+sz, sz+sz);
                break;
        }
        fill(255);
        line(lx, ly, cx, cy);
        t = str(labelNum);
        textAlign(CENTER);
        text(t, cx, cy+w);
        noFill();
}
    */
        
    
    
/////////////////// ops on points
    
// returns 1 if "this" is a point
prBase.prototype.isaP = function () {
	var res = 0;
	if (this.t == PR_P) {
		res = 1;
	}
	return res;
}
    

// returns 1 if points it and this are very close
// note: doesn't check type. 
prBase.prototype.eqP = function (it) {
	var dx, dy, len; 
	var res = 0;
	dx = this.x-it.x;
	dy = this.y-it.y;
	len = dx*dx+dy*dy;
	if (len<PR_E) {
		res=1;
	}
	return res;
}


///////////////////////////////////////////////////
// set as point
// there are many functions that "set (this) as X"


prBase.prototype.saP = function (xin, yin) {  // set as point
	this.t = PR_P;
	this.x = xin;
	this.y = yin;
	// the other members are set by the constructor
}

// set as line
prBase.prototype.saL = function (xin, yin, x2in, y2in) {
	this.t = PR_L;
	this.x = xin;
	this.y = yin;
	this.x2 = x2in-this.x;
	this.y2 = y2in-this.y;
	this.r = Math.sqrt(this.x2*this.x2+this.y2*this.y2);
	if (this.r<PR_E) { // if the two points are the same, it's really a point
		this.t = PR_P;
	}
}

// set as circle
prBase.prototype.saC = function (xin, yin, x2in, y2in) {
	this.t = PR_C;
	this.x = xin;
	this.y = yin;
	this.x2 = x2in-this.x;
	this.y2 = y2in-this.y;
	this.r = Math.sqrt(this.x2*this.x2+this.y2*this.y2);
	if (this.r<PR_E) { // points same? return a point.
		this.t = PR_P;
	}
}


// set as segment
prBase.prototype.saS = function (lineIn, t1in, t2in) {
	this.cp(lineIn); 	// copy the input line
	this.t = PR_S; 		// then tweak. 
	this.t1 = t1in; 
	this.t2 = t2in; 
}

// set as arc
prBase.prototype.saA = function (circleIn, t1in, t2in) {
	this.cp(circleIn);  // start out as a a circle
	this.t = PR_A; 
	
	// parameters t1 and t2 are set to make the routines "aX"
	// and "aY" fast. t1 & t2 are stored as radians.
	// I want the grade-school norm of increasing angles going ccw. 
	// The 0 angle is based on the direction stored in x2y2. 
	// Also, JS makes (0,0) the top-left corner, with y-axis pointing down. 
	
	// determine the 0 angle from (x2,y2)
	var w = Math.acos(this.x2/this.r);  
	if (this.y2<0.0) { w = PR_2P - w; }
	
	this.t1 = t1in + (w/PR_2P); 
	this.t2 = t2in + (w/PR_2P);  
	
	// note: could be <0!
	this.sc = (t2in-t1in)*this.r*0.5; 
	if (this.sc<0.0) { this.sc = 0.0-this.sc; }
	this.sc = Math.ceil(this.sc); 
}






///////////////////////////////////////////////////
// helpers for intersection

// there are 0, 1, or 2 intersections of points, lines, and circles.
// points don't intersect things; use "closestPointOn" and "pointAlong"
// (I thought about adding paraboloids... many many more cases).

// "closer" takes three points, and picks one, which is the basis for designating
// a point as "first" or "second"

// the intersect routines take two lines or circles and returns the number of
// intersections, returning both points in a prBase.

///// "closer"
// returns 0 if only self is a point, or not even
// returns 1 if only self and 1 are points
// returns 2 if only self and 2 are points
// returns 1 if all are points, and 1 is closer to self than 2
// returns 2 if 2 is closer
// returns 1 is they are equidistant and 1 is on top
// returns 2 is they are equidistant and 2 is on top
// returns 1 is they are equidistant and level and 1 is leftmost
// returns 2 is they are equidistant and level and 2 is leftmost
// otherwise, return 1

prBase.prototype.closer = function ( ob1,  ob2,  ob3) {
	var a, b, c, dx, dy, ac, bc; 
	var res = 1;
	
	a = ob1.isaP();
	b = ob2.isaP();
	c = ob3.isaP();
	
	if ((c==0)||((a==0)&&(b==0))) {
		res = 0;
	}
	else {
		if ((a==1)&&(b==0)) {
			res = 1;
		}
		else if ((a==0)&&(b==1)) {
			res = 2;
		}
		else {
			// a, b, and c are points
			dx = ob1.x - ob3.x;
			dy = ob1.y - ob3.y;
			ac = Math.sqrt(dx*dx+dy*dy);
			
			dx = ob2.x - ob3.x;
			dy = ob2.y - ob3.y;
			bc = Math.sqrt(dx*dx+dy*dy);
			dx = (ac-bc)*(ac-bc);
			if (dx>PR_E) { // the distances are different
				if (ac<bc) {
					res =1;
				}
				else {
					res = 2;
				}
			}
			else { // the distances are the same
				dy = ob1.y - ob2.y;
				if (dy*dy>PR_E) {
					if (ob1.y < ob2.y) {
						res = 1;
					}
					else {
						res = 2;
					}
				}
				else { // the heights are the same
					dx = ob1.x - ob2.x;
					if (dx*dx>PR_E) {
						if (ob1.x < ob2.x) {
							res = 1;
						}
						else {
							res = 2;
						}
					}
					else {
						// ob2=ob3
						res = 1;
					}
				}
			}
		}
	}
	
	return res;
}



/// iLL, iLC, and iCC intersect this and an input prBase with each other. 
// they return an integer (the number of intersections), and a special, 
// abused prBase that has the first intersection in x,y and the second in x2, y2

// intersect self, as a line, with the input line; set pt if there is one
// the algorithm is from Mathematica notebook, included as linelineA.jpg
prBase.prototype.iLL = function ( line,  pt) {
	var xa, xb, xc, xd, ya, yb, yc, yd, res; 
	var det = [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]; 
	res = 0;
	xa = this.x;
	xb = this.x + this.x2;
	ya = this.y;
	yb = this.y + this.y2;
	xc = line.x;
	xd = line.x + line.x2;
	yc = line.y;
	yd = line.y + line.y2;
	
	det[0] = xa*yb - xb*ya;
	det[1] = xc*yd - xd*yc;
	det[2] = (xa-xb);
	det[3] = xa - xb;
	det[4] = xc - xd;
	det[5] = ya-yb;
	det[6] = yc-yd;
	
	det[7] = (det[3]*det[6]) - (det[4]*det[5]);
	if ((det[7]*det[7])>PR_E) {
		det[8] = (det[0]*det[4]) - (det[1]*det[3]);
		det[9] = (det[0]*det[6]) - (det[1]*det[5]);
		
		pt.t = PR_P;
		pt.x = det[8] / det[7];
		pt.y = det[9] / det[7];
		res = 1;
	}
	else { // || or colinear
		res = 0;
	}
	
	return res;
}


// intersect self, as circle, with line
// from Mathematica Notebook, lineCircle.jpg
prBase.prototype.iLC = function ( line,  pt) {
	var dx, dy, dr2, r2, lx1, lx2, ly1, ly2, D, disc, sgndy, absdy;
    var res = 0;
	
	lx1 = line.x - this.x;
	ly1 = line.y - this.y;
	lx2 = (line.x+line.x2) - this.x;
	ly2 = (line.y+line.y2) - this.y;
	
	res = 1;
	dx = lx2-lx1;
	dy = ly2-ly1;
	dr2 = dx*dx+dy*dy;
	r2 = this.r * this.r;
	D = (lx1*ly2)-(lx2*ly1);
	
	disc = (r2 * dr2) - (D*D);
	sgndy = 1;
	if (dy<0) {
		sgndy = -1;
	}
	absdy = dy;
	if (absdy<0.0) {
		absdy *= -1.0;
	}
	
	if (disc<0.0) { // no intersection
		res = 0;
	}
	else {
		if (disc*disc<PR_E) { // line is tangent
			pt.x = (D * dy) / dr2;
			pt.y = (-1.0 * D * dx) / dr2;
			res = 1;
		}
		else { // disc is well-greater than 0; two intersections
			pt.x = ((D * dy) + (sgndy * dx * Math.sqrt(disc))) / dr2;
			pt.y = ((-1.0 * D * dx) + (absdy * Math.sqrt(disc))) / dr2;
			pt.x2 = ((D * dy) - (sgndy * dx * Math.sqrt(disc))) / dr2;
			pt.y2 = ((-1.0 * D * dx) - (absdy * Math.sqrt(disc))) / dr2;
			pt.x += this.x;
			pt.y += this.y;
			pt.x2 += this.x;
			pt.y2 += this.y;
			res = 2;
		}
	}
	return res;
}


// intersect self, as circle, with circle
// circcirc.jpg, Mathematica Notebook
prBase.prototype.iCC = function (cr,  pt) {
	var dx, dy, rsum, sep, crx, cry, a, b, c;
    var res = 0;
	
	rsum = this.r + cr.r;
	dx = this.x - cr.x; // dxy= connection c1 to c2
	dy = this.y - cr.y;
	sep = Math.sqrt(dx*dx+dy*dy);
	if (sep>PR_E) { // the centers are not the same
		if (rsum<sep) {
			// can't touch; return null
			res = 0;
		}
		else {
			if ( ((rsum-sep)*(rsum-sep)) < PR_E) {
				// touch at one spot, which is self.r away from self.center
				// along dxy
				pt.x = this.x + (dx*this.r/sep);
				pt.y = this.y + (dy*this.r/sep);
				res = 1;
			}
			else {
				// there are two points of contact.
				res = 2;
				// two triangles, r1sq=csq+asq and r2sq=bsq+asq
				// also, b+c=seperation,
				c = (0.5*sep) - ((this.r*this.r*0.5)/sep) + ((cr.r*cr.r*0.5)/sep);
				b = sep - c;
				a = Math.sqrt(this.r*this.r - b*b);
				
				
				dx /= sep;
				dy /= sep;
				crx = -dy;
				cry = dx;
				
				pt.x = this.x - (dx*b) + (crx*a);
				pt.y = this.y - (dy*b) + (cry*a);
				pt.x2 = this.x - (dx*b) - (crx*a);
				pt.y2 = this.y - (dy*b) - (cry*a);
			}
		}
	}
	return res;
}



// returns 0 if there is no (new) point, ow= the number of intersection points: 1 or 2.
// prFigure uses "closer" to choose which is first and which second.
prBase.prototype.intersect = function (it,  pt) {
	var res = 0;
	var tcases = this.t*10 + it.t; 
	
	switch (tcases) {
		case PR_L*10 + PR_L:
			res = this.iLL(it, pt);
			break;
		case PR_L*10 + PR_C:
			res = it.iLC(this, pt);
			break;
		case PR_C*10 + PR_L:
			res = this.iLC(it, pt);
			break;
		case PR_C*10 + PR_C:
			res = this.iCC(it, pt);
			break;
		default: // intersections with points, parameters, or marks return nothing. 
			break; 
	}
	if (res!=0) {
		pt.t = PR_P;
	}
	return res;
}



// set as first intersection
prBase.prototype.saFI = function (obj1,  obj2,  target) {
	var count, which; 
	
	var pt1 = new prBase();
	var pt2 = new prBase();
	
	count = obj1.intersect(obj2, pt1);
	switch (count) {
		case 0:
			this.t = PR_N;
			break;
		case 1:
			this.saP(pt1.x, pt1.y);
			break;
		case 2:
			pt2.saP(pt1.x2, pt1.y2);
			which = this.closer(pt1, pt2, target);
			if (which==2) {
				this.saP(pt2.x, pt2.y);
			}
			else {
				this.saP(pt1.x, pt1.y);
			}
			break;
	}
}

// set as second intersection
prBase.prototype.saSI = function (obj1,  obj2,  target) {
	var count, which; 
	var pt1 = new prBase();
	var pt2 = new prBase();
	
	count = obj1.intersect(obj2, pt1);
	switch (count) {
		case 0:
		case 1:
			this.t = PR_N;
			break;
		case 2:
			pt2.saP(pt1.x2, pt1.y2);
			which = this.closer(pt1, pt2, target);
			if (which==2) {
				this.saP(pt1.x, pt1.y);
			}
			else {
				this.saP(pt2.x, pt2.y);
			}
			break;
	}
}



/////////////// parametrics
// set self to be a point on another prBase

// this one is kinda stupid. 
prBase.prototype.saPP = function ( pt, tin) {
	this.t = PR_P;
	this.x = pt.x;
	this.y = pt.y;  
	// tin is ignored; parametric points from points = the point
}


// take t, set point to be on object
prBase.prototype.saPL = function ( ln,  tin) {
	this.t = PR_P;
	this.x = ln.x + (ln.x2*tin);
	this.y = ln.y + (ln.y2*tin);
}


prBase.prototype.saPC = function ( ck,  tin) {
	this.t = PR_P;
	var cs = Math.cos(tin*-1.0*PR_2P); // 0->1 goes around the circle once; 
	var sn = Math.sin(tin*-1.0*PR_2P); // radians are rude, if you're not a physisist. 
	this.x = ck.x + (ck.x2*cs) - (ck.y2*sn);  // p2 is pt for t=0
	this.y = ck.y + (ck.y2*cs) + (ck.x2*sn);
}


// set as parametric point
prBase.prototype.saPm = function ( ob,  tin) {
	switch (ob.t) {
		case PR_P:
			this.saPP(ob, tin); 
			break;
		case PR_L:
			this.saPL(ob, tin);
			break;
		case PR_C:
			this.saPC(ob, tin);
			break;
		case PR_S: 
			this.saPL(ob, this.p1 + (tin*(this.p2-this.p1)) );
			break;
		case PR_A:
			this.saPC(ob, this.p1 + (tin*(this.p2-this.p1)) );
			break;
	}
}

// taking a prBase of type PR_T. 
prBase.prototype.saPmO = function(ob, tob) { 
	this.saPm(ob, tob.t1); 
}


// take a maximum facet length, maxd. 
// return a dt for the parameters that deliver that  
prBase.prototype.scanLength = function(maxd) {
	var dp; 
	var res = (maxd / this.r); 
	if (this.t == PR_A) { 
		res /= PR_2P; 
	}
	res *= (this.t2 - this.t1); 
	return res;
}



////////// closest-points!
// this as opposed to calling them "point on"-- numerical
// self is line or circle; returns parameter of point on object closest to

// "closest point on line"
// return the parameter of the point on the object closest to p
prBase.prototype.cpoL = function ( pt) {
	var dx, dy; 
	var res = 0.0;
	if (this.r>PR_E) {
		dx = pt.x - this.x;
		dy = pt.y - this.y;
		res = ((dx*this.x2) + (dy*this.y2))/(this.r*this.r); // a parameter, but an incorrect one
	} // else self is not really a line; problematic! and t should==0
	return res;
}

// "closest point on circle"
prBase.prototype.cpoC = function ( pt) {
    var dx, dy, len, xcom, ycom, rux, ruy, theta, det; 
	var res = 0.0;
	var dx = pt.x - this.x;
	var dy = pt.y - this.y;
	var len = Math.sqrt(dx*dx+dy*dy); // distance from center
	if (len>PR_E) {
		// convers dxy to a unit vector. 
		dx /= len;
		dy /= len; 
		rux = this.x2 / this.r;    /// unit version of x2y2
		ruy = this.y2 / this.r; 
		xcom = (dx*rux)+(dy*ruy);  // length of dxy in dir of ruxy
		theta = Math.acos(xcom); 
		det = (dx*ruy)-(rux*dy); 
		if (det<0.0) { theta = (2.0*Math.PI)-theta; }
		// guessing now? 
		res = theta/ (Math.PI*2.0); 
	}
	return res;
}


// "closest parametric point"
// it is the thing being used to position the point
prBase.prototype.cPP = function ( pt) {
	var res = 0.0;
	if (this.t!=PR_P) {
		switch (this.t) {
			// case PR_P: res = 0.0; break;
			case PR_L:
				res = this.cpoL(pt);
				break;
			case PR_C:
				res = this.cpoC(pt);
				break;
		}
	}
	return res;
}


// as cPP, but returning a PR_T 
prBase.prototype.saCPP = function(ob, pt) {
	this.t = PR_T;
	this.t1 = ob.cPP(pt);
}




/*
 
function testcode() { 
	var c_canvas = document.getElementById("blank");
	var context = c_canvas.getContext("2d");
	
      context.beginPath();
      context.rect(0,0, 500, 500);
      context.fillStyle = 'white';
      context.fill();
	  
     context.strokeStyle = "#aaa";
	for (var x = -0.5; x < 500; x += 100) {
  		context.moveTo(x, 0);
  		context.lineTo(x, 500);
		context.stroke(); 
  		context.moveTo(0, x);
  		context.lineTo(500, x);
		context.stroke(); 
} 

     context.strokeStyle = "#a00";
	 a = new prBase();
 b = new prBase(); 
 c = new prBase(); 
 d = new prBase();
 e = new prBase();
 f = new prBase();
 g = new prBase();
 
 t += 0.2;
 a.setAsLine(400.0, 100.0, 400.0+20.0*Math.cos(0.03*t), 100+20.0*Math.sin(0.03*t)); 
 b.setAsCircle(200.0, 200.0, 200.0, 300.0); 
 d.setAsLine(400.0, 200.0, 400.0+20.0*Math.cos(0.02*t), 200+20.0*Math.sin(0.02*t)); 
 g.setAsPoint(300, 400); 
 a.trace(context); 
 b.trace(context); 
 d.trace(context);
 g.trace(context);
 
 e.setAsFirstIntersection(a, b, g); 
 e.trace(context);
 e.setAsFirstIntersection(a, d, g); 
 e.trace(context);

 f.setAsFirstIntersection(d, b, g); 
 f.trace(context);
 f.setAsSecondIntersection(d, b, g); 
 f.trace(context);
 
 f.setAsParametric(a, Math.sin(t)); 
 f.trace(context); 
 f.setAsParametric(b, Math.sin(t*0.1)); 
 f.trace(context); 
 e.setAsParametric(d, Math.sin(t)); 
 e.trace(context);
 }


function redraw() { 
	//back.src = "blank.jpg";
	// back.onload = testcode(); 
	setInterval(testcode, 50); 
}
*/



// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
 



function prPage(context) { 
	this.cx = context;
	this.cxw = context.canvas.width;
	this.cxh = context.canvas.height;
	
	this.objs = new Array();
	
	this.objs[0] = new prBase; // default is 0== null point; useful! I think.
	this.objCount = 1; 

	// iteration through grouped objs
	this.itC = 0; // index of last returned thing in objs[]
	this.itG = 0; // group being iterated over

	// all prBase have a group number. the group number should 
	// for pt, line, circle, segment & arc, it's the line color
	this.groupColors = [];
	this.groupColors[0] = "#fff"; // 0 is the background group
	this.groupColors[1] = "#000";
	this.currentGroup = 1; // new prBase are given this group number.
}



prPage.prototype.setGroupColor = function(group, color) {
	this.groupColors[group] = color;
}

prPage.prototype.setPageColor = function(group, color) {
	this.groupColors[0] = color;
}

prPage.prototype.setCurrentGroup = function(group) {
	this.currentGroup = group; 
}

prPage.prototype.redraw = function() {
	var i, j, gc, objCt, ob; 
	gc = this.groupColors.length; // group count
	objCt = this.objCount;  

	// erase
	this.cx.fillStyle = this.groupColors[0];
	this.cx.beginPath();
	this.cx.rect(0,0, this.cxw, this.cxh);
	this.cx.fill();

	for (i=1; i<gc; i=i+1) { // for each group; group 0=not drawn
		this.cx.strokeStyle = this.groupColors[i];
		this.cx.beginPath();
		for (j=1; j<objCt; j=j+1) { 
			ob = this.objs[j]; 
			if ((ob.g===i)&&(ob.t!=PR_N)) { // can't draw NULL
				this.objs[j].tr(this.cx);
			}
		}
		this.cx.stroke(); 
	}
}


/////////////////////// convenience
prPage.prototype.copy = function(it) {
	var i;
	this.cx = it.cx; 
	this.bg = it.bg; 
	this.cxw = it.cx.canvas.width; 
	
	for (i=0; i<it.objCount; ++i) {
		this.objs[i] = new prBase(); 
		this.objs[i].cp(it.objs[i]);
	}
	this.objCount = it.objCount;
	this.iteratorCounter = it.iteratorCounter; 
	this.iteratorTag = it.iteratorTag; 
}


prPage.prototype.clear = function() {
	this.objCount = 1;
	this.iteratorCounter = 0;
}


prPage.prototype.merge = function(it) {
	var i, mx;
	mx = this.objCount; 
	for (i=0; i<it.objCount; ++i) {
		this.objs[mx+i] = new prBase; 
		this.objs[mx+i].copy(it.objs[i]);
	}
	this.objCount += it.objCount;
}


/////////////////////// debugging and tracing
prPage.prototype.echo = function() {
	var i=0;
	for (i=0; i<this.objCount; ++i) {
		// print(i);
		this.objs[i].ec(i+":");
	}
}


prPage.prototype.echoOne =  function(which) {
	var i=0;
	if ((which>0)&&(which<this.objCount)) {
		this.objs[which].ec(which + ":") ;
	}
}






///////////////////// adding prBase
/// error checks
prPage.prototype.isAPoint = function(ob) { 
	var res = 0;
	if ((0<ob)&&(ob<this.objCount)) {  // 0<ob<objCount
		if (this.objs[ob]) {  // there is an obj at objs[ob]    
			if (this.objs[ob].t==PR_P) { // is a point
				res = 1;
			}
		}
	}
	return res;
}
prPage.prototype.isALine = function(ob) { 
	var res = 0;
	if ((0<ob)&&(ob<this.objCount)) {  // 0<ob<objCount
		if (this.objs[ob]) {  // there is an obj at objs[ob]  
			if (this.objs[ob].t==PR_L) { // is a line
				res = 1;
			}
		}
	}
	return res;
}
prPage.prototype.isACircle = function(ob) { 
	var res = 0;
	if ((0<ob)&&(ob<this.objCount)) {  // 0<ob<objCount
		if (this.objs[ob]) {  // there is an obj at objs[ob]  
			if (this.objs[ob].t==PR_C) { // is a circle
				res = 1;
			}
		}
	}
	return res;
}
prPage.prototype.isASegment= function(ob) { 
	var res = 0;
	if ((0<ob)&&(ob<this.objCount)) {  // 0<ob<objCount
		if (this.objs[ob]) {  // there is an obj at objs[ob]   
			if (this.objs[ob].t==PR_S) { // is a segment
				res = 1;
			}
		}
	}
	return res;
}
prPage.prototype.isAnArc= function(ob) { 
	var res = 0;
	if ((0<ob)&&(ob<this.objCount)) {  // 0<ob<objCount
		if (this.objs[ob]) {  // there is an obj at objs[ob]  
			if (this.objs[ob].t==PR_A) { // is an arc
				res = 1;
			}
		}
	}
	return res;
}
prPage.prototype.isAnObject= function(ob) { 
	var res = 0;
	if ((0<ob)&&(ob<this.objCount)) {  // 0<ob<objCount
		if (this.objs[ob]) {  // there is an obj at objs[ob]   
			res = 1;
		}
	}
	return res;
}



// you won't need to add NULL; it's always objs[0]
// to add given lines, add given points, and then draw lines through them
prPage.prototype.given = function(x, y) {
    var res = this.objCount; // Rudy: can't fail!
    this.objs[res] = new prBase(); 
	this.objs[res].saP(x* this.cxw, y*this.cxh); 
	this.objs[res].g = this.currentGroup;
	++this.objCount; 
	return res;
}
prPage.prototype.addGivenPoint = prPage.prototype.given; 
prPage.prototype.point = prPage.prototype.given; 


// two points only.
prPage.prototype.line = function(ob1, ob2) {
	var res = this.objCount;
	if (this.isAPoint(ob1)==0) { console.log("addLine: argument 1 is not a point"); res=0; }
	if (this.isAPoint(ob2)==0) { console.log("addLine: argument 2 is not a point"); res=0; }
	if (res===this.objCount) {
		this.objs[res] = new prBase;
		this.objs[res].saL(this.objs[ob1].x, this.objs[ob1].y, this.objs[ob2].x, this.objs[ob2].y);
		this.objs[res].g = this.currentGroup;
		++this.objCount;
	}
	return res;
}
prPage.prototype.addLine = prPage.prototype.line; 


// two points only.
prPage.prototype.circle = function(ob1, ob2) {
	var res = this.objCount;
	if (this.isAPoint(ob1)==0) { console.log("addCircle: argument 1 is not a point"); res=0; }
	if (this.isAPoint(ob2)==0) { console.log("addCircle: argument 2 is not a point"); res=0; }
	// can't make a circle out of coincident points, but sAC checks that.
	if (res===this.objCount) {
		this.objs[this.objCount] = new prBase;
		this.objs[this.objCount].saC(this.objs[ob1].x, this.objs[ob1].y, this.objs[ob2].x, this.objs[ob2].y);
		this.objs[res].g = this.currentGroup;
		++this.objCount;
	}
	return res;
}
prPage.prototype.addCircle = prPage.prototype.circle; 


// line plus p1p2
prPage.prototype.segment = function(ob, t1in, t2in) {
	var res = this.objCount; 
	if (this.isALine(ob)==0) { console.log("addSegment: argument 1 is not a line"); res=0; }
	if (res===this.objCount) {  // 0<ob<objCount
		res = this.objCount;
		this.objs[res] = new prBase;
		this.objs[res].saS(this.objs[ob], t1in, t2in);
		this.objs[res].g = this.currentGroup;
		++this.objCount;
	}
	return res;
}
prPage.prototype.addSegment = prPage.prototype.segment;


// circle plus p1p2
prPage.prototype.arc = function(ob, t1in, t2in) {
	var res = this.objCount; 
	if (this.isACircle(ob)==0) { console.log("addArc: argument 1 is not a circle"); res=0; }
	if (res===this.objCount) {  // 0<ob<objCount
		res = this.objCount;
		this.objs[res] = new prBase;
		this.objs[res].saA(this.objs[ob], t1in, t2in);
		this.objs[res].g = this.currentGroup;
		++this.objCount;
	}
	return res;
}
prPage.prototype.addArc = prPage.prototype.arc;




// intersection returns 0, 1, or 2 points.
// the "first" one is the one "closest" to target.
// returns the point of intersection not returned by cI.
// can also return NULL.
prPage.prototype.first = function( ob1,  ob2,  target) {
	var res = this.objCount; 
	if (this.isAnObject(ob1)==0) { console.log("addFirstIntersection: argument 1 is not intersectable"); res=0; }
	if (this.isAnObject(ob2)==0) { console.log("addFirstIntersection: argument 2 is not intersectable"); res=0; }
	if (this.isAPoint(target)==0) { console.log("addFirstIntersection: argument 3 is not a point"); res=0; }
	if (res===this.objCount) { 
		this.objs[res] = new prBase;
		this.objs[res].saFI(this.objs[ob1], this.objs[ob2], this.objs[target]);
		this.objs[res].g = this.currentGroup;
		if (this.objs[res].t===PR_N) {
			res = 0; 
		} else { 
			++this.objCount;
		}
	}
	// whichever is closer, add that to the figure.
	return res;
}
prPage.prototype.addFirstIntersection = prPage.prototype.first;


prPage.prototype.second = function( ob1,  ob2,  target) {
	var res = this.objCount; 
	if (this.isAnObject(ob1)==0) { console.log("addSecondIntersection: argument 1 is not intersectable"); res=0; }
	if (this.isAnObject(ob2)==0) { console.log("addSecondIntersection: argument 2 is not intersectable"); res=0; }
	if (this.isAPoint(target)==0) { console.log("addSecondIntersection: argument 3 is not a point"); res=0; }
	if (res===this.objCount) { 
		this.objs[res] = new prBase;
		this.objs[res].saSI(this.objs[ob1], this.objs[ob2], this.objs[target]);
		this.objs[res].g = this.currentGroup;
		if (this.objs[res].t===PR_N) {
			res = 0; 
		} else { 
			++this.objCount;
		}
	}
	// whichever is closer, add that to the figure.
	return res;
}
prPage.prototype.addSecondIntersection = prPage.prototype.second;


// points on lines or circles-- an abuse? Euclid did not have this.
prPage.prototype.parametric = function( obj,  t) {
	var res = this.objCount; 
	if (this.isAnObject(obj)==0) { console.log("addParametricPoint: argument 1 is not intersectable"); res=0; }
	if (res===this.objCount) { 
		this.objs[res] = new prBase;
		this.objs[res].saPm(this.objs[obj], t);
		this.objs[res].g = this.currentGroup;
		if (this.objs[res].t===PR_N) {
			res = 0; 
		} else { 
			++this.objCount;
		}
	}
	return res;
}
prPage.prototype.addParametricPoint = prPage.prototype.parametric;


prPage.prototype.closestPointParam = function(obj, pt) {
	return this.objs[obj].cPP(this.objs[pt]); 
}


prPage.prototype.getBase= function ( which) { 
	return this.objs[which];
}


// given two marks, loft between them
// the other fucntions modify the page; this one just draws.
prPage.prototype.loft = function(m1in, m2in, color) {
	var m1, m2, dt1, dt2, bt1, bt2, t1, t2, dt, sc; 
	m1 = new prBase; 
	m2 = new prBase; 

	this.cx.fillStyle = color;	
	m1.cp(this.objs[m1in]); 
	m2.cp(this.objs[m2in]); 
	
	
	sc = m1.sc;
	if (m2.sc>m1.sc) {
		sc= m2.sc;
	}
	dt = 1.0/sc;
	dt1 = (m1.t2 - m1.t1)/sc; 
	dt2 = (m2.t2 - m2.t1)/sc; 
	bt1 = dt1*1.05; 
	bt2 = dt2*1.05; 
	
	for (n=0; n<sc; ++n) {
		t1 = m1.t1 +(n * dt1); 
		t2 = m2.t1 +(n * dt2); 
		
		this.cx.beginPath(); 
		
		if (m1.t == PR_S) { 
			this.cx.moveTo(m1.sX(t1), m1.sY(t1));
		} else {
			this.cx.moveTo(m1.aX(t1), m1.aY(t1));
		}
		if (n<(sc-1)) { 
			if (m2.t == PR_S) { 
				this.cx.lineTo(m2.sX(t2), 		m2.sY(t2));
				this.cx.lineTo(m2.sX(t2+bt2), 	m2.sY(t2+bt2));
			} else {
				this.cx.lineTo(m2.aX(t2), 		m2.aY(t2));
				this.cx.lineTo(m2.aX(t2+bt2), 	m2.aY(t2+bt2));
			}
			
			if (m1.t == PR_S) { 
				this.cx.lineTo(m1.sX(t1+bt1), 	m1.sY(t1+bt1));
			} else {
				this.cx.lineTo(m1.aX(t1+bt1), 	m1.aY(t1+bt1));
			}
		} else { 
			if (m2.t == PR_S) { 
				this.cx.lineTo(m2.sX(t2), 		m2.sY(t2));
				this.cx.lineTo(m2.sX(t2+dt2), 	m2.sY(t2+dt2));
			} else {
				this.cx.lineTo(m2.aX(t2), 		m2.aY(t2));
				this.cx.lineTo(m2.aX(t2+dt2), 	m2.aY(t2+dt2));
			}
			
			if (m1.t == PR_S) { 
				this.cx.lineTo(m1.sX(t1+dt1), 	m1.sY(t1+dt1));
			} else {
				this.cx.lineTo(m1.aX(t1+dt1), 	m1.aY(t1+dt1));
			}
		}
		this.cx.fill(); 
	}
}















