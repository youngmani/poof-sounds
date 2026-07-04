---
layout: default
permalink: /contributing
title: Contributing
---

# Contributing to **poof sounds**

Thank you for wanting to contribute to **poof sounds**! Community contributions are always welcome and help improve **poof sounds** for everyone. There are several ways you can help the project, so keep reading!

## Support the project

The best way to support **poof sounds** is to share it online and with your friends! You can also star the project on GitHub.

## Report a bug

Reporting issues with the sound pack is a great way to help improve the quality of **poof sounds**. If you notice anything wrong while playing Minecraft with the sound pack, please follow these steps to report the issue:

- Ensure you are using the [latest version](https://github.com/youngmani/poof-sounds/releases/latest) of **poof sounds**. Some releases may contain fixes for issues found in previous versions.
- If the issue still occurs in the latest version, check whether it has already been reported under [Issues](https://github.com/youngmani/poof-sounds/issues).
- If the issue has not already been reported, open a new [Bug report](https://github.com/youngmani/poof-sounds/issues/new/choose) and fill in the required information, replacing the placeholders in `[brackets]`.
- The issue will then be investigated and, if applicable, fixed in a future version of **poof sounds**.
- Optional: If you know how to fix the issue yourself, feel free to open a pull request! See [Open a pull request](#open-a-pull-request) for more information.

## Suggest new sounds or features

Suggestions for new sounds or features are always welcome! Please follow these steps to submit a suggestion:

- Ensure you are using the [latest version](https://github.com/youngmani/poof-sounds/releases/latest) of **poof sounds**. New releases often include additional sounds and features.
- Check whether your suggestion has already been submitted under [Issues](https://github.com/youngmani/poof-sounds/issues).
- If it has not, open a new [Sound request](https://github.com/youngmani/poof-sounds/issues/new/choose) and fill in the required information, replacing the placeholders in `[brackets]`. If your suggestion is not a sound request, feel free to modify the template as needed.
- Your suggestion may be added in a future version of **poof sounds**. Please note that not all suggestions will be accepted in order to maintain a high-quality sound pack.
- Optional: If you know how to add the sound yourself, feel free to open a pull request! See [Open a pull request](#open-a-pull-request) for more information.

## Open a pull request

If you're able to make a change to the sound pack yourself and are comfortable working with GitHub, open a pull request so your change can be added for others to enjoy! Please read the [Developer guidelines](#developer-guidelines) for information about making changes to the sound pack. Feel free to open a pull request even if your work is incomplete (for example, if Bedrock Edition support is still missing). A contributor can help you finish the remaining work.

## Developer guidelines

### Making a change to the resource pack

The **poof sounds** repository follows the folder structure of a Java Edition resource pack.

Sound files should be go under the `assets/poof-sounds/sounds/` folder in the appropriate subfolder, depending on how many audio channels the sound has. (Most directional sounds are mono, while global sounds are usually stereo.) Sound files are then mapped to in-game events in `assets/minecraft/sounds.json`.

### Add Bedrock Edition support

Although **poof sounds** is structured as a Java Edition resource pack, it is also converted into a Bedrock Edition resource pack during the build process using custom build scripts. `build_scripts/resources/soundsMap.js` contains mappings from Java Edition sound definitions their Bedrock Edition equivalents. The `bedrock/` folder contains additional files used only for the Bedrock version, and `build_scripts/bedrockBuild.js` performs the conversion from the Java Edition files into a Bedrock Edition resource pack. Note that this conversion process is specific to **poof sounds** and cannot be used to convert any Java Edition resource pack to Bedrock Edition.

### Validate and build the resource pack

**poof sounds** uses build scripts to validate the files in the resource pack and create optimized resource packs for both Java and Bedrock Editions. These scripts are run using Node.js. With the correct version of Node installed (as specified in `.nvmrc`), run `npm ci` to install the required dependencies, then run `npm run build` to build the resource pack. Once the build is complete, the Java and Bedrock Edition resource packs can be found in the `build/` folder and are ready for testing.

### Helpful resources

To find out which sound events Minecraft supports and how to override them:

- https://minecraft.wiki
  - https://minecraft.wiki/w/Resource_pack
  - https://minecraft.wiki/w/Sounds.json
  - Extract vanilla sounds from Java Edition: https://minecraft.wiki/w/Tutorial:Sound_directory
- Bedrock Edition vanilla resource pack: https://github.com/Mojang/bedrock-samples (`sounds.json` and `sound_definitions.json`)

To work with audio files:

- Convert video to audio or convert stereo to mono: https://www.ffmpeg.org/
- Adjust sound volume or combine sounds: https://www.audacityteam.org/
