# Face Recognition Server
### a Sails application using Node.js

<p>This project is our Master of Enginnering project at Cornell University</p>

<p>Our advisors are Professor Tsuhan Chen, Dr. Andrew Gallagher, and Dr. Amir Sadovnik</p>

<ul>
	<li>Charles Wang , cmw252@cornell.edu</li>
	<li>Qian Zhao</li>
	<li>Haoyuan Wang</li>
	<li>Peiqi Lei</li>
	<li>Zhongbo Geng</li>
</ul>

##Installation Guide
<h3>Systems Tested:</h3>
<ul>
	<li>Mac OS X 10.9.1, and Ubuntu</li>
</ul>

<h3>Requirements</h3>
<ul>
	<li>OpenCV version &lt; 2.4 (Need FaceRecognizer Class) *For Mac users, best to install using Macport or Homebrew</li>
	<li>node.js and npm *newest version</li>
	<li>node-gyp <code>sudo npm install -g node-gyp</code></li>
	<li>sails.js <code>sudo npm install -g sails</code></li>
	<li><a href="http://www.graphicsmagick.org">graphicsmagick</a></li>
</ul>

<h3>How to start</h3>
<p><code>npm install</code></p>
<p>Go to <code>config/adapters.js</code> and configure your database settings.</p>
<p>Create a <code>config/local.js</code>. This is a <a href="http://pastebin.com/raw.php?i=z0Qch4kt">sample one</a> with ssl.</p>
<p>Optional: Generate SSL for better security. <a href="http://docs.nodejitsu.com/articles/HTTP/servers/how-to-create-a-HTTPS-server">Instruction to generate the certificate.</a></p>

<h3>Client Software</h3>
iOS Client
https://github.com/charlesmwang/facerec-app-iOS



##API Documentation (Coming Soon!)
<h3>Check Wiki</h3>

##MIT License

The MIT License (MIT)

Copyright (c) 2014 Charles Wang

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.