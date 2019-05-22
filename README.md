
# vscode-LLL    
   
![img](./images/icon.png)

Ethereum LLL language support for Visual Studio Code  


LLL is the new-old solidity :D


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

* It is assumed that LLLC is installed and generally available on the system. In case LLLC is not available in path or called in a virtualenv configure the LLLC command in `Settings` → `LLL` → `Command`. Please follow [this simple guide](https://media.consensys.net/installing-ethereum-compilers-61d701e78f6) on how to build and install the LLL compiler.

## Extension Settings

TBD

## Tour

TBD


## Release Notes

see [CHANGELOG](./CHANGELOG.md)

## 0.0.1
- Initial release heavily based on vscode-vyper
- Language support for syntax highlighting based on `vscode/extensions/python`
- LLL compilation support and diagnostics
- LLL compilation diagnostics
- Hover provider

-----------------------------------------------------------------------------------------------------------
