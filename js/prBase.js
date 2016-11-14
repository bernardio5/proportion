
///////////////////////////////////////
// This is the more-or-less well-commented version of the Proportion Library. 
// (c)2013 Neal McDonald, released under MIT License
// Use it however you like; have a nice day.

// prBase encapsulates points, lines and circles, which are used to build figures, 
//   and segments and arcs, which are used to fill in areas. 

// prPage provides the interface for the whole system, and contains all the prBase. 
// The prBase member function names are quite terse; they should not be called by the user.
// *** prPage IS THE INTERFACE **** DON'T CALL prBase functions!!! ***

// coords: the page takes normalized coords; 0,0 is top-left, and 1,1 is bottom-right. 
// canvas aspect ratio might impact construction success; caveat aedicicator. 

// More below. NM



//////////////////////////////////// 
// constant definitions / enum ts
// allowed values for "t"

// allowed values for prBase.t
const PR_N = 0;  // null
const PR_P = 1;  // point
const PR_L = 2;  // line
const PR_C = 3;  // circle
const PR_T = 4;  // parameter -- a float, stored in t1
const PR_S = 5;  // segment -- part of a line, to be drawn
const PR_A = 6;  // arc -- part of a circle, to be drawn

// nulls, points, lines and circles make up constructions.
// parameters give points on constructions.
// segments and arcs are used to fill in regions; 
//        they don't add to constructions.

const PR_E = 0.000000025; // the number that is basically zero
const PR_2P = 6.28318530272959; // Math.PI * 2


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
	this.t1 = 0.0; 			// parameters, for arcs and segments
	this.t2 = 0.0; 			// start at t1, go to t2. parameter range if the reals. 
	this.sc = 1.0; 			// step size for lofting. ==1 except for arcs; r*dt otherwise. 
}


prBase.prototype = { 

	cp: function (it) {  // "copy" function
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
	},
    
		
	cl: function ()  { // "clear" function
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
	},



	ec: function(label) { // "echo"
		var displayStr = label + "t:" + this.t + " x:" + this.x + " y:" + this.y + "  x2:" + this.x2 + " y2:" + this.y2 + "    r:" + this.r;
		console.log(displayStr); 
	},


	///////////// Mark-rendering helper functions
	sX: function(u) { // segment X coord for parameter u
		return this.x + (this.x2*u);  
	},

	sY: function(u) { // segment y coord
		return this.y + (this.y2*u);  
	},

	aX: function(u) { // arc X coord for parameter u
		return this.x + (this.r*Math.cos(u*PR_2P*-1.0));  
	},

	aY: function(u) { // arc Y
		return this.y + (this.r*Math.sin(u*PR_2P*-1.0));  
	},



	//"trace": draw to screen in default manner
	tr: function(context) { 
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
				// don't rendere parameters
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
	},
	    
	/*
	label: function(w, labelNum) {
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
	},
	*/
	        
	    
	    
	/////////////////// ops on points
	    
	// returns 1 if "this" is a point
	isaP: function () {
		var res = 0;
		if (this.t == PR_P) {
			res = 1;
		}
		return res;
	},
	    

	// returns 1 if points it and this are very close
	// note: doesn't check type. 
	eqP: function (it) {
		var dx, dy, len; 
		var res = 0;
		dx = this.x-it.x;
		dy = this.y-it.y;
		len = dx*dx+dy*dy;
		if (len<PR_E) {
			res=1;
		}
		return res;
	},



	///////////////////////////////////////////////////
	// set as point
	// there are many functions that "set (this) as X"


	saP: function (xin, yin) {  // set as point
		this.t = PR_P;
		this.x = xin;
		this.y = yin;
		// the other members are set by the constructor
	},

	// set as line
	saL: function (xin, yin, x2in, y2in) {
		this.t = PR_L;
		this.x = xin;
		this.y = yin;
		this.x2 = x2in-this.x;
		this.y2 = y2in-this.y;
		this.r = Math.sqrt(this.x2*this.x2+this.y2*this.y2);
		if (this.r<PR_E) { // if the two points are the same, make a point
			this.t = PR_P;
		}
	},

	// set as circle
	saC: function (xin, yin, x2in, y2in) {
		this.t = PR_C;
		this.x = xin;
		this.y = yin;
		this.x2 = x2in-this.x;
		this.y2 = y2in-this.y;
		this.r = Math.sqrt(this.x2*this.x2+this.y2*this.y2);
		if (this.r<PR_E) { // points same? return a point.
			this.t = PR_P;
		}
	},


	// set as segment
	saS: function (lineIn, t1in, t2in) {
		this.cp(lineIn); 	// copy the input line
		this.t = PR_S; 		// then tweak. 
		this.t1 = t1in; 
		this.t2 = t2in; 
	},

	// set as arc
	saA: function (circleIn, t1in, t2in) {
		this.cp(circleIn);  // start out as a a circle
		this.t = PR_A; 
		
		// parameters t1 and t2 are set to make the routines "aX"
		// and "aY" fast. t1 & t2 are stored as radians.
		// I want the grade-school norm of increasing angles going ccw. 
		// The 0 angle is based on the direction stored in x2y2. 
		// Also, JS makes (0,0) the top-left corner, with y-axis pointing down. 
		// This coord system is fucked up. 
		// This is the code where I unfuck. 
		
		// determine the 0 angle from (x2,y2)
		var w = Math.acos(this.x2/this.r);  
		if (this.y2<0.0) { w = PR_2P - w; }
		
		this.t1 = t1in + (w/PR_2P); 
		this.t2 = t2in + (w/PR_2P);  
		
		// note: could be <0!
		this.sc = (t2in-t1in)*this.r*0.5; 
		if (this.sc<0.0) { this.sc = 0.0-this.sc; }
		this.sc = Math.ceil(this.sc); 
	},






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
	closer: function ( ob1,  ob2,  ob3) {
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
	},



	/// iLL, iLC, and iCC intersect this and an input prBase with each other. 
	// they return an integer (the number of intersections), and a special, 
	// abused prBase that has the first intersection in x,y and the second in x2, y2

	// intersect self, as a line, with the input line; set pt if there is one
	// the algorithm is from Mathematica notebook, included as linelineA.jpg
	iLL: function ( line,  pt) {
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
	},


	// intersect self, as circle, with line
	// from Mathematica Notebook, lineCircle.jpg
	iLC: function ( line,  pt) {
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
	},


	// intersect self, as circle, with circle
	// circcirc.jpg, Mathematica Notebook
	iCC: function (cr,  pt) {
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
	},


	// returns 0 if there is no (new) point, ow= the number of intersection points: 1 or 2.
	// prFigure uses "closer" to choose which is first and which second.
	intersect: function (it,  pt) {
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
	},


	// set as first intersection
	saFI: function (obj1,  obj2,  target) {
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
	},

	// set as second intersection
	saSI: function (obj1,  obj2,  target) {
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
	},


	/////////////// parametrics
	// set self to be a point on another prBase

	// this one is kinda stupid. 
	saPP: function ( pt, tin) {
		this.t = PR_P;
		this.x = pt.x;
		this.y = pt.y;  
		// tin is ignored; parametric points from points = the point
	},


	// take t, set point to be on object
	saPL: function ( ln,  tin) {
		this.t = PR_P;
		this.x = ln.x + (ln.x2*tin);
		this.y = ln.y + (ln.y2*tin);
	},


	saPC: function ( ck,  tin) {
		this.t = PR_P;
		var cs = Math.cos(tin*-1.0*PR_2P); // 0->1 goes around the circle once; 
		var sn = Math.sin(tin*-1.0*PR_2P); // radians are rude, if you're not a physisist. 
		this.x = ck.x + (ck.x2*cs) - (ck.y2*sn);  // p2 is pt for t=0
		this.y = ck.y + (ck.y2*cs) + (ck.x2*sn);
	},


	// set as parametric point
	saPm: function (ob,  tin) {
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
	},


	// taking a prBase of type PR_T. 
	saPmO: function(ob, tob) { 
		this.saPm(ob, tob.t1); 
	},


	// take a maximum facet length, maxd. 
	// return a dt for the parameters that deliver that  
	scanLength: function(maxd) {
		var dp; 
		var res = (maxd / this.r); 
		if (this.t == PR_A) { 
			res /= PR_2P; 
		}
		res *= (this.t2 - this.t1); 
		return res;
	},



	////////// closest-points!
	// this as opposed to calling them "point on"-- numerical
	// self is line or circle; returns parameter of point on object closest to

	// "closest point on line"
	// return the parameter of the point on the object closest to p
	cpoL: function ( pt) {
		var dx, dy; 
		var res = 0.0;
		if (this.r>PR_E) {
			dx = pt.x - this.x;
			dy = pt.y - this.y;
			res = ((dx*this.x2) + (dy*this.y2))/(this.r*this.r); // a parameter, but an incorrect one
		} // else self is not really a line; problematic! and t should==0
		return res;
	},

	// "closest point on circle"
	cpoC: function ( pt) {
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
	},


	// "closest parametric point"
	// it is the thing being used to position the point
	cPP: function ( pt) {
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
	},


	// as cPP, but returning a PR_T 
	saCPP: function(ob, pt) {
		this.t = PR_T;
		this.t1 = ob.cPP(pt);
	},




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



}








