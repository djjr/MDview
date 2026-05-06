This is a draft for section 1 of an orientation session on AI. The learning goal here is to provide a common conceptual vocabulary and baseline level of "how and why it works" understanding of the AI tools students will encounter in their academic work.

1. Artificial Intelligence is just a function that maps inputs to outputs.
	1. $f(x) = y$
	2. The inputs can be multiple: $f(x,y,z) = (a,b,c)$
2. How many jelly beans in this jar?  Jot down a guess. Now ask your two neighbors, Janet and Kai, what their guesses were and reformulate your guess as some combination of the three. Maybe you average? Maybe you take a weighted average. Maybe you just think Janet looks smarter and so you take her guess. How you take into account the guesses of your two neighbors is your function: 

$$
\text{output} = W_{\text{Janet}} \times \text{Janet} + W_{\text{You}}\times  \text{You} + W_{\text{Kai}} \times \text{Kai}
$$ 

Maybe you ignore them and just trust your gut: 

$$
\text{output} = 0 \times \text{Janet} + 1 \times \text{you} + 0 \times \text{Kai} 
$$ 

Or maybe you are totally persuaded by Janet: Maybe you ignore them and just trust your gut: 

$$
\text{output} = 1 \times \text{Janet} + 0 \times \text{you} + 0 \times \text{Kai} 
$$

![THIS IS A CAPTION](https://innoeduvation.org/images/AI-explainers/wisdom-of-crowds01.svg)
3. Let's imagine we do this 25 times with the same weights and you keep track of the cumulative error.  And then you assess: "how much of the error seems to be Janet's fault? Your own? Kai's?" And so you make some adjustment to your "advice-taking" dials. 
4. An LLM is a black box with lots of dials. We show it some input. Compare its output to what we expect and then it adjusts the dials in direction that improves its predictions.  Eventually, we can get a pretty good black box prediction machine. ![](https://innoeduvation.org/images/AI-explainers/wisdom-of-crowds02.svg)
5. What if, instead of jelly beans we have chunks of language from the internet. Lots and lots of chunks that look like this:    ```
   The solar system consists of the Sun and the objects that orbit it. These include eight planets, their moons, and smaller bodies like asteroids and comets. Gravity is the primary force that keeps these objects in their respective orbits.``` \[we'll have slides with clicker results]
6. Set the dials. Try to predict ```the``` and assess the result. Given ```the``` see if you predict ```solar```. Given ```the solar``` see if it predicts ```system```. And so on, all the way up to trying to predict ```orbits``` given all the text from ```the``` to ```respective```.
7. Let's try it. This time we use clickers to have the room predict the next word as we reveal The Great Barrier Reef is the world's largest coral reef system composed of over 2,900 individual reefs and 900 islands stretching for over an area of approximately 344,400 square kilometres.
8. We do that billions of times using all the text on the internet. We get a pretty good black box for predicting next words.
9. Now we hook that box up so it can talk to itself:
![](https://innoeduvation.org/images/AI-explainers/text-completion-machine.svg)
   ```
   ```
  ![](https://innoeduvation.org/images/AI-explainers/chat-machine.svg)
 ![](https://innoeduvation.org/images/AI-explainers/model+distribution+temperature.svg)
   What does a language model model?
   What does "model" mean? For our purposes, a model is something that allows you to make a prediction. 
   IMAGE: Looks like rain.
   A model of system X says if you observe A you can expect (predict) B.
   What should you feel comfortable knowing what's behind the word or phrase by the time we finish?
   Model. Parameter. Training data. Loss. Inference. Fine tuning. 