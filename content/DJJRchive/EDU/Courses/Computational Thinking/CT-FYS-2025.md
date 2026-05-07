# EN.501.152 FYS Computational Reasoning

**Description | **  This seminar is a hands-on survey of the fundamental concepts of computer science, spanning everything from the art of “thinking slowly” to the cutting edge of machine learning and AI alignment. We’ll learn to design clear, step-by-step problem-solving strategies, represent them in flowcharts, and see how encoding information in binary enables circuits to perform logic and math. We'll learn how structuring information makes it possible to build data processing machines and we'll learn how those machines recognize patterns, follow instructions, seek goals, keep secrets, see, and learn. You’ll complete the seminar with a synoptic view of the conceptual terrain of computer science and a set of critical thinking skills that dovetail with those cultivated in the humanities and social sciences. Class sessions will focus on lively discussions, hands-on exercises, debates, and collaborative problem-solving during our meetings. No prior coding experience is required; although you’ll encounter some code, learning to program is not a primary goal of the course and is not part of the assessment.

Prerequisites: None

---

## Instructor

Dan Ryan  
Teaching Professor, Computer Science  
[danryan@jhu.edu](mailto:danryan@jhu.edu), [https://engineering.jhu.edu/faculty/dan-ryan](https://engineering.jhu.edu/faculty/dan-ryan), 

---
Textbook and Resources

* Filho W 2017 *Computer Science Distilled.* CodeEnergy. Available in [hard copy or digital from publisher](https://code.energy/computer-science-distilled/)  
* Maini, Vishal. 2017\. "[Machine Learning for Humans: Why Machine Learning Matters](https://medium.com/machine-learning-for-humans/why-machine-learning-matters-6164faf1df12)" Medium
* Other material assigned within course modules

---

## Course Objectives

Upon successful completion of this course, you should be able to:

* think slowly and modularly;  
* smoothly change levels of abstraction;  
* solve problems by stepwise refinement;  
* visualize algorithmic thinking in a well formed flowchart;  
* think critically about solving problems with repetition;  
* describe automation, visualize feedback systems with causal loop diagrams, explain how PID controllers work;  
* do simple cryptography, explain basics of RSA encryption, use public/private keys to effect message security;  
* do simple multilayer perceptron calculations by hand;  
* move back and forth between binary numbers, symbolic logic, and digital circuits  
* distinguish different kinds of machine learning  
* explain how large language models work at a basic level;  
* explain what AI alignment is, why it's important, and what's being done about it.

---
# ABET
This course will address the following ABET Outcomes:

* An ability to communicate effectively with a range of audiences.  
* An ability to function effectively on a team whose members together provide leadership, create a collaborative and inclusive environment, establish goals, plan tasks, and meet objectives.

---

<split even  >

08.26 | Welcome (teachable machine)<br>
08.28 | Thinking Slowly (robot training) <br>
09.02 | Flow, Abstraction, and Modularity <br>
09.04 | Stepwise Refinement<br> 
09.09 | Solving Problems with Repetition  <br>
09.11 | Strategic Repetition  <br>
09.16 | Accounting for Repetition <br>
09.18 | Counting by Two <br>
09.23 | Logic 1  <br>
09.25 | Logic 2 <br>
09.30 | How Do Machines Keep Secrets  <br>
10.02 | Sending Secrets in Public <br>
10.07 | How Does Block Chain Work?<br>
10.09 | SPARE CLASS 


10.14 | Dreams of No Humans: Automation<br> 
10.21 | Automation 2 <br>
10.23 | Automation 3 <br>
10.28 | How Do Machines See? <br>
10.30 |  Machine Vision 2 <br>
11.04 |  How Do Machines Learn <br>
11.06 |  Machine Learning <br>
11.11 |  Artificial Intelligence <br>
11.13 |  LLMs and Transformers <br>
11.18 |  How to Get Along with Machines<br>
11.20 |  Alignment 2 <br>
12.02 |  Project Showcase<br> 
12.04 |  Project Showcase
</split>

---
## General Course Philosophy

This course will focus more on learning and exploration than on assessment. We will "cover" a wide array of basic ideas in computer science with an aim to acquire the "big picture" and see "connections." Our approach to each topic will not be as rigorous or complete or skill-oriented as you will later encounter in computer science courses.  Instead, we will try to take the time to "really think about it" (as one former student put it), pursuing intuition and a synoptic view at the same time.

The work for the course is a single project in which you translate your understanding of core CS ideas into a graphic novel format; the idea being that we learn best when we communicate and teach a set of ideas to others.  While we will use feedback and grades to let you know how you are doing, but we hope that you can focus on learning and having fun with the material. In the end, the best way to get a good grade is to explore and engage with the material beyond what's explicitly required and to allow your creative pedagogical sensibilities to go wild.

---

## Course Approach

We take a partially flipped classroom approach to the course, with an emphasis on active learning during class sessions. Part of your homework will be to prepare for class with readings, viewings, answering comprehension questions, and sometimes doing problems. During class sessions you will extend your learning by working with instructor and classmates to discuss new concepts and apply them to in-class exercises, rather than listening to a series of lectures.

---

## Schedule

---

### 08.26 | Welcome (teachable machine)

Ice breaker. Welcome to the course. About instructor. About classmates. About course. Course materials. Assessment. Pitch and Catch. Robot activity Next time.

GOTO [Getting Started Module](https://jhu.instructure.com/courses/104034/modules/727178), [ABOUT Getting Started](https://jhu.instructure.com/courses/104034/pages/about-getting-started).

Reflection Questions: Explain "training" to grandmother. What did your model do?  What were the limits of your model? What is a model? What are weights?


---


### 08.28 | Thinking Slowly (robot training)

#### Reading

1. Filho W 2017 *Computer Science Distilled*. CodeEnergy. Preface pp ix-x.

Preclass: [Slow Things](https://youtu.be/QwdHbh2kHUY?si=zaF9msgxfhfDLpDV) on loop.Stepwise refinement taken seriously. 

In the first class we spend a few moments on introduction and overview. Then I preach about thinking slowly. We raise the question of learning how to do the Lindy Hop.  We see a slow motion video.  We ask what a splash looks like. We see some Edgerton photos. We then lay out the trajectory for the course \- it ends with artificial intelligence so we try some out as our first activity using Teachable Machine.

pseudocode (and comments\!) shows up in how we describe actions and in how we use the simulator. 

Plan a dinner with stubs, run a "dress rehearsal."

The second class will put slow thinking into practice as we try to give instructions to a robot to get it to sort playing cards. The readings for this class session are blog post about slow practice.

READING  
Brett Victor 2012 | Inventing on Principle \[55m\]

Brett Victor 2018 | Foreword to The Art of Doing Science and Engineering by Richard Hamming

Brett Victor 2013 | Media for Thinking the Unthinkable \[40m\]

Brett Victor 2014 | Seeing Spaces \[15m\]

Brett Victor 2013 | Stop Drawing Dead Fish \[55m\]

---

### 09.02 | Flow, Abstraction, and Modularity

#### Reading

1. ~~Filho W 2017 *Computer Science Distilled*. CodeEnergy. Chapter 1 "Basics" pp 1-5~~.  
2. [Ryan Flowcharts 101](https://docs.google.com/presentation/d/e/2PACX-1vTE9ssKe1x-_YjUXog5s-WK1i0bTKAC7i9n8lKxICgDIbonHq8Kq5nkNtKPYxO7F1G8R2XmEuaBnOoW/pub?start=false&loop=false&delayms=3000)  
3. Maria Popova [Illustrated Flowcharts to Find Answers to Life’s Big Questions](https://www.themarginalian.org/2011/09/09/stefan-bucher-344-questions/)  
4. Knuth on Abstraction  
5. "[Modularity](https://en.wikipedia.org/wiki/Modularity)" (Wikipedia Editors)   
6. Thwink.org "[Abstraction](https://www.thwink.org/sustain/glossary/Abstraction.htm)"  
7. Khan Academy [Abstractness](https://www.khanacademy.org/math/algebra-home/alg-intro-to-algebra/alg-overview-of-algebra/v/abstract-ness) \[7m\]  
8. "[Abstraction\!](https://youtu.be/tYHfGWz5FVc?feature=shared)" Fridman with Knuth (37s)

In class we draw flowcharts. Start with our robot and sorting cards

We will start with simple flowcharts of processes with sequences and decisions and using flowcharts to model classification processes. Then we move on to the representation of several distinct kinds of repetition. Then we will introduce the concepts of "black boxing," "stepwise refinement," and "deferring detail" as techniques for managing complexity. Finally, we will add time and space to flowcharts to show how they can be adapted for project management tasks.

Page: [Flow](https://jhu.instructure.com/courses/104034/pages/flow-2)

[Preclass Work FLOW](https://jhu.instructure.com/courses/104034/quizzes/264586)

Read: [Ryan on Flow Charts](https://docs.google.com/presentation/d/1p4BBqb0hk8yy_dyGzoEXkH3OKA0ougdGSs7F3-iT85g/edit?usp=sharing)

Watch

Do: Practice exercises

[Lecture: Hook=street view vs map.](https://jhu.instructure.com/courses/104034/pages/flow-lecture)

Activity: Review exercises

Discussion: What does single entry, single exit buy us? What do the concepts of mutual exclusivity and exhaustiveness buy us?

Assess & Revise 

CONCEPTS: flow charts, sequence, contingency, modularity as single entry/single exit, mutually exclusive and exhaustive


---


### 09.04 | Abstraction, Modularity and Stepwise Refinement

Bret Victor 2011 [Up and Downthe Ladder of Abstraction](https://worrydream.com/LadderOfAbstraction/)

#### Reading

9. x  
10. Wirth, Niklaus. 1971\. "[Program development by stepwise refinement.](https://web.archive.org/web/20060613063939/http://www1.acm.org:80/classics/dec95/)" Commun. ACM 14, 4 pp 221-227.

Hook: Lindy Hop with Lindy Beige. MiniLecture (what does idea of dancing do the brain?).  Stepwise refinement taken seriously. Plan a dinner with stubs, run a "dress rehearsal."


---


###  09.09 | Solving Problems with Repetition 

#### Reading

11. Filho *Computer Science Distilled* Sections 3.1 "Iteration," 3.2 "Recursion," and 3.3 "Brute Force,"  pp 35-42.  
12.  Meyers, Bob @FSU [Control Structures \- Repetition](https://www.cs.fsu.edu/~myers/c++/notes/control2.html)  
13. BioTech Whisperer 2025\. "[Mastering Iteration: The Key to Effective Problem Solving](https://youtu.be/cnh4pBBOfz8?feature=shared)" \[15m\]   
14. FuseSchool 2019\. [Solving Equations By Iteration](https://youtu.be/wPA6Vd5_D3U?feature=shared) \[4m\]   
15. Harvard Kennedy School. 2023\. "[Iteration is Research in Actio](https://youtu.be/4Y1K1xxzYW0?feature=shared)n"

ITERATION AND RECURSION and BRUTE FORCE

(creating patterns, stopping, counting) \[flow charts\]Loop; Nested loop; (FOR,WHILE,UNTIL \- bubble sort, merge sort)


---


### 09.11 | Strategic Repetition 

#### Reading

16. Filho *Computer Science Distilled* Sections 3.4 "Backtracking," 3.5 "Heuristics," and 3.6 "Divide and Conquer,"  pp 43-55.  
17. Wikipedia Editors. "[Divide and conquer"](https://en.wikipedia.org/wiki/Divide_and_conquer)  
18. WilliamFiset. 2023\. "[Divide and Conquer: The Art of Breaking Down Problems](https://youtu.be/ib4BHvr5-Ao?feature=shared)"

Recursion; Backtracking, Heuristics, Branch and bound, divide and conquer, dynamic programming

##### 


---


### 09.16 | Accounting for Repetition

#### Reading

19. Filho *Computer Science Distilled*  Chapter 2 "Complexity" pp 25-32  
20. [1](https://docs.google.com/presentation/d/e/2PACX-1vTE9ssKe1x-_YjUXog5s-WK1i0bTKAC7i9n8lKxICgDIbonHq8Kq5nkNtKPYxO7F1G8R2XmEuaBnOoW/pub?start=false&loop=false&delayms=3000)

(power set flow chart task growth) BigO

(DSAI AI in Daily Life Symposium)


---


### 09.18 | Counting by Two

#### Reading

21. Leibniz  
22. Filho *Computer Science Distilled*  "Nested Loops and the Power Set" pp37-38  
23. 

[Numbers and Logic READER (Leibniz, Boole, Shannon, Filho)](https://jhu.instructure.com/courses/104034/pages/numbers-and-logic-reader-leibniz-boole-shannon-filho)

Should this get moved up to first repetition class?

Read Leibniz essay. Discussion about his realization that everything could be represented by only presence and absence. Leibniz saw this as a metaphysical insight — that being could be built up from nothing and something.

[Powerset Exercise](https://jhu.instructure.com/courses/104034/pages/exercise-power-set-and-binary).  (leads into LOGIC and truth tables

DEMO: using flowchart for DEC2BIN; x


---


###  09.23 | Logic 1 

#### Reading

24. Filho *Computer Science Distilled*  "section 1.2 "Logic" pp 5-12.  
25. [Ryan Flowcharts 101](https://docs.google.com/presentation/d/e/2PACX-1vTE9ssKe1x-_YjUXog5s-WK1i0bTKAC7i9n8lKxICgDIbonHq8Kq5nkNtKPYxO7F1G8R2XmEuaBnOoW/pub?start=false&loop=false&delayms=3000)

(build half-adder)


---


### 09.25 | Logic 2

#### Reading

26. Filho *Computer Science Distilled*  section 1.2 "Logic" pp 12-13.  
27. 


---


### 09.30 | How Do Machines Keep Secrets 

#### Reading

28. ~~Filho W 2017 *Computer Science Distilled*. CodeEnergy. Preface pp ix-x.~~  
29. [Ryan Flowcharts 101](https://docs.google.com/presentation/d/e/2PACX-1vTE9ssKe1x-_YjUXog5s-WK1i0bTKAC7i9n8lKxICgDIbonHq8Kq5nkNtKPYxO7F1G8R2XmEuaBnOoW/pub?start=false&loop=false&delayms=3000)

Cryptography, symmetric, asymmetric, why is blockchain secure?


---


### 10.02 | Sending Secrets in Public

#### Reading

30. Woo, E. 2014\. "[The RSA Encryption Algorithm](https://youtu.be/4zahvcJ9glg)" (1 of 2\)

31. Woo, E. 2014\. "[The RSA Encryption Algorithm](https://youtu.be/oOcTVTpUsPQ)" (2 of 2\)


---


### 10.07 | How Does Block Chain Work?

#### Reading

32. Anders.com. [Blockchain demo](https://anders.com/blockchain/blockchain.html)  
33. [Anders Brownworth. 2016\. Blockchain 101 \- A Visual Demo (17:49)](https://youtu.be/_160oMzblY8)  
34. Nakamoto, Satoshi. "[Bitcoin: A Peer-to-Peer Electronic Cash System](https://bitcoin.org/bitcoin.pdf)"  
35. Goldstein, J. and D. Kestenbaum. 2010\. "[The Island Of Stone Money.](https://www.npr.org/sections/money/2011/02/15/131934618/the-island-of-stone-money)" NPR, Planet Money (4:24  
36.  Anders Brownworth. 2017\. "[Blockchain Demo: Public / Private Keys & Signing](https://youtu.be/xIDL_akeras)"  
37. 

See Also

1. HardFork. "[5 of the most ridiculous blockchain use cases, according to blockchain experts](https://thenextweb.com/hardfork/2018/05/24/blockchain-use-cases/)  
   2. [Links to an external site.](https://thenextweb.com/hardfork/2018/05/24/blockchain-use-cases/)  
   3. "  
   4. Ecocoin. [Website](https://www.ecocoin.com/)  
   5. [Links to an external site.](https://www.ecocoin.com/)  
   6. .  
   7. Di MartinThoma \- Opera propria, CC BY 3.0,   
38. 


---


### 10.09 | SPARE CLASS

#### Reading

39. TBA


---


###  10.14 | Dreams of Machines without Humans: Automation

#### Reading

40. The Met "[Making Marvels—The Draughtsman-Writer](https://youtu.be/7ZiH7oF3OMM?feature=shared)"   
41. Engineerguy, 2015\. "[How a Wind Up Music Box Works](https://youtu.be/COty6_oDEkk?feature=shared)"  
    1. for an added treat, watch Bill's "[The Ingenious Design of the Aluminum Beverage Can](https://youtu.be/hUhisi2FBuw?feature=shared)"  
42. Britannica, "[Automation](https://www.britannica.com/technology/automation)" sections: Historical development of automation (Early developments, Modern developments)

humans, governance, automation, 2\) automation as rules (hands on cam exercise?), as goals

The age old dream of designing humans out of machines. Note how this continues the "trustless" fantasies of crypto.x


---


###  10.21 | Automation 2

#### Reading

43. saVRee. 2018\. "[How Centrifugal Governors Work](https://youtu.be/ASIl3HWTT4U?feature=shared)" \[8m\]  
44. Douglas, Brian. 2012\. "[Understanding P*\[roportional\]*I*\[ntegral\]*D*\[erivative\]* Control, Part 1: What is PID Control?](https://youtu.be/wkfEZmsQqiA)" (11:41)  
45. Woodford, Chris. 2019\. "[Thermostats.](https://www.explainthatstuff.com/thermostats.html)" (10 min read)  
46. Douglas, Brian. 2015\. "[PID Control \- A brief introduction](https://youtu.be/UR0hOmjaHp0)" (7:43) or 2018 "[Understanding PID Control, Part 1: What is PID Control?](https://youtu.be/wkfEZmsQqiA)" (11:41)  
47. Wikipedia, "[PID controller](https://en.wikipedia.org/wiki/PID_controller)"  
48. General Electric. 1955\. "[Automated Manufacturing: 'This Is Automation'](https://youtu.be/kxzdHSDH24g)"  
49. Brain, Marshall & Jessika Toothman. "[How Coffee Makers Work](https://home.howstuffworks.com/coffee-maker.htm)" on HowStuffWorks.com  
50. [Coffee maker diagrams](https://www.google.ca/search?q=how+a+coffee+maker+works+diagram)  
51. Woodford, Chris. 2018\. "[Thermostats](https://www.explainthatstuff.com/thermostats.html)" on ExplainThatStuff.com  
52. Allen, Robert C. 2017\. "[Lessons from history for the future of work](http://www.nature.com.myaccess.library.utoronto.ca/news/lessons-from-history-for-the-future-of-work-1.22825)," Nature, 18 October 2017 ([10.1038/550321a](http://dx.doi.org/10.1038/550321a))  
53. Autor, David. 2015\. "[Why Are There Still So Many Jobs? The History and Future of Workplace Automation](http://search.ebscohost.com.myaccess.library.utoronto.ca/login.aspx?direct=true&db=bah&AN=108621571&site=eli-live&scope=site)" Journal of Economic Perspectives. Vol. 29 Issue 3, p3-30. 28pp  
54. Wikipedia. "[Automation](https://en.wikipedia.org/wiki/Automation)"


---


### 10.23 | Automation 3

#### Reading

55. Aerospace Controls Laboratory @MIT. 2015\. "[Controlling Self Driving Cars](https://youtu.be/4Y7zG48uHRo?feature=shared)" \[5m\]

56. Douglas, Brian. 2012\. "[PID Control \- A brief introduction](https://youtu.be/UR0hOmjaHp0?feature=shared)" \[8m\]

57. Ames, Scott. 2013\. "[PID Math Demystified](https://youtu.be/JEpWlTl95Tw?feature=shared)" \[15m\]

58. EEVBlog. 2332\. "[EEVacademy \#6 \- PID Controllers Explained](https://youtu.be/VVOi2dbtxC0?feature=shared)" \[27m\]

feedback, 4\) PID Feedback PID

Automation by Following Instructions

* Preclass Work I  
  * Conversation with AI about works of art that engage with question of automation  
    * Phil Ochs "[Automation Song](https://youtu.be/WbSTnuXv_3Y?feature=shared)  
    * ", Charlie Chaplin "[Modern Times](https://youtu.be/KUbvdZOMXMI?feature=shared)"  
  * Readings  
    * [Norbert Wiener Obituary](https://jhu.instructure.com/courses/104034/pages/auto-wiener-obituary)  
  * Watchings  
    * Automation by Following Instructions  
    * Transition to Goal Seeking  
    * " video \- it's been called "*the greatest video on YouTube."*  
    * Automation by Pursuing a Goal  
    * Feedback  
    * Causal Loop Diagrams

Automation by Pursuing a Goal

* Preclass Work II  
  * Feedback  
    *   
  * Control  
    * PID Control  
  * Build something with a cam  
  * Build something with feedback  
  * PID controller intensive

10.28 | How Do Machines See?

#### Reading

59. TBA

Vision \- return to teachable machine?  Neurons, layers, activation functions,


---


### 10.30 |  Machine Vision 2

#### Reading

60. Sharma, Sagar. 2017\. "[What the Hell is Perceptron?: The Fundamentals of Neural Networks](https://towardsdatascience.com/what-the-hell-is-perceptron-626217814f53)  
61. " on *Towards Data Science@Medium* (3 min read)  
62. \[optional\] Lagandula,  Akshay. 2018\. "[Perceptron Learning Algorithm: A Graphical Explanation Of Why It Works.](https://towardsdatascience.com/perceptron-learning-algorithm-d5db0deab975)" on *Towards Data Science@Medium* (8 min read)  
63. \[optional\] Vasilev, Ivan.  n.d. "[A Deep Learning Tutorial: From Perceptrons to Deep Networks](https://www.toptal.com/machine-learning/an-introduction-to-deep-learning-from-perceptrons-to-deep-networks)" (21 min read)  
64. SimpleLearn.com. "[Perceptron Tutorial](https://www.simplilearn.com/what-is-perceptron-tutorial)"  
65. Wikipedia. "[Perceptron](https://en.wikipedia.org/wiki/Perceptron)"  
66. "[But What is a Neural Network?](https://youtu.be/aircAruvnKk)" (20 minutues)  
67. [The Coding Train. 2017\. "Neural Networks: Perceptron Part 1" (44:39)](https://youtu.be/ntKn5TPHHAk)  
68. [Klein, Dan. 2014\. "Lecture 21: Machine Learning \- Perceptrons." UC Berkeley. (more advanced) (1:14:18)](https://youtu.be/dXuNAkHsos4)


---


### 11.04 |  How Do Machines Learn


---


### 11.06 |  Machine Learning

#### Reading

69. TBA


---


### 11.11 |  Artificial Intelligence

#### Reading

70. Maini, Vishal. 2017\. "[Machine Learning for Humans: Why Machine Learning Matters](https://medium.com/machine-learning-for-humans/why-machine-learning-matters-6164faf1df12)" Medium (10 min read)  
    1. *See also:*   
       1. [*Supervised Learning*](https://medium.com/@v_maini/supervised-learning-740383a2feab) *(13 min read),*   
       2. [*Supervised Learning II*](https://medium.com/@v_maini/supervised-learning-2-5c1c23f3560d) *(10 min read),*   
       3. [*Supervised Learning III*](https://medium.com/@v_maini/supervised-learning-3-b1551b9c4930) *(11 min read),*   
       4. [*Unsupervised Learning*](https://medium.com/@v_maini/unsupervised-learning-f45587588294) *(10 min read), [Neural Networks & Deep Learning](https://medium.com/@v_maini/neural-networks-deep-learning-cdad8aeae49b) (11 min read),*   
       5. [*Reinforcement Learning*](https://medium.com/@v_maini/reinforcement-learning-6eacf258b265) *(12 min read)*  
71. OpenAI. 2015\. [Introducing OpenAI](https://openai.com/index/introducing-openai/)


---


### 11.13 |  Large Language Models and Transformers

#### Reading

72. 3 Blue 1 Brown 2024 | [Large Language Models Explained Briefly](https://youtu.be/LPZh9BOjkQs?feature=shared) \[8m\]


---


### 11.18 |  How Machines Get Along with Humans

#### Reading

73. Stop Autonomous Weapons. 2017\. [Slaughterbots](https://youtu.be/9CO6M2HsoIA). (7:47)


---


### 11.20 |  Alignment 2

#### Reading

74. TBA


---


### 12.02 |  Project Showcase


---


### 12.04 |  Project Showcase