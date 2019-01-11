Building a place for the birds to put their foots.

![A Literal Tree](https://s3.amazonaws.com/p125ce499/tree-2002.png?v=1)

http://literal-trees.co<br/>
https://ahw.github.io/literal-trees

# Dev Notes
* Everything starts with Math.random. The
  [seed-random](https://www.npmjs.com/package/seed-random "seed-random")
  library provides a PRNG that overrides Math.random so you can get
  reproducible sequences of psuedo-random numbers given the same input seed.
  That's how the persistant link works.
* A lot of the random values are coming from the Normal distribution. I'm
  pulling values from that distribution using the
  [box-muller](https://www.npmjs.com/package/box-muller "box-muller")
  module.
* The tree-rendering code is actually kind of basic — it's just a BFS
  algorithm. Still, it takes a fair amount of time and processing power. To
  unblock the main thread it's all running in a WebWorker. The WebWorker
  runs the BFS algorithm and returns a giant stringified version of the SVG
  document. In an earlier version I was building the SVG in the DOM directly
  using [RaphaelJS](http://raphaeljs.com/ "RaphaelJS") and it was 60X
  slower.
* Back in the main thread, the SVG document is rasterized client-side (!)
  into image/png data using HTML5 canvas. Data URLs abound, as do onload
  callbacks.
* If the device screen is taller than it is wide I assume you're on a phone
  and pad the image as necessary so that it matches the aspect ratio of the
  device exactly. This makes it easy to just save the image and have it work
  seamlessly as a phone background or whatever.
* Print styles! I spent some time (a lot) fiddling with the print styles. If
  the height or width of the tree doesn't fit on a single page, then the
  values of maxprintheight and maxprintwidth come into play in order to
  scale the image.
* Works offline using ApplicationCache. Why? Just 'cause.

# About Me
My name is Andrew Hallagan. I enjoy this sort of thing and I hope you do
too. This is my first foray into generative art; I'd love to hear what you
think about this or anything similar via
[email](mailto:andrewhallagan@outlook.com "andrewhallagan@outlook.com") or
Twitter, where I am 
[@andrewhallagan](https://twitter.com/andrewhallagan "@andrewhallagan").
