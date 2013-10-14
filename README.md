codemirror-elixir-mode
======================

Quick-and-dirty Elixir mode for CodeMirror / Light Table

This is the result of fiddling with the Ruby mode (ruby.js) of CodeMirror for 30 minutes. Use at your own risk :)

To use with Light Table, put elixir.js inside the core/node_modules/codemirror/modes/ directory and add these in your user.behaviors:

:files [(:lt.objs.files/file-types [
    {:name "Elixir" :exts [:elixir :ex :exs] :mime "text/x-elixir" :tags [:editor.elixir]}
])]