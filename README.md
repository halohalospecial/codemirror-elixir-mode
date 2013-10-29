codemirror-elixir-mode
======================

Elixir mode for CodeMirror / Light Table

Hacked from CodeMirror's ruby.js and most probably incomplete. Use at your own risk :)

To use with Light Table, put elixir.js inside the core/node_modules/codemirror/modes/ directory and add these into your user.behaviors:

:files [(:lt.objs.files/file-types [
    {:name "Elixir" :exts [:elixir :ex :exs] :mime "text/x-elixir" :tags [:editor.elixir]}
])]
