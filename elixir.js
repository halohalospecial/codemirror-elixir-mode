CodeMirror.defineMode("elixir", function(config) {
  function wordObj(words) {
    var o = {};
    for (var i = 0, e = words.length; i < e; ++i) o[words[i]] = true;
    return o;
  }
  var keywords = wordObj([
    "->",
    "bc",
    "lc",
    "in",
    "inbits",
    "inlist",
    "quote",
    "unquote",
    "unquote_splicing",
    "var",
    "do",
    "after",
    "for",
    "def",
    "defdelegate",
    "defimpl",
    "defmacro",
    "defmacrop",
    "defmodule",
    "defoverridable",
    "defp",
    "defprotocol",
    "defrecord",
    "destructure",
    "alias",
    "require",
    "import",
    "use",
    "if",
    "when",
    "case",
    "cond",
    "throw",
    "then",
    "else",
    "elsif",
    "try",
    "catch",
    "rescue",
    "fn",
    "function",
    "receive",
    "end",
  ]);
  var atomWords = wordObj([
	  "true",
    "false",
    "nil"
  ]);
  var indentWords = wordObj([
    //"case",
    //"catch",
    // "def",
    // "defdelegate",
    // "defimpl",
    // "defmacro",
    // "defmacrop",
    // "defmodule",
    // "defoverridable",
    // "defp",
    // "defprotocol",
    // "defrecord",
    "do",
    //"for",
    //"then"
  ]);
  var defineWords = wordObj([
    "def",
    "defdelegate",
    "defmacro",
    "defmacrop",
    "defoverridable",
    "defp"
  ]);
  var moduleWords = wordObj([
    "Behavior",
    "Binary",
    "Bitwise",
    "Builtin",
    "Elixir",
    "Code",
    "EEx",
    "Enum",
    "ExUnit",
    "Exception",
    "File",
    "GenServer",
    "Function",
    "GenServer",
    "GenTCP",
    "HashDict",
    "IO",
    "Keyword",
    "List",
    "Math",
    "Module",
    "Node",
    "OptionParser",
    "OrdDict",
    "Port",
    "Process",
    "Record",
    "Regexp",
    "System",
    "Tuple",
    "URI",
    "UnboundMethod"
  ]);
  var builtinWords = wordObj([
    "__MODULE__",
    "__LINE__",
    "__FILE__",
    "__ENV__"
  ]);
  var operatorWords = wordObj([
    "+",
    "++",
    "<>",
    "-",
    "/",
    "*",
    "div",
    "rem",
    "==",
    "!=",
    "<=",
    "<",
    ">=",
    ">",
    "===",
    "!==",
    "and",
    "or",
    "not",
    "&&",
    "||",
    "!",
    ".",
    "#",
    "=",
    ":=",
    "<-",
    "//"
  ]);
  var dedentWords = wordObj(["end", "until"]);
  var matching = {"[": "]", "{": "}", "(": ")"};
  var curPunc;

  function chain(newtok, stream, state) {
    state.tokenize.push(newtok);
    return newtok(stream, state);
  }

  function tokenBase(stream, state) {
    curPunc = null;
    if (stream.sol() && stream.match("=begin") && stream.eol()) {
      state.tokenize.push(readBlockComment);
      return "comment";
    }
    if (stream.eatSpace()) return null;
    var ch = stream.next(), m;
    /*if (ch == "`" || ch == "'" || ch == '"') {
      return chain(readQuoted(ch, "string", ch == '"' || ch == "`"), stream, state);
    }*/

	  if (ch == "'" || ch == '"') {
      return chain(readQuoted(ch, "string", ch == '"' || ch == '"'), stream, state);
    } /*else if (ch == "/" && !stream.eol() && stream.peek() != " ") {
      return chain(readQuoted(ch, "string-2", true), stream, state);
    } else if (ch == "%") {
      var style = "string", embed = true;
      if (stream.eat("s")) style = "atom";
      else if (stream.eat(/[WQ]/)) style = "string";
      else if (stream.eat(/[r]/)) style = "string-2";
      else if (stream.eat(/[wxq]/)) { style = "string"; embed = false; }
      var delim = stream.eat(/[^\w\s]/);
      if (!delim) return "operator";
      if (matching.propertyIsEnumerable(delim)) delim = matching[delim];
      return chain(readQuoted(delim, style, embed, true), stream, state);
    }*/ else if (ch == "%") {
      var style = "string", embed = true;
      /*if (stream.eat("s")) style = "atom";
      else*/ if (stream.eat(/[SWC]/)) style = "string";
      else if (stream.eat(/[r]/)) style = "string-2";
      else if (stream.eat(/[swc]/)) { style = "string"; embed = false; }
      var delim = stream.eat(/[^\w\s]/);
      if (!delim) return "operator";
      if (matching.propertyIsEnumerable(delim)) delim = matching[delim];
      return chain(readQuoted(delim, style, embed, true), stream, state);
    } else if (ch == "#") {
      stream.skipToEnd();
      return "comment";
    } /*else if (ch == "<" && (m = stream.match(/^<-?[\`\"\']?([a-zA-Z_?]\w*)[\`\"\']?(?:;|$)/))) {
      return chain(readHereDoc(m[1]), stream, state);
    }*/ else if (ch == "0") {
      if (stream.eat("x")) stream.eatWhile(/[\da-fA-F]/);
      else if (stream.eat("b")) stream.eatWhile(/[01]/);
      else stream.eatWhile(/[0-7]/);
      return "number";
    } else if (/\d/.test(ch)) {
      stream.match(/^[\d_]*(?:\.[\d_]+)?(?:[eE][+\-]?[\d_]+)?/);
      return "number";
    } else if (ch == "?") {
      while (stream.match(/^\\[CM]-/)) {}
      if (stream.eat("\\")) stream.eatWhile(/\w/);
      else stream.next();
      return "string";
    } else if (ch == ":") {
      if (stream.eat("'")) return chain(readQuoted("'", "atom", false), stream, state);
      if (stream.eat('"')) return chain(readQuoted('"', "atom", true), stream, state);

      /*// :> :>> :< :<< are valid symbols
      if (stream.eat(/[\<\>]/)) {
        stream.eat(/[\<\>]/);
        return "atom";
      }

      // :+ :- :/ :* :| :& :! are valid symbols
      if (stream.eat(/[\+\-\*\/\&\|\:\!]/)) {
        return "atom";
      }*/

      // Symbols can't start by a digit
      /*if (stream.eat(/[a-zA-Z$@_]/)) {*/
      if (stream.eat(/[a-zA-Z_]/)) {
        stream.eatWhile(/[\w]/);
        // Only one ? ! = is allowed and only as the last character
        stream.eat(/[\?\!\=]/);
        return "atom";
      }
      return "operator";
    } /*else if (ch == "@" && stream.match(/^@?[a-zA-Z_]/)) {
      stream.eat("@");
      stream.eatWhile(/[\w]/);
      return "variable-2";
    } else if (ch == "$") {
      if (stream.eat(/[a-zA-Z_]/)) {
        stream.eatWhile(/[\w]/);
      } else if (stream.eat(/\d/)) {
        stream.eat(/\d/);
      } else {
        stream.next(); // Must be a special global like $: or $!
      }
      return "variable-3";
    }*/ else if (/[a-zA-Z_]/.test(ch)) {
      stream.eatWhile(/[\w]/);
      stream.eat(/[\?\!]/);
      if (stream.eat(":")) return "atom";
      return "ident";
    } else if (ch == "|" && (state.varList || state.lastTok == "{" || state.lastTok == "do")) {
      curPunc = "|";
      return null;
    } else if (/[\(\)\[\]{}\\;]/.test(ch)) {
      curPunc = ch;
      return null;
    } /*else if (ch == "-" && stream.eat(">")) {
      return "arrow";
    } else if (/[=+\-\/*:\.^%<>~|]/.test(ch)) {
      stream.eatWhile(/[=+\-\/*:\.^%<>~|]/);
      return "operator";
    }*/ else if (/[=+\-\/*:\.^%<>~|&]/.test(ch)) {
      stream.eatWhile(/[=+\-\/*:\.^%<>~|&]/);
      return "operator";
    } else {
      return null;
    }
  }

  function tokenBaseUntilBrace() {
    var depth = 1;
    return function(stream, state) {
      if (stream.peek() == "}") {
        depth--;
        if (depth === 0) {
          state.tokenize.pop();
          return state.tokenize[state.tokenize.length - 1](stream, state);
        }
      } else if (stream.peek() == "{") {
        depth++;
      }
      return tokenBase(stream, state);
    };
  }
  function tokenBaseOnce() {
    var alreadyCalled = false;
    return function(stream, state) {
      if (alreadyCalled) {
        state.tokenize.pop();
        return state.tokenize[state.tokenize.length - 1](stream, state);
      }
      alreadyCalled = true;
      return tokenBase(stream, state);
    };
  }
  function readQuoted(quote, style, embed, unescaped) {
    return function(stream, state) {
      var escaped = false, ch;

      if (state.context.type === 'read-quoted-paused') {
        state.context = state.context.prev;
        stream.eat("}");
      }

      /*while ((ch = stream.next()) != null) {*/
      ch = stream.next();
      while (ch !== null && ch !== undefined) {
        if (ch == quote && (unescaped || !escaped)) {
          state.tokenize.pop();
          break;
        }
        if (embed && ch == "#" && !escaped) {
          if (stream.eat("{")) {
            if (quote == "}") {
              state.context = {prev: state.context, type: 'read-quoted-paused'};
            }
            state.tokenize.push(tokenBaseUntilBrace());
            break;
          } /*else if (/[@\$]/.test(stream.peek())) {
            state.tokenize.push(tokenBaseOnce());
            break;
          }*/
        }
        escaped = !escaped && ch == "\\";
        ch = stream.next();
      }
      return style;
    };
  }
  function readHereDoc(phrase) {
    return function(stream, state) {
      if (stream.match(phrase)) state.tokenize.pop();
      else stream.skipToEnd();
      return "string";
    };
  }
  function readBlockComment(stream, state) {
    if (stream.sol() && stream.match("=end") && stream.eol())
      state.tokenize.pop();
    stream.skipToEnd();
    return "comment";
  }

  return {
    startState: function() {
      return {tokenize: [tokenBase],
              indented: 0,
              context: {type: "top", indented: -config.indentUnit},
              continuedLine: false,
              lastTok: null,
              varList: false};
    },

    token: function(stream, state) {
      if (stream.sol()) state.indented = stream.indentation();
      var style = state.tokenize[state.tokenize.length-1](stream, state), kwtype;
      var word;
      if (style == "ident") {
        word = stream.current();
        style = keywords.propertyIsEnumerable(stream.current()) ? "keyword"
		      :	atomWords.propertyIsEnumerable(stream.current()) ? "atom"
          : builtinWords.propertyIsEnumerable(stream.current()) ? "builtin"
          : operatorWords.propertyIsEnumerable(stream.current()) ? "operator"
          : moduleWords.propertyIsEnumerable(stream.current()) ? "tag"
          : /^[A-Z]/.test(word) ? "tag"
          /*: (state.lastTok == "def" || state.lastTok == "class" || state.varList) ? "def"*/
          : (defineWords.propertyIsEnumerable(state.lastTok) || state.varList) ? "def"
          : "variable";
        if (indentWords.propertyIsEnumerable(word)) kwtype = "indent";
        else if (dedentWords.propertyIsEnumerable(word)) kwtype = "dedent";
        // else if ((word == "if" || word == "unless") && stream.column() == stream.indentation())
        //   kwtype = "indent";
      }
      if (curPunc || (style && style != "comment")) state.lastTok = word || curPunc || style;
      if (curPunc == "|") state.varList = !state.varList;

      if (kwtype == "indent" || /[\(\[\{]/.test(curPunc))
        state.context = {prev: state.context, type: curPunc || style, indented: state.indented};
      else if ((kwtype == "dedent" || /[\)\]\}]/.test(curPunc)) && state.context.prev)
        state.context = state.context.prev;

      if (stream.eol())
        state.continuedLine = (curPunc == "\\" || style == "operator");
      return style;
    },

    indent: function(state, textAfter) {
      //if (state.tokenize[state.tokenize.length-1] != tokenBase) return 0;
      var firstChar = textAfter && textAfter.charAt(0);
      var ct = state.context;
      var closing = ct.type == matching[firstChar] ||
        ct.type == "keyword" && /^(?:end|until|else|elsif|when|rescue)\b/.test(textAfter);
      var fromEnd = firstChar.length === 0 && state.lastTok === "end";
      if (fromEnd) { return state.indented; }
      return ct.indented + (closing ? 0 : config.indentUnit) + (state.continuedLine ? config.indentUnit : 0);
    },

    electricChars: "}de", // enD and rescuE
    lineComment: "#"
  };
});

CodeMirror.defineMIME("text/x-elixir", "elixir");
