---
tags:
  - ai
  - math
  - type/moc
  - status/evergreen
---
The gradient is a mathematical way to specify what direction is uphill. Hikers and bikers know that even if you can see the peak, the direction that is UP from an particular spot can vary.
![](https://innoeduvation.org/images/AI-explainers/gradient/gradients.png)

#### The Gradient V0.0
Consider the XY plane we all remember from grammar school.
![](https://innoeduvation.org/images/AI-explainers/gradient/XYplane.png)
Suppose we tilt the plane relative to the X axis.
![](https://innoeduvation.org/images/AI-explainers/gradient/XYplaneTitledX01.png)
What direction is UP HILL on the tilted plane?
![](https://innoeduvation.org/images/AI-explainers/gradient/XYplaneTitledX02.png]]
What if we tilt the plane instead relative to the Y axis?
![](https://innoeduvation.org/images/AI-explainers/gradient/XYplaneTitledY01.png)
The uphill direction is again obvious.
![](https://innoeduvation.org/images/AI-explainers/gradient/XYplaneTitledY02.png)
But what if we tilt the plane a little bit relative to X and and little bit with respect to Y; what is the most uphill direction now?
![](https://innoeduvation.org/images/AI-explainers/gradient/XYplaneTitledXY01.png)
Recall the idea of "rise over run" as a way of describing the slope of a line?  If we look only at the X axis above we see the rise over the run is $\frac{5}{2}=0.5$.  And if we look at just the Y direction we have $\frac{2}{10}=0.2$
It turns out that if we consider a vector of length 5 along the X axis and a vector of length 2 along the Y axis, together they define a direction in the XY plane that corresponds to up hill in the tilted plane![[XYplaneTitledXY02.png]]
![](https://innoeduvation.org/images/AI-explainers/gradient/XYplaneTitledXY03.png)
![](https://innoeduvation.org/images/AI-explainers/gradient/XYplaneTitledXY04.png)
Same Example from a Different Perspective
Imagine now that we have an XY plane in which each point has a different temperature and that the temperature at point (X,Y) is given by $T = 50 \times X + 20 \times Y$. A heat map of such a scenario is shown below.
![](https://innoeduvation.org/images/AI-explainers/gradient/heatmap01.png)
This is analogous to our previous example with the height (z-axis) of the points in the tilted plane corresponding to temperature (and we have multiplied everything by 10 so we can zoom in and keep the numbers simple). 
Our question is similar. If we are starting at (0,0) in the upper left, what direction should we walk in order to have the temperature increase most rapidly.  Let's imagine we walk 3 units in some direction. The 3 units from the origin frontier is shown below.
![](https://innoeduvation.org/images/AI-explainers/gradient/heatmap02.png)
We can visually zero in on the highest temperature along this horizon. It appears to be ~163.  But can we analytically identify the direction?

Recall above how we computed the rise over the run only relative to the X axis? Another way to phrase that is to ask what the change in the z coordinate is for each unit change in the x coordinate. The math notation for this is $\frac{\partial{Z}}{ \partial{X}}$.

How do we compute a value for this?  In this case we can consider the "run" from 0 to 3 in the X direction. What's the "rise" for this?  The temperature at 3 is 150 and the temperature at 0 is 0. So:
$$
\frac{\text{rise}_x}{\text{run}_x} = \frac{150 - 0}{3 - 0} = 50 = \frac{\partial{T}}{\partial{X}}
$$
What about in the Y direction?
$$
\frac{\text{rise}_y}{\text{run}_y} = \frac{60 - 0}{3 - 0} = 20 = \frac{\partial{T}}{\partial{Y}}
$$
It turns out that the "up hill" (toward the higher temperature) lies in a direction given by the line from (0,0) to ($\frac{\partial{T}}{\partial{X}}, \frac{\partial{T}}{\partial{Y}})$.  If we scale things down by a factor of 20, this direction is given by the point $(2.5,1.0)$ as shown below. 
![](https://innoeduvation.org/images/AI-explainers/gradient/heatmap04.png)
This direction is called the gradient of the function that generates T. The gradient describes how movement (changes) in the X and Y directions affect the value of T. You can confirm this by looking at numbers in the grid.  When we move one column to the right we increase X by 0.1 and Y does not change.  $0.1 \times 50 = 5$ which is how many degrees warmer the second number is.

So, the gradient at any given $(x, y)$ points in the direction that yields the biggest increase in T per unit of movement.

In our example, the gradient is the same all over because the surface is just a tilted plane.

But imagine it was a hilly surface defined by a funky function of X and Y such as 
$$
f(x,y) = 2 * sin(x) * cos(y) + sin(2x) * cos(2y) + e^{-\frac{(x-5)^2 + (y-5)^2}{10}}
$$
Here's what it looks like in two dimensions:
![](https://innoeduvation.org/images/AI-explainers/gradient/PLOT2D.png)
Here the yellow are the hot/high spots and the darkest blue the cold/low spots. Here's what it looks like in 3D:
![](https://innoeduvation.org/images/AI-explainers/gradient/PLOT3D.png)
Remembering that our definition of gradient is the direction, at any given point, that is most "up hill" we can plot the gradient vectors on this surface like this:
![](https://innoeduvation.org/images/AI-explainers/gradient/PLOT2DwGradient.png)
Notice that the title of the graph includes the phrase "using explicit derivatives." This is because the way we made this plot was to compute an expression for the "rise over run with respect to X (or Y)" for our function, $f$.

The tool for doing that is called "taking the partial derivative," something we learn in calculus.  We don't need to know the arithmetic of taking the derivative, just that what it represents is how much the function changes per unit of movement in each direction.

For reference, here are the equations for the partial derivatives:

$$
\frac{\partial{f}}{\partial{x}} = 2cos(x)cos(y) + 2cos(2x)cos(2y) − (\frac{x − 5}{5}​)e^{−\frac{(x−5)^2+(y−5)^2}{10}} \\
$$
$$
\frac{\partial f}{\partial y} = -2 \sin(x) \sin(y) - 2 \sin(2x) \sin(2y) - (\frac{y-5}{5}) e^{-\frac{(x-5)^2 + (y-5)^2}{10}}

$$


In the previous example, the rise/run was the same for all points. This time we have a surface that varies in steepness and whether it's going up or down depending where we are.

With an equation for $\frac{\partial{f}}{\partial{x}}(x,y)$ and $\frac{\partial{f}}{\partial{y}}(x,y)$ we can compute these to get gradient vectors at each point. These are represented by arrows in the last plot.

#### So What? Where will this be useful?

When we are training a model we ask it to process some sample input to produce a prediction.  We then compare this prediction to what we expected.  The difference is called "the loss."  The loss is analogous to our Z variable or temperature above.  The weights of the model are analogous to our X and Y.  That is, the loss is a function of the values of weights.  If you take the derivative of this function you can find the gradient like we just did.  In "weight space" the gradient points in the "up hill" direction - the direction you would move - from a specific point in weight space (that is, the current values of the weights) - that would most increase the loss.  But we are interested in decreasing the loss (i.e., changing each weight so that the prediction is better) and so we are interested in the negative of the gradient.  This vector tells us what direction to move in weights space or, alternatively, how to adjust each weight, so that the loss would be a little less.