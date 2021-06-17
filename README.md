Read and Learn Toki Pona
========================

Front end in React, Redux, and redux-observable (RxJS).

Back end in Phoenix (the Elixir framework).

[Parser](https://github.com/justinsilvestre/parse-toki-pona) generated with PEG.js.

### Development

After installing the proper versions of Elixir and Erlang (see [.tool-versions](/.tool-versions)), you can install dependencies + set up the database like this:

```
mix deps.get
mix ecto.create
mix ecto.migrate
mix run priv/repo/seeds.exs
```

Then, you may run a dev server:

```
mix phx.server
```