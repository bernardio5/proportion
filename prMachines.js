
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
		var midline = this.pg.addLine(int1, int2);
		var conr = this.pg.addLine(p1, p2); 
		var midpt = this.pg.addFirstIntersection(midLine, conr, pAbove);   

		var result = ["MidPoint":midpt, "MidLine":midline, "Connector":conr "I1":int1, "I2":int2, "C1":c1, "C2":c2];
		return result;
	},
	midpoint_test: function() { 
		var p1 = this.pg.addPoint(0.4, 0.5);
		var p2 = this.pg.addPoint(0.4, 0.5);
		var p3 = this.pg.addPoint(0.4, 0.4);
		var md = this.midpoint(["p1":p1, "p2":p2, "pAbove",p3]);
	},



	// given p1 and p2, two points, and pAbove, a third point, returns, 
	//    "Connector", the line through p1 and p2
	//    "Perpendicular", the line perpendicular to Connector through p1
	//    "C1" the circle through p1 and p2
	//    "P3" the line on Connector and C1, opposite p2
	//    "C2" and "C3", the circles around p2 and P3, through P3 and P2
	//    "PUp" and "PDown", the points where Perpendicular, C1, and C2 intersect, 
	//       where pUp is the intersection closer to "pAbove"
	perpendicular: function(inArray) {
		var p1 = inArray["p1"];
		var p2 = inArray["p2"];
		var pAbove = inArray["pAbove"];

		var c1 = this.pg.addCircle(p1, p2); 
		var conr = this.pg.addLine(p1, p2);
		var p3 = this.pg.addSecondIntersection(conr, c1, pAbove); 
		var diag = this.midpoint(["p1":p3, "p2":p2, "pAbove":pAbove]);

		var result = ["Perpendicular":diag["MidLine"], 
						  "Connector":diag["Connector"],
						  		"P3":p3,
						   	    "PUp":diag["I1"],   
						   	    "PDown":diag["I2"],   
						   	    "C1":c1,   
						   	    "C2":diag["C1"],   
						   	    "C3":diag["C2"]];
		return result;
	},
	perpendicular_test: function() { 
		var p1 = this.pg.addPoint(0.4, 0.5);
		var p2 = this.pg.addPoint(0.4, 0.5);
		var p3 = this.pg.addPoint(0.4, 0.4);
		var md = this.perpendicular(["p1":p1, "p2":p2, "pAbove",p3]);
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
		var result = ["P1":p1, "C1":c1]; 
		for (i=2; i<(n+1); i=i+1) { 
			Cname = "C" + i; 
			Pname = "P" + i; 
			Ci = this.pg.AddCircle(Pi, Pim);
			Pip = this.pg.AddSecondIntersection(t, Ci, Pim);  // p(i+1)=Pip
			result.add(Pname:Pi);
			result.add(Cname:Ci);
			Pim = Pi; 
			Pi = Pip; 
		}
		return result;
	},
	series_test: function() { 
		var p1 = this.pg.addPoint(0.4, 0.5);
		var p2 = this.pg.addPoint(0.4, 0.5);
		var l1 = this.pg.addLine(p1, p2);
		var md = this.series(5, ["p1":p1, "p2":p2, "t":,l1]);
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
		var p6 = this.pg.addSecondIntersection(c0, c4, p2);
		var c6 = this.pg.addCircle(c6, p4);

		var result = [
				"p2":p2, "c2":c2,  "p4":p4, "c4":c4,  "p6":p6, "c6":c6, 
				"p8":p8, "c8":c8,  "p10":p10, "c10":c10,  "p12":p12, "c12":c12, 
				"c0":c0 
			];
		return result;
	},
	flower6_test: function() { 
		var p1 = this.pg.addPoint(0.4, 0.5);
		var p2 = this.pg.addPoint(0.6, 0.5);
		var p3 = this.pg.addPoint(0.6, 0.3);
		var md = this.flower6(["p1":p1, "p2":p2, "pAbove":p3]);
	},




	flower4: function(inArray) {
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
		var p6 = this.pg.addSecondIntersection(c0, c4, p2);
		var c6 = this.pg.addCircle(c6, p4);

		var result = [
				"p2":p2, "c2":c2,  "p4":p4, "c4":c4,  "p6":p6, "c6":c6, 
				"p8":p8, "c8":c8,  "p10":p10, "c10":c10,  "p12":p12, "c12":c12, 
				"c0":c0 
			];
		return result;
	},
	flower4_test: function() { 
		var p1 = this.pg.addPoint(0.4, 0.5);
		var p2 = this.pg.addPoint(0.6, 0.5);
		var p3 = this.pg.addPoint(0.6, 0.3);
		var md = this.flower6(["p1":p1, "p2":p2, "pAbove":p3]);
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
		var result = ["L1":l1, "L2":l2, "PT1":pt1, "PT2":pt2]; 
		return result;
	},
	tangents_test: function() { 
		var p1 = this.pg.addPoint(0.4, 0.5);
		var p2 = this.pg.addPoint(0.5, 0.5);
		var p3 = this.pg.addPoint(0.7, 0.5);
		var pAbove = this.pg.addPoint(0.5, 0.1);
		var md = this.tangents(["p1":p1, "p2":p2, "p3":,p3, "pAbove":pAbove]);
	},


	// given points p1,p2,and p3, defining an angle p1,p2,p3, 
	// (p2 being at the intersection of thelines p1-p2 and p2-p3),
	// return a line "Bisector", through points p2 and P4, that 
	// bisects p1p2p3.
	angleBisection: function(inArray) {
		var midpoint = this.midpoint(["p1":inArray["p2"], "p2":inArray["p3"], "pAbove":inArray["p1"]]);
		var result = ["Bisector":midpoint["MidLine"], "MidPoint":midpoint["MidPoint"]]; 
		return result;
	},
	tangents_test: function() { 
		var p1 = this.pg.addPoint(0.4, 0.5);
		var p2 = this.pg.addPoint(0.6, 0.5);
		var p3 = this.pg.addPoint(0.4, 0.4);
		var md = this.angleBisection(["p1":p1, "p2":p2, "p3":,p3]);
	},






}










