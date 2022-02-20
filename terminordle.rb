# typed: false
require "language/node"

# homebrew
class Terminordle < Formula
  desc "Multiplayer wordle in the terminal"
  homepage "https://github.com/HP4k1h5/terminordle/"
  url "https://registry.npmjs.org/@hp4k1h5/terminordle/-/terminordle-0.1.6.tgz"
  sha256 "03cfa4ba4b2a03467f495f3af43f21ace8e6cf490005aadf94c5512349d131fd"
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
