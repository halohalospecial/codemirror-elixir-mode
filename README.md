codemirror-elixir-mode
======================

[Elixir](http://elixir-lang.org) mode for [CodeMirror](http://codemirror.net) / [Light Table](http://www.lighttable.com) based on [ruby.js](https://github.com/marijnh/CodeMirror/blob/master/mode/ruby/ruby.js).

Probably incomplete, but has good enough syntax highlighting and indentation.

To use with Light Table, put ```elixir.js``` inside the ```core/node_modules/codemirror/modes/``` directory and add these into your user.behaviors:

```clojure
:files [(:lt.objs.files/file-types [
    {:name "Elixir" :exts [:elixir :ex :exs] :mime "text/x-elixir" :tags [:editor.elixir]}
])]
```
