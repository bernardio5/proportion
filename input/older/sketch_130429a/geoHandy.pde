

///// this class provides a library of functions

// the only global variable is a figure, into which it draws

// each takes a few input objects (integers) 
// and adds to a figure in a standard way

// all functions add to the figure. none of them return more than an integer.
// functions needing to return multiple things just leave them in the figure
// and return the last object made. 


class geoHandy {
  geoPage p;
  int ready; 

  geoHandy() {
    ready = 0;
  }

  public void setPage(geoPage inp) {
    p = inp;  // god, I hope this does the pointer shit. because otherwise!
  }

  // given points A and B, return a line through A perpendicular to the line through AB
  public int addPerpendicularLine(int pA, int pB, int lnAB) {
    geoBase opA, opB, olnAB, c1, c2, c3, p1, p2;
    int p22; 
    opA = p.getBase(pA); 
    opB = p.getBase(pB);
    olnAB = p.getBase(lnAB);
    
    c1 = new geoBase();
    c1.setAsCircle(opA.x, opA.y, opB.x, opB.y);
    p1 = new geoBase(); 
    p1.setAsSecondIntersection(c1, olnAB, opB);
    c2 = new geoBase(); 
    c2.setAsCircle(p1.x, p1.y, opB.x, opB.y);
    c3 = new geoBase(); 
    c3.setAsCircle(opB.x, opB.y, p1.x, p1.y);
    p2 = new geoBase(); 
    p2.setAsFirstIntersection(c2, c3, opA);
    p22 = p.addCheaterPoint(p2.x, p2.y); 
    return p.addLine(pA, p22);
  }

  // given points a and b, there is a line AB through them
  // return the line through the midpoint pependicular to AB
  public int addBisectorLine(int pA, int pB) {
    int p3,p4;
    geoBase opA, opB, c1, c2, p1, p2;
    opA = p.getBase(pA); 
    opB = p.getBase(pB);
    
    c1 = new geoBase();
    c1.setAsCircle(opA.x, opA.y, opB.x, opB.y);
    c2 = new geoBase(); 
    c2.setAsCircle(opB.x, opB.y, opA.x, opA.y);
    
    p1 = new geoBase();
    p1.setAsFirstIntersection(c1, c2, opB);
    p2 = new geoBase();
    p2.setAsSecondIntersection(c1, c2, opB);
    p3 = p.addCheaterPoint(p1.x, p1.y); 
    p4 = p.addCheaterPoint(p2.x, p2.y); 
    return p.addLine(p3, p4);
  }

  // yeah, there's a way to construct it, but there are special cases. 
  int addLinePerpendicularToAThroughB(int lnA, int pB) { 
    float t; 
    int p1, ln1; 
    t = p.closestPointParam(lnA, pB); 
    p1 = p.addParametricPoint(lnA, t); 
    return p.addLine(pB, p1);
  }

  int addLineParallelToAThroughB(int lnA, int pB) { 
    int ln1; 
    ln1 = addLinePerpendicularToAThroughB(lnA, pB);  
    return addPerpendicularLine(pB, ln1-1, ln1);
  }

  // this is the stupid one, in which B has to be on A
  // it would be nice to have one for all the other points, but I can't yet.
  int addLineTangentToAThroughB(int cA, int pCn, int pB) { 
    int ln1; 
    ln1 = p.addLine(pB, pCn); 
    return addPerpendicularLine(pB, pCn, ln1);
  }


  // any three points define 3 parallelpipeds
  // return the point that completes the one
  // specified by pA, pB, and pC, closest to "magnetP"
  int addFourthParallelpiped(int pA, int pB, int pC, int magnetP) { 
    return 0;
  }


  // returns the center of the circle; you can add it if you want it. 
  int circleThroughThreePoints(int p1, int p2, int p3) {
    int ln1, ln2;
    ln1 = addBisectorLine(p1, p2); 
    ln2 = addBisectorLine(p2, p3); 
    return p.addFirstIntersection(ln1, ln2, p3);
  }


  // return the first of n-1 points on AB that subdivide it into 
  // n equal parts. The 
  int addLineSubdivisions(int pA, int pB, int lnAB, int n) {
    return 0;
  }

  // return 2 points on circle A, with center pCn 
  // that form an equlateral triangle with point B
  int insetTriangle(int cA, int pCn, int pB) { 
    int c1, c2, c3, p1, p2;
    c1 = p.addCircle(pB, pCn); 
    p1 = p.addFirstIntersection(c1, cA, pB); 
    c2 = p.addCircle(p1, pCn); 
    p2 = p.addSecondIntersection(cA, c2, pB); 
    c3 = p.addCircle(pB, p2); 
    p2 = p.addSecondIntersection(cA, c2, pB); // add it again to put it in the right place
    return p.addSecondIntersection(cA, c3, p2);
  }

  // returns 3 points
  int insetSquare(int cA, int pCn, int pB) { 
    int ln1, ln2, p1, p2, p3; 
    ln1 = p.addLine(pB, pCn); 
    ln2 = addPerpendicularLine(pCn, pB, ln1);
    p1 = p.addFirstIntersection(cA, ln2, pB);
    p2 = p.addSecondIntersection(cA, ln1, pB); 
    return p.addSecondIntersection(cA, ln2, p1);
  }

  // due to Hirano; http://www.cut-the-knot.org/pythagoras/PentagonConstruction.shtml
  // but without spurious symmetries. 
  // they're out of order; you'll figure it out. "figure it out!" heh.
  int insetPentagon(int cA, int pCn, int pB) { 
    int ln1, ln2, ln3, ln4, p1, p2, p3, p4, p5, p6, p7, p8, c1, c2, c3, c4; 
    ln1 = p.addLine(pCn, pB); 
    ln2 = addPerpendicularLine(pCn, pB, ln1); 
    p1 = p.addFirstIntersection(cA, ln2, pB); 
    ln3 = addBisectorLine(p1, pCn); 
    p2 = p.addFirstIntersection(ln2, ln3, p1); 
    c1 = p.addCircle(p2, pCn); 
    p3 = p.addSecondIntersection(cA, ln1, pB); 
    ln4 = p.addLine(p2, p3); 
    p4 = p.addFirstIntersection(c1, ln4, p3); 
    c2 = p.addCircle(p3, p4); 
    p5 = p.addFirstIntersection(cA, c2, p1); 
    p6 = p.addSecondIntersection(cA, c2, p1); 
    c3 = p.addCircle(p5, p6); 
    c4 = p.addCircle(p6, p5); 
    p7 = p.addSecondIntersection(cA, c3, p6); 
    return p.addSecondIntersection(cA, c4, p5);
  }

  // due to everyone
  int insetHexagon(int cA, int pCn, int pB) { 
    int ln1, p1, p2, p3, p4, c1, c2;
    ln1 = p.addLine(pB, pCn); 
    p1 = p.addSecondIntersection(cA, ln1, pB); 
    c1 = p.addCircle(pB, pCn); 
    c2 = p.addCircle(p1, pCn); 
    p1 = p.addFirstIntersection(cA, c1, pB); 
    p2 = p.addFirstIntersection(cA, c2, p1); 
    p3 = p.addFirstIntersection(cA, ln1, p2); 
    p4 = p.addSecondIntersection(cA, c2, p2); 
    return p.addSecondIntersection(cA, c1, p1);
  }

  // yawn!
  int insetOctagon(int cA, int pB) { 
    return 0;
  }

  // the following return rectangles of various proportions.
  // they all follow this pattern: 
  // given 2 points A and B, and the line through them lnAB,
  // return a rectangle, on the side of the line containing magnetP,
  // The point returned is a corner; the object whose index precedes it is the other. 
  // You can add the sides if you want them. 

  int addSquare(int pA, int pB, int lnAB, int magnetP) { 
    int ln1, ln2, ln3, c1, c2, p1; 
    ln2 = addPerpendicularLine(pA, pB, lnAB); 
    ln3 = addPerpendicularLine(pB, pA, lnAB); 
    c1 = p.addCircle(pA, pB); 
    c2 = p.addCircle(pB, pA); 
    p1 = p.addFirstIntersection(c1, ln2, magnetP);
    return p.addFirstIntersection(c2, ln3, magnetP);
  }

  // the two points creates will be on a line 
  int addRoot2Rectangle(int pA, int pB, int lnAB, int magnetP) {
    int ln1, ln2, ln3, c1, c2, p1, p2, ln4, ln5, ln6, p5, p4, c3, p3; 
    ln1 = addPerpendicularLine(pA, pB, lnAB); 
    ln2 = addPerpendicularLine(pB, pA, lnAB); 
    c1 = p.addCircle(pA, pB); 
    c2 = p.addCircle(pB, pA); 
    p1 = p.addFirstIntersection(c1, ln1, magnetP);
    p2 = p.addFirstIntersection(c2, ln2, magnetP); 
    ln3 = p.addLine(p1, p2); 
    c3 = p.addCircle(pB, p1); 
    p3 = p.addFirstIntersection(lnAB, c3, pA);
    ln4 = addPerpendicularLine(p3, pB, lnAB); 
    p4 = p.addFirstIntersection(ln4, ln3, pA); 
    ln5 = p.addLine(p4, pB); 
    p5 = p.addFirstIntersection(ln5, ln1, pA); // first new corner
    ln6 =addPerpendicularLine(p5, pA, ln1); // line || to lnAB thru corner
    return p.addFirstIntersection(ln6, ln2, pB);  // other new corner
  }

  // the two points creates will be on a line 
  int addRoot3Rectangle(int pA, int pB, int lnAB, int magnetP) {
    return 0;
  }

  // that has ideal proportions-- return the other two corners
  int addMagicRectangle(int pA, int pB, int lnAB, int magnetP) {
    return 0;
  }


  int addSpiral(int pA, int pB, int pC, int pD, int howMany) {
    int i, lnd1, lnd2, lnV, lnH, p1, ln1, p2, ln2, ln3;
    int[] corners; 
    corners = new int[howMany*2]; 


    lnd1 = p.addLine(pA, pC); 
    lnd2 = addLinePerpendicularToAThroughB(lnd1, pB); 
    lnH = p.addLine(pA, pD); 
    lnV = p.addLine(pA, pB); 
    // print(" lnV: "); print(lnV); 
    p1 = pA; 
    ln1 = lnH; 

    for (i=0; i<howMany; i=i+2) {

      p2 = p.addFirstIntersection(lnd2, ln1, pA);
      ln3 = p.addLine(p1, p2);  
      ln2 = addPerpendicularLine(p2, p1, ln3);  
      ln3 = p.addMark(ln3, p1, p2); 

      corners[i] = p2; 

      p1 = p2; 
      ln1 = ln2; 




      p2 = p.addFirstIntersection(lnd1, ln1, pA); 
      ln3 = p.addLine(p1, p2); 
      ln2 = addPerpendicularLine(p2, p1, ln3); 
      ln3 = p.addMark(ln3, p1, p2); 
      p1 = p2; 
      ln1 = ln2; 
      corners[i+1] = p2;
    }

    for (i=5; i<howMany*2; ++i) { 
      p1 = p.addCircle(corners[i-5], corners[i]); 
      p1 = p.addMark(p1, corners[i-4], corners[i-5]);
    }
    return ln1;
  }





  // starting with the base objects, 
  public void addInitialFigure(float xin, float yin, float win, float hin) {
    int p1, p2, p3, p4, p5, p6, p7, p8, p9, p10;
    int c1, c2, c3, c4, c5, c6, c7, c8; 
    int l1, l2, l3, l4;  


    p1 = p.addCheaterPoint(xin, yin);     // 1: origin
    p2 = p.addCheaterPoint(xin+win, yin);   // 2: pt at origin+(w,0)
    p3 = p.addCheaterPoint(xin+hin, yin);   // 3: pt at origin+(h,0);
    l1 = p.addLine(p1, p2);               // 4: top margin
    c1 = p.addCircle(p1, p2);             // 5
    c2 = p.addCircle(p1, p3);             // 6
    p4 = p.addSecondIntersection(c1, l1, p2);// 7
    c3 = p.addCircle(p4, p2);             // 8
    c4 = p.addCircle(p2, p4);             // 9
    p5 = p.addSecondIntersection(c3, c4, p1);//10:
    l2 = p.addLine(p1, p5);               //11: left margin
    p6 = p.addSecondIntersection(c1, l2, p4);    //12: bottom-left of square
    p7 = p.addFirstIntersection(c2, l2, p6);    //13: bottom-left of page
    c5 = p.addCircle(p2, p1);             //14
    c6 = p.addCircle(p6, p1);             //15
    p8 = p.addFirstIntersection(c5, c6, p5); //16: bottom-right of square
    l3 = p.addLine(p2, p8);                //17: right margin
    c7 = p.addCircle(p3, p1);             //18
    c8 = p.addCircle(p7, p1);             //19
    p9 = p.addSecondIntersection(c7, c8, p1); //20:
    l4 = p.addLine(p7, p9);                //21: bottom margin
    p10= p.addFirstIntersection(l4, l3, p9); //22: bottom-right of page
  }


  // starting with the base objects, 
  public void addSpareInitialFigure(float xin, float yin, float win, float hin) {
    int p1, p2, p3, p4;  

    p1 = p.addCheaterPoint(xin, yin);     // 1: origin
    p2 = p.addCheaterPoint(xin+win, yin);   // 2: pt at origin+(w,0)
    p3 = p.addCheaterPoint(xin, yin+hin);   // 3: pt at origin+(h,0);
    p4 = p.addCheaterPoint(xin+hin, yin+hin);
  }
}
