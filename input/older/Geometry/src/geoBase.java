


class geoBase {
    int type; // 0:null 1:point 2:line 3:circle
    
    // items in a figure are kept in a list, but a construction has a dependency tree
    int creationOp;
    int inA, inB, inC;          // names of objects used to make this one
    int generation;       // givens are 0, others are max(gens of inputs)+1
    
    float x, y, x2, y2, r;          // hah! all must submit to Decartes
    // float hx, hy, wx, wy, a, b;  // ellipses need more data. do we need them?
    
    float t;                // used in history tree with parametric generation
    
    // names allow us to refer to parts of figures and alter them
    // also to keep track of figure components after figures have been merged,
    int name;
    
    // allowed vals of "type"
    final static int GEO_NULL = 0;
    final static int GEO_POINT = 1;
    final static int GEO_LINE = 2;
    final static int GEO_CIRCLE = 3;
    //const GEO_ELLIPSE = 4;   // giving up on ellipses for now; too many cases
    // parabolas, hyperboloids, lissajous, and caternaries are useful only to bad people.
    
    // allowed values for "creationOp"
    final static int GEO_CHEATER = 10;         // this is a cheater point
    final static int GEO_FIRST_INT = 13;       // this point is the "first" intersection of inA,B,C
    final static int GEO_SECOND_INT = 14;      // this point is the second intersection
    final static int GEO_PARAMETRIC = 15;      // this point's location on inA is given by t
    final static int GEO_ADDLINE = 16;         // this line is through points inA and inB
    final static int GEO_ADDCIRCLE = 17;       // this circle has center inA and goes through inB
    
    // added to enable all manipulations via command
    final static int GEO_GIVE_NAME = 20;       // set the "name" attribute
    final static int GEO_SET_NAMED = 21;       // find the obj with the given name, copy something in
    final static int GEO_SET_PARAMETER = 22;       //
    // these should be the only ways to add to a figure
    
    final static float GEO_EPSILON = 0.000000025; // the number that is basically zero
    
    void clear() {
        type = GEO_NULL;
        creationOp = GEO_NULL;
        inA = GEO_NULL;
        inB = GEO_NULL;
        inC = GEO_NULL;
        generation = 0;
        x = 0.0;
        y = 0.0;
        x2 = 0.0;
        y2 = 0.0;
        r = 0.0;
        t = 0.0;
        name = 0;
    }
    
    
    geoBase() {
        clear();
    }
    
    
    public void copy(geoBase it) {
        type = it.type;
        generation = it.generation;
        inA = it.inA;
        inB = it.inB;
        inC = it.inC;
        creationOp = it.creationOp;
        x = it.x;
        y = it.y;
        x2 = it.x2;
        y2 = it.y2;
        r = it.r;
        t = it.t;
        name = it.name;
    }
    
    public void echo() {
        print("t:");
        print(type);
        println(" g:");
        print(generation);
        print("    x:");
        print(x);
        print(" y:");
        print(y);
        print("    x2:");
        print(x2);
        print(" y2:");
        print(y2);
        print("    r:");
        println( r);
    }
    
    public void trace() {
        switch (type) {
            case GEO_POINT:
                ellipse(x, y, 5, 5);
                break;
            case GEO_LINE:
                line(x-(200.0*x2), y-(200.0*y2), x+(200.0*x2), y+(200.0*y2));
                break;
            case GEO_CIRCLE:
                ellipse(x, y, r*2, r*2);
                break;
        }
    }
    
    
    
    void label(float w, int label) {
        float cx, cy, lx, ly, n, sz;
        n = random(1.0);
        lx = 0;
        ly = 0;
        sz = w*2;
        switch (type) {
            case GEO_POINT:
                lx = x;
                ly = y;
                break;
            case GEO_LINE:
                lx = x + (x2*n);
                ly = y + (y2*n);
                break;
            case GEO_CIRCLE:
                lx = x + (r * cos(4.28*n));
                ly = y + (r * sin(4.28*n));
                break;
        }
        n = random(4.28);
        cx = lx + 5.0*w*cos(n);
        cy = ly + 5.0*w*sin(n);
        fill(0);
        switch (type) {
            case GEO_POINT:
                rect(cx-sz, cy-sz*0.5, sz+sz, sz);
                break;
            case GEO_LINE:
                rect(cx-sz, cy-sz, sz+sz, sz+sz);
                break;
            case GEO_CIRCLE:
                ellipse(cx, cy, sz+sz, sz+sz);
                break;
        }
        fill(255);
        line(lx, ly, cx, cy);
        String t;
        t = str(label);
        textAlign(CENTER);
        text(t, cx, cy+w);
        noFill();
    }
    
    
    // helper function for maintaining the construction tree
    public void setGen(geoBase obj1, geoBase obj2) {
        int a;
        generation = 0;
        if (obj1.type!=GEO_NULL) {
            generation = obj1.generation +1;
        }
        a=0;
        if (obj2.type!=GEO_NULL) {
            a = obj2.generation +1;
        }
        if (a>generation) {
            generation = a;
        }
    }
    
    
    
    /////////////////// ops on points
    
    public int isAPoint() {
        int res;
        res = 0;
        if (type == GEO_POINT) {
            res = 1;
        }
        return res;
    }
    
    
    
    public int equalPoints(geoBase it) {
        int res;
        float dx, dy, len;
        
        res = 0;
        dx = x-it.x;
        dy = y-it.y;
        len = dx*dx+dy*dy;
        if (len<GEO_EPSILON) {
            res=1;
        }
        return res;
    }
    
    
    
    ///////////////////////////////////////////////////
    // initialization helpers
    public void setAsPoint(float xin, float yin) {
        type = GEO_POINT;
        x = xin;
        y = yin;
        x2 = 0.0;
        y2 = 0.0;
        r = 0.0;
        t = 0.0;
    }
    
    public void setAsLine(float xin, float yin, float x2in, float y2in) {
        x = xin;
        y = yin;
        x2 = x2in-x;
        y2 = y2in-y;
        r = sqrt(x2*x2+y2*y2);
        t = 0.0;
        if ((x2*x2)+(y2*y2)<GEO_EPSILON) {
            type = GEO_POINT;
        }
        else {
            type = GEO_LINE;
        }
    }
    
    public void setAsCircle(float xin, float yin, float x2in, float y2in) {
        type = GEO_CIRCLE;
        x = xin;
        y = yin;
        x2 = x2in-x;
        y2 = y2in-y;
        r = sqrt(x2*x2+y2*y2);
        t = 0.0;
        if (r<GEO_EPSILON) {
            type = GEO_POINT;
        }
    }
    
    
    
    
    
    
    ///////////////////////////////////////////////////
    // helpers for intersection
    
    // there are 0, 1, or 2 intersections of points, lines, and circles.
    // points don't intersect things; use "closestPointOn" and "pointAlong"
    
    // "closer" takes three points, and picks one, which is the basis for designating
    // a point as "first" or "second"
    
    // the intersect routines take two lines or circles and returns the number of
    // intersections, returning both points in a geoBase.
    
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
    int closer(geoBase ob1, geoBase ob2, geoBase ob3) {
        int res, a, b, c;
        float dx, dy, ac, bc;
        res = 1;
        
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
                ac = sqrt(dx*dx+dy*dy);
                
                dx = ob2.x - ob3.x;
                dy = ob2.y - ob3.y;
                bc = sqrt(dx*dx+dy*dy);
                dx = (ac-bc)*(ac-bc);
                if (dx>GEO_EPSILON) { // the distances are different
                    if (ac<bc) {
                        res =1;
                    }
                    else {
                        res = 2;
                    }
                }
                else { // the distances are the same
                    dy = ob1.y - ob2.y;
                    if (dy*dy>GEO_EPSILON) {
                        if (ob1.y < ob2.y) {
                            res = 1;
                        }
                        else {
                            res = 2;
                        }
                    }
                    else { // the heights are the same
                        dx = ob1.x - ob2.x;
                        if (dx*dx>GEO_EPSILON) {
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
    int intersectLineLine(geoBase line, geoBase pt) {
        float xa, xb, xc, xd, ya, yb, yc, yd;
        int res;
        float[] det;
        det = new float[10];
        
        res = 0;
        xa = x;
        xb = x + x2;
        ya = y;
        yb = y + y2;
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
        if ((det[7]*det[7])>GEO_EPSILON) {
            det[8] = (det[0]*det[4]) - (det[1]*det[3]);
            det[9] = (det[0]*det[6]) - (det[1]*det[5]);
            
            pt.type = GEO_POINT;
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
    int intersectLineCircle(geoBase line, geoBase pt) {
        float dx, dy, dr2, r2, lx1, lx2, ly1, ly2, D, disc, sgndy, absdy;
        int res;
        
        lx1 = line.x - x;
        ly1 = line.y - y;
        lx2 = (line.x+line.x2) - x;
        ly2 = (line.y+line.y2) - y;
        
        res = 1;
        dx = lx2-lx1;
        dy = ly2-ly1;
        dr2 = dx*dx+dy*dy;
        r2 = r * r;
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
            if (disc*disc<GEO_EPSILON) { // line is tangent
                pt.x = (D * dy) / dr2;
                pt.y = (-1.0 * D * dx) / dr2;
                res = 1;
            }
            else { // disc is well-greater than 0; two intersections
                pt.x = ((D * dy) + (sgndy * dx * sqrt(disc))) / dr2;
                pt.y = ((-1.0 * D * dx) + (absdy * sqrt(disc))) / dr2;
                pt.x2 = ((D * dy) - (sgndy * dx * sqrt(disc))) / dr2;
                pt.y2 = ((-1.0 * D * dx) - (absdy * sqrt(disc))) / dr2;
                pt.x += x;
                pt.y +=y;
                pt.x2 +=x;
                pt.y2 += y;
                res = 2;
            }
        }
        return res;
    }
    
    
    
    
    // intersect self, as circle, with circle
    int intersectCircleCircle(geoBase cr, geoBase pt) {
        float dx, dy, rsum, seperation, crx, cry, a, b, c;
        int res;
        
        res = 0;
        rsum = r + cr.r;
        dx = x - cr.x; // dxy= connection c1 to c2
        dy = y - cr.y;
        seperation = sqrt(dx*dx+dy*dy);
        if (seperation>GEO_EPSILON) { // the centers are not the same
            if (rsum<seperation) {
                // can't touch; return null
                res = 0;
            }
            else {
                if ( ((rsum-seperation)*(rsum-seperation)) < GEO_EPSILON) {
                    // touch at one spot, which is self.r away from self.center
                    // along dxy
                    pt.x = x + (dx*r/seperation);
                    pt.y = y + (dy*r/seperation);
                    res = 1;
                }
                else {
                    // there are two points of contact.
                    res = 2;
                    // two triangles, r1sq=csq+asq and r2sq=bsq+asq
                    // also, b+c=seperation,
                    c = (0.5*seperation) - ((r*r*0.5)/seperation) + ((cr.r*cr.r*0.5)/seperation);
                    b = seperation - c;
                    a = sqrt(r*r - b*b);
                    
                    
                    dx /= seperation;
                    dy /= seperation;
                    crx = -dy;
                    cry = dx;
                    
                    pt.x = x - (dx*b) + (crx*a);
                    pt.y = y - (dy*b) + (cry*a);
                    pt.x2 = x - (dx*b) - (crx*a);
                    pt.y2 = y - (dy*b) - (cry*a);
                }
            }
        }
        return res;
    }
    
    
    
    
    // returns 0 if there is no (new) point, ow= the number of intersection points: 1 or 2.
    // geoFigure uses "closer" to choose which is first and which second.
    int intersect(geoBase it, geoBase pt) {
        int typecases, res;
        res = 0;
        
        typecases = type*10 + it.type;
        
        switch (typecases) {
            case GEO_POINT*10 + GEO_POINT:
                break;
            case GEO_POINT*10 + GEO_LINE:
                break;
            case GEO_POINT*10 + GEO_CIRCLE:
                break;
            case GEO_LINE*10 + GEO_POINT:
                break;
            case GEO_LINE*10 + GEO_LINE:
                res = intersectLineLine(it, pt);
                break;
            case GEO_LINE*10 + GEO_CIRCLE:
                res = it.intersectLineCircle(this, pt);
                break;
            case GEO_CIRCLE*10 + GEO_POINT:
                break;
            case GEO_CIRCLE*10 + GEO_LINE:
                res = intersectLineCircle(it, pt);
                break;
            case GEO_CIRCLE*10 + GEO_CIRCLE:
                res = intersectCircleCircle(it, pt);
                break;
        }
        if (res!=0) {
            pt.type = GEO_POINT;
        }
        return res;
    }
    
    
    public void setAsFirstIntersection(geoBase obj1, geoBase obj2, geoBase target) {
        int count, which;
        geoBase pt1, pt2;
        pt1 = new geoBase();
        pt2 = new geoBase();
        
        count = obj1.intersect(obj2, pt1);
        switch (count) {
            case 0:
                type = GEO_NULL;
                break;
            case 1:
                setAsPoint(pt1.x, pt1.y);
                break;
            case 2:
                pt2.setAsPoint(pt1.x2, pt1.y2);
                which = closer(pt1, pt2, target);
                if (which==2) {
                    setAsPoint(pt2.x, pt2.y);
                }
                else {
                    setAsPoint(pt1.x, pt1.y);
                }
                break;
        }
    }
    
    
    public void setAsSecondIntersection(geoBase obj1, geoBase obj2, geoBase target) {
        int count, which;
        geoBase pt1, pt2;
        pt1 = new geoBase();
        pt2 = new geoBase();
        
        count = obj1.intersect(obj2, pt1);
        switch (count) {
            case 0:
            case 1:
                type = GEO_NULL;
                break;
            case 2:
                pt2.setAsPoint(pt1.x2, pt1.y2);
                which = closer(pt1, pt2, target);
                if (which==2) {
                    setAsPoint(pt1.x, pt1.y);
                }
                else {
                    setAsPoint(pt2.x, pt2.y);
                }
                break;
        }
    }
    
    
    
    /////////////// parametrics
    // set self to be a point on another geoBase
    
    // this one is kinda stupid. 
    void setAsPPoint(geoBase pt, float tin) {
        type = GEO_POINT;
        creationOp = GEO_PARAMETRIC;
        generation = pt.generation+1;
        x = pt.x;
        y = pt.y;
        t = tin;
    }
    
    
    // take t, set point to be on object
    void setAsPLine(geoBase ln, float tin) {
        type = GEO_POINT;
        creationOp = GEO_PARAMETRIC;
        generation = ln.generation+1;
        x = ln.x + (ln.x2*tin);
        y = ln.y + (ln.y2*tin);
        t = tin;
    }
    
    
    void setAsPCircle(geoBase ck, float tin) {
        type = GEO_POINT;
        creationOp = GEO_PARAMETRIC;
        generation = ck.generation+1;
        x = ck.x + (ck.r * cos(tin*TWO_PI));
        y = ck.y + (ck.r * sin(tin*TWO_PI));
        t = tin;
    }
    
    
    public void setAsParametric(geoBase ob, float tin) {
        switch (ob.type) {
            case GEO_POINT:
                setAsPPoint(ob, tin); 
                break;
            case GEO_LINE:
                setAsPLine(ob, tin);
                break;
            case GEO_CIRCLE:
                setAsPCircle(ob, tin);
                break;
        }
    }
    
    
    
    ////////// closest-points!
    // this as opposed to calling them "point on"-- numericcal
    // self is line or circle; returns parameter of point on object closest to
    
    // return the parameter of the point on the object closest to p
    float closestPointOnLine(geoBase pt) {
        float res, dx, dy, dlen;
        res = 0.0;
        if (r>GEO_EPSILON) {
            dx = pt.x - x;
            dy = pt.y - y;
            res = ((dx*x2) + (dy*y2))/(r*r); // a parameter, but an incorrect one
        } // else self is not really a line; problematic! and t should==0
        return res;
    }
    
    
    float closestPointOnCircle(geoBase pt) {
        float len, res, dx, dy, theta;
        res = 0.0;
        dx = pt.x - x;
        dy = pt.y - y;
        len = sqrt(dx*dx+dy*dy); // distance from center
        if (len>GEO_EPSILON) {
            // don't even care how close you are; just get the angle.
            theta = (float)Math.acos(dx/len);
            if (dy<0.0) {
                theta = 6.28 - theta;
            }
            res = theta / 6.28;
        }
        return res;
    }
    
    
    // it is the thing being used to position the point
    public float closestPointParam(geoBase pt) {
        float res;
        res = 0.0;
        if (pt.type==GEO_POINT) {
            switch (type) {
                case GEO_LINE:
                    res = closestPointOnLine(pt);
                    break;
                case GEO_CIRCLE:
                    res = closestPointOnCircle(pt);
                    break;
            }
        }
        return res;
    }
}



/*
 
 Test suite
 
 float t; 
 geoBase a, b, c, d, e, f, g;
 
 void setup() {
 size(800, 800); 
 stroke(0, 0, 0);
 noFill(); 
 t = 0; 
 a = new geoBase();
 b = new geoBase(); 
 c = new geoBase(); 
 d = new geoBase();
 e = new geoBase();
 f = new geoBase();
 g = new geoBase();
 }
 
 void draw() {
 int res1, res2, res3;
 t = t+0.1; 
 background(204);
 g.setAsPoint(600, 400); 
 b.setAsCircle(400.0, 400+sin(t*0.1)*200, 300.0, 400.0+sin(t*.17)*200); 
 a.setAsLine(400.0, 100.0, 400.0+20.0*cos(0.03*t), 100+20.0*sin(0.03*t)); 
 d.setAsLine(400.0, 200.0, 400.0+20.0*cos(0.02*t), 200+20.0*sin(0.02*t)); 
 a.trace(); 
 b.trace(); 
 d.trace();
 g.trace();
 
 //e.setAsFirstIntersection(a, b, g); 
 e.trace();
 
 //f.setAsFirstIntersection(d, b, g); 
 //f.trace();
 
 //f.setAsParametric(a, 5.0*sin(t)); 
 f.trace(); 
 f.setAsParametric(b, sin(t*0.05)); 
 f.trace(); 
 e.setAsParametric(d, 5.0*sin(t)); 
 e.trace();
 }
 
 
 */





