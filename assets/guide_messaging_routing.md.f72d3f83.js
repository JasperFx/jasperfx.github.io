import{_ as n,c as s,o as a,d as t}from"./app.ba9181fa.js";const d='{"title":"Message Routing","description":"","frontmatter":{},"relativePath":"guide/messaging/routing.md","lastUpdated":1655492219748}',p={},e=t(`<h1 id="message-routing" tabindex="-1">Message Routing <a class="header-anchor" href="#message-routing" aria-hidden="true">#</a></h1><p>TODO -- talk about messaging Uri</p><div class="tip custom-block"><p class="custom-block-title">TIP</p><p>Some of the transports have conventional routing approaches as well as the explicit routing rules shown in this page.</p></div><p>When you publish a message using <code>IMessagePublisher</code> or <code>IExecutionContext</code> without explicitly setting the Uri of the desired destination, Jasper has to invoke the known message routing rules and dynamic subscriptions to figure out which locations should receive the message. Consider this code that publishes a <code>PingMessage</code>:</p><p><a id="snippet-sample_sending_messages_for_static_routing"></a></p><div class="language-cs"><pre><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">SendingExample</span>
<span class="token punctuation">{</span>
    <span class="token keyword">public</span> <span class="token keyword">async</span> <span class="token return-type class-name">Task</span> <span class="token function">SendPingsAndPongs</span><span class="token punctuation">(</span><span class="token class-name">IExecutionContext</span> bus<span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token comment">// Publish a message</span>
        <span class="token keyword">await</span> bus<span class="token punctuation">.</span><span class="token function">SendAsync</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token constructor-invocation class-name">PingMessage</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre></div><p><sup><a href="https://github.com/JasperFx/alba/blob/master/src/Jasper.Testing/Runtime/Samples/channels.cs#L12-L21" title="Snippet source file">snippet source</a> | <a href="#snippet-sample_sending_messages_for_static_routing" title="Start of snippet">anchor</a></sup></p><p>To route messages to specific endpoints, we can apply static message routing rules by using a routing rule as shown below:</p><p><a id="snippet-sample_staticpublishingrules"></a></p><div class="language-cs"><pre><code><span class="token keyword">using</span> <span class="token class-name"><span class="token keyword">var</span></span> host <span class="token operator">=</span> Host<span class="token punctuation">.</span><span class="token function">CreateDefaultBuilder</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">.</span><span class="token function">UseJasper</span><span class="token punctuation">(</span>opts <span class="token operator">=&gt;</span>
    <span class="token punctuation">{</span>
        <span class="token comment">// Route a single message type</span>
        opts<span class="token punctuation">.</span><span class="token generic-method"><span class="token function">PublishMessage</span><span class="token generic class-name"><span class="token punctuation">&lt;</span>PingMessage<span class="token punctuation">&gt;</span></span></span><span class="token punctuation">(</span><span class="token punctuation">)</span>
            <span class="token punctuation">.</span><span class="token function">ToServerAndPort</span><span class="token punctuation">(</span><span class="token string">&quot;server&quot;</span><span class="token punctuation">,</span> <span class="token number">1111</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// Send every possible message to a TCP listener</span>
        <span class="token comment">// on this box at port 2222</span>
        opts<span class="token punctuation">.</span><span class="token function">PublishAllMessages</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">ToPort</span><span class="token punctuation">(</span><span class="token number">2222</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// Or use a more fluent interface style</span>
        opts<span class="token punctuation">.</span><span class="token function">Publish</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">MessagesFromAssembly</span><span class="token punctuation">(</span><span class="token keyword">typeof</span><span class="token punctuation">(</span><span class="token type-expression class-name">PingMessage</span><span class="token punctuation">)</span><span class="token punctuation">.</span>Assembly<span class="token punctuation">)</span>
            <span class="token punctuation">.</span><span class="token function">ToPort</span><span class="token punctuation">(</span><span class="token number">3333</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// Complicated rules, I don&#39;t think folks will use this much</span>
        opts<span class="token punctuation">.</span><span class="token function">Publish</span><span class="token punctuation">(</span>rule <span class="token operator">=&gt;</span>
        <span class="token punctuation">{</span>
            <span class="token comment">// Apply as many message matching</span>
            <span class="token comment">// rules as you need</span>

            <span class="token comment">// Specific message types</span>
            rule<span class="token punctuation">.</span><span class="token generic-method"><span class="token function">Message</span><span class="token generic class-name"><span class="token punctuation">&lt;</span>PingMessage<span class="token punctuation">&gt;</span></span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            rule<span class="token punctuation">.</span><span class="token generic-method"><span class="token function">Message</span><span class="token generic class-name"><span class="token punctuation">&lt;</span>Message1<span class="token punctuation">&gt;</span></span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

            <span class="token comment">// All types in a certain assembly</span>
            rule<span class="token punctuation">.</span><span class="token generic-method"><span class="token function">MessagesFromAssemblyContaining</span><span class="token generic class-name"><span class="token punctuation">&lt;</span>PingMessage<span class="token punctuation">&gt;</span></span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

            <span class="token comment">// or this</span>
            rule<span class="token punctuation">.</span><span class="token function">MessagesFromAssembly</span><span class="token punctuation">(</span><span class="token keyword">typeof</span><span class="token punctuation">(</span><span class="token type-expression class-name">PingMessage</span><span class="token punctuation">)</span><span class="token punctuation">.</span>Assembly<span class="token punctuation">)</span><span class="token punctuation">;</span>

            <span class="token comment">// or by namespace</span>
            rule<span class="token punctuation">.</span><span class="token function">MessagesFromNamespace</span><span class="token punctuation">(</span><span class="token string">&quot;MyMessageLibrary&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            rule<span class="token punctuation">.</span><span class="token generic-method"><span class="token function">MessagesFromNamespaceContaining</span><span class="token generic class-name"><span class="token punctuation">&lt;</span>PingMessage<span class="token punctuation">&gt;</span></span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

            <span class="token comment">// Express the subscribers</span>
            rule<span class="token punctuation">.</span><span class="token function">ToPort</span><span class="token punctuation">(</span><span class="token number">1111</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            rule<span class="token punctuation">.</span><span class="token function">ToPort</span><span class="token punctuation">(</span><span class="token number">2222</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// Or you just send all messages to a certain endpoint</span>
        opts<span class="token punctuation">.</span><span class="token function">PublishAllMessages</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">ToPort</span><span class="token punctuation">(</span><span class="token number">3333</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">StartAsync</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre></div><p><sup><a href="https://github.com/JasperFx/alba/blob/master/src/Samples/DocumentationSamples/StaticPublishingRule.cs#L14-L60" title="Snippet source file">snippet source</a> | <a href="#snippet-sample_staticpublishingrules" title="Start of snippet">anchor</a></sup></p><p>Do note that doing the message type filtering by namespace will also include child namespaces. In our own usage we try to rely on either namespace rules or by using shared message assemblies.</p>`,12),o=[e];function c(u,l,i,k,r,m){return a(),s("div",null,o)}var h=n(p,[["render",c]]);export{d as __pageData,h as default};
