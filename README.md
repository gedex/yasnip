YASnip, Yet Another Snip
============

This repository is intended as my attempt to accomplish Snip from [Nikhil's Article](http://howtonode.org/node-redis-fun).
The pastebin-like idea is still the same:

1. You visit http://localhost:3000/add
2. Post the snippet, and choose the language
3. Get a unique URL http://localhost/id

Here, nerve is replaced with express and redis-node-client is replaced with node_redis.

## Running YASnip

Make sure pygmentize is available in your PATH. Install dependencies in package.json:
````bash
npm install
````

Run the YASnip:
````js
node app.js
````

## LICENSE - "MIT License"

Copyright (c) 2012 Akeda Bagus <admin@gedex.web.id>

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
