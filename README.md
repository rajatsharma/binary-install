# Binary Install

_Install .tar.gz binary applications via npm_

Ruthlessly copied from [cloudflare/binary-install](https://github.com/cloudflare/binary-install) and removed functionality of saving binary to `bin` directory to support jlink binaries. And translated to Typescript.

#### For more info:

- [jdk bin/bin bug](https://bugs.openjdk.java.net/browse/JDK-8219962)

## Usage

This library provides a single class `Binary` that takes a download url and some optional arguments. You **must** provide either `name` or `installDirectory` when creating your `Binary`.

| option           | decription                                    |
| ---------------- | --------------------------------------------- |
| name             | The name of your binary                       |
| installDirectory | A path to the directory to install the binary |

If an `installDirectory` is not provided, the binary will be installed at your OS specific config directory. On MacOS it defaults to `~/Library/Preferences/${name}-nodejs`

After your `Binary` has been created, you can run `.install()` to install the binary, and `.run()` to run it.

### Example

This is meant to be used as a library - create your `Binary` with your desired options, then call `.install()` in the `postinstall` of your `package.json`, `.run()` in the `bin` section of your `package.json`, and `.uninstall()` in the `preuninstall` section of your `package.json`. See [this example project](https://github.com/cloudflare/binary-install/tree/master/packages/binary-install-example) to see how to create an npm package that installs and runs a binary using the Github releases API.
