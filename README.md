This is a simple protoc plugin for generating JSON typemaps for [rawproto](https://github.com/konsumer/rawproto).

The idea is that you have a proto SDL file (for all or some of the fields) and you want to pull out certain parts in rawproto.

Since rawproto does not analyze the data all up-front, it can be a quicker/lighter alternative to fully parsing the proto binary, and the typemap can give you nice labels for exploring on the [web tool](https://konsumer.js.org/rawproto/).

## installation

- You need `protoc` installed.
- you need node installed
- `npm i -g protoc-gen-typemap`

### usage

this will output message format at `1.2.4`, which is `DocV2` (in the proto) at a depth of 4, in generated/:

```
mkdir generated
protoc --typemap_out=generated --typemap_opt=DocV2,4,1.2.4 GooglePlay.proto < hearthstone.bin
```

You can use as many proto files as you like.

If you don't want to install globally (`npm i -g` above) you can run like this:

```
protoc --plugin=protoc-gen-typemap=./typemap.js --typemap_out=generated --typemap_opt=DocV2,4,1.2.4 GooglePlay.proto < hearthstone.bin
```


#### options

Options are comma-seperated, order-dependant, and added to `typemap_opt`.
- The message-name you want to target is required.
- The depth is optional and is how many sub-messages of your target message to traverse
- The path-prefix is optional, but probably needed for this to be useful. It is where in the binary this message will be found (message-address.)

In the example above, I traverse 4 messages deep, starting at `1.2.4`, which is a `DocV2`.

You can also shorten the command by putting options in `typemap_out` flag:

```
cat test.pb | protoc --typemap_out=MyMessage:generated schema.proto
```
