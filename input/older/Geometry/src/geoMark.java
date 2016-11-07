
class geoMark {
    geoBase source;
    float p1, p2;
    int ready;
    
    geoMark() {
        source = new geoBase();
        ready=0;
    }
    
    
    public void copy(geoMark it) {
        p1 = it.p1;
        p2 = it.p2;
        ready = it.ready;
        source.copy(it.source);
    }
    
    
    // take a maximum facet length. return a dt for the parameters that gives this,
    // usually.
    float scanLength(float maxd) {
        float p, maxLen, len, res, dp;
        geoBase pt1, pt2;
        pt1 = new geoBase();
        pt2 = new geoBase();
        
        res = .05;
        dp = (p2-p1)*res;
        maxLen = 0.0;
        for (p=p1; p<p2; p+=dp) {
            pt1.setAsParametric(source, p);
            pt2.setAsParametric(source, p+dp);
            len = separation(pt1, pt2);
            if (len>maxLen) {
                len=maxLen;
            }
        }
        
        if (maxLen>maxd) { // if the result is too big
            res *= maxd/maxLen; // make the stepsize smaller
        }
        // this could, occasionally, fail, if maxd starts out too big.
        return res;
    }
    
    
    
    ///// setup: takes a geoBase of any type and two points.
    public void set(geoBase it, geoBase pt1, geoBase pt2) {
        //println("set mark");
        //it.echo();    pt1.echo(); pt2.echo();
        source.copy(it);
        p1 = it.closestPointParam(pt1);
        p2 = it.closestPointParam(pt2);
        if (it.type==geoBase.GEO_CIRCLE) {
            if (p1>p2) {
                p1 -= 1.0;
            }
        }
        //print("p1 p2   "); print(p1); print(" "); println(p2);
        ready=1;
    }
    
    
    /////// drawing; fill or not; see if I care
    void drawPoint(float r) {
        ellipse(source.x, source.y, r, r);
    }
    
    
    void drawSegment(float r) {
        geoBase pt1, pt2;
        pt1 = new geoBase();
        pt2 = new geoBase();
        
        pt1.setAsParametric(source, p1);
        pt2.setAsParametric(source, p2);
        line(pt1.x, pt1.y, pt2.x, pt2.y);
        ellipse(pt1.x, pt1.y, r, r);
        ellipse(pt2.x, pt2.y, r, r);
    }
    
    
    
    void drawArc(float r, float maxd) {
        float p, dp;
        int i;
        geoBase pt1, pt2;
        pt1 = new geoBase();
        pt2 = new geoBase();
        
        pt1.setAsParametric(source, p1);
        ellipse(pt1.x, pt1.y, r, r);
        
        dp = (p2-p1)/100.0;
        for (p=p1; p<p2; p=p+dp) {
            pt1.setAsParametric(source, p);
            pt2.setAsParametric(source, p+dp);
            line(pt1.x, pt1.y, pt2.x, pt2.y);
        }
        ellipse(pt2.x, pt2.y, r, r);
    }
    
    
    public void draw(float r) {
        switch (source.type) {
            case geoBase.GEO_POINT:
                drawPoint(r);
                break;
            case geoBase.GEO_LINE:
                drawSegment(r);
                break;
            case geoBase.GEO_CIRCLE:
                drawArc(r, 0.01);
                break;
        }
    }
    
    
    
    
    ///////////////////// helper functions for lofting:
    float separation(geoBase pt1, geoBase pt2) {
        float res;
        res = sqrt((pt1.x-pt2.x)*(pt1.x-pt2.x)+(pt1.y-pt2.y)*(pt1.y-pt2.y));
        return res;
    }
    
    
    void getPointAlong(geoBase pt, float t) {
        // print("pointAlong: "); 
        // print(t); print(" "); print(p1); print(" "); print(p2);  print(" "); 
        // println(p1+((t-p1)/(p2-p1))); 
        
        pt.setAsParametric(source, p1 + (t*(p2-p1)) );
    }
}
