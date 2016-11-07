


class geoPage {
    public geoFigure theFigure;
    geoMark[] theMarks;
    int markCounter;
    float labelWidth, pointWidth, attachWidth;
    float pageWidth, pageHeight;
    
    final static int GEO_MAX_MARKS = 5000;
    final static int GEO_ADD_MARK = 100;
    final static int GEO_DRAW_MARK = 101;
    final static int GEO_DRAW_TRIANGLE = 102;
    final static int GEO_LOFT = 103;
    
    
    // initialize the page; include top-left coordinate in window,
    // label width, point width (for traces), and page width and height
    geoPage(float x0, float y0, float lw, float pw, float pgw, float pgh) {
        theMarks = new geoMark[GEO_MAX_MARKS];
        theFigure = new geoFigure();
        theFigure.addInitialFigure(x0, y0, pgw, pgh);
        labelWidth = lw;
        pointWidth = pw;
        attachWidth = lw*3;
        pageWidth = pgw;
        pageHeight = pgh;
        for (int i=0; i<GEO_MAX_MARKS; ++i) {
            theMarks[i] = new geoMark();
        }
        
    }
    
    // erase everything
    public void clear() {
        markCounter = 0;
        theFigure.clear();
    }
    
    
    ///////////////////// convenience
    public void copy(geoPage it) {
        int i;
        for (i=0; i<it.markCounter; ++i) {
            theMarks[i].copy(it.theMarks[i]);
        }
        markCounter = it.markCounter;
        theFigure.copy(it.theFigure);
        
        labelWidth = it.labelWidth;
        pointWidth = it.pointWidth;
        attachWidth = it.attachWidth;
        pageWidth = it.pageWidth;
        pageHeight = it.pageHeight;
    }
    
    public void merge(geoPage it) {
        theFigure.merge(it.theFigure);
    }
    
    
    
    
    //// operations adding elements to the figure
    public int addCheaterPoint(float x, float y) {
        return theFigure.addCheaterPoint(x, y);
    }
    
    public int addFirstIntersection(int ob1, int ob2, int target) {
        return theFigure.addFirstIntersection(ob1, ob2, target);
    }
    
    public int addSecondIntersection(int ob1, int ob2, int target) {
        return theFigure.addSecondIntersection(ob1, ob2, target);
    }
    
    public int addParametricPoint(int obj, float tin) {
        return theFigure.addParametricPoint(obj, tin);
    }
    
    public int addLine(int ob1, int ob2) {
        return theFigure.addLine(ob1, ob2);
    }
    
    public int addCircle(int ob1, int ob2) {
        return theFigure.addCircle(ob1, ob2);
    }
    
    
    // naming parts of the figure
    //  public int getNamed(int name) {
    //  return theFigure.getNamed(name);
    //}
    
    //public int giveName(int name, int obj) {
    //return theFigure.giveName(name, obj);
    //}/
    
    //
    public float closestPointParam(int ob, int pt) {
        return theFigure.closestPointParam(ob, pt);
    }
    
    
    
    //// oparations on marks
    int addMark(int ob, int p1, int p2) {
        int res;
        geoBase obob, p1ob, p2ob;
        
        obob = new geoBase();
        obob.copy(theFigure.getBase(ob));
        
        p1ob = new geoBase();
        p1ob.copy(theFigure.getBase(p1));
        
        p2ob = new geoBase();
        p2ob.copy(theFigure.getBase(p2));
        
        theMarks[markCounter].set(obob, p1ob, p2ob);
        res = markCounter;
        ++markCounter;
        return res;
    }
    
    
    void drawMarks() {
        for (int i=0; i<markCounter; ++i) {
            theMarks[i].draw(pointWidth);
        }
    }
    void drawOneMark(int which) {
        theMarks[which].draw(pointWidth);
    }
    
    
    
    // given two marks, loft between them
    void loft(int m1, int m2, float maxD) {
        float s1, s2, t, dt, endt;
        geoBase p;
        geoMark ma, mb;
        
        p = new geoBase();
        ma = new geoMark();
        mb = new geoMark();
        ma.copy(theMarks[m1]);
        mb.copy(theMarks[m2]);
        dt = ma.scanLength(maxD);
        s2 = mb.scanLength(maxD);
        if (s2<dt) {
            dt = s2;
        }
        endt = 1.0 + (dt*0.5);
        beginShape(TRIANGLE_STRIP);
        for (t=0.0; t<endt; t+=dt) {
            ma.getPointAlong(p, t);
            vertex(p.x, p.y);
            mb.getPointAlong(p, t);
            vertex(p.x, p.y);
        }
        
        endShape();
    }
    
    
    public void clearMarks() {
        markCounter = 0;
    }
    
    
    
    public void setParameter(int obj, float tin) {
        theFigure.setParameter(obj, tin);
    }
    
    
    public void addInitialFigure(float xin, float yin, float win, float hin) {
        theFigure.addInitialFigure(xin, yin, win, hin); // note: clears figure!
    }
    
    
    // simply draw all of the primitives, as primitives.
    void trace(int withLabels) {
        theFigure.trace(withLabels, labelWidth);
    }
    void traceOne(int which, int withLabels) {
        theFigure.traceOne(which, withLabels, labelWidth);
    }
    
    void echo() {
        theFigure.echo();
    }
    
    void echoOne(int which) {
        theFigure.echoOne(which);
    }
    
    
    
    // interface for XML files of figures, and stuff.
    public int command(int op, int obj1, int obj2, int target, float tin, float vin) {
        int res;
        res = 0;
        switch (op) {
            default: 
                res = theFigure.command(op, obj1, obj2, target, tin, vin); 
                break;
        }
        return res;
    }
    
    
    
}
