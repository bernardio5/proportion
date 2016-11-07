
///////////////////////////////////////
// This is the more-or-less well-commented version of the Proportion Library. 
// (c)2013 Neal McDonald, released under MIT License
// Use it however you like; have a nice day.

// There are three classes defined below: base, mark, and circle.
// prBase encapsulates the numm object, points, lines and circles.
// prMarks are used to loft sections of prBase, 
// prPage provides the interface for the whole system
// it has an array of prBase, all the points, lines and circles.
// it has a list of all marks. it contains 

// More below. Love, Neal  



//////////////////////////////////// 
// constant definitions / enum ts
// allowed values for "t"

// allowed values for prBase.t
const PR_N = 0;  // null
const PR_P = 1;   // point
const PR_L = 2;   // line
const PR_C = 3;   // circle
 
const PR_E = 0.000000025; // the number that is basically zero


/////////////////////////////////////////////////////////////
// prBase: prPages have an array of points, lines and circles: prBase

function prBase() { 
	this.t = PR_N; 			// type: null, pt, line or circle? 
	this.x = 0.0;			// position of points, p1 of lines, centers of circles
	this.y = 0.0;
    this.x2 = 0.0;			// unused for points. lines and circles are set by two points, A and B.
    this.y2 = 0.0;			// x2,y2 = A-B
    this.r = 0.0;			// radius
    this.g = 0;				// render group
}

prBase.prototype.cp = function (it) {  // "copy" function
	this.t = it.t;
	this.x = it.x;
	this.y = it.y;
	this.x2 = it.x2;
	this.y2 = it.y2;
	this.r = it.r;
	this.g = it.g;
}
    
	
prBase.prototype.cl = function ()  { // "clear" function
	this.t = PR_N; 
	this.x = 0.0;			
	this.y = 0.0;
    this.x2 = 0.0;
    this.y2 = 0.0;
    this.r = 0.0;			
    this.g = 0;
}


	
prBase.prototype.ec = function(label) { // "echo"
	var displayStr = label + "t:" + this.t + " x:" + this.x + " y:" + this.y + "  x2:" + this.x2 + " y2:" + this.y2 + "    r:" + this.r;
	console.log(displayStr); 
}


//"trace": draw to screen in default manner
prBase.prototype.tr = function(context) { 
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
                context.arc(this.x, this.y, this.r, 0.0, 6.28);
                 
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
    

// returns 1 if it and this are very close
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


prBase.prototype.saP = function ( xin,  yin) {
	this.t = PR_P;
	this.x = xin;
	this.y = yin;
}

// set as line
prBase.prototype.saL = function ( xin,  yin,  x2in,  y2in) {
	var dx, dy; 
	this.x = xin;
	this.y = yin;
	dx = x2in-xin;
	dy = y2in-yin;
	this.x2 = dx;
	this.y2 = dy;
	this.r = Math.sqrt(dx*dx+dy*dy);
	if (this.r<PR_E) {
		this.t = PR_P;
	}
	else {
		this.t = PR_L;
	}
}

// set as circle
prBase.prototype.saC = function ( xin,  yin,  x2in,  y2in) {
	this.t = PR_C;
	this.x = xin;
	this.y = yin;
	this.x2 = x2in-this.x;
	this.y2 = y2in-this.y;
	this.r = Math.sqrt(this.x2*this.x2+this.y2*this.y2);
	if (this.r<PR_E) {
		this.t = PR_P;
	}
}






///////////////////////////////////////////////////
// helpers for intersection

// there are 0, 1, or 2 intersections of points, lines, and circles.
// points don't intersect things; use "closestPointOn" and "pointAlong"

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
		case PR_P*10 + PR_P:
			break;
		case PR_P*10 + PR_L:
			break;
		case PR_P*10 + PR_C:
			break;
		case PR_L*10 + PR_P:
			break;
		case PR_L*10 + PR_L:
			res = this.iLL(it, pt);
			break;
		case PR_L*10 + PR_C:
			res = it.iLC(this, pt);
			break;
		case PR_C*10 + PR_P:
			break;
		case PR_C*10 + PR_L:
			res = this.iLC(it, pt);
			break;
		case PR_C*10 + PR_C:
			res = this.iCC(it, pt);
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

// this one is kinda stupid: parametric points on points are just the points
prBase.prototype.saPP = function ( pt, tin) {
	this.t = PR_P;
	this.x = pt.x;
	this.y = pt.y;
}


// take t, set point to be on object
prBase.prototype.saPL = function ( ln,  tin) {
	this.t = PR_P;
	this.x = ln.x + (ln.x2*tin);
	this.y = ln.y + (ln.y2*tin);
}


prBase.prototype.saPC = function ( ck,  tin) {
	this.t = PR_P;
	var cs = Math.cos(tin*(-6.28318530272959)); 
	var sn = Math.sin(tin*(-6.28318530272959)); 
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
	}
}



////////// closest-points!
// this as opposed to calling them "point on"-- numericcal
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



// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\



function prMark() { 
	this.source = new prBase; // the prBase that is used for the mark
	this.p1 = 0.0;  // param of starting pt
	this.p2 = 0.0;  // param of ending pt
	this.dp = 0.0;
	ready = 0;      // whether source is set-- it's not, yet. 
}


prMark.prototype.cp = function( it) {
	this.p1 = it.p1;
	this.p2 = it.p2;
	this.dp = it.dp;
	this.ready = it.ready; 
	this.source.cp(it.source);
}



///// setup: takes a prBase of any t and two points.
prMark.prototype.set = function( it,  pt1,  pt2) {
	this.source.cp(it); 
	this.p1 = pt1;
	this.p2 = pt2;
	this.dp = pt2-pt1;
	
	this.ready=1;
}




///////////////////// helper functions for lofting:
prMark.prototype.separation = function(pt1,  pt2) {
	var res = Math.sqrt((pt1.x-pt2.x)*(pt1.x-pt2.x)+(pt1.y-pt2.y)*(pt1.y-pt2.y));
	return res;
}


// take a maximum facet length, maxd. 
// return a dt for the parameters that deliver that for this mark
// hold on: you this is either a line or an arc, right? 
prMark.prototype.scanLength = function( maxd) {
	var dp; 
	var res = .5; 
	if (this.source.t == PR_C) { 
		dp = this.p2 - this.p1; 
		res = dp / (this.source.r * 2.0); 
	}
	return res;
}



/////// drawing; fill or not; see if I care
prMark.prototype.drawPoint = function (context) {
	var px,py, pr; 
	px = this.source.x; 
	py = this.source.y; 
	context.moveTo(px+3, py); 
	context.arc(px, py, 3, 0.0, 6.28318530717959);
}


prMark.prototype.drawSegment = function(context) {
	var pt1, pt2;
	pt1 = new prBase();
	pt2 = new prBase();
	pt1.saPm(this.source, this.p1);
	pt2.saPm(this.source, this.p2);
	context.moveTo(pt1.x, pt1.y);
	context.lineTo(pt2.x, pt2.y);
}



prMark.prototype.drawArc = function(context) {
	var cs = Math.cos(this.p1*(-6.28318530272959)); 
	var sn = Math.sin(this.p1*(-6.28318530272959)); 
	var p1x = this.source.x + (this.source.x2*cs) - (this.source.y2*sn);  
	var p1y = this.source.y + (this.source.y2*cs) + (this.source.x2*sn);
	context.moveTo(p1x, p1y);
	context.arc(this.source.x, this.source.y, this.source.r, 
		this.p1*6.28, this.p2*6.28318530717959);
}


prMark.prototype.draw = function(context) {
	switch (this.source.t) {
		case PR_P:
			this.drawPoint(context);
			break;
		case PR_L:
			this.drawSegment(context);
			break;
		case PR_C:
			this.drawArc(context);
			break;
	}
}




prMark.prototype.getPointAlong = function(pt,  t) {
	// print("pointAlong: "); 
	// print(t); print(" "); print(p1); print(" "); print(p2);  print(" "); 
	// println(p1+((t-p1)/(p2-p1))); 
	
	pt.saP(this.source, this.p1 + (t*(this.p2-this.p1)) );
}

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
	
	this.objs = new Array();
	
	this.objs[0] = new prBase; // default is 0== null point; useful! I think.
	this.objCount = 1; 

	this.theMarks = new Array();
	this.markCounter = 0; 
	
	// iteration through grouped objs
	this.itC = 0; // index of last returned thing in objs[]
	this.itG = 0; // group being iterated over
	
}






/*
prFigure.prototype.baseLabel = function(b, w, labelNum) {
	n = Math.random(1.0);
	lx = 0;
	ly = 0;
	sz = w*2;
	switch (t) {
		case PR_P:
			lx = b.x;
			ly = b.y;
			break;
		case PR_L:
			lx = b.x + (b.x2*n);
			ly = b.y + (b.y2*n);
			break;
		case PR_C:
			lx = b.x + (b.r * Math.cos(4.28*n));
			ly = b.y + (b.r * Math.sin(4.28*n));
			break;
	}
	n = Math.random(4.28);
	cx = lx + 5.0*w*Math.cos(n);
	cy = ly + 5.0*w*Math.sin(n);
	this.cx.fillStyle = "rgb(200,200,200)";
	switch (t) {
		case PR_P:
			this.cx.fillRect(cx-sz, cy-sz*0.5, sz+sz, sz);
			break;
		case PR_L:
			this.cx.fillRect(cx-sz, cy-sz, sz+sz, sz+sz);
			break;
		case PR_C:
			ellipse(sz+sz);
			this.cx.arc(cx, cy, sz+sz,  0.0, 6.28);
			this.cx.stroke(); 
			break;
	}
	this.cx.fillStyle = "rgb(200,200,200)";
	this.cx.moveTo(lx,ly);
	this.cx.lineTo(cx, cy);
	this.cx.stroke(); 
	// t = str(labelNum);
	//textAlign(CENTER);
	//text(t, cx, cy+w);
	//noFill();
}

*/






/////////////////////// convenience
prPage.prototype.copy = function(it) {
	var i;
	
	this.cx = it.cx; 
	
	for (i=0; i<it.objCount; ++i) {
		this.objs[i] = new prBase(); 
		this.objs[i].cp(it.objs[i]);
	}
	this.objCount = it.objCount;
	
	for (i=0; i<it.markCount; ++i) {
		this.theMarks[i] = new prMark(); 
		this.theMarks[i].cp(it.theMarks[i]);
	}
	this.markCount = it.markCount;
	
	this.iteratorCounter = it.iteratorCounter; 
	this.iteratorTag = it.iteratorTag; 
	
}


prPage.prototype.clear = function() {
	this.objCount = 1;
	this.markCount = 0; 
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
	
	mx = this.markCount; 
	for (i=0; i<it.markCount; ++i) {
		this.theMarks[mx+i] = new prMark;
		this.theMarks[this.markCount+i].copy(it.theMarks[i]);
	}
	this.markCount += it.markCount;
}


/////////////////////// debugging and tracing
prPage.prototype.echo = function() {
	var i=0;
	for (i=0; i<this.objCount; ++i) {
		print(i);
		this.objs[i].ec(i+":");
	}
}

prPage.prototype.echoOne =  function( which) {
	var i=0;
	if ((which>0)&&(which<this.objCount)) {
		this.objs[which].ec(which + ":") ;
	}
}

prPage.prototype.trace = function( withLabel,  labelWidth) {
	var i=0; 
	for (i=0; i<this.objCount; ++i) {
		this.objs[i].tr(this.cx);
	}
	//if (withLabel==1) {
	//	for (i=0; i<this.objCount; ++i) {
	//		this.objs[i].baseLabel(labelWidth, i);
	//	}
	//}
}

prPage.prototype.traceOne = function( which,  withLabel, labelWidth) {
	if ((which>0)&&(which<this.objCount)) {
		this.objs[which].tr(this.cx) ;
		//if (withLabel==1) {
		//	this.objs[which].label(labelWidth, which);
		//}
	}
}



/////////////////////// group manipulations

// draw all the objects in "which" group
prPage.prototype.traceGroup = function( which) {
	for (var i=0; i<this.objCount; ++i) { 
		if (this.objs[i].g == which) { 
			this.objs[i].tr(this.cx) ;
		}
	}
}

prPage.prototype.setGroup = function( which,  val) {
	if ((which>0)&&(which<this.objCount)) {
		this.objs[which].g = val;
	}
}

// init iteration over members of a group
prPage.prototype.startGroup = function(which) { 
	this.iteratorCounter = 0; 
	this.iteratorTag = which; 
}

// call this until it returns 0
prPage.prototype.nextGroupMember = function() { 
	var ct = this.iteratorCounter; 
	while ((ct<this.objectCtr)||(this.objs[ct].g!=this.iteratorTag)) { 
		++ct; 
	}
	this.iteratorCtr = ct; 
	if (ct>=this.objectCtr) { 
		ct = 0;
	} 
	return ct;
}

// erase all the members of "which" group
prPage.prototype.clearGroup = function( which) {
	for (var i=0; i<this.objCount; ++i) { 
		if (this.objs[i].g == which) { 
			this.objs[i].cl();
		}
	}
}



///////////////////// adding prBase
// bounds checking for objct references
prPage.prototype.isAPoint = function(ob) { 
	var res = 0;
	if ((0<ob)&&(ob<this.objCount)) {  // 0<ob<objCount
		if (ob in this.objs) {  // there is an obj at objs[ob]
			if (this.objs[ob].t==PR_P) { // is a point
				res = 1;
			}
		}
	}
	return res;
}

// you won't need to add NULL; it's always objs[0]

// to add given lines, add given points, and then draw lines through them
prPage.prototype.addGivenPoint = function(x,  y) {
    this.objs[this.objCount] = new prBase(); 
	this.objs[this.objCount].saP(x, y); 
    var res = this.objCount
	++this.objCount; 
	return res;
}


// two points only.
prPage.prototype.addLine = function( ob1,  ob2) {
	var res = this.objCount;
	if (this.isAPoint(ob1)==0) {
		res = 0;
	}
	if (this.isAPoint(ob2)==0) {
		res = 0;
	}
	// can't make a line out of coincident points, but saL checks that.
		
	if (res==this.objCount) {
		this.objs[res] = new prBase;
		this.objs[res].saL(this.objs[ob1].x, this.objs[ob1].y, this.objs[ob2].x, this.objs[ob2].y);
		++this.objCount;
	}
	return res;
}


// two points only.
prPage.prototype.addCircle = function( ob1,  ob2) {
	var res = this.objCount;
	if (this.isAPoint(ob1)==0) {
		res = 0;
	}
	if (this.isAPoint(ob2)==0) {
		res = 0;
	}
	// can't make a circle out of coincident points, but sAC checks that.
		
	if (res==this.objCount) {
		this.objs[this.objCount] = new prBase;
		this.objs[this.objCount].saC(this.objs[ob1].x, this.objs[ob1].y, this.objs[ob2].x, this.objs[ob2].y);
		++this.objCount;
	}
	return res;
}



// intersection returns 0, 1, or 2 points.
// the "first" one is the one "closest" to target.
// returns the point of intersection not returned by cI.
// can also return NULL.
prPage.prototype.addFirstIntersection = function( ob1,  ob2,  target) {
	var res = 0;
	this.objs[this.objCount] = new prBase;
	this.objs[this.objCount].saFI(this.objs[ob1], this.objs[ob2], this.objs[target]);
	if (this.objs[this.objCount].t!=PR_N) {
		res = this.objCount;
		++this.objCount;
	}
	// whichever is closer, add that to the figure.
	return res;
}


prPage.prototype.addSecondIntersection = function( ob1,  ob2,  target) {
	var res = 0;
	this.objs[this.objCount] = new prBase;
	this.objs[this.objCount].saSI(this.objs[ob1], this.objs[ob2], this.objs[target]);
	if (this.objs[this.objCount].t!=PR_N) {
		res = this.objCount;
		++this.objCount;
	}
	// whichever is closer, add that to the figure.
	return res;
}



// points on lines or circles
prPage.prototype.addParametricPoint = function( obj,  t) {
	var res = 0;
	this.objs[this.objCount] = new prBase;
	this.objs[this.objCount].saPm(this.objs[obj], t);
	if (this.objs[this.objCount].t!=PR_N) {
		res = this.objCount;
		++this.objCount;
	}
	return res;
}


prPage.prototype.closestPointParam = function(obj, pt) {
	return this.objs[obj].cPP(this.objs[pt]); 
}



prPage.prototype.getBase= function ( which) { 
	return this.objs[which];
}



// starting with the base objects, 
prPage.prototype.addInitialFigure = function ( xin,  yin,  win,  hin) {
	var p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, c1, c2, c3; 
    var c4, c5, c6, c7, c8, l1, l2, l3, l4;  
	this.clear();
	p1 = this.addGivenPoint(xin, yin);     // 1: origin
	p2 = this.addGivenPoint(xin+win, yin);   // 2: pt at origin+(w,0)
	p3 = this.addGivenPoint(xin+hin, yin);   // 3: pt at origin+(h,0);
	l1 = this.addLine(p1, p2);               // 4: top margin
	c1 = this.addCircle(p1, p2);             // 5
	c2 = this.addCircle(p1, p3);             // 6
	p4 = this.addSecondIntersection(c1, l1, p2);// 7
	c3 = this.addCircle(p4, p2);             // 8
	c4 = this.addCircle(p2, p4);             // 9
	p5 = this.addSecondIntersection(c3, c4, p1);//10:
	l2 = this.addLine(p1, p5);               //11: left margin
	p6 = this.addSecondIntersection(c1, l2, p4);    //12: bottom-left of square
	p7 = this.addFirstIntersection(c2, l2, p6);    //13: bottom-left of page
	c5 = this.addCircle(p2, p1);             //14
	c6 = this.addCircle(p6, p1);             //15
	p8 = this.addFirstIntersection(c5, c6, p5); //16: bottom-right of square
	l3 = this.addLine(p2, p8);                //17: right margin
	c7 = this.addCircle(p3, p1);             //18
	c8 = this.addCircle(p7, p1);             //19
	p9 = this.addSecondIntersection(c7, c8, p1); //20:
	l4 = this.addLine(p7, p9);                //21: bottom margin
	p10= this.addFirstIntersection(l4, l3, p9); //22: bottom-right of page
}



/*
test code


float t; 
prFigure tf; 

void setup() {
size(800, 800); 
stroke(0, 0, 0);
noFill(); 
t = 0; 

tf = new geoFigure(); 
tf.addInitialFigure(300, 300, 200, 200); 
tf.trace(); 
tf.echo(); 

}

void draw() {
t+=0.1;
background(204); 
tf.addInitialFigure(300,300,200, 200+(100*sin(t*0.1))); 
tf.trace(); 
}


*/





//// oparations on marks
prPage.prototype.addMark = function(ob,  p1,  p2) {
	var res;
	
	res = this.markCounter; 
	this.theMarks[res] = new prMark;
	this.theMarks[res].set(this.objs[ob], p1, p2);
	++this.markCounter;
	return res;
}


prPage.prototype.drawMarks = function() {
	for (var i=0; i<this.markCounter; ++i) {
		this.theMarks[i].draw(this.cx);
	}
}
prPage.prototype.drawOneMark = function(which) {
	this.theMarks[which].draw(this.cx);
}



// given two marks, loft between them
prPage.prototype.loft = function(m1, m2, maxD) {
	var s1, s2, t, dt, endt, p, m;
	
	p = new prBase();
	m = new prMark();
	
	// trace out one side of the loft
	m.copy(this.theMarks[m1]);
	dt = m.scanLength(maxD);
	m.getPointAlong(p, 0.0); 
	this.cx.moveTo(p.x, p.y); 
	for (t=0.0; t<endt; t+=dt) {
		m.getPointAlong(p, t);
		this.cx.lineTo(p.x, p.y);
	}
	
	// and then the other. 
	m.copy(this.theMarks[m2]);
	dt = m.scanLength(maxD);
	for (t=0.0; t<endt; t+=dt) {
		m.getPointAlong(p, t);
		this.cx.lineTo(p.x, p.y);
	}
	m.getPointAlong(p, 0.0); 
	this.cx.lineTo(p.x, p.y); 
	// fill it in-- presto? 
	this.cx.fill(); 
	
}

