Elixir mode for CodeMirror / Light Table
========================================

Probably incomplete, but has good enough syntax highlighting and indentation.

Based on CodeMirror's ruby.js.

To use with Light Table, put elixir.js inside the core/node_modules/codemirror/modes/ directory and add these into your user.behaviors:

```clojure
:files [(:lt.objs.files/file-types [
    {:name "Elixir" :exts [:elixir :ex :exs] :mime "text/x-elixir" :tags [:editor.elixir]}
])]
```
