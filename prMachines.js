
///////////////////////////////////////
// This is the more-or-less well-commented version of the Proportion Library's "machines" class. 
// (c)2013 Neal McDonald, released under MIT License
// Use it however you like; have a nice day.

// There is only one class in this file.
// All of the functions follow a pattern: 
//    	They all operate inside a page. 
// 		They all take an associatve array as input; the names of its elements ID the arguments.
// 			Other argiments are allowed, but all arguments that are part of the drawing should be in the array. 
//      The functions add to the drawing. 
// 		They all return an associative array. 
//      	The names of the elements in the array ID the parts of the result.
//          The functions work only by adding to the drawing
//          The function return only the array.
//      The names in the input array are camelCase. The outputs are CapitalizedCamelCase.

// The challenge of these objects: 1) to take input from a complex document in a simple way. 
// 2) to return complex information in a standard way. 


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
	midpoint: function(inArray) {
		var p1 = inArray["p1"];
		var p2 = inArray["p2"];
		var pAbove = inArray["pAbove"];  // input error checking?

		var c1 = this.pg.addCircle(p1, p2); 
		var c2 = this.pg.addCircle(p2, p1);

		var int1 = this.pg.addFirstIntersection(c1, c2, pAbove); 
		var int2 = this.pg.addSecondIntersection(c1, c2, pAbove); 
		var midLine = this.pg.addLine(int1, int2);
		var conr = this.pg.addLine(p1, p2); 
		var midpt = this.pg.addFirstIntersection(midLine, conr, pAbove);   

		var result = {"MidPoint":midpt, "MidLine":midLine, "Connector":conr, "I1":int1, "I2":int2, "C1":c1, "C2":c2};
		return result;
	},
	midpoint_test: function() { 
		var p1 = this.pg.given(0.4, 0.5);
		var p2 = this.pg.given(0.6, 0.5);
		var p3 = this.pg.given(0.6, 0.4);
		var md = this.midpoint({"p1":p1, "p2":p2, "pAbove":p3});
	},



	// given p1 and p2, two points, and pAbove, a third point, returns, 
	//    "Connector", the line through p1 and p2
	//    "Perpendicular", the line perpendicular to Connector through p1
	//    "C1" the circle at p1 through p2
	//    "P3" the line on Connector and C1, opposite p2
	//    "C2" and "C3", the circles around p2 and P3, through P3 and P2
	//    "PUp" and "PDown", the points where Perpendicular, C1, and C2 intersect, 
	//       where pUp is the intersection closer to "pAbove"
	perpendicular: function(inArray) {
		var p1 = inArray["p1"];
		var p2 = inArray["p2"];
		var pAbove = inArray["pAbove"];

		var c1 = this.pg.addCircle(p1, p2); 
		var conector = this.pg.addLine(p1, p2);
		var p3 = this.pg.addSecondIntersection(conector, c1, p2); 
		var diag = this.midpoint({"p1":p3, "p2":p2, "pAbove":pAbove});

		var result = {"Perpendicular":diag["MidLine"], 
						  "Connector":diag["Connector"],
						  		"P3":p3,
						   	    "PUp":diag["I1"],   
						   	    "PDown":diag["I2"],   
						   	    "C1":c1,   
						   	    "C2":diag["C1"],   
						   	    "C3":diag["C2"]
						   	};
		return result;
	},
	perpendicular_test: function() { 
		var p1 = this.pg.given(0.4, 0.5);
		var p2 = this.pg.given(0.6, 0.5);
		var p3 = this.pg.given(0.6, 0.4);
		var md = this.perpendicular({"p1":p1, "p2":p2, "pAbove":p3});
	},





	// given p1 and p2, two points, and t, a line or circle
	// return n points, each named "P1" through "Pn", equally spaced, on t
	//        and n circles, each named "C1"-"Cn"
	//        P1 = p1, p2 = p2 
	series: function(n, inArray) {
		var p1 = inArray["p1"];
		var p2 = inArray["p2"];
		var pAbove = inArray["pAbove"];
		var t = inArray["t"];
		var i; 

		var c1 = this.pg.addCircle(p1, p2);
		var Ci, Pi, Pim, Pip, Cname, Pname; 
		Pim = p1; // p(i-1)
		Pi = p2; // pi
		var result = {"P1":p1, "C1":c1}; 
		for (i=2; i<(n+1); i=i+1) { 
			Cname = "C" + i; 
			Pname = "P" + i; 
			Ci = this.pg.addCircle(Pi, Pim);
			Pip = this.pg.addSecondIntersection(t, Ci, Pim);  // p(i+1)=Pip
			result[Pname] = Pi;
			result[Cname] = Ci;
			Pim = Pi; 
			Pi = Pip; 
		}
		return result;
	},
	series_test: function() { 
		var p1 = this.pg.given(0.25, 0.5);
		var p2 = this.pg.given(0.55, 0.5);
		var l1 = this.pg.addLine(p1, p2);
		var md = this.series(10, {"p1":p1, "p2":p2, "t":l1});
		var c1 = this.pg.addCircle(p1, p2);
		var md = this.series(10, {"p1":p1, "p2":p2, "t":c1});
	},



	// generally: the flowers shapes formed by overlapping circles
	// whose centers are all on a single circle. 

	// given p1 and p2, and pAbove, a third point 
	// return C0, a circle at p1 through p2, 
	// and 6 points on C1, from which a regular hexagon may be inscribed,
	// named after the positions of the numbers on a clock, 
	// where C12=p2.
	// Clockwise vs counterclockwise: C2 will be closer to pAbove, and c10 farther away
	flower6: function(inArray) {
		var p0 = inArray["p1"];
		var p12 = inArray["p2"];
		var pAbove = inArray["pAbove"];

		var c0 = this.pg.addCircle(p0, p12); 
		var c12 = this.pg.addCircle(p12, p0); 
		var p2 = this.pg.addFirstIntersection(c0, c12, pAbove);
		var p10 = this.pg.addSecondIntersection(c0, c12, pAbove);

		var c2 = this.pg.addCircle(p2, p12); 
		var c10 = this.pg.addCircle(p10, p12); 
		var p4 = this.pg.addSecondIntersection(c0, c2, p12);
		var p8 = this.pg.addSecondIntersection(c0, c10, p12);

		var c4 = this.pg.addCircle(p4, p2); 
		var c8 = this.pg.addCircle(p8, p10); 
		var p6 = this.pg.addSecondIntersection(c4, c8, p0);
		var c6 = this.pg.addCircle(p6, p4);

		var result = {
				"p2":p2, "c2":c2,  "p4":p4, "c4":c4,  "p6":p6, "c6":c6, 
				"p8":p8, "c8":c8,  "p10":p10, "c10":c10,  "p12":p12, "c12":c12, 
				"c0":c0 
			};
		return result;
	},
	flower6_test: function() { 
		var p1 = this.pg.given(0.5, 0.5);
		var p2 = this.pg.given(0.5, 0.2);
		var p3 = this.pg.given(0.6, 0.2);
		var md = this.flower6({"p1":p1, "p2":p2, "pAbove":p3});
	},




	flower4: function(inArray) {
		var p0 = inArray["p1"];
		var p12 = inArray["p2"];
		var pAbove = inArray["pAbove"];

		var c0 = this.pg.addCircle(p0, p12); 
		var c12 = this.pg.addCircle(p12, p0); 
		var l1 = this.pg.addLine(p0,p12); 
		var p6 = this.pg.addSecondIntersection(c0,l1, p0); 

		var c6cr = this.pg.addCircle(p6, p12); 
		var c12cr = this.pg.addCircle(p12, p6);
		var p3cr = this.pg.addFirstIntersection(c6cr, c12cr, pAbove); 
		var p9cr = this.pg.addSecondIntersection(c6cr, c12cr, pAbove); 
		var crossLine = this.pg.addLine(p3cr, p9cr); 


		var p3 = this.pg.addFirstIntersection(c0, crossLine, pAbove); 
		var p9 = this.pg.addSecondIntersection(c0, crossLine, pAbove); 

		c12 = this.pg.addCircle(p12, p3); 
		c3 = this.pg.addCircle(p3, p6); 
		c6 = this.pg.addCircle(p6, p9); 
		c9 = this.pg.addCircle(p9,p12); 
		// yeah, this is kind of an eyeball; don't think so. 
		var result = {
				"p3":p3, "p6":p6, "p9":p9, "p12":p12, 
				"c3":c3, "c6":c6, "p9":p9, "c12":c12
			};
		return result;
	},
	flower4_test: function() { 
		var p1 = this.pg.given(0.5, 0.5);
		var p2 = this.pg.given(0.5, 0.2);
		var p3 = this.pg.given(0.6, 0.2);
		var md = this.flower4({"p1":p1, "p2":p2, "pAbove":p3});
	},

	// flower3, 4, 5, 7? 8, 9? 10, 11?, 12, 20, 40, 60, etc? 

	// flower3: build a flower6, return a subset (needed?)
	// flower4: make a circle and diameter, make a parpendicular diameter, add circles.
	// flower5: !
	// flower7: no known correct construction
	// flower8, 10, 12, 16, 20, 24, 32, etc are based on midpoints and flowers 4, 5 and 6
	// flower9: no known correct


	// given p1 and p2 defining a circle, a third point p3, outside the circle, 
	//   and a fourth point, pAbove, 
	// return L1 and L2, the two lines tangent to the circle through the point, 
	// and PT1 and PT2, the two tangent points. 
	//  PT1 is the tangent point closest to pAbove
	tangents: function(inArray) {
		var p1 = inArray["p1"];
		var p2 = inArray["p2"];
		var p3 = inArray["p3"];
		var pAbove = inArray["pAbove"];

		var c1 = this.pg.addCircle(p1,p2);
		var mids = this.midpoint(p1, p3);
		var c2 = mids["C1"]; // circle at p1 through p3
		var pt1 = this.pg.addFirstIntersection(c1, c2, pAbove);
		var pt2 = this.pg.addSecondIntersection(c1, c2, pAbove);
		var l1 = this.pg.addLine(p3,pt1);
		var l2 = this.pg.addLine(p3,pt2);
		var result = {"L1":l1, "L2":l2, "PT1":pt1, "PT2":pt2}; 
		return result;
	},
	tangents_test: function() { 
		var p1 = this.pg.given(0.4, 0.5);
		var p2 = this.pg.given(0.5, 0.5);
		var p3 = this.pg.given(0.7, 0.5);
		var pAbove = this.pg.given(0.5, 0.1);
		var md = this.tangents({"p1":p1, "p2":p2, "p3":p3, "pAbove":pAbove});
	},


	// given points p1,p2,and p3, defining an angle p1,p2,p3, 
	// (p2 being at the intersection of thelines p1-p2 and p2-p3),
	// return a line "Bisector", through points p2 and P4, that 
	// bisects p1p2p3.
	angleBisection: function(inArray) {
		var midpoint = this.midpoint({"p1":inArray["p2"], "p2":inArray["p3"], "pAbove":inArray["p1"]});
		var result = {"Bisector":midpoint["MidLine"], "MidPoint":midpoint["MidPoint"]}; 
		return result;
	},
	tangents_test: function() { 
		var p1 = this.pg.given(0.4, 0.5);
		var p2 = this.pg.given(0.6, 0.5);
		var p3 = this.pg.given(0.4, 0.4);
		var md = this.angleBisection({"p1":p1, "p2":p2, "p3":p3});
	},




	// make a rectangle at xin,yin, of width win, ht hin
	// NOTE: does not follow the prMachine conventions w.r.t. inputs
	//  it just takes the position and size of a bouding box
	addInitialFigure: function ( xin,  yin,  win,  hin) {
		var p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, c1, c2, c3; 
	    var c4, c5, c6, c7, c8, l1, l2, l3, l4;  
		this.clear();
		p1 = this.addGivenPoint(xin, yin);     		// 1: origin
		p2 = this.addGivenPoint(xin+win, yin);   	// 2: pt at origin+(w,0)
		p3 = this.addGivenPoint(xin+hin, yin);   	// 3: pt at origin+(h,0);
		l1 = this.addLine(p1, p2);               	// 4: top margin
		c1 = this.addCircle(p1, p2);             	// 5
		c2 = this.addCircle(p1, p3);             	// 6
		p4 = this.addSecondIntersection(c1, l1, p2);// 7
		c3 = this.addCircle(p4, p2);             	// 8
		c4 = this.addCircle(p2, p4);             	// 9
		p5 = this.addSecondIntersection(c3, c4, p1);//10:
		l2 = this.addLine(p1, p5);               	//11: left margin
		p6 = this.addSecondIntersection(c1, l2, p4);    //12: bottom-left of square
		p7 = this.addFirstIntersection(c2, l2, p6);    //13: bottom-left of page
		c5 = this.addCircle(p2, p1);             	//14
		c6 = this.addCircle(p6, p1);             	//15
		p8 = this.addFirstIntersection(c5, c6, p5); //16: bottom-right of square
		l3 = this.addLine(p2, p8);                	//17: right margin
		c7 = this.addCircle(p3, p1);             	//18
		c8 = this.addCircle(p7, p1);             	//19
		p9 = this.addSecondIntersection(c7, c8, p1); //20:
		l4 = this.addLine(p7, p9);                	//21: bottom margin
		p10= this.addFirstIntersection(l4, l3, p9); //22: bottom-right of page
	}


	// solvers: 
	// for a line and a point, get closest point on line, line perp and through
	// for a circle and a point, get closest, tangents, tangent pts. 
	// for two circles, lines tangent to both, circles touching both..


}










