
///////////////////////////////////////
// This is prPage class of the Proportion Library. 
// (c)2013 Neal McDonald, released under MIT License
// Use it however you like; have a nice day.

// prPage provides the interface for the whole system, and contains all the prBase. 
//

// coords: the page takes normalized coords; 0,0 is top-left, and 1,1 is bottom-right. 
// canvas aspect ratio might impact construction success; caveat aedicicator. 

// dependencies: the objects in a construction refer to each other (a circle is drawn
// through two points). One would expect the objects in a construction to be connected
// in a tree graph. But! Since you're using a program to build the construction anyway, 
// and dependency calculations are more difficult than line intersections, 
// the page does NOT store connectivity information, only type and position. 
// This makes it easier to copy parts of constructions.

// It also means that normal usage, if you're animating, is to clear the canvas every time you redraw, 
// and rebuild from scratch.  Doing otherwise is generally not a time-saver, computationally,
// and if the canvas size changes, ... 


var prBase = require('./prBase');



function prPage(context, bgColor) { 
	this.cx = context;
	this.bg = bgColor;
	this.cxw = context.canvas.width;
	this.cxh = context.canvas.height;
	
	this.objs = new Array();
	
	this.objs[0] = new prBase; // default is 0== null point; useful! I think.
	this.objCount = 1; 

	// iteration through grouped objs
	this.itC = 0; // index of last returned thing in objs[]
	this.itG = 0; // group being iterated over
	
}







/////////////////////// convenience
prPage.prototype = {
	copy: function(it) {
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
	},


	clear: function() {
		this.objCount = 1;
		this.iteratorCounter = 0;
		
		this.cxw = this.cx.canvas.width; 
		this.cxh = this.cx.canvas.height; 
		
		this.cx.fillStyle = this.bg;
		this.cx.beginPath();
		this.cx.rect(0,0, this.cxw, this.cxh);
		this.cx.fill();		
	},


	merge: function(it) {
		var i, mx;
		mx = this.objCount; 
		for (i=0; i<it.objCount; ++i) {
			this.objs[mx+i] = new prBase; 
			this.objs[mx+i].copy(it.objs[i]);
		}
		this.objCount += it.objCount;
	},


	/////////////////////// debugging and tracing
	echo: function() {
		var i=0;
		for (i=0; i<this.objCount; ++i) {
			// print(i);
			this.objs[i].ec(i+":");
		}
	},


	echoOne =  function( which) {
		var i=0;
		if ((which>0)&&(which<this.objCount)) {
			this.objs[which].ec(which + ":") ;
		}
	},


	trace: function() {
		var i=0; 
		for (i=0; i<this.objCount; ++i) {
			this.objs[i].tr(this.cx);
		}
	},


	traceOne: function(which) {
		if ((which>0)&&(which<this.objCount)) {
			this.objs[which].tr(this.cx) ;
			//if (withLabel==1) {
			//	this.objs[which].label(labelWidth, which);
			//}
		}
	},



	/////////////////////// group manipulations
	// draw all the objects in "which" group
	traceGroup: function( which) {
		for (var i=0; i<this.objCount; ++i) { 
			if (this.objs[i].g == which) { 
				this.objs[i].tr(this.cx) ;
			}
		}
	},


	setGroup: function( which,  val) {
		if ((which>0)&&(which<this.objCount)) {
			this.objs[which].g = val;
		}
	},


	// init iteration over members of a group
	startGroup: function(which) { 
		this.iteratorCounter = 0; 
		this.iteratorTag = which; 
	},


	// call this until it returns 0
	nextGroupMember: function() { 
		var ct = this.iteratorCounter; 
		while ((ct<this.objectCtr)||(this.objs[ct].g!=this.iteratorTag)) { 
			++ct; 
		}
		this.iteratorCtr = ct; 
		if (ct>=this.objectCtr) { 
			ct = 0;
		} 
		return ct;
	},


	// erase all the members of "which" group
	clearGroup: function( which) {
		for (var i=0; i<this.objCount; ++i) { 
			if (this.objs[i].g == which) { 
				this.objs[i].cl();
			}
		}
	},






	///////////////////// adding prBase
	// bounds checking for objct references
	isAPoint: function(ob) { 
		var res = 0;
		if ((0<ob)&&(ob<this.objCount)) {  // 0<ob<objCount
			if (ob in this.objs) {  // there is an obj at objs[ob]
				if (this.objs[ob].t==PR_P) { // is a point
					res = 1;
				}
			}
		}
		return res;
	},


	// you won't need to add NULL; it's always objs[0]
	// to add given lines, add given points, and then draw lines through them
	addGivenPoint: function(x, y) {
	    this.objs[this.objCount] = new prBase(); 
		this.objs[this.objCount].saP(x* this.cxw, y*this.cxh); 
	    var res = this.objCount
		++this.objCount; 
		return res;
	},
	given: addGivenPoint,


	// two points only.
	addLine: function(ob1, ob2) {
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
	},
	line: addLine,


	// two points only.
	addCircle: function(ob1, ob2) {
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
	},
	circle: addCircle,


	// line plus p1p2
	addSegment: function(ob, t1in, t2in) {
		var res = 0; 
		
		if ((0<ob)&&(ob<this.objCount)) {  // 0<ob<objCount
			if (ob in this.objs) {  // there is an obj at objs[ob]
				if (this.objs[ob].t==PR_L) { // is a line
					res = this.objCount;
					this.objs[res] = new prBase;
					this.objs[res].saS(this.objs[ob], t1in, t2in);
					++this.objCount;
				}
			}
		}
		return res;
	},
	segment: addSegment,


	// circle plus p1p2
	addArc: function(ob, t1in, t2in) {
		var res = 0; 
		
		if ((0<ob)&&(ob<this.objCount)) {  // 0<ob<objCount
			if (ob in this.objs) {  // there is an obj at objs[ob]
				if (this.objs[ob].t==PR_C) { // is a circle
					res = this.objCount;
					this.objs[res] = new prBase;
					this.objs[res].saA(this.objs[ob], t1in, t2in);
					++this.objCount;
				}
			}
		}
		return res;
	}
	arc: addArc,


	// intersection returns 0, 1, or 2 points.
	// the "first" one is the one "closest" to target.
	// returns the point of intersection not returned by cI.
	// can also return NULL.
	addFirstIntersection: function( ob1,  ob2,  target) {
		var res = 0;
		this.objs[this.objCount] = new prBase;
		this.objs[this.objCount].saFI(this.objs[ob1], this.objs[ob2], this.objs[target]);
		if (this.objs[this.objCount].t!=PR_N) {
			res = this.objCount;
			++this.objCount;
		}
		// whichever is closer, add that to the figure.
		return res;
	},
	first: addFirstIntersection,


	addSecondIntersection: function( ob1,  ob2,  target) {
		var res = 0;
		this.objs[this.objCount] = new prBase;
		this.objs[this.objCount].saSI(this.objs[ob1], this.objs[ob2], this.objs[target]);
		if (this.objs[this.objCount].t!=PR_N) {
			res = this.objCount;
			++this.objCount;
		}
		// whichever is closer, add that to the figure.
		return res;
	},
	second: addSecondIntersection,


	// points on lines or circles
	addParametricPoint: function( obj,  t) {
		var res = 0;
		this.objs[this.objCount] = new prBase;
		this.objs[this.objCount].saPm(this.objs[obj], t);
		if (this.objs[this.objCount].t!=PR_N) {
			res = this.objCount;
			++this.objCount;
		}
		return res;
	},
	parametric: addParametricPoint,


	closestPointParam: function(obj, pt) {
		return this.objs[obj].cPP(this.objs[pt]); 
	},
	closestT: closestPointParam,


	getBase: function ( which) { 
		return this.objs[which];
	},





	/*      test code
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



	// given two marks, loft between them
	loft: function(m1in, m2in) {
		var m1, m2, dt1, dt2, bt1, bt2, t1, t2, dt, sc; 
		m1 = new prBase; 
		m2 = new prBase; 
		
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

}















