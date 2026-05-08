---
tags:
  - ai
  - neural-networks
short_title: Naive Neural Networks
---
# Some Naive Speculation about Neural Networks
###### Dan Ryan c2024
Consider a simple neural network (NN) with input vector $X \in \mathbb{R}^n$ and a first hidden layer of dimension $m$. Then we have a weight matrix 
$$
	\begin{bmatrix} 
	w_{11} & \cdots & w_{1n} \\
	\vdots & \vdots & \vdots\\
	w_{m1} & \cdots & w_{mn} \\
	\end{bmatrix}
	$$
Each row can be read as a vector in the input space.

At each neuron in the first layer the input to the activation function is the dot product of the input and the corresponding row in the weight matrix.

This real number can be interpreted as the projection of the input onto the weight vector.

If, as is likely, the weight vectors are not all linearly independent, and/or if $m \lt n$, then the weight vectors do not span the input space.

Suppose the projection of $\mathbf {X}$ on $\mathbf {W_i}$ is $a_i$. Then we would like to be able to reconstruct $\mathbf{X}$ as 
$$
\sum {a_i \times \mathbf{w_i}}
$$
but we end up with parts of $\mathbf{X}$ that are not captured.  This component of $\mathbf {X}$ lies in the null space of $\mathbf{W}$. If $\mathbf{W}$ has linearly dependent rows or fewer rows than $n$, then it spans only a subspace of the input space. The other part of the input space is invisible or irrelevant to the network.

This is analogous to when we have coefficients that are not statistically different from zero in a regression equation.

The above refers only to the raw weighted averages that are input into the activation functions in the neurons in the hidden layer (we'll ignore bias values for now).  If the activation function is ReLU, it effectively "ignores" any of those projections onto weight vectors that are negative. This constitutes a second masking of input data as irrelevant.

Weight vectors are linear combinations of the basis vectors of the input space. Typically this would be the embedding vectors of the model.  Thus, the weight vectors are "features" or "meanings" that are in the input space but are not, in general, represented by a single embedding vector.

If the weight vectors do not span the input/embedding space then all of the meaning that can be represented in the embedding space is not relevant to the model.

So, we have two things that filter out or block information that could be in the input: the part of the input space that is deemed irrelevant by the weight vectors and the projections that are rejected by the ReLU.

What do we make of these? At first it seems like we are foolishly leaving information behind but note that this is only true of each neuron. The whole ensemble of neurons in the layer may well make up for this.

But we might wonder if the training of the network has effected a sort of division of labor between the weight vectors and the ReLU.  The weight vectors are optimized to recognize patterns that have a high degree of "featureness."  The ReLU then enforces an appropriate level of abstraction.

We might have a projection along a weight vector that corresponds to "sweetness" and another in the opposite direction that WE would interpret as sour but literally here it means "very not sweet."  ReLU says ignore it, not relevant.  

I wonder if this suggests that "opposite" is a later feature of semantics.  The ReLU is forcing us to keep things simple and somewhat absolute.  In the first layer of the model "sweet" and "sour" might be independent meanings. There is no representation of "opposite" yet.

Apparently, this tracks with how children learn - concepts like hot and cold are learned separately before hot and cold as ends of a spectrum is learned.

We might speculate about a sequence that gets learned in subsequent layers. First, perhaps comparative degrees - more hot, less hot.  Then perhaps transitivity - more hot1 than hot2 and more hot2 than hot3 equals more hot1 than hot2. Then a similarity of not so hot with not so cold. Then perhaps resonance between relationship of hot and cold and sweet and sour yields oppositeness.

So maybe the apparent discarding of information is a necessary part of the process. Constraining early representations enforces a simplicity that can be used to build subsequent complexity.  The masking of information makes possible the emergence of hierarchical abstraction structures.

**Bias.** Above we ignored bias. Recall that ReLU acts on $\mathbf{W \cdot X} + b$.  Earlier we said ReLU ignores negative projections. But we must revise that.  We can interpret the bias as saying "keep this feature detection active unless there is strong evidence against it" ($b>0$) or "this feature needs to be strongly present before we care about it" ($b<0$).

**Postscript.** Something that continues to bother me is whether there is information that is always and permanently irrelevant. Or if evolutionarily some information just does not make the attention cut. And so, maybe training on human text is a good thing because there is a whole swath of stuff humans ignore and which would raise the price of computation without improving performance.  Perhaps a machine intelligence that was trained on its own experience of the world through sensors that were not evolutionarily trained to ignore the irrelevant will, in fact, always operate at a handicap vis a vis humans.