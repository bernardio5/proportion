
// man, I want postScript output! I miss PS. PS is nice. 
// print that shit!

// must include proportion.js before this. 

function prPS(pg) { 
	this.pg = pg;  	// the page in which the machines will operate

	this.sx = 1.0; 
	this.sy = 1.0; 
	this.tx = 0.0; 
	this.ty = 0.0; 
}


prMachines.prototype = { 
	// given page size in in, and margins, compute 
	setPageSize: function(pageWdIn, pageHtIn, marginIn) {
		this.tx = marginIn * 72.0; 
		this.sx = 72.0 * (pageWdIn - (2.0*marginIn)); // barbaric: only one margin width.
	},


	header: function() { 
		var originx = this.tx; 
		res = "%%!PS-Adobe-3.0 EPSF-3.0\n%%%%Pages: 1\n%%%%Page:1\n"; 
		res += "%%BoundingBox: " + this.tx + " " + this.tx + " " + this.sx + " " + this.sx + "\n";
		res += this.tx + " " + this.tx + " " + " translate ";
		res += this.sx + " " + this.sx + " scale\n"
		res += ".1 setlinewidth\n"
	},


	setColor: function(c) { 
		var col = 0.0; 
		var dc = 1.0 / 16.0; 
		switch (c) {
			case '0': col = 0.0; break; 
			case '1': col = 1.0; break; 
			case '2': col = 2.0; break; 
			case '3': col = 3.0; break; 
			case '4': col = 4.0; break; 
			case '5': col = 5.0; break; 
			case '6': col = 6.0; break; 
			case '7': col = 7.0; break; 
			case '8': col = 8.0; break; 
			case '9': col = 9.0; break; 
			case 'a': col = 10.0; break; 
			case 'b': col = 11.0; break; 
			case 'c': col = 12.0; break; 
			case 'd': col = 13.0; break; 
			case 'e': col = 14.0; break; 
			case 'f': col = 15.0; break; 
			case 'A': col = 10.0; break; 
			case 'B': col = 11.0; break; 
			case 'C': col = 12.0; break; 
			case 'D': col = 13.0; break; 
			case 'E': col = 14.0; break; 
			case 'F': col = 15.0; break; 
		}
		col *= dc; 
		res = " setcolor\n";
		res = col + res; 
		console.log(res);
	},

	beginPath: function() { console.log("beginpath\n"); },

	moveTo: function(x, y) { 
		var outp = " moveto\n"; 
		outp = x + " " + y + outp; 
		console.log(outp);
	},

	lineTo: function(x, y) { 
		var outp = " lineto\n"; 
		outp = x + " " + y + outp; 
		console.log(outp);
	},

	stroke: function() { console.log("stroke\n"); },
	fill: function() { console.log(outp); },
	footer: function() { return "\nshowpage\n"; },

	// returns a string to be saved as PS-- in the console? Somewhere. Bah. 
	outputPS: function(p1, p2, pAbove) {
		console.log(this.header());
		for (i=0; i<numGroups; ++i) { 
			setColor(toWhat); 
			for (i= )
		}
		console.log(this.footer()); 
	},


	redraw = function() {
		var i, j, gc, objCt, ob;
		var x1, y1, x2, y2; 
		gc = this.groupColors.length; // group count
		objCt = this.objCount;  

		for (i=1; i<gc; i=i+1) { 
			this.setColor(this.groupColors[i]); 
			this.beginPath();
			for (j=1; j<objCt; j=j+1) { 
				ob = this.pg.objs[j]; 
				if (ob.g===i) {
					switch (ob.t) {
				        case PR_P:
						    this.moveTo(ob.x+3.0 , ob.y); 
				            this.arc(ob.x, ob.y, 3.0,0.0, PR_2P);
				            break;
				        case PR_L:
							this.moveTo(ob.x-(200.0*ob.x2), ob.y-(200.0*ob.y2)); 
							this.lineTo(this.x+(200.0*ob.x2), ob.y+(200.0*ob.y2));
				            break;
				        case PR_C:
							this.moveTo(ob.x+ob.r , ob.y); 
				            this.arc(ob.x, ob.y, ob.r, 0.0, PR_2P);
				            break;
				        case PR_S:
							this.moveTo(ob.x, ob.y); 
							this.lineTo(ob.x+ob.x2, ob.y+ob.y2);
				            break;
				        case PR_A: // the JS "arc" command does not suit me for lofting
							x1 = ob.aX(0.0); 
							y1 = ob.aY(0.0);
							x2 = ob.aX(1.0); 
							y2 = ob.aY(1.0);
							if (ob.dp>0.0) {
								this.moveTo(x1, y1); 
								this.arc(ob.x, ob.y, ob.r, ob.p0, ob.dp);
							} else {
								this.moveTo(x2,y2); 
								this.arc(ob.x,ob.y, ob.r, ob.dp, ob.p0);
							}
							break;
						case PR_F: 
    						break;
    					}
    				}
				}
			}
			this.cx.stroke(); 
		}
	},


}




