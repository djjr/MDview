---
tags:
  - ai
  - explainer
  - linear_algebra
  - math
  - type/concept
  - status/evergreen
---
# Linear Transforms for AI  
A lot of what goes on inside of language models is the multiplication of a vector (a list of numbers) by a matrix (a table of numbers) to yield a new vector $$\begin{pmatrix} w_{1,1} & w_{1,2} & w_{1,3} \\ w_{2,1} & w_{2,2} & w_{2,3} \\ w_{3,1} & w_{3,2} & w_{3,3} \end{pmatrix} \begin{pmatrix} x_1 \\ x_2 \\ x_3 \end{pmatrix} = \begin{pmatrix} x'_1 \\ x'_2 \\ x'_3 \end{pmatrix}$$
This happens when an embedding vector encounters a perceptron layer or when a token's embedding vector is looked at by an attention head.

There are some interesting mathematical things going on here that are also qualitatively illuminating when we look more closely. A little review of linear algebra can buy us a lot of insight.

First a reminder of how matrix multiplication works. The length of the row of the matrix matches the height of the vector and rows multiply by columns element by element. Here's what it looks like for the 2 dimensional case 

$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
\begin{pmatrix}
x \\
y
\end{pmatrix}
=
\begin{pmatrix}
ax + by \\
cx + dy
\end{pmatrix}
$$

A vector like $\begin{pmatrix} x\\ y \end{pmatrix}$ represents a point in the $XY$ plane or you can think of it as an arrow from the origin to a point in the $XY$ plane.

<img src="https://innoeduvation.org/images/AI-explainers/2D-Vectors-01.svg" width="400">

The transform can stretch a vector, rotate the vector, or shear the vector (as when a square gets pushed into a parallogram).

If a vector represents dimensions of meaning we can talk about what these three transformations do. 

**Stretching** a vector makes it louder or softer; all of the components of meaning are amplified or attenuated.

Thus, the vector $v$ might represent "concern" and $2 \times v$ might represent "worry" and $3 \times v$ might represent anxiety.

**Rotation** allows us to see meaning through another lens and so we can think of it as clarification.  

Imagine we have learned some things about four words: queen, king, prince, and princess.  We represent each one as a vector in three dimensional space.  But it's hard to make much sense of it.  Prince and king are close to one axis, about the same distance from another. Queen and princess are on the other side of that axis but princess is closer. All about the same position on the vertical axis.
<img src="https://innoeduvation.org/images/AI-explainers/RotationasClarification01.svg" width="400">
But if we simply rotate the coordinate system, we get interpretable axes. King and queen are high in power while prince and princess are low.  And queen and princess have a positive value on a dimension we might label sex while king and prince have a negative value of about the same size.
<img src="https://innoeduvation.org/images/AI-explainers/RotationasClarification02.svg"  width="454">
Shearing is what happens when we lean on a square and it becomes a parallelogram.  The generic transformation matrix for a shear looks like this 
$$ 
\begin{pmatrix}
1 & k \\
0 & 1
\end{pmatrix}
$$
When we multiply a vector by this matrix the k term effectively borrows some value from the second component of the vector and adds it to the first. So, a shearing transportation redistributes value within a vector.

<img src="https://innoeduvation.org/images/AI-explainers/ShearTransform.svg" width="724">
To return to our earlier metaphor, if the components of the vector are meanings, a shearing transformation adds or subtracts weight to one dimension of meaning because of another dimension of meaning.

Example. Consider the token "bright" in embedding space. It might have dimensions representing:

- Intelligence (mental brightness)
- Luminosity (physical brightness)
- Positivity (emotional brightness)

A model might learn to tweak this representation by adding k units to the positivity dimension for each unit in the intelligence component.  What shear does is emphasize relationships between particular pairs of dimensions.
##### Summary
Stretching amplifies all dimensions independently.  Rotation treats the vector's dimensions equally and can move us toward meaningful or interpretable orientations.  Shear creates a directional dependency between specific dimensions.

Language models consist lots of matrix transformations. These can be conceptually (and sometimes mathematically) be decomposed into a sequence of scale, rotation, and shear operations.[^1] Thinking of these as amplification, clarification, and influence operations helps (me) get my head around what's going on at the level of meaning.

[^1]: In practice these are supplemented by selectively keeping only certain directions/dimensions and discarding others.
