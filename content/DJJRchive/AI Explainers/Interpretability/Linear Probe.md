---
tags:
  - ai
  - explainer
  - type/moc
  - status/evergreen
---
# Linear Probe
On the drive home from CHAI on Sunday, we started talking about things we still didn’t quite understand. One that came up - mentioned in a few interpretability talks - was _linear probing_ in neural networks: how it helps us detect what kind of _semantic work_ a given layer is doing.

Let's start with a simple diagram that represents the neural network as a black box. We give it some input and it returns some output.[^1]
![](https://innoeduvation.org/images/AI-explainers/LinearProbe00.svg)

[^1]: <a href="https://docs.google.com/drawings/d/1r9M0nUdH-pc4Ey54MW_vYoko7dIWU4gh5ig_uLG5Tis/edit?usp=drive_link">Google Drive</a>

The input here is a word or actually a token or actually a very high dimensional vector that is the embedding of that token.[^2]
<img src="https://innoeduvation.org/images/AI-explainers/LinearProbe01.svg">

[^2]: <a href="https://docs.google.com/drawings/d/1rsHW95V9WY8-YNbFsOKHEw8RqXT858lREO5WLe29ec0/edit?usp=drive_link">Google Drive</a>

Now let's look inside the black box. For pedagogical purposes, we’ll imagine a tiny neural network, just a few layers with two neurons each. But first, we need a way to compress the large embedding vector down to something we can plot in 2D. So, our first glimpse inside the black box might look like this[^3]:
<img src="https://innoeduvation.org/images/AI-explainers/LinearProbe02.svg">

[^3]: <a href="https://docs.google.com/drawings/d/1bQZbMEdtPw32ZLLh6vwliJjXE43iYvzsM_HoLatQUa8/edit?usp=drive_link">Google Drive</a>

We label the 2-dimensional vector the "activation vector" because the values here are the "outputs" of the first layer of neurons. Since it is two dimensions we can represent it as a direction in the plane.

Next, we show a bit more of what's going on inside the black box by adding a few more layers. Each of these layers rotates, stretches, and skews the vector.[^4]
<img src="https://innoeduvation.org/images/AI-explainers/LinearProbe03.svg">

[^4]: <a href="https://docs.google.com/drawings/d/1hsN6cgn8ZRb5x_c4hpZ1HwEQzbhuRXtVnAmNOHgeaJg/edit?usp=drive_link">Google Drive</a>

#### How does the network do what it does?
The large language models we interact with operate in extremely high-dimensional spaces and perform remarkably nuanced feats of semantic understanding. Somehow, these models learn to distinguish hot from cold, past from present, good from bad, concepts that we think of as semantic, not just statistical.

One hypothesis about _how_ this happens is that **different layers in the network progressively reshape the internal geometry of the data** to make these semantic distinctions easier to recognize.

Each layer takes the output from the previous one -- a high-dimensional vector -- and applies a **linear transformation**, multiplying it by a matrix of learned weights (we’ll set aside nonlinearities for the moment). This transformation can **rotate**, **stretch**, or **shear** the space, effectively **repositioning vectors relative to each other**.

As this process unfolds across layers, the network rearranges the space so that certain semantic properties become effectively "visible": a simple weighted sum of a token’s vector components can tell which side of a conceptual distinction it falls on -- like hot vs. cold, or past vs. present. In this view, **a layer “recognizes” a semantic feature not by labeling it directly, but by arranging the space so that a direction corresponds to the feature.**

##### That's How Linear Classifiers Work
A basic machine learning classification model figures out how to put data points into categories based on a simple weighted sum of the points' components.  In two dimensions this amounts to finding a line that separates a set of points so that all the points with label A are on one side and all the points with label B are on the other side. If this is possible, the data set  is called "linearly separable." That’s the key test we’ll apply to each layer: has the network positioned the points in a way that lets us draw a straight line between categories?

Suppose we have a sample of 8 tokens and we label them semantically - hot/cold, hard/soft, sweet/sour.  
1. lava (hot, soft, sour)
2. ice cream (cold, soft, sweet)
3. tofu (hot, soft, sour)
4. pepper (hot, hard, sour)
5. pickle (cold, hard, sour)
6. rock candy (cold, hard, sweet)
7. yogurt (cold, soft, sweet)
8. yam (hot, hard, sweet)

At first, each token is a point in high dimension embedding space. 
![](https://innoeduvation.org/images/AI-explainers/LinearProbe04.png)
But then the  first layer of our model maps each token to a point in 2 dimensional space. Initially, the arrangement does not seem to "mean" anything.  We don't see a pattern of things getting sweeter as you go up or harder as you go left or right.
<img src="https://innoeduvation.org/images/AI-explainers/LinearProbe045.svg">
To make that observation more precise, we try to train a simple classifier on this data - not the original data, but these activation vectors that are the output of layer 1 for each of the input tokens where what we are trying to predict is one of the semantic labels.  It fails.

But as the data flows through more layers, the network reshapes the space.  We test again, trying to train a classifier for each of our semantic distinctions on each layer.  Let's suppose that we find that for layer 2 we can train a classifier to predict hot and cold and for layer 3 we can train a classifier to predict hard and soft.

This is shown schematically below.

<img src="https://innoeduvation.org/images/AI-explainers/LinearProbe05.svg">

This is the idea behind linear probes: they let us peek inside the model and ask, at each layer, _what kinds of meaning are starting to take shape here?_ We’re not just looking for what the model _outputs_, but _where_ in the network different kinds of understanding emerge.