---
tags:
  - ai
  - transformer
  - explainer
  - type/moc
  - status/evergreen
---
# A Toy Transformer
A language models is a machine learning system that can interpret human language and generate human language in response.

A transformer is a type of language model developed in the mid 20-teens. You may have heard of GPT (generative pre-trained transformer) and BERT (Bidirectional Encoder Representations from Transformers).  Older language models processed one token at a time. Transformers use "attention heads" (more on this later) to process all tokens in the input in parallel and so can capture the sense in long contexts. 

For this tutorial we will consider a really simple language that has only 8 words: the, a, cat, dog, fish, sits, runs, eats. We'll imagine that our input data is three words - the cat eats - and we want to predict the next word.

A non-transformer model will ask "what's the next word given that the previous word was 'eats' given that the previous word was 'cat' given that the previous word was 'the'?"

A transformer can ask "what's the next word given 'subject of sentence is 'cat', basic syntax so far is 'article noun verb', 'subject matter of the sentence is animals' and 'we seem to be talking about food'?"

![](https://innoeduvation.org/images/AI-explainers/transformers/toyTransformer/toyTransformerOverview.png)
###### A Few Terms
This provides an opportunity to give preliminary definitions for a few terms. 
- Generative: a system that predicts next words in a sequence
- Pre-trained: model is trained on large body of text before use
- Bidirectional: model looks at context before and after a word
- Encode: to process input data and store the information it contains in a standardized format
- Representation: the result of encoding; a numerical version of the meaning of a sequence of words
- Context: in general, the words around a given word; in practice, this refers to the amount of the input that a language model is paying attention to.
#### Let's Build a Toy Transformer
The main innovation in transformers are those "attention heads" we mentioned above.  "Attention mechanisms" allow transformers to focus on the most relevant parts of an input. In this tutorial, we'll break down how transformers work step-by-step using a simplified "toy transformer," hopefully making the concepts behind these advanced models accessible and intuitive.

Again, we start with a small vocabulary of eight words: `the`, `a`, `cat`, `dog`, `fish`, `sits`, `runs`, `eats`. Since we have only 8 words, we can encode them as a list of seven 0s and one 1 where the position of the 1 differs for each word.

```
    the   a   cat   dog   fish   sits   runs   eats
    1     0   0     0     0      0      0      0
    0     1   0     0     0      0      0      0
    0     0   1     0     0      0      0      0
    0     0   0     1     0      0      0      0
    0     0   0     0     1      0      0      0
    0     0   0     0     0      1      0      0
    0     0   0     0     0      0      1      0
    0     0   0     0     0      0      0      1
```

###### Another Few Terms
 We'll call a list of numbers like this a "**[[vector]]**."  The vector for "the" is \[1,0,0,0,0,0,0,0\]. This type of coding is called a **[[one-hot vector]]** because only one of the elements is non-zero or "hot."  

A vector can be thought of as the coordinates for a point in space, in this case an 8-dimensional space.  If we assign numerical "locations" for each word in our vocabulary like this, we call it an "**[[embedding]]**."  for each one (that's just a list of numbers with all zeroes except for a single 1). Each token or word is represented by a [[vector]] with as many components as the number of dimensions in the embedding space. In our toy system, this number is 8. The table above shows 8 **embedding vectors**, one for each word/token in our toy language.

Embedding spaces usually have fewer dimensions that the number of words in our vocabulary.  Of course, the more dimensions, the more nuance can be captured by a token's location. The figure below shows some tokens representing drinks embedded in a two dimensional meaning space.
![](https://innoeduvation.org/images/AI-explainers/transformers/toyTransformer/toyTransformerEmbeddingExample.png)
#### Toy Transformer Input Data
The input data—a string of tokens (for starters, we'll just have 3)—is a matrix made up of these 3 embedding vectors. So here we'll have an 8-row by 3-column matrix as input.

```
    the   cat   eats
    1     0     0 
    0     0     0  
    0     1     0   
    0     0     0    
    0     0     0    
    0     0     1    
    0     0     0  
    0     0     0     
```

The first thing we do with our data is recode it so that these vectors contain information about the position of each token.  To do this, we use something called position embeddings. Positional embeddings act like invisible labels attached to each token that say, “I’m the first word,” “I’m the second word,” and “I’m the third word.” These labels help the transformer understand the order of the words and how they relate to each other in context.

We are only looking at 3 word sentences for now, so we only need to have three position embedding vectors.  We will add these to the word embeddings so they are also 1x8 vectors just like the embeddings. In effect, the position vectors shift the original embeddings slightly in 8D space in a manner that corresponds to each token's position in the text.
![](https://innoeduvation.org/images/AI-explainers/transformers/toyTransformer/toyTransformerPositionEmbeddings.png)
###### EXTRA: How do we generate these positional embeddings?
To create positional embeddings, we use a combination of sine and cosine functions of different frequencies. Intuitively, these functions provide a way to encode position information in a smooth and continuous manner that the model can learn from. The sine and cosine functions allow the embeddings for each position to be unique but still have a systematic relationship with nearby positions. This ensures the model can learn patterns related to the sequence order.

Mathematically, for a position $pos$ and a dimension $i$, the positional embedding is calculated as:
$$
PE(pos, 2i) = \sin\left(\frac{pos}{10000^{2i/d_{\text{model}}}}\right), \quad PE(pos, 2i+1) = \cos\left(\frac{pos}{10000^{2i/d_{\text{model}}}}\right)
$$
This alternates sine and cosine values across dimensions and introduces smooth patterns that encode both absolute and relative positional relationships.

#### Running the Transformer
Let's see how our transformer would process the sentence "The cat eats."  $E$ is our collection of input vectors. $P$ is the set of position vectors. And $EP$ is the set of input data with the position information added.
![](https://innoeduvation.org/images/AI-explainers/transformers/toyTransformer/toyTransformerE+Pvectors.png)
##### Attention Heads Extract Meaning from Input Token String
$EP$ is the data our transformer's two attention heads will work on.  Functionally, each head scans the input looking for certain kinds of meta-information. Each head consists of three matrices - query, key, and value. The elements of these matrices are weights learned during training. Multiplying the input times $Q$ produces a "what am I looking for" vector.  The same operation with the $K$ matrix yields a "what I offer" vector. Together these will convey relevance.  The third matrix, $V$, transforms the input into a form that says "here is the information I contain if I am deemed relevant." In each case these refer to a token in the input.

**How big are these matrices?**  One dimension matches the size of the embedding space (here, 8). The other is a fraction of this usually dependent on the number of attention heads. We have 2 so the other dimension is 4. 
(NOTE: In the representation of $W_{Q_1}$ on the right the subscripts have two parts: the first number is 1 to 4 representing the dimension within the head; the second number counts through the embedding dimensions.)
![](https://innoeduvation.org/images/AI-explainers/transformers/toyTransformer/toyTransformerAttentionHeads.png)
The head matrices produce linear transformations of input vectors. They rotate and stretch those vectors AND project them onto a smaller dimensional space (here from 8 to 4).  Multiplying an input token's vector times a query (or key or value) matrix yields a (here 4D) query (key, value) vector.  Don't forget that the query matrix is **learned** during training. It gets good at doing what the query matrix is supposed to do (helping tokens figure out what to look for). Similarly for the key matrix (figure out what a token offers) and value matrix (figure out what information a token carries). Query and key combine to yield relevance and relevance weights value vectors as information is aggregated.

![](https://innoeduvation.org/images/AI-explainers/transformers/toyTransformer/toyTransformerQ+Kschematic.png)
##### Paying Attention in Our Toy Transformer
Here's what the learned attention head matrices might look like in our toy transformer.
![](https://innoeduvation.org/images/AI-explainers/transformers/toyTransformer/toyTransformerWMatrices.png)

Each row in WQ1 is a vector in our 8 dimensional embedding space. The four directions represented by the four rows are a basis for the 4 dimensional space onto which we project our 8D input vectors.

##### What does Head Matrix $×$ Input Data Get Us?
We multiply our $8 \times 3$ data matrix (EP) by our $4 \times 8$ query ($WQ_{1\text{ or }2}$) and key ($WK_{1\text{ or }2}$) and value ($WV_{1\text{ or }2}$) matrices the result is a $4 \times 3$ matrix that is three query (key, value, respectively) vectors side by side.    
![](https://innoeduvation.org/images/AI-explainers/transformers/toyTransformer/toyTransformerComputeKQVvectors1.png)
*NOTE: Each attention head yields three of each vector. The center of the diagram is just reminding us that we can see three 4D vectors in the 4x3 matrix products.*
##### Making Sense of What Attention Got Us
Just to review what's happening here, let's look at the same thing in a simplified version with a 3 dimension embedding space and an attention head that is projecting the input into 2 dimensions.
![](https://innoeduvation.org/images/AI-explainers/transformers/toyTransformer/toyTransformerQKtransform3D-2D.png)
Remember that our query matrix looks at the input and asks "what am I looking for?" and the key matrix says "what do I offer?" If the resulting vectors point in the same direction, this means that the dot product or cosine similarity between the query and key vectors is high. In simple terms, this tells us that a token is highly relevant to what the attention head is focusing on.

The next step is to allow the attention head to actually extract semantic information from the data by ascertaining how aligned the query and key vectors are. The dot product quantifies how well each token's 'query' aligns with another token's 'key,' helping the transformer decide which tokens should influence the focus token. 

$$
\text{Relevance} = q \cdot k = \sum_{i=1}^{d_{head}} q_i \cdot k_i = (q_{1} \cdot k_{1}) + (q_{2} \cdot k_{2}) + \dots + (q_{d_{head}} \cdot k_{d_{head}})
$$

And we want to do this for each pair of tokens so that we can have each one pay as much or as little attention to each other token as is appropriate.  Recalling how we wrote several Q vectors next to one another as a matrix above (and the same for K vectors) we can take these 4 row by 3 column vectors, transpose the rows and columns of one and multiply them together.
$$
\begin{bmatrix} q_{11} & q_{12} & q_{13}  & q_{14} \\ q_{21} & q_{22} & q_{23}  & q_{24} \\q_{31} & q_{32} & q_{33}  & q_{34} \end{bmatrix} \times \begin{bmatrix} k_{11} & k_{12} & k_{13} \\ k_{21} & k_{22} & k_{23}\\k_{31} & k_{32} & k_{33} \\k_{41} & k_{42} & k_{43}\end{bmatrix} = \begin{bmatrix} ps_{11} & ps_{12} & ps_{13} \\ ps_{21} & ps_{22} & ps_{23}\\ps_{31} & ps_{32} & ps_{33} \end{bmatrix}
$$

$$
PS_1 = Q^T \times K
$$

With our toy transformer we can compute the position scores by multiplying the transpose of the query matrix by the key matrix.
![](https://innoeduvation.org/images/AI-explainers/transformers/toyTransformer/toyTransformerQTxK.png)
Each row tells us how much each token depends on or attends to each other token.  The diagonals, thus, represent "self attention." A high self-attention number might suggest that a token's meaning is very independent of other tokens.

The rows here represent each query vector and how it attends to each of the tokens(keys) in the data.  In order to use these numbers as an answer to "how to divide my attention" we want to turn them into probabilities that add to one.  To do this, we use the softmax function.
$$
     \text{Attention Weights} = \text{softmax}(Q^T K)
$$
![](https://innoeduvation.org/images/AI-explainers/transformers/toyTransformer/toyTransformerApplySoftmaxToRows.png)
##### What Does Softmax Do?
After computing the position scores ($Q^T K$), we need to turn these raw similarity values into a form that makes sense as attention weights. This is where **softmax** comes in.

Softmax converts a list of raw scores into probabilities, ensuring that:

1. **All probabilities are positive**: Even if some scores are negative, softmax ensures the output weights are all non-negative.
2. **Probabilities sum to 1**: This means we can interpret the result as a distribution of how much attention each token should receive.

###### The Formula:
For a row of position scores $s_1, s_2, \dots, s_n$ ​: $\text{softmax}(s_i) = \frac{e^{s_i}}{\sum_{j=1}^{n} e^{s_j}}$
###### Intuition:
The exponential function $e^{s_i}$​ makes higher scores stand out more, emphasizing the most relevant tokens.  Dividing by the sum normalizes the values so they sum to 1, turning the raw scores into meaningful probabilities.
###### Why Softmax is Important for Attention:
Softmax ensures that each token distributes its "attention budget" across other tokens in the sequence. For example: If $Q^T K$ gives high similarity between token 1 and token 3, softmax ensures that token 1 focuses more on token 3 while still distributing some attention to others.
#### Stacking Up the Results
Now we combine the information extracted by the attention heads by multiplying the value matrix ($V$) with the attention weights (softmax output). This step assigns the weighted relevance of each token’s information to every other token. For each attention head, this produces a matrix representing how the input tokens contribute to the output.
![](https://innoeduvation.org/images/AI-explainers/transformers/toyTransformer/toyTransformerComputeVmatrix.png)
DJR NOTE: I have the rows and columns swapped. We want to concatenate, not stack results and so there might be a $M^T$ up there somewhere.  See bolded text below for what we are aiming at.

$$
\text{Context Matrix} = \text{Value Matrix} \times \text{Attention Weights Matrix}
$$
$$
\begin{bmatrix}0.6 & 0.19 & 0.21 \\ 0.19 & 0.34 & 0.47 \\ 0.16 & 0.31 & 0.53 \end{bmatrix} \times \begin{bmatrix} 0.6 & 0.19 & 0.21 \\0.19 & 0.34 & 0.47 \\0.16 & 0.31 & 0.53 \end{bmatrix} = \text{4 rows x 3 cols}
$$
The second attention weights matrix and value matrix yields another 4 rows x 3 cols.  We stack these on top of each other to form the context matrix.

The context matrix contains the final, weighted representations of the input tokens after the attention mechanism has been applied. **Each row of the context matrix represents a token in the sequence, enriched with information from other tokens based on their relevance (attention weights).**

Finally, the outputs from all attention heads are concatenated into a single representation. This concatenated matrix combines the different perspectives learned by the individual attention heads, allowing the model to encode rich and diverse features about the relationships between tokens.
![](https://innoeduvation.org/images/AI-explainers/transformers/toyTransformer/toyTransformerConcatenate.png)
#### Integration Matrix
At this point we have a strange object - the concatenated results of the attention operations.  We want to find our way back to the original embedding space.

To do this, we add another layer here that applies a linear transformation to this concatenated output, re-projecting it back to the embedding space (e.g., from the multi-head concatenated dimension back to the original 8 dimensions in our toy transformer).

This gets multiplied by an $8 \times 8$ "integration matrix" that takes the simply concatenated results of our two attention heads and "mixes" them in a useful manner. This operation combines contributions from both heads, allowing the model to integrate different perspectives into a unified representation.
![](https://innoeduvation.org/images/AI-explainers/transformers/toyTransformer/toyTransformerIntegrationMatrix.png)
##### Vocabulary Projection
Finally, we multiply this by a **vocabulary projection matrix** to map the model's output back into the original vocabulary space for token predictions. This step takes the rich, multi-dimensional representation of each token (from the integration matrix) and projects it into a vector with a size equal to the vocabulary. Each value in this output vector represents a score for how likely the corresponding word in the vocabulary is to appear at that token's position. After applying softmax to this vector, we get probabilities for each token in the vocabulary at every position in the sequence. Finally, we multiply this by a vocabulary projection matrix to map the model's output back into the original vocabulary space for token predictions. This step assigns probabilities to each token in the vocabulary for each position.

![710](https://innoeduvation.org/images/AI-explainers/transformers/toyTransformer/toyTransformerProjectionFish.png)
<iframe src="https://docs.google.com/spreadsheets/d/e/2PACX-1vS2UmK-yTABofP2StdtZMQETYTbvAOJgONe4Ansujo3KYkv740NJuiFH9t3kZnTf2HmITU8V8mKUiui/pubhtml?widget=true&amp;headers=false" width="100%" height="600px"></iframe>


