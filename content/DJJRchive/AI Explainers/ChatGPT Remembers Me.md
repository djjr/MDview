---
cssclasses:
  - human_robot_chat

tags:
  - domain/alignment
  - domain/ai
  - domain/social-theory
  - type/concept
  - status/evergreen---

In a conversation with ChatGPT yesterday, it wrote
<div class="dialog-container"> 
<div class="message assistant"> 
<div class="icon">C</div> 
<div class="content"> 
<div class="speaker">ChatGPT</div> 
<div class="text">
<p>Would you like help setting up an outline for a specific course you're working on, like _Human Intelligence Alignment_? Or something else?"
</p></div></div></div></div>
Thing was, we had not been talking about course development in this conversation so I asked
<div class="dialog-container"><div class="message human"><div class="icon">D</div><div class="content"><div class="speaker">DJR</div><div class="text"><p>How did you know about that?</p></div></div></div><div class="message assistant">
<div class="icon">C</div><div class="content"><div class="speaker">ChatGPT</div><div class="text">
<p>You've mentioned the _Human Intelligence Alignment_ course in previous conversations. It sounds like a fascinating project! I recall that it's designed to explore ethics and governance in the context of multiple intelligent agents, giving students tools for understanding and designing systems that promote safety and alignment.</p>
</div></div></div><div class="message human"><div class="icon">D</div><div class="content"><div class="speaker">DJR</div><div class="text"><p>So new conversations can access previous conversations?</p></div></div></div><div class="message assistant"><div class="icon">C</div><div class="content"><div class="speaker">ChatGPT</div><div class="text">
<p>Not exactly. I don’t have access to past conversations directly, but I can remember details you've shared if they are relevant for ongoing discussions. This memory helps provide continuity and makes our interactions more productive. For instance, I know you're working on the _Human Intelligence Alignment_ course because you've told me before, and I saved it in memory.</p><p>If you'd like, I can also forget specific details or topics—it's completely up to you! Would you like me to explain further or adjust what I remember?</p></div></div></div></div></div>
So we spend some time talking about where this memory lives and how a new conversation accesses it. ChatGPT claims that it's not simply a bunch of text that gets added to the system prompt before any conversation. So, how DOES it work?  Here's my take away.

Every conversation is run through a transformer that's given the task of assessing whether anything in the conversation suggests information that is relevant to what this user is up to (cares about, knows about, etc.).  Part of the input to this process is probably things we have already remembered about this user.  This gets output as a {topic: str, content: str} pair. These are recorded in the user's profile.

This memory text is also run through the transformer to create a memory vector (in embedding space, circa $10^3$ dimensions) that captures its meaning.  The set of all (maybe 10) memory vectors is a part of my profile.

When I say something in a new conversation it gets converted to a semantic vector - the meaning of my prompt.  We can query the cosine similarity of this prompt vector with the memory vectors and if any are parallelish, we retrieve the memory and it can become part of the input for the model at this point in the conversation.

The "text" of the memory can be produced by generating text on some combination of the memory vector and the {topic,content} pair.

Here's what ChatGPT has on me:

> Yes, you can ask me to share everything I’ve remembered about you. Here’s what I currently have stored:
> 
> 1. You're designing a college course called _Human Intelligence Alignment_, which fulfills the ethics requirement for engineering students. It's a survey of social, political, and economic ideas and practices for generating safety in a world of multiple intelligent agents. The course aims to provide a conceptual toolkit for governance and regulation while developing intuition for governance technologies.
>     
> 2. You're considering including key thinkers like Brian Christian (_The Alignment Problem_, 2020), Kant, Rawls, Plato, and Aristotle in the course.
 >    
> 3. You prefer including publication years when discussing books or articles.
>     
> 4. You're reading Kenneth Arrow’s _The Limits of Organization_ (1974) and exploring its relevance to the course.
 >    
> 5. The course will explore ideas like shared beliefs and socially constructed worlds, drawing on thinkers such as Marx, Durkheim, Fleck, and Mead, and you’re seeking AI alignment analogs to these ideas.
 >    
> 6. You're interested in the five AI alignment problems identified by Amodei et al. (2016).
  >   
> 7. You're exploring how institutions and organizations might change with the emergence of AI, especially given AI’s unique bounded rationality, information asymmetry, and goal-setting.
  >   
> 8. You’re designing a separate course that adapts computational reasoning concepts for liberal arts students.
   >  
> 9. You're a cat person and have stepchildren and a spouse who engages in similar intellectual topics.
  >   
> 10. You're also working on a science fiction story involving AI abstraction, cryptic outputs, and shifts in AI behavior.
    > 
> 
> Would you like me to edit, delete, or refine any of this information?