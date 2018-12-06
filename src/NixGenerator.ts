import path from 'path'
import Doer from './Doer'

const VERSION = require('../package').version

/**
 * Generates a default.nix for a `SoftwareEnvironment` instance
 */
export default class NixGenerator extends Doer {

  /**
   * Generate a default.nix file for a `SoftwareEnvironment` instance
   *
   * @param environ `SoftwareEnvironment` instance
   */
  generate (environ: any): string {
    let comments = true

    let nixfile = ''

    if (!environ) return ''

    if (comments) {
      nixfile += `# Generated by Dockter ${VERSION} at ${new Date().toISOString()}
# To stop Dockter generating this file and start editing it yourself,
# rename it to "default.nix".\n`
    }

    nixfile += `with import <nixpkgs> {};

stdenv.mkDerivation rec {
  name = "${environ.name}";
  buildInputs = [
    which
`

    for (let softwareRequirement of environ.softwareRequirements) {

      let platform = softwareRequirement.runtimePlatform
      if (platform === 'R') { nixfile += `    R\n` }

      let language = platform.toLowerCase().replace(/\.[^/.]+$/, '')

      let pkgs = softwareRequirement.softwareRequirements.map(
        (x: any) => `${language}Packages.${x.name.toLowerCase()}`
      ).join(' ')

      nixfile += `    ${pkgs}\n`
    }

    nixfile = nixfile.trim()
    nixfile += `
  ];
}`

    // Write `.default.nix` for use by Nix
    this.write('.default.nix', nixfile)

    return nixfile
  }
}