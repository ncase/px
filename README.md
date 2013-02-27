px
===

Pixel art by players, for players.

Check out the [live demo](http://px.craftyy.com)!

---

### What does this do?

By embedding px in your game, your players can customize & create their own art, characters, and hats.

Not only that, they can share & use other players' published pixel art... even between *other* games.

And finally, all art made is auto-registered with [Creative Commons](http://creativecommons.org/), for anyone to remix.

---

### How do I use this?

You don't need to download this repo to use px!

Embedding px into an HTML game is just a script tag away:

    <script src='http://px.craftyy.com/px.js'></script>

Prompt your player to create or customize an image:

	px.edit(image,function(newImage){
		// callback
	});    

Prompt your player to choose an image from the common library:

	px.choose(function(chosenImage){
		// callback
	});

And that's the basics! For more advanced users, you may wish to use your own servers & databases, rather than mine.
All server code is included as well, so feel free to clone/fork this repo, and start up your own px-like service.

Your own px... for different art styles, for music, for level design, for stories.

Anything you believe could and *should* be shared amongst all players in all games.

---

### Credits and Shtuff

A silly weekend project by [N. Case](http://ncase.me)

Node.JS libraries used: Express, Sunny, Mongo

Special thanks to [Creative Commons](http://creativecommons.org/) and [Dan Mills](http://creativecommons.org/staff#danmills)

