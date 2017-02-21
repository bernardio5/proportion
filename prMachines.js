
///////////////////////////////////////
// This is the more-or-less well-commented version of the Proportion Library's "machines" class. 
// (c)2013 Neal McDonald, released under MIT License
// Use it however you like; have a nice day.

// There is only one class in this file. It defines the prMachines class, which provides functions 
//    	All the functions implement machines or test them.
//      All of the machines operate on a construction, only by adding to it.
//      They all return dictionaries. 
//      The names of the elements ID the parts of the result.
//      The outputs are CapitalizedCamelCase.
//      The machine object should maintain a "GroupID" member, and when a machine adds to a construction, 
//        it should use that group number?
//      The machines should return everything they make? so that you can duplicate construction elements
//        as little as possible? 
//      The machines should add as little to the drawing as possible. 

// The challenge of these objects: 
// 1) to take input from a complex document in a simple way. 
// 2) to return complex information in a standard way. 
// 3) Nomenclature! To be useful, the machines must allow you to refer to the things they return, inside the 
// drawing, but not clutter up the main program of the drawing-- to provide control over the scope of the 
// naming of parts of a construction. When the dictionaries are deleted, the objects they refer to are still
// part of the construction, but they become much harder to access. 

// This library extends proportion.js, and therefore does require it. 


function prMachines(pg) { 
	this.pg = pg;  	// the page in which the machines will operate
}



prMachines.prototype = { 

	// given p1 and p2, two points, and pAbove, a point defining "above", returns
	//    "Connector", the line containing p1 and p2
	//    "MidPt", the midpoint of the line segment connecting p1 and p2, 
	//    "MidLine", the line perpendicular to Connector at MidPt
	//    "C1" and "C2" the circles at p1 and p2, through p2 and p1
	//    "I1" and "I2", the points where C1 and C2 intersect, where I1 is closer to "above"
	midpoint: function(p1, p2, pAbove) {
		var c1 = this.pg.circle(p1, p2); 
		var c2 = this.pg.circle(p2, p1);

		var int1 = this.pg.first(c1, c2, pAbove); 
		var int2 = this.pg.second(c1, c2, pAbove); 
		var midLine = this.pg.line(int1, int2);
		var conr = this.pg.line(p1, p2); 
		var midpt = this.pg.first(midLine, conr, pAbove);   

		var result = {"MidPoint":midpt, "MidLine":midLine, "Connector":conr, "I1":int1, "I2":int2, "C1":c1, "C2":c2};
		return result;
	},
	midpoint_test: function(t) { 
		var p0 = this.pg.given(0.5,0.5); 
		var p1 = this.pg.given(0.5,0.3); 
		var p2 = this.pg.given(0.5,0.2); 
		var p3 = this.pg.given(0.5,0.1); 
		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9); 
		var md = this.midpoint(pA, pB, pC);
	},



	// given p1 and p2, two points, and pAbove, a third point, returns, 
	//    "Connector", the line through p1 and p2
	//    "Perpendicular", the line perpendicular to Connector through p1
	//    "C1" the circle at p1 through p2
	//    "P3" the line on Connector and C1, opposite p2
	//    "C2" and "C3", the circles around p2 and P3, through P3 and P2
	//    "PUp" and "PDown", the points where Perpendicular, C1, and C2 intersect, 
	//       where pUp is the intersection closer to "pAbove"
	perpendicular: function(p1, p2, pAbove) {
		var c1 = this.pg.circle(p1, p2); 
		var conector = this.pg.line(p1, p2);
		var p3 = this.pg.second(conector, c1, p2); 
		var mids = this.midpoint(p3, p2, pAbove);

		var result = {"Perpendicular":mids.MidLine, 
						  "Connector":mids.Connector,
						  		"P3":p3,
						   	    "PUp":mids.I1,   
						   	    "PDown":mids.I2,   
						   	    "C1":c1,   
						   	    "C2":mids.C1,   
						   	    "C3":mids.C2
						   	};
		return result;
	},
	perpendicular_test: function(t) { 
		var p0 = this.pg.given(0.5,0.5); 
		var p1 = this.pg.given(0.5,0.3); 
		var p2 = this.pg.given(0.5,0.2); 
		var p3 = this.pg.given(0.5,0.1); 
		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9); 
		var md = this.perpendicular(pA,pB, pC);

	},


	goldenRatio: function(p1, p2, pAbove) { 
		var perps = this.perpendicular(p2,p1,pAbove);
		var c1 = this.pg.circle(p1,p2); 
		var pHi = this.pg.first(c1,perps.C1,pAbove); 
		var pLo = this.pg.second(c1,perps.C1,pAbove); 
		var midLn = this.pg.line(pHi, pLo);
		var midPt = this.pg.first(midLn, perps.Connector, pAbove);
		var cMid = this.pg.circle(p2,midPt); 
		var triHi = this.pg.first(cMid,perps.Perpendicular, pAbove);
		var hyp = this.pg.line(p1,triHi); 
		var cHi = this.pg.circle(triHi, p2); 
		var pRat = this.pg.first(cHi,hyp,p1); 
		var cRat = this.pg.circle(p1,pRat); 
		var pG = this.pg.first(perps.Connector,cRat, pRat); 

		var result = {
			"P1":p1, "P2":p2, "PG":pG, "CG":cRat,
			"PMid":midPt, "LMid":midLn, "CMid":cMid,
			"Perpendicular":perps.Perpendicular, "Connector":perps.Connector,
			"C1":c1, "C2":perps.C1, "Hypotenuse":hyp
		};
		return result;

	},
	goldenRatio_test: function(t) { 
//		var pA = this.pg.given(0.5,0.5); 
//		var pB = this.pg.given(0.5,0.2); 
//		var pC = this.pg.given(0.9,0.1); 

		var p0 = this.pg.given(0.5,0.5); 
		var p1 = this.pg.given(0.5,0.43); 
		var p2 = this.pg.given(0.5,0.36); 
		var p3 = this.pg.given(0.5,0.07);
		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 
		var md = this.goldenRatio(pA,pB,pC);
	},




	// given p1 and p2, two points, and t, a line or circle
	// return n points, each named "P1" through "Pn", equally spaced, on t
	//        and n circles, each named "C1"-"Cn"
	//        P1 = p1, p2 = p2 
	series: function(n, p1,p2, t) {
		var i; 

		var c1 = this.pg.circle(p1, p2);
		var Ci, Pi, Pim, Pip, Cname, Pname; 
		Pim = p1; // p(i-1)
		Pi = p2; // pi
		var result = {"P1":p1, "C1":c1}; 
		for (i=2; i<(n+1); i=i+1) { 
			Cname = "C" + i; 
			Pname = "P" + i; 
			Ci = this.pg.circle(Pi, Pim);
			Pip = this.pg.second(t, Ci, Pim);  // p(i+1)=Pip
			result[Pname] = Pi;
			result[Cname] = Ci;
			Pim = Pi; 
			Pi = Pip; 
		}
		return result;
	},
	series_test: function(t) { 
		var p0 = this.pg.given(0.5,0.5); 
		var p2 = this.pg.given(0.5,0.3); 
		var p3 = this.pg.given(0.5,0.25); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 

		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9); 

		var l1 = this.pg.line(pC, pB);
		var md = this.series(10, pC, pB, l1);
	},



	// given p1 and p2, two points, 
	// return n points, each named "P1" through "Pn", equally spaced, 
	// on the line connecting p1 and p2
	//        and n circles, each named "C1"-"Cn"
	//        P1 = p1, p2 = p2 
	subdivide: function(n, p1,p2) {
		var c1 = this.pg.circle(p1,p2);
		var c2 = this.pg.circle(p2,p1);
		var conn = this.pg.line(p1,p2); 
		var pUp = this.pg.first(c1,c2, p1); // don't know or care which we get 
		var pDn = this.pg.second(c1,c2, p1); // as long as this is the other one
		var ln1 = this.pg.line(p1,pUp);
		var ln2 = this.pg.line(p2,pDn);

		// getting a smaller length than p1-p2 would improve accuracy
		// not a concern yet.
		var ser1 = this.series(n, p1,pUp, ln1);
		var ser2 = this.series(n, p2,pDn, ln2);

		var result = {"P1":p1, "Connector":conn };
		var i, backwards, name1, name2, pA, pB, lnC, pC; 
		for (i=2; i<=n; i=i+1) {
			backwards = (n+2)-i;  
			name1 = "P" + i; 
			name2 = "P" + backwards; 
			pA = ser1[name1];
			pB = ser2[name2];
			lnC = this.pg.line(pA,pB); 
			pC = this.pg.first(lnC, conn, p1);
			result[name1] = pC;
		}
		return result;
	},
	subdivide_test: function(t) { 
//		var pA = this.pg.given(0.3,0.5); 
//		var pB = this.pg.given(0.7,0.5); 

		var p0 = this.pg.given(0.5,0.5); 
		var p2 = this.pg.given(0.5,0.05); 
		var p3 = this.pg.given(0.5,0.1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 

		var pA = this.pg.addParametricPoint(c2, t*1.1); 
		var pB = this.pg.addParametricPoint(c3, t*.9); 

		var l1 = this.subdivide(5, pA, pB);
	},





	// given p1 and p2 defining a circle, a third point p3, outside the circle, 
	//   and a fourth point, pAbove, 
	// return L1 and L2, the two lines tangent to the circle through the point, 
	// and PT1 and PT2, the two tangent points. 
	//  PT1 is the tangent point closest to pAbove
	tangents: function(p1,p2,p3, pAbove) {
		var mids = this.midpoint(p1, p3, pAbove);
		var midPt = mids.MidPoint;
		var c1 = this.pg.circle(p1,p2);
		var c2 = this.pg.circle(midPt, p1); // circle at p1 through p3
		var pt1 = this.pg.first(c1, c2, pAbove);
		var pt2 = this.pg.second(c1, c2, pAbove);
		var l1 = this.pg.line(p3,pt1);
		var l2 = this.pg.line(p3,pt2);
		var result = {"L1":l1, "L2":l2, "PT1":pt1, "PT2":pt2}; 
		return result;
	},
	tangents_test: function(t) { 
		var p0 = this.pg.given(0.5,0.5); 
		var p1 = this.pg.given(0.5,0.4); 
		var p2 = this.pg.given(0.5,0.3); 
		var p3 = this.pg.given(0.5,0.1);
		var pAbove = this.pg.given(0.1,0.1); 
		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 
		var md = this.tangents(pA,pB,pC, pAbove);
	},


	// given points p1,p2,and p3, defining an angle p1,p2,p3, 
	// (p2 being the intersection of thelines p1-p2 and p2-p3),
	// return a line "Bisector", through points p2 and P4, that 
	// bisects p1p2p3.
	angleBisection: function(p1,p2,p3, pAbove) {
		var ln1 = this.pg.line(p2, p1);
		var ln3 = this.pg.line(p2, p3);

		var c1 = this.pg.circle(p2, p1); 
		var eqp3 = this.pg.first(c1, ln3, p3);

		var midpoint = this.midpoint(p1, eqp3, pAbove);
		var result = {"Bisector":midpoint.MidLine, "MidPoint":midpoint.MidPoint}; 
		return result;
	},
	angleBisection_test: function(t) { 
		var p0 = this.pg.given(0.5,0.5); 
		var p1 = this.pg.given(0.5,0.4); 
		var p2 = this.pg.given(0.5,0.3); 
		var p3 = this.pg.given(0.5,0.1);
		var pAbove = this.pg.given(0.1,0.1); 
		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 
		var md = this.angleBisection(pA,pB,pC,pAbove);
	},



	/////////////////////// equilateral triangles
	// triInCircle: use hexagonInCircle; minimal hex construction is the same
	// triOnLine: use midpoint; result is p1, p2, mids["I1"]; 
	equilateralOnLine: function(p1, p2, pAbove) {
		var c1 = this.pg.circle(p1, p2); 
		var c2 = this.pg.circle(p2, p1);
		var p3 = this.pg.first(c1, c2, pAbove); 
		var result = {
			"P1":p1, "P2":p2, "P3":p3, "C1":c1, "C2":c2};
		return result;
	},
	equilateralOnLine_test: function(t) { 
		var p0 = this.pg.given(0.5,0.5); 
		var p1 = this.pg.given(0.5,0.4); 
		var p2 = this.pg.given(0.5,0.3); 
		var p3 = this.pg.given(0.5,0.1);
		var pAbove = this.pg.given(0.1,0.1); 
		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 

		var md = this.midpoint(pA, pB, pC);
	},
	// triAcrossLine: use  hex


	// From Euclid! How to make a circle around a point (p1) that has the 
	// same radius as a first circle (p2,p3)
	circleTransfer: function(p1, pc1, pc2) {
		var c23 = this.pg.circle(pc1, pc2); // to be transferred
		var c12 = this.pg.circle(p1,pc1); 
		var c21 = this.pg.circle(pc1,p1); // to make an equilateral triangle
		var p4 = this.pg.first(c12,c21,pc2); // doesn't matter which
		var ln41 = this.pg.line(p4,p1);
		var ln42 = this.pg.line(p4,pc1);
		var p1Ext = this.pg.second(c23, ln42, p4); // dist p4-p1Ext= p2-p3 + p1-p2 
		var cExt = this.pg.circle(p4, p1Ext); 
		var p5 = this.pg.first(cExt, ln41, p1); 
		var cGoal = this.pg.circle(p1,p5); 

		var result = {
			"P1":p1, "PC1":pc1, "PC2":pc2, "PEq":p4, "C1":c12, "C2":c21, "CNew":cGoal};
		return result;
	},
	circleTransfer_test: function(t) { 
//		var pA = this.pg.given(0.5,0.5); 
//		var pB = this.pg.given(0.3,0.4); 
//		var pC = this.pg.given(0.3,0.3); 
		this.pg.setGroupColor(2, "#00f");
		var p0 = this.pg.given(0.4,0.5); 
		var p1 = this.pg.given(0.4,0.4); 
		var p2 = this.pg.given(0.5,0.5); 
		var p3 = this.pg.given(0.5,0.4); 
		var p4 = this.pg.given(0.6,0.5); 
		var p5 = this.pg.given(0.6,0.4); 
		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p2,p3); 
		var c3 = this.pg.circle(p4,p5); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 

		var md = this.circleTransfer(pA, pB, pC);
		this.pg.setGroup(md.CNew, 2);
	},







	sublimeTriangleFromLong: function(p1, p2, pAbove) { 
		var gr = this.goldenRatio(p1,p2,pAbove);
		gr["P3"] = this.pg.first(gr.CG, gr.C2, pAbove); 
		// Fie, Javascript! Thou host and font of barbarism! 
		return gr;
	},
	sublimeTriangleFromLong_test: function(t) { 
//		var pA = this.pg.given(0.5,0.5); 
//		var pB = this.pg.given(0.5,0.2); 
//		var pC = this.pg.given(0.9,0.1); 

		var p0 = this.pg.given(0.5,0.5); 
		var p1 = this.pg.given(0.5,0.43); 
		var p2 = this.pg.given(0.5,0.36); 
		var p3 = this.pg.given(0.5,0.07);
		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 
		var md = this.sublimeTriangleFromLong(pA,pB,pC);
	},



	sublimeTriangleFromShort: function(p1, p2, pAbove) { 
		var stl = this.sublimeTriangleFromLong(p1,p2,pAbove);
		var ln13 = this.pg.line(stl.P3,p1);
		var newP3 = this.pg.first(ln13,stl.LMid, pAbove);
		stl["P4"] = stl.P3;
		stl["P3"] = newP3;

		return stl;
	},
	sublimeTriangleFromShort_test: function(t) { 
//		var pA = this.pg.given(0.5,0.5); 
//		var pB = this.pg.given(0.5,0.3); 
//		var pC = this.pg.given(0.9,0.1); 

		var p0 = this.pg.given(0.5,0.5); 
		var p1 = this.pg.given(0.5,0.43); 
		var p2 = this.pg.given(0.5,0.36); 
		var p3 = this.pg.given(0.5,0.07);
		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 
		var md = this.sublimeTriangleFromShort(pA,pB,pC);
	},








	/////////////////////// squares
	/////////////////////// squares
	/////////////////////// squares

	// ngon in circle returns, not the sides, but the corners, and the
	// circles that generated them
	squareInCircle: function(p0, p12, pAbove) {
		var c0 = this.pg.circle(p0, p12); 
		var c12 = this.pg.circle(p12, p0); // naming after hours on clock face
		var l1 = this.pg.line(p0,p12); 
		var p6 = this.pg.second(c0,l1, p12); 
		var c6cr = this.pg.circle(p6, p12); 
		var c12cr = this.pg.circle(p12, p6);
		var p3cr = this.pg.first(c6cr, c12cr, pAbove); 
		var p9cr = this.pg.second(c6cr, c12cr, pAbove); 
		var crossLine = this.pg.line(p3cr, p9cr); 
		var p3 = this.pg.first(c0, crossLine, pAbove); 
		var p9 = this.pg.second(c0, crossLine, pAbove); 
		var result = {
				"P1":p12, "P2":p3, "P3":p6, "P4":p9, 
				"C0":c0, "C1":c12, "L13":l1, "L24":crossLine
			};
		return result;
	},
	squareInCircle_test: function(t) { 
		var p0 = this.pg.given(0.5,0.5); 
		var p1 = this.pg.given(0.5,0.4); 
		var p2 = this.pg.given(0.5,0.3); 
		var p3 = this.pg.given(0.5,0.1);
		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 

		var md = this.squareInCircle(pA, pB, pC); 
	},


	// two points => square using them as a side
	squareOnLine: function(p1, p2, pAbove) {
		var c1 = this.pg.circle(p1, p2); 
		var c2 = this.pg.circle(p2, p1);
		var ln01 = this.pg.line(p1,p2); 
		var p0 = this.pg.second(c1, ln01, p2); 
		var p3 = this.pg.second(c2, ln01, p1); // next points out on line
		var c02 = this.pg.circle(p0,p2);
		var c20 = this.pg.circle(p2,p0); 
		var c13 = this.pg.circle(p1,p3); 
		var c31 = this.pg.circle(p3,p1); // circles for perpendiculars
		var pHigh1 = this.pg.first(c02,c20,pAbove); 
		var pHigh2 = this.pg.first(c13,c31,pAbove); 
		var ln1 = this.pg.line(p1,pHigh1);
		var ln2 = this.pg.line(p2,pHigh2); // perpendicular lines
		var pUp1 = this.pg.first(ln1,c1,pAbove); 
		var pUp2 = this.pg.first(ln2,c2,pAbove); // the other corners
		var ln3 = this.pg.line(pUp1,pUp2); 
		var result = {
			"P1":p1, "P2":p2, "P3":pUp2, "P4":pUp1, 
			"L12":ln01, "L23":ln2, "L34":ln3, "L41":ln1, 
			"C1":c1, "C2":c2
		};
		return result;
	},
	squareOnLine_test: function(t) { 		
		var p0 = this.pg.given(0.5,0.5); 
		var p1 = this.pg.given(0.5,0.4); 
		var p2 = this.pg.given(0.5,0.3); 
		var p3 = this.pg.given(0.5,0.1);
		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 
		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 

		var md = this.squareOnLine(pA, pB, pC); 
	},


	// two points => line => square for which the line is a diagonal
	squareAcrossLine: function(p1, p3, pAbove) {
		var mids = this.midpoint(p1,p3,pAbove); 
		// {"MidPoint":midpt, "MidLine":midLine, "Connector":conr, "I1":int1, "I2":int2, "C1":c1, "C2":c2};
		var pmid = mids.MidPoint;
		var lnmid = mids.MidLine;
		var cMid = this.pg.circle(pmid, p1); 
		var p2 = this.pg.first(cMid,lnmid, pAbove); 
		var p4 = this.pg.second(cMid,lnmid, pAbove); 
		var result = {
			"P1":p1, "P2":p2, "P3":p3, "P4":p4,
			"L13":mids.Connector, "LN24":lnmid, "C1":mids.C1, "C2":mids.C2
		};
		return result;
	},
	squareAcrossLine_test: function(t) { 
		var p0 = this.pg.given(0.5,0.5); 
		var p1 = this.pg.given(0.5,0.4); 
		var p2 = this.pg.given(0.5,0.3); 
		var p3 = this.pg.given(0.5,0.1);
		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 

		var md = this.squareAcrossLine(pA, pB, pC); 
	},







	/////////////////////// parallelograms
	/////////////////////// 
	/////////////////////// 


	// given 3 points, add a 4th that make a parallelogram. 
	// but there are 4 possible ||grams for any triangle! 
	// find p4 that is on the opposite side of the line p1,p3
	completeParallelogram: function(p1,p2,p3) {
		var mid = this.midpoint(p1,p3,p2);
		// var result = {"MidPoint":midpt, "MidLine":midLine, "Connector":conr, "I1":int1, "I2":int2, "C1":c1, "C2":c2};
		var midPt = mid.MidPoint;
		var midline = this.pg.line(p2,midPt); 
		var cFinder = this.pg.circle(midPt,p2);
		var p4 = this.pg.second(cFinder,midline,p2);
		var result = { "P1":p1, "P2":p2, "P3":p3, "P4":p4 };
		return result; 
	},
	completeParallelogram_test: function(t) { 
		var p0 = this.pg.given(0.4,0.5); 
		var p1 = this.pg.given(0.4,0.3); 
		var p2 = this.pg.given(0.5,0.5); 
		var p3 = this.pg.given(0.5,0.3); 
		var p4 = this.pg.given(0.6,0.5); 
		var p5 = this.pg.given(0.6,0.3);

		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p2,p3); 
		var c3 = this.pg.circle(p4,p5); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 

		var md = this.completeParallelogram(pA, pB, pC); 

		var ln1 = this.pg.line(md.P1, md.P2);
		var ln1 = this.pg.line(md.P1, md.P4);
		var ln1 = this.pg.line(md.P3, md.P2);
		var ln2 = this.pg.line(md.P3, md.P4);
	},







	/////////////////////// golden rectangles
	/////////////////////// golden rectangles
	/////////////////////// golden rectangles
	// two points-> line -> golden rectangle from the square defined by those two lines,
	// extended along the line.
	goldenOnLine1: function(p1,p2, pAbove) {
		var ln1 = this.pg.addLine(p1, p2); // draw a line through them
		var c1 = this.pg.addCircle(p1, p2); // draw circles thru both both ways
		var c2 = this.pg.addCircle(p2, p1); 
	
		var p3 = this.pg.addSecondIntersection(c1, ln1, p2); 		// points on the outside
		var p4 = this.pg.addSecondIntersection(c2, ln1, p1); 
	
		var c3 = this.pg.addCircle(p3, p2); 		// big circles
		var c4 = this.pg.addCircle(p1, p4); 
		var c5 = this.pg.addCircle(p2, p3); 
		var c6 = this.pg.addCircle(p4, p1); 
	
		var p5 = this.pg.addSecondIntersection(c1, c2, p4); // gives the lower of the two
		var p6 = this.pg.addFirstIntersection(c5, c3, p5); 
		var p7 = this.pg.addFirstIntersection(c6, c4, p5); 
		var p8 = this.pg.addFirstIntersection(c1, c2, p4); 
	
		var ln2 = this.pg.addLine(p1, p6); 
		var ln3 = this.pg.addLine(p2, p7); 
		var ln4 = this.pg.addLine(p5, p8); 
	
		var p9 = this.pg.addFirstIntersection(c1, ln2, p5); 
		var p10 = this.pg.addFirstIntersection(c2, ln3, p5); 
		var ln5  = this.pg.addLine(p9, p10); // lower edge
	
		var p11 = this.pg.addFirstIntersection(ln1, ln4, p5); // paydirt
		var p12 = this.pg.addFirstIntersection(ln5, ln4, p5); 
		var c7 = this.pg.addCircle(p11, p10); 
		var c8 = this.pg.addCircle(p12, p2);  

		var p13 = this.pg.addFirstIntersection(c7, ln1, p4); 
		var p14 = this.pg.addFirstIntersection(c8, ln5, p4); 
		var ln6 = this.pg.addLine(p13, p14); 

		var res = { "P1":p1, "P2":p2, "P3":p3, "P4":p4 };
		return res; 
	},
	goldenOnLine_test: function(t) { 
		var p0 = this.pg.given(0.4,0.5); 
		var p1 = this.pg.given(0.4,0.3); 
		var p2 = this.pg.given(0.5,0.5); 
		var p3 = this.pg.given(0.5,0.3); 
		var p4 = this.pg.given(0.6,0.5); 
		var p5 = this.pg.given(0.6,0.3);

		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p2,p3); 
		var c3 = this.pg.circle(p4,p5); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 

		var md = this.goldenOnLine1(pA, pB); 

		var ln1 = this.pg.line(md.P1, md.P2);
		var ln1 = this.pg.line(md.P1, md.P4);
		var ln1 = this.pg.line(md.P3, md.P2);
		var ln2 = this.pg.line(md.P3, md.P4);
	},


	// puts the short side on the line
	goldenOnLine2: function(p1,p2, pAbove) {
		var ln1 = this.pg.line(p1, p2); // draw a line through them
		var c1 = this.pg.circle(p1, p2); // draw circles thru both both ways
		var c2 = this.pg.circle(p2, p1); 
	
		var pOuter1 = this.pg.second(c1, ln1, p2); 		// points on the outside
		var pOuter2 = this.pg.second(c2, ln1, p1); 
	
		var cb1a = this.pg.circle(pOuter1, p2); 		// perp lines thru p1 p2
		var cb1b = this.pg.circle(p2, pOuter1); 
		var cb2a = this.pg.circle(p1, pOuter2); 
		var cb2b = this.pg.circle(pOuter2, p1); 
	
		var p1hi = this.pg.first(cb1a, cb1b, pAbove); // gives the lower of the two
		var p2hi = this.pg.first(cb2a, cb2b, pAbove); 
		
		var lnprp1 = this.pg.line(p1, p1hi); 
		var lnprp2 = this.pg.line(p2, p2hi); 

		var pSq1 = this.pg.first(lnprp1, c1, pAbove);
		var pSq2 = this.pg.first(lnprp2, c2, pAbove); 
		var c1hi = this.pg.circle(pSq1, p1);
		var c2hi = this.pg.circle(pSq2, p2);

		var pMid1 = this.pg.first(c1,c1hi, p2);
		var pMid2 = this.pg.first(c2,c2hi, p1);
		var lnMid = this.pg.line(pMid1, pMid2);

		var pgold1 = this.pg.first(lnMid, lnprp1, pAbove);
		var pgold2 = this.pg.first(lnMid, lnprp2, pAbove);
		var cgold1 = this.pg.circle(pgold2,p1);
		var cgold2 = this.pg.circle(pgold1,p2);

		var p3 = this.pg.first(cgold1, lnprp2, p2hi); 
		var p4 = this.pg.first(cgold2, lnprp1, p1hi); 
		var res = { "P1":p1, "P2":p2, "P3":p3, "P4":p4,
			 "L12":ln1, "L23":lnprp2, "L41":lnprp1, "C1":c1, "C2":c2, "PSQ1":pSq1, "PSQ2":pSq2 };
		return res; 
	},
	goldenOnLine2_test: function(t) { 
		var p0 = this.pg.given(0.33,0.33); 
		var p1 = this.pg.given(0.33,0.415); 
		var p2 = this.pg.given(0.33,0.5); 
		var p3 = this.pg.given(0.33,0.66);

		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 

		var md = this.goldenOnLine2(pA, pB, pC); 

		var ln34 = this.pg.line(md.P3, md.P4);
		// obligatory: YES, THIS IS GOLDEN

		var md2 = this.goldenOnLine2(md.P4, md.PSQ1, md.P3);
	},


	// puts the long side on the line
	// I don't have a direct construction for this
	//   but the gOL2 routine can be used; the gr's gnomon is a square
	goldenOnLine3: function(p1,p2, pAbove) {
		var gsh = this.goldenOnLine2(p1,p2,pAbove); 
		p3big = gsh.P3; 
		p4big = gsh.P4; 
		ln23 = gsh.L23;
		ln41 = gsh.L41;
		var c3 = this.pg.circle(p3big, p4big); // make a sq from the top two points of the larger GR
		var c4 = this.pg.circle(p4big, p3big); 
		var p3 = this.pg.first(c4, ln41, p1); 
		var p4 = this.pg.first(c3, ln23, p1); 
		var res = { "P1":p1, "P2":p2, "P3":p3, "P4":p4,
			 "L12":gsh.L12, "L23":gsh.L23, "L41":gsh.L41, "C1":gsh.C1, "C2":gsh.C2 };
		return res; 
	},
	goldenOnLine3_test: function(t) { 
		var p0 = this.pg.given(0.33,0.33); 
		var p1 = this.pg.given(0.33,0.415); 
		var p2 = this.pg.given(0.33,0.5); 
		var p3 = this.pg.given(0.33,0.66);

		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 

		var md = this.goldenOnLine3(pA, pB, pC); 

		var ln34 = this.pg.line(md.P3, md.P4);
	},






	/////////////////////// pentagons
	/////////////////////// pentagons
	/////////////////////// pentagons
	pentagonInCircle: function(p0, p360, pAbove) {
		var c0 = this.pg.circle(p0, p360); 
		var ln360 = this.pg.line(p0, p360);
		var p180 = this.pg.second(c0, ln360, p360);

		var c360_2 = this.pg.circle(p360, p180); 
		var c180_2 = this.pg.circle(p180, p360); 

		var p90_2 = this.pg.first(c360_2, c180_2, pAbove);
		var p270_2 = this.pg.second(c360_2, c180_2, pAbove);
		var equator = this.pg.line(p90_2, p270_2);

		var p90 = this.pg.first(equator, c0, pAbove); 
		var c90 = this.pg.circle(p90, p0); 
		var pMidsHi = this.pg.first(c90,c0, pAbove); 
		var pMidsLo = this.pg.second(c90,c0, pAbove); 

		var lnMids = this.pg.line(pMidsHi, pMidsLo); 

		var pHalfRadius = this.pg.first(lnMids, equator, pAbove);
		var cA = this.pg.circle(pHalfRadius, p360);
		var pPent = this.pg.first(equator, cA, p0);

		var cPent360 = this.pg.circle(p360, pPent); 
		var  p72 = this.pg.first(c0, cPent360, pAbove); 

		var ser = this.series(5, p360, p72, c0);
		var result = {
				"P0":p360, "P1":p360, "P2":p72, "P3":ser["P3"], "P4":ser["P4"], "P5":ser["P5"],
				"C0":cPent360, "C1":ser["C2"], "C2":ser["C3"], "C3":ser["C4"], "C4":ser["C5"], 
			};
		return result;

	},
	pentagonInCircle_test: function(t) { 
		var p0 = this.pg.given(0.5,0.5); 
		var p1 = this.pg.given(0.5,0.4); 
		var p2 = this.pg.given(0.5,0.3); 
		var p3 = this.pg.given(0.5,0.1);
		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 
		var md = this.pentagonInCircle(pA,pB, pC);

		var ln1 = this.pg.line(md.P1, md.P2);
		var ln1 = this.pg.line(md.P2, md.P3);
		var ln1 = this.pg.line(md.P3, md.P4);
		var ln2 = this.pg.line(md.P4, md.P5);
		var ln2 = this.pg.line(md.P5, md.P1);

	},

	


	// two points => pentagon using them as a side
	pentagonOnLine: function(p1, p2, pAbove) {
		var c1 = this.pg.circle(p1,p2);
		var c2 = this.pg.circle(p2,p1);
		var ln12 = this.pg.line(p1,p2); 

		// get midpt
		var pHi = this.pg.first(c1,c2, pAbove); 
		var pLo = this.pg.second(c1,c2, pAbove); 
		var midLn = this.pg.line(pHi, pLo); 
		var center = this.pg.first(ln12, midLn, pAbove); 

		// get perp lines from p1, p2
		var p0 = this.pg.second(c1, ln12, p2); 
		var p3 = this.pg.second(c2, ln12, p1);
		var cP0 = this.pg.circle(p0,p2);
		var cP1 = this.pg.circle(p1,p3);
		var cP2 = this.pg.circle(p2,p0);
		var cP3 = this.pg.circle(p3,p1);
		var p1Hi = this.pg.first(cP0,cP2, pAbove);
		var p2Hi = this.pg.first(cP1,cP3, pAbove);
		var lnP1 = this.pg.line(p1, p1Hi); 
		var lnP2 = this.pg.line(p2, p2Hi); 

		// corners of square abve p1p2
		var pSq1 = this.pg.first(lnP1, c1, pAbove); 
		var pSq2 = this.pg.first(lnP2, c2, pAbove); 

		// the meat!
		var cPent = this.pg.circle(center, pSq1); 
		var pG = this.pg.first(cPent, ln12, p1); 
		var pH = this.pg.first(cPent, ln12, p2); 
		var cG = this.pg.circle(p1,pH); 
		var cH = this.pg.circle(p2,pG); 

		var pPent3 = this.pg.first(cG, c2, pAbove); 
		var pPent4 = this.pg.first(cG, cH, pAbove); 
		var pPent5 = this.pg.first(cH, c1, pAbove); 

		var res = { "P1":p1, "P2":p2, "P3":pPent3, "P4":pPent4, "P5":pPent5, "P0":center, 
			"Ln12":ln12, "LnMid":midLn, "CPent":cPent
		};
		return res; 
	},
	pentagonOnLine_test: function(t) { 
		var p0 = this.pg.given(0.5,0.5); 
		var p1 = this.pg.given(0.5,0.4); 
		var p2 = this.pg.given(0.5,0.3); 
		var p3 = this.pg.given(0.5,0.1);
		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 

		var md = this.pentagonOnLine(pA, pB, pC); 
		var ln1 = this.pg.line(md.P1, md.P2);
		var ln1 = this.pg.line(md.P2, md.P3);
		var ln1 = this.pg.line(md.P3, md.P4);
		var ln2 = this.pg.line(md.P4, md.P5);
		var ln2 = this.pg.line(md.P5, md.P1);

	},

	// pentagon across line
	// two points => pentagon using them as a side

	pentagonAcrossLine: function(p1, p3, pAbove) {
		var stl = this.sublimeTriangleFromLong(p1,p3,pAbove);
//			"P1":p1, "P2":p2, "PG":pG, "CG":cRat,
//			"PMid":midPt, "LMid":midLn, "CMid":cMid,
//			"Perpendicular":perps.Perpendicular, "Connector":perps.Connector,
//			"C1":c1, "C2":perps.C1, "Hypotenuse":hyp
		var c5 = this.pg.circle(stl.P3, p1);
		var pbis = this.pg.first(c5, stl.CG, p3);
		var bLn = this.pg.line(p3, pbis); 
		var p0 = this.pg.first(stl.LMid, bLn, pAbove);
		var c0 = this.pg.circle(p0, p1);
		var p2 = this.pg.first(stl.LMid,c0, stl.PMid);
		var p4  = this.pg.second(c0, c5, p1);
		stl["P5"] = stl.P3; 
		stl["P4"] = p4; 
		stl["P3"] = p3; 
		stl["P2"] = p2; 
		stl["P2"] = p2; 
		stl["P0"] = p0; 
		stl["C0"] = c0; // complex; many different circles available. 
		return stl; 
	},
	pentagonAcrossLine_test: function(t) { 
//		var pA = this.pg.given(0.5,0.5); 
//		var pB = this.pg.given(0.5,0.2); 
//		var pC = this.pg.given(0.9,0.1); 
		var p0 = this.pg.given(0.5,0.5); 
		var p1 = this.pg.given(0.5,0.43); 
		var p2 = this.pg.given(0.5,0.36); 
		var p3 = this.pg.given(0.5,0.07);
		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 
		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 
		var md = this.pentagonAcrossLine(pA,pB,pC);
	},






	/////////////////////// hexagons
	/////////////////////// hexagons
	/////////////////////// hexagons

	// and 6 points on C1, from which a regular hexagon may be inscribed,
	// Clockwise vs counterclockwise: C2 will be closer to pAbove, and the last c, farther away
	hexagonInCircle: function(p0, p12,pAbove) {
		var c0 = this.pg.circle(p0, p12); 
		var c12 = this.pg.circle(p12, p0); // named for place on clock face
		var p2 = this.pg.first(c0, c12, pAbove);

		var ser = this.series(6, p12,p2, c0);

		var result = {
				"P1":p12, "P2":p2, "P3":ser.P3, "P4":ser.P4, "P5":ser.P5, "P0":p0, 
				"C1":c12, "C2":ser.C2, "C3":ser.C3, "C4":ser.C4, "C5":ser.C5, "C6":ser.C6, 
			};
		return result;
	},
	hexagonInCircle_test: function(t) { 
		var p0 = this.pg.given(0.5,0.5); 
		var p1 = this.pg.given(0.5,0.4); 
		var p2 = this.pg.given(0.5,0.3); 
		var p3 = this.pg.given(0.5,0.1);
		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 
		var md = this.hexagonInCircle(pA,pB,pC);
	},


	hexagonOnLine: function(p1, p2,pAbove) {
		var c1 = this.pg.circle(p1,p2); 
		var c2 = this.pg.circle(p2,p1); 
		var p0 = this.pg.first(c1,c2,pAbove); 
		var c0 = this.pg.circle(p0,p1); 

		var p3 = this.pg.second(c0,c2,p1); 
		var p6 = this.pg.second(c0,c1,p2); 

		var c3 = this.pg.circle(p3,p2); 
		var c6 = this.pg.circle(p6,p1); 

		var p4 = this.pg.second(c0,c3,p2); 
		var p5 = this.pg.second(c0,c6,p1); 

		var result = {
				"P0":p0,   "P1":p1, "P2":p2, "P3":p3, "P4":p4, "P5":p5, "P6":p6,  
				"C0":c0,   "C1":c1, "C2":c2, "C3":c3, "C6":c6  // didn't make c4 or c5!!! 
			};
		return result;
	},
	hexagonOnLine_test: function(t) { 
		var p0 = this.pg.given(0.5,0.5); 
		var p1 = this.pg.given(0.5,0.4); 
		var p2 = this.pg.given(0.5,0.3); 
		var p3 = this.pg.given(0.5,0.1);
		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 
		var md = this.hexagonOnLine(pA,pB,pC);
		var ln = this.pg.line(pA, pB); 
	},




	hexagonAcrossLine: function(p1, p3,pAbove) {
		// make an eq triangle from p1 p2
		var c1 = this.pg.circle(p1,p3); 
		var c3 = this.pg.circle(p3,p1); 
		var p5 = this.pg.first(c1,c3,pAbove); 
		var c5 = this.pg.circle(p5,p1); 

		// lines through circle intersections intersect at circle's center
		var p13a = this.pg.first(c1,c3,pAbove); 
		var p13b = this.pg.second(c1,c3,pAbove); 
		var diameter25 = this.pg.line(p13a, p13b); 

		var p15a = this.pg.first(c1,c5,pAbove); 
		var p15b = this.pg.second(c1,c5,pAbove); 
		var diameter36 = this.pg.line(p15a, p15b); 

		var p0 = this.pg.first(diameter25,diameter36, pAbove); 
		var c0 = this.pg.circle(p0,p1); 

		var p2 = this.pg.second(c0,diameter25,p5); 
		var p6 = this.pg.second(c0,diameter36,p3); 

		var diameter14 = this.pg.line(p1,p0); 
		var p4 = this.pg.second(c0,diameter14,p1); 

		var result = {
				"P0":p0,   "P1":p1, "P2":p2, "P3":p3, "P4":p4, "P5":p5, "P6":p6,  
				"C0":c0,   "C1":c1, "C3":c3, "C5":c5, "L25":diameter25, "L36":diameter36, "L14":diameter14	};
		return result;
	},
	hexagonAcrossLine_test: function(t) { 
		var p0 = this.pg.given(0.5,0.5); 
		var p1 = this.pg.given(0.5,0.4); 
		var p2 = this.pg.given(0.5,0.3); 
		var p3 = this.pg.given(0.5,0.1);
		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 
		var md = this.hexagonAcrossLine(pA,pB,pC);
		var ln = this.pg.line(pA,pB); 
	},


	// given two points, hexagon with opposite corners through those points
	hexagonAcrossLine2: function(p1, p4,pAbove) {
		var mids = this.midpoint(p1,p4,pAbove); 
		var midPt = mids.MidPoint; 
		return this.hexagonInCircle(midPt, p1, pAbove); 
	},
	hexagonAcrossLine2_test: function(t) { 
		var p0 = this.pg.given(0.5,0.5); 
		var p1 = this.pg.given(0.5,0.3); 
		var p2 = this.pg.given(0.5,0.333); 
		var p3 = this.pg.given(0.5,0.1666);
		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 
		var md = this.hexagonAcrossLine2(pA,pB,pC);
	},





	/////////////////////// heptagons
	/////////////////////// heptagons
	/////////////////////// heptagons
	// construction by John Mitchel, as shown in Jon Allen's "Construction Geometry"
	// "99.7%" accurate-- well, ok, till I find a better one, which I won't.
	heptagonInCircle: function(p0, p360,pAbove) {
		var perp = this.perpendicular(p0,p360, pAbove); 
		var diameter180 = perp.Perpendicular;
		var diameter0 = perp.Connector;
		var p180 = perp.P3;

		var c360 = this.pg.circle(p360, p0); 
		var c0 = perp.C1;
		var p90 = this.pg.first(c0, diameter180, pAbove);
		var c90 = this.pg.circle(p90, p0); 
		var p270 = this.pg.second(c0, diameter180, pAbove);
		var c270 = this.pg.circle(p270, p0); 

		// construction issue! can't depend on pAbove to get the intersection outside of c0 
		var pSq1 = this.pg.second(c360,c270,p0);
		var pSq2 = this.pg.second(c360,c90,p0);

		var goalArc1 = this.pg.circle(pSq1, pSq2); 
		var goalArc2 = this.pg.circle(pSq2, pSq1); 
		var goalPt = this.pg.first(goalArc1, goalArc2, p0);

		var lnForP2 = this.pg.line(goalPt, pSq2); 
		var p2 = this.pg.first(c0, lnForP2, pSq2);
		var ser = this.series(7, p360,p2, c0);

		var result = {
				"P1":p360, "P2":p2, "P3":ser.P3, "P4":ser.P4, "P5":ser.P5, "P6":ser.P6, "P7":ser.P7, "P0":p0, 
				"C0":c0, "C1":c360, "C2":ser.C2, "C3":ser.C3, "C4":ser.C4, "C5":ser.C5, "C6":ser.C6, "C7":ser.C7, 
			};
		return result;
	},
	heptagonInCircle_test: function(t) { 
		var p0 = this.pg.given(0.5,0.5); 
		var p1 = this.pg.given(0.5,0.43); 
		var p2 = this.pg.given(0.5,0.36); 
		var p3 = this.pg.given(0.5,0.07);
		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 
		var md = this.heptagonInCircle(pA,pB,pC);

		var ln1 = this.pg.line(md.P1, md.P2);
		var ln1 = this.pg.line(md.P2, md.P3);
		var ln1 = this.pg.line(md.P3, md.P4);
		var ln1 = this.pg.line(md.P4, md.P5);
		var ln1 = this.pg.line(md.P5, md.P6);
		var ln1 = this.pg.line(md.P6, md.P7);
		var ln1 = this.pg.line(md.P7, md.P1);

	},
	/// you can use two points as corners




	/////////////////////// octagons
	/////////////////////// octagons
	/////////////////////// octagons


	octagonInCircle: function(p0, p360,pAbove) {
		var sqs = this.squareInCircle(p0, p360, pAbove); 
//				"P1":p12, "P2":p3, "P3":p6, "P4":p9, 
//				"C0":c0, "C1":c12, "L13":l1, "L24":crossLine
		var c2 = this.pg.circle(sqs.P2, p0, pAbove); 
		var c4 = this.pg.circle(sqs.P4, p0, pAbove); 
		var p2out = this.pg.second(c2,sqs.C1,p0); 
		var p8out = this.pg.second(c4,sqs.C1,p0);
		var diam26 = this.pg.line(p0,p2out);  
		var diam48 = this.pg.line(p0,p8out);  
		var p2 = this.pg.first(sqs.C0, diam26, p2out);
		var p6 = this.pg.second(sqs.C0, diam26, p2out);
		var p8 = this.pg.first(sqs.C0, diam48, p8out);
		var p4 = this.pg.second(sqs.C0, diam48, p8out);

		var result = {
				"P1":p360, "P2":p2, "P3":sqs.P2, "P4":p4, "P5":sqs.P3, "P6":p6, "P7":sqs.P4, "P8":p8, "P0":p0, 
				"C0":sqs.C0, "C1":sqs.C1, "C2":c2, "C4":c4,  
			};
		return result;

	},
	octagonInCircle_test: function(t) { 
		var p0 = this.pg.given(0.5,0.5); 
		var p1 = this.pg.given(0.5,0.43); 
		var p2 = this.pg.given(0.5,0.36); 
		var p3 = this.pg.given(0.5,0.07);
		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 
		var md = this.octagonInCircle(pA,pB,pC);
	},


	octagonOnLine: function(p1,p2,pAbove) {
		// pB=p1, pC=p2, pA=below p1  pD=above p2
		// make two rows of points abcd and circles abcd
		// big but straightforward
		var pB = p1; 
		var pC = p2; 
		var cB = this.pg.circle(p1,p2); 
		var cC = this.pg.circle(p2,p1); 
		var connecter = this.pg.line(p1,p2);
		var pA = this.pg.second(connecter, cB, pC); 
		var pD = this.pg.second(connecter, cC, pA); 
		var cA = this.pg.circle(pA, pB); 
		var cD = this.pg.circle(pD, pC); 
		var cBigA = this.pg.circle(pA, pC);
		var cBigB = this.pg.circle(pB, pD);
		var cBigC = this.pg.circle(pC, pA);
		var cBigD = this.pg.circle(pD, pB);
		var pHiB = this.pg.first(cBigA, cBigC, pAbove);
		var pHiC = this.pg.first(cBigB, cBigD, pAbove);
		var lPerpB = this.pg.line(pB, pHiB);
		var lPerpC = this.pg.line(pC, pHiC);
		// second row of points & circles has "Sq" in their names
		var pSqB = this.pg.first(lPerpB, cB, pAbove); 
		var pSqC = this.pg.first(lPerpC, cC, pAbove); 
		var cSqB = this.pg.circle(pSqB, pB);
		var cSqC = this.pg.circle(pSqC, pC);
		var pSqA = this.pg.second(cA, cSqB, pB);
		var pSqD = this.pg.second(cD, cSqC, pC);

		var diagUpB = this.pg.line(pB, pSqC);
		var diagUpC = this.pg.line(pC, pSqD);
		var diagDnB = this.pg.line(pB, pSqA);
		var diagDnC = this.pg.line(pC, pSqB);

		var p3 = this.pg.first(cC, diagUpC, pSqD);
		var p4 = this.pg.first(cSqC, diagUpB, pHiC);
		var p8 = this.pg.first(cB, diagDnB, pSqA);
		var p7 = this.pg.first(cSqB, diagDnC, pHiB);
		var c4 = this.pg.circle(p4,p3); 
		var c7 = this.pg.circle(p7,p8); 
		var p5 = this.pg.first(c4, lPerpC, pHiC);
		var p6 = this.pg.first(c7, lPerpB, pHiB);
		var ln26 = this.pg.line(p2,p6); 
		var ln15 = this.pg.line(p1,p5); 
		var p0 = this.pg.first(ln26, ln15, pAbove); 
		var	c0 = this.pg.circle(p0,p1);

		var result = {
				"P1":p1, "P2":p2, "P3":p3, "P4":p4, "P5":p5, "P6":p6, "P7":p7, "P8":p8, "P0":p0, 
				"C0":cB, "C1":cC, "C4":c4, "C7":c7, "L1":connecter, "L2":diagUpC, "L8":diagDnB  
			};
		return result;
	},
	octagonOnLine_test: function(t) { 
//		var pA = this.pg.given(0.5,0.5); 
//		var pB = this.pg.given(0.5,0.4); 
//		var pC = this.pg.given(0.9,0.1); 

		var p0 = this.pg.given(0.5,0.5); 
		var p1 = this.pg.given(0.5,0.43); 
		var p2 = this.pg.given(0.5,0.36); 
		var p3 = this.pg.given(0.5,0.07);
		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 
		var md = this.octagonOnLine(pA,pB,pC);
	},


	// correct 9-sided constructions are not known
	// 10-sided = pentagon from orthogonal diagonals
	// 11-sided not known
	// 12-sided


	/////////////////////// grids
	/////////////////////// grids
	/////////////////////// grids

	// returns a list of points and lines, named.
	// p1 and p2 give the side of a square; pAbv defines which side of the line p1p2 the square is on. 
	// the square is p1p2p3p4; the y-axis is the line p1p4
	gridFromTwoPoints: function(n, m, p1, p2, pAbove) { // p1=origin, p2=x-axis
		var sq = this.squareOnLine(p1, p2, pAbove);
		var p3 = sq.P3;
		var p4 = sq.P4;
		var xAxis = sq.L12;
		var lnx1 = sq.L34; // line for y=1
		var yAxis = sq.L41;
		var lny1 = sq.L23; // line for x=1

		var x0s = this.series(n, p1, p2, xAxis);
		var x1s = this.series(n, p4, p3, lnx1);
		var y0s = this.series(m, p1, p4, yAxis);
		var y1s = this.series(m, p2, p3, lny1);

		var i, j, xln, pName, lName, pA, pB, xs, ys;
		var res = {}
		xs=[];
		xs[0] = xAxis;
		xs[1] = lnx1; 
		res.LX0 = xAxis; 
		res.LX1 = lnx1; 
		ys=[]; 
		ys[0] = yAxis;
		ys[1] = lny1; 
		res.LY0 = yAxis; 
		res.LY1 = lny1; 
		for (i=2; i<(n+1); i=i+1) {
			pName = "P" + i; 
			pA = x0s[pName];
			pB = x1s[pName];
			xs[i] = this.pg.line(pA,pB);
			lName = "LX" + i; 
			res[lName] = xs[i];
		}
		for (i=2; i<(m+1); i=i+1) {
			pName = "P" + i; 
			pA = y0s[pName];
			pB = y1s[pName];
			ys[i] = this.pg.line(pA,pB);
			lName = "LY" + i; 
		}
		for (i=0; i<=n; i=i+1) {
			for (j=0; j<=m; j=j+1) {
				pName = ("P" + i) + j;
				res[pName] = this.pg.first(xs[i], ys[j], pAbove);
			}
		}
		return res; 
	}, 

	// works for either grid. p1 is always origin
	getGridPoint: function(n, m, grid) {
		var pName = ("P" + n) + m; 
		return grid[pName];
	}, 

	gridFromTwoPoints_test: function(t) {
		var p0 = this.pg.given(0.5,0.5); 
		var p1 = this.pg.given(0.5,0.47); 
		var p2 = this.pg.given(0.5,0.45); 
		var p3 = this.pg.given(0.5,0.43);
		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 
		var grd = this.gridFromTwoPoints(24, 12, pA,pB,pC);

		var pD = this.getGridPoint(10,7, grd);
		var pE = this.getGridPoint(12,8, grd);
		var pF = this.getGridPoint(12,10, grd);

		var md = this.gridFromTwoPoints(12, 12, pD,pE,pF);
	}, 



	// as gridFromTwoPoints, but p1 p2 p3 define a parallelogram
	gridFromThreePoints: function(n, m, p1, p2, p3) { 
		var pl = this.completeParallelogram(p1, p2, p3);
		var p4 = pl.P4;
		var xAxis = this.pg.line(p2,p3);
		var lnx1 = this.pg.line(p1,p4);
		var yAxis = this.pg.line(p2,p1); 
		var lny1 = this.pg.line(p3,p4);

		var x0s = this.series(n, p2, p3, xAxis);
		var x1s = this.series(n, p1, p4, lnx1);
		var y0s = this.series(m, p2, p1, yAxis);
		var y1s = this.series(m, p3, p4, lny1);
		var i, j, xln, pName, lName, pA, pB, xs, ys;

		var res = {}
		xs=[];
		xs[0] = xAxis;
		xs[1] = lnx1; 
		res.LX0 = xAxis; 
		res.LX1 = lnx1; 
		ys=[]; 
		ys[0] = yAxis;
		ys[1] = lny1; 
		res.LY0 = yAxis; 
		res.LY1 = lny1; 
		for (i=2; i<(n+1); i=i+1) {
			pName = "P" + i; 
			pA = x0s[pName];
			pB = x1s[pName];
			xs[i] = this.pg.line(pA,pB);
			lName = "LX" + i; 
			res[lName] = xs[i];
		}
		for (i=2; i<(m+1); i=i+1) {
			pName = "P" + i; 
			pA = y0s[pName];
			pB = y1s[pName];
			ys[i] = this.pg.line(pA,pB);
			lName = "LY" + i; 
		}
		for (i=0; i<=n; i=i+1) {
			for (j=0; j<=m; j=j+1) {
				pName = ("P" + i) + j;
				res[pName] = this.pg.first(xs[i], ys[j], p3);
			}
		}
		return res; 
	}, 

	gridFromThreePoints_test: function(t) {
		var p0 = this.pg.given(0.5,0.5); 
		var p1 = this.pg.given(0.5,0.47); 
		var p2 = this.pg.given(0.5,0.45); 
		var p3 = this.pg.given(0.5,0.43);
		var c1 = this.pg.circle(p0,p1); 
		var c2 = this.pg.circle(p0,p2); 
		var c3 = this.pg.circle(p0,p3); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 
		var grd = this.gridFromThreePoints(24, 12, pA,pB,pC);

		var pD = this.getGridPoint(10,7, grd);
		var pE = this.getGridPoint(12,8, grd);
		var pF = this.getGridPoint(12,10, grd);

		var md = this.gridFromThreePoints(12, 12, pD,pE,pF);
	}, 

	getGridNthHorizontal: function(n, grid) {	
		var pName = "LX" + n ; 
		return grid[pName];	
	},
	getGridNthVertical: function(n, grid) {
		var pName = "LY" + n; 
		return grid[pName];
	},


	// given two points, make a square, and then subdivide it by m and n
	gridInTwoPoints: function(m,n,p1,p2) {

	},
	gridInTwoPoints_test: function(t) {

	},


	// given two points, make an equilateral, and then subdivide it by m and n
	gridInThreePoints: function(m,n,p1,p2,p3) {

	},
	gridInThreePoints_test: function(t) {

	},


	// hexagonal grid!! shut up


	/////////////////////// the usual vector diagram objects
	/////////////////////// 
	/////////////////////// 

/*	// add arcs that, when lofted, fill in the circle at p1 through p2
	fillCircle: function(p1,p2) {
		var c1 = this.pg.circle(p1,p2);
		var ln1 = this.pg.line(p1,p2); 
		
	},
	fillCircle_test: function(t) { 
//		var pA = this.pg.given(0.5,0.5); 
//		var pB = this.pg.given(0.3,0.4); 
//		var pC = this.pg.given(0.3,0.3); 
		this.pg.setGroupColor(2, "#00f");
		var p0 = this.pg.given(0.4,0.5); 
		var p2 = this.pg.given(0.6,0.4); 
		var p3 = this.pg.given(0.4,0.5); 
		var p5 = this.pg.given(0.6,0.4); 
		var c1 = this.pg.circle(p0,p2); 
		var c2 = this.pg.circle(p3,p5); 

		var pA = this.pg.addParametricPoint(c1, t); 
		var pB = this.pg.addParametricPoint(c2, t*1.1); 
		var pC = this.pg.addParametricPoint(c3, t*.9+.5); 

		var md = this.fillCircle(pA, pB);
		this.pg.setGroup(md.CNew, 2);
	},
*/

	// given two points (on a line), and two more (defining a circle),
	// make a segment 
	roundedSegment: function(p1,p2,pc1,pc2) {
		var end1 = this.circleTransfer(p1, pc1,pc2);
		var end2 = this.circleTransfer(p2, pc1,pc2);
//			"P1":p1, "PC1":pc1, "PC2":pc2, "PEq":p4, "C1":c12, "C2":c21, "CNew":cGoal};

		var c1 = this.pg.circle(p1,p2); 
		var c2 = this.pg.circle(p2,p1); 
		var ln12 = this.pg.line(p1,p2); 
		var ce1 = end1.CNew; 
		var ce2 = end2.CNew; 
		var p1A = this.pg.first(ce1,c2, pc1);
		var p1B = this.pg.second(ce1,ln12, p2);
		var p1C = this.pg.second(ce1,c2, pc1);
		var p2A = this.pg.first(ce2,c1, pc1);
		var p2B = this.pg.second(ce2,ln12, p1);
		var p2C = this.pg.second(ce2,c1, pc1);

		var ln1 = this.pg.line(p1A, p2A); 
		var ln1 = this.pg.line(p1B, p2B); 
		var ln1 = this.pg.line(p1C, p2C); 


/*		var t1A = this.pg.closestPointParam(ce1, p1A);
		var t1B = this.pg.closestPointParam(ce1, p1B);
		var t1C = this.pg.closestPointParam(ce1, p1C);
		var t2A = this.pg.closestPointParam(ce2, p2A);
		var t2B = this.pg.closestPointParam(ce2, p2B);
		var t2C = this.pg.closestPointParam(ce2, p2C);

		var a1AB = theP.arc(ce1, t1A, t1B); 
		var a1BC = theP.arc(ce1, t1B, t1C); 
		var a2AB = theP.arc(ce2, t2A, t2B); 
		var a2BC = theP.arc(ce2, t2B, t2C); 

		theP.loft(a1AB, a2AB, "#999"); 
		theP.loft(a1BC, a2BC, "#bbb"); 
*/	},
	roundedSegment_test: function(t) { 
		var pA = this.pg.given(0.5,0.5); 
		var p2 = this.pg.given(0.5,0.49); 
		var p3 = this.pg.given(0.5,0.45);
		var c1 = this.pg.circle(p3, p2); 
		var pB = this.pg.addParametricPoint(c1,t); 

		var p4 = this.pg.given(0.5, 0.2); 
		var p5 = this.pg.given(0.5, 0.1); 
		var c2 = this.pg.circle(pA, p4); 
		var pC = this.pg.addParametricPoint(c2,t*1.1); 
		var c3 = this.pg.circle(pA, p5); 
		var pD = this.pg.addParametricPoint(c3,t*0.9); 

		var md = this.roundedSegment(pC, pD, pA, pB);
	},


	// square lines: makes two segments that can be lofted to make a thick line
	squareLine: function(p1,p2,p3) {

	},
	squareLine_test: function(t) { 
	},
	

	// rounded rect: 
	roundedRectangle: function(p1,p2,p3) {

	},
	roundedRectangle_test: function(t) { 
	},




	// make a rectangle at xin,yin, of width win, ht hin
	addInitialFigure: function ( xin,  yin,  win,  hin) {
		var p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, c1, c2, c3; 
	    var c4, c5, c6, c7, c8, l1, l2, l3, l4;  
		this.clear();
		p1 = this.addGivenPoint(xin, yin);     		// 1: origin
		p2 = this.addGivenPoint(xin+win, yin);   	// 2: pt at origin+(w,0)
		p3 = this.addGivenPoint(xin+hin, yin);   	// 3: pt at origin+(h,0);
		l1 = this.line(p1, p2);               	// 4: top margin
		c1 = this.circle(p1, p2);             	// 5
		c2 = this.circle(p1, p3);             	// 6
		p4 = this.second(c1, l1, p2);// 7
		c3 = this.circle(p4, p2);             	// 8
		c4 = this.circle(p2, p4);             	// 9
		p5 = this.second(c3, c4, p1);//10:
		l2 = this.line(p1, p5);               	//11: left margin
		p6 = this.second(c1, l2, p4);    //12: bottom-left of square
		p7 = this.first(c2, l2, p6);    //13: bottom-left of page
		c5 = this.circle(p2, p1);             	//14
		c6 = this.circle(p6, p1);             	//15
		p8 = this.first(c5, c6, p5); //16: bottom-right of square
		l3 = this.line(p2, p8);                	//17: right margin
		c7 = this.circle(p3, p1);             	//18
		c8 = this.circle(p7, p1);             	//19
		p9 = this.second(c7, c8, p1); //20:
		l4 = this.line(p7, p9);                	//21: bottom margin
		p10= this.first(l4, l3, p9); //22: bottom-right of page
	}


	// solvers: 
	// for a line and a point, get closest point on line, line perp and through


}










