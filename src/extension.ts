'use strict'

import * as vscode from 'vscode'
import { packaged_commands } from './copy-code-block'

export function activate(context: vscode.ExtensionContext) {

    Object.keys( packaged_commands ).forEach( ( key ) => {
        const command = packaged_commands[ key ]
        context.subscriptions.push( vscode.commands.registerCommand( key, ( option: any ) => { command( option ) } ) )
    } )
}

// this method is called when your extension is deactivated
export function deactivate() {
}