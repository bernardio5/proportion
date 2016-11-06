

public class geoFigure {
    // you might want more. whaddaya gonna do about it?
    final static int GEO_MAX_BASE = 5000;
    
    // all the geObs in the figure
    geoBase[] objs;
    int objCount; // can't delete them!
    
    
    
    
    // comment about constructor
    public geoFigure() {
        objs = new geoBase[GEO_MAX_BASE];
        for (int i=0; i<GEO_MAX_BASE; ++i) {
            objs[i] = new geoBase();
        }
        clear();
    }
    
    
    ///////////////////// convenience
    public void copy(geoFigure it) {
        int i;
        for (i=0; i<it.objCount; ++i) {
            objs[i].copy(it.objs[i]);
        }
        objCount = it.objCount;
    }
    
    public void echo() {
        int i;
        for (i=0; i<objCount; ++i) {
            print(i);
            objs[i].echo();
        }
    }
    public void echoOne(int which) {
        if ((which>0)&&(which<objCount)) {
            objs[which].echo() ;
        }
    }
    
    public void trace(int withLabel, float labelWidth) {
        int i;
        for (i=0; i<objCount; ++i) {
            objs[i].trace();
        }
        if (withLabel==1) {
            for (i=0; i<objCount; ++i) {
                objs[i].label(labelWidth, i);
            }
        }
    }
    public void traceOne(int which, int withLabel, float labelWidth) {
        
        if ((which>0)&&(which<objCount)) {
            objs[which].trace() ;
            if (withLabel==1) {
                objs[which].label(labelWidth, which);
            }
        }
    }
    
    
    public void clear() {
        objCount = 0;
    }
    
    
    public void merge(geoFigure it) {
        int i;
        geoBase source;
        source = new geoBase();
        
        for (i=0; i<it.objCount; ++i) {
            // look at how we are not checking for naming conflicts
            source.copy(it.objs[i]);
            if (source.inA>0) {
                source.inA += objCount;
            }
            if (source.inB>0) {
                source.inB += objCount;
            }
            if (source.inC>0) {
                source.inC += objCount;
            }
            objs[objCount+i].copy(source);
            // is that bad? how would we resolve them?
        }
        objCount += it.objCount;
    }
    
    
    ///////////////////// internal convenience
    // bounds checking for objct references
    int isAThing(int ob) {
        int res;
        res = 0;
        if ((0<ob)&&(ob<objCount)) {
            if (objs[ob].type!=geoBase.GEO_NULL) {
                res = 1;
            }
        }
        return res;
    }
    
    
    // set construction tree helper; little error-checking
    // call only from addPoit/Circ/Line/Elli
    void setOps(int newOne, int a, int b, int c, int op) {
        int res, g1, g2;
        objs[newOne].creationOp = op;
        objs[newOne].inA = a;
        objs[newOne].inB = b;
        objs[newOne].inC = c;
        g1 = objs[a].generation +1;
        g2 = objs[b].generation +1;
        if (g2>g1) {
            g1 = g2;
        }
        objs[newOne].generation = g1;
    }
    
    
    
    public void reset(int which, geoBase obj) {
        if ((which>0)&&(which<objCount)) {
            objs[which].x = obj.x;
            objs[which].y = obj.y;
            objs[which].x2 = obj.x2;
            objs[which].y2 = obj.y2;
            objs[which].r = obj.r;
            objs[which].t = obj.t;
            recalculate(which);
        }
    }
    
    
    
    void recalculate(int first) {
        int i;
        geoBase ct;
        ct = new geoBase();
        
        for (i=first; i<objCount; ++i) {
            ct.copy(objs[i]);
            if ((ct.inA>=first)||(ct.inB>=first)||(ct.inC>=first)) {
                // could have been affected; recalculate
                switch (ct.creationOp) {
                    case geoBase.GEO_CHEATER:
                        // do nothing
                        break;
                    case geoBase.GEO_FIRST_INT:
                        ct.setAsFirstIntersection(objs[ct.inA], objs[ct.inB], objs[ct.inC]);
                        break;
                    case geoBase.GEO_SECOND_INT:
                        ct.setAsSecondIntersection(objs[ct.inA], objs[ct.inB], objs[ct.inC]);
                        break;
                    case geoBase.GEO_PARAMETRIC:
                        ct.setAsParametric(objs[ct.inA], ct.t);
                        break;
                    case geoBase.GEO_ADDLINE:
                        ct.setAsLine(objs[ct.inA].x, objs[ct.inA].y, objs[ct.inB].x, objs[ct.inB].y);
                        break;
                    case geoBase.GEO_ADDCIRCLE:
                        ct.setAsCircle(objs[ct.inA].x, objs[ct.inA].y, objs[ct.inB].x, objs[ct.inB].y);
                        break;
                }
                objs[i].copy(ct);
            }
        }
    }
    
    
    
    //////////////////////// adding to the figure
    
    // add the point to the object list.
    // should only be used internally-- why make a copy of a point you have already?
    // skipping a lot of error-checking here.
    int addPoint(geoBase pt) {
        int res = 0;
        if (pt.type==geoBase.GEO_POINT) {
            res = addBase(pt);
        } else {
            println("geoFigure::addPoint error: use of addPoint to add something that's not a point.");
        }
        return res;
    }
    
    int addBase(geoBase it) {
        int res;
        res = 0;
        if (objCount<GEO_MAX_BASE) {
            if (it.type!=geoBase.GEO_NULL) {
                objs[objCount].copy(it);
                res = objCount;
                ++objCount;
            } else {
                println("geoFigure:addBase: you can't add a NULL object");
            }
        } else {
            println("geoFigure::addBase error: objs array is full");
        }
        return res;
    }
    
    
    // are you kidding? this is not why we're here.
    public geoBase makeCheaterPoint(float x, float y) {
        geoBase ob;
        ob = new geoBase();
        ob.clear();
        ob.type = geoBase.GEO_POINT;
        ob.x = x;
        ob.y = y;
        return ob;
    }
    // the cheaterLine and circle would just take cheated points, so, skippem.
    public int addCheaterPoint(float x, float y) {
        geoBase ob;
        int res;
        ob = makeCheaterPoint(x, y);
        res = addBase(ob);
        if (res!=0) {
            setOps(res, 0, 0, 0, geoBase.GEO_CHEATER);
        }
        return res;
    }
    
    // two points only.
    public int addLine(int ob1, int ob2) {
        int res;
        geoBase goalie;
        goalie = new geoBase();
        
        res = 0;
        if ((objCount<GEO_MAX_BASE)&&(isAThing(ob1)==1)&&(isAThing(ob2)==1)) {
            res = objCount;
            if (objs[ob1].isAPoint()==0) {
                res = 0;
            }
            if (objs[ob2].isAPoint()==0) {
                res = 0;
            }
            if (objs[ob1].equalPoints(objs[ob2])==1) {
                res = 0;
            } // can't make a line out of one point!
            
            if (res==objCount) {
                objs[objCount].setAsLine(objs[ob1].x, objs[ob1].y, objs[ob2].x, objs[ob2].y);
                setOps(objCount, ob1, ob2, 0, geoBase.GEO_ADDLINE);
                ++objCount;
            }
        }
        return res;
    }
    
    
    // two points only.
    public int addCircle(int ob1, int ob2) {
        int res;
        res = 0;
        if ((objCount<GEO_MAX_BASE)&&(isAThing(ob1)==1)&&(isAThing(ob2)==1)) {
            res = objCount;
            if (objs[ob1].isAPoint()==0) {
                res = 0;
            }
            if (objs[ob2].isAPoint()==0) {
                res = 0;
            }
            if (objs[ob1].equalPoints(objs[ob2])==1) {
                res = ob1;
            } // can't make a line out of one point!
            
            if (res==objCount) {
                objs[objCount].setAsCircle(objs[ob1].x, objs[ob1].y, objs[ob2].x, objs[ob2].y);
                setOps(objCount, ob1, ob2, 0, geoBase.GEO_ADDCIRCLE);
                ++objCount;
            }
        }
        return res;
    }
    
    
    
    // intersection returns 0, 1, or 2 points.
    // the "first" one is the one "closest" to target.
    // returns the point of intersection not returned by cI.
    // can also return NULL.
    public int addFirstIntersection(int ob1, int ob2, int target) {
        int res;
        res = 0;
        objs[objCount].setAsFirstIntersection(objs[ob1], objs[ob2], objs[target]);
        if (objs[objCount].type!=geoBase.GEO_NULL) {
            setOps(objCount, ob1, ob2, target, geoBase.GEO_FIRST_INT);
            res = objCount;
            ++objCount;
        }
        // whichever is closer, add that to the figure.
        return res;
    }
    
    
    public int addSecondIntersection(int ob1, int ob2, int target) {
        int res;
        res = 0;
        objs[objCount].setAsSecondIntersection(objs[ob1], objs[ob2], objs[target]);
        if (objs[objCount].type!=geoBase.GEO_NULL) {
            setOps(objCount, ob1, ob2, target, geoBase.GEO_SECOND_INT);
            res = objCount;
            ++objCount;
        }
        // whichever is closer, add that to the figure.
        return res;
    }
    
    
    
    // points on lines or circles
    public int addParametricPoint(int obj, float t) {
        int res;
        res = 0;
        objs[objCount].setAsParametric(objs[obj], t);
        if (objs[objCount].type!=geoBase.GEO_NULL) {
            setOps(objCount, obj, 0, 0, geoBase.GEO_PARAMETRIC);
            res = objCount;
            ++objCount;
        }
        return res;
    }
    
    
    
    // by changing a t down in the figure's tree, cause movement!
    public void setParameter(int obj, float tin) {
        if (objs[obj].creationOp == geoBase.GEO_PARAMETRIC) {
            objs[obj].t = tin;
            recalculate(obj);
        }
    }
    
    
    public float closestPointParam(int obj, int pt) {
        return objs[obj].closestPointParam(objs[pt]);
    }
    
    
    // interface for XML files of figures, and stuff.
    public int command(int op, int obj1, int obj2, int target, float tin, float vin) {
        int res;
        res = 0;
        switch (op) {
            case geoBase.GEO_CHEATER:
                res = addCheaterPoint(tin, vin);
                break;
            case geoBase.GEO_FIRST_INT:
                res = addFirstIntersection(obj1, obj2, target);
                break;
            case geoBase.GEO_SECOND_INT:
                res = addSecondIntersection(obj1, obj2, target);
                break;
            case geoBase.GEO_PARAMETRIC:
                res = addParametricPoint(obj1, tin);
                break;
            case geoBase.GEO_ADDLINE:
                res = addLine(obj1, obj2);
                break;
            case geoBase.GEO_ADDCIRCLE:
                res = addCircle(obj1, obj2);
                break;
                //    case geoBase.GEO_GIVE_NAME:
                //      res = giveName(obj1, obj2);
                //      break;
            case geoBase.GEO_SET_NAMED:
                res = obj1;
                reset(obj1, objs[obj2]);
                break;
            case geoBase.GEO_SET_PARAMETER:
                res = obj1;
                setParameter(obj1, tin);
                break;
        }
        return res;
    }
    
    
    
    public geoBase getBase(int which) { 
        return objs[which];
    }
    
    
    
    // starting with the base objects, 
    public void addInitialFigure(float xin, float yin, float win, float hin) {
        int p1, p2, p3, p4, p5, p6, p7, p8, p9, p10;
        int c1, c2, c3, c4, c5, c6, c7, c8; 
        int l1, l2, l3, l4;  
        
        objs[0].clear();                    // 0: null
        objCount = 1;
        p1 = addCheaterPoint(xin, yin);     // 1: origin
        p2 = addCheaterPoint(xin+win, yin);   // 2: pt at origin+(w,0)
        p3 = addCheaterPoint(xin+hin, yin);   // 3: pt at origin+(h,0);
        l1 = addLine(p1, p2);               // 4: top margin
        c1 = addCircle(p1, p2);             // 5
        c2 = addCircle(p1, p3);             // 6
        p4 = addSecondIntersection(c1, l1, p2);// 7
        c3 = addCircle(p4, p2);             // 8
        c4 = addCircle(p2, p4);             // 9
        p5 = addSecondIntersection(c3, c4, p1);//10:
        l2 = addLine(p1, p5);               //11: left margin
        p6 = addSecondIntersection(c1, l2, p4);    //12: bottom-left of square
        p7 = addFirstIntersection(c2, l2, p6);    //13: bottom-left of page
        c5 = addCircle(p2, p1);             //14
        c6 = addCircle(p6, p1);             //15
        p8 = addFirstIntersection(c5, c6, p5); //16: bottom-right of square
        l3 = addLine(p2, p8);                //17: right margin
        c7 = addCircle(p3, p1);             //18
        c8 = addCircle(p7, p1);             //19
        p9 = addSecondIntersection(c7, c8, p1); //20:
        l4 = addLine(p7, p9);                //21: bottom margin
        p10= addFirstIntersection(l4, l3, p9); //22: bottom-right of page
    }
}

/*
 test code
 
 
 float t; 
 geoFigure tf; 
 
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


