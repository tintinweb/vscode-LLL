![img](./images/icon.png)

[<img height="30" alt="vscode marketplace" src="https://github.com/user-attachments/assets/030dde14-1745-4f4e-852c-b415db9c2050">](https://marketplace.visualstudio.com/items?itemName=tintinweb.vscode-lll) [<img height="30" alt="open-vsx" src="https://github.com/user-attachments/assets/975d31ca-5259-4bf0-8c40-b2e25cdd5ccb">](https://open-vsx.org/extension/tintinweb/vscode-lll) 



# vscode-LLL    

Ethereum LLL language support for Visual Studio Code  

![image](https://user-images.githubusercontent.com/2865694/58585492-2a023a00-8259-11e9-9a10-7c80a6848a9c.png)


*LLL is the new-old solidity :D*


## Features

#### Passive Features

* LLL syntax highlighting support

#### Active Features

Note: Active features can be disabled by setting `Settings` → `LLL` → `Mode: Active` to `false`.

* Provides Hover information (`Settings` → `LLL` → `Hover: Enable`)
* Integrates with the LLL compiler
  * automatically compile contracts on save (`Settings` → `LLL` → `Compile: On Save`)
  * compilation can be triggered by executing a vscode command (`cmd + shift + p` → `LLL: Compile`)
  * LLLC location/command can be customized (default assumes `lllc` is in `PATH`) (`Settings` → `LLL` → `Command`)
* Integrates with [MythX](https://www.mythx.io/#faq)
  * [sign-up](https://www.mythx.io/#faq) with your ethereum address (username)
  * set your username and password (`Settings` → `LLL` → `MythX: Ethaddress` / `Settings` → `LLL` → `MythX: Password` or `env.MYTHX_ETH_ADDRESS` / `env.MYTHX_PASSWORD`; configuration takes precedence)
  * automatically analyze for security issues when saving the file (`Settings` → `LLL` → `Analysis: On Save`)
  
## Requirements

* It is assumed that LLLC is installed and generally available on the system. In case LLLC is not available in path configure the LLLC command in `Settings` → `LLL` → `Command`. Please follow [this simple guide](https://media.consensys.net/installing-ethereum-compilers-61d701e78f6) on how to build and install the LLL compiler.


## Release Notes

see [CHANGELOG](./CHANGELOG.md)

## 0.0.5
- updated mythx library: switched from `armlet` to `mythxjs`.
- fix: make settings take effect immediately.

## 0.0.4
- fix mythx analysis error
- fix misused promises

## 0.0.2 - 0.0.3
- fixed diagnostic handling
- auto compile when opening new file

## 0.0.1
- Initial release heavily based on vscode-vyper
- Language support for syntax highlighting based on `vscode/extensions/python`
- LLL compilation support and diagnostics
- LLL compilation diagnostics
- Hover provider

-----------------------------------------------------------------------------------------------------------
