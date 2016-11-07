


float t; 
int ctr; 
geoPage tf; 
geoHandy theH; 
  

void setup() {
  int a, b, c, d; 
  
  // standard processing stuff
  size(1200, 1200); 
  stroke(0, 0, 0);
  noFill(); 
  t = 0; 
  ctr = 1; 
  theH = new geoHandy(); 
  
  // page with a standard figure; origin at 200,200
  //    point width 5, label width 3, width 250, height 300
  tf = new geoPage(500, 500, 5, 3, 630, 680); 
  theH.setPage(tf); 
  
  //a = tf.addMark(11, 1, 13); // 1 and 13 are the top and bottom left corners
  //b = tf.addMark(17, 2, 22); // 2 and 22 are the top and bottom right
  //fill(250); 
  //tf.loft(a, b, 0.01); // draw a triangle strip between the two marks
  noFill();
  // draw all the marks in the figure so far; the argument indicates that they are to be labeled
  theH.addSpiral(1, 2, 22, 13, 20); 
  //tf.trace(0); 
  tf.drawMarks(); 
  
}

void draw() {
  
  t+=0.1;
  int a, b, c, d,e,f,g,h;
  
  background(204); // usual processing thing
  
  tf.clear(); // erase the figure
  theH.addInitialFigure(200.0,200.0, 330.0+(200.0*sin(t*0.15)), 380.0+(200.0*sin(t*0.12))); 
  // add the initial figure back in, 
  // but use t to animate it.addInitialFigure(400, 400, 250+100*sin(t*.2), 300+130*sin(t*.13));
  // draw the standard figure again, but this time, no labels
  noFill(); 
/*
  a = theH.circleThroughThreePoints(1, 2,13); 
  b = tf.addCircle(a, 1); 
  c = theH.insetHexagon(b, a, 1); 
  d = tf.addLine(1, c); 
  e = tf.addLine(1, c-1); 
  f = tf.addLine(c, c-1); 
  */
  //a = tf.addLine(1, 22); 
  //b = theH.addSquare(1, 22, a, 2); 
  //theH.addSpiral(1, 2, 22, 13, ctr); 
  tf.trace(0); 

  // use the parts of the standard figure to fill in some areas


  // 14 and 18 are two circles
  //a = tf.addMark(14, 1, 16); // 16 is defined to lie on 14
  //b = tf.addMark(18, 1, 22); // 22 does not lie on 18; there's some play in the loft
  //fill(30);
  //tf.loft(a, b, 0.01);   

  // 5 and 8 are two other circles
 // g = tf.addMark(b-3, 1, b); 
  //h = tf.addMark(b-4, 22, b-1); // these points are all fixed to their circles; no play
  //fill(255);
  //tf.loft(g, h, 0.01);   


}

