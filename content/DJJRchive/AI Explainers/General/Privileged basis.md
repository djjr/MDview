---
tags:
  - ai
  - math
  - linear_algebra
  - type/moc
  - status/evergreen
---
The basis of a vector space is a set of vectors in terms of which any point in the vector space can be expressed as a linear combination.

The basis we are most familiar with is the Cartesian unit vectors for 3D space : $\hat x, \hat{y}, \text{and} \hat{z}$. These basis vectors are orthogonal - at right angles to one another - but a basis need not be orthogonal.

Any given vector space has an infinite number of bases, each a linear transformation of others.

If the vectors in the basis are interpretable, we can call the basis a privileged basis.

###### Example
Consider a three dimensional semantic space - concreteness, valence (positive or negative), and activity. The geometry of this space is shown below. We have also "located" eight short sentences at the corners of the unit cube in this space.
<img src="https://innoeduvation.org/images/AI-explainers/Sentencesin3DSemanticSpace.svg">
But in general, word embeddings do not have an obvious privileged basis. Suppose, for example, we have an embedding space with 3 dimensions. We would love it if each dimension "meant" something so that the directions $$\begin{equation}
\begin{pmatrix} 1 \\ 0 \\ 0 \end{pmatrix} \quad
\begin{pmatrix} 0 \\ 1 \\ 0 \end{pmatrix} \quad
\begin{pmatrix} 0 \\ 0 \\ 1 \end{pmatrix}
\end{equation}$$
could be easily interpreted semantically.

Now suppose, for example, we had an embedding in this space for the token "queen" and it was $[1,1,1]$. We scratch our heads trying to figure out what it means. Then we look for the embeddings for "king", "prince", and "princess": $$\begin{equation}
\text{king}=\begin{pmatrix} \begin{array}{r}

-3 \\ 3 \\ 5 \end{array} \end{pmatrix} \quad
\text{prince}=\begin{pmatrix} \begin{array}{r} -8 \\ 3 \\ 10 \end{array} \end{pmatrix} \quad
\text{princess}=\begin{pmatrix} \begin{array}{r} -4 \\ 1 \\ 6 \end{array} \end{pmatrix}
\end{equation}$$
But if we transform the embedding space with the matrix $$\begin{pmatrix} 
\begin{array}{rrr} 
2 & 2 & 1 \\ 
1 & -1 & 1 \\ 
0.25 & 0 & 0.25 
\end{array} 
\end{pmatrix}$$
We end up with these vectors $$\begin{equation}
\text{queen}=\begin{pmatrix} \begin{array}{r}

5 \\ 1 \\ 0.5 \end{array} \end{pmatrix} \quad\text{king}=\begin{pmatrix} \begin{array}{r}

5 \\ -1 \\ 0.5 \end{array} \end{pmatrix} \quad
\text{prince}=\begin{pmatrix} \begin{array}{r} 0 \\ -1 \\ 0.5 \end{array} \end{pmatrix} \quad
\text{princess}=\begin{pmatrix} \begin{array}{r} 0 \\ 1 \\ 0.5 \end{array} \end{pmatrix}
\end{equation}$$
And now we can interpret dimension 1 as power - kings and queens have a lot, princes and princesses have none; dimension 2 as sex where +1 = female and -1 = male; and dimension 3 is "other stuff " that is more or less the same for all four.

The embedding vectors are shown in the original and the transformed basis below. What do we see here? In the new basis the Y dimension (vector component 2) represents sex (+1 female, -1 male) and the X dimension represents power.
![](https://innoeduvation.org/images/AI-explainers/privileged_basis_image01.png)You should think of this transformation as the coordinate grid having been rotated and sheared, not the points moving. The geometric relationships between the points (distances, angles, etc.) remain the same - what changes is how we describe their positions.

The beauty of finding a "privileged basis" is that it reveals the underlying semantic structure that was hidden in the original coordinate system. Instead of points distributed in a way that doesn't immediately reveal their relationships, the transformed basis makes the meaningful patterns visually apparent.

This is exactly the goal in transformer interpretability research - finding coordinate systems where the dimensions align with meaningful features or concepts that the model has learned to represent.

##### Appendix
<iframe src="https://innoeduvation.org/danryan/dev/obsidian/privileged_basis01.html" width="750" height="400"></iframe>
