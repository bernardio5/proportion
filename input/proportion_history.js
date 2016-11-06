
///////////////////////////////////////
// This is the more-or-less well-commented version of the Proportion Library. 
// (c)2013 Neal McDonald, released under MIT License
// Use it however you like; have a nice day.

// There are four classes defined below: base, figure, mark, and circle.
// prBase encapsulates the numm object, points, lines and circles.
// prFigure manipulates prBase, has an array of them, intersects them
// prMarks are used to loft sections of prBase, 
// prPage provides the interface for the whole system and has an array of marks. 

// More below. Love, Neal  



//////////////////////////////////// 
// constant definitions / enum types
// allowed values for "type"

// allowed values for prBase.type
const PR_NULL = 0;
const PR_POINT = 1;
const PR_LINE = 2;
const PR_CIRCLE = 3;
    
// allowed values for prBase.creationOp
const PR_GIVEN = 10;           // not generated from other prBase
const PR_FIRST_INT = 13;       // this point is the "first" intersection of inA,B,C
const PR_SECOND_INT = 14;      // this point is the second intersection
const PR_PARAMETRIC = 15;      // this point's location on inA is given by t
const PR_ADDLINE = 16;         // this line is through points inA and inB
const PR_ADDCIRCLE = 17;       // this circle has center inA and goes through inB

// added to enable all manipulations via command
const PR_SET_G = 21;     
const PR_SET_PARAMETER = 22;       //
// these should be the only ways to add to a figure
    
const PR_EPSILON = 0.000000025; // the number that is basically zero

  
    

	/////////////////////////////////////////////////////////////
	/// constructor

function prBase() { 
	this.type = PR_NULL; // null, pt, line or circle? 
	this.creationOp = PR_NULL;  // how ou were created; allows updates
	this.inA = PR_NULL;     // inputs for the creation op
    this.inB = PR_NULL;
    this.inC = PR_NULL;
    this.t = 0.0;			//  parameter
    this.generation = 0;   // how far-removed from a given pt
    this.x = 0.0;			// position
	this.y = 0.0;
    this.x2 = 0.0;
    this.y2 = 0.0;
    this.r = 0.0;			// radius
    this.group = 0;				// render group
}

prBase.prototype.copy = function (it) {
	this.type = it.type;
	this.generation = it.generation;
	this.inA = it.inA;
	this.inB = it.inB;
	this.inC = it.inC;
	this.creationOp = it.creationOp;
	this.x = it.x;
	this.y = it.y;
	this.x2 = it.x2;
	this.y2 = it.y2;
	this.r = it.r;
	this.t = it.t;
	this.group = it.group;
}
    
	
prBase.prototype.clear = function ()  { 
	this.type = PR_NULL; // null, pt, line or circle? 
	this.creationOp = PR_NULL;  // how ou were created; allows updates
	this.inA = PR_NULL;     // inputs for the creation op
    this.inB = PR_NULL;
    this.inC = PR_NULL;
    this.t = 0.0;			//  parameter
    this.generation = 0;   // how far-removed from a given pt
    this.x = 0.0;			// position
	this.y = 0.0;
    this.x2 = 0.0;
    this.y2 = 0.0;
    this.r = 0.0;			// radius
    this.group = 0;
}


	
prBase.prototype.echo = function(label) {
	var displayStr = label + "t:" + this.type + " g:" + this.generation+  "  x:" + this.x + " y:" + this.y + "  x2:" + this.x2 + " y2:" + this.y2 + "    r:" + this.r;
	console.log(displayStr); 
}


prBase.prototype.trace = function(context) {
        switch (this.type) {
            case PR_POINT:
                context.moveTo(this.x+3.0 , this.y); 
                context.arc(this.x, this.y, 3.0,0.0, 6.28);
				context.stroke(); 
                break;
            case PR_LINE:
				context.moveTo(this.x-(200.0*this.x2), this.y-(200.0*this.y2)); 
				context.lineTo(this.x+(200.0*this.x2), this.y+(200.0*this.y2));
				context.stroke(); 
                break;
            case PR_CIRCLE:
				context.moveTo(this.x+this.r , this.y); 
                context.arc(this.x, this.y, this.r, 0.0, 6.28);
                context.stroke(); 
                break;
        }
  }
    
/*
prBase.prototype.label = function(w, labelNum) {
        n = random(1.0);
        lx = 0;
        ly = 0;
        sz = w*2;
        switch (type) {
            case PR_POINT:
                lx = this.x;
                ly = this.y;
                break;
            case PR_LINE:
                lx = this.x + (this.x2*n);
                ly = this.y + (this.y2*n);
                break;
            case PR_CIRCLE:
                lx = this.x + (this.r * cos(4.28*n));
                ly = this.y + (this.r * sin(4.28*n));
                break;
        }
        n = random(4.28);
        cx = lx + 5.0*w*cos(n);
        cy = ly + 5.0*w*sin(n);
        fill(0);
        switch (type) {
            case PR_POINT:
                rect(cx-sz, cy-sz*0.5, sz+sz, sz);
                break;
            case PR_LINE:
                rect(cx-sz, cy-sz, sz+sz, sz+sz);
                break;
            case PR_CIRCLE:
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
    
// helper function for maintaining the construction tree
prBase.prototype.setGen = function (obj1, obj2) {
	var a = 0; 
	this.generation = 0;
	if (obj1.type!=PR_NULL) {
		this.generation = obj1.generation +1;
	}
	
	if (obj2.type!=PR_NULL) {
		a = obj2.generation +1;
	}
	if (a>this.generation) {
		this.generation = a;
	}
}
    
    
    
    /////////////////// ops on points
    
prBase.prototype.isAPoint = function () {
	var res = 0;
	if (this.type == PR_POINT) {
		res = 1;
	}
	return res;
}
    


prBase.prototype.equalPoints = function (it) {
	var dx, dy, len; 
	var res = 0;
	dx = this.x-it.x;
	dy = this.y-it.y;
	len = dx*dx+dy*dy;
	if (len<PR_EPSILON) {
		res=1;
	}
	return res;
}



///////////////////////////////////////////////////
// initialization helpers-- internal functions that don't maintain generation data
prBase.prototype.setAsPoint = function ( xin,  yin) {
	this.type = PR_POINT;
	this.x = xin;
	this.y = yin;
	this.x2 = 0.0;
	this.y2 = 0.0;
	this.r = 0.0;
	this.t = 0.0;
}

prBase.prototype.setAsLine = function ( xin,  yin,  x2in,  y2in) {
	var dx, dy; 
	this.x = xin;
	this.y = yin;
	dx = x2in-xin;
	dy = y2in-yin;
	this.x2 = dx;
	this.y2 = dy;
	this.r = Math.sqrt(dx*dx+dy*dy);
	this.t = 0.0;
	if (this.r<PR_EPSILON) {
		this.type = PR_POINT;
	}
	else {
		this.type = PR_LINE;
	}
}

prBase.prototype.setAsCircle = function ( xin,  yin,  x2in,  y2in) {
	this.type = PR_CIRCLE;
	this.x = xin;
	this.y = yin;
	this.x2 = x2in-this.x;
	this.y2 = y2in-this.y;
	this.r = Math.sqrt(this.x2*this.x2+this.y2*this.y2);
	this.t = 0.0;
	if (this.r<PR_EPSILON) {
		this.type = PR_POINT;
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
	
	a = ob1.isAPoint();
	b = ob2.isAPoint();
	c = ob3.isAPoint();
	
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
			if (dx>PR_EPSILON) { // the distances are different
				if (ac<bc) {
					res =1;
				}
				else {
					res = 2;
				}
			}
			else { // the distances are the same
				dy = ob1.y - ob2.y;
				if (dy*dy>PR_EPSILON) {
					if (ob1.y < ob2.y) {
						res = 1;
					}
					else {
						res = 2;
					}
				}
				else { // the heights are the same
					dx = ob1.x - ob2.x;
					if (dx*dx>PR_EPSILON) {
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





// intersect self, as a line, with the input line; set pt if there is one
prBase.prototype.intersectLineLine = function ( line,  pt) {
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
	if ((det[7]*det[7])>PR_EPSILON) {
		det[8] = (det[0]*det[4]) - (det[1]*det[3]);
		det[9] = (det[0]*det[6]) - (det[1]*det[5]);
		
		pt.type = PR_POINT;
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
prBase.prototype.intersectLineCircle = function ( line,  pt) {
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
		if (disc*disc<PR_EPSILON) { // line is tangent
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
prBase.prototype.intersectCircleCircle = function (cr,  pt) {
	var dx, dy, rsum, seperation, crx, cry, a, b, c;
    var res = 0;
	
	rsum = this.r + cr.r;
	dx = this.x - cr.x; // dxy= connection c1 to c2
	dy = this.y - cr.y;
	seperation = Math.sqrt(dx*dx+dy*dy);
	if (seperation>PR_EPSILON) { // the centers are not the same
		if (rsum<seperation) {
			// can't touch; return null
			res = 0;
		}
		else {
			if ( ((rsum-seperation)*(rsum-seperation)) < PR_EPSILON) {
				// touch at one spot, which is self.r away from self.center
				// along dxy
				pt.x = this.x + (dx*this.r/seperation);
				pt.y = this.y + (dy*this.r/seperation);
				res = 1;
			}
			else {
				// there are two points of contact.
				res = 2;
				// two triangles, r1sq=csq+asq and r2sq=bsq+asq
				// also, b+c=seperation,
				c = (0.5*seperation) - ((this.r*this.r*0.5)/seperation) + ((cr.r*cr.r*0.5)/seperation);
				b = seperation - c;
				a = Math.sqrt(this.r*this.r - b*b);
				
				
				dx /= seperation;
				dy /= seperation;
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
	var typecases = this.type*10 + it.type;
	
	switch (typecases) {
		case PR_POINT*10 + PR_POINT:
			break;
		case PR_POINT*10 + PR_LINE:
			break;
		case PR_POINT*10 + PR_CIRCLE:
			break;
		case PR_LINE*10 + PR_POINT:
			break;
		case PR_LINE*10 + PR_LINE:
			res = this.intersectLineLine(it, pt);
			break;
		case PR_LINE*10 + PR_CIRCLE:
			res = it.intersectLineCircle(this, pt);
			break;
		case PR_CIRCLE*10 + PR_POINT:
			break;
		case PR_CIRCLE*10 + PR_LINE:
			res = this.intersectLineCircle(it, pt);
			break;
		case PR_CIRCLE*10 + PR_CIRCLE:
			res = this.intersectCircleCircle(it, pt);
			break;
	}
	if (res!=0) {
		pt.type = PR_POINT;
	}
	return res;
}


prBase.prototype.setAsFirstIntersection = function (obj1,  obj2,  target) {
	var count, which; 
	
	var pt1 = new prBase();
	var pt2 = new prBase();
	
	count = obj1.intersect(obj2, pt1);
	switch (count) {
		case 0:
			this.type = PR_NULL;
			break;
		case 1:
			this.setAsPoint(pt1.x, pt1.y);
			break;
		case 2:
			pt2.setAsPoint(pt1.x2, pt1.y2);
			which = this.closer(pt1, pt2, target);
			if (which==2) {
				this.setAsPoint(pt2.x, pt2.y);
			}
			else {
				this.setAsPoint(pt1.x, pt1.y);
			}
			break;
	}
}


prBase.prototype.setAsSecondIntersection = function (obj1,  obj2,  target) {
	var count, which; 
	var pt1 = new prBase();
	var pt2 = new prBase();
	
	count = obj1.intersect(obj2, pt1);
	switch (count) {
		case 0:
		case 1:
			this.type = PR_NULL;
			break;
		case 2:
			pt2.setAsPoint(pt1.x2, pt1.y2);
			which = this.closer(pt1, pt2, target);
			if (which==2) {
				this.setAsPoint(pt1.x, pt1.y);
			}
			else {
				this.setAsPoint(pt2.x, pt2.y);
			}
			break;
	}
}



/////////////// parametrics
// set self to be a point on another prBase

// this one is kinda stupid. 
prBase.prototype.setAsPPoint = function ( pt, tin) {
	this.type = PR_POINT;
	this.creationOp = PR_PARAMETRIC;
	this.generation = pt.generation+1;
	this.x = pt.x;
	this.y = pt.y;
	this.t = tin;
}


// take t, set point to be on object
prBase.prototype.setAsPLine = function ( ln,  tin) {
	this.type = PR_POINT;
	this.creationOp = PR_PARAMETRIC;
	this.generation = ln.generation+1;
	this.x = ln.x + (ln.x2*tin);
	this.y = ln.y + (ln.y2*tin);
	this.t = tin;
}


prBase.prototype.setAsPCircle = function ( ck,  tin) {
	this.type = PR_POINT;
	this.creationOp = PR_PARAMETRIC;
	this.generation = ck.generation+1;
	this.x = ck.x + (ck.r * Math.cos(tin*-6.2831853));
	this.y = ck.y + (ck.r * Math.sin(tin*-6.2831853));
	this.t = tin;
}


prBase.prototype.setAsParametric = function ( ob,  tin) {
	switch (ob.type) {
		case PR_POINT:
			this.setAsPPoint(ob, tin); 
			break;
		case PR_LINE:
			this.setAsPLine(ob, tin);
			break;
		case PR_CIRCLE:
			this.setAsPCircle(ob, tin);
			break;
	}
}



////////// closest-points!
// this as opposed to calling them "point on"-- numericcal
// self is line or circle; returns parameter of point on object closest to

// return the parameter of the point on the object closest to p
prBase.prototype.closestPointOnLine = function ( pt) {
	var dx, dy; 
	this.res = 0.0;
	if (this.r>PR_EPSILON) {
		dx = pt.x - this.x;
		dy = pt.y - this.y;
		res = ((dx*this.x2) + (dy*this.y2))/(this.r*this.r); // a parameter, but an incorrect one
	} // else self is not really a line; problematic! and t should==0
	return res;
}


prBase.prototype.closestPointOnCircle = function ( pt) {
    res = 0.0;
	dx = pt.x - this.x;
	dy = pt.y - this.y;
	len = Math.sqrt(dx*dx+dy*dy); // distance from center
	if (len>PR_EPSILON) {
		// don't even care how close you are; just get the angle.
		theta = Math.acos(dx/len);
		if (dy<0.0) {
			theta = 6.28 - theta;
		}
		res = theta / 6.28;
	}
	return res;
}


// it is the thing being used to position the point
prBase.prototype.closestPointParam = function ( pt) {
	res = 0.0;
	if (pt.type==PR_POINT) {
		switch (this.type) {
			case PR_LINE:
				res = this.closestPointOnLine(pt);
				break;
			case PR_CIRCLE:
				res = this.closestPointOnCircle(pt);
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
 



function prFigure(context) { 
	this.objs = new Array();
	this.objs[0] = new prBase; // default is 0== null point; useful! I think.
	this.objCount = 1; 
    this.cx = context;
	this.iteratorCounter = 0;
	this.iteratorTag = 0; 
}


/*
prFigure.prototype.baseLabel = function(b, w, labelNum) {
	n = Math.random(1.0);
	lx = 0;
	ly = 0;
	sz = w*2;
	switch (type) {
		case PR_POINT:
			lx = b.x;
			ly = b.y;
			break;
		case PR_LINE:
			lx = b.x + (b.x2*n);
			ly = b.y + (b.y2*n);
			break;
		case PR_CIRCLE:
			lx = b.x + (b.r * Math.cos(4.28*n));
			ly = b.y + (b.r * Math.sin(4.28*n));
			break;
	}
	n = Math.random(4.28);
	cx = lx + 5.0*w*Math.cos(n);
	cy = ly + 5.0*w*Math.sin(n);
	this.cx.fillStyle = "rgb(200,200,200)";
	switch (type) {
		case PR_POINT:
			this.cx.fillRect(cx-sz, cy-sz*0.5, sz+sz, sz);
			break;
		case PR_LINE:
			this.cx.fillRect(cx-sz, cy-sz, sz+sz, sz+sz);
			break;
		case PR_CIRCLE:
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






///////////////////// convenience
prFigure.prototype.copy = function(it) {
	var i=0;
	for (i=0; i<it.objCount; ++i) {
		this.objs[i] = new prBase(); 
		this.objs[i].copy(it.objs[i]);
	}
	this.objCount = it.objCount;
	this.cx = it.cx; 
	this.iteratorCounter = it.iteratorCounter; 
	this.iteratorTag = it.iteratorTag; 
}



prFigure.prototype.echo = function() {
	var i=0;
	for (i=0; i<this.objCount; ++i) {
		print(i);
		this.objs[i].echo(i+":");
	}
}



prFigure.prototype.echoOne =  function( which) {
	var i=0;
	if ((which>0)&&(which<this.objCount)) {
		this.objs[which].echo(which + ":") ;
	}
}


prFigure.prototype.trace = function( withLabel,  labelWidth) {
	var i=0; 
	for (i=0; i<this.objCount; ++i) {
		this.objs[i].trace(this.cx);
	}
	//if (withLabel==1) {
	//	for (i=0; i<this.objCount; ++i) {
	//		this.objs[i].baseLabel(labelWidth, i);
	//	}
	//}
}

prFigure.prototype.traceOne = function( which,  withLabel, labelWidth) {
	if ((which>0)&&(which<this.objCount)) {
		this.objs[which].trace(this.cx) ;
		//if (withLabel==1) {
		//	this.objs[which].label(labelWidth, which);
		//}
	}
}

prFigure.prototype.traceGroup = function( which) {
	for (var i=0; i<this.objCount; ++i) { 
		if (this.objs[i].g == which) { 
			this.objs[i].trace(this.cx) ;
		}
	}
}

prFigure.prototype.setGroup = function( which,  val) {
	if ((which>0)&&(which<this.objCount)) {
		this.objs[which].g = val;
	}
}


prFigure.prototype.startGroup = function(which) { 
	this.iteratorCounter = 0; 
	this.iteratorTag = which; 
}

prFigure.prototype.nextGroupMember = function() { 
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

prFigure.prototype.clear = function() {
	this.objCount = 1;
}



prFigure.prototype.merge = function(it) {
	var i; 
	var source = new prBase();
	
	for (i=0; i<it.objCount; ++i) {
		// look at how we are not checking for naming conflicts
		
		source.copy(it.objs[i]);
		if (source.inA>0) {
			source.inA += this.objCount;
		}
		if (source.inB>0) {
			source.inB += this.objCount;
		}
		if (source.inC>0) {
			source.inC += this.objCount;
		}
		this.objs[this.objCount+i] = source;
		// is that bad? how would we resolve them?
	}
	this.objCount += it.objCount;
}



///////////////////// internal convenience
// bounds checking for objct references
prFigure.prototype.isAThing = function(ob) {
	var res = 0;
	if ((0<ob)&&(ob<this.objCount)) {
		if (this.objs[ob].type!=PR_NULL) {
			res = 1;
		}
	}
	return res;
}



// set construction tree helper; little error-checking
// call only from addPoit/Circ/Line/Elli
prFigure.prototype.setOps = function(newOne,  a,  b,  c,  op) {
	var g1, g2; 
	
	this.objs[newOne].creationOp = op;
	this.objs[newOne].inA = a;
	this.objs[newOne].inB = b;
	this.objs[newOne].inC = c;
	g1 = this.objs[a].generation +1;
	g2 = this.objs[b].generation +1;
	if (g2>g1) {
		g1 = g2;
	}
	this.objs[newOne].generation = g1;
}



prFigure.prototype.resetter = function(which,  obj) {
	if ((which>0)&&(which<this.objCount)) {
		this.objs[which].x = obj.x;
		this.objs[which].y = obj.y;
		this.objs[which].x2 = obj.x2;
		this.objs[which].y2 = obj.y2;
		this.objs[which].r = obj.r;
		this.objs[which].t = obj.t;
		this.recalculate(which);
	}
}



prFigure.prototype.recalculate = function(first) {
	var i;
	var ct = new prBase();
	
	for (i=first; i<this.objCount; ++i) {
		ct.copy(this.objs[i]);
		if ((ct.inA>=first)||(ct.inB>=first)||(ct.inC>=first)) {
			// could have been affected; recalculate
			switch (ct.creationOp) {
				case PR_CHEATER:
					// do nothing
					break;
				case PR_FIRST_INT:
					ct.setAsFirstIntersection(this.objs[ct.inA], this.objs[ct.inB], this.objs[ct.inC]);
					break;
				case PR_SECOND_INT:
					ct.setAsSecondIntersection(this.objs[ct.inA], this.objs[ct.inB], this.objs[ct.inC]);
					break;
				case PR_PARAMETRIC:
					ct.setAsParametric(this.objs[ct.inA], ct.t);
					break;
				case PR_ADDLINE:
					ct.setAsLine(this.objs[ct.inA].x, this.objs[ct.inA].y, this.objs[ct.inB].x, this.objs[ct.inB].y);
					break;
				case PR_ADDCIRCLE:
					ct.setAsCircle(this.objs[ct.inA].x, this.objs[ct.inA].y, this.objs[ct.inB].x, this.objs[ct.inB].y);
					break;
			}
			this.objs[i].copy(ct);
		}
	}
}



//////////////////////// adding to the figure

prFigure.prototype.addNull = function() {
	var res = 0;
	if (pt.type==PR_POINT) {
		res = this.addBase(pt);
	} else {
		console.log("prFigure::addPoint error: use of addPoint to add something that's not a point.");
	}
	return res;
}

// add the point to the object list.
// should only be used internally-- why make a copy of a point you have already?
// skipping a lot of error-checking here.
prFigure.prototype.addPoint = function( pt) {
	var res = 0;
	if (pt.type==PR_POINT) {
		res = this.addBase(pt);
	} else {
		console.log("prFigure::addPoint error: use of addPoint to add something that's not a point.");
	}
	return res;
}

prFigure.prototype.addBase = function( it) {
	var res = 0;
	if (it.type!=PR_NULL) {
		this.objs[this.objCount] = new prBase; 
		this.objs[this.objCount].copy(it);
		res = this.objCount;
			++(this.objCount);
		} else {
			console.log("prFigure:addBase: you can't add a NULL object");
		}
	return res;
}



// add a point at some coordinates. intended only to get you started!
prFigure.prototype.makeGivenPoint = function( x,  y) {
	var ob = new prBase();
	ob.clear();
	ob.type = PR_POINT;
	ob.x = x;
	ob.y = y;
	return ob;
}


// the cheaterLine and circle would just take cheated points, so, skippem.
prFigure.prototype.addGivenPoint = function(x,  y) {
    var ob = this.makeGivenPoint(x, y);
    var res = this.addBase(ob);
	if (res!=0) {
		this.setOps(res, 0, 0, 0, PR_GIVEN);
	}
	return res;
}

// two points only.
prFigure.prototype.addLine = function( ob1,  ob2) {
	var goalie = new prBase();
	var res = 0;
	if ((this.isAThing(ob1)==1)&&(this.isAThing(ob2)==1)) {
		res = this.objCount;
		if (this.objs[ob1].isAPoint()==0) {
			res = 0;
		}
		if (this.objs[ob2].isAPoint()==0) {
			res = 0;
		}
		if (this.objs[ob1].equalPoints(this.objs[ob2])==1) {
			res = 0;
		} // can't make a line out of one point!
		
		if (res==this.objCount) {
			this.objs[this.objCount] = new prBase;
			this.objs[this.objCount].setAsLine(this.objs[ob1].x, this.objs[ob1].y, this.objs[ob2].x, this.objs[ob2].y);
			this.setOps(this.objCount, ob1, ob2, 0, PR_ADDLINE);
			++this.objCount;
		}
	}
	return res;
}


// two points only.
prFigure.prototype.addCircle = function( ob1,  ob2) {
	var res = 0;
	if ((this.isAThing(ob1)==1)&&(this.isAThing(ob2)==1)) {
		res = this.objCount;
		if (this.objs[ob1].isAPoint()==0) {
			res = 0;
		}
		if (this.objs[ob2].isAPoint()==0) {
			res = 0;
		}
		if (this.objs[ob1].equalPoints(this.objs[ob2])==1) {
			res = ob1;
		} // can't make a line out of one point!
		
		if (res==this.objCount) {
			this.objs[this.objCount] = new prBase;
			this.objs[this.objCount].setAsCircle(this.objs[ob1].x, this.objs[ob1].y, this.objs[ob2].x, this.objs[ob2].y);
			this.setOps(this.objCount, ob1, ob2, 0, PR_ADDCIRCLE);
			++this.objCount;
		}
	}
	return res;
}



// intersection returns 0, 1, or 2 points.
// the "first" one is the one "closest" to target.
// returns the point of intersection not returned by cI.
// can also return NULL.
prFigure.prototype.addFirstIntersection = function( ob1,  ob2,  target) {
	var res = 0;
	this.objs[this.objCount] = new prBase;
	this.objs[this.objCount].setAsFirstIntersection(this.objs[ob1], this.objs[ob2], this.objs[target]);
	if (this.objs[this.objCount].type!=PR_NULL) {
		this.setOps(this.objCount, ob1, ob2, target, PR_FIRST_INT);
		res = this.objCount;
		++this.objCount;
	}
	// whichever is closer, add that to the figure.
	return res;
}


prFigure.prototype.addSecondIntersection = function( ob1,  ob2,  target) {
	var res = 0;
	this.objs[this.objCount] = new prBase;
	this.objs[this.objCount].setAsSecondIntersection(this.objs[ob1], this.objs[ob2], this.objs[target]);
	if (this.objs[this.objCount].type!=PR_NULL) {
		this.setOps(this.objCount, ob1, ob2, target, PR_SECOND_INT);
		res = this.objCount;
		++this.objCount;
	}
	// whichever is closer, add that to the figure.
	return res;
}



// points on lines or circles
prFigure.prototype.addParametricPoint = function( obj,  t) {
	var res = 0;
	this.objs[this.objCount] = new prBase;
	this.objs[this.objCount].setAsParametric(this.objs[obj], t);
	if (this.objs[this.objCount].type!=PR_NULL) {
		this.setOps(this.objCount, obj, 0, 0, PR_PARAMETRIC);
		res = this.objCount;
		++this.objCount;
	}
	return res;
}



// by changing a t down in the figure's tree, cause movement!
prFigure.prototype.setParameter = function ( obj,  tin) {
	if (this.objs[obj].creationOp == PR_PARAMETRIC) {
		this.objs[obj].t = tin;
		this.recalculate(obj);
	}
}


prFigure.prototype.setParameter = function( obj,  pt) {
	return this.objs[obj].closestPointParam(this.objs[pt]);
}


// interface for XML files of figures, and stuff.
prFigure.prototype.command = function ( op,  obj1,  obj2,  target,  tin,  vin) {
	var res = 0;
	switch (op) {
		case PR_CHEATER:
			res = this.addCheaterPoint(tin, vin);
			break;
		case PR_FIRST_INT:
			res = this.addFirstIntersection(obj1, obj2, target);
			break;
		case PR_SECOND_INT:
			res = this.addSecondIntersection(obj1, obj2, target);
			break;
		case PR_PARAMETRIC:
			res = this.addParametricPoint(obj1, tin);
			break;
		case PR_ADDLINE:
			res = this.addLine(obj1, obj2);
			break;
		case PR_ADDCIRCLE:
			res = this.addCircle(obj1, obj2);
			break;
		case PR_SET_NAMED:
			res = obj1;
			this.resetter(obj1, this.objs[obj2]);
			break;
		case PR_SET_PARAMETER:
			res = obj1;
			this.setParameter(obj1, tin);
			break;
	}
	return res;
}



prFigure.prototype.getBase= function ( which) { 
	return this.objs[which];
}



// starting with the base objects, 
prFigure.prototype.addInitialFigure = function ( xin,  yin,  win,  hin) {
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


prMark.prototype.copy = function( it) {
	this.p1 = it.p1;
	this.p2 = it.p2;
	this.dp = it.dp;
	this.ready = it.ready;
	this.source = new prBase(); 
	this.source.copy(it.source);
}



///// setup: takes a prBase of any type and two points.
prMark.prototype.set = function( it,  pt1,  pt2) {
	this.source.copy(it);
	this.p1 = it.closestPointParam(pt1);
	this.p2 = it.closestPointParam(pt2);
	this.dp = this.p2-this.p1;
	if (it.type == PR_CIRCLE) { 
		if (this.dp<0.0) { 
			this.dp = this.p1; 
			this.p1 = this.p2; 
			this.p2 = this.dp; 
			this.dp = this.p2 - this.p1; // doing this why? 
		}
	}
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
	/*var p, maxLen, len, res, dp, pt1, pt2, targetMaxLen;
	pt1 = new prBase();
	pt2 = new prBase();
	
	targetMaxLen = maxd; 
	if (targetMaxLen<0.05) { // these are pixels, after all.  
		targetMaxLen = 0.5; 
	}
	res = .2;
	maxLen = 1.0;
	while (maxLen>maxd) { 
		res *= 0.5;
		maxLen = 0.0
		dp = (this.p2-this.p1)*res;
		for (p=this.p1; p<this.p2; p+=dp) {
			pt1.setAsParametric(this.source, p);
			pt2.setAsParametric(this.source, p+dp);
			len = this.separation(pt1, pt2);
			if (len>maxLen) {
				maxLen = len;
			}
		}
		
	}*/
	var dp; 
	var res = .5; 
	if (this.source.type == PR_CIRCLE) { 
		dp = this.p2 - this.p1; 
		res = dp / (this.source.r * 2.0); 
	}
	
	return res;
}



/////// drawing; fill or not; see if I care
prMark.prototype.drawPoint = function (r, context) {
	var px,py, pr; 
	px = this.source.x; 
	py = this.source.y; 
	context.moveTo(px+r, py); 
	context.arc(px, py, r,0.0, 6.28);
	context.stroke(); 
}


prMark.prototype.drawSegment = function(context) {
	var pt1, pt2;
	pt1 = new prBase();
	pt2 = new prBase();
	pt1.setAsParametric(this.source, this.p1);
	pt2.setAsParametric(this.source, this.p2);
	context.moveTo(pt1.x, pt1.y);
	context.lineTo(pt2.x, pt2.y);
	context.stroke(); 
}



prMark.prototype.drawArc = function(context) {
	context.arc(this.source.x, this.source.y, this.source.r, 
		this.p1*6.28, this.p2*6.28);
}


prMark.prototype.draw = function(r, context) {
	switch (this.source.type) {
		case PR_POINT:
			this.drawPoint(r, context);
			break;
		case PR_LINE:
			this.drawSegment(context);
			break;
		case PR_CIRCLE:
			this.drawArc(context);
			break;
	}
}




prMark.prototype.getPointAlong = function(pt,  t) {
	// print("pointAlong: "); 
	// print(t); print(" "); print(p1); print(" "); print(p2);  print(" "); 
	// println(p1+((t-p1)/(p2-p1))); 
	
	pt.setAsParametric(this.source, this.p1 + (t*(this.p2-this.p1)) );
}


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
 

const PR_ADD_MARK = 100;
const PR_DRAW_MARK = 101;
const PR_DRAW_TRIANGLE = 102;
const PR_LOFT = 103;


// initialize the page; include top-left coordinate in window,
// label width, point width (for traces), and page width and height
function prPage(theContext) {
	this.context = theContext;
		
	this.theMarks = new Array;
	this.markCounter = 0; 
	this.theFigure = new prFigure(theContext);
}

// erase everything
prPage.prototype.clear = function() {
	this.markCounter = 0;
	this.theFigure.clear();
}


///////////////////// convenience
prPage.prototype.copy = function(it) {
	var i;
	if (this.markCounter < it.markCounter) { 
		for (i=this.markCounter; i<it.markCounter; ++i) { 
			this.theMarks[i] = new prMark; 
		}
	}
	for (i=0; i<it.markCounter; ++i) {
		this.theMarks[i].copy(it.theMarks[i]);
	}
	this.markCounter = it.markCounter;
	this.theFigure.copy(it.theFigure);
	
	this.labelWidth = it.labelWidth;
	this.pointWidth = it.pointWidth;
	this.attachWidth = it.attachWidth;
	this.pageWidth = it.pageWidth;
	this.pageHeight = it.pageHeight;
}

prPage.prototype.merge = function(it) {
	this.theFigure.merge(it.theFigure);
}




prPage.prototype.setParameter = function( obj,  tin) {
	this.theFigure.setParameter(obj, tin);
}

prPage.prototype.addInitialFigure = function( xin,  yin,  win,  hin) {
	this.theFigure.addInitialFigure(xin, yin, win, hin); // note: clears figure!
}

// simply draw all of the primitives, as primitives.
prPage.prototype.trace = function(withLabels) {
	this.theFigure.trace(withLabels, this.labelWidth);
}
prPage.prototype.traceOne = function(which) {
	this.theFigure.traceOne(which, this.withLabels, this.labelWidth);
}

prPage.prototype.traceGroup = function( which) {
	this.theFigure.traceGroup(which);
}

prPage.prototype.setGroup = function( which,  val) {
	this.theFigure.setGroup(which, val);
}

prPage.prototype.startGroup = function(which) { 
	this.theFigure.startGroup(which);
}

prPage.prototype.nextGroupMember = function() { 
	this.theFigure.nextGroupMember();
}
prPage.prototype.echo = function() {
	this.theFigure.echo();
}

prPage.prototype.echoOne = function(which) {
	this.theFigure.echoOne(which);
}

//// operations adding elements to the figure
prPage.prototype.addGivenPoint = function(x, y) {
	return this.theFigure.addGivenPoint(x, y);
}

prPage.prototype.addFirstIntersection = function(ob1, ob2, target) {
	return this.theFigure.addFirstIntersection(ob1, ob2, target);
}

prPage.prototype.addSecondIntersection = function(ob1, ob2, target) {
	return this.theFigure.addSecondIntersection(ob1, ob2, target);
}

prPage.prototype.addParametricPoint = function( obj,  tin) {
	return this.theFigure.addParametricPoint(obj, tin);
}

prPage.prototype.addLine = function( ob1,  ob2) {
	return this.theFigure.addLine(ob1, ob2);
}

prPage.prototype.addCircle = function( ob1,  ob2) {
	return this.theFigure.addCircle(ob1, ob2);
}


// naming parts of the figure
//  public int getNamed(int name) {
//  return theFigure.getNamed(name);this.
//}

//public int giveName(int name, int obj) {
//return theFigure.giveName(name, obj);
//}/

//
prPage.prototype.closestPointParam = function( ob,  pt) {
	return this.theFigure.closestPointParam(ob, pt);
}



//// oparations on marks
prPage.prototype.addMark = function( ob,  p1,  p2) {
	var res, obob, p1ob, p2ob;
	
	obob = this.theFigure.getBase(ob);
	p1ob = this.theFigure.getBase(p1);
	p2ob = this.theFigure.getBase(p2);
	
	this.theMarks[this.markCounter] = new prMark;
	this.theMarks[this.markCounter].set(obob, p1ob, p2ob);
	res = this.markCounter;
	++this.markCounter;
	return res;
}


prPage.prototype.drawMarks = function() {
	for (var i=0; i<this.markCounter; ++i) {
		this.theMarks[i].draw(this.pointWidth, this.context);
	}
}
prPage.prototype.drawOneMark = function(which) {
	this.theMarks[which].draw(this.pointWidth, this.context);
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
	this.context.moveTo(p.x, p.y); 
	for (t=0.0; t<endt; t+=dt) {
		m.getPointAlong(p, t);
		this.context.lineTo(p.x, p.y);
	}
	
	// and then the other. 
	m.copy(this.theMarks[m2]);
	dt = m.scanLength(maxD);
	for (t=0.0; t<endt; t+=dt) {
		m.getPointAlong(p, t);
		this.context.lineTo(p.x, p.y);
	}
	m.getPointAlong(p, 0.0); 
	this.context.lineTo(p.x, p.y); 
	// fill it in-- presto? 
	this.context.fill(); 
	
}


prPage.prototype.clearMarks = function() {
	markCounter = 0;
}



// interface for XML files of figures, and stuff.
prPage.prototype.command = function( op,  obj1,  obj2,  target,  tin,  vin) {
	var res = 0;
	switch (op) {
		default: 
			res = theFigure.command(op, obj1, obj2, target, tin, vin); 
			break;
		
	}
	return res;
}

