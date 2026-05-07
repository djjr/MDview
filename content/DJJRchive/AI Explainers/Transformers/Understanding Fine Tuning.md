#### How Does a ChatBot Work?
![](https://innoeduvation.org/images/AI-explainers/RLHF/transformer004.svg)
#### Pretraining
##### Read the Whole Internet
What does it mean when someone says "These models are just trained on the whole internet!"?

Someone creates a dataset that has a whole bunch of examples of text from the internet. Web pages, public posts, you name it.

Then someone builds a blackbox that takes in text (such as a passage found on the internet) and outputs a single word. For now, we can just imagine that inside the black box, something happens to the input words and that results in an output word.

We then take one of those pieces of text from the internet - let's imagine it is "I have read and agree to the terms and conditions." We run this text through the black box and see what it produces after "I" and then what it produces after "I have" and "I have read" and all the way up to "I have read and agree to the terms and conditions" (does it predict a period?).
![](https://innoeduvation.org/images/AI-explainers/RLHF/predict_next_word_internet_text.svg)
Then we come up with some measure of how right or wrong we were overall (e.g., of all the words we tried to predict, what percent did we get right?) and we use this as a "signal" to tweak the numbers inside the black box in a direction that should make the next attempt at next word prediction better. After a (long) while it DOES get better at predicting the next word.
##### Word Prediction to Text Generation
If you have a black box that can take text in and predict a next word, a "next word predictor," what can you do with it? One clever thing is to tack that word onto the end of the original input and then put it through again. And just keep on doing this, each time feeding a text that's one word longer into the black box until the new word is <STOP!>.  That's how you build a text completion machine.

As you might guess, such machines tend to lose the thread and so the longer the response is, the more likely it has stopped making sense at some point.  Still, it's a very cool tool.  Schematically, it looks like this:
![](https://innoeduvation.org/images/AI-explainers/RLHF/next_word_plus_auto_regression.svg)
##### Let's unpack that a bit
Let's talk about that black box. As you might suspect, while we deal with words on the outside, on the inside there are numbers and math. To make this work we need to "encode" the input words as numbers and "decode" numbers into a word for the output.

The coding system we use for words is called "embedding." It involves representing each word by a series of numbers. We can think of each number representing a dimension of meaning. "Cat," for example, might be represented by 10,1,5 where the dimensions are "cuteness," "vegetable-animalness," and "fuzziness." In math we call a set of numbers like this a "vector."

In practice, though, two things: the number of dimensions is more like hundreds or thousands; the dimensions are usually not so humanly meaningful as that.  In our toy illustrations here we'll assume a very small number of embedding dimensions to keep things simple.

So, we can re-envision how the model works like this:
![](https://innoeduvation.org/images/AI-explainers/RLHF/vectors_in_vector_out.svg)
We are telling some small lies here to keep things simple. We will clear these up as we move along.
##### Inside the Black Box I
This is a big question. We'll give a very small answer right now.

First, let's correct something basic. We have been talking about words, but language models actually work in terms of tokens. A token is a unit of meaning. If we read the word "conditions" we might represent it as two tokens: \<condition> and \<plural>.  The tool that converts text into tokens is called a "tokenizer."  From now on we will talk in terms of tokens instead of words.

Each token is represented by a vector such as $$I \quad\rightarrow \quad\begin{matrix}1\\7\\ 9\end{matrix} $$
and we can think of the token as a point in a, in this case, three dimensional space. A token is a unit of meaning, a point in 3D space, an arrow.
![](https://innoeduvation.org/images/AI-explainers/RLHF/3D-vector-rep-token-I.svg)
This means that the whole prompt is a set of points or a set of arrows.
##### Inside the Black Box II
When we hear a sentence like "I have read and agree to the terms and conditions." we build up the meaning word by word. I hear and recognize the word I, it refers to me the speaker. OK and then "have" and so maybe I refine how I am hearing "I" - perhaps slightly in the direction of a person with possession of something.  And then "read" comes in and I have to adjust how I heard "have" - it's probably an auxilliary verb - and "I" now tweaked in the direction of an agent who did something in the past.

Each of those tweaks moves the "I" token's arrow just a little bit. With each token we process we go back and transform the arrows for each of the preceding tokens.

Mathematically, the way we transform a vector is to multiply it by a matrix like this: $$\begin{bmatrix} 1.001&0.002&-0.001\\0&1&0.001\\0.002&-0.003&1.002\end{bmatrix} \times \begin{bmatrix} 1\\7\\9\end{bmatrix} = \begin{bmatrix} 1.006\\7.009\\8.999\end{bmatrix}$$
In effect, matrix multiplication like this twists and stretches the vector. The location of the token in "meaning space" changes slightly.
![](https://innoeduvation.org/images/AI-explainers/RLHF/3D-vector-rep-token-delta.svg)
The black box of the model contains a lot of matrices that move each input vectors around in response to the context provided by all the other input vectors.

If the values in the matrices are just right, then the input vectors are moved around in a way that manages to predict the next token.

##### Inside the Black Box III


#### Pretraining
Pretraining maps an internet corpus to transformer weights via next word prediction.  Sequences of internet text are the input. The model tries to predict each word in the sequence based on the previous text in the sequence.
![](https://innoeduvation.org/images/AI-explainers/RLHF/transformer003.svg)

Next word predictions are probability distributions. We compute the "loss" by comparing that distribution to the actually expected next word. Loss is a measure of how little probability the model assigned to the correct word (high when the model was confident and wrong, low when it was confident and right). During training we compute how the loss depends on changes in each of the weights in the model and nudge the weights in a direction that reduces loss.

At the end of pretraining we have a text completion model that can be prompted with text and produce response text that would be likely to appear on the internet. This model has no concept of instructions or helpfulness, it just continues text, doesn't answer questions or follow directions. That's what fine-tuning is for.
#### Supervised Fine Tuning
The pretrained model can write sentences and paragraphs that make sense. But we want more.

We can create a new dataset that consists of pairs of prompts and responses:
\[PROMPT: "Summarize this article..."] \[RESPONSE: "The article argues that..."]
For each token in the response we compute the loss. The last output of the residual stream is a vector in embedding space, $h_t$.  To come up with the prediction we ask "what token does this most look like?"  To answer this we multiply $h_t$ by the "unembedding matrix" $W_u$.  Each component of the resulting vector refers to one token in the vocabulary.  To turn this into a "prediction" (a probability) we take the softmax of $W_u \cdot h_t$. Then we have a vector of probabilities:
$$P[i] = \frac{e^{z_i}}  {Σ_j e^{z_j}}$$
We define the loss in terms of "cross-entropy" which is a way of comparing two probability distributions. In this case, we are comparing $P$ as just described with a one-hot vector - the actual correct next token which has value 1 at position $c$ and is zero everywhere else. This turns out to yield:$$L = -\log P[c].$$
Substituting we get $$L = -log\frac{e^{z_c}}{Σ_j e^{z_j}} 
  = -z_c + log Σ_j e^{z_j} .$$
  For the correct token when we take $\partial L/ \partial z_c$ we get $$-1 + \frac {e^{z_c}}{\sum_j e^{z_j}} = P[c] -1$$
  where we remember $d(\sum e^{z_j})=d(e^{z_1} + \dots e^{z_c} + \dots )$ and $d(e^x) = e^x$.  On the other hand, for all other tokens, $i \neq c$ we have $$\frac{\partial L} {\partial z_i} = 0 + \frac {e^{z_i}}{\sum_j e^{z_j}} = P[i].$$
  These can be expressed together as $$ \frac {\partial L} {\partial Z} = P - y_{\text{onehot}}.$$
P is just a vector of probabilities and $y_{\text{onehot}}$ is a vector with 1 in the correct token position and 0 elsewhere.  And remember we are using the negative gradient. So if $P[c]$ is large (our prediction was correct) then the loss signal says "increase the logit behind this a tiny bit if at all."  If $P[c]$ is not large then we recommend a stronger increase. For wrong tokens small $P[i]$ says we already suppress this output so not much to do, while large $P[i]$ says "back off! decrease this logit."

What we just described is repeated for each token in the response. All these are summed up. The gradient at the logits — computed via $W_U$ — is the entry point for back propagation, which uses the chain rule to propagate credit and blame backwards through every weight in the model.

So the SFT step slightly tweaks the model weights to develop a propensity to produce the kind of responses a helpful assistant would give, rather than simply continuing text in whatever direction the internet would go.
#### The Next Step
Our model can now engage like an assistant but it is not yet a very useful assistant. How do we change that?

The answer is we are going to slightly massage all the weights in the model again.  This time the model will be learning a propensity to produce responses humans prefer as over against responses humans don't like.

##### Bringing Human Judgment into the Mix
We are going to need to import human judgment. Our first intuition might be to rate responses and teach the model to optimize for high scores, but humans are not good at rating; humans are good at choosing.

So, we get the model to generate multiple responses to a given prompt and then present pairs of them to humans and ask which one they prefer. This produces a dataset that looks like this:

`(prompt, response_A, response_B, human_preferred_A)`

If we collect a lot of data like this we have some "ground truth" about how likely a human is to prefer A or B as a response to this prompt. Can we get our model to learn these preferences?

##### Modifying the Model to Work with Human Preference Data
To work with this we fiddle a bit with our model. Previously we had a multilayer transformer with an unembedding matrix, $W_U,$ and softmax layer at the end. $W_U$ projected the $1 \times d_{\text{model}}$ sized $h_t$ into token space. Then softmax converts the values into probabilities.  

We are going to remove $W_U$ and softmax and replace them with a $d_\text{model}-$sized vector $w.$ When we multiply $h_t$ by $w$ we get a single number. So here's what we are working with:

`[fine-tuned transformer backbone]  +  [one d_model vector w]`

If we run prompt+responseA through this new system we generate a single number $r_A$. And similarly we can generate $r_B$.  We would like to convert this to something we can compare to our ground truth which was the probability a human prefers A over B.

It turns out that the sigmoid function ($\sigma(x) = \frac{1}{1 + e^{-x}}$) works nicely in this context: $$P[\text{prefer A over B}] = \sigma(r_A - r_B) = \frac {1}{(1 + e^{-(r_A - r_B)})}.$$
Multiply numerator and denominator by $e^{r_A}$ and you get $$P(prefer A) = \frac {e^{r_A}}{(e^{r_A} + e^{r_B})}$$
which is exactly softmax over two items! The significance of that is that we already know how to create and differentiate a loss function based on softmax: $$L = - \log \sigma (r_{\text{winner}} - r_{\text{loser}}).$$
And this is just like the loss we saw in the SFT step except it is binary classification instead of 50k-way classification.
![442](https://innoeduvation.org/images/AI-explainers/RLHF/sft_vs_reward_model_architecture.svg)

#### Where Are We?
At this point we have two models. One is the SFT model. The other is the reward model. The first one produces responses - it has been trained to act like an assistant. The second one can score prompt-response sequences in terms of human preferences. It doesn't generate new text; it reads responses and scores them.

The production of a response requires a long sequence of "decisions" by the model. When a response yields a high score the model has no way to know which of those decisions were most significant. At each step, how is the model to "think" about what a "better" next decision is?

A naive approach would be to say any decision that is part of a sequence that yields a good result gets amplified, and any decision in a low-scoring sequence gets suppressed — regardless of each token's actual contribution. But this provides a crude feedback signal.

A better approach might be to be able to ask, "did my decision at each token position make the average future I could expect from the next position better or worse than the future I could expect from where I was?" This comparison step is crucial: we are asking what is the advantage yielded by choosing a particular next token? $$A_t = (\text{expected future reward from state } s_{t+1} - \text{expected future reward from state } s_{t}).$$
So, what the model needs, then, is a way to estimate the expected future reward from any given position in a response, a function that can look at a half-finished sequence of tokens and ask "how good is my situation right now?"

#### The Value Function

The model can be thought of as an RL agent here. An RL agent finds itself in a state, has a repertoire of actions it can take each of which will lead to a specific state, and it has a "policy" which specifies how it chooses an action in each state.

We proceed similar to how we did before: add a "linear readout head," $v,$ to the top of the model backbone: $$h_t \rightarrow v \cdot h_t \rightarrow V(s_t) \in \mathbb{R}.$$
Remember that we have fed into the model $[\text{prompt tokens} | \text{response tokens}]$ and at the end of the model we have a residual stream matrix with an $h_t$ vector for each token position. Each vector represents the entire model having had its way with each input token. Each one represents the model having gathered all the information it can from all the preceding tokens.

What we are doing at the value function stage is retrospectively evaluating each decision the model made during generation. The response was already produced (by this model) and we are now asking, at each position where a token was chosen, how promising was the model's situation at that point? Specifically: given everything the model had written so far, what reward could it expect on average by continuing from here?
#### Three "Modes"
Our modifications yield three different modes of our model. The first is the SFT model that autoregressively, token-by-token, takes in a prompt and produces a response.  In reinforcement learning terms, it is an **actor** that draws on a policy to take a series of actions (token choices).

The **reward** model reads completed responses and scores them with a single scalar value - this is the reward the actor earns upon completing a task.

The value function is a **critic** that retrospectively evaluates each decision and assigns a value that captures the expected reward given what's been generated up to that point.
#### How Do We Train the Value Function?
This time there is no ground truth that we are trying to predict; the states don't have labeled true values.

We have two things to work with. First, we do know the reward at the end of different sequences of decisions. Second, we have the logic of how we are thinking about rewards and values. The value of a state is the average expected reward over all the futures that start from that state. But rewards can occur now as well as in the future. Thus, the value-where-I-am is equal to the sum of whatever-I-get-here plus the average expected reward from the next state forward: $$V(s_t​)\approx r_t​+V(s_{t+1}​).$$
Remember we are working with the transformer backbone with $W_U$ and alongside that a value vector $v$ and we have $h_t$ vectors for every token position.  This means that a single pass of the value function model will produce a $V(s_t)$ for each token position.

We will train the critic by minimizing the inconsistency between the computed $V(s_t)$ values and their Bellman targets ($r_t + V(s_{t+1})$). There are no external labels; the value function teaches itself by being forced to be consistent.

The "advantage" of a token choice is the difference between what our reward situation looked like before the choice and what it looks like after the choice: $$A_t = V(s_{t+1}) - V(s_t) + r_t.$$
Note that both the transformer backbone, $W_U$, and the $v$ vector - are being updated at the same time; all the weights — in the shared backbone and in both readout heads. The actor and critic will converge together — a better critic gives the actor more accurate credit signals, and a better actor gives the critic more consistent value targets to learn from. They will improve each other.

Where are we now? We now have the architecture in place — a shared backbone with W_U for the actor and v for the critic. But v hasn't been trained yet. Learning v, computing advantages, and updating the actor all happen together inside the PPO training loop.
#### Proximal Policy Optimization (PPO)

What do we do with all of this?

The actor processes the prompt and at each position produces logits via $W_U$ · $h_t,$ which softmax converts to a probability distribution over the vocabulary. One token is sampled from that distribution — that's how the response gets built up token by token. That's the agent selecting one action after another.  

For each token we record its probability as an expression of our "policy" (what we do in each state - what next token follows prompt and response up to this piont): $$\pi_{\theta}(a_t|s_t) = softmax(W_U \cdot h_t) [a_t].$$
We read this as "the policy based on all the weights of the model ($\theta$) gives the probability of selecting token $a_t$ given the prompt and all the tokens generated so far ($s_t$) is equal to the probability assigned by the softmax to the sample token at position t."

If we want to optimize the policy we need to define a loss function.  

Now let's remember basic ideas about a loss function. We want a mathematical expression that captures two things: how much did this token choice help or hurt our expected reward (the advantage), and how much should we adjust our commitment to that choice (the log probability). If a choice strongly improved expected reward we want to increase its probability. If it hurt expected reward we want to decrease it. We weight the adjustment by how large the advantage was.We can achieve this by multiplying the negative log probability of the choice times the advantage conferred by the choice:$$L = -A_t \cdot \log \pi_{\theta}(a_t|s_t).$$
Based on this equation, if a token choice has positive advantage then minimizing L would involve tweaking $\theta$ so as to increase $P(a_t|s_t)$ and vice versa if the advantage is negative.

In practice this can make the policy adjustment too jumpy. We need something to calm it down.

Suppose we look at the ratio of the probability this token got this time with the probability it got last time? If $\text{ratio} \gt 1$ then we have been leaning into choosing this token. If $\text{ratio} \lt 1$ then we have been backing off from choosing this token. What we want is for the result to be neither backing off nor leaning in too much at once. So, if the ratio is: $$\rho_t = \frac{\pi_\theta(a_t|s_t)}{\pi_{\theta_\text{old}}(a_t|s_t)}$$
and we want to keep the L signal "clipped" within bounds we can write it as: $$L^{\text{CLIP}} = - min(\rho_t \cdot A_t, clip(\rho_t,1-\epsilon,1+\epsilon) \cdot A_t)$$
The min says "for $A_t \gt 0,$ clip if $\rho_t \gt 1+\epsilon$ (policy already accelerated) and for $A_t \lt 0$, clip if $\rho \lt 1- \epsilon$ (policy already decelerated)."
![](https://innoeduvation.org/images/AI-explainers/RLHF/LCLIPvsRHO_t.png)
![](https://innoeduvation.org/images/AI-explainers/RLHF/A_t-vs-rho_t.png)
At this point it is conventional to switch from talking about minimizing the loss to maximizing the objective.  

What shall we optimize?  We start with the actor update based on reward ($L^\text{CLIP}$ above).  

We also want to minimize the degree to which we don't respect the Bellman equation (that says expected reward from current state should equal to whatever we get here  plus the expected reward from next state). Here we are just concerned with reducing the inequality so we can define $$L^\text{critic} = (V(s_t) - (r_t + V(s_{t+1})))^2$$
which also happens to be $A_t^2$.

A third element is added: KL divergence (named after Kullback and Leibler (1951) also known as relative entropy in information theory) measures how different two probability distributions are. In this case the distributions are the current $\pi_\theta$ at each step of PPO iteration and $\pi_\text{SFT},$ the frozen SFT model. This gives us a tug back to reduce drift from the original trained model.

The loss term is written as $$L^{KL} = \beta \cdot KL (\pi_\theta||\pi_{SFT})$$
where $$KL (\pi_\theta||\pi_{SFT}) = \sum_a \pi_\theta(a|s_t) \cdot \log \frac{\pi_\theta(a|s_t)}{\pi_{SFT}(a|s_t)}$$
and $\beta$ is a hyperparameter describing "how tight the leash is."

Together we have $$ L=L^{CLIP}−c_1​⋅L^{critic}−c_2​⋅\beta⋅KL(\pi_\theta​∣∣\pi_{SFT}​).$$
This produces a single scalar value that characterizes what the frozen base model, the previous version of the RLHF'd model, the current version of the RLHF'd model, and the reward model (via r in $L^{critic}$) do to the same (prompt+response) sequence. Four contributions:
- $π_{SFT}$ — frozen, KL reference
- $\pi_{\theta_{old}}$ — previous rollout, ρ_t denominator
- $π_θ$ — current policy, being updated
- Reward model — produces r, feeds into $L^{critic}$ via the Bellman target

Backprop then distributes gradients from that scalar back through all the weights — backbone, $W_U$, and $v$ simultaneously.

The frozen SFT model and reward model contribute to the scalar but receive no gradients — they're just reference points. Only $π_θ$'s weights actually get updated.

Note that "reward model" as just used refers to the reward model's own backbone weights that are frozen by the time we get to PPO.

### Summing Up
This loop ... to be continued.