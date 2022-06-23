import{_ as n,c as a,o as s,d as t}from"./app.ba9181fa.js";const m='{"title":"Configuring Messaging","description":"","frontmatter":{},"headers":[{"level":2,"title":"Transport Connectivity","slug":"transport-connectivity"},{"level":2,"title":"Listening Endpoint Configuration","slug":"listening-endpoint-configuration"},{"level":2,"title":"Sending Endpoint Configuration","slug":"sending-endpoint-configuration"}],"relativePath":"guide/messaging/configuration.md","lastUpdated":1655944674085}',o={},e=t(`<h1 id="configuring-messaging" tabindex="-1">Configuring Messaging <a class="header-anchor" href="#configuring-messaging" aria-hidden="true">#</a></h1><p>There&#39;s a couple moving parts to using Jasper as a messaging bus. You&#39;ll need to configure connectivity to external infrastructure like Rabbit MQ brokers, set up listening endpoints, and create routing rules to teach Jasper where and how to send your messages.</p><h2 id="transport-connectivity" tabindex="-1">Transport Connectivity <a class="header-anchor" href="#transport-connectivity" aria-hidden="true">#</a></h2><p>The <a href="/guide/messaging/transports/tcp.html">TCP transport</a> is built in, and the <a href="/guide/in-memory-bus.html">&quot;local&quot; in memory queues</a> can be used like a transport, but you&#39;ll need to configure connectivity for every other type of messaging transport adapter to external infrastructure. In all cases so far, the connectivity to external transports is done through an extension method on <code>JasperOptions</code> using the <code>Use[ToolName]()</code> idiom that is now common across .NET tools.</p><p>For an example, here&#39;s connecting to a Rabbit MQ broker:</p><p><a id="snippet-sample_configuring_connection_to_rabbit_mq"></a></p><div class="language-cs"><pre><code><span class="token keyword">using</span> <span class="token namespace">Jasper</span><span class="token punctuation">;</span>
<span class="token keyword">using</span> <span class="token namespace">Jasper<span class="token punctuation">.</span>RabbitMQ</span><span class="token punctuation">;</span>

<span class="token class-name"><span class="token keyword">var</span></span> builder <span class="token operator">=</span> WebApplication<span class="token punctuation">.</span><span class="token function">CreateBuilder</span><span class="token punctuation">(</span>args<span class="token punctuation">)</span><span class="token punctuation">;</span>

builder<span class="token punctuation">.</span>Host<span class="token punctuation">.</span><span class="token function">UseJasper</span><span class="token punctuation">(</span>opts <span class="token operator">=&gt;</span>
<span class="token punctuation">{</span>
    <span class="token comment">// Using the Rabbit MQ URI specification: https://www.rabbitmq.com/uri-spec.html</span>
    opts<span class="token punctuation">.</span><span class="token function">UseRabbitMq</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token constructor-invocation class-name">Uri</span><span class="token punctuation">(</span>builder<span class="token punctuation">.</span>Configuration<span class="token punctuation">[</span><span class="token string">&quot;rabbitmq&quot;</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// Or connect locally as you might for development purposes</span>
    opts<span class="token punctuation">.</span><span class="token function">UseRabbitMq</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// Or do it more programmatically:</span>
    opts<span class="token punctuation">.</span><span class="token function">UseRabbitMq</span><span class="token punctuation">(</span>rabbit <span class="token operator">=&gt;</span>
    <span class="token punctuation">{</span>
        rabbit<span class="token punctuation">.</span>HostName <span class="token operator">=</span> builder<span class="token punctuation">.</span>Configuration<span class="token punctuation">[</span><span class="token string">&quot;rabbitmq_host&quot;</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
        rabbit<span class="token punctuation">.</span>VirtualHost <span class="token operator">=</span> builder<span class="token punctuation">.</span>Configuration<span class="token punctuation">[</span><span class="token string">&quot;rabbitmq_virtual_host&quot;</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
        rabbit<span class="token punctuation">.</span>UserName <span class="token operator">=</span> builder<span class="token punctuation">.</span>Configuration<span class="token punctuation">[</span><span class="token string">&quot;rabbitmq_username&quot;</span><span class="token punctuation">]</span><span class="token punctuation">;</span>

        <span class="token comment">// and you get the point, you get full control over the Rabbit MQ</span>
        <span class="token comment">// connection here for the times you need that</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre></div><p><sup><a href="https://github.com/JasperFx/alba/blob/master/src/Samples/RabbitMqBootstrapping/Program.cs#L1-L28" title="Snippet source file">snippet source</a> | <a href="#snippet-sample_configuring_connection_to_rabbit_mq" title="Start of snippet">anchor</a></sup></p><h2 id="listening-endpoint-configuration" tabindex="-1">Listening Endpoint Configuration <a class="header-anchor" href="#listening-endpoint-configuration" aria-hidden="true">#</a></h2><h2 id="sending-endpoint-configuration" tabindex="-1">Sending Endpoint Configuration <a class="header-anchor" href="#sending-endpoint-configuration" aria-hidden="true">#</a></h2>`,10),p=[e];function i(c,u,r,l,g,d){return s(),a("div",null,p)}var b=n(o,[["render",i]]);export{m as __pageData,b as default};
