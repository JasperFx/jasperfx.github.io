import{_ as n,c as s,o as a,d as e}from"./app.ba9181fa.js";var t="/JasperMessaging.drawio.png";const h='{"title":"Jasper as Messaging Bus","description":"","frontmatter":{},"headers":[{"level":2,"title":"Terminology","slug":"terminology"},{"level":2,"title":"Ping/Pong Sample","slug":"ping-pong-sample"}],"relativePath":"guide/messaging/index.md","lastUpdated":1655492219734}',p={},o=e('<h1 id="jasper-as-messaging-bus" tabindex="-1">Jasper as Messaging Bus <a class="header-anchor" href="#jasper-as-messaging-bus" aria-hidden="true">#</a></h1><p>There&#39;s certainly some value in Jasper just being a command bus running inside of a single process, but now it&#39;s time to utilize Jasper to both publish and process messages received through external infrastructure like <a href="https://www.rabbitmq.com/" target="_blank" rel="noopener noreferrer">Rabbit MQ</a> or <a href="https://pulsar.apache.org/" target="_blank" rel="noopener noreferrer">Pulsar</a>.</p><h2 id="terminology" tabindex="-1">Terminology <a class="header-anchor" href="#terminology" aria-hidden="true">#</a></h2><p>To put this into perspective, here&#39;s how a Jasper application could be connected to the outside world:</p><p><img src="'+t+`" alt="Jasper Messaging Architecture"></p><div class="tip custom-block"><p class="custom-block-title">TIP</p><p>The diagram above should just say &quot;Message Handler&quot; as Jasper makes no differentiation between commands or events, but Jeremy is being too lazy to fix the diagram.</p></div><p>Before going into any kind of detail about how to use Jasper messaging, let&#39;s talk about some terminology:</p><ul><li><em>Transport</em> -- This refers to the support within Jasper for external messaging infrastructure tools like Rabbit MQ or Pulsar</li><li><em>Endpoint</em> -- A Jasper connection to some sort of external resource like a Rabbit MQ exchange or a Pulsar or Kafka topic. The <a href="https://www.asyncapi.com/" target="_blank" rel="noopener noreferrer">Async API</a> specification refers to this as a <em>channel</em>, and Jasper may very well change its nomenclature in the future to be consistent with Async API</li><li><em>Sending Agent</em> -- You won&#39;t use this directly in your own code, but Jasper&#39;s internal adapters to publish outgoing messages to transport endpoints</li><li><em>Listener</em> -- Again, an internal detail of Jasper that receives messages from external transport endpoints, and mediates between the transports and executing the message handlers</li><li><em>Message Store</em> -- Database storage for Jasper&#39;s <a href="/guide/persistence/">inbox/outbox persistent messaging</a></li><li><em>Durability Agent</em> -- An internal subsystem in Jasper that runs in a background service to interact with the message store for Jasper&#39;s <a href="https://microservices.io/patterns/data/transactional-outbox.html" target="_blank" rel="noopener noreferrer">transactional inbox/outbox</a> functionality</li></ul><h2 id="ping-pong-sample" tabindex="-1">Ping/Pong Sample <a class="header-anchor" href="#ping-pong-sample" aria-hidden="true">#</a></h2><p>To show off some of the messaging, let&#39;s just build <a href="https://github.com/JasperFx/jasper/tree/master/src/Samples/PingPong" target="_blank" rel="noopener noreferrer">a very simple &quot;Ping/Pong&quot; example</a> that will exchange messages between two small .NET processes.</p><p>First off, I&#39;m going to build out a very small shared library just to hold the messages we&#39;re going to exchange:</p><p><a id="snippet-sample_pingpongmessages"></a></p><div class="language-cs"><pre><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">Ping</span>
<span class="token punctuation">{</span>
    <span class="token keyword">public</span> <span class="token return-type class-name"><span class="token keyword">int</span></span> Number <span class="token punctuation">{</span> <span class="token keyword">get</span><span class="token punctuation">;</span> <span class="token keyword">set</span><span class="token punctuation">;</span> <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">Pong</span>
<span class="token punctuation">{</span>
    <span class="token keyword">public</span> <span class="token return-type class-name"><span class="token keyword">int</span></span> Number <span class="token punctuation">{</span> <span class="token keyword">get</span><span class="token punctuation">;</span> <span class="token keyword">set</span><span class="token punctuation">;</span> <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre></div><p><sup><a href="https://github.com/JasperFx/alba/blob/master/src/Samples/PingPong/Messages/Messages.cs#L3-L15" title="Snippet source file">snippet source</a> | <a href="#snippet-sample_pingpongmessages" title="Start of snippet">anchor</a></sup></p><p>And next, I&#39;ll start a small <em>Pinger</em> service with the <code>dotnet new worker</code> template. There&#39;s just three pieces of code, starting with the boostrapping code:</p><p><a id="snippet-sample_bootstrappingpinger"></a></p><div class="language-cs"><pre><code><span class="token keyword">using</span> <span class="token namespace">Jasper</span><span class="token punctuation">;</span>
<span class="token keyword">using</span> <span class="token namespace">Jasper<span class="token punctuation">.</span>Transports<span class="token punctuation">.</span>Tcp</span><span class="token punctuation">;</span>
<span class="token keyword">using</span> <span class="token namespace">Messages</span><span class="token punctuation">;</span>
<span class="token keyword">using</span> <span class="token namespace">Oakton</span><span class="token punctuation">;</span>
<span class="token keyword">using</span> <span class="token namespace">Pinger</span><span class="token punctuation">;</span>

<span class="token keyword">return</span> <span class="token keyword">await</span> Host<span class="token punctuation">.</span><span class="token function">CreateDefaultBuilder</span><span class="token punctuation">(</span>args<span class="token punctuation">)</span>
    <span class="token punctuation">.</span><span class="token function">UseJasper</span><span class="token punctuation">(</span>opts <span class="token operator">=&gt;</span>
    <span class="token punctuation">{</span>
        <span class="token comment">// Using Jasper&#39;s built in TCP transport</span>

        <span class="token comment">// listen to incoming messages at port 5580</span>
        opts<span class="token punctuation">.</span><span class="token function">ListenAtPort</span><span class="token punctuation">(</span><span class="token number">5580</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// route all Ping messages to port 5581</span>
        opts<span class="token punctuation">.</span><span class="token generic-method"><span class="token function">PublishMessage</span><span class="token generic class-name"><span class="token punctuation">&lt;</span>Ping<span class="token punctuation">&gt;</span></span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">ToPort</span><span class="token punctuation">(</span><span class="token number">5581</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// Registering the hosted service here, but could do</span>
        <span class="token comment">// that with a separate call to IHostBuilder.ConfigureServices()</span>
        opts<span class="token punctuation">.</span>Services<span class="token punctuation">.</span><span class="token generic-method"><span class="token function">AddHostedService</span><span class="token generic class-name"><span class="token punctuation">&lt;</span>Worker<span class="token punctuation">&gt;</span></span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
    <span class="token punctuation">.</span><span class="token function">RunOaktonCommands</span><span class="token punctuation">(</span>args<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre></div><p><sup><a href="https://github.com/JasperFx/alba/blob/master/src/Samples/PingPong/Pinger/Program.cs#L1-L26" title="Snippet source file">snippet source</a> | <a href="#snippet-sample_bootstrappingpinger" title="Start of snippet">anchor</a></sup></p><p>and the <code>Worker</code> class that&#39;s just going to publish a new <code>Ping</code> message once a second:</p><p><a id="snippet-sample_pingpong_worker"></a></p><div class="language-cs"><pre><code><span class="token keyword">using</span> <span class="token namespace">Jasper</span><span class="token punctuation">;</span>
<span class="token keyword">using</span> <span class="token namespace">Messages</span><span class="token punctuation">;</span>

<span class="token keyword">namespace</span> <span class="token namespace">Pinger</span><span class="token punctuation">;</span>

<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">Worker</span> <span class="token punctuation">:</span> <span class="token type-list"><span class="token class-name">BackgroundService</span></span>
<span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token keyword">readonly</span> <span class="token class-name">ILogger<span class="token punctuation">&lt;</span>Worker<span class="token punctuation">&gt;</span></span> _logger<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token keyword">readonly</span> <span class="token class-name">IMessagePublisher</span> _publisher<span class="token punctuation">;</span>

    <span class="token keyword">public</span> <span class="token function">Worker</span><span class="token punctuation">(</span><span class="token class-name">ILogger<span class="token punctuation">&lt;</span>Worker<span class="token punctuation">&gt;</span></span> logger<span class="token punctuation">,</span> <span class="token class-name">IMessagePublisher</span> publisher<span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        _logger <span class="token operator">=</span> logger<span class="token punctuation">;</span>
        _publisher <span class="token operator">=</span> publisher<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">protected</span> <span class="token keyword">override</span> <span class="token keyword">async</span> <span class="token return-type class-name">Task</span> <span class="token function">ExecuteAsync</span><span class="token punctuation">(</span><span class="token class-name">CancellationToken</span> stoppingToken<span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token class-name"><span class="token keyword">var</span></span> pingNumber <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>

        <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token operator">!</span>stoppingToken<span class="token punctuation">.</span>IsCancellationRequested<span class="token punctuation">)</span>
        <span class="token punctuation">{</span>

            <span class="token keyword">await</span> Task<span class="token punctuation">.</span><span class="token function">Delay</span><span class="token punctuation">(</span><span class="token number">1000</span><span class="token punctuation">,</span> stoppingToken<span class="token punctuation">)</span><span class="token punctuation">;</span>
            _logger<span class="token punctuation">.</span><span class="token function">LogInformation</span><span class="token punctuation">(</span><span class="token string">&quot;Sending Ping #{Number}&quot;</span><span class="token punctuation">,</span> pingNumber<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">await</span> _publisher<span class="token punctuation">.</span><span class="token function">PublishAsync</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token constructor-invocation class-name">Ping</span> <span class="token punctuation">{</span> Number <span class="token operator">=</span> pingNumber <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            pingNumber<span class="token operator">++</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre></div><p><sup><a href="https://github.com/JasperFx/alba/blob/master/src/Samples/PingPong/Pinger/Worker.cs#L1-L35" title="Snippet source file">snippet source</a> | <a href="#snippet-sample_pingpong_worker" title="Start of snippet">anchor</a></sup></p><p>and lastly a message handler for any <code>Pong</code> messages coming back from the <code>Ponger</code> we&#39;ll build next:</p><p><a id="snippet-sample_ponghandler"></a></p><div class="language-cs"><pre><code><span class="token keyword">using</span> <span class="token namespace">Messages</span><span class="token punctuation">;</span>

<span class="token keyword">namespace</span> <span class="token namespace">Pinger</span><span class="token punctuation">;</span>

<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">PongHandler</span>
<span class="token punctuation">{</span>
    <span class="token keyword">public</span> <span class="token return-type class-name"><span class="token keyword">void</span></span> <span class="token function">Handle</span><span class="token punctuation">(</span><span class="token class-name">Pong</span> pong<span class="token punctuation">,</span> <span class="token class-name">ILogger<span class="token punctuation">&lt;</span>PongHandler<span class="token punctuation">&gt;</span></span> logger<span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        logger<span class="token punctuation">.</span><span class="token function">LogInformation</span><span class="token punctuation">(</span><span class="token string">&quot;Received Pong #{Number}&quot;</span><span class="token punctuation">,</span> pong<span class="token punctuation">.</span>Number<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre></div><p><sup><a href="https://github.com/JasperFx/alba/blob/master/src/Samples/PingPong/Pinger/PongHandler.cs#L1-L15" title="Snippet source file">snippet source</a> | <a href="#snippet-sample_ponghandler" title="Start of snippet">anchor</a></sup></p><p>Okay then, next let&#39;s move on to building the <code>Ponger</code> application. This time I&#39;ll use <code>dotnet new console</code> to start the new project, then add references to our <em>Messages</em> library and Jasper itself. For the bootstrapping, add this code:</p><p><a id="snippet-sample_pongerbootstrapping"></a></p><div class="language-cs"><pre><code><span class="token keyword">using</span> <span class="token namespace">Jasper</span><span class="token punctuation">;</span>
<span class="token keyword">using</span> <span class="token namespace">Jasper<span class="token punctuation">.</span>Transports<span class="token punctuation">.</span>Tcp</span><span class="token punctuation">;</span>
<span class="token keyword">using</span> <span class="token namespace">Microsoft<span class="token punctuation">.</span>Extensions<span class="token punctuation">.</span>Hosting</span><span class="token punctuation">;</span>
<span class="token keyword">using</span> <span class="token namespace">Oakton</span><span class="token punctuation">;</span>

<span class="token keyword">return</span> <span class="token keyword">await</span> Host<span class="token punctuation">.</span><span class="token function">CreateDefaultBuilder</span><span class="token punctuation">(</span>args<span class="token punctuation">)</span>
    <span class="token punctuation">.</span><span class="token function">UseJasper</span><span class="token punctuation">(</span>opts <span class="token operator">=&gt;</span>
    <span class="token punctuation">{</span>
        <span class="token comment">// Using Jasper&#39;s built in TCP transport</span>
        opts<span class="token punctuation">.</span><span class="token function">ListenAtPort</span><span class="token punctuation">(</span><span class="token number">5581</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
    <span class="token punctuation">.</span><span class="token function">RunOaktonCommands</span><span class="token punctuation">(</span>args<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre></div><p><sup><a href="https://github.com/JasperFx/alba/blob/master/src/Samples/PingPong/Ponger/Program.cs#L1-L17" title="Snippet source file">snippet source</a> | <a href="#snippet-sample_pongerbootstrapping" title="Start of snippet">anchor</a></sup></p><p>And a message handler for the <code>Ping</code> messages that will turn right around and shoot a <code>Pong</code> response right back to the original sender:</p><p><a id="snippet-sample_pinghandler"></a></p><div class="language-cs"><pre><code><span class="token keyword">using</span> <span class="token namespace">Jasper</span><span class="token punctuation">;</span>
<span class="token keyword">using</span> <span class="token namespace">Messages</span><span class="token punctuation">;</span>
<span class="token keyword">using</span> <span class="token namespace">Microsoft<span class="token punctuation">.</span>Extensions<span class="token punctuation">.</span>Logging</span><span class="token punctuation">;</span>

<span class="token keyword">namespace</span> <span class="token namespace">Ponger</span><span class="token punctuation">;</span>

<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">PingHandler</span>
<span class="token punctuation">{</span>
    <span class="token keyword">public</span> <span class="token return-type class-name">ValueTask</span> <span class="token function">Handle</span><span class="token punctuation">(</span><span class="token class-name">Ping</span> ping<span class="token punctuation">,</span> <span class="token class-name">ILogger<span class="token punctuation">&lt;</span>PingHandler<span class="token punctuation">&gt;</span></span> logger<span class="token punctuation">,</span> <span class="token class-name">IExecutionContext</span> context<span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        logger<span class="token punctuation">.</span><span class="token function">LogInformation</span><span class="token punctuation">(</span><span class="token string">&quot;Got Ping #{Number}&quot;</span><span class="token punctuation">,</span> ping<span class="token punctuation">.</span>Number<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> context<span class="token punctuation">.</span><span class="token function">RespondToSenderAsync</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token constructor-invocation class-name">Pong</span> <span class="token punctuation">{</span> Number <span class="token operator">=</span> ping<span class="token punctuation">.</span>Number <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre></div><p><sup><a href="https://github.com/JasperFx/alba/blob/master/src/Samples/PingPong/Ponger/PingHandler.cs#L1-L19" title="Snippet source file">snippet source</a> | <a href="#snippet-sample_pinghandler" title="Start of snippet">anchor</a></sup><a id="snippet-sample_pinghandler-1"></a></p><div class="language-cs"><pre><code><span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">class</span> <span class="token class-name">PingHandler</span>
<span class="token punctuation">{</span>
    <span class="token comment">// Simple message handler for the PingMessage message type</span>
    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token return-type class-name">ValueTask</span> <span class="token function">Handle</span><span class="token punctuation">(</span>
        <span class="token comment">// The first argument is assumed to be the message type</span>
        <span class="token class-name">PingMessage</span> message<span class="token punctuation">,</span>

        <span class="token comment">// Jasper supports method injection similar to ASP.Net Core MVC</span>
        <span class="token comment">// In this case though, IMessageContext is scoped to the message</span>
        <span class="token comment">// being handled</span>
        <span class="token class-name">IExecutionContext</span> context<span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        ConsoleWriter<span class="token punctuation">.</span><span class="token function">Write</span><span class="token punctuation">(</span>ConsoleColor<span class="token punctuation">.</span>Blue<span class="token punctuation">,</span> <span class="token interpolation-string"><span class="token string">$&quot;Got ping #</span><span class="token interpolation"><span class="token punctuation">{</span><span class="token expression language-csharp">message<span class="token punctuation">.</span>Number</span><span class="token punctuation">}</span></span><span class="token string">&quot;</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token class-name"><span class="token keyword">var</span></span> response <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token constructor-invocation class-name">PongMessage</span>
        <span class="token punctuation">{</span>
            Number <span class="token operator">=</span> message<span class="token punctuation">.</span>Number
        <span class="token punctuation">}</span><span class="token punctuation">;</span>

        <span class="token comment">// This usage will send the response message</span>
        <span class="token comment">// back to the original sender. Jasper uses message</span>
        <span class="token comment">// headers to embed the reply address for exactly</span>
        <span class="token comment">// this use case</span>
        <span class="token keyword">return</span> context<span class="token punctuation">.</span><span class="token function">RespondToSenderAsync</span><span class="token punctuation">(</span>response<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre></div><p><sup><a href="https://github.com/JasperFx/alba/blob/master/src/Samples/PingPongWithRabbitMq/Ponger/PingHandler.cs#L8-L37" title="Snippet source file">snippet source</a> | <a href="#snippet-sample_pinghandler-1" title="Start of snippet">anchor</a></sup></p><p>If I start up first the <em>Ponger</em> service, then the <em>Pinger</em> service, I&#39;ll see console output like this from <em>Pinger</em>:</p><div class="language-"><pre><code>info: Pinger.Worker[0]
      Sending Ping #11
info: Pinger.PongHandler[0]
      Received Pong #1
info: Jasper.Runtime.JasperRuntime[104]
      Successfully processed message Pong#01817277-f692-42d5-a3e4-35d9b7d119fb from tcp://localhost:5581/
info: Pinger.PongHandler[0]
      Received Pong #2
info: Jasper.Runtime.JasperRuntime[104]
      Successfully processed message Pong#01817277-f699-4340-a59d-9616aee61cb8 from tcp://localhost:5581/
info: Pinger.PongHandler[0]
      Received Pong #3
info: Jasper.Runtime.JasperRuntime[104]
      Successfully processed message Pong#01817277-f699-48ea-988b-9e835bc53020 from tcp://localhost:5581/
info: Pinger.PongHandler[0]
</code></pre></div><p>and output like this in the <em>Ponger</em> process:</p><div class="language-"><pre><code>info: Ponger.PingHandler[0]
      Got Ping #1
info: Jasper.Runtime.JasperRuntime[104]
      Successfully processed message Ping#01817277-d673-4357-84e3-834c36f3446c from tcp://localhost:5580/
info: Ponger.PingHandler[0]
      Got Ping #2
info: Jasper.Runtime.JasperRuntime[104]
      Successfully processed message Ping#01817277-da61-4c9d-b381-6cda92038d41 from tcp://localhost:5580/
info: Ponger.PingHandler[0]
      Got Ping #3
</code></pre></div>`,40),c=[o];function l(i,r,u,k,g,d){return a(),s("div",null,c)}var b=n(p,[["render",l]]);export{h as __pageData,b as default};
