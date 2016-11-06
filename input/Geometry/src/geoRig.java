∑


///// For some geometric constructions, some components are used many times.
// rather than repeatedly add those components to the figure,
// use a "rig" to generate them once and then use them many times.

// the rig is just an array of integers; it remembers the element
// places in the figure



// the "grid" takes a triangle and draws sets of lines || to two of its sides,
// all crossing the ||ogram the triangle defines.
//  yeah, rectillear grid

void geoSetupGrid(geoFigure a, int gridA, int gridB, int gridC,
                    int ABdivs, int BCdivs, int *pattern) {

}

int geoGetGridPoint(geoFigure a, int *pattern, int x, int y) {}

int geoGetGridXLine(geoFigure a, int *pattern, int x) {}
int geoGetGridYLine(geoFigure a, int *pattern, int y) {}


// the "poly" lets you remember a list of points.







