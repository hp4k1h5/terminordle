# typed: false
require "language/node"

# homebrew
class Terminordle < Formula
  desc "Multiplayer wordle in the terminal"
  homepage "https://github.com/HP4k1h5/terminordle/"
  url "https://registry.npmjs.org/@hp4k1h5/terminordle/-/terminordle-0.1.4.tgz"
  sha256 "d402ec509691f82ab178b80d184a4b80248a4e8239967eb6bcfbde18977efcf7"
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
