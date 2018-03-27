# vscode-copy-code-block
Copy code with filename and line number, customized format.



## Extension Settings

| parameter name  |   |   |
|---|---|---|
| formatName  | keybinding  "args" "formatName"  |   |
| codeBlockHeaderFormat  | Specifies the format of the code block footer lines. |   |
| codeBlockFooterFormat  | Code block footer format. The available tokens are the same as codeBlockHeaderFormat." |   |
| codeLineFormat  | The available tokens are the following in addition to codeBlockHeaderFormat. |   |
| multipleSelectionCreateMultipleCodeBlocks  | If true is specified, multiple selections will generate multiple code blocks. |   |
| multipleSelectionsBoundalyMarkerFormat  | Delimiter when "multipleSelectionCreateMultipleCodeBlocks" is set to true.  |   |
| forcePathSeparatorSlash  | Forcibly replace path separator with slash.  |   |
| forceSpaceIndent  | Force space indentation.  |   |
|   |   |   |



## codeBlockHeaderFormat / codeBlockFooterFormat / codeLineFormat tokens

| token name  | description  | example  |
|---|---|---|
| ${fullPath} | File full path. | e:\Works\vscode-copy-code-block\src\copy-code-block.ts  |
| ${workspaceFolderRelativePath}  | WorkspaceFolder relative path.  |  src\copy-code-block.ts |
| ${fileBasename}  | Filename.  | copy-code-block.ts  |
| ${fileExtname}  | File extension.  | .ts  |
| ${fileExtnameWithoutDot}  | File extension without '.'.  | ts  |
| ${fileBasenameWithoutExtension}  | Filename without extension.  | copy-code-block  |
| ${workspaceFolder}  | workspaceFolder  | e:\Works\vscode-copy-code-block  |
| ${fileDirname}  | File dir name.  | e:\Works\vscode-copy-code-block\src  |
| ${pathSeparator}  | Path separator. Affected by 'forcePathSeparatorSlash' option.  | \  |
| ${osPathSeparator}  | It is not affected by 'forcePathSeparatorSlash' option  | \  |
| ${pathParse.root}  | node.js path.parse() 'root'  | e:\  |
| ${pathParse.dir}  | node.js path.parse() 'dir'  | e:\Works\vscode-copy-code-block\src  |
| ${pathParse.base}  | node.js path.parse() 'base'  | copy-code-block.ts  |
| ${pathParse.ext}  | node.js path.parse() 'ext'  | .ts  |
| ${pathParse.name}  | node.js path.parse() 'name'  | copy-code-block  |
| ${languageId}  | Language identified by vscode. | typescript  |
| ${topLineNumber}  | The start of the selection or the line number of the cursor. | 10  |
| ${YYYY}  | Current 4-digit year.  | 2018  |
| ${MM}  | Current month. "01"-"12"  | 03  |
| ${DD}  | Current day. "01"-"31"  | 28  |
| ${HH}  | Current hour. "00"-"23"  | 00  |
| ${mm}  | Current minutes. "00"-"59"  | 45  |
| ${ss}  | Current secound. "00"-"59"  | 04  |
| ${osEOL}  | OS-dependent end of line characters. | \r\n  |
| ${EOL}  | end of line characters on vscode. | \r\n  |
| ${LF}  | LF character.  | \n  |
| ${CRLF}  | CR LF characters. | \r\n  |


## Format Examples

### Plain filename, line number and code lines
```json
    {
        "formatName": "default",
        "codeBlockHeaderFormat": "${fullPath}:${topLineNumber}${EOL}",
        "codeBlockFooterFormat": "",
        "codeLineFormat": "${LINENUMBER}: ${CODE}${EOL}",
        "multipleSelectionCreateMultipleCodeBlocks": false,
        "multipleSelectionsBoundalyMarkerFormat": "---${EOL}",
        "forcePathSeparatorSlash": false,
        "forceSpaceIndent": false
	},
```

```plaintext
	e:\Works\vscode-copy-code-block\src\copy-code-block.ts:10
	10: export const packaged_commands: { [ key: string ]: ( args: any ) => void } = {
	11: 	[ COPY_CODE_BLOCK ]: ( option: any ) => {
	12: 		copyCodeBlock( option )
	13: 	}
	14: }
```

### Markdown code block
```json
    {
        "formatName": "markdown",
        "codeBlockHeaderFormat": "${fullPath}:${topLineNumber}${EOL}```${languageId}${EOL}",
        "codeBlockFooterFormat": "```${EOL}",
        "codeLineFormat": "${CODE}${EOL}",
        "multipleSelectionCreateMultipleCodeBlocks": false,
        "multipleSelectionsBoundalyMarkerFormat": "---${EOL}",
        "forcePathSeparatorSlash": true,
        "forceSpaceIndent": true
	}
```

```plaintext
	e:/Works/vscode-copy-code-block/src/copy-code-block.ts:10
	```typescript
	export const packaged_commands: { [ key: string ]: ( args: any ) => void } = {
	    [ COPY_CODE_BLOCK ]: ( option: any ) => {
	        copyCodeBlock( option )
	    }
	}
	```
```

### HTML pre, code element.
```json
    {
        "formatName": "html",
        "codeBlockHeaderFormat": "${fullPath}(${topLineNumber})${EOL}<pre><codde>${EOL}",
        "codeBlockFooterFormat": "</code></pre>${EOL}",
        "codeLineFormat": "${CODE}${EOL}",
        "multipleSelectionCreateMultipleCodeBlocks": false,
        "multipleSelectionsBoundalyMarkerFormat": "---${EOL}",
        "forcePathSeparatorSlash": true,
        "forceSpaceIndent": true
    }
```

```html
	e:/Works/vscode-copy-code-block/src/copy-code-block.ts:10
	<pre><codde>
	export const packaged_commands: { [ key: string ]: ( args: any ) => void } = {
	    [ COPY_CODE_BLOCK ]: ( option: any ) => {
	        copyCodeBlock( option )
	    }
	}
	</code></pre>
```



