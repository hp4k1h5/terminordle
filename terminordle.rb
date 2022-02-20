# typed: false
require "language/node"

# homebrew
class Terminordle < Formula
  desc "Multiplayer wordle in the terminal"
  homepage "https://github.com/HP4k1h5/terminordle/"
  url "https://registry.npmjs.org/@hp4k1h5/terminordle/-/terminordle-0.1.7.tgz"
  sha256 "23934ef46360a4d4a1a873bd297a3c6701fc18ee2bae4f16f8aa390007b67c0f"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    system "true"
  end
end
