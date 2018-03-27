'use strict'

import * as vscode from 'vscode'
import * as path from 'path'
import { EOL } from 'os'
import { copy } from 'copy-paste'

const COPY_CODE_BLOCK = 'extension.copyCodeBlock'

export const packaged_commands: { [ key: string ]: ( args: any ) => void } = {
	[ COPY_CODE_BLOCK ]: ( option: any ) => {
		copyCodeBlock( option )
	}
}

type ReplaceRule = { re: RegExp, str: string }
type ReplaceRuleMap = Map<string, ReplaceRule>

function copyCodeBlock( option?: any ) {
	const editor = vscode.window.activeTextEditor
	if ( !editor ) {
		vscode.window.showInformationMessage( 'No editor is active' )
		return
	}
	// console.log( 'copy-code-block.ts copyCodeBlock()!' )

	// formats は設定の配列。複数設定からマッチするものを選ぶ
	const copyCodeFormats = vscode.workspace.getConfiguration( 'copyCodeBlock' ).get<Array<vscode.WorkspaceConfiguration>>( 'formats' )

	let format: any = null

	if ( copyCodeFormats ) {
		// 指定の文字列にマッチすればその設定、ない場合は "default" が使われる
		for ( const f of copyCodeFormats ) {
			if ( f[ 'formatName' ] === option.formatName ) {
				format = f
				break
			}
			if ( f[ 'formatName' ] === "default" ) {
				format = f
			}
		}
	}

	// コードブロックのプレフィクス行、ポストフィクス行、コード行のフォーマットを読み込む
	let codeBlockHeaderFormat: string = ""
	let codeBlockFooterFormat: string = ""
	let codeLineFormat: string = ""
	let multipleSelectionCreateMultipleCodeBlocks: boolean = false
	let multipleSelectionsBoundalyMarkerFormat: string = ""
	let forcePathSeparatorSlash: boolean = false
	let forceSpaceIndent: boolean = false

	if ( format !== null ) {
		if ( format[ "codeBlockHeaderFormat" ] !== undefined ) {
			codeBlockHeaderFormat = format[ "codeBlockHeaderFormat" ]
		}
		if ( format[ "codeBlockFooterFormat" ] !== undefined ) {
			codeBlockFooterFormat = format[ "codeBlockFooterFormat" ]
		}
		if ( format[ "codeLineFormat" ] !== undefined ) {
			codeLineFormat = format[ "codeLineFormat" ]
		}
		if ( format[ "multipleSelectionCreateMultipleCodeBlocks" ] !== undefined ) {
			multipleSelectionCreateMultipleCodeBlocks = format[ "multipleSelectionCreateMultipleCodeBlocks" ]
		}
		if ( format[ "multipleSelectionsBoundalyMarkerFormat" ] !== undefined ) {
			multipleSelectionsBoundalyMarkerFormat = format[ "multipleSelectionsBoundalyMarkerFormat" ]
		}
		if ( format[ "forcePathSeparatorSlash" ] !== undefined ) {
			forcePathSeparatorSlash = format[ "forcePathSeparatorSlash" ]
		}
		if ( format[ "forceSpaceIndent" ] !== undefined ) {
			forceSpaceIndent = format[ "forceSpaceIndent" ]
		}
	}

	// 置き換え対象文字列群
	const document = editor.document
	let fullPath = document.fileName
	let workspaceFolderRelativePath = vscode.workspace.workspaceFolders ?
		path.relative( vscode.workspace.workspaceFolders[ 0 ].uri.fsPath, fullPath ) : fullPath
	const fileBasename = path.basename( fullPath )
	const fileExtname = path.extname( fullPath )
	const fileBasenameWithoutExtension = path.basename( fullPath, fileExtname )
	let workspaceFolder = vscode.workspace.workspaceFolders ?
		vscode.workspace.workspaceFolders[ 0 ].uri.fsPath : ""
	let fileDirname = path.dirname( fullPath )
	let pathSeparator = path.sep
	const osPathSeparator = path.sep
	let pathParse = path.parse( fullPath )
	const languageId = document.languageId
	const d = new Date()
	const YYYY = d.getFullYear().toString()
	const MM = ( "0" + ( d.getMonth() + 1 ) ).slice( -2 )
	const DD = ( "0" + d.getDate() ).slice( -2 )
	const HH = ( "0" + d.getHours() ).slice( -2 )
	const mm = ( "0" + d.getMinutes() ).slice( -2 )
	const ss = ( "0" + d.getSeconds() ).slice( -2 )
	const editorEOL = document.eol === vscode.EndOfLine.CRLF ? "\r\n" : "\n"
	if ( forcePathSeparatorSlash ) {
		fullPath = fullPath.replace( /\\/g, "/" )
		workspaceFolderRelativePath = workspaceFolderRelativePath.replace( /\\/g, "/" )
		workspaceFolder = workspaceFolder.replace( /\\/g, "/" )
		fileDirname = fileDirname.replace( /\\/g, "/" )
		pathParse.root = pathParse.root.replace( /\\/g, "/" )
		pathParse.dir = pathParse.dir.replace( /\\/g, "/" )
		pathParse.base = pathParse.base.replace( /\\/g, "/" )
		pathParse.ext = pathParse.ext.replace( /\\/g, "/" )
		pathParse.name = pathParse.name.replace( /\\/g, "/" )
		pathSeparator = "/"
	}



	// 選択部分は複数あり得る
	const selections = [ ...editor.selections ].sort( ( a, b ) => a.start.line - b.start.line )
	const lastSelection = selections[ selections.length - 1 ]
	const largestLineNumber = lastSelection.end.line + 1
	const largestLineNumberLength = largestLineNumber.toString().length

	let placeHolderMap = new Map<string, ReplaceRule>(
		[
			[ "fullPath", { re: /\$\{fullPath\}/g, str: fullPath } ],
			[ "workspaceFolderRelativePath", { re: /\$\{workspaceFolderRelativePath\}/g, str: workspaceFolderRelativePath } ],
			[ "fileBasename", { re: /\$\{fileBasename\}/g, str: fileBasename } ],
			[ "fileExtname", { re: /\$\{fileExtname\}/g, str: fileExtname } ],
			[ "fileExtnameWithoutDot", { re: /\$\{fileExtnameWithoutDot\}/g, str: fileExtname.replace( /\./g, "" ) } ],
			[ "fileBasenameWithoutExtension", { re: /\$\{fileBasenameWithoutExtension\}/g, str: fileBasenameWithoutExtension } ],
			[ "workspaceFolder", { re: /\$\{workspaceFolder\}/g, str: workspaceFolder } ],
			[ "fileDirname", { re: /\$\{fileDirname\}/g, str: fileDirname } ],
			[ "pathSeparator", { re: /\$\{pathSeparator\}/g, str: pathSeparator } ],
			[ "osPathSeparator", { re: /\$\{osPathSeparator\}/g, str: osPathSeparator } ],
			[ "pathParse.root", { re: /\$\{pathParse\.root\}/g, str: pathParse.root } ],
			[ "pathParse.dir", { re: /\$\{pathParse\.dir\}/g, str: pathParse.dir } ],
			[ "pathParse.base", { re: /\$\{pathParse\.base\}/g, str: pathParse.base } ],
			[ "pathParse.ext", { re: /\$\{pathParse\.ext\}/g, str: pathParse.ext } ],
			[ "pathParse.name", { re: /\$\{pathParse\.name\}/g, str: pathParse.name } ],
			[ "languageId", { re: /\$\{languageId\}/g, str: languageId } ],
			[ "topLineNumber", { re: /\$\{topLineNumber\}/g, str: "1" } ],
			[ "YYYY", { re: /\$\{YYYY\}/g, str: YYYY } ],
			[ "MM", { re: /\$\{MM\}/g, str: MM } ],
			[ "DD", { re: /\$\{DD\}/g, str: DD } ],
			[ "HH", { re: /\$\{HH\}/g, str: HH } ],
			[ "mm", { re: /\$\{mm\}/g, str: mm } ],
			[ "ss", { re: /\$\{ss\}/g, str: ss } ],
			[ "osEOL", { re: /\$\{osEOL\}/g, str: EOL } ],
			[ "EOL", { re: /\$\{EOL\}/g, str: editorEOL } ],
			[ "LF", { re: /\$\{LF\}/g, str: "\n" } ],
			[ "CRLF", { re: /\$\{CRLF\}/g, str: "\r\n" } ],
		],
	)

	let codeLine = ""
	let copyText = ""
	let tabSize:number = 4
	if ( forceSpaceIndent && ( typeof editor.options.tabSize === "number" ) ) {
		// 強制スペースインデントのためのタブ幅
		tabSize = editor.options.tabSize
	}

	selections.forEach( ( selection, i ) => {
		if ( multipleSelectionCreateMultipleCodeBlocks || i === 0 ) {
			const topLineNumber = selection.start.line + 1
			placeHolderMap.set( "topLineNumber", { re: /\$\{topLineNumber\}/g, str: topLineNumber.toString() } )
			let codeBlockHeader = replacePlaceHolderMap( codeBlockHeaderFormat, placeHolderMap )
			codeLine = replacePlaceHolderMap( codeLineFormat, placeHolderMap )
			copyText += codeBlockHeader
		} else {
			let multipleSelectionsBoundalyMarker = replacePlaceHolderMap( multipleSelectionsBoundalyMarkerFormat, placeHolderMap )
			copyText += multipleSelectionsBoundalyMarker
		}

		for ( let n = selection.start.line; n <= selection.end.line; n += 1 ) {
			const number = leftPad( String( n + 1 ), largestLineNumberLength, ' ' )
			let line = document.lineAt( n ).text
			if ( forceSpaceIndent ) {
				//	強制的に先頭のインデントタブを空白に置き換える。置き換え幅はエディタの設定に従う
				line = line.replace( /^(\t+)/, function ( match: string, p1: string, offset: number, str: string ) {
					return ' '.repeat( p1.length * tabSize )
				} )
			}

			let c = codeLine.replace( "${LINENUMBER}", number )
			c = c.replace( "${CODE}", line )
			copyText += c
		}
		if ( multipleSelectionCreateMultipleCodeBlocks || i === selections.length - 1 ) {
			let codeBlockFooter = replacePlaceHolderMap( codeBlockFooterFormat, placeHolderMap )
			copyText += codeBlockFooter
		}
	} )

	copy( copyText )
}

/**
 * 右詰左パディング
 */
function leftPad( str: string, len: number, ch: string = ' ' ) {
	if ( ch.length === 0 ) {
		ch = ' '
	}
	if ( len - str.length > 0 ) {
		return ch.repeat( len - str.length ) + str
	} else {
		return str
	}
}

/**
 * 入力文字列中のマーカー正規表現を指定の文字列に置き換える
 * @param str 置き換え元文字列
 * @param placeHolderMap 置き換えルール
 */
function replacePlaceHolderMap( str: string, placeHolderMap: ReplaceRuleMap ) {
	for ( const [ , rule ] of placeHolderMap ) {
		str = str.replace( rule.re, rule.str )
	}
	return str
}